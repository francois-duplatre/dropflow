'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Eye, EyeOff, Trash2 } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
}

export default function DeleteAccountDialog({ open, onOpenChange, onDeleteAccount }: DeleteAccountDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    if (confirmText !== 'SUPPRIMER') {
      setError('Veuillez écrire SUPPRIMER pour confirmer');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onDeleteAccount(password);
      
      if (result.success) {
        // Rediriger vers la page d'accueil
        window.location.href = '/';
      } else {
        setError(result.error || 'Erreur lors de la suppression du compte');
      }
    } catch (err) {
      setError('Erreur lors de la suppression du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
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
            <span>Supprimer mon compte</span>
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes vos données seront définitivement supprimées.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Attention !</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Toutes vos boutiques seront supprimées</li>
                  <li>Tous vos produits seront supprimés</li>
                  <li>Votre compte sera définitivement fermé</li>
                  <li>Cette action ne peut pas être annulée</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe pour confirmer"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
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
                  Supprimer définitivement
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 