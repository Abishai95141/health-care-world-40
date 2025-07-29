
import { UserInteraction } from '@/hooks/useRecommendations';

export const createInteractionEvent = (
  userId: string,
  eventType: UserInteraction['event_type'],
  itemId: string,
  itemType: UserInteraction['item_type'],
  tags?: string[]
): UserInteraction => {
  return {
    user_id: userId,
    event_type: eventType,
    item_id: itemId,
    item_type: itemType,
    tags: tags || []
  };
};

export const getProductTags = (product: any): string[] => {
  if (!product.tags) return [];
  return Array.isArray(product.tags) ? product.tags : [];
};

export const getBlogTags = (blogPost: any): string[] => {
  const tags: string[] = [];
  
  // Extract tags from blog post tags relationship
  if (blogPost.tags && Array.isArray(blogPost.tags)) {
    tags.push(...blogPost.tags.map((tag: any) => tag.name || tag));
  }
  
  // Extract category as a tag
  if (blogPost.category?.name) {
    tags.push(blogPost.category.name);
  }
  
  // Extract keywords from title (simple approach)
  if (blogPost.title) {
    const titleWords = blogPost.title
      .toLowerCase()
      .split(/\s+/)
      .filter((word: string) => word.length > 3)
      .slice(0, 3); // Take first 3 significant words
    tags.push(...titleWords);
  }
  
  return [...new Set(tags)]; // Remove duplicates
};

export const trackProductView = async (
  userId: string,
  productId: string,
  productTags: string[],
  trackFn: (interaction: UserInteraction) => Promise<boolean>
) => {
  const interaction = createInteractionEvent(
    userId,
    'view',
    productId,
    'product',
    productTags
  );
  return await trackFn(interaction);
};

export const trackProductClick = async (
  userId: string,
  productId: string,
  productTags: string[],
  trackFn: (interaction: UserInteraction) => Promise<boolean>
) => {
  const interaction = createInteractionEvent(
    userId,
    'click',
    productId,
    'product',
    productTags
  );
  return await trackFn(interaction);
};

export const trackAddToCart = async (
  userId: string,
  productId: string,
  productTags: string[],
  trackFn: (interaction: UserInteraction) => Promise<boolean>
) => {
  const interaction = createInteractionEvent(
    userId,
    'add_to_cart',
    productId,
    'product',
    productTags
  );
  return await trackFn(interaction);
};

export const trackPurchase = async (
  userId: string,
  productId: string,
  productTags: string[],
  trackFn: (interaction: UserInteraction) => Promise<boolean>
) => {
  const interaction = createInteractionEvent(
    userId,
    'purchase',
    productId,
    'product',
    productTags
  );
  return await trackFn(interaction);
};

export const trackBlogView = async (
  userId: string,
  blogId: string,
  blogTags: string[],
  trackFn: (interaction: UserInteraction) => Promise<boolean>
) => {
  const interaction = createInteractionEvent(
    userId,
    'view',
    blogId,
    'blog',
    blogTags
  );
  return await trackFn(interaction);
};
