"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { RotateCw } from "lucide-react"
import "react-image-crop/dist/ReactCrop.css"

interface ImageCropperProps {
  imageFile: File | null
  onCropComplete: (croppedImageFile: File) => void
  onCancel: () => void
  aspectRatio?: number
  open: boolean
}

export function ImageCropper({
  imageFile,
  onCropComplete,
  onCancel,
  aspectRatio = 1, // 1:1 por padrão (quadrado)
  open,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Carregar a imagem quando o arquivo mudar
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (aspectRatio) {
        const { width, height } = e.currentTarget
        const crop = centerCrop(
          makeAspectCrop(
            {
              unit: "%",
              width: 90,
            },
            aspectRatio,
            width,
            height,
          ),
          width,
          height,
        )
        setCrop(crop)
      }
    },
    [aspectRatio],
  )

  // Criar URL para o arquivo de imagem
  useState(() => {
    if (!imageFile) return

    const url = URL.createObjectURL(imageFile)
    setImageUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  })

  // Função para aplicar o recorte
  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ajustar para escala e rotação
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height

    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY

    // Desenhar a imagem recortada no canvas
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    )

    // Redimensionar para 1080x1080 se necessário
    const finalCanvas = document.createElement("canvas")
    const finalCtx = finalCanvas.getContext("2d")
    if (!finalCtx) return

    finalCanvas.width = 1080
    finalCanvas.height = 1080
    finalCtx.drawImage(canvas, 0, 0, 1080, 1080)

    // Converter para blob e depois para File
    finalCanvas.toBlob(
      (blob) => {
        if (!blob || !imageFile) return

        const croppedFile = new File([blob], imageFile.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        })

        onCropComplete(croppedFile)
      },
      "image/jpeg",
      0.95,
    )
  }

  // Rotacionar a imagem
  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360)
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
              aspect={aspectRatio}
              className="max-h-[400px] mx-auto"
            >
              <img
                ref={imgRef}
                src={imageUrl || "/placeholder.svg"}
                alt="Imagem para recorte"
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxWidth: "100%",
                  maxHeight: "400px",
                  objectFit: "contain",
                }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Zoom</label>
              <Slider value={[scale]} min={0.5} max={2} step={0.01} onValueChange={(value) => setScale(value[0])} />
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="icon" onClick={handleRotate} className="mr-2">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
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

