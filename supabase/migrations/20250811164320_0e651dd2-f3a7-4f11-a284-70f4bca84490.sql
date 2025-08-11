-- Adicionar campos de e-mail para cópia na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN email_copia_1 TEXT,
ADD COLUMN email_copia_2 TEXT,
ADD COLUMN email_copia_3 TEXT;