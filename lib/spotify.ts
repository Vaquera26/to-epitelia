let cachedToken: { token: string; expiresAt: number } | null = null

export async function getSpotifyToken() {
  // Return cached token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()

  // Cache token
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60000, // Refresh 1 min before expiry
  }

  return data.access_token
}

export async function searchSpotifyTracks(query: string) {
  const token = await getSpotifyToken()

  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()
  return data.tracks.items
}

export async function getSpotifyTrack(trackId: string) {
  const token = await getSpotifyToken()

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return await response.json()
}
