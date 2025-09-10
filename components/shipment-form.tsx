"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Shipment, ShipmentFormData, ShipmentStatus } from "@/lib/types"

interface ShipmentFormProps {
  shipment?: Shipment
  onSubmit: (data: ShipmentFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

const statusOptions: { value: ShipmentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in-transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "delayed", label: "Delayed" },
  { value: "cancelled", label: "Cancelled" },
]

export function ShipmentForm({ shipment, onSubmit, onCancel, isLoading }: ShipmentFormProps) {
  const [formData, setFormData] = useState<ShipmentFormData>({
    shipmentId: "",
    orderId: "",
    itemId: "",
    skuId: "",
    reason: "",
    aging: 0,
    receivingDate: "",
    photosReceived: false,
    status: "pending",
  })
  const [date, setDate] = useState<Date>()

  useEffect(() => {
    if (shipment) {
      setFormData({
        shipmentId: shipment.shipmentId,
        orderId: shipment.orderId,
        itemId: shipment.itemId,
        skuId: shipment.skuId,
        reason: shipment.reason,
        aging: shipment.aging,
        receivingDate: format(shipment.receivingDate, "yyyy-MM-dd"),
        photosReceived: shipment.photosReceived,
        status: shipment.status,
      })
      setDate(shipment.receivingDate)
    }
  }, [shipment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setFormData((prev) => ({
        ...prev,
        receivingDate: format(selectedDate, "yyyy-MM-dd"),
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shipmentId">Shipment ID *</Label>
          <Input
            id="shipmentId"
            value={formData.shipmentId}
            onChange={(e) => setFormData((prev) => ({ ...prev, shipmentId: e.target.value }))}
            placeholder="SHP-001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="orderId">Order ID *</Label>
          <Input
            id="orderId"
            value={formData.orderId}
            onChange={(e) => setFormData((prev) => ({ ...prev, orderId: e.target.value }))}
            placeholder="ORD-2024-001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="itemId">Item ID *</Label>
          <Input
            id="itemId"
            value={formData.itemId}
            onChange={(e) => setFormData((prev) => ({ ...prev, itemId: e.target.value }))}
            placeholder="ITM-A001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skuId">SKU ID *</Label>
          <Input
            id="skuId"
            value={formData.skuId}
            onChange={(e) => setFormData((prev) => ({ ...prev, skuId: e.target.value }))}
            placeholder="SKU-12345"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aging">Aging (days)</Label>
          <Input
            id="aging"
            type="number"
            min="0"
            value={formData.aging}
            onChange={(e) => setFormData((prev) => ({ ...prev, aging: Number.parseInt(e.target.value) || 0 }))}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label>Receiving Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: ShipmentStatus) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 sm:col-span-1">
          <Switch
            id="photosReceived"
            checked={formData.photosReceived}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, photosReceived: checked }))}
          />
          <Label htmlFor="photosReceived">Photos Received</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
          placeholder="Enter reason for shipment..."
          rows={3}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto bg-transparent">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? "Saving..." : shipment ? "Update Shipment" : "Create Shipment"}
        </Button>
      </div>
    </form>
  )
}
