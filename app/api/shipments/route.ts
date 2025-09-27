import { type NextRequest, NextResponse } from "next/server"
import { shipmentServiceServer } from "@/lib/shipment-service-server"

export async function GET() {
  try {
    const data = await shipmentServiceServer.getAllShipments()
    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await shipmentServiceServer.createShipment(body)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
