"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { supabase } from "@/lib/supabase-client"

export default function SupabaseSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  // SQL para criar o trigger que cria perfis automaticamente
  const createTriggerSQL = `
-- Função para criar perfil automaticamente quando um usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    email, 
    user_type, 
    registration_number, 
    created_at, 
    updated_at
  ) VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.email,
    new.raw_user_meta_data->>'userType', 
    'R' || floor(random() * 1000000)::text, 
    now(), 
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `

  // SQL para configurar as políticas de segurança (RLS)
  const setupRLSPoliciesSQL = `
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
  WITH CHECK (id = auth.uid());
  `

  async function setupTrigger() {
    setIsLoading(true)
    setResults(null)

    try {
      // Executar o SQL para criar o trigger
      const { error } = await supabase.rpc("exec_sql", { sql: createTriggerSQL })

      if (error) {
        throw error
      }

      setResults({
        success: true,
        message:
          "Trigger configurado com sucesso! Agora o Supabase criará automaticamente perfis quando novos usuários se registrarem.",
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Sucesso!",
        description: "Trigger configurado com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao configurar trigger:", error)
      setResults({
        success: false,
        error: error.message || "Erro desconhecido",
        note: "Você precisa executar este SQL diretamente no SQL Editor do Supabase. Copie o código abaixo e execute-o lá.",
        sql: createTriggerSQL,
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Erro ao configurar trigger",
        description: "Verifique o console para mais detalhes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function setupRLSPolicies() {
    setIsLoading(true)
    setResults(null)

    try {
      // Executar o SQL para configurar as políticas de RLS
      const { error } = await supabase.rpc("exec_sql", { sql: setupRLSPoliciesSQL })

      if (error) {
        throw error
      }

      setResults({
        success: true,
        message:
          "Políticas de segurança (RLS) configuradas com sucesso! Agora os usuários podem se registrar e acessar seus perfis.",
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Sucesso!",
        description: "Políticas de segurança configuradas com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao configurar políticas de RLS:", error)
      setResults({
        success: false,
        error: error.message || "Erro desconhecido",
        note: "Você precisa executar este SQL diretamente no SQL Editor do Supabase. Copie o código abaixo e execute-o lá.",
        sql: setupRLSPoliciesSQL,
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Erro ao configurar políticas de RLS",
        description: "Verifique o console para mais detalhes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Supabase</CardTitle>
          <CardDescription>
            Configure o Supabase para permitir o registro de usuários e a criação automática de perfis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trigger">
            <TabsList className="mb-4">
              <TabsTrigger value="trigger">Trigger de Perfil</TabsTrigger>
              <TabsTrigger value="rls">Políticas de Segurança (RLS)</TabsTrigger>
              <TabsTrigger value="manual">Configuração Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="trigger">
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                  <h3 className="font-bold mb-2 text-yellow-800 dark:text-yellow-200">O que é o Trigger?</h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    O trigger "on_auth_user_created" é executado automaticamente quando um novo usuário se registra. Ele
                    cria um perfil na tabela "profiles" com os dados do usuário.
                  </p>
                </div>

                <Button onClick={setupTrigger} disabled={isLoading} className="w-full">
                  {isLoading ? "Configurando..." : "Configurar Trigger"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="rls">
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                  <h3 className="font-bold mb-2 text-yellow-800 dark:text-yellow-200">
                    O que são Políticas de Segurança (RLS)?
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    As políticas de segurança (Row Level Security) controlam quem pode ler, inserir, atualizar ou
                    excluir dados nas tabelas. Sem as políticas corretas, os usuários não conseguirão se registrar ou
                    acessar seus perfis.
                  </p>
                </div>

                <Button onClick={setupRLSPolicies} disabled={isLoading} className="w-full">
                  {isLoading ? "Configurando..." : "Configurar Políticas de Segurança"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="manual">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <h3 className="font-bold mb-2 text-blue-800 dark:text-blue-200">Configuração Manual no Supabase</h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Se os botões acima não funcionarem, você precisará configurar o Supabase manualmente. Siga estas
                    etapas:
                  </p>
                  <ol className="list-decimal list-inside mt-2 text-blue-700 dark:text-blue-300">
                    <li>Acesse o painel do Supabase</li>
                    <li>Vá para o SQL Editor</li>
                    <li>Cole e execute os códigos SQL abaixo</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-bold mb-2">SQL para criar o trigger:</h4>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs">
                    {createTriggerSQL}
                  </pre>
                </div>

                <div>
                  <h4 className="font-bold mb-2">SQL para configurar as políticas de segurança:</h4>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs">
                    {setupRLSPoliciesSQL}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {results && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Resultados:</h3>
              {results.success ? (
                <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-md text-green-800 dark:text-green-300">
                  <p>{results.message}</p>
                </div>
              ) : (
                <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-300">
                  <p className="font-semibold">Erro:</p>
                  <p>{results.error}</p>
                  {results.note && (
                    <div className="mt-2">
                      <p className="font-semibold">{results.note}</p>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs mt-2">
                        {results.sql}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Link href="/debug">
              <Button variant="outline">Verificar Diagnóstico</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Voltar para Home</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

