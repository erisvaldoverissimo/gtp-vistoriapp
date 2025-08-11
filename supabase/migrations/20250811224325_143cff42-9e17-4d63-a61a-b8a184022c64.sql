-- Grant SELECT access on grupos_vistoria and fotos_vistoria to síndicos and admins for vistorias in their condominios
-- This ensures that 'síndico' users can visualize reports identically to admins

-- Enable RLS (idempotent)
ALTER TABLE IF EXISTS public.grupos_vistoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fotos_vistoria ENABLE ROW LEVEL SECURITY;

-- Allow selecting grupos_vistoria when the user has access to the vistoria's condomínio
CREATE POLICY IF NOT EXISTS "Select grupos por condominio (sindico e admin)"
ON public.grupos_vistoria
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.vistorias v
    WHERE v.id = grupos_vistoria.vistoria_id
      AND public.has_condominio_access(auth.uid(), v.condominio_id)
  )
);

-- Allow selecting fotos_vistoria when the user has access to the vistoria's condomínio via the grupo_vistoria relation
CREATE POLICY IF NOT EXISTS "Select fotos por condominio (sindico e admin)"
ON public.fotos_vistoria
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.grupos_vistoria gv
    JOIN public.vistorias v ON v.id = gv.vistoria_id
    WHERE gv.id = fotos_vistoria.grupo_vistoria_id
      AND public.has_condominio_access(auth.uid(), v.condominio_id)
  )
);