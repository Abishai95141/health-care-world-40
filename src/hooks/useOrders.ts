
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    id: string;
    name: string;
    image_urls: string[] | null;
  };
}

interface Order {
  id: string;
  total_amount: number;
  shipping_amount: number;
  status: string;
  created_at: string;
  item_count: number;
  shipping_address: string;
  order_items: OrderItem[];
  address: {
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    name: string;
    phone: string | null;
  } | null;
}

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching orders for user:', user.id);
        
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            shipping_amount,
            status,
            created_at,
            addresses!orders_address_id_fkey (
              street_address,
              city,
              state,
              postal_code,
              name,
              phone
            ),
            order_items (
              id,
              quantity,
              unit_price,
              total_price,
              products (
                id,
                name,
                image_urls
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          throw ordersError;
        }

        console.log('Fetched orders data:', ordersData);

        const formattedOrders: Order[] = (ordersData || []).map(order => ({
          id: order.id,
          total_amount: order.total_amount,
          shipping_amount: order.shipping_amount || 50,
          status: order.status,
          created_at: order.created_at,
          item_count: order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
          shipping_address: order.addresses 
            ? `${order.addresses.street_address}, ${order.addresses.city}`
            : 'Address not available',
          order_items: order.order_items?.map(item => ({
            id: item.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            product: {
              id: item.products?.id || '',
              name: item.products?.name || 'Unknown Product',
              image_urls: item.products?.image_urls || null
            }
          })) || [],
          address: order.addresses
        }));

        setOrders(formattedOrders);
        setError(null);
      } catch (err: any) {
        console.error('Error in fetchOrders:', err);
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return { orders, loading, error };
};
