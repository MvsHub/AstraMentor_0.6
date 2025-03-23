"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface PostImageProps {
  src: string
  alt: string
  className?: string
}

export function PostImage({ src, alt, className = "" }: PostImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Reset estado quando a src mudar
    setIsLoading(true)
    setError(false)
  }, [src])

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}

      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError(true)
        }}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Não foi possível carregar a imagem</p>
        </div>
      )}
    </div>
  )
}

