
-- Simplify RLS policies by removing all complex checks
-- Drop all existing policies on products table
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Staff can manage all products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;

-- Drop all existing policies on product_import_logs table
DROP POLICY IF EXISTS "Staff can manage import logs" ON public.product_import_logs;
DROP POLICY IF EXISTS "Authenticated users can manage import logs" ON public.product_import_logs;

-- Create very simple policies that allow operations without complex checks
-- Allow anyone to view active products (for public storefront)
CREATE POLICY "Anyone can view active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

-- Allow any authenticated user to manage products (no staff check needed)
CREATE POLICY "Authenticated users can manage products" 
  ON public.products 
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow any authenticated user to manage import logs
CREATE POLICY "Authenticated users can manage import logs" 
  ON public.product_import_logs 
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
