-- Criar o bucket post-images se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir leitura pública de arquivos no bucket post-images
CREATE POLICY "Permitir leitura pública de imagens" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'post-images');

-- Política para permitir que usuários autenticados façam upload de arquivos
CREATE POLICY "Permitir upload de imagens por usuários autenticados" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'post-images');

-- Política para permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY "Permitir atualização de imagens pelo proprietário" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'post-images' AND auth.uid()::text = owner);

-- Política para permitir que usuários autenticados excluam seus próprios arquivos
CREATE POLICY "Permitir exclusão de imagens pelo proprietário" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'post-images' AND auth.uid()::text = owner);

