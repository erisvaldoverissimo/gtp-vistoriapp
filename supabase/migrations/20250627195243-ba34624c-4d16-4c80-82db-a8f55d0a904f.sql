
-- Adicionar as colunas responsavel e telefone_responsavel à tabela condominios
ALTER TABLE public.condominios 
ADD COLUMN IF NOT EXISTS responsavel TEXT,
ADD COLUMN IF NOT EXISTS telefone_responsavel TEXT;
