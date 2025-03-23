"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useSupabaseAuth } from "../hooks/use-supabase-auth"
import { supabase } from "../lib/supabase-client"

export interface UserProfile {
  id: string // Adicionando o ID do usuário
  name: string
  email: string
  userType: "student" | "teacher"
  registrationNumber: string
  avatar?: string
}

interface AuthContextType {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const { user, loading, signIn, signOut } = useSupabaseAuth()
  const router = useRouter()
  const [fetchingProfile, setFetchingProfile] = useState(false)

  useEffect(() => {
    // Quando o usuário mudar, buscar o perfil completo
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null)
        return
      }

      try {
        setFetchingProfile(true)
        console.log("Buscando perfil para usuário:", user.id)

        // Buscar perfil do usuário no Supabase
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Erro ao buscar perfil:", error)

          // Mesmo com erro, criar um perfil básico com os dados disponíveis
          setUserProfile({
            id: user.id, // Incluindo o ID do usuário
            name: user.user_metadata?.name || "Usuário",
            email: user.email || "",
            userType: (user.user_metadata?.userType as "student" | "teacher") || "student",
            registrationNumber: "",
          })
          return
        }

        if (data) {
          console.log("Perfil encontrado:", data)
          const profile: UserProfile = {
            id: data.id, // Incluindo o ID do usuário
            name: data.name || "Usuário",
            email: data.email || user.email || "",
            userType: (data.user_type as "student" | "teacher") || "student",
            registrationNumber: data.registration_number || "",
            avatar: data.avatar_url || undefined,
          }

          setUserProfile(profile)
        } else {
          console.warn("Perfil não encontrado para o usuário:", user.id)
          // Criar um perfil básico com os dados disponíveis
          setUserProfile({
            id: user.id, // Incluindo o ID do usuário
            name: user.user_metadata?.name || "Usuário",
            email: user.email || "",
            userType: (user.user_metadata?.userType as "student" | "teacher") || "student",
            registrationNumber: "",
          })
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error)
        // Mesmo com erro, criar um perfil básico
        setUserProfile({
          id: user.id, // Incluindo o ID do usuário
          name: user.user_metadata?.name || "Usuário",
          email: user.email || "",
          userType: (user.user_metadata?.userType as "student" | "teacher") || "student",
          registrationNumber: "",
        })
      } finally {
        setFetchingProfile(false)
      }
    }

    fetchUserProfile()
  }, [user])

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn(email, password)

      if (!result.success) {
        return { success: false, message: result.message }
      }

      return {
        success: true,
        message: `Bem-vindo!`,
      }
    } catch (error) {
      console.error("Erro durante login:", error)
      return {
        success: false,
        message: "Ocorreu um erro durante o login. Tente novamente.",
      }
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setUserProfile(null)
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: userProfile,
        login,
        logout,
        isLoading: loading || fetchingProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

