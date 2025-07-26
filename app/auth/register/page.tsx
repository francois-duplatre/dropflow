'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      
      if (result.success) {
        if (result.needsConfirmation) {
          alert(result.message || 'Vérifiez votre email pour confirmer votre compte');
          window.location.href = '/auth/login';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        alert(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      alert('Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            Créez votre compte
          </h1>
          <p className="text-slate-600">
            Commencez à gérer votre dropshipping dès aujourd'hui
          </p>
        </div>

        {/* Register Form */}
        <Card className="border-slate-200 shadow-xl backdrop-blur-sm bg-white/80">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Inscription gratuite
            </CardTitle>
            <CardDescription className="text-slate-600">
              Créez votre compte en quelques secondes
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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
                    placeholder="Créez un mot de passe"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirmez le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 text-sm">
                <input type="checkbox" required className="mt-0.5 rounded border-slate-300" />
                <span className="text-slate-600">
                  J'accepte les{' '}
                  <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    conditions d'utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    politique de confidentialité
                  </Link>
                </span>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg"
              >
                {isLoading ? 'Création du compte...' : 'Créer mon compte'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Vous avez déjà un compte ?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Connectez-vous
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}