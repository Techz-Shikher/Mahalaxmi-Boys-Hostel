// app/admin/layout.tsx
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="Admin">
      <main>{children}</main>
    </ProtectedRoute>
  );
}
