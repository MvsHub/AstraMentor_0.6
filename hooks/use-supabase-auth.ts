"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase-client"
import type { User } from "@supabase/supabase-js"

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user || null)
        console.log("Sessão atual:", session)
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)
      } finally {
        setLoading(false)
      }
    }

    // Verificar sessão inicial
    checkSession()

    // Configurar listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Evento de autenticação:", _event, session)
      setUser(session?.user || null)
    })

    // Limpar subscription ao desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentando login com:", email)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error("Erro de login:", error)
        return {
          success: false,
          user: null,
          message: error.message || "Erro ao fazer login. Verifique suas credenciais.",
        }
      }

      console.log("Login bem-sucedido:", data)
      return { success: true, user: data.user, message: "Login realizado com sucesso!" }
    } catch (error: any) {
      console.error("Erro completo de login:", error)
      return {
        success: false,
        user: null,
        message: error.message || "Erro ao fazer login. Verifique suas credenciais.",
      }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Verificar se o email já está em uso na tabela de profiles
      const { data: existingProfiles, error: profileCheckError } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .limit(1)

      if (profileCheckError) {
        console.error("Erro ao verificar email existente:", profileCheckError)
      } else if (existingProfiles && existingProfiles.length > 0) {
        return {
          success: false,
          user: null,
          message: "Este email já está em uso. Por favor, use outro email ou faça login.",
          emailSent: false,
        }
      }

      // Registrar usuário usando o método signUp
      // O trigger no Supabase criará automaticamente o perfil
      console.log("Tentando registrar usuário:", email, "com dados:", userData)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            userType: userData.userType,
          },
        },
      })

      if (error) {
        console.error("Erro ao registrar usuário:", error)
        return {
          success: false,
          user: null,
          message: error.message || "Erro ao registrar usuário.",
          emailSent: false,
        }
      }

      if (!data.user) {
        console.error("Usuário não criado após registro")
        return {
          success: false,
          user: null,
          message: "Erro ao criar usuário. Tente novamente.",
          emailSent: false,
        }
      }

      console.log("Usuário registrado com sucesso:", data.user.id)

      // Não precisamos criar o perfil manualmente, o trigger do Supabase fará isso

      return {
        success: true,
        user: data.user,
        message: "Registro realizado com sucesso! Você já pode fazer login.",
        emailSent: !!data.session,
      }
    } catch (error: any) {
      console.error("Erro completo de registro:", error)
      return {
        success: false,
        user: null,
        message: `Erro ao registrar: ${error.message || "Erro desconhecido"}`,
        emailSent: false,
      }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      return { success: true }
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      return { success: false }
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }
}

