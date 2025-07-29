
-- Create or replace the place_order function
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

  -- Create the order
  INSERT INTO public.orders (user_id, total_amount, shipping_amount, address_id, status, payment_status)
  VALUES (cart_user_id, total_amount + shipping_cost, shipping_cost, order_address_id, 'pending', 'paid')
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
