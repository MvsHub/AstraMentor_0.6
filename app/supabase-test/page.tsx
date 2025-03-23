"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"

export default function SupabaseTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [testEmail, setTestEmail] = useState("teste@exemplo.com")
  const [testPassword, setTestPassword] = useState("senha123")

  // Função para gerar um UUID v4 válido
  function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  async function runTests() {
    setLoading(true)
    setResults(null)

    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: {},
    }

    try {
      // Teste 1: Verificar conexão com Supabase
      try {
        const { data, error } = await supabase.from("profiles").select("count").limit(1)
        testResults.tests.connection = {
          success: !error,
          data,
          error: error ? error.message : null,
        }
      } catch (e: any) {
        testResults.tests.connection = {
          success: false,
          error: e.message || "Erro desconhecido",
        }
      }

      // Teste 2: Verificar autenticação
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        })
        testResults.tests.authentication = {
          success: !error,
          data: data ? { user: data.user ? { id: data.user.id, email: data.user.email } : null } : null,
          error: error ? error.message : null,
        }
      } catch (e: any) {
        testResults.tests.authentication = {
          success: false,
          error: e.message || "Erro desconhecido",
        }
      }

      // Teste 3: Verificar permissões da tabela profiles
      try {
        const { data, error } = await supabase.from("profiles").select("*").limit(1)
        testResults.tests.profilesTable = {
          success: !error,
          data: data ? data.length : 0,
          error: error ? error.message : null,
        }
      } catch (e: any) {
        testResults.tests.profilesTable = {
          success: false,
          error: e.message || "Erro desconhecido",
        }
      }

      // Teste 4: Verificar permissões de inserção com UUID válido
      const testUuid = uuidv4()
      try {
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            id: testUuid,
            name: "Teste Diagnóstico",
            email: `test-${Date.now()}@example.com`,
            user_type: "student",
            registration_number: `R${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()

        testResults.tests.insertPermission = {
          success: !error,
          data: data ? data.length : 0,
          error: error ? error.message : null,
          uuid: testUuid,
        }

        // Limpar dados de teste
        if (!error) {
          await supabase.from("profiles").delete().eq("id", testUuid)
        }
      } catch (e: any) {
        testResults.tests.insertPermission = {
          success: false,
          error: e.message || "Erro desconhecido",
          uuid: testUuid,
        }
      }

      // Teste 5: Verificar colunas da tabela profiles
      try {
        const { data, error } = await supabase.from("profiles").select().limit(0)

        // Extrair informações das colunas a partir do erro ou dos dados
        let columns = []
        if (error) {
          columns = error.details ? error.details.split(",") : []
        } else {
          columns = data ? Object.keys(data[0] || {}) : []
        }

        testResults.tests.tableColumns = {
          success: true,
          columns: columns,
          error: null,
        }
      } catch (e: any) {
        testResults.tests.tableColumns = {
          success: false,
          error: e.message || "Erro desconhecido",
        }
      }

      setResults(testResults)
    } catch (error: any) {
      setResults({
        timestamp: new Date().toISOString(),
        error: error.message || "Erro desconhecido durante os testes",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico do Supabase</CardTitle>
          <CardDescription>
            Esta página executa testes para verificar a conexão e as permissões do Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email de Teste</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Email para teste de autenticação"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha de Teste</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Senha para teste de autenticação"
                />
              </div>
            </div>

            <Button onClick={runTests} disabled={loading} className="w-full">
              {loading ? "Executando testes..." : "Executar Testes de Diagnóstico"}
            </Button>
          </div>

          {results && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Resultados dos Testes:</h3>
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

