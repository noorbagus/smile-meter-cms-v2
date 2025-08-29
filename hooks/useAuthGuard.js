// hooks/useAuthGuard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../pages/_app';

export const useAuthGuard = (requiredRole = null) => {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user || !profile) {
      router.push('/login');
      return;
    }

    if (requiredRole && profile.role !== requiredRole) {
      // Redirect based on actual role
      if (profile.role === 'admin') {
        router.push('/dashboard');
      } else if (profile.role === 'customer_service') {
        router.push('/cs-dashboard');
      } else {
        router.push('/login');
      }
      return;
    }

    setLoading(false);
  }, [user, profile, authLoading, requiredRole, router]);

  return {
    user,
    profile, 
    loading: authLoading || loading
  };
};