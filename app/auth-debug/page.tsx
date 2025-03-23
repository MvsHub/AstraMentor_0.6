"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { supabase } from "@/lib/supabase-client"

export default function AuthDebugPage() {
  const [loading, setLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [profileInfo, setProfileInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      setLoading(true)
      setError(null)

      try {
        // Verificar sessão atual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw new Error(`Erro ao verificar sessão: ${sessionError.message}`)
        }

        setSessionInfo(sessionData)

        // Se houver uma sessão, buscar informações do usuário
        if (sessionData.session) {
          const { data: userData, error: userError } = await supabase.auth.getUser()

          if (userError) {
            throw new Error(`Erro ao buscar usuário: ${userError.message}`)
          }

          setUserInfo(userData)

          // Buscar perfil do usuário
          if (userData.user) {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userData.user.id)
              .single()

            if (profileError) {
              console.error("Erro ao buscar perfil:", profileError)
              setProfileInfo({ error: profileError.message })
            } else {
              setProfileInfo(profileData)
            }
          }
        }
      } catch (err: any) {
        console.error("Erro de diagnóstico:", err)
        setError(err.message || "Erro desconhecido ao verificar autenticação")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.reload()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const handleRedirectToDashboard = () => {
    window.location.href = "/dashboard"
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Autenticação</CardTitle>
          <CardDescription>
            Esta página verifica o estado atual da autenticação e exibe informações detalhadas
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
                <h3 className="font-bold mb-2">Informações da Sessão:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-bold mb-2">Informações do Usuário:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(userInfo, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-bold mb-2">Informações do Perfil:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(profileInfo, null, 2)}
                </pre>
              </div>

              {sessionInfo?.session && (
                <div className="flex justify-center gap-4">
                  <Button onClick={handleRedirectToDashboard} variant="default">
                    Ir para Dashboard
                  </Button>
                  <Button onClick={handleSignOut} variant="destructive">
                    Fazer Logout
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Link href="/debug">
              <Button variant="outline">Diagnóstico Geral</Button>
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

