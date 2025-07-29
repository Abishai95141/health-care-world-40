import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import BannerEditorModal from '@/components/banners/BannerEditorModal';
import type { Tables } from '@/integrations/supabase/types';

type Banner = Tables<'ad_banners'>;

const BannerManagement = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { toast } = useToast();

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .select('*')
        .order('created_at', { ascending: false });

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

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleStatus = async (bannerId: string, isEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('ad_banners')
        .update({ is_enabled: !isEnabled })
        .eq('id', bannerId);

      if (error) throw error;

      setBanners(prev => prev.map(banner => 
        banner.id === bannerId ? { ...banner, is_enabled: !isEnabled } : banner
      ));

      toast({
        title: "Success",
        description: `Banner ${!isEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating banner status:', error);
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('ad_banners')
        .delete()
        .eq('id', bannerId);

      if (error) throw error;

      setBanners(prev => prev.filter(banner => banner.id !== bannerId));
      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setIsEditorOpen(true);
  };

  const handleCreateBanner = () => {
    setEditingBanner(null);
    setIsEditorOpen(true);
  };

  const getPlacementLabel = (placement: string) => {
    const labels: Record<string, string> = {
      'home_hero': 'Home Hero',
      'shop_top': 'Shop Top',
      'cart_footer': 'Cart Footer',
      'checkout_confirmation': 'Checkout Confirmation'
    };
    return labels[placement] || placement;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-2">Manage promotional banners across your site</p>
        </div>
        <Button
          onClick={handleCreateBanner}
          className="bg-[#27AE60] hover:bg-[#229954] text-white rounded-xl px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Banner
        </Button>
      </div>

      <div className="grid gap-4">
        {banners.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Plus className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
            <p className="text-gray-600 mb-6">Create your first promotional banner to get started.</p>
            <Button
              onClick={handleCreateBanner}
              className="bg-[#27AE60] hover:bg-[#229954] text-white rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Banner
            </Button>
          </Card>
        ) : (
          banners.map((banner) => (
            <Card key={banner.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{banner.title}</h3>
                    <Badge variant={banner.is_enabled ? "default" : "secondary"}>
                      {banner.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant="outline">
                      {getPlacementLabel(banner.placement)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-1">{banner.headline}</p>
                  {banner.subtext && (
                    <p className="text-sm text-gray-500">{banner.subtext}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Last updated: {new Date(banner.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(banner.id, banner.is_enabled)}
                    className="rounded-xl"
                  >
                    {banner.is_enabled ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBanner(banner)}
                    className="rounded-xl"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <BannerEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingBanner(null);
        }}
        banner={editingBanner}
        onSave={() => {
          fetchBanners();
          setIsEditorOpen(false);
          setEditingBanner(null);
        }}
      />
    </div>
  );
};

export default BannerManagement;
