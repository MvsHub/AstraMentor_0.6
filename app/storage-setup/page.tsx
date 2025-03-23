"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function StorageSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const setupStoragePolicies = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Criar o bucket post-images
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket("post-images", {
        public: true,
      })

      if (bucketError && !bucketError.message.includes("already exists")) {
        console.error("Erro ao criar bucket:", bucketError)
        setResult({
          success: false,
          error: bucketError.message,
          step: "Criação do bucket",
        })
        setIsLoading(false)
        return
      }

      // Configurar políticas de acesso
      // 1. Política para leitura pública
      const { error: readPolicyError } = await supabase.rpc("create_storage_policy", {
        policy_name: "Permitir leitura pública de imagens",
        bucket_name: "post-images",
        definition: "bucket_id = 'post-images'",
        policy_action: "SELECT",
        policy_role: "public",
      })

      // 2. Política para upload por usuários autenticados
      const { error: uploadPolicyError } = await supabase.rpc("create_storage_policy", {
        policy_name: "Permitir upload de imagens por usuários autenticados",
        bucket_name: "post-images",
        definition: "bucket_id = 'post-images'",
        policy_action: "INSERT",
        policy_role: "authenticated",
      })

      // 3. Política para atualização pelo proprietário
      const { error: updatePolicyError } = await supabase.rpc("create_storage_policy", {
        policy_name: "Permitir atualização de imagens pelo proprietário",
        bucket_name: "post-images",
        definition: "bucket_id = 'post-images' AND auth.uid()::text = owner",
        policy_action: "UPDATE",
        policy_role: "authenticated",
      })

      // 4. Política para exclusão pelo proprietário
      const { error: deletePolicyError } = await supabase.rpc("create_storage_policy", {
        policy_name: "Permitir exclusão de imagens pelo proprietário",
        bucket_name: "post-images",
        definition: "bucket_id = 'post-images' AND auth.uid()::text = owner",
        policy_action: "DELETE",
        policy_role: "authenticated",
      })

      // Verificar se houve erros
      const errors = [readPolicyError, uploadPolicyError, updatePolicyError, deletePolicyError]
        .filter(Boolean)
        .map((err) => err?.message)

      if (errors.length > 0) {
        setResult({
          success: false,
          errors,
          step: "Configuração de políticas",
        })
      } else {
        setResult({
          success: true,
          message: "Bucket e políticas configurados com sucesso!",
        })

        toast({
          title: "Sucesso!",
          description: "Armazenamento configurado com sucesso. Agora você pode fazer upload de imagens.",
        })
      }
    } catch (error: any) {
      console.error("Erro ao configurar armazenamento:", error)
      setResult({
        success: false,
        error: error.message || "Erro desconhecido",
        step: "Configuração geral",
      })

      toast({
        title: "Erro",
        description: "Ocorreu um erro ao configurar o armazenamento.",
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
          <CardTitle>Configuração de Armazenamento</CardTitle>
          <CardDescription>Configure o armazenamento do Supabase para permitir upload de imagens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-md text-amber-800 dark:text-amber-300">
              <h3 className="font-bold mb-2">Configuração Necessária</h3>
              <p className="mb-4">
                Para que o upload de imagens funcione corretamente, é necessário criar um bucket de armazenamento e
                configurar as políticas de segurança adequadas.
              </p>
              <p>Clique no botão abaixo para configurar automaticamente o armazenamento.</p>
            </div>

            <Button onClick={setupStoragePolicies} disabled={isLoading} className="w-full">
              {isLoading ? "Configurando..." : "Configurar Armazenamento"}
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
                    <p className="mb-2">Erro durante: {result.step}</p>
                    {result.error && <p className="mb-2">Mensagem: {result.error}</p>}
                    {result.errors && (
                      <div>
                        <p className="mb-1">Erros:</p>
                        <ul className="list-disc list-inside">
                          {result.errors.map((err: string, i: number) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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

