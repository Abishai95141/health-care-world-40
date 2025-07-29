
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/hooks/useCart';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    tags?: string[];
  };
}

export const useOrder = () => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const { clearCart } = useCart();
  const { trackPurchase } = useInteractionTracking();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const createOrder = async (
    cartItems: CartItem[],
    shippingCost: number,
    addressId?: string
  ) => {
    if (!user) {
      showToast('Please sign in to place order', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating order with cart items:', cartItems.length);

      // Use the place_order database function
      const { data, error } = await supabase.rpc('place_order', {
        cart_user_id: user.id,
        shipping_cost: shippingCost,
        order_address_id: addressId || null
      });

      if (error) {
        console.error('Database function error:', error);
        throw error;
      }

      const result = data[0];
      
      if (!result.success) {
        throw new Error(result.error_message);
      }

      console.log('Order created successfully:', result.order_id);

      // Track purchase interactions for all items
      for (const item of cartItems) {
        if (item.product) {
          trackPurchase(item.product.id, item.product.tags || []);
        }
      }

      showToast('Order placed successfully!', 'success');
      navigate(`/order-confirmation/${result.order_id}`);
      
      return result.order_id;
    } catch (error) {
      console.error('Error creating order:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to place order',
        'error'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    loading
  };
};
