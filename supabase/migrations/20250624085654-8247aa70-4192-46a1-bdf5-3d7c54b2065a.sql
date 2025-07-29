
-- Create the ad_banners table
CREATE TABLE public.ad_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  placement TEXT NOT NULL CHECK (placement IN ('home_hero', 'shop_top', 'cart_footer', 'checkout_confirmation')),
  image_url TEXT,
  headline TEXT NOT NULL,
  subtext TEXT,
  cta_text TEXT,
  cta_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_ad_banners_updated_at
  BEFORE UPDATE ON public.ad_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add some sample data for testing
INSERT INTO public.ad_banners (title, placement, headline, subtext, cta_text, cta_url, display_order) VALUES
('Summer Sale Banner', 'home_hero', 'Summer Sale: Up to 50% Off', 'Limited time offer on all healthcare products', 'Shop Now', '/shop', 1),
('Medical Devices Promo', 'shop_top', 'New Medical Devices Available', 'Check out our latest collection', 'View Products', '/shop?category=devices', 1),
('Recommended Products', 'cart_footer', 'Recommended for You', 'Complete your health routine with these products', '', '', 1),
('Newsletter Signup', 'checkout_confirmation', 'Subscribe & Save 10%', 'Get exclusive offers and health tips', 'Subscribe', '', 1);
