
-- TARGETED FIX FOR RLS POLICIES
-- This addresses the critical issues with a more surgical approach

-- Drop only the problematic existing policies
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Drop and recreate the staff check function to ensure it works properly
DROP FUNCTION IF EXISTS public.is_current_user_staff();
DROP FUNCTION IF EXISTS public.is_staff_user();

-- Create the core helper function to check if current user is staff
CREATE OR REPLACE FUNCTION public.is_staff_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.staff_users s
    JOIN auth.users au ON s.email = au.email
    WHERE au.id = auth.uid()
  );
$$;

-- Fix the critical PRODUCTS table policies
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Staff can manage all products" ON public.products;

CREATE POLICY "Public can view active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Staff can manage all products" 
  ON public.products 
  FOR ALL
  USING (public.is_staff_user())
  WITH CHECK (public.is_staff_user());

-- Fix the PRODUCT IMPORT LOGS policies
DROP POLICY IF EXISTS "Staff can manage import logs" ON public.product_import_logs;

CREATE POLICY "Staff can manage import logs" 
  ON public.product_import_logs 
  FOR ALL
  USING (public.is_staff_user())
  WITH CHECK (public.is_staff_user());

-- Add the missing order update policy
CREATE POLICY "Users can update own orders" 
  ON public.orders 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update the place_order function to set correct order status
CREATE OR REPLACE FUNCTION public.place_order(cart_user_id uuid, shipping_cost numeric DEFAULT 50.00, order_address_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(order_id uuid, success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_order_id uuid;
  cart_item record;
  total_amount numeric := 0;
  insufficient_stock_items text[] := '{}';
BEGIN
  -- Verify the user exists and matches the current authenticated user
  IF cart_user_id != auth.uid() THEN
    RETURN QUERY SELECT NULL::uuid, false, 'Unauthorized: User ID mismatch';
    RETURN;
  END IF;

  -- Check stock levels first
  FOR cart_item IN 
    SELECT ci.*, p.name, p.price, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = cart_user_id
  LOOP
    IF cart_item.stock < cart_item.quantity THEN
      insufficient_stock_items := array_append(insufficient_stock_items, 
        cart_item.name || ' (Available: ' || cart_item.stock || ', Requested: ' || cart_item.quantity || ')');
    END IF;
    total_amount := total_amount + (cart_item.price * cart_item.quantity);
  END LOOP;

  -- Return error if insufficient stock
  IF array_length(insufficient_stock_items, 1) > 0 THEN
    RETURN QUERY SELECT NULL::uuid, false, 'Insufficient stock for: ' || array_to_string(insufficient_stock_items, ', ');
    RETURN;
  END IF;

  -- Create the order with confirmed status
  INSERT INTO public.orders (user_id, total_amount, shipping_amount, address_id, status, payment_status)
  VALUES (cart_user_id, total_amount + shipping_cost, shipping_cost, order_address_id, 'confirmed', 'paid')
  RETURNING id INTO new_order_id;

  -- Create order items and update stock
  FOR cart_item IN 
    SELECT ci.*, p.price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = cart_user_id
  LOOP
    -- Insert order item
    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, total_price)
    VALUES (new_order_id, cart_item.product_id, cart_item.quantity, cart_item.price, cart_item.price * cart_item.quantity);
    
    -- Update product stock
    UPDATE public.products 
    SET stock = stock - cart_item.quantity
    WHERE id = cart_item.product_id;
  END LOOP;

  -- Clear the cart
  DELETE FROM public.cart_items WHERE user_id = cart_user_id;

  RETURN QUERY SELECT new_order_id, true, NULL::text;
END;
$$;
