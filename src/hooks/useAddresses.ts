
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Address {
  id: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
}

export const useAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching addresses for user:', user.id);
      
      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (addressesError) {
        console.error('Error fetching addresses:', addressesError);
        throw addressesError;
      }

      console.log('Fetched addresses:', addressesData);
      setAddresses(addressesData || []);
      setError(null);
    } catch (err: any) {
      console.error('Error in fetchAddresses:', err);
      setError(err.message || 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const addAddress = async (addressData: Omit<Address, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([{ ...addressData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding address:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting address:', err);
      return { success: false, error: err.message };
    }
  };

  return { 
    addresses, 
    loading, 
    error, 
    addAddress, 
    deleteAddress, 
    refetch: fetchAddresses 
  };
};
