'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function SuccessToast({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}: SuccessToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Attendre la fin de l'animation de sortie
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay avec animation */}
      <div 
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal de succès */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-300 ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Bouton de fermeture */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Contenu */}
        <div className="text-center">
          {/* Icône de succès avec animation */}
          <div className="mb-6 flex justify-center">
            <div className={`w-16 h-16 bg-green-100 rounded-full flex items-center justify-center transition-all duration-500 ${
              isAnimating ? 'scale-100' : 'scale-0'
            }`}>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Titre */}
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Import réussi !
          </h3>

          {/* Message */}
          <p className="text-slate-600 mb-6">
            {message}
          </p>

          {/* Bouton de confirmation */}
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6"
          >
            Parfait !
          </Button>
        </div>
      </div>
    </div>
  );
} 