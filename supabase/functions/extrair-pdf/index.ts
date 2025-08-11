import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractionRequest {
  file_url: string;
  titulo: string;
  categoria?: string;
  tipo_documento: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file_url, titulo, categoria, tipo_documento }: ExtractionRequest = await req.json();

    // Baixar o arquivo PDF
    console.log('Baixando PDF:', file_url);
    const pdfResponse = await fetch(file_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Supabase-Bot/1.0)'
      }
    });
    if (!pdfResponse.ok) {
      console.error('Erro HTTP:', pdfResponse.status, pdfResponse.statusText);
      throw new Error(`Falha ao baixar o PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    // Usar OpenAI para extrair e estruturar o conteúdo
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    console.log('Processando PDF com OpenAI...');
    
    const systemPrompt = `
Você é um especialista em análise de documentos técnicos de engenharia e construção civil.

Analise o documento PDF fornecido e extraia as informações mais importantes seguindo estas diretrizes:

1. **CONTEÚDO ESTRUTURADO**: Organize o texto em seções lógicas
2. **INFORMAÇÕES TÉCNICAS**: Foque em dados técnicos, especificações, normas, procedimentos
3. **PALAVRAS-CHAVE**: Identifique termos técnicos relevantes para busca
4. **CONTEXTO**: Considere que este documento será usado para enriquecer análises de vistoria predial

DOCUMENTO: ${titulo}
CATEGORIA: ${categoria || 'Não especificada'}
TIPO: ${tipo_documento}

Retorne um JSON com esta estrutura:
{
  "conteudo_extraido": "texto completo estruturado e limpo",
  "palavras_chave": ["palavra1", "palavra2", "palavra3"],
  "resumo": "resumo executivo do documento",
  "topicos_principais": ["tópico1", "tópico2", "tópico3"],
  "normas_referencias": ["norma1", "norma2"] // se houver
}
`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: 'Analise este documento PDF técnico e extraia as informações conforme solicitado.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`Erro OpenAI: ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await openaiResponse.json();
    const result = data.choices[0].message.content;

    console.log('Extração concluída com sucesso');
    
    try {
      const extractedData = JSON.parse(result);
      return new Response(
        JSON.stringify({
          success: true,
          data: extractedData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      // Se não conseguir fazer parse do JSON, retorna o texto bruto
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            conteudo_extraido: result,
            palavras_chave: [],
            resumo: 'Processamento manual necessário',
            topicos_principais: [],
            normas_referencias: []
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Erro na extração do PDF:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});