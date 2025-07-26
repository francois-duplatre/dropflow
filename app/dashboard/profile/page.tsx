'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, ArrowLeft, Save, User, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import ChangePasswordDialog from '@/components/change-password-dialog';
import DeleteAccountDialog from '@/components/delete-account-dialog';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, updateProfile, changePassword, deleteAccount } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    if (user) {
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      setFormData({
        firstName,
        lastName,
        email: user.email || ''
      });
    }
  }, [user, isAuthenticated, authLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    try {
      const result = await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName
      });
      
      if (result.success) {
        setIsEditing(false);
      } else {
        console.error('Erreur mise à jour profil:', result.error);
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    return await changePassword(currentPassword, newPassword);
  };

  const handleDeleteAccount = async (password: string) => {
    return await deleteAccount(password);
  };

  if (!user) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">Chargement...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DropFlow
              </span>
            </div>
            
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Mon Profil
          </h1>
          <p className="text-slate-600">
            Gérez vos informations personnelles et vos paramètres de compte
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informations personnelles</span>
                </CardTitle>
                <CardDescription>
                  Modifiez vos informations de base
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        className="bg-white/60"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        className="bg-white/60"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled={true}
                      className="bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    {isEditing ? (
                      <>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          disabled={isLoading}
                        >
                          Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </Button>
                      </>
                    ) : (
                      <Button type="button" onClick={() => setIsEditing(true)}>
                        <Save className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Informations du compte</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.email}</p>
                    <p className="text-xs text-slate-500">Email principal</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-slate-500">Membre depuis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  Changer le mot de passe
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => setIsDeleteAccountDialogOpen(true)}
                >
                  Supprimer mon compte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog de changement de mot de passe */}
      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onChangePassword={handleChangePassword}
      />

      {/* Dialog de suppression de compte */}
      <DeleteAccountDialog
        open={isDeleteAccountDialogOpen}
        onOpenChange={setIsDeleteAccountDialogOpen}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
} 