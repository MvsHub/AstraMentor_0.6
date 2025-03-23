"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"

export default function StorageDebugPage() {
  const [loading, setLoading] = useState(true)
  const [storageInfo, setStorageInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [isTestingUpload, setIsTestingUpload] = useState(false)

  useEffect(() => {
    async function checkStorage() {
      setLoading(true)
      setError(null)

      try {
        // Verificar buckets disponíveis
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

        if (bucketsError) {
          throw new Error(`Erro ao listar buckets: ${bucketsError.message}`)
        }

        // Verificar se o bucket avatares existe
        const avataresBucket = buckets.find((b) => b.name === "avatares")

        let avatarsFiles = []
        if (avataresBucket) {
          // Listar arquivos no bucket avatares
          const { data: files, error: filesError } = await supabase.storage.from("avatares").list()

          if (filesError) {
            console.error("Erro ao listar arquivos:", filesError)
          } else {
            avatarsFiles = files
          }
        }

        setStorageInfo({
          buckets,
          avataresBucket,
          avatarsFiles,
          timestamp: new Date().toISOString(),
        })
      } catch (err: any) {
        console.error("Erro de diagnóstico:", err)
        setError(err.message || "Erro desconhecido ao verificar armazenamento")
      } finally {
        setLoading(false)
      }
    }

    checkStorage()
  }, [])

  const createBucket = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage.createBucket("avatares", {
        public: true,
      })

      if (error) throw error

      // Recarregar informações
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
      console.error("Erro ao criar bucket:", err)
      alert(`Erro ao criar bucket: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testUpload = async () => {
    setIsTestingUpload(true)
    setTestResult(null)

    try {
      // Criar um arquivo de teste
      const blob = new Blob(["test file content"], { type: "text/plain" })
      const file = new File([blob], "test-file.txt", { type: "text/plain" })

      // Fazer upload para o bucket avatares
      const { data, error } = await supabase.storage.from("avatares").upload(`test-${Date.now()}.txt`, file)

      if (error) throw error

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatares").getPublicUrl(data.path)

      setTestResult({
        success: true,
        data,
        publicUrl,
        timestamp: new Date().toISOString(),
      })
    } catch (err: any) {
      console.error("Erro no teste de upload:", err)
      setTestResult({
        success: false,
        error: err.message,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsTestingUpload(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Armazenamento</CardTitle>
          <CardDescription>Esta página verifica o status do armazenamento no Supabase</CardDescription>
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
                <h3 className="font-bold mb-2">Buckets disponíveis:</h3>
                {storageInfo.buckets.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {storageInfo.buckets.map((bucket: any) => (
                      <li key={bucket.id} className="mb-1">
                        {bucket.name} {bucket.public ? "(público)" : "(privado)"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-amber-600">Nenhum bucket encontrado.</p>
                )}
              </div>

              <div>
                <h3 className="font-bold mb-2">Status do bucket 'avatares':</h3>
                {storageInfo.avataresBucket ? (
                  <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-md text-green-800 dark:text-green-300">
                    <p>
                      O bucket 'avatares' existe e está {storageInfo.avataresBucket.public ? "público" : "privado"}.
                    </p>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Arquivos no bucket:</h4>
                      {storageInfo.avatarsFiles && storageInfo.avatarsFiles.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {storageInfo.avatarsFiles.map((file: any) => (
                            <li key={file.id}>
                              {file.name} ({Math.round(file.metadata.size / 1024)} KB)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Nenhum arquivo encontrado no bucket.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-md text-amber-800 dark:text-amber-300">
                    <p className="mb-4">
                      O bucket 'avatares' não existe. Isso pode causar falhas no upload de imagens.
                    </p>
                    <Button onClick={createBucket} disabled={loading}>
                      Criar Bucket 'avatares'
                    </Button>
                  </div>
                )}
              </div>

              {storageInfo.avataresBucket && (
                <div>
                  <h3 className="font-bold mb-2">Testar upload para 'avatares':</h3>
                  <Button onClick={testUpload} disabled={isTestingUpload} className="mb-4">
                    {isTestingUpload ? "Testando..." : "Testar Upload"}
                  </Button>

                  {testResult && (
                    <div
                      className={`p-4 rounded-md ${testResult.success ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"}`}
                    >
                      <h4 className="font-semibold mb-2">
                        {testResult.success ? "Upload bem-sucedido!" : "Falha no upload"}
                      </h4>
                      {testResult.success ? (
                        <div>
                          <p className="mb-2">Arquivo enviado com sucesso.</p>
                          <p className="mb-2">
                            URL pública:{" "}
                            <a
                              href={testResult.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 underline"
                            >
                              {testResult.publicUrl}
                            </a>
                          </p>
                        </div>
                      ) : (
                        <p>Erro: {testResult.error}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Link href="/feed">
              <Button variant="outline">Voltar para Feed</Button>
            </Link>
            <Button onClick={() => window.location.reload()}>Atualizar Diagnóstico</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

