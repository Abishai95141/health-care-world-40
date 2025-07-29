
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { cart_session_id, shipping_cost = 50.00, address_id = null } = await req.json()

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    console.log('Processing order for user:', user.id, 'with session:', cart_session_id)

    // Call the existing place_order function
    const { data: orderResult, error: orderError } = await supabaseClient
      .rpc('place_order', {
        cart_user_id: user.id,
        shipping_cost: shipping_cost,
        order_address_id: address_id
      })

    if (orderError) {
      throw orderError
    }

    const result = orderResult[0]
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error_message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // If order was successful and we have a cart session, mark it as converted
    if (cart_session_id && result.success) {
      console.log('Updating cart session to converted:', cart_session_id)
      
      const { error: sessionError } = await supabaseClient
        .from('cart_sessions')
        .update({
          status: 'converted',
          converted_at: new Date().toISOString()
        })
        .eq('session_id', cart_session_id)
        .eq('user_id', user.id)

      if (sessionError) {
        console.error('Error updating cart session:', sessionError)
        // Don't fail the order if session update fails, just log it
      } else {
        console.log('Successfully updated cart session to converted')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: result.order_id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in place_order function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
