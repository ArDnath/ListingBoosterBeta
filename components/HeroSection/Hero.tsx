'use client';

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Send, Sparkles, ImageIcon, X, Download } from 'lucide-react'
import ProductDescriptionForm, { ProductFormData } from '../ProductDescriptionForm'

export default function HeroSection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setProcessedImage(null)
        setIsProcessing(false)
      }
      reader.readAsDataURL(file)
    }
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
              // Upload Area
              <div 
                className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-all cursor-pointer bg-muted/30 hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-2">Upload Your Product Image</p>
                    <p className="text-sm text-muted-foreground">Click to browse or drag and drop your image here</p>
                    <p className="text-xs text-muted-foreground mt-2">Supports: JPG, PNG, WEBP (Max 10MB)</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              // Image Preview and Chat
              <div className="space-y-4">
                {/* Image Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Image */}
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white z-10">
                      Original
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-destructive/90 hover:bg-destructive rounded-full z-10 transition-colors"
                    >
                      <X className="w-4 h-4 text-destructive-foreground" />
                    </button>
                    <Image
                      src={uploadedImage}
                      alt="Original image"
                      width={800}
                      height={600}
                      className="w-full h-auto max-h-64 object-contain bg-muted"
                    />
                  </div>

                  {/* Processed Image */}
                  {processedImage && (
                    <div className="relative rounded-lg overflow-hidden border border-primary">
                      <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 rounded text-xs text-primary-foreground z-10">
                        ✨ Processed
                      </div>
                      <Image
                        src={processedImage}
                        alt="Processed image"
                        width={800}
                        height={600}
                        className="w-full h-auto max-h-64 object-contain bg-transparent"
                        style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!processedImage && !isProcessing && (
                    <button
                      onClick={handleRemoveBackground}
                      className="flex-1 py-3 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <Sparkles className="w-5 h-5" />
                      Remove Background
                    </button>
                  )}
                  {processedImage && (
                    <button
                      onClick={handleDownloadImage}
                      className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <Download className="w-5 h-5" />
                      Download Image
                    </button>
                  )}
                </div>

                {/* Processing State */}
                {isProcessing && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Removing background...</p>
                  </div>
                )}
              </div>
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
