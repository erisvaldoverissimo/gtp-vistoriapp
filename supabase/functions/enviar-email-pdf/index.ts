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

    // Preparar lista de destinatários
    const todosDestinatarios = [emailPrincipal];
    console.log('Email principal:', emailPrincipal);
    
    if (emailsCopia && emailsCopia.length > 0) {
      const emailsValidosCopia = emailsCopia.filter(email => email && email.trim());
      console.log('Emails de cópia recebidos:', emailsCopia);
      console.log('Emails de cópia válidos:', emailsValidosCopia);
      todosDestinatarios.push(...emailsValidosCopia);
    }

    console.log('=== TODOS OS DESTINATÁRIOS ===');
    console.log('Total:', todosDestinatarios.length);
    console.log('Lista:', todosDestinatarios);
    console.log('==============================');

    // Enviar email principal
    console.log('=== ENVIANDO EMAIL PRINCIPAL ===');
    console.log('Para:', emailPrincipal);
    
    const { data: emailPrincipalData, error: emailPrincipalError } = await resend.emails.send({
      from: 'Sistema GTP <vistoria@resend.dev>',
      to: [emailPrincipal],
      subject: assunto,
      html: conteudoHtml,
    });

    console.log('Resposta email principal:', emailPrincipalData);
    
    if (emailPrincipalError) {
      console.error('Erro no email principal:', emailPrincipalError);
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar email principal', details: emailPrincipalError }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Enviar emails de cópia separadamente
    const emailsEnviados = [emailPrincipal];
    const respostasEmails = [emailPrincipalData];
    const errosEnvio = [];

    console.log('=== PREPARANDO EMAILS DE CÓPIA ===');
    console.log('emailsCopia recebido:', emailsCopia);
    console.log('Tipo de emailsCopia:', typeof emailsCopia);
    console.log('Array.isArray(emailsCopia):', Array.isArray(emailsCopia));

    if (emailsCopia && Array.isArray(emailsCopia) && emailsCopia.length > 0) {
      const emailsValidosCopia = emailsCopia.filter(email => {
        const isValid = email && typeof email === 'string' && email.trim() !== '';
        console.log(`Email ${email} é válido:`, isValid);
        return isValid;
      });
      
      console.log('Emails válidos de cópia:', emailsValidosCopia);
      console.log('Quantidade de emails de cópia válidos:', emailsValidosCopia.length);
      
      for (let i = 0; i < emailsValidosCopia.length; i++) {
        const emailCopia = emailsValidosCopia[i];
        try {
          console.log(`=== ENVIANDO EMAIL DE CÓPIA ${i + 1}/${emailsValidosCopia.length} ===`);
          console.log('Para:', emailCopia);
          
          const { data: emailCopiaData, error: emailCopiaError } = await resend.emails.send({
            from: 'Sistema GTP <vistoria@resend.dev>',
            to: [emailCopia],
            subject: assunto,
            html: conteudoHtml,
          });

          console.log(`Resposta email cópia ${i + 1}:`, emailCopiaData);
          
          if (emailCopiaError) {
            console.error(`Erro no email de cópia ${i + 1} para`, emailCopia, ':', emailCopiaError);
            errosEnvio.push(`${emailCopia}: ${emailCopiaError.message || 'Erro desconhecido'}`);
          } else {
            emailsEnviados.push(emailCopia);
            respostasEmails.push(emailCopiaData);
            console.log(`Email de cópia ${i + 1} enviado com sucesso para:`, emailCopia);
          }
        } catch (error) {
          console.error(`Erro fatal ao enviar email de cópia ${i + 1} para`, emailCopia, ':', error);
          errosEnvio.push(`${emailCopia}: ${error.message || 'Erro fatal'}`);
        }
        
        // Pequena pausa entre os envios
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      console.log('=== NÃO ENTRANDO NO LOOP DE EMAILS DE CÓPIA ===');
      console.log('Condição emailsCopia:', !!emailsCopia);
      console.log('emailsCopia é array:', Array.isArray(emailsCopia));
      console.log('emailsCopia.length:', emailsCopia?.length);
      console.log('emailsCopia valor:', emailsCopia);
      console.log('=======================================');
    }

    console.log('=== RESUMO DO ENVIO ===');
    console.log('Emails enviados com sucesso:', emailsEnviados);
    console.log('Total de emails enviados:', emailsEnviados.length);
    console.log('IDs dos emails:', respostasEmails.map(r => r?.id));
    if (errosEnvio.length > 0) {
      console.log('Erros encontrados:', errosEnvio);
    }
    console.log('======================');

    const responseMessage = errosEnvio.length > 0 
      ? `Emails enviados com sucesso (${emailsEnviados.length}), mas houve erros em alguns envios`
      : `Todos os emails (${emailsEnviados.length}) enviados com sucesso`;

    console.log(responseMessage);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: responseMessage,
        accessToken: token,
        destinatarios: emailsEnviados,
        emailIds: respostasEmails.map(r => r?.id),
        totalEnviados: emailsEnviados.length,
        erros: errosEnvio.length > 0 ? errosEnvio : undefined
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