import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback /> }) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, isAuthPending } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthPending && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoadingAuth, isAuthPending, isAuthenticated, navigate]);

  if (isLoadingAuth || isAuthPending) {
    return fallback;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Outlet />;
}