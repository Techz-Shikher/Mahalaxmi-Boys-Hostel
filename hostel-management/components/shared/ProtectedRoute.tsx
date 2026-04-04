// components/shared/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!user.role) {
        router.push('/login');
      } else if (requiredRole && user.role !== requiredRole) {
        router.push('/login');
      }
    }
  }, [user, loading, requiredRole, router]);

  if (loading) return <LoadingSpinner />;
  if (!user || !user.role || (requiredRole && user.role !== requiredRole)) return null;

  return <>{children}</>;
}
