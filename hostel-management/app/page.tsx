'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user?.role === 'Admin') {
        router.push('/admin/dashboard');
      } else if (user?.role === 'Student') {
        router.push('/student/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return <LoadingSpinner />;
}
