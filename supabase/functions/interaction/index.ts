
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InteractionRequest {
  user_id: string;
  event_type: 'view' | 'click' | 'add_to_cart' | 'purchase';
  item_id: string;
  item_type: 'product' | 'blog';
  tags?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const requestData: InteractionRequest = await req.json()

    // Validate required fields
    if (!requestData.user_id || !requestData.event_type || !requestData.item_id || !requestData.item_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, event_type, item_id, item_type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate enum values
    const validEventTypes = ['view', 'click', 'add_to_cart', 'purchase']
    const validItemTypes = ['product', 'blog']
    
    if (!validEventTypes.includes(requestData.event_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event_type. Must be one of: ' + validEventTypes.join(', ') }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!validItemTypes.includes(requestData.item_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid item_type. Must be one of: ' + validItemTypes.join(', ') }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert interaction record
    const { data, error } = await supabaseClient
      .from('user_interactions')
      .insert({
        user_id: requestData.user_id,
        event_type: requestData.event_type,
        item_id: requestData.item_id,
        item_type: requestData.item_type,
        tags: requestData.tags || []
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to record interaction', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
