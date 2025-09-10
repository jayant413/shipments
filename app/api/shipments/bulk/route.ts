import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const shipmentsData = body.shipments.map((shipment: any) => ({
      shipment_id: shipment.shipmentId,
      order_id: shipment.orderId,
      item_id: shipment.itemId,
      sku_id: shipment.skuId,
      reason: shipment.reason,
      aging: shipment.aging,
      receiving_date: shipment.receivingDate,
      photos_received: shipment.photosReceived,
      status: shipment.status,
      checked: shipment.checked || false,
    }))

    const { data, error } = await supabase.from("shipments").insert(shipmentsData).select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create shipments" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
