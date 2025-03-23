"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase-client"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, BookOpen, Calendar, Users, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)

        // Verificar se o usuário está autenticado
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          throw new Error(error.message)
        }

        if (!data.user) {
          throw new Error("Usuário não autenticado")
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados:", err)
        setError(err.message || "Erro ao carregar dados")
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      loadData()
    }
  }, [authLoading])

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23b5b5]"></div>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo à sua área de gerenciamento de conteúdos educacionais.</p>
          </div>

          {isTeacher && (
            <Link href="/create-post">
              <Button className="mt-4 md:mt-0 bg-[#23b5b5] hover:bg-[#23b5b5]/90 text-white">
                <Plus className="mr-2 h-4 w-4" /> Criar Novo Conteúdo
              </Button>
            </Link>
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 bg-white dark:bg-gray-800 p-1 rounded-lg border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#23b5b5] data-[state=active]:text-white">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-[#23b5b5] data-[state=active]:text-white">
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-[#23b5b5] data-[state=active]:text-white">
              Conta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Conteúdos</p>
                    <h3 className="text-2xl font-bold">0</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[#23b5b5]/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-[#23b5b5]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Visualizações</p>
                    <h3 className="text-2xl font-bold">0</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[#23b5b5]/10 flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-[#23b5b5]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Alunos</p>
                    <h3 className="text-2xl font-bold">0</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[#23b5b5]/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#23b5b5]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Eventos</p>
                    <h3 className="text-2xl font-bold">0</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[#23b5b5]/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-[#23b5b5]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Bem-vindo!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Olá, <span className="font-medium">{user.name}</span>!
                  </p>
                  <p className="mb-4">
                    Você está autenticado com sucesso no dashboard do AstraMentor, sua plataforma educacional para
                    publicação e gestão de conteúdos.
                  </p>

                  {isTeacher ? (
                    <p>Como professor, você pode criar e compartilhar conteúdos educacionais com seus alunos.</p>
                  ) : (
                    <p>Como aluno, você pode acessar conteúdos educacionais compartilhados pelos professores.</p>
                  )}

                  <div className="mt-6">
                    {isTeacher ? (
                      <Link href="/create-post">
                        <Button className="bg-[#23b5b5] hover:bg-[#23b5b5]/90">Criar Novo Conteúdo</Button>
                      </Link>
                    ) : (
                      <Link href="/feed">
                        <Button className="bg-[#23b5b5] hover:bg-[#23b5b5]/90">Explorar Conteúdos</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-2 text-sm text-muted-foreground">
                      Nenhuma atividade recente para exibir.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-muted-foreground">Estatísticas serão exibidas aqui.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="pt-4 border-t">
                    <Link href="/profile">
                      <Button variant="outline" className="border-[#23b5b5] text-[#23b5b5] hover:bg-[#23b5b5]/10">
                        Editar Perfil
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

