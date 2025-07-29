import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GOOGLE_AI_API_KEY');

console.log('Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseKey,
  hasGeminiKey: !!geminiApiKey,
  geminiKeyLength: geminiApiKey?.length || 0
});

const supabase = createClient(supabaseUrl, supabaseKey);

interface ChatMessage {
  userId?: string;
  message: string;
  conversationId: string;
}

interface ProductResult {
  id: string;
  name: string;
  price: number;
  mrp: number | null;
  stock: number;
  image_urls: string[] | null;
  requires_prescription: boolean;
  category: string;
  description: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, message, conversationId }: ChatMessage = await req.json();

    console.log('Chat request:', { userId, message, conversationId });

    // Check if Gemini API key is available
    if (!geminiApiKey) {
      console.error('GOOGLE_AI_API_KEY not found in environment variables');
      return new Response(JSON.stringify({
        message: 'AI service is currently unavailable. Please try again later.',
        products: [],
        intent: 'error',
        conversationId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Detect intent and search products if needed
    const intent = await detectIntent(message);
    console.log('Detected intent:', intent);

    let products: ProductResult[] = [];
    let orderInfo = null;

    // Handle product search with broader search terms
    if (intent === 'product_search' || intent === 'product_compare') {
      products = await searchProducts(message);
      console.log('Found products:', products.length);
    }

    // Handle order status
    if (intent === 'order_status' && userId) {
      orderInfo = await getOrderStatus(userId, message);
    }

    // Generate response using Gemini
    const response = await generateResponse(message, intent, products, orderInfo);

    // Store conversation context (only if table exists)
    try {
      await storeConversationContext(conversationId, {
        userMessage: message,
        botResponse: response,
        intent,
        timestamp: new Date().toISOString()
      });
    } catch (contextError) {
      console.log('Note: Could not store conversation context (table may not exist):', contextError);
    }

    return new Response(JSON.stringify({
      message: response,
      products,
      intent,
      conversationId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat assistant:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({ 
      error: 'I apologize, but I encountered an error. Please try again.',
      message: 'I apologize, but I encountered an error. Please try again.',
      details: error.message // Include error details for debugging
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function detectIntent(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('order') && (lowerMessage.includes('status') || lowerMessage.includes('track'))) {
    return 'order_status';
  }
  
  if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('difference')) {
    return 'product_compare';
  }
  
  // Enhanced product detection - check for more health-related terms
  const productKeywords = [
    'medicine', 'tablet', 'capsule', 'syrup', 'cream', 'drops', 'vitamin', 'supplement', 
    'buy', 'need', 'looking for', 'search', 'price', 'paracetamol', 'ibuprofen', 
    'aspirin', 'antibiotic', 'pain', 'fever', 'cold', 'cough', 'headache', 'stomach',
    'cetrizine', 'cetirizine', 'allergy', 'skin', 'ointment', 'gel', 'lotion',
    'pharmacy', 'drug', 'medication', 'prescription', 'treatment', 'dose', 'mg'
  ];
  
  if (productKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'product_search';
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return 'greeting';
  }
  
  return 'general_info';
}

async function searchProducts(query: string): Promise<ProductResult[]> {
  try {
    // Enhanced search - search multiple fields and use broader matching
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    let searchQuery = supabase
      .from('products')
      .select('id, name, price, mrp, stock, image_urls, requires_prescription, category, description')
      .eq('is_active', true);

    // Build OR conditions for multiple search terms
    const orConditions = searchTerms.flatMap(term => [
      `name.ilike.%${term}%`,
      `description.ilike.%${term}%`,
      `category.ilike.%${term}%`,
      `brand.ilike.%${term}%`
    ]);

    if (orConditions.length > 0) {
      searchQuery = searchQuery.or(orConditions.join(','));
    }

    const { data, error } = await searchQuery.limit(5);

    if (error) {
      console.error('Product search error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

async function getOrderStatus(userId: string, message: string) {
  try {
    // Extract order ID from message if present
    const orderIdMatch = message.match(/[a-f0-9-]{36}/i);
    
    let query = supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (orderIdMatch) {
      query = query.eq('id', orderIdMatch[0]);
    }

    const { data, error } = await query;

    if (error || !data?.length) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error fetching order status:', error);
    return null;
  }
}

async function generateResponse(message: string, intent: string, products: ProductResult[], orderInfo: any): Promise<string> {
  if (!geminiApiKey) {
    console.log('No Gemini API key found, using fallback response');
    return getDefaultResponse(intent, products);
  }

  const systemPrompt = `You are HealthCare Assistant, the AI representative for HealthCareWorld pharmacy. 
Your duties include:
- Product search and recommendations
- Product comparisons
- Stock and price information
- Order assistance
- General health information and tips

IMPORTANT GUIDELINES:
- Never provide medical diagnosis or treatment instructions
- Always advise consulting a healthcare professional for medical concerns
- If a product requires a prescription, clearly state it and suggest speaking to a doctor
- Keep responses concise, helpful, and friendly
- Use the product information provided to give accurate details

Current conversation context:
- User message: "${message}"
- Intent: ${intent}
- Products found: ${products.length}`;

  let userPrompt = message;
  
  if (products.length > 0) {
    const productInfo = products.map(p => 
      `- ${p.name}: ₹${p.price}${p.mrp ? ` (MRP: ₹${p.mrp})` : ''}, Stock: ${p.stock}, ${p.requires_prescription ? 'Prescription required' : 'No prescription needed'}`
    ).join('\n');
    userPrompt += `\n\nAvailable products:\n${productInfo}`;
  }
  
  if (orderInfo) {
    userPrompt += `\n\nOrder information: Order ID: ${orderInfo.id}, Status: ${orderInfo.status}, Amount: ₹${orderInfo.total_amount}, Date: ${new Date(orderInfo.created_at).toLocaleDateString()}`;
  }

  try {
    console.log('Making Gemini API request with key length:', geminiApiKey.length);
    console.log('Request prompt length:', userPrompt.length);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser: ${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      }),
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response structure:', Object.keys(data));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      let botResponse = data.candidates[0].content.parts[0].text;
      
      // Add medical disclaimer for health-related responses
      if (botResponse.toLowerCase().includes('health') || 
          botResponse.toLowerCase().includes('medicine') || 
          botResponse.toLowerCase().includes('symptom') ||
          botResponse.toLowerCase().includes('treatment')) {
        botResponse += '\n\n⚕️ This information is for general purposes only. Always consult a qualified healthcare professional for medical advice.';
      }
      
      console.log('Generated response length:', botResponse.length);
      return botResponse;
    } else {
      console.log('Unexpected Gemini response structure:', JSON.stringify(data, null, 2));
      throw new Error('No valid content in Gemini response');
    }
    
  } catch (error) {
    console.error('Gemini API error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return getDefaultResponse(intent, products);
  }
}

function getDefaultResponse(intent: string, products: ProductResult[] = []): string {
  switch (intent) {
    case 'greeting':
      return "Hi 👋 I'm HealthCare Assistant! I can help you find medicines, check stock, compare products, or answer health-related questions. What are you looking for today?";
    case 'product_search':
      if (products.length > 0) {
        return `I found ${products.length} product(s) that might help you. You can see the details below and add them to your cart if needed.`;
      }
      return "I'd be happy to help you find the right medicine or health product. Could you please tell me more specifically what you're looking for? You can mention the product name, brand, or what condition you need help with.";
    case 'order_status':
      return "I can help you check your order status. Please provide your order ID or I can check your most recent order if you're logged in.";
    case 'general_info':
      return "I'm here to help with your healthcare needs! I can assist you with:\n• Finding medicines and health products\n• Checking stock and prices\n• Comparing products\n• General health information\n\nWhat would you like help with today?";
    default:
      return "I'm here to help with your healthcare needs. You can ask me about medicines, check product availability, compare items, or get general health information. How can I assist you?";
  }
}

async function storeConversationContext(conversationId: string, context: any) {
  try {
    await supabase
      .from('conversation_state')
      .upsert({
        conversation_id: conversationId,
        context: context,
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error storing conversation context:', error);
    // Don't throw - this is not critical for chat functionality
  }
}
