"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { postsService } from "@/lib/posts-service"
import { supabase } from "@/lib/supabase-client"
import { SimpleImageUpload } from "@/components/simple-image-upload"

const postSchema = z.object({
  title: z
    .string()
    .min(3, {
      message: "O título deve ter pelo menos 3 caracteres.",
    })
    .max(150, {
      message: "O título não pode ter mais de 150 caracteres.",
    }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  content: z.string().min(10, {
    message: "O conteúdo deve ter pelo menos 10 caracteres.",
  }),
})

interface PostFormProps {
  postId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function PostForm({ postId, onSuccess, onCancel }: PostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!!postId)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()

  // Persistência do formulário usando localStorage
  const formPersistKey = postId ? `post-form-${postId}` : "post-form-new"

  // Função para salvar o estado do formulário
  const saveFormState = (values: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        formPersistKey,
        JSON.stringify({
          ...values,
        }),
      )
    }
  }

  // Função para limpar o estado salvo
  const clearFormState = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(formPersistKey)
    }
  }

  // Carregar estado salvo
  const loadFormState = () => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem(formPersistKey)
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState)
          return {
            title: parsedState.title || "",
            description: parsedState.description || "",
            content: parsedState.content || "",
          }
        } catch (e) {
          console.error("Erro ao carregar estado salvo:", e)
        }
      }
    }
    return {
      title: "",
      description: "",
      content: "",
    }
  }

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: async () => {
      if (postId) {
        setIsLoading(true)
        try {
          const post = await postsService.getPost(postId)

          if (!post) {
            toast({
              title: "Erro",
              description: "Post não encontrado.",
              variant: "destructive",
            })
            return {
              title: "",
              description: "",
              content: "",
            }
          }

          // Configurar preview da imagem se existir
          if (post.image) {
            setImagePreview(post.image)
          }

          setIsLoading(false)
          return {
            title: post.title,
            description: post.description,
            content: post.content,
          }
        } catch (error) {
          console.error("Erro ao buscar post:", error)
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do post.",
            variant: "destructive",
          })
          return {
            title: "",
            description: "",
            content: "",
          }
        } finally {
          setIsLoading(false)
        }
      }

      // Se não for edição, tentar carregar do localStorage
      return loadFormState()
    },
  })

  // Salvar estado do formulário quando mudar
  useEffect(() => {
    const subscription = form.watch((value) => {
      saveFormState(value)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Função para lidar com a seleção de imagem
  const handleImageSelected = (file: File | null) => {
    setImageFile(file)

    if (file) {
      // Criar URL para preview
      const objectUrl = URL.createObjectURL(file)
      setImagePreview(objectUrl)

      // Limpar URL quando o componente for desmontado
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setImagePreview(null)
    }
  }

  async function onSubmit(values: z.infer<typeof postSchema>) {
    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // Buscar ID do usuário atual
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user.id) {
        throw new Error("Usuário não autenticado")
      }

      let imageUrl = null

      // Se houver uma imagem para upload
      if (imageFile) {
        try {
          setUploadProgress(10)
          console.log("Iniciando upload da imagem...")

          // Gerar nome de arquivo único
          const fileExt = imageFile.name.split(".").pop()
          const fileName = `${Date.now()}.${fileExt}`
          const filePath = `${session.user.id}/${fileName}`

          console.log("Preparando upload para o Supabase...", {
            fileSize: imageFile.size,
            fileType: imageFile.type,
            fileName: fileName,
            filePath: filePath,
          })

          // Método direto de upload
          const { data, error } = await supabase.storage.from("avatares").upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: true,
          })

          if (error) {
            console.error("Erro no upload direto:", error)

            // Tentar método alternativo
            console.log("Tentando método alternativo...")

            // Converter o arquivo para um array buffer
            const arrayBuffer = await imageFile.arrayBuffer()
            const fileData = new Uint8Array(arrayBuffer)

            // Tentar upload com o método alternativo
            const { data: altData, error: altError } = await supabase.storage
              .from("avatares")
              .upload(filePath, fileData, {
                contentType: imageFile.type,
                cacheControl: "3600",
                upsert: true,
              })

            if (altError) {
              console.error("Erro no método alternativo:", altError)
              throw altError
            }

            console.log("Upload alternativo concluído com sucesso:", altData)
            setUploadProgress(80)

            // Obter URL pública
            const {
              data: { publicUrl },
            } = supabase.storage.from("avatares").getPublicUrl(filePath)

            console.log("URL pública da imagem:", publicUrl)
            imageUrl = publicUrl
          } else {
            console.log("Upload concluído com sucesso:", data)
            setUploadProgress(80)

            // Obter URL pública
            const {
              data: { publicUrl },
            } = supabase.storage.from("avatares").getPublicUrl(filePath)

            console.log("URL pública da imagem:", publicUrl)
            imageUrl = publicUrl
          }

          setUploadProgress(100)
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error)
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer o upload da imagem. O post será salvo sem imagem.",
            variant: "destructive",
          })
        }
      } else if (imagePreview && !imagePreview.startsWith("blob:") && !imageFile) {
        // Se for uma URL existente (edição) e não tiver um novo arquivo
        imageUrl = imagePreview
      }

      console.log("Salvando post com imageUrl:", imageUrl)

      if (postId) {
        // Atualizar post existente
        await postsService.updatePost(postId, {
          ...values,
          status: "published", // Sempre publicado
          image_url: imageUrl,
        })

        toast({
          title: "Sucesso",
          description: "Post atualizado com sucesso!",
        })
      } else {
        // Criar novo post
        const result = await postsService.createPost(session.user.id, {
          ...values,
          status: "published", // Sempre publicado
          image_url: imageUrl,
        })

        console.log("Post criado com sucesso:", result)

        toast({
          title: "Sucesso",
          description: "Post criado com sucesso!",
        })
      }

      // Limpar estado salvo
      clearFormState()

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/feed")
      }
    } catch (error: any) {
      console.error("Erro ao salvar post:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o post. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#23b5b5]"></div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título do seu post" {...field} />
              </FormControl>
              <FormDescription>Máximo de 150 caracteres.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite uma breve descrição do seu post" className="resize-y" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite o conteúdo do seu post" className="min-h-[200px] resize-y" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Imagem da Postagem</FormLabel>
          <SimpleImageUpload onImageSelected={handleImageSelected} previewUrl={imagePreview} />
          <p className="text-xs text-muted-foreground">A imagem será exibida no feed e na página do post.</p>
        </div>

        {uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Enviando imagem...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-[#23b5b5] h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel || (() => router.back())}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#23b5b5] hover:bg-[#23b5b5]/90 text-white">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Salvando..." : postId ? "Atualizar" : "Publicar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

