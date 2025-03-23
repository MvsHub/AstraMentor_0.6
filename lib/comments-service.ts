import { supabase } from "./supabase-client"

export interface CommentData {
  content: string
}

export const commentsService = {
  // Buscar comentários de um post
  getComments: async (postId: string) => {
    try {
      console.log("Buscando comentários para o post:", postId)
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          author:profiles(id, name, email, user_type, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Erro ao buscar comentários:", error)
        throw error
      }

      console.log("Comentários encontrados:", data)

      // Formatar os dados para o formato esperado pela UI
      return data.map((comment) => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.author?.id,
          name: comment.author?.name || "Usuário desconhecido",
          image: comment.author?.avatar_url || "/placeholder.svg?height=32&width=32",
        },
        publishedAt: comment.created_at,
        likes: comment.likes || 0,
      }))
    } catch (error) {
      console.error("Erro ao buscar comentários:", error)
      return []
    }
  },

  // Adicionar um comentário
  addComment: async (postId: string, userId: string, commentData: CommentData) => {
    try {
      console.log("Adicionando comentário:", { postId, userId, content: commentData.content })

      // Verificar se o usuário existe
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("id", userId)
        .single()

      if (userError) {
        console.error("Erro ao verificar usuário:", userError)
        throw new Error("Usuário não encontrado")
      }

      console.log("Usuário encontrado:", userData)

      // Verificar se o post existe
      const { data: postData, error: postError } = await supabase.from("posts").select("id").eq("id", postId).single()

      if (postError) {
        console.error("Erro ao verificar post:", postError)
        throw new Error("Post não encontrado")
      }

      console.log("Post encontrado:", postData)

      // Inserir o comentário
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          author_id: userId,
          content: commentData.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes: 0,
        })
        .select()

      if (error) {
        console.error("Erro ao inserir comentário:", error)
        throw new Error(`Erro ao adicionar comentário: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.error("Nenhum dado retornado após inserção do comentário")
        throw new Error("Erro ao adicionar comentário: nenhum dado retornado")
      }

      console.log("Comentário inserido com sucesso:", data[0])

      // Atualizar a contagem de comentários no post
      try {
        const { error: updateError } = await supabase.rpc("increment_count", { row_id: postId })

        if (updateError) {
          console.error("Erro ao incrementar contagem de comentários:", updateError)
          // Não vamos lançar erro aqui para não interromper o fluxo
        } else {
          console.log("Contagem de comentários incrementada com sucesso")
        }
      } catch (rpcError) {
        console.error("Erro ao chamar RPC para incrementar comentários:", rpcError)
        // Tentar atualizar diretamente
        try {
          const { data: postToUpdate } = await supabase.from("posts").select("comments_count").eq("id", postId).single()

          const currentCount = postToUpdate?.comments_count || 0

          await supabase
            .from("posts")
            .update({
              comments_count: currentCount + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", postId)

          console.log("Contagem de comentários atualizada manualmente")
        } catch (updateError) {
          console.error("Erro ao atualizar contagem manualmente:", updateError)
        }
      }

      // Formatar os dados para o formato esperado pela UI
      return {
        id: data[0].id,
        content: data[0].content,
        author: {
          id: userId,
          name: userData.name || "Usuário",
          image: "/placeholder.svg?height=32&width=32",
        },
        publishedAt: data[0].created_at,
        likes: 0,
      }
    } catch (error: any) {
      console.error("Erro completo ao adicionar comentário:", error)
      throw error
    }
  },
}

