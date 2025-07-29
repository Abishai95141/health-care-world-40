import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useOrder } from '@/hooks/useOrder';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { X, Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import AdvertisementBanner from '@/components/AdvertisementBanner';

interface Address {
  id: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string | null;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  time: string;
}

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal } = useCart();
  const { createOrder, loading: orderLoading } = useOrder();
  const { showToast } = useApp();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedShippingId, setSelectedShippingId] = useState('standard');
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    phone: ''
  });

  const shippingOptions: ShippingOption[] = [
    { id: 'standard', name: 'Standard Delivery', price: 50, time: '3-5 business days' },
    { id: 'express', name: 'Express Delivery', price: 100, time: '1-2 business days' },
    { id: 'overnight', name: 'Overnight Delivery', price: 200, time: 'Next business day' }
  ];

  const selectedShipping = shippingOptions.find(option => option.id === selectedShippingId) || shippingOptions[0];
  const finalTotal = cartTotal + selectedShipping.price;

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
      
      // Auto-select default address or first address
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (data && data.length > 0) {
        setSelectedAddressId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      showToast('Failed to load addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAddress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([{
          user_id: user.id,
          ...newAddress,
          is_default: addresses.length === 0
        }])
        .select()
        .single();

      if (error) throw error;

      setAddresses([...addresses, data]);
      setSelectedAddressId(data.id);
      setShowAddressModal(false);
      setNewAddress({
        name: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        phone: ''
      });
      showToast('Address added successfully', 'success');
    } catch (error) {
      console.error('Error adding address:', error);
      showToast('Failed to add address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    console.log('Placing order with:', {
      cartItems: cartItems.length,
      shippingCost: selectedShipping.price,
      addressId: selectedAddressId
    });

    // Use the updated createOrder function
    await createOrder(cartItems, selectedShipping.price, selectedAddressId);
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
              <p className="text-gray-600 mb-6">You need to be signed in to checkout</p>
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Cart is Empty</h2>
              <p className="text-gray-600 mb-6">Add items to your cart before checkout</p>
              <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          {/* Checkout Confirmation Advertisement */}
          <div className="mb-8">
            <AdvertisementBanner placement="checkout_confirmation" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Address & Shipping */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No addresses found</p>
                      <Button onClick={() => setShowAddressModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Address
                      </Button>
                    </div>
                  ) : (
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                            <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                              <div>
                                <p className="font-medium">{address.name}</p>
                                <p className="text-sm text-gray-600">{address.street_address}</p>
                                <p className="text-sm text-gray-600">{address.city}, {address.state} {address.postal_code}</p>
                                {address.phone && <p className="text-sm text-gray-600">{address.phone}</p>}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddressModal(true)}
                    className="mt-4 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>
                </CardContent>
              </Card>

              {/* Shipping Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedShippingId} onValueChange={setSelectedShippingId}>
                    <div className="space-y-4">
                      {shippingOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{option.name}</p>
                                <p className="text-sm text-gray-600">{option.time}</p>
                              </div>
                              <span className="font-semibold">₹{option.price}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          {item.product?.image_urls && item.product.image_urls.length > 0 ? (
                            <img 
                              src={item.product.image_urls[0]} 
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span className="text-xs text-gray-500">IMG</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold">
                          ₹{item.product ? item.product.price * item.quantity : 0}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bill Summary */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping ({selectedShipping.name})</span>
                      <span className="font-medium">₹{selectedShipping.price}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₹{finalTotal}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={orderLoading || !selectedAddressId}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700"
                  >
                    {orderLoading ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Add Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add New Address</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowAddressModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                />
                <Input
                  placeholder="Street Address"
                  value={newAddress.street_address}
                  onChange={(e) => setNewAddress({...newAddress, street_address: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                  />
                  <Input
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Postal Code"
                    value={newAddress.postal_code}
                    onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                  />
                  <Input
                    placeholder="Phone (optional)"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddNewAddress}
                    disabled={!newAddress.name || !newAddress.street_address || !newAddress.city || !newAddress.state || !newAddress.postal_code}
                    className="flex-1"
                  >
                    Add Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutPage;
