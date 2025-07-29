
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserInteraction {
  user_id: string;
  event_type: 'view' | 'click' | 'add_to_cart' | 'purchase';
  item_id: string;
  item_type: 'product' | 'blog';
  tags?: string[];
}

export interface ProductRecommendation {
  product_id: string;
  name: string;
  thumbnail_url: string | null;
  price: number;
  tags: string[];
  score: number;
}

export interface RecommendationsResponse {
  success: boolean;
  data: ProductRecommendation[];
  context: string;
  user_id: string;
  total: number;
}

export const useRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackInteraction = async (interaction: UserInteraction): Promise<boolean> => {
    try {
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return false;
      }

      const response = await supabase.functions.invoke('interaction', {
        body: interaction,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track interaction';
      setError(errorMessage);
      return false;
    }
  };

  const getRecommendations = async (
    userId: string,
    options: {
      context?: string;
      tags?: string[];
      limit?: number;
    } = {}
  ): Promise<ProductRecommendation[]> => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        throw new Error('User ID is required for recommendations');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      // Construct the URL with all required parameters
      const params = new URLSearchParams({
        user_id: encodeURIComponent(userId),
        context: encodeURIComponent(options.context || 'general'),
        tags: encodeURIComponent(JSON.stringify(options.tags || [])),
        limit: (options.limit || 6).toString()
      });

      const response = await fetch(`https://ssjomyrovejejsjcffdr.supabase.co/functions/v1/recommendations?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzam9teXJvdmVqZWpzamNmZmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDAxNzksImV4cCI6MjA2NDY3NjE3OX0.uUbJ6MjtAInByS3X3m90qm5EFb4Ov3W9ODRGvvvGqIM',
          'Content-Type': 'application/json',
          'x-client-info': 'supabase-js-web/2.50.2'
        }
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400) {
          const errorText = await response.text();
          console.error('Recommendations API 400 error:', errorText);
          throw new Error('Invalid request parameters');
        } else if (response.status === 429) {
          console.error('Recommendations API rate limited');
          throw new Error('Service temporarily unavailable');
        } else if (response.status >= 500) {
          console.error('Recommendations API server error:', response.status);
          throw new Error('Service temporarily unavailable');
        } else {
          const errorText = await response.text();
          console.error('Recommendations API error:', response.status, errorText);
          throw new Error(`Service error: ${response.status}`);
        }
      }

      const result: RecommendationsResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to get recommendations');
      }

      return result.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendations';
      setError(errorMessage);
      
      // Log error once for debugging, then return empty array to trigger fallback
      if (err instanceof Error && (
        err.message.includes('400') || 
        err.message.includes('429') || 
        err.message.includes('Service')
      )) {
        console.error('Recommendations service error, using fallback:', err.message);
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendationsCache = async (userId?: string): Promise<boolean> => {
    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await supabase.functions.invoke('refresh-recommendations', {
        body: userId ? { user_id: userId } : {},
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh recommendations cache';
      setError(errorMessage);
      return false;
    }
  };

  return {
    loading,
    error,
    trackInteraction,
    getRecommendations,
    refreshRecommendationsCache
  };
};
