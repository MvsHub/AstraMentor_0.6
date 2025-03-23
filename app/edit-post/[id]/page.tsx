"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostForm } from "@/components/post-form"
import { useAuth } from "@/contexts/auth-context"
import { postsService } from "@/lib/posts-service"
import { toast } from "@/components/ui/use-toast"

export default function EditPostPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAuthorization() {
      if (!user || user.userType !== "teacher") {
        router.push("/dashboard")
        return
      }

      try {
        setIsLoading(true)
        const post = await postsService.getPost(params.id)

        if (!post) {
          toast({
            title: "Erro",
            description: "Post não encontrado.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        // Verificar se o usuário é o autor do post
        if (post.author.id !== user.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para editar este post.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Erro ao verificar autorização:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao verificar suas permissões.",
          variant: "destructive",
        })
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      checkAuthorization()
    }
  }, [params.id, user, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23b5b5]"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Redirecionando no useEffect
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <AppHeader />

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Editar Conteúdo</h1>
          <p className="text-muted-foreground">Atualize as informações do seu conteúdo educacional.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulário de Edição</CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm postId={params.id} onSuccess={() => router.push("/feed")} onCancel={() => router.back()} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

