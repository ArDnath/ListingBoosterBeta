# Clerk Billing Integration

This application uses Clerk's native billing features to manage subscriptions directly through the Clerk Dashboard.

## How It Works

### User Metadata Structure

**Public Metadata** (visible to client):
- `subscribed`: boolean - Whether user has active subscription
- `plan`: 'free' | 'pro' - User's current plan

**Private Metadata** (server-only):
- `generationsUsed`: number - Count of AI generations used

### Free vs Pro Plans

**Free Plan:**
- 5 AI description generations
- Background removal (limited by remove.bg API)
- Usage tracked in Clerk metadata

**Pro Plan ($9.99/month):**
- Unlimited AI descriptions
- Priority support
- Pro badge displayed

## Setup in Clerk Dashboard

### 1. Enable User Profile

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **User & Authentication → User Profile**
4. Enable the User Profile component
5. Make sure the profile is accessible at `/user-profile`

### 2. Configure Metadata

You can manage subscriptions in two ways:

#### Option A: Manual (for testing)

1. Go to **Users** in Clerk Dashboard
2. Select a user
3. Click **Metadata**
4. Add to **Public Metadata**:
   ```json
   {
     "subscribed": true,
     "plan": "pro"
   }
   ```

#### Option B: Automated (recommended for production)

Use Clerk's Organizations or a third-party payment system integrated with Clerk:

1. **With Clerk Organizations:**
   - Create organizations for paid users
   - Check organization membership to determine subscription status

2. **With External Billing (e.g., Paddle, Lemon Squeezy):**
   - Use webhook to update Clerk metadata when payment succeeds
   - Update user's `publicMetadata` via Clerk API

### 3. Set Up User Profile Page

Create a route for the user profile (if not already exists):

**File:** `app/user-profile/[[...user-profile]]/page.tsx`

```tsx
import { UserProfile } from '@clerk/nextjs';

export default function UserProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <UserProfile 
        path="/user-profile" 
        routing="path"
      />
    </div>
  );
}
```

### 4. Add Subscription Management UI (Optional)

You can add custom pages to Clerk's UserProfile component:

```tsx
<UserProfile>
  <UserProfile.Page
    label="Subscription"
    url="subscription"
    labelIcon={<CreditCard />}
  >
    <div>
      {/* Your custom subscription management UI */}
      <h2>Manage Subscription</h2>
      <p>Current Plan: Pro</p>
      <button>Cancel Subscription</button>
    </div>
  </UserProfile.Page>
</UserProfile>
```

## API Routes

### `/api/check-subscription` (GET)
Checks user's subscription status from Clerk metadata.

Returns:
```json
{
  "isSubscribed": true,
  "generationsUsed": 3,
  "plan": "pro"
}
```

### `/api/increment-usage` (POST)
Increments AI generation count for free users.

Returns:
```json
{
  "success": true,
  "generationsUsed": 4
}
```

## Integrating External Payment Providers

If you want to accept payments, integrate with payment providers that work well with Clerk:

### Recommended: Paddle or Lemon Squeezy

Both provide simple integration without webhook complexity:

1. **User clicks "Upgrade"** → Opens payment provider checkout
2. **Payment succeeds** → Webhook fires
3. **Your webhook handler** → Updates Clerk metadata via API:

```typescript
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  // Verify webhook signature
  // ...
  
  const { userId, plan } = await req.json();
  const client = await clerkClient();
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      subscribed: true,
      plan: 'pro',
    },
  });
  
  return new Response('OK');
}
```

## Testing the Flow

### Free User Experience:
1. User signs in with Clerk
2. Generate descriptions (5 free)
3. After 5 generations → Paywall appears
4. Click "Upgrade Now" → Opens user profile
5. Manually set user as subscribed in Clerk Dashboard (for testing)
6. Refresh page → Unlimited generations available

### Pro User Experience:
1. User has `subscribed: true` in metadata
2. "Pro" badge displayed
3. Unlimited generations
4. No usage counter shown

## Production Checklist

- [ ] Configure Clerk production instance
- [ ] Set up payment provider (if using external billing)
- [ ] Create webhook handler for payment events
- [ ] Test subscription activation flow
- [ ] Test subscription cancellation
- [ ] Add subscription management UI in user profile
- [ ] Set up email notifications for subscription changes
- [ ] Configure proper error handling

## Updating User Metadata via API

Use Clerk's Backend API to update user metadata:

```typescript
import { clerkClient } from '@clerk/nextjs/server';

const client = await clerkClient();

// Make user a Pro subscriber
await client.users.updateUserMetadata(userId, {
  publicMetadata: {
    subscribed: true,
    plan: 'pro',
  },
});

// Cancel subscription
await client.users.updateUserMetadata(userId, {
  publicMetadata: {
    subscribed: false,
    plan: 'free',
  },
});
```

## Environment Variables

Only these are needed (no Stripe keys):

```bash
# Clerk (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# APIs
REMOVE_BG_API_KEY=...
GEMINI_API_KEY=...
```

## Benefits of Clerk-Only Approach

✅ **Simpler setup** - No webhook configuration needed for basic testing
✅ **Direct control** - Manage subscriptions directly in Clerk Dashboard
✅ **Flexible** - Easy to integrate any payment provider later
✅ **Less code** - Fewer API routes and dependencies
✅ **Quick testing** - Can manually grant subscriptions for testing

## Support & Resources

- [Clerk Metadata Guide](https://clerk.com/docs/users/metadata)
- [Clerk Backend API](https://clerk.com/docs/reference/backend-api)
- [User Profile Component](https://clerk.com/docs/components/user/user-profile)
