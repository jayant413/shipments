import { getShipmentsCollection } from "@/lib/mongodb"
import type { Shipment, ShipmentFormData } from "@/lib/types"
import { ObjectId } from 'mongodb'

export class ShipmentServiceServer {
  async getAllShipments(): Promise<Shipment[]> {
    try {
      const collection = await getShipmentsCollection()
      const data = await collection.find({}).sort({ created_at: -1 }).toArray()
      return data.map(this.transformFromDatabase)
    } catch (error) {
      console.error("Error fetching shipments:", error)
      throw new Error("Failed to fetch shipments")
    }
  }

  async createShipment(shipmentData: ShipmentFormData): Promise<Shipment> {
    try {
      const collection = await getShipmentsCollection()
      const dbData = this.transformToDatabase(shipmentData)
      const result = await collection.insertOne(dbData)
      const data = await collection.findOne({ _id: result.insertedId })
      return this.transformFromDatabase(data)
    } catch (error) {
      console.error("Error creating shipment:", error)
      throw new Error("Failed to create shipment")
    }
  }

  async updateShipment(id: string, shipmentData: ShipmentFormData): Promise<Shipment> {
    try {
      const collection = await getShipmentsCollection()
      const dbData = this.transformToDatabase(shipmentData)
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: dbData },
        { returnDocument: 'after' }
      )
      return this.transformFromDatabase(result)
    } catch (error) {
      console.error("Error updating shipment:", error)
      throw new Error("Failed to update shipment")
    }
  }

  async deleteShipment(id: string): Promise<void> {
    try {
      const collection = await getShipmentsCollection()
      await collection.deleteOne({ _id: new ObjectId(id) })
    } catch (error) {
      console.error("Error deleting shipment:", error)
      throw new Error("Failed to delete shipment")
    }
  }

  async bulkCreateShipments(shipmentsData: ShipmentFormData[]): Promise<Shipment[]> {
    try {
      const collection = await getShipmentsCollection()
      const dbData = shipmentsData.map(this.transformToDatabase)
      const result = await collection.insertMany(dbData)
      const insertedIds = Object.values(result.insertedIds)
      const data = await collection.find({ _id: { $in: insertedIds } }).toArray()
      return data.map(this.transformFromDatabase)
    } catch (error) {
      console.error("Error bulk creating shipments", error)
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
      if (isNaN(receivingDate.getTime())) {
        receivingDate = new Date()
      }
    } else if (dbShipment.receiving_date) {
      receivingDate = new Date(dbShipment.receiving_date)
      if (isNaN(receivingDate.getTime())) {
        receivingDate = new Date()
      }
    } else {
      receivingDate = new Date()
    }

    return {
      id: dbShipment._id.toString(),
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
      created_at: new Date(),
    }
  }
}

export const shipmentServiceServer = new ShipmentServiceServer()
