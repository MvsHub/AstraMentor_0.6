import { supabase } from "./supabase-client"

export interface PostData {
  title: string
  description: string
  content: string
  status: "draft" | "published"
  image_url?: string | null
}

export const postsService = {
  // Buscar todos os posts
  getPosts: async (query?: string) => {
    try {
      let queryBuilder = supabase
        .from("posts")
        .select(`
          *,
          author:profiles(id, name, email, user_type, avatar_url)
        `)
        .order("created_at", { ascending: false })

      // Se houver uma query de busca, filtrar por título ou descrição
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      }

      const { data, error } = await queryBuilder

      if (error) {
        console.error("Erro ao buscar posts:", error)
        throw error
      }

      // Se não houver dados, retornar array vazio
      if (!data || data.length === 0) {
        return []
      }

      // Formatar os dados para o formato esperado pela UI
      return data.map((post) => ({
        id: post.id,
        title: post.title || "Sem título",
        description: post.description || "Sem descrição",
        content: post.content || "",
        status: post.status || "draft",
        author: {
          id: post.author?.id,
          name: post.author?.name || "Usuário desconhecido",
          image: post.author?.avatar_url || "/placeholder.svg?height=40&width=40",
          role: post.author?.user_type === "teacher" ? "Professor" : "Aluno",
        },
        publishedAt: post.created_at,
        updatedAt: post.updated_at,
        likes: post.likes || 0,
        comments: post.comments_count || 0,
        image: post.image_url,
      }))
    } catch (error) {
      console.error("Erro ao buscar posts:", error)
      return []
    }
  },

  // Buscar posts de um usuário específico
  getUserPosts: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles(id, name, email, user_type, avatar_url)
        `)
        .eq("author_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar posts do usuário:", error)
        throw error
      }

      if (!data || data.length === 0) {
        return []
      }

      return data.map((post) => ({
        id: post.id,
        title: post.title || "Sem título",
        description: post.description || "Sem descrição",
        content: post.content || "",
        status: post.status || "draft",
        author: {
          id: post.author?.id,
          name: post.author?.name || "Usuário desconhecido",
          image: post.author?.avatar_url || "/placeholder.svg?height=40&width=40",
          role: post.author?.user_type === "teacher" ? "Professor" : "Aluno",
        },
        publishedAt: post.created_at,
        updatedAt: post.updated_at,
        likes: post.likes || 0,
        comments: post.comments_count || 0,
        image: post.image_url,
      }))
    } catch (error) {
      console.error("Erro ao buscar posts do usuário:", error)
      return []
    }
  },

  // Buscar um post específico
  getPost: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles(id, name, email, user_type, avatar_url)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Erro ao buscar post:", error)
        throw error
      }

      if (!data) {
        return null
      }

      // Formatar os dados para o formato esperado pela UI
      return {
        id: data.id,
        title: data.title || "Sem título",
        description: data.description || "Sem descrição",
        content: data.content || "",
        status: data.status || "draft",
        author: {
          id: data.author?.id,
          name: data.author?.name || "Usuário desconhecido",
          image: data.author?.avatar_url || "/placeholder.svg?height=40&width=40",
          role: data.author?.user_type === "teacher" ? "Professor" : "Aluno",
        },
        publishedAt: data.created_at,
        updatedAt: data.updated_at,
        likes: data.likes || 0,
        comments: data.comments_count || 0,
        image: data.image_url,
      }
    } catch (error) {
      console.error("Erro ao buscar post:", error)
      return null
    }
  },

  // Função para fazer upload de imagem
  uploadImage: async (file: File, userId: string): Promise<string | null> => {
    try {
      // Verificar se o arquivo existe
      if (!file) {
        throw new Error("Nenhum arquivo fornecido")
      }

      // Gerar nome de arquivo único
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      console.log("Iniciando upload da imagem para o Supabase...", {
        bucket: "avatares",
        filePath,
        fileSize: file.size,
        fileType: file.type,
      })

      // Método 1: Usar o método upload do Supabase Storage
      const { data, error } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        // Adicione esta linha para definir o owner explicitamente
        metadata: { owner: userId },
      })

      if (error) {
        console.error("Erro no upload para o Supabase:", error)

        // Tentar método alternativo se o primeiro falhar
        console.log("Tentando método alternativo de upload...")

        // Converter o arquivo para um array buffer
        const arrayBuffer = await file.arrayBuffer()
        const fileData = new Uint8Array(arrayBuffer)

        // Tentar upload com o método alternativo
        const { data: altData, error: altError } = await supabase.storage.from("avatars").upload(filePath, fileData, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: true,
          // Adicione esta linha para definir o owner explicitamente
          metadata: { owner: userId },
        })

        if (altError) {
          console.error("Erro no método alternativo de upload:", altError)
          return null
        }

        console.log("Upload alternativo concluído com sucesso:", altData)

        // Obter URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath)

        console.log("URL pública da imagem:", publicUrl)
        return publicUrl
      }

      console.log("Upload concluído com sucesso:", data)

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      console.log("URL pública da imagem:", publicUrl)
      return publicUrl
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error)
      return null
    }
  },

  // Criar um novo post
  createPost: async (userId: string, postData: PostData) => {
    try {
      console.log("Criando post com dados:", {
        ...postData,
        author_id: userId,
        image_url: postData.image_url || null,
      })

      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: postData.title,
          description: postData.description,
          content: postData.content,
          status: postData.status,
          author_id: userId,
          image_url: postData.image_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error("Erro ao criar post:", error)
        throw error
      }

      console.log("Post criado com sucesso:", data[0])
      return data[0]
    } catch (error) {
      console.error("Erro ao criar post:", error)
      throw error
    }
  },

  // Atualizar um post existente
  updatePost: async (id: string, postData: Partial<PostData>) => {
    try {
      console.log("Atualizando post com dados:", {
        ...postData,
        id,
        image_url: postData.image_url || null,
      })

      const { data, error } = await supabase
        .from("posts")
        .update({
          title: postData.title,
          description: postData.description,
          content: postData.content,
          status: postData.status,
          image_url: postData.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()

      if (error) {
        console.error("Erro ao atualizar post:", error)
        throw error
      }

      console.log("Post atualizado com sucesso:", data[0])
      return data[0]
    } catch (error) {
      console.error("Erro ao atualizar post:", error)
      throw error
    }
  },

  // Excluir um post
  deletePost: async (id: string) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id)

      if (error) {
        console.error("Erro ao excluir post:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Erro ao excluir post:", error)
      throw error
    }
  },
}

