import React from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadAreaProps {
  onFileSelect: (file: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function ImageUploadArea({
  onFileSelect,
  fileInputRef,
}: ImageUploadAreaProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
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
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
