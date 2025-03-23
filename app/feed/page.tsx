"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, BookOpen, RefreshCw } from "lucide-react"
import { PostCard } from "@/components/post-card"
import { postsService } from "@/lib/posts-service"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function FeedPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const loadPosts = async (query = "") => {
    try {
      setIsRefreshing(true)
      const data = await postsService.getPosts(query)
      setPosts(data)
    } catch (err: any) {
      console.error("Erro ao carregar posts:", err)
      setError(err.message || "Erro ao carregar posts")
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadPosts(searchQuery)
    }
  }, [searchQuery, authLoading])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadPosts(searchQuery)
  }

  const handleRefresh = () => {
    loadPosts(searchQuery)
  }

  const handlePostDeleted = () => {
    // Recarregar a lista de posts quando um post for excluído
    loadPosts(searchQuery)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Erro de Autenticação</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{error || "Você precisa estar autenticado para acessar esta página."}</p>
            <Link href="/login">
              <Button className="bg-[#23b5b5] hover:bg-[#23b5b5]/90">Voltar para Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isTeacher = user.userType === "teacher"

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <AppHeader />

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Feed de Conteúdos</h1>
            <p className="text-muted-foreground">
              Explore e descubra conteúdos educacionais compartilhados na plataforma.
            </p>
          </div>

          {isTeacher && (
            <Link href="/create-post">
              <Button className="bg-[#23b5b5] hover:bg-[#23b5b5]/90 w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Criar Conteúdo
              </Button>
            </Link>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar conteúdos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Atualizar
            </Button>
            <Button type="button" variant="outline" className="w-full md:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
          </div>
        </form>

        <div className="max-w-3xl mx-auto">
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onPostDeleted={handlePostDeleted} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Bem-vindo ao Feed!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Este é o seu feed de conteúdos educacionais. Aqui você encontrará materiais compartilhados por
                    professores e outros educadores.
                  </p>
                  <p>
                    No momento, não há conteúdos para exibir.
                    {isTeacher && " Comece criando seu primeiro conteúdo!"}
                  </p>

                  {isTeacher && (
                    <div className="mt-6">
                      <Link href="/create-post">
                        <Button className="bg-[#23b5b5] hover:bg-[#23b5b5]/90">
                          <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Conteúdo
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#23b5b5]/5 border-[#23b5b5]/20">
                <CardHeader>
                  <CardTitle className="text-[#23b5b5]">Dica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <BookOpen className="h-12 w-12 text-[#23b5b5]" />
                    <div>
                      <p className="mb-2">
                        {isTeacher
                          ? "Como professor, você pode criar diferentes tipos de conteúdo como artigos, questionários, vídeos e muito mais."
                          : "Como aluno, você pode interagir com os conteúdos, comentar e marcar como favoritos para acessar mais tarde."}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Experimente as diferentes opções disponíveis na plataforma!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

