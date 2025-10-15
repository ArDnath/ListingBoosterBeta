'use client';

import React from 'react';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { PricingTable } from '@clerk/nextjs';

export default function Pricing() {
  const { isSignedIn } = useUser();

  const handleUpgrade = () => {
    if (isSignedIn) {
      window.location.href = '/user-profile#billing';
    } else {
      // Redirect to sign in
      window.location.href = '/sign-in';
    }
  };

  return (
    <section className="relative py-24 px-4 bg-background" id="pricing">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready to scale your product listings
          </p>
        </div>

        {/* Pricing Cards */}
        <PricingTable/>
        
        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need a custom plan for your team?{' '}
            <a href="#contact" className="text-primary hover:underline font-medium">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
