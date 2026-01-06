import { searchSpotifyTracks } from "@/lib/spotify"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter required" }, { status: 400 })
  }

  try {
    const tracks = await searchSpotifyTracks(query)
    return NextResponse.json(tracks)
  } catch (error) {
    console.error("Spotify search error:", error)
    return NextResponse.json({ error: "Failed to search tracks" }, { status: 500 })
  }
}
