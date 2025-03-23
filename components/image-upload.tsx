"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  value: string | null
  onChange: (value: string | null) => void
  onFileChange: (file: File | null) => void
}

export function ImageUpload({ value, onChange, onFileChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)

    try {
      // Verificar se é uma imagem
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo de imagem válido.",
          variant: "destructive",
        })
        return
      }

      // Verificar tamanho (limite de 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        })
        return
      }

      // Criar preview da imagem
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        onChange(imageUrl)
        setIsLoading(false)
      }
      reader.onerror = () => {
        toast({
          title: "Erro",
          description: "Não foi possível ler o arquivo de imagem.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
      reader.readAsDataURL(file)

      // Passar o arquivo para o componente pai
      onFileChange(file)
    } catch (error) {
      console.error("Erro ao processar arquivo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a imagem.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    setIsLoading(true)

    try {
      // Verificar se é uma imagem
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "Por favor, solte apenas arquivos de imagem.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Verificar tamanho (limite de 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Criar preview da imagem
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        onChange(imageUrl)
        setIsLoading(false)
      }
      reader.onerror = () => {
        toast({
          title: "Erro",
          description: "Não foi possível ler o arquivo de imagem.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
      reader.readAsDataURL(file)

      // Passar o arquivo para o componente pai
      onFileChange(file)
    } catch (error) {
      console.error("Erro ao processar arquivo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a imagem.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {!value ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? "border-[#23b5b5] bg-[#23b5b5]/5" : "border-gray-300 dark:border-gray-700"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#23b5b5]"></div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Clique para selecionar ou arraste uma imagem</p>
                <p className="text-xs text-gray-400 mt-1">Tamanho máximo: 5MB • Dimensão ideal: 1080 x 1080px</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-md">
            <img src={value || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center mt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Trocar imagem
            </Button>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
        </div>
      )}
    </div>
  )
}

