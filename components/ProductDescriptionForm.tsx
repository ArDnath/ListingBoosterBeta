'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Lock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import FormInput from './form/FormInput';
import FormTextarea from './form/FormTextarea';
import PaywallModal from './subscription/PaywallModal';
import UsageBadge from './subscription/UsageBadge';
import GeneratedDescriptionDisplay from './description/GeneratedDescriptionDisplay';
import LoadingIndicator from './shared/LoadingIndicator';

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
            <UsageBadge 
              isSubscribed={isSubscribed}
              generationsUsed={generationsUsed}
              maxGenerations={MAX_FREE_GENERATIONS}
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isSignedIn ? 'Fill in your product details to generate an SEO-optimized description' : 'Sign in to generate AI descriptions'}
        </p>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
        maxGenerations={MAX_FREE_GENERATIONS}
      />

      {/* Form */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <FormInput
          label="Product Name"
          value={formData.productName}
          onChange={(value) => handleInputChange('productName', value)}
          placeholder="e.g., Wireless Bluetooth Headphones"
          required
        />

        <FormInput
          label="Category"
          value={formData.productCategory}
          onChange={(value) => handleInputChange('productCategory', value)}
          placeholder="e.g., Electronics, Audio"
        />

        <FormTextarea
          label="Key Features"
          value={formData.keyFeatures}
          onChange={(value) => handleInputChange('keyFeatures', value)}
          placeholder="e.g., Noise cancellation, 30-hour battery, comfortable fit"
          rows={3}
          required
        />

        <FormInput
          label="Target Audience"
          value={formData.targetAudience}
          onChange={(value) => handleInputChange('targetAudience', value)}
          placeholder="e.g., Music lovers, commuters, gamers"
        />

        <FormTextarea
          label="What Makes It Special?"
          value={formData.uniqueSellingPoints}
          onChange={(value) => handleInputChange('uniqueSellingPoints', value)}
          placeholder="e.g., Premium sound quality at affordable price"
          rows={2}
        />
      </div>

      {/* Generated Description */}
      {generatedDescription && (
        <GeneratedDescriptionDisplay description={generatedDescription} />
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
            <LoadingIndicator />
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
