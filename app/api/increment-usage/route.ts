import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    // Get current generation count
    const currentCount = (user.privateMetadata?.generationsUsed as number) || 0;
    const newCount = currentCount + 1;

    // Update user metadata
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        generationsUsed: newCount,
      },
    });

    return NextResponse.json({
      success: true,
      generationsUsed: newCount,
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return NextResponse.json(
      { error: 'Failed to update usage count' },
      { status: 500 }
    );
  }
}
