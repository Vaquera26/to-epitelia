"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Trash2, Plus, Edit2, X } from "lucide-react"

const ADMIN_USER = "VaqueraElMasPro"
const ADMIN_PASSWORD = "TeQuieroEpitelia"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Usuario o contraseña incorrectos")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            Cerrar Sesión
          </Button>
        </div>

        <Tabs defaultValue="songs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="songs">Canciones</TabsTrigger>
            <TabsTrigger value="phrases">Frases</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
          </TabsList>

          <TabsContent value="songs">
            <SongsManager />
          </TabsContent>

          <TabsContent value="phrases">
            <PhrasesManager />
          </TabsContent>

          <TabsContent value="photos">
            <PhotosManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SongsManager() {
  const [songs, setSongs] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    const res = await fetch("/api/songs")
    const data = await res.json()
    setSongs(data)
  }

  const searchSpotify = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`)
    const data = await res.json()
    setSearchResults(data)
    setIsSearching(false)
  }

  const addSong = async (spotifyId: string) => {
    await fetch("/api/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotify_id: spotifyId }),
    })
    fetchSongs()
    setSearchResults([])
    setSearchQuery("")
  }

  const deleteSong = async (id: string) => {
    await fetch(`/api/songs?id=${id}`, { method: "DELETE" })
    fetchSongs()
  }

  const reorderSongs = async (newOrder: any[]) => {
    setSongs(newOrder)
    await fetch("/api/songs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songs: newOrder }),
    })
  }

  const moveSong = (index: number, direction: "up" | "down") => {
    const newSongs = [...songs]
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newSongs.length) return
    ;[newSongs[index], newSongs[newIndex]] = [newSongs[newIndex], newSongs[index]]
    reorderSongs(newSongs)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buscar Canciones en Spotify</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Buscar canción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchSpotify()}
            />
            <Button onClick={searchSpotify} disabled={isSearching}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((track) => (
                <div key={track.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <img
                    src={track.album.images[2]?.url || "/placeholder.svg"}
                    alt={track.album.name}
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{track.name}</p>
                    <p className="text-sm text-gray-600">{track.artists.map((a: any) => a.name).join(", ")}</p>
                  </div>
                  <Button size="sm" onClick={() => addSong(track.id)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Canciones ({songs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {songs.map((song, index) => (
              <div key={song.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="ghost" onClick={() => moveSong(index, "up")} disabled={index === 0}>
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveSong(index, "down")}
                    disabled={index === songs.length - 1}
                  >
                    ↓
                  </Button>
                </div>
                <img src={song.album_image_url || "/placeholder.svg"} alt={song.album} className="w-12 h-12 rounded" />
                <div className="flex-1">
                  <p className="font-medium">{song.name}</p>
                  <p className="text-sm text-gray-600">{song.artist}</p>
                </div>
                <Button size="sm" variant="destructive" onClick={() => deleteSong(song.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PhrasesManager() {
  const [phrases, setPhrases] = useState<any[]>([])
  const [newPhrase, setNewPhrase] = useState({ text: "", time_type: "anytime" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingPhrase, setEditingPhrase] = useState({ text: "", time_type: "" })

  useEffect(() => {
    fetchPhrases()
  }, [])

  const fetchPhrases = async () => {
    const res = await fetch("/api/phrases")
    const data = await res.json()
    setPhrases(data)
  }

  const addPhrase = async () => {
    if (!newPhrase.text.trim()) return
    await fetch("/api/phrases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPhrase),
    })
    setNewPhrase({ text: "", time_type: "anytime" })
    fetchPhrases()
  }

  const deletePhrase = async (id: string) => {
    await fetch(`/api/phrases?id=${id}`, { method: "DELETE" })
    fetchPhrases()
  }

  const startEdit = (phrase: any) => {
    setEditingId(phrase.id)
    setEditingPhrase({ text: phrase.text, time_type: phrase.time_type })
  }

  const saveEdit = async () => {
    if (!editingId) return
    await fetch("/api/phrases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...editingPhrase }),
    })
    setEditingId(null)
    fetchPhrases()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nueva Frase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Frase</Label>
            <Textarea
              value={newPhrase.text}
              onChange={(e) => setNewPhrase({ ...newPhrase, text: e.target.value })}
              placeholder="Escribe una frase..."
            />
          </div>
          <div>
            <Label>Momento del día</Label>
            <Select
              value={newPhrase.time_type}
              onValueChange={(value) => setNewPhrase({ ...newPhrase, time_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Mañana</SelectItem>
                <SelectItem value="afternoon">Tarde</SelectItem>
                <SelectItem value="evening">Atardecer</SelectItem>
                <SelectItem value="night">Noche</SelectItem>
                <SelectItem value="anytime">Cualquier momento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addPhrase} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Frase
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frases Guardadas ({phrases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {phrases.map((phrase) => (
              <div key={phrase.id} className="border rounded-lg p-4">
                {editingId === phrase.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editingPhrase.text}
                      onChange={(e) => setEditingPhrase({ ...editingPhrase, text: e.target.value })}
                    />
                    <Select
                      value={editingPhrase.time_type}
                      onValueChange={(value) => setEditingPhrase({ ...editingPhrase, time_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Mañana</SelectItem>
                        <SelectItem value="afternoon">Tarde</SelectItem>
                        <SelectItem value="evening">Atardecer</SelectItem>
                        <SelectItem value="night">Noche</SelectItem>
                        <SelectItem value="anytime">Cualquier momento</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button onClick={saveEdit} size="sm">
                        Guardar
                      </Button>
                      <Button onClick={() => setEditingId(null)} size="sm" variant="outline">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{phrase.text}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {phrase.time_type === "morning" && "Mañana"}
                        {phrase.time_type === "afternoon" && "Tarde"}
                        {phrase.time_type === "evening" && "Atardecer"}
                        {phrase.time_type === "night" && "Noche"}
                        {phrase.time_type === "anytime" && "Cualquier momento"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(phrase)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deletePhrase(phrase.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PhotosManager() {
  const [photos, setPhotos] = useState<any[]>([])
  const [newPhoto, setNewPhoto] = useState({ filename: "", description: "" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    const res = await fetch("/api/photos")
    const data = await res.json()
    setPhotos(data)
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress("Subiendo foto...")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const uploadRes = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error("Error al subir foto")
      }

      const uploadData = await uploadRes.json()

      setUploadProgress("Guardando en base de datos...")

      await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: uploadData.url,
          description: newPhoto.description,
        }),
      })

      setNewPhoto({ filename: "", description: "" })
      setSelectedFile(null)
      setUploadProgress("¡Foto subida exitosamente!")
      fetchPhotos()

      setTimeout(() => setUploadProgress(""), 2000)
    } catch (error) {
      setUploadProgress("Error al subir foto")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const addPhoto = async () => {
    if (!newPhoto.filename.trim()) return
    await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPhoto),
    })
    setNewPhoto({ filename: "", description: "" })
    fetchPhotos()
  }

  const deletePhoto = async (id: string) => {
    await fetch(`/api/photos?id=${id}`, { method: "DELETE" })
    fetchPhotos()
  }

  const movePhoto = (index: number, direction: "up" | "down") => {
    const newPhotos = [...photos]
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newPhotos.length) return
    ;[newPhotos[index], newPhotos[newIndex]] = [newPhotos[newIndex], newPhotos[index]]
    setPhotos(newPhotos)
    reorderPhotos(newPhotos)
  }

  const reorderPhotos = async (newOrder: any[]) => {
    await fetch("/api/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos: newOrder }),
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nueva Foto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subir foto desde tu dispositivo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Archivo seleccionado: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}
          </div>
          <div>
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={newPhoto.description}
              onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
              placeholder="Un momento especial..."
              disabled={isUploading}
            />
          </div>
          <Button onClick={handleFileUpload} className="w-full" disabled={!selectedFile || isUploading}>
            <Plus className="w-4 h-4 mr-2" />
            {isUploading ? "Subiendo..." : "Subir Foto"}
          </Button>
          {uploadProgress && <p className="text-sm text-center text-gray-600">{uploadProgress}</p>}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o agregar manualmente</span>
            </div>
          </div>

          <div>
            <Label>Nombre del archivo (ruta local)</Label>
            <Input
              value={newPhoto.filename}
              onChange={(e) => setNewPhoto({ ...newPhoto, filename: e.target.value })}
              placeholder="foto1.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Las fotos deben estar en /public/fotos_con_epitelia/</p>
          </div>
          <Button onClick={addPhoto} className="w-full bg-transparent" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Agregar desde carpeta local
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fotos Guardadas ({photos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {photos.map((photo, index) => (
              <div key={photo.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="ghost" onClick={() => movePhoto(index, "up")} disabled={index === 0}>
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => movePhoto(index, "down")}
                    disabled={index === photos.length - 1}
                  >
                    ↓
                  </Button>
                </div>
                <img
                  src={photo.filename.startsWith("http") ? photo.filename : `/fotos_con_epitelia/${photo.filename}`}
                  alt={photo.description}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm break-all">
                    {photo.filename.startsWith("http")
                      ? `Foto subida (${new Date(photo.created_at).toLocaleDateString()})`
                      : photo.filename}
                  </p>
                  {photo.description && <p className="text-sm text-gray-600">{photo.description}</p>}
                </div>
                <Button size="sm" variant="destructive" onClick={() => deletePhoto(photo.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
