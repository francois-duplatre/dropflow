'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteShop: (shopId: string) => Promise<{ success: boolean; error?: string }>;
  shopName: string;
  shopId: string;
}

export default function DeleteShopDialog({ open, onOpenChange, onDeleteShop, shopName, shopId }: DeleteShopDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (confirmText !== 'SUPPRIMER') {
      setError('Veuillez écrire SUPPRIMER pour confirmer');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onDeleteShop(shopId);
      
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error || 'Erreur lors de la suppression de la boutique');
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la boutique');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Supprimer la boutique</span>
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer la boutique "{shopName}" ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Attention !</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tous les produits de cette boutique seront supprimés</li>
                  <li>La boutique sera définitivement supprimée</li>
                  <li>Cette action ne peut pas être annulée</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmText">
              Tapez <span className="font-mono bg-red-100 px-1 rounded">SUPPRIMER</span> pour confirmer
            </Label>
            <Input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
              disabled={isLoading}
              className="font-mono"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isLoading || confirmText !== 'SUPPRIMER'}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer la boutique
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 