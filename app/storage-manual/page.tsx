"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase-client"

export default function StorageManualPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [sqlQuery, setSqlQuery] = useState(`
-- Política para permitir leitura pública de arquivos no bucket avatares
CREATE POLICY "Permitir leitura pública de imagens" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'avatares');

-- Política para permitir que usuários autenticados façam upload de arquivos
CREATE POLICY "Permitir upload de imagens por usuários autenticados" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatares');

-- Política para permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY "Permitir atualização de imagens pelo proprietário" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatares' AND auth.uid()::text = owner);

-- Política para permitir que usuários autenticados excluam seus próprios arquivos
CREATE POLICY "Permitir exclusão de imagens pelo proprietário" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'avatares' AND auth.uid()::text = owner);
  `)

  const executeSQL = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Executar SQL diretamente
      const { error } = await supabase.rpc("exec_sql", { sql: sqlQuery })

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "SQL executado com sucesso!",
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Sucesso!",
        description: "SQL executado com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao executar SQL:", error)
      setResult({
        success: false,
        error: error.message || "Erro desconhecido",
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Erro",
        description: "Ocorreu um erro ao executar o SQL.",
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
          <CardTitle>Configuração Manual de Políticas de Armazenamento</CardTitle>
          <CardDescription>Execute SQL para configurar as políticas de segurança do bucket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-md text-amber-800 dark:text-amber-300">
              <h3 className="font-bold mb-2">Configuração Manual</h3>
              <p className="mb-4">
                Use esta página para executar SQL diretamente no Supabase para configurar as políticas de segurança do
                bucket de armazenamento.
              </p>
              <p>Você também pode copiar este SQL e executá-lo diretamente no Editor SQL do Supabase.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">SQL para Configurar Políticas:</label>
              <Textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <Button onClick={executeSQL} disabled={isLoading} className="w-full">
              {isLoading ? "Executando..." : "Executar SQL"}
            </Button>

            {result && (
              <div
                className={`p-4 rounded-md ${result.success ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"}`}
              >
                <h3 className="font-bold mb-2">
                  {result.success ? "SQL Executado com Sucesso!" : "Erro na Execução do SQL"}
                </h3>
                {result.success ? (
                  <p>{result.message}</p>
                ) : (
                  <div>
                    <p className="mb-2">Erro: {result.error}</p>
                    <p className="mt-4">Você pode precisar executar este SQL diretamente no Editor SQL do Supabase.</p>
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

