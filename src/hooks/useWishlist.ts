
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  added_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image_urls: string[] | null;
    brand?: string | null;
    slug: string;
  };
}

interface Wishlist {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  wishlist_items?: WishlistItem[];
}

export const useWishlist = () => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all wishlists for the current user
  const fetchWishlists = async () => {
    if (!user) {
      setWishlists([]);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching wishlists for user:', user.id);
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          wishlist_items(
            *,
            product:products(
              id,
              name,
              price,
              image_urls,
              brand,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlists:', error);
        throw error;
      }
      
      console.log('Fetched wishlists:', data);
      setWishlists(data || []);
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      showToast('Failed to load wishlists', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add product to a specific wishlist
  const addToWishlist = async (productId: string, wishlistId?: string) => {
    if (!user) {
      showToast('Please sign in to add items to wishlist', 'error');
      return false;
    }

    try {
      let targetWishlistId = wishlistId;

      // If no wishlist specified, use or create default wishlist
      if (!targetWishlistId) {
        const defaultWishlist = wishlists.find(w => w.is_default);
        if (defaultWishlist) {
          targetWishlistId = defaultWishlist.id;
        } else {
          // Create default wishlist
          const { data: newWishlist, error: createError } = await supabase
            .from('wishlists')
            .insert({
              user_id: user.id,
              name: 'My Wishlist',
              is_default: true
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating default wishlist:', createError);
            throw createError;
          }
          
          targetWishlistId = newWishlist.id;
        }
      }

      // Check if item already exists in wishlist
      const { data: existingItem, error: checkError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', targetWishlistId)
        .eq('product_id', productId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing item:', checkError);
        throw checkError;
      }

      if (existingItem) {
        showToast('Item already in wishlist', 'info');
        return true;
      }

      // Add item to wishlist
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          wishlist_id: targetWishlistId,
          product_id: productId
        });

      if (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
      }

      showToast('Added to wishlist', 'success');
      await fetchWishlists();
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast('Failed to add item to wishlist', 'error');
      return false;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (itemId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
      }

      showToast('Removed from wishlist', 'info');
      await fetchWishlists();
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('Failed to remove item from wishlist', 'error');
      return false;
    }
  };

  // Check if a product is in any wishlist
  const isInWishlist = (productId: string) => {
    return wishlists.some(wishlist => 
      wishlist.wishlist_items?.some(item => item.product_id === productId)
    );
  };

  // Get total items across all wishlists
  const totalItems = wishlists.reduce((total, wishlist) => 
    total + (wishlist.wishlist_items?.length || 0), 0
  );

  // Effect for fetching wishlists when user changes
  useEffect(() => {
    if (!user) {
      setWishlists([]);
      return;
    }

    fetchWishlists();
  }, [user?.id]);

  return {
    wishlists,
    loading,
    addToWishlist,
    removeFromWishlist,
    refetch: fetchWishlists,
    isInWishlist,
    totalItems
  };
};
