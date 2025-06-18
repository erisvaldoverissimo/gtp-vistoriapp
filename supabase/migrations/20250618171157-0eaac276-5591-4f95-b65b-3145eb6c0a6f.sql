
-- Criar tabela de condomínios
CREATE TABLE public.condominios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cidade TEXT,
  estado TEXT DEFAULT 'SP',
  cep TEXT,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de vistorias
CREATE TABLE public.vistorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_interno TEXT NOT NULL,
  id_sequencial INTEGER NOT NULL,
  data_vistoria DATE NOT NULL,
  observacoes_gerais TEXT,
  responsavel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Em Andamento',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(condominio_id, id_sequencial)
);

-- Criar tabela de grupos de vistoria
CREATE TABLE public.grupos_vistoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vistoria_id UUID NOT NULL REFERENCES public.vistorias(id) ON DELETE CASCADE,
  ambiente TEXT NOT NULL,
  grupo TEXT NOT NULL,
  item TEXT NOT NULL,
  status TEXT NOT NULL,
  parecer TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de fotos das vistorias
CREATE TABLE public.fotos_vistoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo_vistoria_id UUID NOT NULL REFERENCES public.grupos_vistoria(id) ON DELETE CASCADE,
  arquivo_nome TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  descricao TEXT,
  tamanho_bytes INTEGER,
  tipo_mime TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vistorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos_vistoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos_vistoria ENABLE ROW LEVEL SECURITY;

-- Políticas para condomínios (todos os usuários autenticados podem ver e gerenciar)
CREATE POLICY "Usuários podem ver condomínios" 
  ON public.condominios 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem criar condomínios" 
  ON public.condominios 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar condomínios" 
  ON public.condominios 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem deletar condomínios" 
  ON public.condominios 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Políticas para vistorias (usuários só podem ver suas próprias vistorias)
CREATE POLICY "Usuários podem ver suas vistorias" 
  ON public.vistorias 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas vistorias" 
  ON public.vistorias 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas vistorias" 
  ON public.vistorias 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas vistorias" 
  ON public.vistorias 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para grupos de vistoria (através da vistoria)
CREATE POLICY "Usuários podem ver grupos de suas vistorias" 
  ON public.grupos_vistoria 
  FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.vistorias 
    WHERE id = grupos_vistoria.vistoria_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem criar grupos em suas vistorias" 
  ON public.grupos_vistoria 
  FOR INSERT 
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.vistorias 
    WHERE id = grupos_vistoria.vistoria_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar grupos de suas vistorias" 
  ON public.grupos_vistoria 
  FOR UPDATE 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.vistorias 
    WHERE id = grupos_vistoria.vistoria_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem deletar grupos de suas vistorias" 
  ON public.grupos_vistoria 
  FOR DELETE 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.vistorias 
    WHERE id = grupos_vistoria.vistoria_id 
    AND user_id = auth.uid()
  ));

-- Políticas para fotos (através do grupo de vistoria)
CREATE POLICY "Usuários podem ver fotos de suas vistorias" 
  ON public.fotos_vistoria 
  FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.grupos_vistoria gv
    JOIN public.vistorias v ON v.id = gv.vistoria_id
    WHERE gv.id = fotos_vistoria.grupo_vistoria_id 
    AND v.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem criar fotos em suas vistorias" 
  ON public.fotos_vistoria 
  FOR INSERT 
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.grupos_vistoria gv
    JOIN public.vistorias v ON v.id = gv.vistoria_id
    WHERE gv.id = fotos_vistoria.grupo_vistoria_id 
    AND v.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar fotos de suas vistorias" 
  ON public.fotos_vistoria 
  FOR UPDATE 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.grupos_vistoria gv
    JOIN public.vistorias v ON v.id = gv.vistoria_id
    WHERE gv.id = fotos_vistoria.grupo_vistoria_id 
    AND v.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem deletar fotos de suas vistorias" 
  ON public.fotos_vistoria 
  FOR DELETE 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.grupos_vistoria gv
    JOIN public.vistorias v ON v.id = gv.vistoria_id
    WHERE gv.id = fotos_vistoria.grupo_vistoria_id 
    AND v.user_id = auth.uid()
  ));

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_condominios_updated_at
  BEFORE UPDATE ON public.condominios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_vistorias_updated_at
  BEFORE UPDATE ON public.vistorias
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_grupos_vistoria_updated_at
  BEFORE UPDATE ON public.grupos_vistoria
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Inserir alguns dados iniciais para teste
INSERT INTO public.condominios (nome, endereco, cidade, estado, cep, telefone, email) VALUES
('Condomínio Edifício Artur Ramos', 'Rua Artur Ramos, 123', 'São Paulo', 'SP', '01234-567', '(11) 1234-5678', 'contato@arthur.com.br'),
('Residencial Park View', 'Av. das Flores, 456', 'São Paulo', 'SP', '02345-678', '(11) 2345-6789', 'sindico@parkview.com.br');
