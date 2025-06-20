
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
    console.log('- API Key prefix:', apiKey.substring(0, 10) + '...');

    // Prepare request body for Chatvolt following their API documentation
    const requestBody = {
      agentId: agentId,
      message: message
    };

    console.log('Payload enviado para Chatvolt:', JSON.stringify(requestBody, null, 2));

    // Make request to Chatvolt API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    try {
      const response = await fetch('https://api.chatvolt.ai/agents/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Status da resposta Chatvolt:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Resposta bruta Chatvolt:', responseText);

      if (!response.ok) {
        console.error('Erro da API Chatvolt - Status:', response.status);
        console.error('Erro da API Chatvolt - Response:', responseText);
        
        // Tentar analisar diferentes tipos de erro
        let errorMessage = `Erro ${response.status}`;
        
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage += ` - ${errorData.error?.message || errorData.message || 'Erro desconhecido'}`;
            console.error('Erro detalhado (JSON):', errorData);
          } catch (parseError) {
            // Se não conseguir fazer parse do JSON, usar o texto bruto
            errorMessage += ` - ${responseText}`;
            console.error('Erro detalhado (texto bruto):', responseText);
            console.error('Erro ao fazer parse do JSON de erro:', parseError);
          }
        }
        
        // Verificar tipos específicos de erro
        if (response.status === 401) {
          errorMessage = 'API Key inválida ou sem permissão. Verifique sua chave da Chatvolt.';
        } else if (response.status === 403) {
          errorMessage = 'Acesso negado. Verifique se o Agent ID está correto e se você tem permissão.';
        } else if (response.status === 404) {
          errorMessage = 'Agent não encontrado. Verifique se o Agent ID está correto.';
        } else if (response.status === 429) {
          errorMessage = 'Limite de requisições excedido. Tente novamente em alguns minutos.';
        } else if (response.status >= 500) {
          errorMessage = 'Erro interno da Chatvolt. Tente novamente em alguns minutos.';
        }
        
        throw new Error(`Chatvolt API: ${errorMessage}`);
      }

      // Tentar fazer parse da resposta
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Dados parseados Chatvolt:', data);
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta Chatvolt:', parseError);
        console.error('Resposta que causou erro:', responseText);
        throw new Error('Resposta da Chatvolt não está em formato JSON válido');
      }
      
      // Extract description from Chatvolt response
      const description = data.answer || data.response || data.message || data.text || data.content || data.result || 'Resposta não encontrada';

      console.log('Descrição extraída:', description);

      return new Response(
        JSON.stringify({ description }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout: A requisição para Chatvolt demorou mais de 30 segundos');
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error.toString(),
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
