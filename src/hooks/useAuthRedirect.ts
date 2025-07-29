
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = (action?: string) => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: location.pathname,
          action: action || 'access this feature'
        } 
      });
      return false;
    }
    return true;
  };

  return { requireAuth, isAuthenticated: !!user };
};
