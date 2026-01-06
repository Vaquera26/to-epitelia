"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Photo {
  id: number
  filename: string
  description: string | null
}

interface PhotoLightboxProps {
  photos: Photo[]
  initialIndex: number
  onClose: () => void
}

export function PhotoLightbox({ photos, initialIndex, onClose }: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") goToPrevious()
      if (e.key === "ArrowRight") goToNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const currentPhoto = photos[currentIndex]

  return (
    <div 
      className="fixed inset-0 z-50 bg-pink-100 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-pink-600 hover:bg-pink-200 rounded-full z-10 border-2 border-pink-300"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600 hover:bg-pink-200 rounded-full border-2 border-pink-300"
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-600 hover:bg-pink-200 rounded-full border-2 border-pink-300"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}

      <div className="max-w-5xl w-full relative" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-pink-200 p-4 md:p-6 rounded-3xl">
          <div className="relative bg-white p-2 md:p-3 rounded-2xl">
            <div className="absolute -top-8 -left-8 md:-top-12 md:-left-12 z-10 w-20 h-20 md:w-28 md:h-28">
              <Image
                src="/snoopy1.png"
                alt="Snoopy"
                fill
                className="object-contain"
              />
            </div>

            <div className="absolute -bottom-8 -right-8 md:-bottom-12 md:-right-12 z-10 w-20 h-20 md:w-28 md:h-28">
              <Image
                src="/snoopy2.png"
                alt="Snoopy"
                fill
                className="object-contain"
              />
            </div>

            <Heart className="absolute top-4 right-4 w-6 h-6 text-pink-300 fill-pink-200" />
            <Heart className="absolute bottom-4 left-4 w-5 h-5 text-rose-300 fill-rose-200" />

            <img
              src={
                currentPhoto.filename.startsWith("http")
                  ? currentPhoto.filename
                  : `/fotos_con_epitelia/${currentPhoto.filename}`
              }
              alt={currentPhoto.description || "Momento especial"}
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
            />
          </div>

          {currentPhoto.description && (
            <div className="mt-6 text-center px-4">
              <div className="inline-block bg-white px-6 py-3 rounded-full border-2 border-pink-200">
                <p className="text-pink-800 text-base md:text-lg font-semibold italic">
                  {currentPhoto.description}
                </p>
              </div>
            </div>
          )}

          {photos.length > 1 && (
            <div className="mt-4 text-center">
              <span className="inline-block bg-pink-300 text-pink-800 px-4 py-2 rounded-full text-sm font-medium">
                {currentIndex + 1} de {photos.length} recuerdos
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}