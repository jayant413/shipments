import { AuthWrapper } from "@/components/auth-wrapper"
import { ShipmentManagement } from "@/components/shipment-management"

export default function ShipmentsPage() {
  return (
    <AuthWrapper>
      <ShipmentManagement />
    </AuthWrapper>
  )
}
