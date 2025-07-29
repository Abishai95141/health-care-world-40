
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Advertisement = Tables<'ad_banners'>;

export const useAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error: any) {
      console.error('Error fetching advertisements:', error);
      toast({
        title: "Error",
        description: "Failed to load advertisements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `ads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ads')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('ads')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createAdvertisement = async (adData: Omit<Advertisement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .insert(adData)
        .select()
        .single();

      if (error) throw error;

      await fetchAdvertisements();
      toast({
        title: "Success",
        description: "Advertisement created successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error creating advertisement:', error);
      toast({
        title: "Error",
        description: "Failed to create advertisement",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAdvertisement = async (id: string, updates: Partial<Advertisement>) => {
    try {
      const { error } = await supabase
        .from('ad_banners')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchAdvertisements();
      toast({
        title: "Success",
        description: "Advertisement updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating advertisement:', error);
      toast({
        title: "Error",
        description: "Failed to update advertisement",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAdvertisement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ad_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchAdvertisements();
      toast({
        title: "Success",
        description: "Advertisement deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting advertisement:', error);
      toast({
        title: "Error",
        description: "Failed to delete advertisement",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAdvertisementsByPlacement = (placement: string) => {
    return advertisements.filter(ad => ad.placement === placement && ad.is_enabled);
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  return {
    advertisements,
    loading,
    uploadImage,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    getAdvertisementsByPlacement,
    refetch: fetchAdvertisements,
  };
};
