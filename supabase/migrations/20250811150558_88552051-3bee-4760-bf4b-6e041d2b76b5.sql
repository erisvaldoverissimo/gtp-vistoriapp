-- Criar enum para tipos de perfil/role
CREATE TYPE public.user_role AS ENUM ('admin', 'sindico');

-- Adicionar campo role na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN role public.user_role DEFAULT 'sindico';

-- Criar tabela para associar síndicos aos condomínios
CREATE TABLE public.usuario_condominios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, condominio_id)
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.usuario_condominios ENABLE ROW LEVEL SECURITY;

-- Criar função para verificar se usuário tem role específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Função para verificar se usuário tem acesso ao condomínio
CREATE OR REPLACE FUNCTION public.has_condominio_access(_user_id UUID, _condominio_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    public.is_admin(_user_id) OR
    EXISTS (
      SELECT 1 
      FROM public.usuario_condominios 
      WHERE user_id = _user_id AND condominio_id = _condominio_id
    )
$$;

-- Políticas RLS para usuario_condominios
CREATE POLICY "Usuários podem ver suas associações ou admins veem tudo"
ON public.usuario_condominios
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins podem criar associações"
ON public.usuario_condominios
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar associações"
ON public.usuario_condominios
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar associações"
ON public.usuario_condominios
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Atualizar políticas RLS da tabela profiles para permitir que admins vejam todos os usuários
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;

CREATE POLICY "Usuários podem ver perfil próprio ou admins veem todos"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins podem atualizar qualquer perfil"
ON public.profiles
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Atualizar políticas RLS para condominios
DROP POLICY IF EXISTS "Usuários podem ver condomínios" ON public.condominios;

CREATE POLICY "Usuários podem ver condomínios com acesso ou admins veem todos"
ON public.condominios
FOR SELECT
USING (
  public.is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 
    FROM public.usuario_condominios 
    WHERE user_id = auth.uid() AND condominio_id = condominios.id
  )
);

CREATE POLICY "Admins podem gerenciar condomínios"
ON public.condominios
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Atualizar políticas RLS para vistorias
DROP POLICY IF EXISTS "Usuários podem ver suas vistorias" ON public.vistorias;
DROP POLICY IF EXISTS "Usuários podem criar suas vistorias" ON public.vistorias;
DROP POLICY IF EXISTS "Usuários podem atualizar suas vistorias" ON public.vistorias;
DROP POLICY IF EXISTS "Usuários podem deletar suas vistorias" ON public.vistorias;

CREATE POLICY "Usuários podem ver vistorias com acesso"
ON public.vistorias
FOR SELECT
USING (
  auth.uid() = user_id OR
  public.is_admin(auth.uid()) OR
  public.has_condominio_access(auth.uid(), condominio_id)
);

CREATE POLICY "Usuários podem criar vistorias em condomínios com acesso"
ON public.vistorias
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (public.is_admin(auth.uid()) OR public.has_condominio_access(auth.uid(), condominio_id))
);

CREATE POLICY "Usuários podem atualizar suas vistorias ou admins todas"
ON public.vistorias
FOR UPDATE
USING (
  auth.uid() = user_id OR
  public.is_admin(auth.uid())
);

CREATE POLICY "Usuários podem deletar suas vistorias ou admins todas"
ON public.vistorias
FOR DELETE
USING (
  auth.uid() = user_id OR
  public.is_admin(auth.uid())
);

-- Criar primeiro usuário admin (será o primeiro usuário que se registrar)
-- Esta função será executada apenas uma vez quando não houver nenhum admin
CREATE OR REPLACE FUNCTION public.ensure_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Se não existir nenhum admin, torna o primeiro usuário admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    NEW.role = 'admin';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para garantir que o primeiro usuário seja admin
CREATE TRIGGER ensure_first_admin_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_first_admin();