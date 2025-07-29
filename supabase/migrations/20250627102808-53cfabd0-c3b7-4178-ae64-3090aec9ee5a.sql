
-- Remove RLS policies from blog_posts table to allow staff full access
DROP POLICY IF EXISTS "Staff can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;

-- Disable RLS on blog_posts table
ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;

-- Remove RLS policies from blog_comments table
DROP POLICY IF EXISTS "Public can view approved comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.blog_comments;

-- Disable RLS on blog_comments table  
ALTER TABLE public.blog_comments DISABLE ROW LEVEL SECURITY;

-- Remove RLS policies from blog_categories table
DROP POLICY IF EXISTS "Anyone can view categories" ON public.blog_categories;

-- Disable RLS on blog_categories table
ALTER TABLE public.blog_categories DISABLE ROW LEVEL SECURITY;

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create permissive storage policies for blog images
CREATE POLICY "Anyone can view blog images" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can upload blog images" ON storage.objects  
FOR INSERT WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Anyone can update blog images" ON storage.objects
FOR UPDATE USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can delete blog images" ON storage.objects
FOR DELETE USING (bucket_id = 'blog-images');
