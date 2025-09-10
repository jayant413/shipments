import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("shipments")
      .update({
        shipment_id: body.shipmentId,
        order_id: body.orderId,
        item_id: body.itemId,
        sku_id: body.skuId,
        reason: body.reason,
        aging: body.aging,
        receiving_date: body.receivingDate,
        photos_received: body.photosReceived,
        status: body.status,
        checked: body.checked,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("shipments").delete().eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete shipment" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
