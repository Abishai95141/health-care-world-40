
-- Fix RLS policies for products table to allow staff operations
-- First, drop all existing problematic policies
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Staff can manage all products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Staff can view all products" ON public.products;
DROP POLICY IF EXISTS "Staff can insert products" ON public.products;
DROP POLICY IF EXISTS "Staff can update products" ON public.products;
DROP POLICY IF EXISTS "Staff can delete products" ON public.products;

-- Create a more reliable staff check function
CREATE OR REPLACE FUNCTION public.is_current_user_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.staff_users s
    WHERE s.email = current_setting('request.jwt.claims', true)::json->>'email'
  );
$$;

-- Create new, working RLS policies for products
-- Allow public to view active products (for storefront)
CREATE POLICY "Public can view active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

-- Allow staff users to manage all products (insert, update, delete, select)
CREATE POLICY "Staff can manage all products" 
  ON public.products 
  FOR ALL
  TO authenticated
  USING (public.is_current_user_staff())
  WITH CHECK (public.is_current_user_staff());

-- Fix product_import_logs policies
DROP POLICY IF EXISTS "Authenticated users can manage import logs" ON public.product_import_logs;
DROP POLICY IF EXISTS "Staff can view their own import logs" ON public.product_import_logs;
DROP POLICY IF EXISTS "Staff can insert import logs" ON public.product_import_logs;
DROP POLICY IF EXISTS "Staff can update their own import logs" ON public.product_import_logs;
DROP POLICY IF EXISTS "Staff can manage import logs" ON public.product_import_logs;

-- Create new policy for import logs
CREATE POLICY "Staff can manage import logs" 
  ON public.product_import_logs 
  FOR ALL
  TO authenticated
  USING (public.is_current_user_staff())
  WITH CHECK (public.is_current_user_staff());
