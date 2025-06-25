
-- Criar tabela para conversas do chat
CREATE TABLE public.conversas_chat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL DEFAULT 'Nova Conversa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ativa BOOLEAN NOT NULL DEFAULT true
);

-- Criar tabela para mensagens do chat
CREATE TABLE public.mensagens_chat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversa_id UUID NOT NULL REFERENCES public.conversas_chat(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'audio')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.conversas_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_chat ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversas_chat
CREATE POLICY "Usuários podem ver suas próprias conversas"
  ON public.conversas_chat
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem criar suas próprias conversas"
  ON public.conversas_chat
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas próprias conversas"
  ON public.conversas_chat
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar suas próprias conversas"
  ON public.conversas_chat
  FOR DELETE
  USING (user_id = auth.uid());

-- Políticas RLS para mensagens_chat
CREATE POLICY "Usuários podem ver mensagens de suas conversas"
  ON public.mensagens_chat
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversas_chat 
    WHERE id = conversa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem criar mensagens em suas conversas"
  ON public.mensagens_chat
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversas_chat 
    WHERE id = conversa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar mensagens de suas conversas"
  ON public.mensagens_chat
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.conversas_chat 
    WHERE id = conversa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem deletar mensagens de suas conversas"
  ON public.mensagens_chat
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.conversas_chat 
    WHERE id = conversa_id AND user_id = auth.uid()
  ));

-- Criar trigger para atualizar updated_at na tabela conversas_chat
CREATE TRIGGER handle_updated_at_conversas_chat
  BEFORE UPDATE ON public.conversas_chat
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar índices para melhor performance
CREATE INDEX idx_conversas_chat_user_id ON public.conversas_chat(user_id);
CREATE INDEX idx_conversas_chat_created_at ON public.conversas_chat(created_at DESC);
CREATE INDEX idx_mensagens_chat_conversa_id ON public.mensagens_chat(conversa_id);
CREATE INDEX idx_mensagens_chat_created_at ON public.mensagens_chat(created_at ASC);
