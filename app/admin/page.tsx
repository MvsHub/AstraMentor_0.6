"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Plus, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { postsService } from "@/lib/posts-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Verificar se o usuário está autenticado e é professor
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "teacher") {
      toast({
        title: "Acesso negado",
        description: "Apenas professores podem acessar a área administrativa.",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    // Carregar posts
    fetchPosts()
  }, [user, router])

  const fetchPosts = async () => {
    setIsLoading(true)

    try {
      const data = await postsService.getPosts(searchQuery)
      setPosts(data)
    } catch (error) {
      console.error("Erro ao buscar posts:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de posts.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deletePost = async (id: string) => {
    try {
      await postsService.deletePost(id)

      // Atualizar lista local
      setPosts(posts.filter((post) => post.id !== id))

      toast({
        title: "Sucesso",
        description: "Post excluído com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao excluir post:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post.",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPosts()
  }

  return (
    <>
      <DashboardHeader />
      <DashboardShell>
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Administração de Conteúdos</h1>
            <Link href="/create-post">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Post
              </Button>
            </Link>
          </div>

          <div className="relative w-full md:w-96">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por título ou autor..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Título</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Autor</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Publicado</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Atualizado</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle font-medium">{post.title}</td>
                        <td className="p-4 align-middle">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              post.status === "published"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}
                          >
                            {post.status === "published" ? "Publicado" : "Rascunho"}
                          </span>
                        </td>
                        <td className="p-4 align-middle">{post.author.name}</td>
                        <td className="p-4 align-middle">
                          {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true, locale: ptBR })}
                        </td>
                        <td className="p-4 align-middle">
                          {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true, locale: ptBR })}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/edit-post/${post.id}`}>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Excluir</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o post "{post.title}"? Esta ação não pode ser
                                    desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deletePost(post.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum post encontrado.</p>
              <Link href="/create-post">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Post
                </Button>
              </Link>
            </div>
          )}
        </div>
      </DashboardShell>
    </>
  )
}

