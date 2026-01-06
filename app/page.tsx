import { createClient } from "@/lib/supabase/server"
import { Heart } from "lucide-react"
import { PhotoGallery } from "@/components/photo-gallery"
import Image from "next/image"

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

function getSpotifyTrackId(url: string): string | null {
  const match = url.match(/track\/([a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

export default async function Home() {
  const timeType = getTimeBasedGreeting()
  const phrase = await getRandomPhrase(timeType)
  const song = await getTodaysSong()
  const photos = await getPhotos()

  const spotifyTrackId = song?.external_url ? getSpotifyTrackId(song.external_url) : null

  return (
    <main className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#f6dde1' }}>
      <div className="mx-auto max-w-4xl space-y-12">
        {song && (
          <div className="bg-white rounded-3xl border-2 overflow-hidden" style={{ borderColor: '#efc1c8' }}>
            <div className="relative">
              <div className="absolute top-6 left-6 z-10">
                <div className="w-16 h-16 md:w-20 md:h-20">
                  <Image
                    src="/snoopy1.png"
                    alt="Snoopy"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="absolute top-6 right-6 z-10">
                <div className="w-16 h-16 md:w-20 md:h-20">
                  <Image
                    src="/snoopy2.png"
                    alt="Snoopy"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>

                <div className="flex flex-col items-center py-12 px-6 space-y-8">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-2xl" style={{ backgroundColor: '#f6dde1' }}></div>
                  <img
                    src={song.album_image_url || "/placeholder.svg"}
                    alt={song.album}
                    className="relative w-64 h-64 md:w-72 md:h-72 object-cover rounded-xl border-4"
                    style={{ borderColor: '#efc1c8' }}
                  />
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#e27fa0' }}>{song.name}</h2>
                  <p className="text-lg" style={{ color: '#e27fa0' }}>{song.artist}</p>
                </div>

                {spotifyTrackId && (
                  <div className="w-full max-w-md">
                    <iframe
                      style={{ borderRadius: '12px' }}
                      src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator`}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      title={`${song.name} - ${song.artist}`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center ">
          <p className="text-3xl md:text-4xl font-bold italic" style={{ 
            color: '#9e32a8',
            textShadow: '2px 2px 4px rgba(226, 127, 160, 0.3)'
          }}>
            {phrase}
          </p>
        </div>

        {photos.length > 0 && (
          <div>
            <div className="text-center mb-8">
              
               
                <h2 className="text-1xl md:text-3xl font-bold" style={{ color: '#e27fa0' }}>Salidas</h2>
                
         
            </div>
            <PhotoGallery photos={photos} />
          </div>
        )}

        <footer className="text-center py-8 mt-12">
          <p className="text-lg md:text-xl font-medium italic" style={{ color: '#e27fa0' }}>
            Hola, te hice esto con mucho cariño, te quiero &lt;3
          </p>
        </footer>
      </div>
    </main>
  )
}