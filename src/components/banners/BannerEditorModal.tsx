
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Banner = Tables<'ad_banners'>;

interface BannerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: Banner | null;
  onSave: () => void;
}

const BannerEditorModal: React.FC<BannerEditorModalProps> = ({
  isOpen,
  onClose,
  banner,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    placement: '',
    headline: '',
    subtext: '',
    cta_text: '',
    cta_url: '',
    image_url: '',
    display_order: 1,
    is_enabled: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        placement: banner.placement,
        headline: banner.headline,
        subtext: banner.subtext || '',
        cta_text: banner.cta_text || '',
        cta_url: banner.cta_url || '',
        image_url: banner.image_url || '',
        display_order: banner.display_order,
        is_enabled: banner.is_enabled,
      });
    } else {
      setFormData({
        title: '',
        placement: '',
        headline: '',
        subtext: '',
        cta_text: '',
        cta_url: '',
        image_url: '',
        display_order: 1,
        is_enabled: true,
      });
    }
  }, [banner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (banner) {
        // Update existing banner
        const { error } = await supabase
          .from('ad_banners')
          .update(formData)
          .eq('id', banner.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Banner updated successfully",
        });
      } else {
        // Create new banner
        const { error } = await supabase
          .from('ad_banners')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Banner created successfully",
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      toast({
        title: "Error",
        description: `Failed to ${banner ? 'update' : 'create'} banner`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {banner ? 'Edit Banner' : 'Create New Banner'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="placement">Placement</Label>
              <Select
                value={formData.placement}
                onValueChange={(value) => handleInputChange('placement', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_hero">Home Hero</SelectItem>
                  <SelectItem value="shop_top">Shop Top</SelectItem>
                  <SelectItem value="cart_footer">Cart Footer</SelectItem>
                  <SelectItem value="checkout_confirmation">Checkout Confirmation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="subtext">Subtext</Label>
            <Textarea
              id="subtext"
              value={formData.subtext}
              onChange={(e) => handleInputChange('subtext', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta_text">CTA Text</Label>
              <Input
                id="cta_text"
                value={formData.cta_text}
                onChange={(e) => handleInputChange('cta_text', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cta_url">CTA URL</Label>
              <Input
                id="cta_url"
                value={formData.cta_url}
                onChange={(e) => handleInputChange('cta_url', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => handleInputChange('display_order', parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) => handleInputChange('is_enabled', checked)}
              />
              <Label htmlFor="is_enabled">Enabled</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#27AE60] hover:bg-[#229954] text-white"
            >
              {loading ? 'Saving...' : banner ? 'Update Banner' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BannerEditorModal;
