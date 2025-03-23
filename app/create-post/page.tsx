"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostForm } from "@/components/post-form"
import { useAuth } from "@/contexts/auth-context"

export default function CreatePostPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário é professor
    if (!isLoading && user) {
      if (user.userType !== "teacher") {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23b5b5]"></div>
      </div>
    )
  }

  if (!user || user.userType !== "teacher") {
    return null // Redirecionando no useEffect
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <AppHeader />

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Criar Novo Conteúdo</h1>
          <p className="text-muted-foreground">
            Compartilhe conhecimento com seus alunos criando um novo conteúdo educacional.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulário de Criação</CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm onSuccess={() => router.push("/feed")} onCancel={() => router.back()} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

