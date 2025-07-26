'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Vérifier l'utilisateur actuel
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
        
        // Récupérer la session complète
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Éviter les rechargements inutiles
        if (session?.user?.id !== user?.id) {
          setUser(session?.user ?? null);
          setSession(session);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) throw error;

      // Créer le profil utilisateur seulement si l'utilisateur est confirmé
      if (data.user && !data.user.email_confirmed_at) {
        // L'utilisateur doit confirmer son email
        return { 
          success: true, 
          message: 'Vérifiez votre email pour confirmer votre compte',
          needsConfirmation: true 
        };
      }

      // Si l'utilisateur est déjà confirmé, créer le profil
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            first_name: firstName,
            last_name: lastName,
          });

        if (profileError) {
          console.error('Erreur création profil:', profileError);
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Vérifier que l'utilisateur a un profil
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Erreur récupération profil:', profileError);
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates: { first_name?: string; last_name?: string }) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      // Mettre à jour les métadonnées de l'utilisateur
      const { error: authError } = await supabase.auth.updateUser({
        data: updates
      });

      if (authError) throw authError;

      // Mettre à jour le profil dans la table users
      const { error: profileError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Rafraîchir l'utilisateur
      const { data: { user: updatedUser }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) throw getUserError;

      setUser(updatedUser);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      // Vérifier le mot de passe actuel en se reconnectant
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        return { success: false, error: 'Mot de passe actuel incorrect' };
      }

      // Changer le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      // Vérifier le mot de passe
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });

      if (signInError) {
        return { success: false, error: 'Mot de passe incorrect' };
      }

      // Supprimer toutes les données de l'utilisateur
      const userId = user.id;

      // Supprimer les produits
      await supabase
        .from('products')
        .delete()
        .eq('user_id', userId);

      // Supprimer les boutiques
      await supabase
        .from('shops')
        .delete()
        .eq('user_id', userId);

      // Supprimer le profil utilisateur
      await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      // Supprimer le compte Supabase Auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        // Si on ne peut pas supprimer via admin, on supprime la session
        await supabase.auth.signOut();
      }

      setUser(null);
      setSession(null);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
    resetPassword,
    updateProfile,
    changePassword,
    deleteAccount,
    isAuthenticated: !!user && !!session,
  };
}; 