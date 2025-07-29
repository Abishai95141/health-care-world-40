
-- Create enum types for user interactions
CREATE TYPE event_type AS ENUM ('view', 'click', 'add_to_cart', 'purchase');
CREATE TYPE item_type AS ENUM ('product', 'blog');

-- Create user_interactions table
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type event_type NOT NULL,
  item_id UUID NOT NULL,
  item_type item_type NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_user_interactions_user_event_time 
ON public.user_interactions (user_id, event_type, created_at DESC);

CREATE INDEX idx_user_interactions_tags 
ON public.user_interactions USING GIN (tags);

CREATE INDEX idx_user_interactions_item 
ON public.user_interactions (item_id, item_type);

-- Create user_recommendations table for caching
CREATE TABLE public.user_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Index for fast lookups
CREATE INDEX idx_user_recommendations_user_score 
ON public.user_recommendations (user_id, score DESC);

-- Enable RLS on new tables
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_interactions
CREATE POLICY "Users can insert their own interactions" 
  ON public.user_interactions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions" 
  ON public.user_interactions 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for user_recommendations
CREATE POLICY "Users can view their own recommendations" 
  ON public.user_recommendations 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage recommendations" 
  ON public.user_recommendations 
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to calculate user preferences by tags
CREATE OR REPLACE FUNCTION public.get_user_tag_preferences(target_user_id UUID)
RETURNS TABLE(tag TEXT, score NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unnest(ui.tags) as tag,
    SUM(
      CASE ui.event_type
        WHEN 'purchase' THEN 3.0
        WHEN 'add_to_cart' THEN 2.0
        WHEN 'click' THEN 1.0
        WHEN 'view' THEN 0.5
        ELSE 0.1
      END
    ) as score
  FROM public.user_interactions ui
  WHERE ui.user_id = target_user_id
    AND ui.created_at >= NOW() - INTERVAL '90 days'
  GROUP BY unnest(ui.tags)
  ORDER BY score DESC;
END;
$$;

-- Function to get product recommendations
CREATE OR REPLACE FUNCTION public.get_product_recommendations(
  target_user_id UUID,
  context_tags TEXT[] DEFAULT '{}',
  limit_count INTEGER DEFAULT 6
)
RETURNS TABLE(
  product_id UUID,
  name TEXT,
  price NUMERIC,
  image_url TEXT,
  tags TEXT[],
  recommendation_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_preferences RECORD;
  collaborative_weight NUMERIC := 0.6;
  content_weight NUMERIC := 0.4;
BEGIN
  RETURN QUERY
  WITH user_tag_scores AS (
    SELECT * FROM public.get_user_tag_preferences(target_user_id)
  ),
  product_scores AS (
    SELECT 
      p.id,
      p.name,
      p.price,
      CASE 
        WHEN p.image_urls IS NOT NULL AND array_length(p.image_urls, 1) > 0 
        THEN p.image_urls[1] 
        ELSE NULL 
      END as image_url,
      p.tags,
      -- Content-based scoring: match with user's tag preferences
      COALESCE(
        (
          SELECT SUM(uts.score * 
            CASE 
              WHEN p.tags && ARRAY[uts.tag] THEN 1.0 
              ELSE 0.0 
            END
          ) 
          FROM user_tag_scores uts
        ), 0
      ) * content_weight +
      -- Collaborative filtering: global popularity of products with similar tags
      COALESCE(
        (
          SELECT COUNT(*) * 0.1
          FROM public.user_interactions ui2
          WHERE ui2.item_id = p.id 
            AND ui2.item_type = 'product'
            AND ui2.created_at >= NOW() - INTERVAL '30 days'
        ), 0
      ) * collaborative_weight +
      -- Boost for context tags (e.g., from current blog post)
      CASE 
        WHEN array_length(context_tags, 1) > 0 AND p.tags && context_tags 
        THEN 2.0 
        ELSE 0.0 
      END as recommendation_score
    FROM public.products p
    WHERE p.is_active = true
      AND p.stock > 0
      AND p.id NOT IN (
        -- Exclude products user already purchased
        SELECT DISTINCT ui.item_id 
        FROM public.user_interactions ui 
        WHERE ui.user_id = target_user_id 
          AND ui.event_type = 'purchase' 
          AND ui.item_type = 'product'
      )
  )
  SELECT 
    ps.id,
    ps.name,
    ps.price,
    ps.image_url,
    ps.tags,
    ps.recommendation_score
  FROM product_scores ps
  WHERE ps.recommendation_score > 0
  ORDER BY ps.recommendation_score DESC, ps.price ASC
  LIMIT limit_count;
END;
$$;

-- Function to refresh user recommendations cache
CREATE OR REPLACE FUNCTION public.refresh_user_recommendations(target_user_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  processed_count INTEGER := 0;
  user_record RECORD;
  rec_record RECORD;
BEGIN
  -- If no specific user, process all users with recent activity
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM public.user_interactions 
    WHERE (target_user_id IS NULL OR user_id = target_user_id)
      AND created_at >= NOW() - INTERVAL '7 days'
  LOOP
    -- Delete old recommendations for this user
    DELETE FROM public.user_recommendations 
    WHERE user_id = user_record.user_id;
    
    -- Insert new recommendations
    FOR rec_record IN
      SELECT * FROM public.get_product_recommendations(user_record.user_id, '{}', 10)
    LOOP
      INSERT INTO public.user_recommendations (
        user_id, product_id, score, tags, updated_at
      ) VALUES (
        user_record.user_id,
        rec_record.product_id,
        rec_record.recommendation_score,
        rec_record.tags,
        NOW()
      );
    END LOOP;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$;
