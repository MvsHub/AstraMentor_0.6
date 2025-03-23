"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthDiagnosticPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function runDiagnostics() {
      try {
        setIsLoading(true)

        // Verificar sessão
        console.log("Verificando sessão...")
        const { data: sessionResult, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw new Error(`Erro ao obter sessão: ${sessionError.message}`)
        }

        setSessionData(sessionResult)

        // Verificar usuário atual
        console.log("Verificando usuário atual...")
        const { data: userResult, error: userError } = await supabase.auth.getUser()

        if (userError) {
          throw new Error(`Erro ao obter usuário: ${userError.message}`)
        }

        setUserData(userResult)
      } catch (err: any) {
        console.error("Erro durante diagnóstico:", err)
        setError(err.message || "Erro durante diagnóstico de autenticação")
      } finally {
        setIsLoading(false)
      }
    }

    runDiagnostics()
  }, [])

  const refreshSession = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      setSessionData({ session: data.session })
      setUserData({ user: data.user })
      alert("Sessão atualizada com sucesso!")
    } catch (err: any) {
      setError(err.message)
      alert(`Erro ao atualizar sessão: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setSessionData(null)
      setUserData(null)
      alert("Logout realizado com sucesso!")
    } catch (err: any) {
      alert(`Erro ao fazer logout: ${err.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col p-4">
      <Card className="max-w-4xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Diagnóstico de Autenticação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md">
                <h3 className="font-bold mb-2">Erro:</h3>
                <p>{error}</p>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold mb-2">Status da Sessão</h2>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="mb-2">
                  <span className="font-semibold">Sessão Ativa:</span> {sessionData?.session ? "Sim" : "Não"}
                </p>
                {sessionData?.session && (
                  <>
                    <p className="mb-2">
                      <span className="font-semibold">Expira em:</span>{" "}
                      {new Date(sessionData.session.expires_at * 1000).toLocaleString()}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">ID da Sessão:</span> {sessionData.session.id}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-2">Dados do Usuário</h2>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                {userData?.user ? (
                  <>
                    <p className="mb-2">
                      <span className="font-semibold">ID:</span> {userData.user.id}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Email:</span> {userData.user.email}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Criado em:</span>{" "}
                      {new Date(userData.user.created_at).toLocaleString()}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Email Confirmado:</span>{" "}
                      {userData.user.email_confirmed_at ? "Sim" : "Não"}
                    </p>
                  </>
                ) : (
                  <p>Nenhum usuário autenticado</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <Button onClick={refreshSession} disabled={isLoading}>
                Atualizar Sessão
              </Button>
              <Button onClick={signOut} variant="destructive" disabled={!userData?.user}>
                Fazer Logout
              </Button>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Ir para Login
                </Button>
              </Link>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-2">Dados Completos</h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Sessão:</h3>
                  <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-xs overflow-auto max-h-60">
                    {JSON.stringify(sessionData, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Usuário:</h3>
                  <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-xs overflow-auto max-h-60">
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

