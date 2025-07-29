
import { useEffect } from 'react';
import { useStaffAuth } from '@/contexts/StaffAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface StaffProtectedRouteProps {
  children: React.ReactNode;
}

const StaffProtectedRoute = ({ children }: StaffProtectedRouteProps) => {
  const { user, loading } = useStaffAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/staff/login', { 
        state: { 
          message: 'Please log in with staff credentials.',
          from: location.pathname 
        },
        replace: true 
      });
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default StaffProtectedRoute;
