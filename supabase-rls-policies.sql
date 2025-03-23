-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de todos os perfis para usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de perfis" ON public.profiles;
CREATE POLICY "Permitir leitura de perfis" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Política para permitir que usuários vejam seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil" 
  ON public.profiles 
  FOR SELECT 
  TO anon 
  USING (id = auth.uid());

-- Política para permitir que usuários editem seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem editar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem editar seu próprio perfil" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (id = auth.uid());

-- Política para permitir inserção de perfis pelo trigger
DROP POLICY IF EXISTS "Permitir inserção de perfis pelo trigger" ON public.profiles;
CREATE POLICY "Permitir inserção de perfis pelo trigger" 
  ON public.profiles 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Política para permitir inserção de perfis por usuários autenticados
DROP POLICY IF EXISTS "Permitir inserção de perfis por usuários autenticados" ON public.profiles;
CREATE POLICY "Permitir inserção de perfis por usuários autenticados" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

