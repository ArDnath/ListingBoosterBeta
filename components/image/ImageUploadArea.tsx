import React from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadAreaProps {
  onFileSelect: (file: File) => void | boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}

export default function ImageUploadArea({
  onFileSelect,
  fileInputRef,
  disabled = false,
}: ImageUploadAreaProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };
  
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
        disabled 
          ? 'border-muted-foreground/30 bg-muted/10 cursor-not-allowed' 
          : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full ${
          disabled ? 'bg-muted-foreground/10' : 'bg-primary/10'
        }`}>
          <Upload className={`w-10 h-10 ${disabled ? 'text-muted-foreground/40' : 'text-primary'}`} />
        </div>
        <div>
          <p className={`text-lg font-semibold mb-2 ${
            disabled ? 'text-muted-foreground/60' : 'text-foreground'
          }`}>
            {disabled ? 'Upload Limit Reached' : 'Upload Your Product Image'}
          </p>
          <p className={`text-sm ${
            disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
          }`}>
            {disabled 
              ? 'Upgrade to Pro for unlimited uploads' 
              : 'Click to browse or drag and drop your image here'}
          </p>
          <p className={`text-xs mt-2 ${
            disabled ? 'text-muted-foreground/40' : 'text-muted-foreground'
          }`}>
            Supports: JPG, PNG, WEBP (Max 10MB)
          </p>
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
