-- Esta função deve ser executada no SQL Editor do Supabase
CREATE OR REPLACE FUNCTION get_table_definition(table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable,
        'column_default', column_default
      )
    )
    FROM information_schema.columns
    WHERE table_name = $1
    AND table_schema = 'public'
  );
END;
$$;

-- Conceder permissão para anon (usuários não autenticados)
GRANT EXECUTE ON FUNCTION get_table_definition TO anon;

-- Conceder permissão para authenticated (usuários autenticados)
GRANT EXECUTE ON FUNCTION get_table_definition TO authenticated;

