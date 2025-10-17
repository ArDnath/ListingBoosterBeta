'use client';

import React, { useState, useRef, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Lock,Zap } from 'lucide-react';
import ProductDescriptionForm, { ProductFormData } from '../ProductDescriptionForm'
import ImageUploadArea from '../image/ImageUploadArea'
import ImageComparison from '../image/ImageComparison'
import UsageBadge from '../subscription/UsageBadge'
import PaywallModal from '../subscription/PaywallModal'

export default function HeroSection() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // subscription state (shared gating similar to ProductDescriptionForm)
  const [generationsUsed, setGenerationsUsed] = useState(0)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showUploadPaywall, setShowUploadPaywall] = useState(false)
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true)
  const MAX_FREE_GENERATIONS = 3 // Allow only 3 free background removals

  useEffect(() => {
    async function checkSubscription() {
      if (!isSignedIn) {
        setIsSubscribed(false);
        setGenerationsUsed(0);
        setIsCheckingSubscription(false);
        return;
      }
      
      try {
        console.log('Checking subscription status...');
        const response = await fetch('/api/check-subscription');
        const data = await response.json();
        
        console.log('Subscription data:', data);
        
        const userIsSubscribed = data.isSubscribed || false;
        const userGenerationsUsed = Number(data.generationsUsed) || 0;
        
        setIsSubscribed(userIsSubscribed);
        setGenerationsUsed(userGenerationsUsed);
        
        // Show paywall if user has used all free generations and is not subscribed
        if (!userIsSubscribed && userGenerationsUsed >= MAX_FREE_GENERATIONS) {
          console.log('Free limit reached');
          // Only show paywall if user tries to perform an action
          // Don't auto-show paywall here to avoid being intrusive
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
        // Default to showing paywall on error to be safe
        if (!isSubscribed) setShowPaywall(true);
      } finally {
        setIsCheckingSubscription(false);
      }
    }
    
    checkSubscription();
    
    // Also check on sign-in state changes
    const interval = setInterval(checkSubscription, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isSignedIn, isSubscribed]);

  const handleImageUpload = (file: File) => {
    // Check subscription status before allowing upload
    if (!isSubscribed && generationsUsed >= MAX_FREE_GENERATIONS) {
      setShowUploadPaywall(true);
      return false;
    }
    
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setProcessedImage(null);
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
    return true;
  }

  const handleRemoveBackground = async () => {
    if (!uploadedFile) {
      alert('Please select an image first');
      return;
    }

    if (!isSignedIn) {
      alert('Please sign in to use the AI Image Assistant');
      return;
    }

    console.log('Current usage:', { generationsUsed, isSubscribed, MAX_FREE_GENERATIONS });
    
    // Double check subscription status before proceeding
    if (!isSubscribed && generationsUsed >= MAX_FREE_GENERATIONS) {
      console.log('Free limit reached, showing paywall');
      setShowPaywall(true);
      return;
    }

    setIsProcessing(true)
    console.log('Starting background removal...')

    try {
      const formData = new FormData()
      formData.append('image', uploadedFile)
      console.log('Sending image for processing...', {
        name: uploadedFile.name,
        type: uploadedFile.type,
        size: uploadedFile.size
      })

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      console.log('API Response:', { status: response.status, data })

      if (response.ok && data.success) {
        console.log('Background removed successfully, setting processed image...')
        setProcessedImage(data.imageUrl)
        
        if (!isSubscribed) {
          try {
            console.log('Incrementing usage counter...')
            const inc = await fetch('/api/increment-usage', { 
              method: 'POST' 
            })
            const incData = await inc.json()
            console.log('Usage counter updated:', incData)
            
            if (incData.success) {
              const newUsageCount = Number(incData.generationsUsed) || 0;
              setGenerationsUsed(newUsageCount);
              
              // Show paywall if user has reached the free limit after this operation
              if (newUsageCount >= MAX_FREE_GENERATIONS) {
                console.log('User has reached the free limit after this operation');
                setShowPaywall(true);
              }
            }
          } catch (e) {
            console.error('Failed to increment usage:', e)
            // Don't show this error to users as it doesn't affect their main task
          }
        }
      } else {
        const errorMessage = data.error || 
          (response.status === 401 ? 'Invalid API key' : 'Failed to remove background')
        console.error('Background removal failed:', errorMessage)
        alert(`Error: ${errorMessage}. Please try again or contact support.`)
      }
    } catch (error) {
      console.error('Error in handleRemoveBackground:', error)
      alert('An unexpected error occurred. Please check your connection and try again.')
    } finally {
      console.log('Background removal process completed')
      setIsProcessing(false)
    }
  }

  const handleGenerateDescription = async (formData: ProductFormData) => {
    setIsGeneratingDescription(true)
    setGeneratedDescription(null)

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setGeneratedDescription(data.description)
      } else {
        alert(data.error || 'Failed to generate description')
      }
    } catch (error) {
      console.error('Error generating description:', error)
      alert('An error occurred while generating the description')
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleDownloadImage = () => {
    if (!processedImage) return
    
    const link = document.createElement('a')
    link.href = processedImage
    link.download = 'processed-image.png'
    link.click()
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    setProcessedImage(null)
    setUploadedFile(null)
  }

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] w-full overflow-hidden px-4 py-16">
      {/* Hero Title */}
      <div className="text-center mb-12 space-y-4 max-w-7xl">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in p-4">
          ListingBooster
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-medium">
          Upload. Clean. Optimize. Sell More
        </p>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          AI-powered background removal + SEO-optimized descriptions for Amazon, eBay, and Shopify. No design skills required
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Image Processing */}
        <div>
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-b border-border p-4">
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">AI Image Assistant</h3>
                  <p className="text-xs text-muted-foreground">Powered by advanced AI technology</p>
                </div>
              </div>
              {isSignedIn && (
                <UsageBadge 
                  isSubscribed={isSubscribed}
                  generationsUsed={generationsUsed}
                  maxGenerations={MAX_FREE_GENERATIONS}
                />
              )}
            </div>
          </div>

          {/* Chat Body */}
          <div className="p-6 min-h-[400px] max-h-[500px] overflow-y-auto bg-background/50">
            {!uploadedImage ? (
              <div className="relative mt-6">
                {!isSubscribed && generationsUsed >= MAX_FREE_GENERATIONS && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                    <div className="bg-card border-2 border-primary rounded-xl p-8 max-w-md text-center shadow-2xl">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Free Limit Reached</h3>
                      <div className="space-y-4 mb-6">
                        <p className="text-muted-foreground">
                          You've used all {MAX_FREE_GENERATIONS} free background removals
                        </p>
                        <p className="font-medium text-foreground">
                          Subscribe to unlock unlimited background removal and other premium features!
                        </p>
                        <button
                          onClick={() => router.push('/pricing')}
                          className="w-full px-6 py-3 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <Zap className="w-5 h-5" />
                          Upgrade Now - $17/month
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <ImageUploadArea 
                  onFileSelect={handleImageUpload}
                  fileInputRef={fileInputRef}
                  disabled={!isSubscribed && generationsUsed >= MAX_FREE_GENERATIONS}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <ImageComparison
                  originalImage={uploadedImage}
                  processedImage={processedImage}
                  isProcessing={isProcessing}
                  onRemoveImage={handleRemoveImage}
                  onRemoveBackground={handleRemoveBackground}
                  onDownloadImage={handleDownloadImage}
                />
                {!isSubscribed && (
                  <div className="text-center text-sm text-muted-foreground">
                    {generationsUsed} of {MAX_FREE_GENERATIONS} free background removals used
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Right Column: Product Description Form */}
        <div className="relative">
          {/* Paywall for background removal */}
          <PaywallModal 
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            onUpgrade={() => {
              setShowPaywall(false);
              router.push('/pricing');
            }}
            maxGenerations={MAX_FREE_GENERATIONS}
          />
          
          {/* Paywall for image upload */}
          <PaywallModal 
            isOpen={showUploadPaywall}
            onClose={() => setShowUploadPaywall(false)}
            onUpgrade={() => {
              setShowUploadPaywall(false);
              router.push('/pricing');
            }}
            maxGenerations={MAX_FREE_GENERATIONS}
          />
          <ProductDescriptionForm
            onGenerateDescription={handleGenerateDescription}
            isGenerating={isGeneratingDescription}
            generatedDescription={generatedDescription}
          />
        </div>
      </div>
    </section>
  )
}
