import React from 'react';
import { Lock, Zap } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  maxGenerations: number;
}

export default function PaywallModal({
  isOpen,
  onClose,
  onUpgrade,
  maxGenerations,
}: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
      <div className="bg-card border-2 border-primary rounded-xl p-8 max-w-md text-center shadow-2xl">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Free Limit Reached</h3>
        <div className="space-y-4 mb-6">
          <p className="text-muted-foreground">
            You've used all {maxGenerations} free background removals. 
          </p>
          <p className="font-medium text-foreground">
            Subscribe to unlock unlimited background removal and other premium features!
          </p>
        </div>
        <div className="space-y-3">
          <button 
            onClick={onUpgrade}
            className="w-full py-3 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Upgrade Now - $17/month
          </button>
        </div>
      </div>
    </div>
  );
}
