'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Lock, Zap } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface ProductDescriptionFormProps {
  onGenerateDescription: (data: ProductFormData) => void;
  isGenerating: boolean;
  generatedDescription: string | null;
}

export interface ProductFormData {
  productName: string;
  productCategory: string;
  keyFeatures: string;
  targetAudience: string;
  uniqueSellingPoints: string;
}

export default function ProductDescriptionForm({
  onGenerateDescription,
  isGenerating,
  generatedDescription,
}: ProductDescriptionFormProps) {
  const { isSignedIn, user } = useUser();
  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    productCategory: '',
    keyFeatures: '',
    targetAudience: '',
    uniqueSellingPoints: '',
  });
  
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const MAX_FREE_GENERATIONS = 5;

  useEffect(() => {
    async function checkSubscription() {
      if (!isSignedIn) {
        setIsCheckingSubscription(false);
        return;
      }

      try {
        const response = await fetch('/api/check-subscription');
        const data = await response.json();
        
        setIsSubscribed(data.isSubscribed);
        setGenerationsUsed(data.generationsUsed || 0);
        
        // Show paywall only if not subscribed and over limit
        if (!data.isSubscribed && data.generationsUsed >= MAX_FREE_GENERATIONS) {
          setShowPaywall(true);
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
      } finally {
        setIsCheckingSubscription(false);
      }
    }

    checkSubscription();
  }, [isSignedIn]);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGenerate = async () => {
    if (!isSignedIn) {
      alert('Please sign in to generate descriptions');
      return;
    }

    if (!isSubscribed && generationsUsed >= MAX_FREE_GENERATIONS) {
      setShowPaywall(true);
      return;
    }

    // Validate required fields
    if (!formData.productName || !formData.keyFeatures) {
      alert('Please fill in at least the product name and key features');
      return;
    }

    onGenerateDescription(formData);
    
    // Increment usage count in Clerk
    if (!isSubscribed) {
      try {
        const response = await fetch('/api/increment-usage', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
          setGenerationsUsed(data.generationsUsed);
          
          if (data.generationsUsed >= MAX_FREE_GENERATIONS) {
            setShowPaywall(true);
          }
        }
      } catch (error) {
        console.error('Failed to increment usage:', error);
      }
    }
  };

  const handleUpgrade = () => {
    // Open Clerk's user profile with billing tab
    // You can configure this in Clerk Dashboard under "User Profile"
    window.open('/user-profile#billing', '_blank');
  };

  const isFormValid = formData.productName.trim() && formData.keyFeatures.trim() && isSignedIn;
  const canGenerate = isSubscribed || generationsUsed < MAX_FREE_GENERATIONS;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Product Details
          </h3>
          {isSignedIn && (
            <div className="text-xs text-muted-foreground">
              {isSubscribed ? (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">Pro</span>
              ) : (
                <span>{generationsUsed}/{MAX_FREE_GENERATIONS} free generations</span>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isSignedIn ? 'Fill in your product details to generate an SEO-optimized description' : 'Sign in to generate AI descriptions'}
        </p>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
          <div className="bg-card border-2 border-primary rounded-xl p-8 max-w-md text-center shadow-2xl">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Upgrade to Continue</h3>
            <p className="text-muted-foreground mb-6">
              You've used all {MAX_FREE_GENERATIONS} free generations. Subscribe to unlock unlimited AI-powered descriptions!
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleUpgrade}
                className="w-full py-3 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Upgrade Now - $9.99/month
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Product Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) => handleInputChange('productName', e.target.value)}
            placeholder="e.g., Wireless Bluetooth Headphones"
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Product Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <input
            type="text"
            value={formData.productCategory}
            onChange={(e) => handleInputChange('productCategory', e.target.value)}
            placeholder="e.g., Electronics, Audio"
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Key Features */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Key Features <span className="text-destructive">*</span>
          </label>
          <textarea
            value={formData.keyFeatures}
            onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
            placeholder="e.g., Noise cancellation, 30-hour battery, comfortable fit"
            rows={3}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
          />
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Target Audience
          </label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            placeholder="e.g., Music lovers, commuters, gamers"
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Unique Selling Points */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            What Makes It Special?
          </label>
          <textarea
            value={formData.uniqueSellingPoints}
            onChange={(e) => handleInputChange('uniqueSellingPoints', e.target.value)}
            placeholder="e.g., Premium sound quality at affordable price"
            rows={2}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
          />
        </div>
      </div>

      {/* Generated Description */}
      {generatedDescription && (
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">SEO-Optimized Description</h4>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{generatedDescription}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedDescription);
              alert('Description copied to clipboard!');
            }}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Copy to clipboard
          </button>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!isFormValid || isGenerating || !canGenerate || isCheckingSubscription}
        className="w-full py-3 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium"
      >
        {isCheckingSubscription ? (
          'Loading...'
        ) : !isSignedIn ? (
          <>
            <Lock className="w-5 h-5" />
            Sign In to Generate
          </>
        ) : isGenerating ? (
          <>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            </div>
            Generating...
          </>
        ) : !isSubscribed && generationsUsed >= MAX_FREE_GENERATIONS ? (
          <>
            <Lock className="w-5 h-5" />
            Unlock Unlimited Generations
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Description
          </>
        )}
      </button>
    </div>
  );
}
