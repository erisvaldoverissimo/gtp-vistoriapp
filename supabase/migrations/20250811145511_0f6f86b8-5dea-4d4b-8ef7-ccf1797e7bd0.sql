-- Adicionar constraint única para numero_interno por condomínio para evitar duplicatas
ALTER TABLE vistorias 
ADD CONSTRAINT vistorias_numero_interno_condominio_unique 
UNIQUE (condominio_id, numero_interno);

-- Adicionar constraint única para id_sequencial por condomínio para evitar duplicatas  
ALTER TABLE vistorias 
ADD CONSTRAINT vistorias_id_sequencial_condominio_unique 
UNIQUE (condominio_id, id_sequencial);

-- Criar função para obter próximo número sequencial de forma atômica
CREATE OR REPLACE FUNCTION obter_proximo_numero_sequencial(condominio_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    proximo_numero INTEGER;
BEGIN
    -- Usar SELECT FOR UPDATE para evitar condições de corrida
    SELECT COALESCE(MAX(id_sequencial), 0) + 1 
    INTO proximo_numero
    FROM vistorias 
    WHERE condominio_id = condominio_uuid
    FOR UPDATE;
    
    RETURN proximo_numero;
END;
$$ LANGUAGE plpgsql;