
-- Create storage bucket for advertisements
INSERT INTO storage.buckets (id, name, public)
VALUES ('ads', 'ads', true);

-- Create RLS policies for the ads bucket to allow staff to upload
CREATE POLICY "Staff can upload ads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ads');

CREATE POLICY "Staff can view ads" ON storage.objects
FOR SELECT USING (bucket_id = 'ads');

CREATE POLICY "Staff can update ads" ON storage.objects
FOR UPDATE USING (bucket_id = 'ads');

CREATE POLICY "Staff can delete ads" ON storage.objects
FOR DELETE USING (bucket_id = 'ads');

-- Allow public access to view ads
CREATE POLICY "Public can view ads" ON storage.objects
FOR SELECT USING (bucket_id = 'ads');
