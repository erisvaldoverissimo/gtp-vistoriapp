
-- Atualizar a constraint da tabela mensagens_chat para permitir o tipo 'analytics'
ALTER TABLE public.mensagens_chat 
DROP CONSTRAINT IF EXISTS mensagens_chat_type_check;

ALTER TABLE public.mensagens_chat 
ADD CONSTRAINT mensagens_chat_type_check 
CHECK (type IN ('text', 'audio', 'analytics'));
