// app/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!user.role) {
        console.error('User has no role assigned');
        router.push('/login');
      } else if (user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'Student') {
        router.push('/student/dashboard');
      } else {
        console.error('Unknown user role:', user.role);
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner />;
  return null;
}
