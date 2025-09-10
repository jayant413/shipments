export interface Shipment {
  id: string
  shipmentId: string
  orderId: string
  itemId: string
  skuId: string
  reason: string
  aging: number // days
  receivingDate: Date
  photosReceived: boolean
  status: "pending" | "in-transit" | "delivered" | "delayed" | "cancelled"
  checked: boolean
}

export interface ShipmentFormData {
  shipmentId: string
  orderId: string
  itemId: string
  skuId: string
  reason: string
  aging: number
  receivingDate: string
  photosReceived: boolean
  status: "pending" | "in-transit" | "delivered" | "delayed" | "cancelled"
}

export type ShipmentStatus = "pending" | "in-transit" | "delivered" | "delayed" | "cancelled"

export interface ExcelUploadResult {
  success: boolean
  data?: Shipment[]
  errors?: string[]
}
