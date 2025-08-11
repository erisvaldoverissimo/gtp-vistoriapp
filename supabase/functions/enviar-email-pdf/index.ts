import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    if (emailsCopia && emailsCopia.length > 0) {
      destinatarios.push(...emailsCopia.filter(email => email && email.trim()));
    }

    console.log('Destinatários:', destinatarios);

    // Preparar conteúdo do email
    const assunto = `Relatório de Vistoria - ${nomeCondominio} (${numeroInterno})`;
    const conteudoHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Vistoria</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6B46C1; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
          .info { background: #EBF8FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 15px 0; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sistema de Vistorias GTP</h1>
          <p>Relatório de Vistoria Técnica</p>
        </div>
        
        <div class="content">
          <h2>Relatório Disponível</h2>
          <p>Olá!</p>
          <p>O relatório de vistoria técnica está pronto para visualização:</p>
          
          <div class="info">
            <strong>Empreendimento:</strong> ${nomeCondominio}<br>
            <strong>Número Interno:</strong> ${numeroInterno}<br>
            <strong>Data da Vistoria:</strong> ${new Date(dataVistoria).toLocaleDateString('pt-BR')}<br>
            <strong>Data de Envio:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          
          <p>Clique no botão abaixo para acessar e visualizar o relatório:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${accessUrl}" class="button">Acessar Relatório PDF</a>
          </div>
          
          <div class="info">
            <strong>⚠️ Importante:</strong><br>
            • Este link é válido por 7 dias<br>
            • O acesso é seguro e validado<br>
            • Você pode baixar o PDF diretamente da página
          </div>
        </div>
        
        <div class="footer">
          <p>Este email foi enviado automaticamente pelo Sistema de Vistorias GTP.<br>
          Em caso de dúvidas, entre em contato com o responsável pela vistoria.</p>
          <p><strong>Não responda este email.</strong></p>
        </div>
      </body>
      </html>
    `;

    // Enviar email usando Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sistema GTP <vistoria@resend.dev>',
        to: destinatarios,
        subject: assunto,
        html: conteudoHtml,
      }),
    });

    const resendData = await resendResponse.json();
    console.log('Resposta do Resend:', resendData);

    if (!resendResponse.ok) {
      console.error('Erro no Resend:', resendData);
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar email', details: resendData }),
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
        emailId: resendData.id
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