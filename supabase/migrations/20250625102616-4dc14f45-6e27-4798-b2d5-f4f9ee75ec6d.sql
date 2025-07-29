
-- First, let's create policies for the products table to allow staff users to manage products

-- Enable RLS on products table (if not already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active products (for public browsing)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

-- Allow staff users to view all products
DROP POLICY IF EXISTS "Staff can view all products" ON public.products;
CREATE POLICY "Staff can view all products" 
  ON public.products 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE id = auth.uid()
    )
  );

-- Allow staff users to insert products
DROP POLICY IF EXISTS "Staff can insert products" ON public.products;
CREATE POLICY "Staff can insert products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE id = auth.uid()
    )
  );

-- Allow staff users to update products
DROP POLICY IF EXISTS "Staff can update products" ON public.products;
CREATE POLICY "Staff can update products" 
  ON public.products 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE id = auth.uid()
    )
  );

-- Allow staff users to delete products
DROP POLICY IF EXISTS "Staff can delete products" ON public.products;
CREATE POLICY "Staff can delete products" 
  ON public.products 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE id = auth.uid()
    )
  );

-- Now let's fix the product_import_logs table policies
ALTER TABLE public.product_import_logs ENABLE ROW LEVEL SECURITY;

-- Allow staff users to view their own import logs
DROP POLICY IF EXISTS "Staff can view their own import logs" ON public.product_import_logs;
CREATE POLICY "Staff can view their own import logs" 
  ON public.product_import_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE id = auth.uid() AND id = staff_id
    )
  );

-- Allow staff users to insert import logs
DROP POLICY IF EXISTS "Staff can insert import logs" ON public.product_import_logs;
CREATE POLICY "Staff can insert import logs" 
  ON public.product_import_logs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE id = auth.uid() AND id = staff_id
    )
  );

-- Allow staff users to update their own import logs
DROP POLICY IF EXISTS "Staff can update their own import logs" ON public.product_import_logs;
CREATE POLICY "Staff can update their own import logs" 
  ON public.product_import_logs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE id = auth.uid() AND id = staff_id
    )
  );
