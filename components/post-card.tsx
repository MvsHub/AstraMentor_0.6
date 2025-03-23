"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MessageSquare, Heart, User, MoreVertical, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { postsService } from "@/lib/posts-service"
import { toast } from "@/components/ui/use-toast"
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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PostCardProps {
  post: {
    id: string
    title: string
    description: string
    author: {
      id: string
      name: string
      image: string
      role: string
    }
    publishedAt: string
    likes: number
    comments: number
    image?: string
  }
  onPostDeleted?: () => void
}

export function PostCard({ post, onPostDeleted }: PostCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Verificar se post.publishedAt é uma string válida
  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : new Date()
  const isValidDate = !isNaN(publishedDate.getTime())

  const timeAgo = isValidDate
    ? formatDistanceToNow(publishedDate, { addSuffix: true, locale: ptBR })
    : "data desconhecida"

  // Verificar se o usuário atual é o autor do post
  const isAuthor = user && user.id === post.author.id

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    // Aqui você pode implementar a chamada à API para registrar o like
  }

  const handleDelete = async () => {
    if (!isAuthor) return

    try {
      setIsDeleting(true)
      await postsService.deletePost(post.id)

      toast({
        title: "Sucesso",
        description: "Post excluído com sucesso!",
      })

      if (onPostDeleted) {
        onPostDeleted()
      } else {
        // Recarregar a página ou atualizar a lista de posts
        router.refresh()
      }
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

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage
                src={post.author?.image || "/placeholder.svg?height=40&width=40"}
                alt={post.author?.name || "Autor"}
              />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{post.author?.name || "Autor desconhecido"}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <span>{post.author?.role || "Usuário"}</span>
                <span>•</span>
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>

          {isAuthor && (
            <div className="z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Opções</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/edit-post/${post.id}`} className="cursor-pointer flex items-center">
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 cursor-pointer flex items-center"
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
                      onClick={handleDelete}
                      className="bg-red-500 text-white hover:bg-red-600"
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
      </CardHeader>
      <Link href={`/post/${post.id}`}>
        <CardContent className="p-4 pt-0">
          <h3 className="text-xl font-bold mb-2">{post.title || "Sem título"}</h3>
          <p className="text-muted-foreground">{post.description || "Sem descrição"}</p>

          {post.image && (
            <div className="mt-4 w-full overflow-hidden rounded-md">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                )}

                {imageError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Não foi possível carregar a imagem</p>
                  </div>
                ) : (
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title || "Imagem do post"}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleLike()
          }}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span className="text-sm">{likeCount}</span>
        </Button>
        <Link href={`/post/${post.id}#comments`} passHref>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{post.comments || 0}</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

