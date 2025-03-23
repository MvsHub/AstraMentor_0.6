"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DebugPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabaseInfo, setSupabaseInfo] = useState<any>(null)
  const [authSession, setAuthSession] = useState<any>(null)
  const [profilesTable, setProfilesTable] = useState<any>(null)
  const [postsTable, setPostsTable] = useState<any>(null)
  const [rlsPolicies, setRlsPolicies] = useState<any>(null)

  useEffect(() => {
    async function checkSupabase() {
      setLoading(true)
      setError(null)

      try {
        // Verificar conexão com Supabase
        const supabaseUrl = supabase.supabaseUrl
        const supabaseKey = supabase.supabaseKey

        setSupabaseInfo({
          url: supabaseUrl,
          keyLength: supabaseKey ? supabaseKey.length : 0,
          keyStart: supabaseKey ? supabaseKey.substring(0, 5) : "",
          keyEnd: supabaseKey ? supabaseKey.substring(supabaseKey.length - 5) : "",
        })

        // Verificar sessão atual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          throw new Error(`Erro ao verificar sessão: ${sessionError.message}`)
        }
        setAuthSession(sessionData)

        // Verificar tabela de perfis
        const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("count")

        if (profilesError) {
          if (profilesError.message.includes("permission denied")) {
            setProfilesTable({
              error: "Permissão negada. As políticas de segurança (RLS) precisam ser configuradas.",
              details: profilesError,
            })
          } else {
            setProfilesTable({
              error: profilesError.message,
              details: profilesError,
            })
          }
        } else {
          setProfilesTable(profilesData)
        }

        // Verificar tabela de posts
        const { data: postsData, error: postsError } = await supabase.from("posts").select("count")
        if (postsError) {
          if (postsError.message.includes("permission denied")) {
            setPostsTable({
              error: "Permissão negada. As políticas de segurança (RLS) precisam ser configuradas.",
              details: postsError,
            })
          } else {
            setPostsTable({
              error: postsError.message,
              details: postsError,
            })
          }
        } else {
          setPostsTable(postsData)
        }

        // Tentar verificar políticas RLS
        try {
          const { data: rlsData, error: rlsError } = await supabase.from("pg_policies").select("*").limit(1)

          if (rlsError) {
            setRlsPolicies({
              status: "Não foi possível verificar as políticas RLS",
              error: rlsError.message,
            })
          } else {
            setRlsPolicies({
              status: "Verificação de políticas RLS disponível",
              data: rlsData,
            })
          }
        } catch (rlsError: any) {
          setRlsPolicies({
            status: "Não foi possível verificar as políticas RLS",
            error: rlsError.message || "Erro desconhecido",
          })
        }
      } catch (err: any) {
        console.error("Erro de diagnóstico:", err)
        setError(err.message || "Erro desconhecido ao verificar Supabase")
      } finally {
        setLoading(false)
      }
    }

    checkSupabase()
  }, [])

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico do Supabase</CardTitle>
          <CardDescription>
            Esta página verifica a conexão com o Supabase e o acesso às tabelas principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-300">
              <h3 className="font-bold mb-2">Erro detectado:</h3>
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">Informações do Supabase:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                  {JSON.stringify(supabaseInfo, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-bold mb-2">Sessão de Autenticação:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                  {JSON.stringify(authSession, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-bold mb-2">Tabela de Perfis:</h3>
                {profilesTable && profilesTable.error ? (
                  <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-300">
                    <p className="font-semibold">Erro:</p>
                    <p>{profilesTable.error}</p>
                    <Link
                      href="/supabase-setup"
                      className="text-blue-600 dark:text-blue-400 text-sm underline mt-2 inline-block"
                    >
                      Configurar Políticas de Segurança
                    </Link>
                  </div>
                ) : (
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                    {JSON.stringify(profilesTable, null, 2)}
                  </pre>
                )}
              </div>

              <div>
                <h3 className="font-bold mb-2">Tabela de Posts:</h3>
                {postsTable && postsTable.error ? (
                  <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-300">
                    <p className="font-semibold">Erro:</p>
                    <p>{postsTable.error}</p>
                    <Link
                      href="/supabase-setup"
                      className="text-blue-600 dark:text-blue-400 text-sm underline mt-2 inline-block"
                    >
                      Configurar Políticas de Segurança
                    </Link>
                  </div>
                ) : (
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                    {JSON.stringify(postsTable, null, 2)}
                  </pre>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                <h3 className="font-bold mb-2 text-yellow-800 dark:text-yellow-200">Informações sobre o Trigger:</h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  O Supabase possui um trigger chamado "on_auth_user_created" que é executado automaticamente quando um
                  novo usuário é registrado. Este trigger cria um perfil na tabela "profiles" com os dados do usuário.
                </p>
                <p className="mt-2 text-yellow-700 dark:text-yellow-300">
                  Isso significa que não precisamos criar manualmente o perfil do usuário em nosso código - o Supabase
                  faz isso automaticamente!
                </p>
                <Link
                  href="/supabase-setup"
                  className="text-blue-600 dark:text-blue-400 text-sm underline mt-2 inline-block"
                >
                  Configurar Trigger
                </Link>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h3 className="font-bold mb-2 text-blue-800 dark:text-blue-200">
                  Status das Políticas de Segurança (RLS):
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  As políticas de segurança (Row Level Security) controlam quem pode ler, inserir, atualizar ou excluir
                  dados nas tabelas. Sem as políticas corretas, os usuários não conseguirão se registrar ou acessar seus
                  perfis.
                </p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto mt-2 text-xs">
                  {JSON.stringify(rlsPolicies, null, 2)}
                </pre>
                <Link
                  href="/supabase-setup"
                  className="text-blue-600 dark:text-blue-400 text-sm underline mt-2 inline-block"
                >
                  Configurar Políticas de Segurança
                </Link>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button onClick={() => window.location.reload()}>Atualizar Diagnóstico</Button>
            <div className="space-x-2">
              <Link href="/supabase-setup">
                <Button variant="outline">Configurar Supabase</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Voltar para Home</Button>
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

