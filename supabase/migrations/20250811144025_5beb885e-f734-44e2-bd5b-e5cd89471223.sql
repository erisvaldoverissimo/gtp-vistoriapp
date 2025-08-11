-- Adicionar campos para checklist técnico na tabela grupos_vistoria
ALTER TABLE grupos_vistoria 
ADD COLUMN modo_checklist boolean DEFAULT false,
ADD COLUMN checklist_tecnico jsonb;