import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("shipments").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch shipments" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("shipments")
      .insert([
        {
          shipment_id: body.shipmentId,
          order_id: body.orderId,
          item_id: body.itemId,
          sku_id: body.skuId,
          reason: body.reason,
          aging: body.aging,
          receiving_date: body.receivingDate,
          photos_received: body.photosReceived,
          status: body.status,
          checked: body.checked || false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
