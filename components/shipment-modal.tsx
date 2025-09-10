"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShipmentForm } from "./shipment-form"
import type { Shipment, ShipmentFormData } from "@/lib/types"

interface ShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  shipment?: Shipment
  onSubmit: (data: ShipmentFormData) => void
  isLoading?: boolean
}

export function ShipmentModal({ isOpen, onClose, shipment, onSubmit, isLoading }: ShipmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{shipment ? "Edit Shipment" : "Add New Shipment"}</DialogTitle>
          <DialogDescription>
            {shipment ? "Update the shipment information below." : "Fill in the details to create a new shipment."}
          </DialogDescription>
        </DialogHeader>
        <ShipmentForm shipment={shipment} onSubmit={onSubmit} onCancel={onClose} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}
