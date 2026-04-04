// app/student/layout.tsx
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="Student">
      <main>{children}</main>
    </ProtectedRoute>
  );
}
