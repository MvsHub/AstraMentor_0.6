"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, BookOpen, Settings, Bell, Edit, Trash2, Plus, Filter, Search, MessageSquare } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { postsService } from "@/lib/posts-service"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])

  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoading(true)

        if (!user) {
          throw new Error("Usuário não autenticado")
        }

        // Carregar posts do usuário se for professor
        if (user.userType === "teacher") {
          const posts = await postsService.getUserPosts(user.id)
          setUserPosts(posts)
          setFilteredPosts(posts)
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados do usuário:", err)
        setError(err.message || "Erro ao carregar dados do usuário")
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      loadUserData()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPosts(userPosts)
    } else {
      const filtered = userPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredPosts(filtered)
    }
  }, [searchQuery, userPosts])

  const handleSelectPost = (postId: string) => {
    setSelectedPosts((prev) => {
      if (prev.includes(postId)) {
        return prev.filter((id) => id !== postId)
      } else {
        return [...prev, postId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(filteredPosts.map((post) => post.id))
    }
  }

  const handleDeleteSelected = async () => {
    try {
      for (const postId of selectedPosts) {
        await postsService.deletePost(postId)
      }

      setUserPosts(userPosts.filter((post) => !selectedPosts.includes(post.id)))
      setFilteredPosts(filteredPosts.filter((post) => !selectedPosts.includes(post.id)))
      setSelectedPosts([])

      toast({
        title: "Sucesso",
        description: `${selectedPosts.length} post(s) excluído(s) com sucesso!`,
      })
    } catch (error) {
      console.error("Erro ao excluir posts:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir os posts selecionados.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await postsService.deletePost(postId)
      setUserPosts(userPosts.filter((post) => post.id !== postId))
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId))

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          <Card className="md:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-[#23b5b5]/10 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-[#23b5b5]" />
                </div>

                <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>

                <p className="text-sm mb-4 px-4">{user.userType === "teacher" ? "Professor" : "Aluno"}</p>

                <Button variant="outline" className="w-full border-[#23b5b5] text-[#23b5b5] hover:bg-[#23b5b5]/10">
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="mb-6 bg-white dark:bg-gray-800 p-1 rounded-lg border w-full justify-start">
                <TabsTrigger value="info" className="data-[state=active]:bg-[#23b5b5] data-[state=active]:text-white">
                  Informações
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="data-[state=active]:bg-[#23b5b5] data-[state=active]:text-white"
                >
                  Meus Conteúdos
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-[#23b5b5] data-[state=active]:text-white"
                >
                  Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Seus dados cadastrais e informações de conta.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                          <p className="font-medium">{user.email}</p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
                          <p className="font-medium">{user.name}</p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Tipo de Usuário</h3>
                          <p className="font-medium">{user.userType === "teacher" ? "Professor" : "Aluno"}</p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Matrícula</h3>
                          <p className="font-medium">{user.registrationNumber || "Não informado"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content">
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Meus Conteúdos</CardTitle>
                      <CardDescription>Painel administrativo dos seus conteúdos educacionais.</CardDescription>
                    </div>

                    {isTeacher && (
                      <Link href="/create-post">
                        <Button className="bg-[#23b5b5] hover:bg-[#23b5b5]/90 w-full sm:w-auto">
                          <Plus className="mr-2 h-4 w-4" /> Criar Conteúdo
                        </Button>
                      </Link>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isTeacher ? (
                      filteredPosts.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
                            <div className="relative w-full sm:w-64">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="search"
                                placeholder="Buscar conteúdos..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              {selectedPosts.length > 0 && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir Selecionados ({selectedPosts.length})
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir {selectedPosts.length} post(s) selecionado(s)?
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={handleDeleteSelected}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              <Button variant="outline" size="sm" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filtrar
                              </Button>
                            </div>
                          </div>

                          <div className="overflow-hidden rounded-md border">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr className="border-b">
                                  <th className="h-10 w-10 px-2">
                                    <Checkbox
                                      checked={
                                        selectedPosts.length === filteredPosts.length && filteredPosts.length > 0
                                      }
                                      onCheckedChange={handleSelectAll}
                                      aria-label="Selecionar todos"
                                    />
                                  </th>
                                  <th className="h-10 px-4 text-left font-medium">Título</th>
                                  <th className="h-10 px-4 text-left font-medium hidden md:table-cell">Data</th>
                                  <th className="h-10 px-4 text-left font-medium hidden md:table-cell">Comentários</th>
                                  <th className="h-10 px-4 text-right font-medium">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredPosts.map((post) => (
                                  <tr
                                    key={post.id}
                                    className={`border-b hover:bg-muted/50 transition-colors ${selectedPosts.includes(post.id) ? "bg-muted/30" : ""}`}
                                  >
                                    <td className="p-2 text-center">
                                      <Checkbox
                                        checked={selectedPosts.includes(post.id)}
                                        onCheckedChange={() => handleSelectPost(post.id)}
                                        aria-label={`Selecionar post ${post.title}`}
                                      />
                                    </td>
                                    <td className="p-4 align-middle font-medium">
                                      <div>
                                        <p className="font-medium truncate max-w-[200px]">{post.title}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                          {post.description}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="p-4 align-middle hidden md:table-cell">
                                      <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">
                                          {format(new Date(post.publishedAt), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                        <span className="text-xs">
                                          {format(new Date(post.publishedAt), "HH:mm", { locale: ptBR })}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-4 align-middle hidden md:table-cell">
                                      <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{post.comments}</span>
                                      </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Link href={`/post/${post.id}`}>
                                          <Button variant="outline" size="sm">
                                            Visualizar
                                          </Button>
                                        </Link>
                                        <Link href={`/edit-post/${post.id}`}>
                                          <Button variant="outline" size="sm" className="gap-1">
                                            <Edit className="h-4 w-4" /> Editar
                                          </Button>
                                        </Link>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="gap-1 text-red-500 hover:text-red-600"
                                            >
                                              <Trash2 className="h-4 w-4" /> Excluir
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Tem certeza que deseja excluir este post? Esta ação não pode ser
                                                desfeita.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleDeletePost(post.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white"
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
                        <div className="flex items-center justify-center py-8 text-center">
                          <div className="max-w-md">
                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Nenhum conteúdo criado</h3>
                            <p className="text-muted-foreground mb-6">
                              Você ainda não criou nenhum conteúdo educacional. Comece criando seu primeiro conteúdo
                              agora!
                            </p>
                            <Link href="/create-post">
                              <Button className="bg-[#23b5b5] hover:bg-[#23b5b5]/90">Criar Conteúdo</Button>
                            </Link>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-8 text-center">
                        <div className="max-w-md">
                          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Área exclusiva para professores</h3>
                          <p className="text-muted-foreground">
                            Como aluno, você pode acessar os conteúdos educacionais no feed, mas não pode criar novos
                            conteúdos.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações</CardTitle>
                    <CardDescription>Gerencie suas preferências e configurações de conta.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <div className="space-y-1">
                          <h3 className="font-medium">Notificações por Email</h3>
                          <p className="text-sm text-muted-foreground">
                            Receba notificações sobre novos conteúdos e atividades.
                          </p>
                        </div>
                        <div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Bell className="h-4 w-4" />
                            Configurar
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pb-4 border-b">
                        <div className="space-y-1">
                          <h3 className="font-medium">Segurança da Conta</h3>
                          <p className="text-sm text-muted-foreground">
                            Altere sua senha e configure autenticação de dois fatores.
                          </p>
                        </div>
                        <div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Gerenciar
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button variant="destructive" size="sm">
                          Excluir Conta
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

