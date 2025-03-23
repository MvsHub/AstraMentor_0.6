"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppHeader() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center">
          <h1 className="text-xl font-bold">
            <span className="text-[#23b5b5]">Astra</span>
            <span>Mentor</span>
          </h1>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-[#23b5b5] ${
              pathname === "/dashboard" ? "text-[#23b5b5]" : "text-foreground/80"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/feed"
            className={`text-sm font-medium transition-colors hover:text-[#23b5b5] ${
              pathname === "/feed" ? "text-[#23b5b5]" : "text-foreground/80"
            }`}
          >
            Feed
          </Link>
          <Link
            href="/profile"
            className={`text-sm font-medium transition-colors hover:text-[#23b5b5] ${
              pathname === "/profile" ? "text-[#23b5b5]" : "text-foreground/80"
            }`}
          >
            Perfil
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:block">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-[#23b5b5] text-[#23b5b5] hover:bg-[#23b5b5]/10"
            >
              Sair
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" asChild className={pathname === "/profile" ? "text-[#23b5b5]" : ""}>
              <Link href="/profile">Perfil</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

