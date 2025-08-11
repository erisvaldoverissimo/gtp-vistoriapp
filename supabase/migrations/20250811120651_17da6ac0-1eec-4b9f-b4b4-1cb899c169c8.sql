-- Criação do sistema de templates de vistoria
-- Esta migração adiciona funcionalidades sem afetar o sistema existente

-- Tabela para armazenar templates de vistoria
CREATE TABLE public.templates_vistoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  condominio_id UUID REFERENCES public.condominios(id),
  user_id UUID NOT NULL,
  is_publico BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para grupos padrão dos templates
CREATE TABLE public.grupos_template (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.templates_vistoria(id) ON DELETE CASCADE,
  ambiente TEXT NOT NULL,
  grupo TEXT NOT NULL,
  item TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações do sistema (melhorias futuras)
CREATE TABLE public.configuracoes_produtividade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chave TEXT NOT NULL,
  valor JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chave)
);

-- Adicionar campos opcionais à tabela vistorias existente (para rastreamento)
ALTER TABLE public.vistorias 
ADD COLUMN template_usado_id UUID REFERENCES public.templates_vistoria(id),
ADD COLUMN copiado_de_vistoria_id UUID REFERENCES public.vistorias(id),
ADD COLUMN tempo_criacao_minutos INTEGER;

-- Índices para performance
CREATE INDEX idx_templates_vistoria_user_id ON public.templates_vistoria(user_id);
CREATE INDEX idx_templates_vistoria_condominio_id ON public.templates_vistoria(condominio_id);
CREATE INDEX idx_templates_vistoria_ativo ON public.templates_vistoria(ativo);
CREATE INDEX idx_grupos_template_template_id ON public.grupos_template(template_id);
CREATE INDEX idx_grupos_template_ordem ON public.grupos_template(template_id, ordem);
CREATE INDEX idx_configuracoes_produtividade_user_chave ON public.configuracoes_produtividade(user_id, chave);

-- RLS Policies para templates_vistoria
ALTER TABLE public.templates_vistoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver templates próprios e públicos" 
ON public.templates_vistoria 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (is_publico = true AND ativo = true)
);

CREATE POLICY "Usuários podem criar seus próprios templates" 
ON public.templates_vistoria 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios templates" 
ON public.templates_vistoria 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios templates" 
ON public.templates_vistoria 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies para grupos_template
ALTER TABLE public.grupos_template ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver grupos de templates acessíveis" 
ON public.grupos_template 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.templates_vistoria tv 
    WHERE tv.id = grupos_template.template_id 
    AND (tv.user_id = auth.uid() OR (tv.is_publico = true AND tv.ativo = true))
  )
);

CREATE POLICY "Usuários podem criar grupos em seus templates" 
ON public.grupos_template 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.templates_vistoria tv 
    WHERE tv.id = grupos_template.template_id 
    AND tv.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem atualizar grupos de seus templates" 
ON public.grupos_template 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.templates_vistoria tv 
    WHERE tv.id = grupos_template.template_id 
    AND tv.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem deletar grupos de seus templates" 
ON public.grupos_template 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.templates_vistoria tv 
    WHERE tv.id = grupos_template.template_id 
    AND tv.user_id = auth.uid()
  )
);

-- RLS Policies para configuracoes_produtividade
ALTER TABLE public.configuracoes_produtividade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas próprias configurações" 
ON public.configuracoes_produtividade 
FOR ALL 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_vistoria_updated_at
  BEFORE UPDATE ON public.templates_vistoria
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_templates_updated_at();

CREATE TRIGGER update_configuracoes_produtividade_updated_at
  BEFORE UPDATE ON public.configuracoes_produtividade
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_templates_updated_at();

-- Inserir alguns templates padrão públicos para começar
INSERT INTO public.templates_vistoria (
  nome, 
  descricao, 
  user_id, 
  is_publico
) VALUES 
(
  'Template Básico Residencial',
  'Template padrão para vistorias em condomínios residenciais',
  (SELECT id FROM auth.users LIMIT 1),
  true
),
(
  'Template Comercial',
  'Template para edifícios comerciais e corporativos',
  (SELECT id FROM auth.users LIMIT 1),
  true
);

-- Grupos padrão para template básico residencial
INSERT INTO public.grupos_template (
  template_id,
  ambiente,
  grupo,
  item,
  ordem
) VALUES 
-- Template 1: Residencial
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Básico Residencial' LIMIT 1), 'Área Comum', 'Estrutural', 'Fundação', 1),
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Básico Residencial' LIMIT 1), 'Área Comum', 'Estrutural', 'Pilares', 2),
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Básico Residencial' LIMIT 1), 'Área Comum', 'Estrutural', 'Vigas', 3),
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Básico Residencial' LIMIT 1), 'Área Comum', 'Hidráulico', 'Tubulações', 4),
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Básico Residencial' LIMIT 1), 'Área Comum', 'Elétrico', 'Instalações', 5),
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Básico Residencial' LIMIT 1), 'Hall', 'Acabamentos', 'Pintura', 6),
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Básico Residencial' LIMIT 1), 'Hall', 'Acabamentos', 'Piso', 7),

-- Template 2: Comercial
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Comercial' LIMIT 1), 'Lobby', 'Estrutural', 'Estrutura Principal', 1),
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Comercial' LIMIT 1), 'Lobby', 'HVAC', 'Sistema de Climatização', 2),
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Comercial' LIMIT 1), 'Escritórios', 'Elétrico', 'Tomadas e Iluminação', 3),
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Comercial' LIMIT 1), 'Escritórios', 'Acabamentos', 'Divisórias', 4),
((SELECT id FROM public.templates_vistoria WHERE nome = 'Template Comercial' LIMIT 1), 'Área Técnica', 'Segurança', 'Sistema de Incêndio', 5);