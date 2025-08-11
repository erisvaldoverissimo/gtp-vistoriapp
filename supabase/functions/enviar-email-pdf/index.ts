import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { RelatorioVistoriaEmail } from './_templates/relatorio-vistoria.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  vistoriaId: string;
  emailPrincipal: string;
  emailsCopia?: string[];
  nomeCondominio: string;
  numeroInterno: string;
  dataVistoria: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== Iniciando função enviar-email-pdf ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Verificar se o Resend API key está configurado
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY não configurado');
      return new Response(
        JSON.stringify({ error: 'Serviço de email não configurado' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const { vistoriaId, emailPrincipal, emailsCopia, nomeCondominio, numeroInterno, dataVistoria }: EmailRequest = await req.json();
    console.log('Dados recebidos:', { vistoriaId, emailPrincipal, emailsCopia, nomeCondominio, numeroInterno });

    // Validar dados obrigatórios
    if (!vistoriaId || !emailPrincipal || !nomeCondominio || !numeroInterno) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Gerar token único para acesso ao PDF
    const token = crypto.randomUUID() + '-' + Date.now().toString(36);
    console.log('Token gerado:', token);

    // Salvar link de acesso no banco
    const { data: linkData, error: linkError } = await supabase
      .from('pdf_access_links')
      .insert({
        vistoria_id: vistoriaId,
        token: token,
        email_enviado_para: emailPrincipal,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      })
      .select()
      .single();

    if (linkError) {
      console.error('Erro ao criar link de acesso:', linkError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar link de acesso' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Construir URL de acesso ao PDF
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('https://', '').replace('.supabase.co', '') || 'localhost';
    const accessUrl = `https://${baseUrl}.lovable.app/pdf-access/${token}`;
    console.log('URL de acesso criada:', accessUrl);

    // Preparar lista de destinatários
    const destinatarios = [emailPrincipal];
    console.log('Email principal adicionado:', emailPrincipal);
    
    if (emailsCopia && emailsCopia.length > 0) {
      const emailsValidosCopia = emailsCopia.filter(email => email && email.trim());
      console.log('Emails de cópia recebidos:', emailsCopia);
      console.log('Emails de cópia válidos:', emailsValidosCopia);
      destinatarios.push(...emailsValidosCopia);
    }

    console.log('=== DESTINATÁRIOS FINAIS ===');
    console.log('Total de destinatários:', destinatarios.length);
    console.log('Lista completa:', destinatarios);
    console.log('==========================');

    // Inicializar Resend
    const resend = new Resend(resendApiKey);

    // Preparar conteúdo do email usando React Email
    const assunto = `Relatório de Vistoria - ${nomeCondominio} (${numeroInterno})`;
    
    // Renderizar template React Email
    const conteudoHtml = await renderAsync(
      React.createElement(RelatorioVistoriaEmail, {
        nomeCondominio,
        numeroInterno,
        dataVistoria,
        accessUrl,
      })
    );

    // Enviar email usando Resend
    console.log('=== ENVIANDO EMAIL ===');
    console.log('Para:', destinatarios);
    console.log('Assunto:', assunto);
    console.log('======================');
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Sistema GTP <vistoria@resend.dev>',
      to: destinatarios,
      subject: assunto,
      html: conteudoHtml,
    });

    console.log('=== RESPOSTA DO RESEND ===');
    console.log('Dados da resposta:', emailData);
    console.log('==========================');

    if (emailError) {
      console.error('Erro no Resend:', emailError);
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar email', details: emailError }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Email enviado com sucesso!');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso',
        accessToken: token,
        destinatarios,
        emailId: emailData?.id
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Erro na função enviar-email-pdf:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);