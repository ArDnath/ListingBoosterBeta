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
        <h3 className="text-2xl font-bold mb-2">Upgrade to Continue</h3>
        <p className="text-muted-foreground mb-6">
          You've used all {maxGenerations} free generations. Subscribe to unlock unlimited AI-powered descriptions!
        </p>
        <div className="space-y-3">
          <button 
            onClick={onUpgrade}
            className="w-full py-3 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Upgrade Now - $9.99/month
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
