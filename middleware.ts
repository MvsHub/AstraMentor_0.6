import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware desativado temporariamente para diagnóstico
export async function middleware(request: NextRequest) {
  // Permitir todas as solicitações sem verificação
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/create-post/:path*",
    "/edit-post/:path*",
    "/feed/:path*",
  ],
}

