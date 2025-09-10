import { createClient } from "@/lib/client"
import type { Shipment, ShipmentFormData } from "@/lib/types"

export class ShipmentService {
  private supabase = createClient()

  async getAllShipments(): Promise<Shipment[]> {
    const { data, error } = await this.supabase.from("shipments").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching shipments:", error)
      throw new Error("Failed to fetch shipments")
    }

    return data.map(this.transformFromDatabase)
  }

  async createShipment(shipmentData: ShipmentFormData): Promise<Shipment> {
    const dbData = this.transformToDatabase(shipmentData)

    const { data, error } = await this.supabase.from("shipments").insert([dbData]).select().single()

    if (error) {
      console.error("Error creating shipment:", error)
      throw new Error("Failed to create shipment")
    }

    return this.transformFromDatabase(data)
  }

  async updateShipment(id: string, shipmentData: ShipmentFormData): Promise<Shipment> {
    const dbData = this.transformToDatabase(shipmentData)

    const { data, error } = await this.supabase.from("shipments").update(dbData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating shipment:", error)
      throw new Error("Failed to update shipment")
    }

    return this.transformFromDatabase(data)
  }

  async deleteShipment(id: string): Promise<void> {
    const { error } = await this.supabase.from("shipments").delete().eq("id", id)

    if (error) {
      console.error("Error deleting shipment:", error)
      throw new Error("Failed to delete shipment")
    }
  }

  async bulkCreateShipments(shipmentsData: ShipmentFormData[]): Promise<Shipment[]> {
    const dbData = shipmentsData.map(this.transformToDatabase)

    const { data, error } = await this.supabase.from("shipments").insert(dbData).select()

    if (error) {
      console.error("Error bulk creating shipments:", error)
      throw new Error("Failed to create shipments")
    }

    return data.map(this.transformFromDatabase)
  }

  private transformFromDatabase(dbShipment: any): Shipment {
    return {
      id: dbShipment.id,
      shipmentId: dbShipment.shipment_id,
      orderId: dbShipment.order_id,
      itemId: dbShipment.item_id,
      skuId: dbShipment.sku_id,
      reason: dbShipment.reason || "",
      aging: dbShipment.aging || 0,
      receivingDate: new Date(dbShipment.receiving_date),
      photosReceived: dbShipment.photos_received || false,
      status: dbShipment.status || "pending",
      checked: dbShipment.checked || false,
    }
  }

  private transformToDatabase(shipment: ShipmentFormData): any {
    return {
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
    }
  }
}

export const shipmentService = new ShipmentService()

export const getShipments = () => shipmentService.getAllShipments()
export const createShipment = (data: ShipmentFormData) => shipmentService.createShipment(data)
export const updateShipment = (id: string, data: ShipmentFormData) => shipmentService.updateShipment(id, data)
export const deleteShipment = (id: string) => shipmentService.deleteShipment(id)
export const bulkCreateShipments = (data: ShipmentFormData[]) => shipmentService.bulkCreateShipments(data)
