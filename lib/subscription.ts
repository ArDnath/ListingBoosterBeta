import { auth, currentUser } from '@clerk/nextjs/server';
import { Prisma } from '../app/generated/prisma';
import prisma from './prisma';

// --- Subscription Details Type ---
export interface SubscriptionDetails {
  hasAccess: boolean;
  remainingCredits: number;
  totalCredits: number;
  planName?: string;
  isTrial: boolean;
  isValid: boolean;
  expiresAt?: Date;
}

// --- Credit Type Enum as Union ---
export type CreditType =
  | 'TRIAL'
  | 'SUBSCRIPTION_GRANT'
  | 'PURCHASE'
  | 'BONUS'
  | 'USAGE'
  | 'REFUND';

// --- Credit Interface ---
export interface Credit {
  id: string;
  userId: string;
  amount: number;               // Total credits granted by this entry
  used: number;                 // Credits used from this entry
  type: CreditType;             // How credits were granted/purposed
  description?: string | null;  // Optional description or note
  expiresAt?: Date | null;      // Expiry date (null means "never expires")
  isActive: boolean;            // Whether the credit entry is currently valid
  subscriptionId?: string | null; // Link to subscription if applicable
  processId?: string | null;      // External reference (bonus, payment processor, etc)
  createdAt: Date;
  updatedAt: Date;
}

// --- Usage Stats Type ---
export interface UsageStats {
  totalCreditsUsed: number; // All credits used by the user
  totalGenerations: number; // All credit-consuming actions
  subscription: {
    planName: string;
    status: string;
    periodEnd?: Date;
    creditsIncluded: number;
  } | null;                 // Current subscription (null if none)
  credits: {
    total: number;
    used: number;
    remaining: number;
  };                        // Summary across all credits
}


// --- Logic Functions ---

// Check a user's subscription and credit status
export async function checkSubscription(userId: string): Promise<SubscriptionDetails> {
  try {
    const now = new Date();

    // Find an active subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: { 
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: { gte: now }
      },
      include: { plan: true }
    });

    // Find all active, not expired credits
    const credits: Credit[] = await prisma.credit.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } }
        ]
      },
      orderBy: [
        { expiresAt: 'asc' }, 
        { type: 'asc' }
      ]
    });

    // Credit calculations
    const totalCredits = credits.reduce((sum, credit) => sum + credit.amount, 0);
    const remainingCredits = credits.reduce((sum, credit) => sum + Math.max(credit.amount - credit.used, 0), 0);
    const hasTrialCredits = credits.some(
      (credit) => credit.type === 'TRIAL' && (credit.amount - credit.used) > 0
    );

    if (subscription) {
      return {
        hasAccess: true,
        remainingCredits,
        totalCredits,
        planName: subscription.plan.displayName,
        isTrial: false,
        isValid: true,
        expiresAt: subscription.currentPeriodEnd || undefined,
      };
    }

    if (hasTrialCredits) {
      const trialCredit = credits.find(
        (c) => c.type === 'TRIAL' && (c.amount - c.used) > 0
      );
      return {
        hasAccess: true,
        remainingCredits,
        totalCredits: trialCredit?.amount || 0,
        planName: 'Trial',
        isTrial: true,
        isValid: true,
        expiresAt: trialCredit?.expiresAt || undefined,
      };
    }

    // No active subscription or credits
    return {
      hasAccess: false,
      remainingCredits: 0,
      totalCredits: 0,
      isTrial: false,
      isValid: false,
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      hasAccess: false,
      remainingCredits: 0,
      totalCredits: 0,
      isTrial: false,
      isValid: false,
    };
  }
}

// Use credits for a given action (like GENERATION); decrements appropriately according to expiry/type ordering
export async function useCredit(
  userId: string,
  action: string = 'GENERATION',
  amount: number = 1
): Promise<{ success: boolean; remainingCredits: number; message?: string }> {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const now = new Date();
    const credits: Credit[] = await tx.credit.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } }
        ]
      },
      orderBy: [
        { expiresAt: 'asc' },
        { type: 'asc' }
      ]
    });

    // Calculate total available credits
    const availableCredits = credits.reduce(
      (sum, credit) => sum + Math.max(credit.amount - credit.used, 0),
      0
    );
    if (availableCredits < amount) {
      return {
        success: false,
        remainingCredits: availableCredits,
        message: 'Insufficient credits'
      };
    }

    let remainingAmount = amount;
    for (const credit of credits) {
      const availableInThisCredit = Math.max(credit.amount - credit.used, 0);
      const toUse = Math.min(remainingAmount, availableInThisCredit);

      if (toUse > 0) {
        await tx.credit.update({
          where: { id: credit.id },
          data: {
            used: { increment: toUse },
            updatedAt: new Date()
          }
        });

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

// Add credits of any type to a user (used for onboarding, purchases, bonuses, etc)
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
      processId: options.processId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
}

// Aggregate usage statistics for a user
export async function getUsageStats(userId: string): Promise<UsageStats> {
  const [credits, usageAgg, subscription] = await Promise.all([
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
    prisma.usageRecord.aggregate({
      where: { userId },
      _sum: { creditsUsed: true },
      _count: { _all: true }
    }),
    prisma.userSubscription.findFirst({
      where: { 
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: { gte: new Date() }
      },
      include: { plan: true }
    })
  ]);

  // Compute detailed credit info
  const totalCredits = credits.reduce((sum: number, credit: Credit) => sum + credit.amount, 0);
  const usedCredits = credits.reduce((sum: number, credit: Credit) => sum + credit.used, 0);
  const remainingCredits = totalCredits - usedCredits;

  return {
    totalCreditsUsed: usageAgg._sum.creditsUsed ?? 0,
    totalGenerations: usageAgg._count._all ?? 0,
    subscription: subscription
      ? {
          planName: subscription.plan.displayName,
          status: subscription.status,
          periodEnd: subscription.currentPeriodEnd || undefined,
          creditsIncluded: subscription.plan.creditsIncluded,
        }
      : null,
    credits: {
      total: totalCredits,
      used: usedCredits,
      remaining: remainingCredits,
    },
  };
}
