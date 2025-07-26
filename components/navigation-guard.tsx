'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import LoadingSkeleton from './loading-skeleton';

interface NavigationGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function NavigationGuard({ children, requireAuth = true }: NavigationGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Attendre que l'authentification soit déterminée
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  // Pendant le chargement initial, afficher un skeleton
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton type="shops" />
        </div>
      </div>
    );
  }

  // Si l'authentification est requise et l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    // Rediriger vers la page de connexion
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return null;
  }

  return <>{children}</>;
} 