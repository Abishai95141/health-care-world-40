
-- Disable RLS and remove all policies from products table
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on products table
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Staff can manage all products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Staff can view all products" ON public.products;
DROP POLICY IF EXISTS "Staff can insert products" ON public.products;
DROP POLICY IF EXISTS "Staff can update products" ON public.products;
DROP POLICY IF EXISTS "Staff can delete products" ON public.products;

-- Disable RLS and remove all policies from product_import_logs table
ALTER TABLE public.product_import_logs DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on product_import_logs table
DROP POLICY IF EXISTS "Staff can manage import logs" ON public.product_import_logs;
DROP POLICY IF EXISTS "Authenticated users can manage import logs" ON public.product_import_logs;
DROP POLICY IF EXISTS "Staff can view their own import logs" ON public.product_import_logs;
DROP POLICY IF EXISTS "Staff can insert import logs" ON public.product_import_logs;
DROP POLICY IF EXISTS "Staff can update their own import logs" ON public.product_import_logs;
