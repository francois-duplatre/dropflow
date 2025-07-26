import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Instagram, Lock, X, CheckCircle } from 'lucide-react';

interface PremiumLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordSubmit: (password: string) => void;
  isLoading?: boolean;
  error?: string;
  isSuccess?: boolean;
}

export default function PremiumLimitDialog({ 
  isOpen, 
  onClose, 
  onPasswordSubmit, 
  isLoading = false, 
  error,
  isSuccess = false
}: PremiumLimitDialogProps) {
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
    } else {
      setShowSuccess(false);
    }
  }, [isSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onPasswordSubmit(password);
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  // Fermer automatiquement après succès
  useEffect(() => {
    if (showSuccess && isOpen) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-600" />
            Limite d'articles atteinte
          </DialogTitle>
          <DialogDescription>
            Vous avez atteint la limite de 15 articles gratuits.\n\nPour débloquer l’accès illimité :\n1. Abonnez-vous à notre Instagram @dropflow_fr\n2. Envoyez le mot “PREMIUM” en message privé (DM)\n3. Recevez le code d’accès et entrez-le ci-dessous pour profiter du site sans limite !"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="mb-4 animate-bounce">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Bravo !</h3>
              <p className="text-green-700 text-center mb-4">
                L'accès illimité est maintenant activé gratuitement sur votre compte.<br />
                Profitez-en ! 🎉
              </p>
              <Button onClick={handleClose} className="bg-green-600 text-white px-6 mt-2">Continuer</Button>
            </div>
          ) : (
            <>
              {/* Instructions Instagram */}
              <Alert className="border-orange-200 bg-orange-50">
                <Instagram className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Vous avez atteint la limite de 15 articles gratuits.</strong>
                  <br /><br />
                  <span>Pour débloquer l’accès illimité :</span>
                  <br />
                  1. <strong>Abonnez-vous</strong> à notre Instagram{' '}
                  <a 
                    href="https://instagram.com/dropflow_fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    @dropflow_fr
                  </a>
                  <br />
                  2. <strong>Envoyez le mot “PREMIUM”</strong> en message privé (DM)
                  <br />
                  3. <strong>Recevez le code d’accès</strong> et entrez-le ci-dessous pour profiter du site sans limite !
                </AlertDescription>
              </Alert>

              {/* Formulaire mot de passe */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="premium-password">Code d'accès</Label>
                  <Input
                    id="premium-password"
                    type="password"
                    placeholder="Entrez le code reçu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="font-mono"
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <X className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={!password.trim() || isLoading}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    {isLoading ? 'Vérification...' : 'Débloquer'}
                  </Button>
                </div>
              </form>

              {/* Note */}
              <p className="text-xs text-slate-500 text-center">
                Le code est valable pour toutes vos boutiques
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 