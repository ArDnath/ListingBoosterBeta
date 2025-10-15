import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        isSubscribed: false,
        generationsUsed: 0 
      });
    }

    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ 
        isSubscribed: false,
        generationsUsed: 0 
      });
    }

    // Check subscription from Clerk public metadata (set via Clerk Dashboard)
    // You can set this manually or via Clerk's subscription features
    const isSubscribed = user.publicMetadata?.subscribed === true || 
                        user.publicMetadata?.plan === 'pro';
    
    const generationsUsed = (user.privateMetadata?.generationsUsed as number) || 0;

    return NextResponse.json({
      isSubscribed,
      generationsUsed,
      plan: user.publicMetadata?.plan || 'free',
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
