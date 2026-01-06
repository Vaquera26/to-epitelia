"use client"

import { useState, useEffect } from "react"
import { PhotoLightbox } from "./photo-lightbox"

interface Photo {
  id: number
  filename: string
  description: string | null
}

interface PhotoGalleryProps {
  photos: Photo[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative break-inside-avoid mb-3 md:mb-4 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setLightboxIndex(index)}
          >
            <img
              src={photo.filename.startsWith("http") ? photo.filename : `/fotos_con_epitelia/${photo.filename}`}
              alt={photo.description || "Momento especial"}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {photo.description && (
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {photo.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox 
          photos={photos} 
          initialIndex={lightboxIndex} 
          onClose={() => setLightboxIndex(null)} 
        />
      )}
    </>
  )
}