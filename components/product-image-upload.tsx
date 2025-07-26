'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import ProductImage from './product-image';

interface ProductImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage?: File | null;
  previewUrl?: string;
  disabled?: boolean;
}

export default function ProductImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  previewUrl,
  disabled = false
}: ProductImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getPreviewUrl = () => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }
    return previewUrl;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="product-image-upload">Image du produit</Label>
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-2 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {(getPreviewUrl() || previewUrl) ? (
          <div className="space-y-1">
            <div className="relative inline-block">
              <ProductImage
                src={getPreviewUrl() || previewUrl || ''}
                alt="Aperçu"
                className="w-16 h-16 object-cover rounded-lg"
                fallbackClassName="w-16 h-16 rounded-lg"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageRemove();
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {selectedImage?.name || 'Image existante'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="mx-auto w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
              <ImageIcon className="w-3 h-3 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-900">
                Glissez-déposez une image ici
              </p>
              <p className="text-xs text-slate-500">
                ou cliquez pour sélectionner
              </p>
            </div>
            <p className="text-xs text-slate-400">
              PNG, JPG, GIF jusqu'à 5MB
            </p>
          </div>
        )}
      </div>

      {!(getPreviewUrl() || previewUrl) && !disabled && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          className="w-full text-sm"
        >
          <Upload className="w-3 h-3 mr-2" />
          Choisir une image
        </Button>
      )}
    </div>
  );
} 