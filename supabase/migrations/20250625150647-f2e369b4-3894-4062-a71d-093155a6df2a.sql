
-- Fix the RLS policies to allow authenticated users to create orders without complex checks
-- Drop all existing RLS policies that might be causing issues
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;
DROP POLICY IF EXISTS "order_items_select_policy" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON public.order_items;
DROP POLICY IF EXISTS "staff_orders_all_access" ON public.orders;
DROP POLICY IF EXISTS "staff_order_items_all_access" ON public.order_items;

-- Create simple policies for orders - if user is authenticated, they can manage their own orders
CREATE POLICY "authenticated_users_orders_select" 
  ON public.orders 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_users_orders_insert" 
  ON public.orders 
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_users_orders_update" 
  ON public.orders 
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create simple policies for order_items
CREATE POLICY "authenticated_users_order_items_select" 
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

CREATE POLICY "authenticated_users_order_items_insert" 
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

-- Allow staff to view all orders and order items for management
CREATE POLICY "staff_view_all_orders" 
  ON public.orders 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE staff_users.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "staff_manage_orders" 
  ON public.orders 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE staff_users.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "staff_view_all_order_items" 
  ON public.order_items 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE staff_users.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Ensure cart_items policies are simple for authenticated users
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;

CREATE POLICY "authenticated_users_cart_items" 
  ON public.cart_items 
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure addresses policies are simple for authenticated users
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;

CREATE POLICY "authenticated_users_addresses" 
  ON public.addresses 
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Update the place_order function to be more robust
CREATE OR REPLACE FUNCTION public.place_order(
  cart_user_id uuid,
  shipping_cost numeric DEFAULT 50.00,
  order_address_id uuid DEFAULT NULL
)
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

  -- Check if cart has items
  IF NOT EXISTS (SELECT 1 FROM public.cart_items WHERE user_id = cart_user_id) THEN
    RETURN QUERY SELECT NULL::uuid, false, 'Cart is empty';
    RETURN;
  END IF;

  -- Check stock levels first and calculate total
  FOR cart_item IN 
    SELECT ci.*, p.name, p.price, p.stock
    FROM public.cart_items ci
    JOIN public.products p ON ci.product_id = p.id
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
    FROM public.cart_items ci
    JOIN public.products p ON ci.product_id = p.id
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

  -- Clear the cart after successful order
  DELETE FROM public.cart_items WHERE user_id = cart_user_id;

  RETURN QUERY SELECT new_order_id, true, NULL::text;
END;
$$;
