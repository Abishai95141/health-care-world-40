
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAdvertisements } from '@/hooks/useAdvertisements';
import { useToast } from '@/hooks/use-toast';

interface AdvertisementModalProps {
  isOpen: boolean;
  onClose: () => void;
  advertisement?: any;
}

const AdvertisementModal: React.FC<AdvertisementModalProps> = ({
  isOpen,
  onClose,
  advertisement
}) => {
  const { createAdvertisement, updateAdvertisement, uploadImage } = useAdvertisements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    placement: '',
    headline: '',
    subtext: '',
    cta_text: '',
    cta_url: '',
    display_order: 1,
    is_enabled: true,
    image_url: ''
  });

  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title || '',
        placement: advertisement.placement || '',
        headline: advertisement.headline || '',
        subtext: advertisement.subtext || '',
        cta_text: advertisement.cta_text || '',
        cta_url: advertisement.cta_url || '',
        display_order: advertisement.display_order || 1,
        is_enabled: advertisement.is_enabled ?? true,
        image_url: advertisement.image_url || ''
      });
      setImagePreview(advertisement.image_url || '');
    } else {
      setFormData({
        title: '',
        placement: '',
        headline: '',
        subtext: '',
        cta_text: '',
        cta_url: '',
        display_order: 1,
        is_enabled: true,
        image_url: ''
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [advertisement, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const adData = {
        ...formData,
        image_url: imageUrl
      };

      if (advertisement) {
        await updateAdvertisement(advertisement.id, adData);
      } else {
        await createAdvertisement(adData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving advertisement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {advertisement ? 'Edit Advertisement' : 'Create New Advertisement'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <Label htmlFor="image" className="text-sm font-medium">
              Advertisement Image
            </Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                  </div>
                  <input
                    id="image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Advertisement title"
              required
              className="rounded-xl"
            />
          </div>

          {/* Placement */}
          <div>
            <Label htmlFor="placement">Placement</Label>
            <Select
              value={formData.placement}
              onValueChange={(value) => setFormData({ ...formData, placement: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home_hero">Home Page</SelectItem>
                <SelectItem value="shop_top">Shop Page</SelectItem>
                <SelectItem value="cart_footer">Cart Page</SelectItem>
                <SelectItem value="checkout_confirmation">Checkout Page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Headline */}
          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Main headline text"
              className="rounded-xl"
            />
          </div>

          {/* Subtext */}
          <div>
            <Label htmlFor="subtext">Subtext</Label>
            <Textarea
              id="subtext"
              value={formData.subtext}
              onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
              placeholder="Additional description text"
              className="rounded-xl"
              rows={3}
            />
          </div>

          {/* CTA Text & URL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta_text">CTA Text</Label>
              <Input
                id="cta_text"
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                placeholder="Button text"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="cta_url">CTA URL</Label>
              <Input
                id="cta_url"
                value={formData.cta_url}
                onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                placeholder="https://example.com"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Display Order */}
          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
              min="1"
              className="rounded-xl"
            />
          </div>

          {/* Enabled Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.is_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
            />
            <Label htmlFor="enabled">Enable Advertisement</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#27AE60] hover:bg-[#219653] text-white rounded-xl"
            >
              {loading ? 'Saving...' : advertisement ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdvertisementModal;
