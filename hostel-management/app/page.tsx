'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else if (user.role === 'Admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Mahalaxmi Boys Hostel</h1>
      <p>Loading...</p>
    </div>
  );
}

  if (loading) return <LoadingSpinner />;
  return null;
}
