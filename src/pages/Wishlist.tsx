
import React from 'react';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import Layout from '@/components/Layout';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlists, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleRemoveItem = async (itemId: string) => {
    await removeFromWishlist(itemId);
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 pt-24 py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const hasItems = wishlists.some(wishlist => wishlist.wishlist_items && wishlist.wishlist_items.length > 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-24 py-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">My Wishlist</h1>
            <p className="text-gray-600 text-lg">Save your favorite products for later</p>
          </div>

          {!hasItems ? (
            /* Empty State */
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardContent className="text-center py-16">
                <div className="relative inline-block mb-8">
                  <Heart className="h-20 w-20 text-gray-300 mx-auto" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-200/20 to-pink-300/20 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-2xl font-bold text-black mb-4">Your wishlist is empty</h2>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  Start adding products you love to your wishlist. You can save items for later and easily find them here.
                </p>
                <Button 
                  onClick={() => navigate('/shop')}
                  className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg rounded-full hover:scale-105 transition-all duration-200"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Wishlist Content */
            <div className="space-y-8">
              {wishlists.map((wishlist) => (
                <div key={wishlist.id}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-black flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-500" />
                      {wishlist.name}
                      {wishlist.is_default && (
                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </h2>
                    <span className="text-gray-500 text-sm">
                      {wishlist.wishlist_items?.length || 0} item{(wishlist.wishlist_items?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {wishlist.wishlist_items && wishlist.wishlist_items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {wishlist.wishlist_items.map((item) => (
                        <Card key={item.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                          <div className="relative">
                            <img
                              src={item.product?.image_urls?.[0] || '/placeholder.svg'}
                              alt={item.product?.name}
                              className="w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                              onClick={() => item.product?.slug && handleProductClick(item.product.slug)}
                            />
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                            >
                              <X className="h-4 w-4 text-gray-600 hover:text-red-500" />
                            </button>
                          </div>
                          
                          <CardContent className="p-4 space-y-3">
                            {item.product?.brand && (
                              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                                {item.product.brand}
                              </p>
                            )}
                            
                            <h3 
                              className="font-semibold text-black line-clamp-2 cursor-pointer hover:text-green-600 transition-colors"
                              onClick={() => item.product?.slug && handleProductClick(item.product.slug)}
                            >
                              {item.product?.name}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-black">
                                ₹{item.product?.price}
                              </span>
                            </div>
                            
                            <Button
                              onClick={() => item.product?.id && handleAddToCart(item.product.id)}
                              className="w-full bg-black text-white hover:bg-white hover:text-black hover:border-black border-2 border-transparent rounded-lg transition-all duration-200 hover:scale-105"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-0 shadow-lg rounded-2xl">
                      <CardContent className="text-center py-12">
                        <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">This wishlist is empty</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
