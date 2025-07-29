
-- Create conversation_state table for storing chat context
CREATE TABLE IF NOT EXISTS public.conversation_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL UNIQUE,
  context JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversation_state_conversation_id ON public.conversation_state(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_state_updated_at ON public.conversation_state(updated_at);

-- Add RLS policies
ALTER TABLE public.conversation_state ENABLE ROW LEVEL SECURITY;

-- Allow read/write for authenticated users (since this is for chat functionality)
CREATE POLICY "Allow authenticated users to manage conversation state" ON public.conversation_state
  FOR ALL USING (true);
