"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function StoragePoliciesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const setupStoragePolicies = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Aplicar políticas de segurança para o bucket avatares
      const { error: policyError } = await supabase.rpc("apply_storage_policies", {
        bucket_name: "avatares",
      })

      if (policyError) {
        throw policyError
      }

      setResult({
        success: true,
        message: "Políticas de segurança configuradas com sucesso!",
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Sucesso!",
        description: "Políticas de segurança configuradas com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao configurar políticas de segurança:", error)
      setResult({
        success: false,
        error: error.message || "Erro desconhecido",
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Erro",
        description: "Ocorreu um erro ao configurar as políticas de segurança.",
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
          <CardTitle>Configuração de Políticas de Armazenamento</CardTitle>
          <CardDescription>Configure as políticas de segurança para permitir upload de imagens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-md text-amber-800 dark:text-amber-300">
              <h3 className="font-bold mb-2">Configuração Necessária</h3>
              <p className="mb-4">
                Para que o upload de imagens funcione corretamente, é necessário configurar as políticas de segurança
                adequadas para o bucket de armazenamento.
              </p>
              <p>Clique no botão abaixo para configurar automaticamente as políticas de segurança.</p>
            </div>

            <Button onClick={setupStoragePolicies} disabled={isLoading} className="w-full">
              {isLoading ? "Configurando..." : "Configurar Políticas de Segurança"}
            </Button>

            {result && (
              <div
                className={`p-4 rounded-md ${result.success ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"}`}
              >
                <h3 className="font-bold mb-2">
                  {result.success ? "Configuração Concluída!" : "Erro na Configuração"}
                </h3>
                {result.success ? (
                  <p>{result.message}</p>
                ) : (
                  <div>
                    <p className="mb-2">Erro: {result.error}</p>
                    <p className="mt-4">
                      Você pode precisar configurar manualmente as políticas de armazenamento no painel do Supabase.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Link href="/storage-debug">
              <Button variant="outline">Verificar Diagnóstico</Button>
            </Link>
            <Link href="/feed">
              <Button variant="outline">Voltar para Feed</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

