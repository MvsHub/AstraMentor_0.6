"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import "react-image-crop/dist/ReactCrop.css"

interface ImageCropperSimpleProps {
  imageUrl: string | null
  onComplete: (croppedImageUrl: string) => void
  onCancel: () => void
  open: boolean
}

export function ImageCropperSimple({ imageUrl, onComplete, onCancel, open }: ImageCropperSimpleProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const imgRef = useRef<HTMLImageElement>(null)

  // Inicializar o recorte quando a imagem carregar
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget

    // Criar um recorte inicial centralizado com proporção 1:1
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        1, // proporção 1:1 (quadrado)
        width,
        height,
      ),
      width,
      height,
    )

    setCrop(crop)
  }, [])

  // Aplicar o recorte e gerar a imagem final
  const handleCropComplete = () => {
    if (!imgRef.current || !completedCrop) {
      console.error("Imagem ou recorte não disponível")
      return
    }

    try {
      const image = imgRef.current
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        console.error("Contexto de canvas não disponível")
        return
      }

      // Calcular dimensões do recorte
      const cropWidth = completedCrop.width * scaleX || 0
      const cropHeight = completedCrop.height * scaleY || 0
      const cropX = completedCrop.x * scaleX || 0
      const cropY = completedCrop.y * scaleY || 0

      // Definir tamanho máximo como 1080x1080
      const maxSize = 1080

      // Calcular dimensões finais mantendo a proporção
      let finalWidth = cropWidth
      let finalHeight = cropHeight

      // Redimensionar se necessário
      if (cropWidth > maxSize || cropHeight > maxSize) {
        if (cropWidth > cropHeight) {
          finalWidth = maxSize
          finalHeight = (cropHeight / cropWidth) * maxSize
        } else {
          finalHeight = maxSize
          finalWidth = (cropWidth / cropHeight) * maxSize
        }
      }

      // Configurar o canvas
      canvas.width = finalWidth
      canvas.height = finalHeight

      // Desenhar a imagem recortada no canvas
      ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, finalWidth, finalHeight)

      // Converter para URL de dados
      const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.9)

      console.log("Imagem recortada com sucesso")

      // Retornar a URL da imagem recortada
      onComplete(croppedImageUrl)
    } catch (error) {
      console.error("Erro ao recortar imagem:", error)
      onCancel()
    }
  }

  if (!imageUrl) return null

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajustar Imagem</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="relative overflow-hidden rounded-md">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1} // Proporção 1:1 (quadrado)
              className="max-h-[400px] mx-auto"
            >
              <img
                ref={imgRef}
                src={imageUrl || "/placeholder.svg"}
                alt="Imagem para recorte"
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  objectFit: "contain",
                }}
                onLoad={onImageLoad}
                crossOrigin="anonymous"
              />
            </ReactCrop>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Arraste para ajustar o recorte. A imagem será redimensionada para no máximo 1080x1080 pixels.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleCropComplete}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

