import { auth, currentUser } from '@clerk/nextjs/server';

export async function checkSubscription(): Promise<boolean> {
  const user = await currentUser();
  
  if (!user) {
    return false;
  }

  // Check if user has active subscription in public metadata
  const subscriptionStatus = user.publicMetadata?.subscriptionStatus as string;
  const subscriptionEndDate = user.publicMetadata?.subscriptionEndDate as number;

  if (subscriptionStatus === 'active') {
    // Check if subscription hasn't expired
    if (subscriptionEndDate && subscriptionEndDate > Date.now()) {
      return true;
    }
  }

  return false;
}

export async function getUserGenerationsCount(): Promise<number> {
  const user = await currentUser();
  
  if (!user) {
    return 0;
  }

  // Get generations count from private metadata
  const generationsCount = user.privateMetadata?.generationsCount as number;
  return generationsCount || 0;
}

export async function incrementGenerationsCount(): Promise<number> {
  // This will be updated via API route
  return 0;
}
