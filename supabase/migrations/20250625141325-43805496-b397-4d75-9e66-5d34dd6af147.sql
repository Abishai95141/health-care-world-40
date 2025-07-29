
-- Make staff_id nullable in product_import_logs table since we're not using staff authentication
ALTER TABLE public.product_import_logs ALTER COLUMN staff_id DROP NOT NULL;

-- Set a default value for staff_id to handle existing constraints
ALTER TABLE public.product_import_logs ALTER COLUMN staff_id SET DEFAULT gen_random_uuid();
