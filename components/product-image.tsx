'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export default function ProductImage({ src, alt, className = "w-full h-full object-cover", fallbackClassName = "w-full h-full" }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError || !src) {
    return (
      <div className={`bg-slate-100 flex items-center justify-center ${fallbackClassName}`}>
        <ShoppingBag className="w-6 h-6 text-slate-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
} 