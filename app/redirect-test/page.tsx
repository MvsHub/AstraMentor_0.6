"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { supabase } from "@/lib/supabase-client"

export default function RedirectTestPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirectResult, setRedirectResult] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession()
        setIsAuthenticated(!!data.session)
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const testRedirect = () => {
    try {
      setRedirectResult("Iniciando redirecionamento...")

      // Usar setTimeout para simular um redirecionamento após processamento
      setTimeout(() => {
        setRedirectResult("Redirecionando em 1 segundo...")

        // Usar window.location.href para forçar um redirecionamento completo
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      }, 500)
    } catch (error: any) {
      setRedirectResult(`Erro ao redirecionar: ${error.message || "Erro desconhecido"}`)
    }
  }

  const testNextJsRedirect = () => {
    try {
      setRedirectResult("Iniciando redirecionamento com Next.js...")

      // Usar window.location.replace para um redirecionamento mais direto
      setTimeout(() => {
        window.location.replace("/dashboard")
      }, 1000)
    } catch (error: any) {
      setRedirectResult(`Erro ao redirecionar: ${error.message || "Erro desconhecido"}`)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Redirecionamento</CardTitle>
          <CardDescription>
            Esta página testa diferentes métodos de redirecionamento para identificar problemas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-800">
                <h3 className="font-bold mb-2">Status de Autenticação:</h3>
                <p>{isAuthenticated ? "Autenticado" : "Não Autenticado"}</p>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Button onClick={testRedirect} className="w-full">
                  Testar Redirecionamento Direto
                </Button>
                <Button onClick={testNextJsRedirect} className="w-full">
                  Testar Redirecionamento Alternativo
                </Button>
              </div>

              {redirectResult && (
                <div className="p-4 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  <h3 className="font-bold mb-2">Resultado:</h3>
                  <p>{redirectResult}</p>
                </div>
              )}

              <div className="p-4 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                <h3 className="font-bold mb-2">Links Diretos:</h3>
                <div className="space-y-2">
                  <p>
                    <a href="/dashboard" className="text-blue-600 dark:text-blue-400 underline">
                      Dashboard (link direto)
                    </a>
                  </p>
                  <p>
                    <a href="/auth-debug" className="text-blue-600 dark:text-blue-400 underline">
                      Diagnóstico de Autenticação
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Link href="/auth-debug">
              <Button variant="outline">Diagnóstico de Autenticação</Button>
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

