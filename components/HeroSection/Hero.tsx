'use client';

import React, { useState, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import ProductDescriptionForm, { ProductFormData } from '../ProductDescriptionForm'
import ImageUploadArea from '../image/ImageUploadArea'
import ImageComparison from '../image/ImageComparison'

export default function HeroSection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (file: File) => {
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
      setProcessedImage(null)
      setIsProcessing(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveBackground = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('image', uploadedFile)

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setProcessedImage(data.imageUrl)
      } else {
        alert(data.error || 'Failed to remove background')
      }
    } catch (error) {
      console.error('Error removing background:', error)
      alert('An error occurred. Please check your API key and try again.')
    } finally {
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI Image Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by advanced AI technology</p>
              </div>
            </div>
          </div>

          {/* Chat Body */}
          <div className="p-6 min-h-[400px] max-h-[500px] overflow-y-auto bg-background/50">
            {!uploadedImage ? (
              <ImageUploadArea 
                onFileSelect={handleImageUpload}
                fileInputRef={fileInputRef}
              />
            ) : (
              <ImageComparison
                originalImage={uploadedImage}
                processedImage={processedImage}
                isProcessing={isProcessing}
                onRemoveImage={handleRemoveImage}
                onRemoveBackground={handleRemoveBackground}
                onDownloadImage={handleDownloadImage}
              />
            )}
          </div>
        </div>
        </div>

        {/* Right Column: Product Description Form */}
        <div className="relative">
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
