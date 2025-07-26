import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

// Service d'authentification Supabase
export const supabaseAuth = {
  // Inscription
  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> {
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

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Créer l'utilisateur dans notre table users
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
    } catch (error) {
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  },

  // Connexion
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Récupérer les données utilisateur
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          return { success: false, error: 'Erreur lors de la récupération du profil' };
        }

        const user: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          name: `${userData.first_name} ${userData.last_name}`,
          createdAt: userData.created_at,
        };

        return { success: true, user };
      }

      return { success: false, error: 'Utilisateur non trouvé' };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  },

  // Déconnexion
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la déconnexion' };
    }
  },

  // Obtenir l'utilisateur actuel
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !userData) return null;

      return {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        name: `${userData.first_name} ${userData.last_name}`,
        createdAt: userData.created_at,
      };
    } catch (error) {
      return null;
    }
  },

  // Vérifier si l'utilisateur est connecté
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  },

  // Mettre à jour le profil utilisateur
  async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
        })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }
}; 