
-- Fix RLS policies for orders to allow proper access
-- This migration ensures orders can be created and accessed properly

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can manage their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can manage their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;

-- Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies for orders
CREATE POLICY "orders_select_policy" 
  ON public.orders 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "orders_insert_policy" 
  ON public.orders 
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_update_policy" 
  ON public.orders 
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create simple, working policies for order_items
CREATE POLICY "order_items_select_policy" 
  ON public.order_items 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_insert_policy" 
  ON public.order_items 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Allow staff to view all orders for management
CREATE POLICY "staff_orders_all_access" 
  ON public.orders 
  FOR ALL 
  TO authenticated
  USING (is_current_user_staff())
  WITH CHECK (is_current_user_staff());

CREATE POLICY "staff_order_items_all_access" 
  ON public.order_items 
  FOR ALL 
  TO authenticated
  USING (is_current_user_staff())
  WITH CHECK (is_current_user_staff());
