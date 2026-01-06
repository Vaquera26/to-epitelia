import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("photos").select("*").order("order_position", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  // Get max order position
  const { data: maxOrder } = await supabase
    .from("photos")
    .select("order_position")
    .order("order_position", { ascending: false })
    .limit(1)
    .single()

  const newOrder = (maxOrder?.order_position ?? -1) + 1

  const { data, error } = await supabase
    .from("photos")
    .insert({
      ...body,
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

  const { data: photo } = await supabase.from("photos").select("filename").eq("id", id).single()

  if (photo && photo.filename.startsWith("http") && photo.filename.includes("blob.vercel-storage.com")) {
    try {
      await del(photo.filename)
    } catch (error) {
      console.error("Error deleting from Blob:", error)
    }
  }

  const { error: deleteError } = await supabase.from("photos").delete().eq("id", id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { photos } = body

  // Update order positions or description
  if (photos) {
    const updates = photos.map((photo: any, index: number) =>
      supabase.from("photos").update({ order_position: index }).eq("id", photo.id),
    )
    await Promise.all(updates)
  } else {
    const { id, description } = body
    await supabase.from("photos").update({ description }).eq("id", id)
  }

  return NextResponse.json({ success: true })
}
