"use client"

import { useRef } from "react"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { ThemeToggle } from "../components/theme-toggle"

export default function HomePage() {
  const featuresRef = useRef<HTMLElement>(null)

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              <span className="text-brand">Astra</span>Mentor
            </h1>
          </div>
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-foreground">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-brand text-white hover:bg-brand-hover">Registrar</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-background">
        <section className="w-full py-24 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                    Conectando Educadores e Estudantes
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    AstraMentor é uma plataforma educacional que permite a publicação e gestão de conteúdos, integrando
                    professores e alunos em um ambiente colaborativo.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="w-full min-[400px]:w-auto bg-brand text-white hover:bg-brand-hover">
                      Começar Agora
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full min-[400px]:w-auto border-brand text-brand hover:bg-brand/10"
                    onClick={scrollToFeatures}
                  >
                    Saiba Mais
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div
                  className="w-full max-w-[1080px] overflow-hidden rounded-xl bg-muted dark:bg-gradient-to-br dark:from-[#0a1a2f] dark:to-[#0d2e4e] flex items-center justify-center"
                  style={{ aspectRatio: "1/1" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground opacity-50"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          ref={featuresRef}
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary dark:bg-[#0a1a2f]/80"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Recursos da Plataforma</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Conheça os principais recursos que o AstraMentor oferece para melhorar a experiência de aprendizado.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm bg-background dark:bg-[#0d2e4e]/70">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Conteúdo Educacional</h3>
                <p className="text-center text-muted-foreground">
                  Acesse conteúdos exclusivos criados por professores especializados.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm bg-background dark:bg-[#0d2e4e]/70">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Interação</h3>
                <p className="text-center text-muted-foreground">
                  Comente, discuta e interaja com outros alunos e professores.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm bg-background dark:bg-[#0d2e4e]/70">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Acesso Global</h3>
                <p className="text-center text-muted-foreground">
                  Acesse a plataforma de qualquer lugar, a qualquer momento.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container flex flex-col gap-2 py-6 md:flex-row md:items-center md:justify-between md:py-8">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AstraMentor. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex justify-center gap-4 md:justify-end">
            <Link href="#" className="text-sm text-muted-foreground hover:text-brand">
              Termos de Uso
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-brand">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

