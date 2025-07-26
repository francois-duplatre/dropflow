'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import ForgotPasswordDialog from '@/components/forgot-password-dialog';

export default function LoginPage() {
  const { signIn, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        window.location.href = '/dashboard';
      } else {
        alert(result.error || 'Erreur lors de la connexion');
      }
    } catch (error) {
      alert('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    return await resetPassword(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              DropFlow
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Bon retour !
          </h1>
          <p className="text-slate-600">
            Connectez-vous à votre compte pour continuer
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-slate-200 shadow-xl backdrop-blur-sm bg-white/80">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Connexion
            </CardTitle>
            <CardDescription className="text-slate-600">
              Entrez vos identifiants pour accéder à votre tableau de bord
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="flex items-center space-x-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300" />
                  <span>Se souvenir de moi</span>
                </Label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Vous n'avez pas de compte ?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Créez-en un gratuitement
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dialog de mot de passe oublié */}
        <ForgotPasswordDialog
          open={isForgotPasswordOpen}
          onOpenChange={setIsForgotPasswordOpen}
          onResetPassword={handleResetPassword}
        />
      </div>
    </div>
  );
}