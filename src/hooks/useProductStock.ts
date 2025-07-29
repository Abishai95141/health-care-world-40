
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProductStock = (productId: string) => {
  const [stock, setStock] = useState<number | null>(null);

  useEffect(() => {
    if (!productId) return;

    // Fetch initial stock
    const fetchStock = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (!error && data) {
        setStock(data.stock);
      }
    };

    fetchStock();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`product-stock-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`
        },
        (payload) => {
          console.log('Stock updated for product:', productId, payload);
          if (payload.new && typeof payload.new.stock === 'number') {
            setStock(payload.new.stock);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return stock;
};
