import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useBuyNow } from '@/hooks/useBuyNow';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import ReviewsSection from '@/components/ReviewsSection';
import RecommendedProducts from '@/components/RecommendedProducts';

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
  slug: string;
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useApp();
  const { addToCart, loading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const { buyNow, loading: buyNowLoading } = useBuyNow();
  const { trackView, trackAddToCart } = useInteractionTracking();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
    }
  }, [slug]);

  // Track product view when component mounts
  useEffect(() => {
    if (product) {
      trackView(product.id, 'product', product.tags);
    }
  }, [product, trackView]);

  const fetchProduct = async (slug: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        showToast('Failed to load product details', 'error');
      } else {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Failed to load product details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!user) {
      showToast('Please sign in to add to cart', 'info');
      navigate('/auth');
      return;
    }

    if (product.stock < quantity) {
      showToast('Insufficient stock available', 'error');
      return;
    }

    await addToCart(product.id, quantity);
    
    // Track add to cart interaction
    trackAddToCart(product.id, product.tags);
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    if (!user) {
      showToast('Please sign in to add to wishlist', 'info');
      navigate('/auth');
      return;
    }

    await addToWishlist(product.id);
  };

  const handleRemoveFromWishlist = async () => {
    if (!product) return;
    await removeFromWishlist(product.id);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await buyNow(product, quantity);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
              <p>The requested product could not be found.</p>
              <Button onClick={() => navigate('/shop')} className="mt-4">
                Go to Shop
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const discountedPrice = product.mrp ? product.price : null;
  const discountPercentage = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : null;

  return (
    <Layout>
      <div className="container mx-auto mt-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <Card className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="p-4">
            {product.image_urls && product.image_urls.length > 0 ? (
              <img
                src={product.image_urls[selectedImageIndex]}
                alt={product.name}
                className="w-full h-auto rounded-lg object-cover aspect-square mb-4"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}

            {product.image_urls && product.image_urls.length > 1 && (
              <div className="flex overflow-x-auto space-x-2">
                {product.image_urls.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer ${index === selectedImageIndex ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <CardContent className="p-4">
            <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
            <div className="flex items-center mb-3">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm text-gray-600">4.5 (125 reviews)</span>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              {discountedPrice && product.mrp ? (
                <>
                  <span className="text-xl font-bold">₹{product.price}</span>
                  <span className="text-gray-500 line-through">₹{product.mrp}</span>
                  {discountPercentage && (
                    <Badge className="bg-green-500 text-white">
                      {discountPercentage}% off
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-xl font-bold">₹{product.price}</span>
              )}
            </div>

            <Separator className="mb-4" />

            <p className="text-gray-700 mb-4">{product.description}</p>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  className="px-2 py-1"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4">{quantity}</span>
                <Button
                  variant="ghost"
                  className="px-2 py-1"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {product.stock > 0 ? (
                <span className="text-green-500 text-sm">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-500 text-sm">Out of Stock</span>
              )}
            </div>

            <div className="flex space-x-4 mb-6">
              <Button
                className="flex-1 bg-black text-white hover:bg-gray-800"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || cartLoading}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                onClick={handleBuyNow}
                disabled={product.stock === 0 || buyNowLoading}
              >
                Buy Now
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              {isInWishlist(product.id) ? (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={handleRemoveFromWishlist}
                  disabled={wishlistLoading}
                >
                  <Heart className="h-5 w-5 mr-2 fill-red-500 text-red-500" />
                  Remove from Wishlist
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={handleAddToWishlist}
                  disabled={wishlistLoading}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Add to Wishlist
                </Button>
              )}
              <Button variant="ghost" className="rounded-full">
                <Share2 className="h-5 w-5" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        <ReviewsSection productId={product.id} />

        {/* Cross-Sell Recommendations */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-black mb-6">You might also like</h3>
          <RecommendedProducts 
            context="product" 
            tags={[product.category]} 
            limit={6}
            className="mb-8"
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
