import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from './prisma';

type SubscriptionDetails = {
  hasAccess: boolean;
  remainingCredits: number;
  totalCredits: number;
  planName?: string;
  isTrial: boolean;
  isValid: boolean;
  expiresAt?: Date;
};

type CreditType = 'TRIAL' | 'SUBSCRIPTION_GRANT' | 'PURCHASE' | 'BONUS' | 'USAGE' | 'REFUND';

interface Credit {
  id: string;
  userId: string;
  amount: number;
  used: number;
  type: CreditType;
  description: string | null;
  expiresAt: Date | null;
  isActive: boolean;
  subscriptionId: string | null;
  processId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UsageStats {
  totalCreditsUsed: number;
  totalGenerations: number;
  subscription: {
    planName: string;
    status: string;
    periodEnd?: Date;
    creditsIncluded: number;
  } | null;
  credits: {
    total: number;
    used: number;
    remaining: number;
  };
}

export async function checkSubscription(userId: string): Promise<SubscriptionDetails> {
  try {
    // Get user's active subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: { 
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: { gte: new Date() }
      },
      include: { plan: true }
    });

    // Get user's active credits (not expired and not used up)
    const now = new Date();
    const credits = await prisma.credit.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } }
        ]
      },
      orderBy: [
        // Prioritize credits that expire soonest and then trial credits
        { expiresAt: 'asc' }, 
        { type: 'asc' }
      ]
    });

    // Calculate total and remaining credits across ALL active credit entries
    const totalCredits = credits.reduce((sum: number, credit: Credit) => sum + credit.amount, 0);
    const remainingCredits = credits.reduce((sum: number, credit: Credit) => sum + (credit.amount - credit.used), 0);
    const hasTrialCredits = credits.some((credit: Credit) => credit.type === 'TRIAL' && (credit.amount - credit.used) > 0);

    if (subscription) {
      return {
        hasAccess: true,
        // The remainingCredits and totalCredits should reflect the sum of ALL credits the user has, 
        // including those from the subscription, purchases, and any remaining trial/bonus.
        remainingCredits,
        totalCredits, // Use the calculated total, not just the plan's base credits
        planName: subscription.plan.displayName,
        isTrial: false,
        isValid: true,
        expiresAt: subscription.currentPeriodEnd || undefined
      };
    }

    if (hasTrialCredits) {
      const trialCredit = credits.find((c: Credit) => c.type === 'TRIAL' && (c.amount - c.used) > 0);
      return {
        hasAccess: true,
        remainingCredits,
        totalCredits: trialCredit?.amount || 0, // Only show trial amount as total if no subscription
        planName: 'Trial',
        isTrial: true,
        isValid: true,
        expiresAt: trialCredit?.expiresAt || undefined
      };
    }

    // No active subscription or credits
    return {
      hasAccess: false,
      remainingCredits: 0,
      totalCredits: 0,
      isTrial: false,
      isValid: false
    };

  } catch (error) {
    console.error('Error checking subscription:', error);
    // FIX: Only one return for the catch block
    return {
      hasAccess: false,
      remainingCredits: 0,
      totalCredits: 0,
      isTrial: false,
      isValid: false
    };
  }
}

export async function useCredit(userId: string, action: string = 'GENERATION', amount: number = 1): Promise<{ success: boolean; remainingCredits: number; message?: string }> {
  return await prisma.$transaction(async (tx) => {
    // Get user's active credits (not expired and not used up)
    const now = new Date();
    const credits = await tx.credit.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } }
        ]
      },
      orderBy: [
        { expiresAt: 'asc' }, // Use credits that expire soonest first
        { type: 'asc' } // Use trial credits before subscription credits
      ]
    });

    // Calculate total available credits
    const availableCredits = credits.reduce((sum, credit) => sum + (credit.amount - credit.used), 0);
    
    if (availableCredits < amount) {
      return { 
        success: false, 
        remainingCredits: availableCredits,
        message: 'Insufficient credits'
      };
    }

    // Use credits starting from the first one
    let remainingAmount = amount;
    
    for (const credit of credits) {
      const availableInThisCredit = credit.amount - credit.used;
      const toUse = Math.min(remainingAmount, availableInThisCredit);
      
      if (toUse > 0) {
        await tx.credit.update({
          where: { id: credit.id },
          data: { 
            used: { increment: toUse },
            updatedAt: new Date()
          }
        });

        // Record the usage
        await tx.usageRecord.create({
          data: {
            userId,
            action,
            creditsUsed: toUse,
            creditId: credit.id,
            isTrial: credit.type === 'TRIAL',
            metadata: {}
          }
        });

        remainingAmount -= toUse;
        if (remainingAmount <= 0) break;
      }
    }

    return { 
      success: true, 
      remainingCredits: availableCredits - amount
    };
  });
}

export async function addCredits(
  userId: string, 
  type: CreditType, 
  amount: number, 
  options: {
    description?: string;
    expiresAt?: Date;
    subscriptionId?: string;
    processId?: string;
  } = {}
): Promise<Credit> {
  return await prisma.credit.create({
    data: {
      userId,
      type,
      amount,
      used: 0,
      description: options.description || null,
      expiresAt: options.expiresAt || null,
      isActive: true,
      subscriptionId: options.subscriptionId || null,
      processId: options.processId || null
    }
  });
}

export async function getUsageStats(userId: string): Promise<UsageStats> {
  const [credits, usage, subscription] = await Promise.all([
    // Get all active credits
    prisma.credit.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      }
    }),
    
    // Get usage statistics
    prisma.usageRecord.aggregate({
      where: { userId },
      _sum: { creditsUsed: true },
      _count: { _all: true }
    }),
    
    // Get active subscription if any
    prisma.userSubscription.findFirst({
      where: { 
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: { gte: new Date() }
      },
      include: { plan: true }
    })
  ]);

  // Calculate total credits
  const totalCredits = credits.reduce((sum, credit) => sum + credit.amount, 0);
  const usedCredits = credits.reduce((sum, credit) => sum + credit.used, 0);
  const remainingCredits = totalCredits - usedCredits;

  return {
    totalCreditsUsed: usage._sum.creditsUsed || 0,
    totalGenerations: usage._count._all || 0,
    subscription: subscription ? {
      planName: subscription.plan.displayName,
      status: subscription.status,
      periodEnd: subscription.currentPeriodEnd || undefined,
      creditsIncluded: subscription.plan.creditsIncluded
    } : null,
    credits: {
      total: totalCredits,
      used: usedCredits,
      remaining: remainingCredits
    }
  };
}