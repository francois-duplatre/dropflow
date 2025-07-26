import { useState, useEffect } from 'react';

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
  token: string | null;
}

// Gestion de l'authentification avec localStorage
export const auth = {
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  // Obtenir les informations de l'utilisateur
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  // Connecter un utilisateur
  login: (user: User, token?: string): void => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify(user));
    if (token) {
      localStorage.setItem('authToken', token);
    }
  },

  // Déconnecter un utilisateur
  logout: (): void => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userShops');
  },

  // Mettre à jour les informations utilisateur
  updateUser: (userData: Partial<User>): void => {
    if (typeof window === 'undefined') return;
    
    const currentUser = auth.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  },

  // Obtenir le token d'authentification
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }
};

// Hook pour gérer l'état d'authentification
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  useEffect(() => {
    const isAuth = auth.isAuthenticated();
    const user = auth.getUser();
    const token = auth.getToken();

    setAuthState({
      isAuthenticated: isAuth,
      user,
      token
    });
  }, []);

  return authState;
}; 