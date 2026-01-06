import { createClient } from "@/lib/supabase/server"
import { getSpotifyTrack } from "@/lib/spotify"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("songs").select("*").order("order_position", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { spotify_id } = body

  // Fetch track details from Spotify
  const track = await getSpotifyTrack(spotify_id)

  // Get max order position
  const { data: maxOrder } = await supabase
    .from("songs")
    .select("order_position")
    .order("order_position", { ascending: false })
    .limit(1)
    .single()

  const newOrder = (maxOrder?.order_position ?? -1) + 1

  const { data, error } = await supabase
    .from("songs")
    .insert({
      spotify_id: track.id,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      album: track.album.name,
      album_image_url: track.album.images[0]?.url || "",
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      order_position: newOrder,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  const { error } = await supabase.from("songs").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { songs } = body

  // Update order positions
  const updates = songs.map((song: any, index: number) =>
    supabase.from("songs").update({ order_position: index }).eq("id", song.id),
  )

  await Promise.all(updates)

  return NextResponse.json({ success: true })
}
