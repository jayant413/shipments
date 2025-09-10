import * as XLSX from "xlsx"
import type { Shipment } from "@/lib/types"

export interface ExportOptions {
  filename?: string
  includeHeaders?: boolean
  dateFormat?: "iso" | "readable"
}

export function exportToExcel(data: Shipment[], options: ExportOptions = {}): void {
  const {
    filename = `shipments_export_${new Date().toISOString().split("T")[0]}.xlsx`,
    includeHeaders = true,
    dateFormat = "readable",
  } = options

  // Transform data for export
  const exportData = data.map((shipment) => ({
    "Shipment ID": shipment.shipment_id,
    "Order ID": shipment.order_id,
    "Item ID": shipment.item_id,
    "SKU ID": shipment.sku_id,
    Reason: shipment.reason || "",
    "Aging (Days)": shipment.aging,
    "Receiving Date": shipment.receiving_date
      ? dateFormat === "readable"
        ? new Date(shipment.receiving_date).toLocaleDateString()
        : shipment.receiving_date
      : "",
    "Photos Received": shipment.photos_received ? "Yes" : "No",
    Status: shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1),
    Checked: shipment.checked ? "Yes" : "No",
    "Created Date":
      dateFormat === "readable" ? new Date(shipment.created_at).toLocaleDateString() : shipment.created_at,
    "Last Updated":
      dateFormat === "readable" ? new Date(shipment.updated_at).toLocaleDateString() : shipment.updated_at,
  }))

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(exportData, {
    header: includeHeaders ? undefined : [],
  })

  // Set column widths for better readability
  const columnWidths = [
    { wch: 15 }, // Shipment ID
    { wch: 15 }, // Order ID
    { wch: 15 }, // Item ID
    { wch: 15 }, // SKU ID
    { wch: 25 }, // Reason
    { wch: 12 }, // Aging
    { wch: 15 }, // Receiving Date
    { wch: 15 }, // Photos Received
    { wch: 12 }, // Status
    { wch: 10 }, // Checked
    { wch: 15 }, // Created Date
    { wch: 15 }, // Last Updated
  ]
  worksheet["!cols"] = columnWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Shipments")

  // Generate binary data
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

  // Create blob and download
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = window.URL.createObjectURL(blob)

  // Create temporary download link
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function exportFilteredData(
  allData: Shipment[],
  filters: {
    search?: string
    status?: string
    photosReceived?: string
    dateRange?: { from?: Date; to?: Date }
  },
  options?: ExportOptions,
): void {
  // Apply filters to data
  let filteredData = allData

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredData = filteredData.filter(
      (shipment) =>
        shipment.shipment_id.toLowerCase().includes(searchLower) ||
        shipment.order_id.toLowerCase().includes(searchLower) ||
        shipment.item_id.toLowerCase().includes(searchLower) ||
        shipment.sku_id.toLowerCase().includes(searchLower) ||
        (shipment.reason && shipment.reason.toLowerCase().includes(searchLower)),
    )
  }

  if (filters.status && filters.status !== "all") {
    filteredData = filteredData.filter((shipment) => shipment.status === filters.status)
  }

  if (filters.photosReceived && filters.photosReceived !== "all") {
    const photosFilter = filters.photosReceived === "yes"
    filteredData = filteredData.filter((shipment) => shipment.photos_received === photosFilter)
  }

  if (filters.dateRange?.from || filters.dateRange?.to) {
    filteredData = filteredData.filter((shipment) => {
      if (!shipment.receiving_date) return false
      const shipmentDate = new Date(shipment.receiving_date)

      if (filters.dateRange?.from && shipmentDate < filters.dateRange.from) return false
      if (filters.dateRange?.to && shipmentDate > filters.dateRange.to) return false

      return true
    })
  }

  exportToExcel(filteredData, options)
}
