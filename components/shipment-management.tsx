"use client"

import { Dashboard } from "./dashboard"

interface ShipmentManagementProps {
  onLogout?: () => void
}

export function ShipmentManagement({ onLogout }: ShipmentManagementProps) {
  return <Dashboard onLogout={onLogout} />
}
