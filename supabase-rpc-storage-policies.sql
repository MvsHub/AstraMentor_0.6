-- Função para aplicar políticas de segurança para um bucket específico
CREATE OR REPLACE FUNCTION apply_storage_policies(bucket_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Política para permitir leitura pública de arquivos no bucket
  BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública de imagens" ON storage.objects;
    CREATE POLICY "Permitir leitura pública de imagens" 
    ON storage.objects 
    FOR SELECT 
    TO public 
    USING (bucket_id = bucket_name);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar política de leitura: %', SQLERRM;
  END;

  -- Política para permitir que usuários autenticados façam upload de arquivos
  BEGIN
    DROP POLICY IF EXISTS "Permitir upload de imagens por usuários autenticados" ON storage.objects;
    CREATE POLICY "Permitir upload de imagens por usuários autenticados" 
    ON storage.objects 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id = bucket_name);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar política de upload: %', SQLERRM;
  END;

  -- Política para permitir que usuários autenticados atualizem seus próprios arquivos
  BEGIN
    DROP POLICY IF EXISTS "Permitir atualização de imagens pelo proprietário" ON storage.objects;
    CREATE POLICY "Permitir atualização de imagens pelo proprietário" 
    ON storage.objects 
    FOR UPDATE 
    TO authenticated 
    USING (bucket_id = bucket_name AND auth.uid()::text = owner);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar política de atualização: %', SQLERRM;
  END;

  -- Política para permitir que usuários autenticados excluam seus próprios arquivos
  BEGIN
    DROP POLICY IF EXISTS "Permitir exclusão de imagens pelo proprietário" ON storage.objects;
    CREATE POLICY "Permitir exclusão de imagens pelo proprietário" 
    ON storage.objects 
    FOR DELETE 
    TO authenticated 
    USING (bucket_id = bucket_name AND auth.uid()::text = owner);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar política de exclusão: %', SQLERRM;
  END;

  RETURN TRUE;
END;
$$;

-- Conceder permissão para anon (usuários não autenticados)
GRANT EXECUTE ON FUNCTION apply_storage_policies TO anon;

-- Conceder permissão para authenticated (usuários autenticados)
GRANT EXECUTE ON FUNCTION apply_storage_policies TO authenticated;

