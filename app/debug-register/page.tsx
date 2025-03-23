"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"

export default function DebugRegisterPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [userType, setUserType] = useState("student")
  const [password, setPassword] = useState("")

  async function testRegister() {
    setLoading(true)
    setResults(null)

    try {
      // Gerar um ID universal que começa com "R"
      const registrationNumber = `R${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`

      // Etapa 1: Verificar conexão com Supabase
      const connectionTest = await supabase.from("profiles").select("count").limit(1)

      // Etapa 2: Tentar criar usuário
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            userType,
            registrationNumber,
          },
        },
      })

      // Etapa 3: Se o usuário for criado, tentar criar o perfil
      let profileResult = null
      if (signUpResult.data.user) {
        profileResult = await supabase.from("profiles").insert({
          id: signUpResult.data.user.id,
          name: name,
          email: email,
          user_type: userType,
          registration_number: registrationNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      setResults({
        connectionTest,
        signUpResult,
        profileResult,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setResults({
        error: error,
        message: "Erro ao executar teste",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Registro</CardTitle>
          <CardDescription>
            Esta página testa o processo de registro passo a passo para identificar problemas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teste@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome Completo" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Usuário</label>
              <select
                className="w-full p-2 border rounded"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="student">Aluno</option>
                <option value="teacher">Professor</option>
              </select>
            </div>

            <Button onClick={testRegister} disabled={loading || !email || !name || !password} className="w-full">
              {loading ? "Testando..." : "Testar Registro"}
            </Button>
          </div>

          {results && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Resultados do Teste:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Link href="/debug">
              <Button variant="outline">Voltar para Diagnóstico Geral</Button>
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

