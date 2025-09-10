import * as XLSX from "xlsx"
import type { Shipment, ExcelUploadResult } from "../types"

export async function parseExcelFile(file: File): Promise<ExcelUploadResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    let sheetName = "MASTER SHEET"
    if (!workbook.SheetNames.includes(sheetName)) {
      // Fallback to first sheet if MASTER SHEET not found
      sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        throw new Error("No worksheets found in the Excel file")
      }
    }

    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    const shipments: Shipment[] = []
    const errors: string[] = []

    jsonData.forEach((row: any, index: number) => {
      try {
        const shipment: Shipment = {
          id: `excel-${Date.now()}-${index}`,
          shipmentId: row["Shipment Id"] || "",
          orderId: row["Order Id"] || "",
          itemId: row["Item ID"] || "",
          skuId: row["SKU ID"] || "",
          reason: row["REASON"] || "",
          aging: parseAging(row["Aging"]),
          receivingDate: parseExcelDate(row["RECEIVING DATE"]),
          photosReceived: parsePhotosReceived(row["PHOTOS RECEIVED"]),
          status: parseExcelStatus(row["STATUS"]),
          checked: parseCheckBox(row["CHECK BOX"]),
        }

        // Validate required fields
        if (!shipment.shipmentId) {
          errors.push(`Row ${index + 2}: Missing Shipment ID`)
        }
        if (!shipment.orderId) {
          errors.push(`Row ${index + 2}: Missing Order ID`)
        }
        if (!shipment.itemId) {
          errors.push(`Row ${index + 2}: Missing Item ID`)
        }
        if (!shipment.skuId) {
          errors.push(`Row ${index + 2}: Missing SKU ID`)
        }
        if (isNaN(shipment.receivingDate.getTime())) {
          errors.push(`Row ${index + 2}: Invalid receiving date format`)
        }

        if (errors.length === 0 || errors.filter((e) => e.includes(`Row ${index + 2}`)).length === 0) {
          shipments.push(shipment)
        }
      } catch (error) {
        errors.push(`Row ${index + 2}: Invalid data format - ${error}`)
      }
    })

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? shipments : undefined,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    return {
      success: false,
      errors: ["Failed to parse Excel file. Please check the file format and ensure it contains the required columns."],
    }
  }
}

function parseAging(value: any): number {
  if (!value) return 0

  if (typeof value === "number") return value

  if (typeof value === "string") {
    // Handle "10 days" format
    const match = value.match(/(\d+)\s*days?/i)
    if (match) {
      return Number.parseInt(match[1])
    }

    // Handle plain numbers
    const num = Number.parseInt(value)
    if (!isNaN(num)) return num
  }

  return 0
}

function parsePhotosReceived(value: any): boolean {
  if (!value) return false

  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim()
    return normalized === "received" || normalized === "yes" || normalized === "true"
  }

  return parseBoolean(value)
}

function parseExcelStatus(value: any): "pending" | "processing" | "completed" | "cancelled" {
  if (!value) return "pending"

  const statusMap: Record<string, "pending" | "processing" | "completed" | "cancelled"> = {
    "open in transit": "processing",
    open: "pending",
    "in transit": "processing",
    processing: "processing",
    completed: "completed",
    closed: "completed",
    cancelled: "cancelled",
    canceled: "cancelled",
    pending: "pending",
  }

  const normalized = value.toString().toLowerCase().trim()
  return statusMap[normalized] || "pending"
}

function parseCheckBox(value: any): boolean {
  if (!value) return false

  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim()
    return normalized === "done" || normalized === "completed" || normalized === "yes" || normalized === "true"
  }

  return parseBoolean(value)
}

function parseExcelDate(dateValue: any): Date {
  if (!dateValue) return new Date()

  if (typeof dateValue === "string") {
    // Handle "08/02/2025" format
    const dateMatch = dateValue.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (dateMatch) {
      const [, month, day, year] = dateMatch
      return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    }

    const parsed = new Date(dateValue)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }

  // Handle Excel serial date numbers
  if (typeof dateValue === "number") {
    return new Date((dateValue - 25569) * 86400 * 1000)
  }

  // Handle Date objects
  if (dateValue instanceof Date) {
    return dateValue
  }

  return new Date()
}

function parseBoolean(value: any): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const lower = value.toLowerCase()
    return lower === "true" || lower === "yes" || lower === "1" || lower === "y"
  }
  if (typeof value === "number") return value === 1
  return false
}
