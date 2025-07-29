
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAddresses } from '@/hooks/useAddresses';

interface AddressDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewAddress {
  name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

export const AddressDrawer: React.FC<AddressDrawerProps> = ({ isOpen, onClose }) => {
  const { addresses, loading, error, addAddress, deleteAddress } = useAddresses();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddress>({
    name: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await addAddress({
      ...newAddress,
      is_default: addresses.length === 0
    });

    if (result?.success) {
      setNewAddress({
        name: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        phone: ''
      });
      setIsAddModalOpen(false);
    }

    setIsSubmitting(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    await deleteAddress(addressId);
  };

  // Close drawer when ESC is pressed
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-50"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="sticky top-0 bg-white/95 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="hover:bg-gray-100 rounded-full p-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      My Addresses
                    </h2>
                    <p className="text-sm text-gray-500">Manage your delivery addresses</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </motion.div>

              <div className="px-6 py-6 space-y-6">
                {/* Add New Address Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full h-14 bg-black text-white hover:bg-gray-800 
                             rounded-2xl flex items-center justify-center space-x-2
                             transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add New Address</span>
                  </Button>
                </motion.div>

                {/* Loading State */}
                {loading && (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, index) => (
                      <Card key={index} className="border-0 shadow-lg rounded-2xl animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <Card className="border-0 shadow-lg rounded-2xl border-red-200">
                    <CardContent className="p-6 text-center">
                      <div className="text-red-500 mb-2">Failed to load addresses</div>
                      <p className="text-gray-600 text-sm">{error}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Addresses List */}
                {!loading && !error && (
                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <Card className="border-0 shadow-lg rounded-2xl">
                        <CardContent className="p-8 text-center">
                          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-900 text-xl font-light mb-2">No addresses yet</p>
                          <p className="text-gray-600">Add your first delivery address</p>
                        </CardContent>
                      </Card>
                    ) : (
                      addresses.map((address, index) => (
                        <motion.div
                          key={address.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 
                                         rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white/90
                                         hover:scale-105 cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <h4 className="font-semibold text-gray-900 text-lg">
                                      {address.name}
                                    </h4>
                                    {address.is_default && (
                                      <span className="ml-2 px-2 py-1 bg-black text-white text-xs 
                                                     rounded-full">Default</span>
                                    )}
                                  </div>
                                  <div className="text-gray-600 space-y-1">
                                    <p>{address.street_address}</p>
                                    <p>{address.city}, {address.state} {address.postal_code}</p>
                                    <p>{address.country}</p>
                                    {address.phone && <p>Phone: {address.phone}</p>}
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-gray-100 rounded-full p-2"
                                    disabled
                                  >
                                    <Edit2 className="h-4 w-4 text-gray-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAddress(address.id)}
                                    className="hover:bg-red-50 hover:text-red-600 rounded-full p-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Address Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <Input
              placeholder="Full Name"
              value={newAddress.name}
              onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
              required
              className="rounded-xl"
            />
            <Input
              placeholder="Street Address"
              value={newAddress.street_address}
              onChange={(e) => setNewAddress(prev => ({ ...prev, street_address: e.target.value }))}
              required
              className="rounded-xl"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                required
                className="rounded-xl"
              />
              <Input
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Postal Code"
                value={newAddress.postal_code}
                onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                required
                className="rounded-xl"
              />
              <Input
                placeholder="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
            <Input
              placeholder="Phone Number (Optional)"
              value={newAddress.phone}
              onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
              className="rounded-xl"
            />
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 rounded-xl"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-black hover:bg-gray-800 rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Address'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
