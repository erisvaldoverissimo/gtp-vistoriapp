-- Corrigir a função para ter search_path seguro
CREATE OR REPLACE FUNCTION obter_proximo_numero_sequencial(condominio_uuid UUID)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    proximo_numero INTEGER;
BEGIN
    -- Usar SELECT FOR UPDATE para evitar condições de corrida
    SELECT COALESCE(MAX(id_sequencial), 0) + 1 
    INTO proximo_numero
    FROM public.vistorias 
    WHERE condominio_id = condominio_uuid
    FOR UPDATE;
    
    RETURN proximo_numero;
END;
$$;