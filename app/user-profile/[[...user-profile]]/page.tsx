import { UserProfile } from '@clerk/nextjs';

export default function UserProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <UserProfile 
        path="/user-profile" 
        routing="path"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl",
          },
        }}
      />
    </div>
  );
}
