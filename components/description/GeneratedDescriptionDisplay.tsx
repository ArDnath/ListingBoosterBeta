import React from 'react';
import { Sparkles } from 'lucide-react';

interface GeneratedDescriptionDisplayProps {
  description: string;
  onCopy?: () => void;
}

export default function GeneratedDescriptionDisplay({
  description,
  onCopy,
}: GeneratedDescriptionDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    if (onCopy) {
      onCopy();
    } else {
      alert('Description copied to clipboard!');
    }
  };

  return (
    <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">SEO-Optimized Description</h4>
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap">{description}</p>
      <button
        onClick={handleCopy}
        className="mt-3 text-xs text-primary hover:underline"
      >
        Copy to clipboard
      </button>
    </div>
  );
}
