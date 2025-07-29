
import { useState } from 'react';
import { useCart } from './useCart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export const useBuyNow = () => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const buyNow = async (product: Product, quantity: number = 1) => {
    if (!user) {
      showToast('Please sign in to continue', 'error');
      navigate('/auth');
      return;
    }

    if (product.stock < quantity) {
      showToast('Insufficient stock available', 'error');
      return;
    }

    setLoading(true);
    try {
      // Clear any existing cart items for this user to avoid conflicts
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      // Add the single item to cart
      const { error: cartError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity
        });

      if (cartError) {
        console.error('Error adding to cart for buy now:', cartError);
        throw cartError;
      }

      // Navigate directly to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Error in buy now flow:', error);
      showToast('Failed to proceed to checkout', 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    buyNow,
    loading
  };
};
