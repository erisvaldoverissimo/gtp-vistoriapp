
-- Criar tabela para configurações globais do sistema
CREATE TABLE public.configuracoes_sistema (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave text NOT NULL UNIQUE,
  valor jsonb NOT NULL,
  descricao text,
  categoria text NOT NULL DEFAULT 'geral',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para configurações específicas por usuário
CREATE TABLE public.configuracoes_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chave text NOT NULL,
  valor jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, chave)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas para configurações do sistema (apenas admins podem modificar)
CREATE POLICY "Todos podem visualizar configurações do sistema"
  ON public.configuracoes_sistema
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem modificar configurações do sistema"
  ON public.configuracoes_sistema
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE cargo = 'Administrador'
  ));

-- Políticas para configurações do usuário
CREATE POLICY "Usuários podem gerenciar suas próprias configurações"
  ON public.configuracoes_usuario
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Inserir configurações padrão do sistema
INSERT INTO public.configuracoes_sistema (chave, valor, descricao, categoria) VALUES
('empresa_nome', '"VistoriaApp"', 'Nome da empresa', 'empresa'),
('empresa_email', '"contato@vistoriaapp.com.br"', 'Email da empresa', 'empresa'),
('empresa_telefone', '"(11) 99999-9999"', 'Telefone da empresa', 'empresa'),
('empresa_logo', '""', 'URL da logo da empresa', 'empresa'),
('empresa_cor_cabecalho', '"#0f766e"', 'Cor do cabeçalho nos relatórios', 'empresa'),
('smtp_server', '""', 'Servidor SMTP para envio de emails', 'email'),
('smtp_port', '"587"', 'Porta do servidor SMTP', 'email'),
('smtp_user', '""', 'Usuário SMTP', 'email'),
('smtp_password', '""', 'Senha SMTP', 'email'),
('smtp_secure', 'true', 'Usar SSL/TLS no SMTP', 'email'),
('email_assinatura', '""', 'Assinatura padrão dos emails', 'email'),
('api_key_openai', '""', 'Chave da API OpenAI/Groq', 'ia'),
('ia_auto_descricao', 'true', 'Habilitar descrição automática de imagens', 'ia'),
('agente_nome', '"Theo"', 'Nome do agente IA', 'agente'),
('agente_enable', 'true', 'Habilitar agente IA', 'agente'),
('agente_prompt_persona', '"Seu nome é Theo, atue como um Tutor virtual e Mentor de estudo no Seminário Teológico de Guarulhos..."', 'Prompt da persona do agente', 'agente'),
('agente_prompt_objetivo', '"Esclarecer dúvidas em tempo real sobre Cosmovisão e Espiritualidade..."', 'Prompt dos objetivos do agente', 'agente'),
('agente_prompt_comportamento', '"### COMPORTAMENTO E AÇÕES\\n\\n1. **Atendimento de dúvidas:**..."', 'Prompt do comportamento do agente', 'agente'),
('upload_limite_fotos', '10', 'Limite de fotos por vistoria', 'upload'),
('upload_tamanho_maximo', '5', 'Tamanho máximo por foto em MB', 'upload'),
('upload_formatos_permitidos', '"JPEG, PNG, WebP"', 'Formatos de arquivo permitidos', 'upload');

-- Trigger para atualizar updated_at (caso não exista)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER configuracoes_sistema_updated_at
  BEFORE UPDATE ON public.configuracoes_sistema
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER configuracoes_usuario_updated_at
  BEFORE UPDATE ON public.configuracoes_usuario
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
