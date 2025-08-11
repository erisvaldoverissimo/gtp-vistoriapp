-- Fix RLS for visualization: allow sindicos/admins to SELECT grupos/fotos via condominio access

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.grupos_vistoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fotos_vistoria ENABLE ROW LEVEL SECURITY;

-- Replace or create SELECT policy for grupos_vistoria
DROP POLICY IF EXISTS "Select grupos por condominio (sindico e admin)" ON public.grupos_vistoria;
CREATE POLICY "Select grupos por condominio (sindico e admin)"
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

-- Replace or create SELECT policy for fotos_vistoria
DROP POLICY IF EXISTS "Select fotos por condominio (sindico e admin)" ON public.fotos_vistoria;
CREATE POLICY "Select fotos por condominio (sindico e admin)"
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