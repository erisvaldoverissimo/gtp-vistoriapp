-- Drop existing SELECT policies on profiles table
DROP POLICY IF EXISTS "Usuários podem ver perfil próprio ou admins veem todos" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer perfil" ON public.profiles;

-- Create more granular SELECT policy
-- Users can see:
-- 1. Their own profile
-- 2. Admins can see all profiles
-- 3. Síndicos can only see profiles of users in their condominiums
CREATE POLICY "Users can view accessible profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1
    FROM public.usuario_condominios uc1
    WHERE uc1.user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.usuario_condominios uc2
      WHERE uc2.user_id = profiles.id
      AND uc2.condominio_id = uc1.condominio_id
    )
  )
);

-- Recreate UPDATE policy for admins with better naming
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add comment explaining the security model
COMMENT ON POLICY "Users can view accessible profiles" ON public.profiles IS 
'Users can see their own profile, admins can see all profiles, and síndicos can see profiles of users in their shared condominiums';