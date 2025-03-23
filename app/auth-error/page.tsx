"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { supabase } from "@/lib/supabase-client"
import { toast } from "@/components/ui/use-toast"

export default function AuthErrorPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function testAuth(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      // Teste 1: Verificar se o email e senha estão sendo enviados corretamente
      console.log("Tentando login com:", { email, password: "***" })

      // Teste 2: Tentar login com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setResult({
          success: false,
          error: error.message,
          details: error,
        })
        toast({
          title: "Erro de autenticação",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setResult({
          success: true,
          user: data.user,
          session: data.session,
        })
        toast({
          title: "Autenticação bem-sucedida",
          description: "Usuário autenticado com sucesso!",
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        details: error,
      })
      toast({
        title: "Erro inesperado",
        description: error.message,
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
          <CardTitle>Diagnóstico de Erro de Autenticação</CardTitle>
          <CardDescription>
            Esta página testa a autenticação diretamente para identificar problemas específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={testAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Testando..." : "Testar Autenticação"}
            </Button>
          </form>

          {result && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Resultado do Teste:</h3>
              <div
                className={`p-4 rounded-md ${result.success ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"}`}
              >
                <p className="font-semibold">{result.success ? "Sucesso!" : "Erro:"}</p>
                {result.success ? <p>Usuário autenticado com sucesso.</p> : <p>{result.error}</p>}
              </div>
              <pre className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md">
            <h3 className="font-bold mb-2">Possíveis Soluções:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Verifique se o email e senha estão corretos</li>
              <li>Certifique-se de que o usuário existe no Supabase</li>
              <li>Verifique se há políticas de RLS bloqueando o acesso</li>
              <li>Tente limpar os cookies e o armazenamento local do navegador</li>
              <li>Verifique se há erros de CORS ou problemas de rede</li>
            </ul>
          </div>
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

