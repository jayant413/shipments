import type { Shipment, ShipmentStatus } from "../types"

export function getStatusColor(status: ShipmentStatus): string {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "in-transit":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "delayed":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function getAgingColor(aging: number): string {
  if (aging <= 3) return "text-green-600 dark:text-green-400"
  if (aging <= 7) return "text-yellow-600 dark:text-yellow-400"
  if (aging <= 14) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}

export function sortShipments(shipments: Shipment[], sortBy: keyof Shipment, sortOrder: "asc" | "desc"): Shipment[] {
  return [...shipments].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })
}

export function filterShipments(shipments: Shipment[], searchTerm: string): Shipment[] {
  if (!searchTerm) return shipments

  const term = searchTerm.toLowerCase()
  return shipments.filter(
    (shipment) =>
      shipment.shipmentId.toLowerCase().includes(term) ||
      shipment.orderId.toLowerCase().includes(term) ||
      shipment.itemId.toLowerCase().includes(term) ||
      shipment.skuId.toLowerCase().includes(term) ||
      shipment.reason.toLowerCase().includes(term) ||
      shipment.status.toLowerCase().includes(term),
  )
}
