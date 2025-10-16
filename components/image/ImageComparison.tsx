import React from 'react';
import Image from 'next/image';
import { X, Sparkles, Download } from 'lucide-react';
import LoadingIndicator from '../shared/LoadingIndicator';

interface ImageComparisonProps {
  originalImage: string;
  processedImage: string | null;
  isProcessing: boolean;
  onRemoveImage: () => void;
  onRemoveBackground: () => void;
  onDownloadImage: () => void;
}

export default function ImageComparison({
  originalImage,
  processedImage,
  isProcessing,
  onRemoveImage,
  onRemoveBackground,
  onDownloadImage,
}: ImageComparisonProps) {
  return (
    <div className="space-y-4">
      {/* Image Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Image */}
        <div className="relative rounded-lg overflow-hidden border border-border">
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white z-10">
            Original
          </div>
          <button
            onClick={onRemoveImage}
            className="absolute top-2 right-2 p-1.5 bg-destructive/90 hover:bg-destructive rounded-full z-10 transition-colors"
          >
            <X className="w-4 h-4 text-destructive-foreground" />
          </button>
          <Image
            src={originalImage}
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
              style={{ 
                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', 
                backgroundSize: '20px 20px', 
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' 
              }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!processedImage && !isProcessing && (
          <button
            onClick={onRemoveBackground}
            className="flex-1 py-3 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Sparkles className="w-5 h-5" />
            Remove Background
          </button>
        )}
        {processedImage && (
          <button
            onClick={onDownloadImage}
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
          <LoadingIndicator color="bg-primary" />
          <p className="text-sm text-muted-foreground">Removing background...</p>
        </div>
      )}
    </div>
  );
}
