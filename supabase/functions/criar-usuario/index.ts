import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CreateUserBody = {
  nome: string;
  email: string;
  role?: 'admin' | 'sindico';
  telefone?: string;
  cargo?: string;
  ativo?: boolean;
  email_copia_1?: string;
  email_copia_2?: string;
  email_copia_3?: string;
  condominioId?: string;
  password?: string; // opcional; se não vier, geramos uma senha temporária
};

function generateTempPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$!%*?&';
  let pass = '';
  for (let i = 0; i < length; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
      return new Response(JSON.stringify({ error: 'Supabase env keys missing' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Validar usuário autenticado e admin
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const requesterId = userData.user.id;
    const { data: isAdminRes, error: isAdminErr } = await adminClient.rpc('is_admin', { _user_id: requesterId });
    if (isAdminErr || !isAdminRes) {
      return new Response(JSON.stringify({ error: 'Acesso negado: apenas administradores' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const body = (await req.json()) as { dadosUsuario: CreateUserBody; condominioId?: string } | CreateUserBody;
    const payload: CreateUserBody = 'dadosUsuario' in body ? (body as any).dadosUsuario : (body as any);

    const {
      nome,
      email,
      role = 'sindico',
      telefone,
      cargo,
      ativo = true,
      email_copia_1,
      email_copia_2,
      email_copia_3,
      condominioId,
      password,
    } = payload;

    if (!nome || !email) {
      return new Response(JSON.stringify({ error: 'Nome e email são obrigatórios' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const tempPassword = password || generateTempPassword();

    // Criar usuário no Auth já com email confirmado
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { nome },
    });

    if (createErr || !created?.user) {
      return new Response(JSON.stringify({ error: 'Erro ao criar usuário', details: createErr?.message }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const newUserId = created.user.id;

    // Atualizar perfil com campos adicionais
    const { error: profileErr } = await adminClient
      .from('profiles')
      .update({
        nome,
        email,
        telefone,
        cargo,
        ativo,
        role,
        email_copia_1: email_copia_1 || null,
        email_copia_2: email_copia_2 || null,
        email_copia_3: email_copia_3 || null,
      })
      .eq('id', newUserId);

    if (profileErr) {
      return new Response(JSON.stringify({ error: 'Usuário criado, mas falhou ao atualizar perfil', details: profileErr.message, userId: newUserId }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Opcional: criar associação ao condomínio
    const targetCondo = payload.condominioId || (body as any)?.condominioId;
    if (targetCondo) {
      const { error: assocErr } = await adminClient
        .from('usuario_condominios')
        .insert({ user_id: newUserId, condominio_id: targetCondo });
      if (assocErr) {
        // Não falhar a criação por causa da associação; retornamos aviso
        return new Response(JSON.stringify({ success: true, userId: newUserId, tempPassword, warning: 'Usuário criado, mas falhou ao associar ao condomínio', warningDetails: assocErr.message }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
    }

    return new Response(
      JSON.stringify({ success: true, userId: newUserId, tempPassword }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Erro interno' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
