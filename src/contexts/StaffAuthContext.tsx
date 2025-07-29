
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StaffUser {
  id: string;
  email: string;
  role: string;
}

interface StaffAuthContextType {
  user: StaffUser | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
  loading: boolean;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const useStaffAuth = () => {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};

export const StaffAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing staff session
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('staff_user');
        if (storedUser) {
          const staffUser = JSON.parse(storedUser);
          
          // Verify the stored session is still valid
          const { data, error } = await supabase
            .from('staff_users')
            .select('id, email, role')
            .eq('email', staffUser.email)
            .maybeSingle();
          
          if (!error && data) {
            setUser({
              id: data.id,
              email: data.email,
              role: data.role
            });
          } else {
            // Clear invalid session
            localStorage.removeItem('staff_user');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('staff_user');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Authenticate the staff user using the custom function
      const { data, error } = await supabase.rpc('authenticate_staff', {
        email_input: email,
        password_input: password
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const staffData = data[0];
        
        const staffUser = {
          id: staffData.user_id,
          email: staffData.email,
          role: staffData.role
        };

        setUser(staffUser);
        localStorage.setItem('staff_user', JSON.stringify(staffUser));
        return { error: null };
      } else {
        return { error: { message: 'Invalid email or password' } };
      }
    } catch (error: any) {
      console.error('Staff sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('staff_user');
  };

  const value = {
    user,
    signIn,
    signOut,
    loading,
  };

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
};
