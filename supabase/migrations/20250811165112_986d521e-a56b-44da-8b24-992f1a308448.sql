-- Criar tabela para armazenar links de acesso temporários aos PDFs
CREATE TABLE public.pdf_access_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vistoria_id UUID NOT NULL REFERENCES public.vistorias(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  email_enviado_para TEXT NOT NULL,
  acessado_em TIMESTAMP WITH TIME ZONE,
  acessos_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pdf_access_links ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados vejam apenas seus próprios links
CREATE POLICY "Users can view their own PDF links" 
ON public.pdf_access_links 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.vistorias v 
    WHERE v.id = vistoria_id 
    AND v.user_id = auth.uid()
  )
);

-- Política para permitir que usuários autenticados criem links para suas próprias vistorias
CREATE POLICY "Users can create PDF links for their own vistorias" 
ON public.pdf_access_links 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vistorias v 
    WHERE v.id = vistoria_id 
    AND v.user_id = auth.uid()
  )
);

-- Política para permitir que usuários autenticados atualizem seus próprios links
CREATE POLICY "Users can update their own PDF links" 
ON public.pdf_access_links 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.vistorias v 
    WHERE v.id = vistoria_id 
    AND v.user_id = auth.uid()
  )
);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_pdf_access_links_updated_at
BEFORE UPDATE ON public.pdf_access_links
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Criar função para limpar links expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_pdf_links()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.pdf_access_links 
  WHERE expires_at < now();
$$;