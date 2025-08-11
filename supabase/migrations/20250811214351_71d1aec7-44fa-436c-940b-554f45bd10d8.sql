-- Restrict síndico role to read-only for vistorias and related tables, and tighten condominios modifications to admins only.

-- VISTORIAS: restrict INSERT/UPDATE/DELETE for 'sindico'
DROP POLICY IF EXISTS "Usuários podem atualizar suas vistorias ou admins todas" ON public.vistorias;
CREATE POLICY "Atualizar vistorias (não síndicos ou admins)"
ON public.vistorias
FOR UPDATE
USING (
  (auth.uid() = user_id OR is_admin(auth.uid()))
  AND NOT has_role(auth.uid(), 'sindico')
);

DROP POLICY IF EXISTS "Usuários podem criar vistorias em condomínios com acesso" ON public.vistorias;
CREATE POLICY "Criar vistorias (não síndicos)"
ON public.vistorias
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id)
  AND (is_admin(auth.uid()) OR has_condominio_access(auth.uid(), condominio_id))
  AND NOT has_role(auth.uid(), 'sindico')
);

DROP POLICY IF EXISTS "Usuários podem deletar suas vistorias ou admins todas" ON public.vistorias;
CREATE POLICY "Deletar vistorias (não síndicos ou admins)"
ON public.vistorias
FOR DELETE
USING (
  (auth.uid() = user_id OR is_admin(auth.uid()))
  AND NOT has_role(auth.uid(), 'sindico')
);

-- Keep existing SELECT policy as-is

-- GRUPOS_VISTORIA: restrict INSERT/UPDATE/DELETE for 'sindico'
DROP POLICY IF EXISTS "Usuários podem atualizar grupos de suas vistorias" ON public.grupos_vistoria;
CREATE POLICY "Atualizar grupos (não síndicos)"
ON public.grupos_vistoria
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.vistorias
    WHERE vistorias.id = grupos_vistoria.vistoria_id
      AND vistorias.user_id = auth.uid()
  )
  AND NOT has_role(auth.uid(), 'sindico')
);

DROP POLICY IF EXISTS "Usuários podem criar grupos em suas vistorias" ON public.grupos_vistoria;
CREATE POLICY "Criar grupos (não síndicos)"
ON public.grupos_vistoria
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vistorias
    WHERE vistorias.id = grupos_vistoria.vistoria_id
      AND vistorias.user_id = auth.uid()
  )
  AND NOT has_role(auth.uid(), 'sindico')
);

DROP POLICY IF EXISTS "Usuários podem deletar grupos de suas vistorias" ON public.grupos_vistoria;
CREATE POLICY "Deletar grupos (não síndicos)"
ON public.grupos_vistoria
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.vistorias
    WHERE vistorias.id = grupos_vistoria.vistoria_id
      AND vistorias.user_id = auth.uid()
  )
  AND NOT has_role(auth.uid(), 'sindico')
);

-- Keep existing SELECT policy as-is

-- FOTOS_VISTORIA: restrict INSERT/UPDATE/DELETE for 'sindico'
DROP POLICY IF EXISTS "Usuários podem atualizar fotos de suas vistorias" ON public.fotos_vistoria;
CREATE POLICY "Atualizar fotos (não síndicos)"
ON public.fotos_vistoria
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.grupos_vistoria gv
    JOIN public.vistorias v ON v.id = gv.vistoria_id
    WHERE gv.id = fotos_vistoria.grupo_vistoria_id
      AND v.user_id = auth.uid()
  )
  AND NOT has_role(auth.uid(), 'sindico')
);

DROP POLICY IF EXISTS "Usuários podem criar fotos em suas vistorias" ON public.fotos_vistoria;
CREATE POLICY "Criar fotos (não síndicos)"
ON public.fotos_vistoria
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.grupos_vistoria gv
    JOIN public.vistorias v ON v.id = gv.vistoria_id
    WHERE gv.id = fotos_vistoria.grupo_vistoria_id
      AND v.user_id = auth.uid()
  )
  AND NOT has_role(auth.uid(), 'sindico')
);

DROP POLICY IF EXISTS "Usuários podem deletar fotos de suas vistorias" ON public.fotos_vistoria;
CREATE POLICY "Deletar fotos (não síndicos)"
ON public.fotos_vistoria
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.grupos_vistoria gv
    JOIN public.vistorias v ON v.id = gv.vistoria_id
    WHERE gv.id = fotos_vistoria.grupo_vistoria_id
      AND v.user_id = auth.uid()
  )
  AND NOT has_role(auth.uid(), 'sindico')
);

-- Keep existing SELECT policy as-is

-- CONDOMINIOS: restrict modifications to admins only (remove permissive policies)
DROP POLICY IF EXISTS "Usuários podem atualizar condomínios" ON public.condominios;
DROP POLICY IF EXISTS "Usuários podem criar condomínios" ON public.condominios;
DROP POLICY IF EXISTS "Usuários podem deletar condomínios" ON public.condominios;

-- Keep existing admin-only and select policies as-is