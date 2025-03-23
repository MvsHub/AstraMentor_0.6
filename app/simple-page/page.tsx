"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimplePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true)

        // Verificar sessão diretamente
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (data && data.session) {
          setUser(data.session.user)
        } else {
          setError("Nenhuma sessão encontrada")
        }
      } catch (err: any) {
        console.error("Erro ao verificar autenticação:", err)
        setError(err.message || "Erro ao verificar autenticação")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
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
      <Card className="max-w-3xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Página Simples</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div>
              <p className="text-red-500 mb-4">{error}</p>
              <Link href="/login">
                <Button>Voltar para Login</Button>
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">Usuário Autenticado</h2>
              <p className="mb-2">Email: {user?.email}</p>
              <p className="mb-4">ID: {user?.id}</p>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-6">
                <Link href="/auth-debug">
                  <Button variant="outline" className="w-full">
                    Verificar Autenticação
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  Sair
                </Button>
              </div>

              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <h3 className="font-semibold mb-2">Dados do Usuário:</h3>
                <pre className="text-xs overflow-auto max-h-60">{JSON.stringify(user, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

