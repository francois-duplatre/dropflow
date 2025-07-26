'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, CheckCircle } from 'lucide-react';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ForgotPasswordDialog({ open, onOpenChange, onResetPassword }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onResetPassword(email);
      
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Erreur lors de l\'envoi de l\'email');
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Mot de passe oublié</span>
          </DialogTitle>
          <DialogDescription>
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </DialogDescription>
        </DialogHeader>
        
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Envoi...' : 'Envoyer l\'email'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Email envoyé !</span>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">
                Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
              </p>
              <p className="text-sm text-green-700 mt-2">
                Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 