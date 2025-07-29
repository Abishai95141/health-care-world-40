
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBanners } from '@/contexts/BannerContext';
import { ShoppingCart, Plus } from 'lucide-react';

const CartFooterBanner = () => {
  const { getBannersByPlacement } = useBanners();
  const banners = getBannersByPlacement('cart_footer');

  if (banners.length === 0) return null;

  const banner = banners[0];

  // Mock recommended products for demonstration
  const recommendedProducts = [
    { id: 1, name: 'Vitamin D3', price: 299, image: '/placeholder.svg' },
    { id: 2, name: 'Omega 3', price: 599, image: '/placeholder.svg' },
    { id: 3, name: 'Multivitamin', price: 799, image: '/placeholder.svg' },
    { id: 4, name: 'Calcium', price: 399, image: '/placeholder.svg' },
  ];

  return (
    <div className="mt-8 animate-fade-in">
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200 rounded-2xl shadow-xl p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{banner.headline}</h3>
          {banner.subtext && (
            <p className="text-gray-600">{banner.subtext}</p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-gray-50 rounded-xl p-4 transition-all duration-300 hover:bg-white hover:shadow-lg hover:scale-105"
            >
              <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              
              <h4 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h4>
              <p className="text-green-600 font-semibold text-sm mb-3">₹{product.price}</p>
              
              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CartFooterBanner;
