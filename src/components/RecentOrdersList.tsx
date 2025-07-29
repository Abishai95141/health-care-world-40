
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useOrders } from '@/hooks/useOrders';
import { OrderDetailDrawer } from './OrderDetailDrawer';

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

export const RecentOrdersList: React.FC = () => {
  const { orders, loading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="border-0 shadow-lg rounded-2xl animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-2">Failed to load orders</div>
          <p className="text-gray-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="relative inline-block mb-6">
            <Package className="h-16 w-16 text-gray-300 mx-auto animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200/20 to-gray-300/20 
                          rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-900 text-xl font-light mb-2">No orders yet</p>
          <p className="text-gray-600 mb-6">Your order history will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl 
                         cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white/90"
              onClick={() => handleOrderClick(order)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        Order #{order.id.slice(0, 8)}
                      </h4>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        ₹{order.total_amount.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm truncate max-w-64">
                          {order.shipping_address}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
};
