
-- Remover a política restritiva atual
DROP POLICY IF EXISTS "Apenas admins podem modificar configurações do sistema" ON public.configuracoes_sistema;

-- Criar nova política que permite todos usuários autenticados modificarem configurações
CREATE POLICY "Usuários autenticados podem modificar configurações do sistema"
  ON public.configuracoes_sistema
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
