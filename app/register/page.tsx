"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { supabase } from "@/lib/supabase-client"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
  userType: z.enum(["student", "teacher"], {
    message: "Por favor, selecione um tipo de usuário.",
  }),
})

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const { signUp } = useSupabaseAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      userType: "student",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setErrorMessage(null)
    setDebugInfo(null)

    try {
      // Verificar se o Supabase está acessível
      const { error: connectionError } = await supabase.from("profiles").select("count").limit(1)

      if (connectionError) {
        if (connectionError.message.includes("permission denied")) {
          setErrorMessage(
            "Erro de permissão no banco de dados. As políticas de segurança (RLS) precisam ser configuradas.",
          )
          setDebugInfo(JSON.stringify(connectionError, null, 2))
          toast({
            title: "Erro de permissão",
            description: "As políticas de segurança do Supabase precisam ser configuradas.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        } else {
          setErrorMessage(`Erro de conexão com o banco de dados: ${connectionError.message}`)
          setDebugInfo(JSON.stringify(connectionError, null, 2))
          setIsLoading(false)
          return
        }
      }

      // Tentar registrar o usuário
      const result = await signUp(values.email, values.password, {
        name: values.name,
        userType: values.userType,
      })

      if (result.success) {
        toast({
          title: "Registro realizado com sucesso!",
          description: "Sua conta foi criada. Você já pode fazer login.",
        })

        // Adicionar um pequeno atraso antes de redirecionar
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        if (result.message.includes("database error saving new user")) {
          setErrorMessage(
            "Erro ao salvar usuário no banco de dados. As políticas de segurança (RLS) precisam ser configuradas.",
          )
          setDebugInfo(JSON.stringify(result, null, 2))
          toast({
            title: "Erro de permissão",
            description: "Configure as políticas de segurança do Supabase.",
            variant: "destructive",
          })
        } else {
          setErrorMessage(result.message)
          setDebugInfo(JSON.stringify(result, null, 2))
          toast({
            title: "Erro ao registrar",
            description: result.message,
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      console.error("Erro durante registro:", error)
      setErrorMessage(`Erro inesperado: ${error.message || "Erro desconhecido"}`)
      setDebugInfo(JSON.stringify(error, null, 2))
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro durante o registro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 w-full flex justify-between px-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Voltar
          </Button>
        </Link>
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-brand">Astra</span>Mentor
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Criar uma conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os campos abaixo para se registrar na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu.email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de usuário</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="student" />
                          </FormControl>
                          <FormLabel className="font-normal">Aluno</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="teacher" />
                          </FormControl>
                          <FormLabel className="font-normal">Professor</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-brand hover:bg-brand-hover text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar"
                )}
              </Button>
            </form>
          </Form>

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md text-sm">
              <p className="font-semibold">Erro:</p>
              <p>{errorMessage}</p>

              <div className="mt-2">
                <p className="font-semibold">Dicas para resolver:</p>
                <ul className="list-disc list-inside text-xs mt-1">
                  <li>Verifique se o email já está em uso</li>
                  <li>Certifique-se de que a senha tenha pelo menos 6 caracteres</li>
                  <li>Configure as políticas de segurança (RLS) no Supabase</li>
                </ul>
              </div>

              <div className="mt-2 flex flex-col space-y-2">
                <Link href="/debug" className="text-blue-600 dark:text-blue-400 text-xs underline">
                  Verificar diagnóstico do Supabase
                </Link>
                <Link href="/supabase-setup" className="text-blue-600 dark:text-blue-400 text-xs underline">
                  Configurar Supabase
                </Link>
              </div>
            </div>
          )}

          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md text-xs overflow-auto max-h-40">
              <p className="font-semibold mb-1">Informações de debug:</p>
              <pre>{debugInfo}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-brand hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

