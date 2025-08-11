-- Criar tabela para armazenar base de conhecimento técnico
CREATE TABLE public.base_conhecimento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo_documento TEXT NOT NULL, -- 'pdf', 'manual', 'norma', 'especificacao'
  categoria TEXT, -- 'estrutural', 'instalacoes', 'acabamentos', 'seguranca', etc.
  conteudo_extraido TEXT NOT NULL,
  palavras_chave TEXT[],
  arquivo_url TEXT,
  tamanho_bytes BIGINT,
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.base_conhecimento ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem visualizar base de conhecimento"
ON public.base_conhecimento
FOR SELECT
USING (true); -- Conhecimento compartilhado entre todos os usuários

CREATE POLICY "Usuários podem criar base de conhecimento"
ON public.base_conhecimento
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar sua própria base de conhecimento"
ON public.base_conhecimento
FOR UPDATE
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar sua própria base de conhecimento"
ON public.base_conhecimento
FOR DELETE
USING (auth.uid() = usuario_id);

-- Trigger para atualizar timestamp usando a função existente
CREATE TRIGGER update_base_conhecimento_updated_at
BEFORE UPDATE ON public.base_conhecimento
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Índices para busca eficiente
CREATE INDEX idx_base_conhecimento_categoria ON public.base_conhecimento(categoria);
CREATE INDEX idx_base_conhecimento_tipo ON public.base_conhecimento(tipo_documento);
CREATE INDEX idx_base_conhecimento_palavras_chave ON public.base_conhecimento USING GIN(palavras_chave);

-- Criar bucket de storage para PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('conhecimento-pdfs', 'conhecimento-pdfs', false);

-- Políticas de storage
CREATE POLICY "Usuários podem visualizar PDFs de conhecimento"
ON storage.objects
FOR SELECT
USING (bucket_id = 'conhecimento-pdfs');

CREATE POLICY "Usuários podem fazer upload de PDFs de conhecimento"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'conhecimento-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem atualizar seus próprios PDFs de conhecimento"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'conhecimento-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);