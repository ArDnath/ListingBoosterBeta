// app/api/check-subscription/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import  prisma  from '@/lib/prisma';
import { checkSubscription } from '@/lib/subscription';

export async function GET() {
  try {
  const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        isSubscribed: false,
        generationsUsed: 0 
      });
    }

    // Check subscription status
    const subscription = await checkSubscription(userId);

    // Get usage stats
    const usage = await prisma.usageRecord.count({
      where: { userId, action: 'GENERATE_DESCRIPTION' }
    });

    return NextResponse.json({
      isSubscribed: subscription.hasAccess,
      generationsUsed: usage,
      plan: subscription.planName || 'free',
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}