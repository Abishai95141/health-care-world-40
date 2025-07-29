
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RecommendedProductsProps {
  context: string;
  tags?: string[];
  limit?: number;
  className?: string;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  context,
  tags = [],
  limit = 6,
  className = ''
}) => {
  const { user } = useAuth();
  const { getRecommendations, loading: recLoading, error: recError } = useRecommendations();
  const { products: fallbackProducts, loading: fallbackLoading } = useProducts({
    limit,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Stable cache key for recommendations
  const cacheKey = useMemo(() => 
    `recs_${user?.id || 'anon'}_${context}_${tags.join(',')}_${limit}`, 
    [user?.id, context, tags, limit]
  );

  // Stable tags string for dependency array
  const tagsString = useMemo(() => JSON.stringify(tags), [tags]);

  // Single useEffect to handle all recommendation fetching
  useEffect(() => {
    let mounted = true;
    
    const fetchRecommendations = async () => {
      if (!mounted) return;
      
      // Throttle: prevent fetching more than once every 5 minutes
      const now = Date.now();
      if (now - lastFetchTime < 5 * 60 * 1000) {
        // Check cache first
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          setRecommendations(JSON.parse(cached));
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        // Check cache first (5 minutes)
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
        
        if (cached && cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age < 5 * 60 * 1000) { // 5 minutes
            if (mounted) {
              setRecommendations(JSON.parse(cached));
              setLoading(false);
            }
            return;
          }
        }

        if (user) {
          // Get personalized recommendations
          const recs = await getRecommendations(user.id, { context, tags, limit });
          
          if (mounted) {
            if (recs && recs.length > 0) {
              // Transform to match product structure
              const products = recs.map(rec => ({
                id: rec.product_id,
                name: rec.name,
                price: rec.price,
                image_urls: rec.thumbnail_url ? [rec.thumbnail_url] : null,
                tags: rec.tags,
                // Add default fields that ProductCard expects
                slug: `product-${rec.product_id}`,
                stock: 1, // Assume in stock for recommendations
                brand: null,
                mrp: null,
                requires_prescription: false
              }));
              
              setRecommendations(products);
              
              // Cache the results
              sessionStorage.setItem(cacheKey, JSON.stringify(products));
              sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
            } else {
              // Fall back to generic products
              setRecommendations(fallbackProducts);
            }
            setLastFetchTime(now);
          }
        } else {
          // Use fallback products for anonymous users
          if (mounted) {
            setRecommendations(fallbackProducts);
          }
        }
      } catch (err) {
        console.error('Error fetching recommendations, falling back to generic products:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load recommendations');
          // Fall back to generic products on error
          setRecommendations(fallbackProducts);
          setLastFetchTime(now);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Only fetch if we have the necessary data
    if (fallbackProducts.length > 0 || user) {
      fetchRecommendations();
    }

    return () => {
      mounted = false;
    };
  }, [user?.id, context, tagsString, limit, cacheKey, getRecommendations, fallbackProducts, lastFetchTime]);

  // Show loading skeleton
  if (loading || recLoading || (fallbackLoading && recommendations.length === 0)) {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show recommendations or fallback
  const productsToShow = recommendations.slice(0, limit);

  if (productsToShow.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">No recommendations available</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {productsToShow.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in hover:scale-[1.02] transition-all duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default RecommendedProducts;
