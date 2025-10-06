-- Fix: Restrict knowledge base document access to owners only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Usuários podem visualizar base de conhecimento" ON public.base_conhecimento;

-- Create a new restrictive policy that only allows users to view their own documents
CREATE POLICY "Usuários podem visualizar sua própria base de conhecimento"
ON public.base_conhecimento
FOR SELECT
TO authenticated
USING (auth.uid() = usuario_id);

-- Note: This ensures users can only see knowledge base documents they uploaded.
-- If you need shared documents in the future, you'll need to create a sharing mechanism.