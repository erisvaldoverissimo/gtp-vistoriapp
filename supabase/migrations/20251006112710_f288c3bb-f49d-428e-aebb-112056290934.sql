-- Fix: Restrict system configuration modifications to admin users only
-- Drop the overly permissive policy that allows all authenticated users to modify system configs
DROP POLICY IF EXISTS "Usuários autenticados podem modificar configurações do siste" ON public.configuracoes_sistema;

-- Create restrictive policies that only allow admins to modify system configurations
CREATE POLICY "Apenas admins podem inserir configurações do sistema"
ON public.configuracoes_sistema
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Apenas admins podem atualizar configurações do sistema"
ON public.configuracoes_sistema
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Apenas admins podem deletar configurações do sistema"
ON public.configuracoes_sistema
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Note: The SELECT policy remains unchanged - all users can view system configurations
-- but only admins can modify them.