import React from 'react';

interface UsageBadgeProps {
  isSubscribed: boolean;
  generationsUsed: number;
  maxGenerations: number;
}

export default function UsageBadge({
  isSubscribed,
  generationsUsed,
  maxGenerations,
}: UsageBadgeProps) {
  return (
    <div className="text-xs text-muted-foreground">
      {isSubscribed ? (
        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">Pro</span>
      ) : (
        <span>{generationsUsed}/{maxGenerations} free generations</span>
      )}
    </div>
  );
}
