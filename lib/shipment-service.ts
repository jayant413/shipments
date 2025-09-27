import type { Shipment, ShipmentFormData } from "@/lib/types"

export class ShipmentService {
  async getAllShipments(): Promise<Shipment[]> {
    try {
      const response = await fetch('/api/shipments')
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch shipments')
      }
      const transformed = result.data.map(this.transformFromDatabase)
      return transformed
    } catch (error) {
      console.error("Error fetching shipments:", error)
      throw new Error("Failed to fetch shipments")
    }
  }

  async createShipment(shipmentData: ShipmentFormData): Promise<Shipment> {
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipmentData)
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create shipment')
      }
      return this.transformFromDatabase(result.data)
    } catch (error) {
      console.error("Error creating shipment:", error)
      throw new Error("Failed to create shipment")
    }
  }

  async updateShipment(id: string, shipmentData: ShipmentFormData): Promise<Shipment> {
    try {
      const response = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipmentData)
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update shipment')
      }
      return this.transformFromDatabase(result.data)
    } catch (error) {
      console.error("Error updating shipment:", error)
      throw new Error("Failed to update shipment")
    }
  }

  async deleteShipment(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/shipments/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete shipment')
      }
    } catch (error) {
      console.error("Error deleting shipment:", error)
      throw new Error("Failed to delete shipment")
    }
  }

  async bulkCreateShipments(shipmentsData: ShipmentFormData[]): Promise<Shipment[]> {
    try {
      const response = await fetch('/api/shipments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipments: shipmentsData })
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create shipments')
      }
      return result.data.map(this.transformFromDatabase)
    } catch (error) {
      console.error("Error bulk creating shipments:", error)
      throw new Error("Failed to create shipments")
    }
  }

  private transformFromDatabase(dbShipment: any): Shipment {
    // Safely handle date conversion
    let receivingDate: Date
    if (dbShipment.receivingDate instanceof Date) {
      receivingDate = dbShipment.receivingDate
    } else if (dbShipment.receiving_date instanceof Date) {
      receivingDate = dbShipment.receiving_date
    } else if (dbShipment.receivingDate) {
      receivingDate = new Date(dbShipment.receivingDate)
      // If the date is invalid, use current date
      if (isNaN(receivingDate.getTime())) {
        receivingDate = new Date()
      }
    } else if (dbShipment.receiving_date) {
      receivingDate = new Date(dbShipment.receiving_date)
      // If the date is invalid, use current date
      if (isNaN(receivingDate.getTime())) {
        receivingDate = new Date()
      }
    } else {
      receivingDate = new Date()
    }

    return {
      id: dbShipment._id?.toString() || dbShipment.id,
      shipmentId: dbShipment.shipmentId || dbShipment.shipment_id,
      orderId: dbShipment.orderId || dbShipment.order_id,
      itemId: dbShipment.itemId || dbShipment.item_id,
      skuId: dbShipment.skuId || dbShipment.sku_id,
      reason: dbShipment.reason || "",
      aging: dbShipment.aging || 0,
      receivingDate,
      photosReceived: dbShipment.photosReceived || dbShipment.photos_received || false,
      status: dbShipment.status || "pending",
      checked: dbShipment.checked || false,
    }
  }
}

export const shipmentService = new ShipmentService()

export const getShipments = () => shipmentService.getAllShipments()
export const createShipment = (data: ShipmentFormData) => shipmentService.createShipment(data)
export const updateShipment = (id: string, data: ShipmentFormData) => shipmentService.updateShipment(id, data)
export const deleteShipment = (id: string) => shipmentService.deleteShipment(id)
export const bulkCreateShipments = (data: ShipmentFormData[]) => shipmentService.bulkCreateShipments(data)
