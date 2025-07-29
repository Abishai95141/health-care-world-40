
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAdvertisements } from '@/hooks/useAdvertisements';
import AdvertisementModal from '@/components/staff/AdvertisementModal';
import AdvertisementCarousel from '@/components/staff/AdvertisementCarousel';

const AdvertisementManagement = () => {
  const { advertisements, loading, updateAdvertisement, deleteAdvertisement } = useAdvertisements();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const placementLabels = {
    'home_hero': 'Home Page',
    'shop_top': 'Shop Page',
    'cart_footer': 'Cart Page',
    'checkout_confirmation': 'Checkout Page'
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      await deleteAdvertisement(id);
    }
  };

  const handleToggleEnabled = async (id: string, isEnabled: boolean) => {
    await updateAdvertisement(id, { is_enabled: isEnabled });
  };

  const handleAddNew = () => {
    setEditingAd(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertisement Management</h1>
          <p className="text-gray-600 mt-2">Manage advertisements across all pages</p>
        </div>
        <Button 
          onClick={handleAddNew}
          className="bg-[#27AE60] hover:bg-[#219653] text-white rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Advertisement
        </Button>
      </div>

      {/* Preview Carousel */}
      <Card className="mb-8 rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <AdvertisementCarousel advertisements={advertisements.filter(ad => ad.is_enabled)} />
        </CardContent>
      </Card>

      {/* Advertisements Table */}
      <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">All Advertisements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {advertisements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No advertisements created yet</p>
                <Button 
                  onClick={handleAddNew}
                  className="mt-4 bg-[#27AE60] hover:bg-[#219653] text-white rounded-2xl"
                >
                  Create Your First Advertisement
                </Button>
              </div>
            ) : (
              advertisements.map((ad) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                      {ad.image_url ? (
                        <img 
                          src={ad.image_url} 
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                      <p className="text-sm text-gray-600">{ad.headline}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="rounded-full">
                          {placementLabels[ad.placement] || ad.placement}
                        </Badge>
                        <span className="text-xs text-gray-500">Order: {ad.display_order}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ad.is_enabled}
                        onCheckedChange={(checked) => handleToggleEnabled(ad.id, checked)}
                      />
                      <span className="text-sm text-gray-600">
                        {ad.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(ad)}
                        className="rounded-xl"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ad.id)}
                        className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advertisement Modal */}
      <AdvertisementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        advertisement={editingAd}
      />
    </motion.div>
  );
};

export default AdvertisementManagement;
