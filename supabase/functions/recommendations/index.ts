
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecommendationResponse {
  product_id: string;
  name: string;
  thumbnail_url: string | null;
  price: number;
  tags: string[];
  score: number;
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

    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const url = new URL(req.url)
    const user_id = url.searchParams.get('user_id')
    const context = url.searchParams.get('context') || 'general'
    const tagsParam = url.searchParams.get('tags')
    const limitParam = url.searchParams.get('limit')
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse tags parameter
    let contextTags: string[] = []
    if (tagsParam) {
      contextTags = tagsParam.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 6
    if (isNaN(limit) || limit < 1 || limit > 20) {
      return new Response(
        JSON.stringify({ error: 'limit must be a number between 1 and 20' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Getting recommendations for user ${user_id}, context: ${context}, tags: ${contextTags.join(',')}, limit: ${limit}`)

    // Call the recommendation function
    const { data, error } = await supabaseClient
      .rpc('get_product_recommendations', {
        target_user_id: user_id,
        context_tags: contextTags,
        limit_count: limit
      })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to get recommendations', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform the response to match the expected format
    const recommendations: RecommendationResponse[] = (data || []).map((item: any) => ({
      product_id: item.product_id,
      name: item.name,
      thumbnail_url: item.image_url,
      price: parseFloat(item.price),
      tags: item.tags || [],
      score: parseFloat(item.recommendation_score || 0)
    }))

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: recommendations,
        context,
        user_id,
        total: recommendations.length
      }),
      { 
        status: 200, 
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
