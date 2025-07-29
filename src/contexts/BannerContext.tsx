
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Banner = Tables<'ad_banners'>;

interface BannerContextType {
  banners: Banner[];
  getBannersByPlacement: (placement: string) => Banner[];
  refreshBanners: () => Promise<void>;
  loading: boolean;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanners must be used within a BannerProvider');
  }
  return context;
};

export const BannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .select('*')
        .eq('is_enabled', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error: any) {
      console.error('Error fetching banners:', error);
      toast({
        title: "Error",
        description: "Failed to load banners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBannersByPlacement = (placement: string) => {
    return banners.filter(banner => banner.placement === placement);
  };

  const refreshBanners = async () => {
    await fetchBanners();
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const value = {
    banners,
    getBannersByPlacement,
    refreshBanners,
    loading,
  };

  return <BannerContext.Provider value={value}>{children}</BannerContext.Provider>;
};
