-- Corrigir problemas de segurança detectados pelo linter
-- Atualizar funções com search_path seguro

-- Corrigir função handle_templates_updated_at
CREATE OR REPLACE FUNCTION public.handle_templates_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Corrigir função handle_updated_at existente (se necessário)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;