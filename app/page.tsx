import { createClient } from "@/lib/supabase/server"
import { Music, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PhotoGallery } from "@/components/photo-gallery"

function getTimeBasedGreeting() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return "morning"
  } else if (hour >= 12 && hour < 18) {
    return "afternoon"
  } else if (hour >= 18 && hour < 22) {
    return "evening"
  } else {
    return "night"
  }
}

async function getRandomPhrase(timeType: string) {
  const supabase = await createClient()

  const { data } = await supabase.from("phrases").select("*").in("time_type", [timeType, "anytime"])

  if (!data || data.length === 0) {
    return "Hola Epitelia"
  }

  return data[Math.floor(Math.random() * data.length)].text
}

async function getTodaysSong() {
  const supabase = await createClient()

  const { data: songs } = await supabase.from("songs").select("*").order("order_position", { ascending: true })

  if (!songs || songs.length === 0) {
    return null
  }

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const songIndex = dayOfYear % songs.length

  return songs[songIndex]
}

async function getPhotos() {
  const supabase = await createClient()

  const { data } = await supabase.from("photos").select("*").order("order_position", { ascending: true })

  return data || []
}

export default async function Home() {
  const timeType = getTimeBasedGreeting()
  const phrase = await getRandomPhrase(timeType)
  const song = await getTodaysSong()
  const photos = await getPhotos()

  return (
    <main className="min-h-screen bg-pink-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-pink-800">{phrase}</h1>
        </div>

        {song && (
          <div className="mb-10 bg-white rounded-2xl overflow-hidden border-2 border-pink-200">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0">
                  <img
                    src={song.album_image_url || "/placeholder.svg"}
                    alt={song.album}
                    className="w-48 h-48 object-cover rounded-xl"
                  />
                </div>

                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{song.name}</h2>
                  <p className="text-base text-gray-600 mb-4">{song.artist}</p>

                  <Button
                    asChild
                    className="bg-pink-400 hover:bg-pink-500 text-white rounded-full px-6 py-2"
                  >
                    <a href={song.external_url} target="_blank" rel="noopener noreferrer">
                      Reproducir
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-center text-pink-800 mb-6">Nuestros Momentos</h2>
            <PhotoGallery photos={photos} />
          </div>
        )}
      </div>
    </main>
  )
}