
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderCount = () => {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching order count for user:', user.id);
        
        const { count, error: countError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) {
          console.error('Error fetching order count:', countError);
          throw countError;
        }

        console.log('Fetched order count:', count);
        setOrderCount(count || 0);
        setError(null);
      } catch (err: any) {
        console.error('Error in fetchOrderCount:', err);
        setError(err.message || 'Failed to fetch order count');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderCount();
  }, [user]);

  return { orderCount, loading, error };
};
