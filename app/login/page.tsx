"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { supabase } from "@/lib/supabase-client"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o email e a senha.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setDebugInfo(null)

    try {
      console.log("Tentando login com:", email)

      // Usar diretamente o Supabase para login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Erro de login:", error)
        setDebugInfo(JSON.stringify(error, null, 2))
        toast({
          title: "Erro ao fazer login",
          description: error.message || "Verifique suas credenciais e tente novamente.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      console.log("Login bem-sucedido:", data)

      // Verificar se temos um usuário válido
      if (!data.user) {
        setDebugInfo("Login bem-sucedido, mas nenhum usuário retornado")
        toast({
          title: "Erro ao fazer login",
          description: "Não foi possível obter os dados do usuário.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      })

      // Redirecionar para o dashboard
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1000)
    } catch (error: any) {
      console.error("Erro durante login:", error)
      setDebugInfo(JSON.stringify(error, null, 2))
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 w-full flex justify-between px-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Voltar
          </Button>
        </Link>
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-brand">Astra</span>Mentor
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Entre com seu email e senha para acessar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-brand hover:bg-brand-hover text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md text-xs overflow-auto max-h-40">
              <p className="font-semibold mb-1">Informações de debug:</p>
              <pre>{debugInfo}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            Não tem uma conta?{" "}
            <Link href="/register" className="font-medium text-brand hover:underline">
              Registre-se
            </Link>
          </div>
          <div className="text-sm text-center">
            <Link href="/auth-diagnostic" className="text-xs text-muted-foreground hover:underline">
              Verificar estado da autenticação
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

