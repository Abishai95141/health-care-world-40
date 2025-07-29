
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Package, Truck, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusSteps = [
  { key: 'pending', label: 'Ordered', icon: Package },
  { key: 'confirmed', label: 'Packed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle }
];

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);
  const activeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  const subtotal = order.total_amount - order.shipping_amount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
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
                  <h2 className="text-xl font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
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

            <div className="px-6 py-6 space-y-8">
              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-gray-50 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-6 text-gray-900">Order Progress</h3>
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-out"
                          style={{ width: `${(activeStepIndex / (statusSteps.length - 1)) * 100}%` }}
                        />
                      </div>
                      
                      {/* Steps */}
                      <div className="flex justify-between relative">
                        {statusSteps.map((step, index) => {
                          const isActive = index <= activeStepIndex;
                          const isCurrent = index === activeStepIndex;
                          const StepIcon = step.icon;
                          
                          return (
                            <div key={step.key} className="flex flex-col items-center">
                              <div 
                                className={`
                                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                                  ${isActive 
                                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg' 
                                    : 'bg-gray-200 text-gray-400'
                                  }
                                  ${isCurrent ? 'animate-pulse ring-4 ring-green-200' : ''}
                                `}
                              >
                                <StepIcon className="h-5 w-5" />
                              </div>
                              <p className={`mt-2 text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                {step.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Items List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Items</h3>
                <div className="space-y-3">
                  {order.order_items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-2xl">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                              {item.product.image_urls && item.product.image_urls[0] ? (
                                <img 
                                  src={item.product.image_urls[0]} 
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                              <p className="text-sm text-gray-500">
                                {item.quantity} × ₹{item.unit_price.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{item.total_price.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Billing Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-gray-50 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Billing Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>₹{order.shipping_amount.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Total</span>
                          <span>₹{order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Shipping Address */}
              {order.address && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-gray-50 to-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <MapPin className="h-5 w-5 mr-2" />
                          Shipping Address
                        </h3>
                        <Button variant="ghost" size="sm" disabled className="text-gray-400">
                          Edit
                        </Button>
                      </div>
                      <div className="text-gray-600 space-y-1">
                        <p className="font-medium text-gray-900">{order.address.name}</p>
                        <p>{order.address.street_address}</p>
                        <p>{order.address.city}, {order.address.state} {order.address.postal_code}</p>
                        {order.address.phone && <p>{order.address.phone}</p>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
