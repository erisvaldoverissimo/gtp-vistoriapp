
-- Criar bucket para fotos de vistoria
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-vistoria', 'fotos-vistoria', true);

-- Política para permitir que usuários autenticados vejam fotos
CREATE POLICY "Usuários podem ver fotos de vistoria" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'fotos-vistoria');

-- Política para permitir que usuários autenticados façam upload de fotos
CREATE POLICY "Usuários podem fazer upload de fotos" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'fotos-vistoria' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para permitir que usuários atualizem suas próprias fotos
CREATE POLICY "Usuários podem atualizar suas fotos" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'fotos-vistoria' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para permitir que usuários deletem suas próprias fotos
CREATE POLICY "Usuários podem deletar suas fotos" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'fotos-vistoria' AND auth.uid()::text = (storage.foldername(name))[1]);
