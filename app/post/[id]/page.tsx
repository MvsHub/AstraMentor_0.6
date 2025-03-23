"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Heart, MessageSquare, ArrowLeft, Edit, Send, MoreVertical, Trash2 } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { postsService } from "@/lib/posts-service"
import { commentsService } from "@/lib/comments-service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"

export default function PostPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const [post, setPost] = useState<any | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const commentSectionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPostData = async () => {
      setIsLoading(true)
      try {
        const postData = await postsService.getPost(params.id)
        if (postData) {
          setPost(postData)
          setLikeCount(postData.likes || 0)
          const commentsData = await commentsService.getComments(params.id)
          setComments(commentsData)
        } else {
          toast({
            title: "Erro",
            description: "Post não encontrado.",
            variant: "destructive",
          })
          router.push("/feed")
        }
      } catch (error) {
        console.error("Erro ao buscar dados do post:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar o post.",
          variant: "destructive",
        })
        router.push("/feed")
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchPostData()
    }
  }, [params.id, authLoading, router])

  // Verificar se há um hash #comments na URL para rolar até a seção de comentários
  useEffect(() => {
    if (window.location.hash === "#comments" && commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [comments])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      console.log("Enviando comentário:", {
        postId: params.id,
        userId: user.id,
        content: newComment,
      })

      const commentData = {
        content: newComment,
      }

      const addedComment = await commentsService.addComment(params.id, user.id, commentData)
      console.log("Comentário adicionado:", addedComment)

      // Atualizar a lista de comentários
      setComments((prevComments) => [...prevComments, addedComment])

      // Limpar o campo de comentário
      setNewComment("")

      // Atualizar contagem de comentários no post
      if (post) {
        setPost((prevPost) => ({
          ...prevPost,
          comments: (prevPost.comments || 0) + 1,
        }))
      }

      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso!",
      })
    } catch (error: any) {
      console.error("Erro ao adicionar comentário:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o comentário. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    // Aqui você pode implementar a chamada à API para registrar o like
  }

  const handleDeletePost = async () => {
    if (!user || !post || user.id !== post.author.id) return

    try {
      setIsDeleting(true)
      await postsService.deletePost(post.id)

      toast({
        title: "Sucesso",
        description: "Post excluído com sucesso!",
      })

      router.push("/feed")
    } catch (error) {
      console.error("Erro ao excluir post:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteAlertOpen(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!post) {
    return null // Redirecionando no useEffect
  }

  const timeAgo = formatDistanceToNow(new Date(post.publishedAt), {
    addSuffix: true,
    locale: ptBR,
  })

  const isAuthor = user && post.author.id === user.id

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <AppHeader />

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.image} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <span>{post.author.role}</span>
                      <span>•</span>
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>

                {isAuthor && (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Opções</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/edit-post/${post.id}`} className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500 cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault()
                            setIsDeleteAlertOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                      <AlertDialogContent style={{ backgroundColor: "white" }} className="border border-gray-200">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeletePost}
                            className="bg-red-500 hover:bg-red-600 text-white"
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Excluindo..." : "Excluir"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <p className="text-muted-foreground mb-6">{post.description}</p>

              {post.image && (
                <div className="mb-6 w-full overflow-hidden rounded-lg">
                  <div className="relative w-full" style={{ maxHeight: "500px" }}>
                    {!imageLoaded && !imageError && (
                      <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                    )}

                    {imageError ? (
                      <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Não foi possível carregar a imagem</p>
                      </div>
                    ) : (
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        className={`w-full object-contain max-h-[500px] transition-opacity duration-300 ${
                          imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none mb-6">
                {post.content}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-1 ${isLiked ? "text-red-500" : ""}`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  <span>{likeCount}</span>
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length} comentários</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6" ref={commentSectionRef}>
            <h2 className="text-xl font-bold" id="comments">
              Comentários ({comments.length})
            </h2>

            <Card className="mb-8">
              <CardContent className="p-4">
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={user?.avatar || ""} alt={user?.name || "Usuário"} />
                      <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Adicione um comentário..."
                        className="resize-none min-h-[80px]"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                      className="bg-[#23b5b5] hover:bg-[#23b5b5]/90 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Comentar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id} className="border-l-4 border-l-[#23b5b5]">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.image} alt={comment.author.name} />
                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{comment.author.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.publishedAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <p>{comment.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                              <Heart className="h-3.5 w-3.5" />
                              <span className="text-xs">{comment.likes}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

