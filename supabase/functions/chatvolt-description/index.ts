
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Iniciando requisição para Chatvolt...');
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request data
    const { message, agentId, apiKey } = await req.json();

    if (!message || !agentId || !apiKey) {
      throw new Error('Dados obrigatórios ausentes: message, agentId, apiKey');
    }

    console.log('Dados recebidos:');
    console.log('- Agent ID:', agentId);
    console.log('- Message length:', message.length);

    // Prepare request body for Chatvolt following their API documentation
    const requestBody = {
      agentId: agentId,
      message: message
    };

    console.log('Payload enviado para Chatvolt:', JSON.stringify(requestBody, null, 2));

    // Make request to Chatvolt API
    const response = await fetch('https://api.chatvolt.ai/agents/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Status da resposta Chatvolt:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Resposta bruta Chatvolt:', responseText);

    if (!response.ok) {
      console.error('Erro da API Chatvolt - Status:', response.status);
      console.error('Erro da API Chatvolt - Response:', responseText);
      
      let errorMessage = `Erro ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage += ` - ${errorData.error?.message || errorData.message || 'Erro desconhecido'}`;
        console.error('Erro detalhado:', errorData);
      } catch {
        errorMessage += ` - ${responseText || 'Erro desconhecido'}`;
      }
      
      throw new Error(`Chatvolt API: ${errorMessage}`);
    }

    const data = JSON.parse(responseText);
    console.log('Dados parseados Chatvolt:', data);
    
    // Extract description from Chatvolt response
    const description = data.answer || data.response || data.message || data.text || data.content || 'Resposta não encontrada';

    console.log('Descrição extraída:', description);

    return new Response(
      JSON.stringify({ description }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
