
import { useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRecommendations } from '@/hooks/useRecommendations';

interface TrackingState {
  [key: string]: boolean;
}

export const useInteractionTracking = () => {
  const { user } = useAuth();
  const { trackInteraction } = useRecommendations();
  const debounceRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const sessionTrackedRef = useRef<TrackingState>({});

  const trackWithDebounce = useCallback((
    eventType: 'view' | 'click' | 'add_to_cart' | 'purchase',
    itemId: string,
    itemType: 'product' | 'blog',
    tags?: string[]
  ) => {
    if (!user) return;

    const trackingKey = `${eventType}_${itemId}_${itemType}`;
    
    // Throttle: only track once per item per session for views
    if (eventType === 'view' && sessionTrackedRef.current[trackingKey]) {
      return;
    }

    // Clear existing debounce
    if (debounceRef.current[trackingKey]) {
      clearTimeout(debounceRef.current[trackingKey]);
    }

    // Set new debounce
    debounceRef.current[trackingKey] = setTimeout(async () => {
      try {
        await trackInteraction({
          user_id: user.id,
          event_type: eventType,
          item_id: itemId,
          item_type: itemType,
          tags: tags || []
        });

        // Mark as tracked for this session
        if (eventType === 'view') {
          sessionTrackedRef.current[trackingKey] = true;
        }

        console.log(`Tracked ${eventType} interaction for ${itemType} ${itemId}`);
      } catch (error) {
        console.error('Failed to track interaction:', error);
      }

      // Clean up debounce reference
      delete debounceRef.current[trackingKey];
    }, 1000); // 1 second debounce

  }, [user, trackInteraction]);

  const trackView = useCallback((itemId: string, itemType: 'product' | 'blog', tags?: string[]) => {
    trackWithDebounce('view', itemId, itemType, tags);
  }, [trackWithDebounce]);

  const trackClick = useCallback((itemId: string, itemType: 'product' | 'blog', tags?: string[]) => {
    trackWithDebounce('click', itemId, itemType, tags);
  }, [trackWithDebounce]);

  const trackAddToCart = useCallback((itemId: string, tags?: string[]) => {
    trackWithDebounce('add_to_cart', itemId, 'product', tags);
  }, [trackWithDebounce]);

  const trackPurchase = useCallback((itemId: string, tags?: string[]) => {
    trackWithDebounce('purchase', itemId, 'product', tags);
  }, [trackWithDebounce]);

  return {
    trackView,
    trackClick,
    trackAddToCart,
    trackPurchase
  };
};
