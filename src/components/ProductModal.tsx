import React, { useState } from 'react';
import { X, Heart, ShoppingCart, Star, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useBuyNow } from '@/hooks/useBuyNow';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  description: string;
  image_urls: string[] | null;
  stock: number;
  category: string;
  brand?: string;
  unit: string;
  weight_volume?: string;
  manufacturer?: string;
  requires_prescription: boolean;
  tags?: string[];
}

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const { buyNow, loading: buyNowLoading } = useBuyNow();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) {
    return null;
  }

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      alert('Please sign in to add to wishlist');
      return;
    }

    await addToWishlist(product.id);
  };

  const handleRemoveFromWishlist = async () => {
    await removeFromWishlist(product.id);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleBuyNow = async () => {
    await buyNow(product, quantity);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        {product.name}
                      </h3>
                      <Button onClick={onClose} variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Image Carousel */}
                        <div className="md:col-span-1">
                          {product.image_urls && product.image_urls.length > 0 ? (
                            <img
                              src={product.image_urls[selectedImageIndex]}
                              alt={product.name}
                              className="w-full h-64 object-contain rounded-md"
                            />
                          ) : (
                            <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center">
                              <span>No Image</span>
                            </div>
                          )}
                          {product.image_urls && product.image_urls.length > 1 && (
                            <div className="flex mt-2 -mx-2 overflow-x-auto">
                              {product.image_urls.map((imageUrl, index) => (
                                <div
                                  key={index}
                                  className={`w-20 h-20 mx-2 rounded-md overflow-hidden flex-shrink-0 cursor-pointer ${index === selectedImageIndex ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                  onClick={() => setSelectedImageIndex(index)}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`${product.name} - ${index}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="md:col-span-1">
                          <div className="mb-4">
                            <h4 className="text-xl font-semibold">{product.name}</h4>
                            <div className="flex items-center mt-1">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <Star className="h-4 w-4 text-gray-300 mr-1" />
                              <span className="text-sm text-gray-500">4.0 (125 reviews)</span>
                            </div>
                            <div className="flex items-center mt-2">
                              {product.stock > 10 ? (
                                <Badge variant="outline">In Stock</Badge>
                              ) : product.stock > 0 ? (
                                <Badge className="bg-yellow-500 text-white">Low Stock</Badge>
                              ) : (
                                <Badge variant="destructive">Out of Stock</Badge>
                              )}
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center">
                              <span className="text-2xl font-bold mr-2">₹{product.price}</span>
                              {product.mrp && product.mrp > product.price && (
                                <span className="text-gray-500 line-through">₹{product.mrp}</span>
                              )}
                            </div>
                            <p className="text-gray-700">{product.description}</p>
                          </div>

                          {product.stock > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">Quantity:</span>
                                <div className="flex items-center">
                                  <Button
                                    onClick={decrementQuantity}
                                    variant="ghost"
                                    size="icon"
                                    disabled={quantity <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="mx-2">{quantity}</span>
                                  <Button
                                    onClick={incrementQuantity}
                                    variant="ghost"
                                    size="icon"
                                    disabled={quantity >= product.stock}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between">
                            {isInWishlist(product.id) ? (
                              <Button
                                variant="secondary"
                                onClick={handleRemoveFromWishlist}
                                disabled={wishlistLoading}
                              >
                                Remove from Wishlist
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={handleAddToWishlist}
                                disabled={wishlistLoading || !user}
                              >
                                Add to Wishlist
                              </Button>
                            )}
                            {product.stock > 0 ? (
                              <>
                                <Button
                                  onClick={handleAddToCart}
                                  disabled={cartLoading}
                                >
                                  Add to Cart
                                </Button>
                                <Button
                                  onClick={handleBuyNow}
                                  disabled={buyNowLoading}
                                >
                                  Buy Now
                                </Button>
                              </>
                            ) : (
                              <Button disabled>Out of Stock</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductModal;
