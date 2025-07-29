
import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import ProductCard from './ProductCard';
import RecommendedProducts from './RecommendedProducts';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { products, loading } = useProducts({
    limit: 8, // Only show 8 products (4x2 grid)
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  if (loading) {
    return (
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-light text-black mb-16 text-center tracking-tight">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse border-gray-100 rounded-2xl">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gray-100 rounded-xl mb-6"></div>
                  <div className="h-4 bg-gray-100 rounded-full mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl lg:text-5xl font-light text-black mb-6 tracking-tight">
            {user ? 'Recommended for You' : 'Featured Products'}
          </h2>
          <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            {user 
              ? 'Discover products curated just for you based on your preferences and browsing history.'
              : 'Discover our curated selection of premium healthcare products, carefully chosen for your wellness journey.'
            }
          </p>
        </div>
        
        {user ? (
          <>
            {/* Personalized Recommendations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-16">
              <RecommendedProducts 
                context="home" 
                limit={8}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
              />
            </div>
          </>
        ) : (
          <>
            {/* Generic Featured Products for Anonymous Users */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-16">
                  {products.slice(0, 8).map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No Results</span>
                </div>
                <h3 className="text-2xl font-light text-black mb-4">No products available</h3>
                <p className="text-gray-600 text-lg">Check back soon for our featured collection.</p>
              </div>
            )}
          </>
        )}
        
        {/* View All Products Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/shop')}
            className="group px-12 py-4 bg-black hover:bg-gray-800 text-white font-medium 
                     rounded-full transition-all duration-300 hover:scale-105 
                     focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                     text-lg shadow-lg hover:shadow-xl"
          >
            <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
              View All Products
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
