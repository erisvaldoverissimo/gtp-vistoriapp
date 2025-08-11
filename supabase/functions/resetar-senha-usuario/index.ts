import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { userId, newPassword } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId é obrigatório' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const tempPassword = newPassword || generateTempPassword();

    const { error: updateErr } = await adminClient.auth.admin.updateUserById(userId, {
      password: tempPassword,
    });

    if (updateErr) {
      return new Response(JSON.stringify({ error: 'Falha ao atualizar senha', details: updateErr.message }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    return new Response(JSON.stringify({ success: true, tempPassword }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Erro interno' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
