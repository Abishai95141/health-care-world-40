
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  image_urls: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  manufacturer: string | null;
  requires_prescription: boolean;
  unit: string;
  weight_volume: string | null;
  tags: string[] | null;
  expiration_date: string | null;
}

interface UseProductsParams {
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export const useProducts = (params: UseProductsParams = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const {
    limit,
    sortBy = 'created_at',
    sortOrder = 'desc',
    searchQuery,
    category,
    page = 1,
    pageSize = 20
  } = params;

  useEffect(() => {
    fetchProducts();
  }, [limit, sortBy, sortOrder, searchQuery, category, page, pageSize]);

  // Subscribe to real-time updates for stock changes
  useEffect(() => {
    const channel = supabase
      .channel('products-stock-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product updated:', payload);
          // Update the specific product in our local state
          setProducts(prevProducts => 
            prevProducts.map(product => 
              product.id === payload.new.id 
                ? { ...product, stock: payload.new.stock, updated_at: payload.new.updated_at }
                : product
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply search filter
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply category filter
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination or limit
      if (limit) {
        query = query.limit(limit);
      } else {
        const offset = (page - 1) * pageSize;
        query = query.range(offset, offset + pageSize - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    totalCount,
    refetch: fetchProducts
  };
};

export const useSingleProduct = (slug: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    product,
    loading,
    refetch: fetchProduct
  };
};
