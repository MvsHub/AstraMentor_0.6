-- Função para incrementar a contagem de comentários em um post
CREATE OR REPLACE FUNCTION increment_count(row_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Obter a contagem atual
  SELECT COALESCE(comments_count, 0) INTO current_count FROM posts WHERE id = row_id;
  
  -- Incrementar a contagem
  UPDATE posts SET 
    comments_count = current_count + 1,
    updated_at = NOW()
  WHERE id = row_id;
  
  -- Retornar a nova contagem
  RETURN current_count + 1;
END;
$$;

-- Conceder permissão para anon (usuários não autenticados)
GRANT EXECUTE ON FUNCTION increment_count TO anon;

-- Conceder permissão para authenticated (usuários autenticados)
GRANT EXECUTE ON FUNCTION increment_count TO authenticated;

