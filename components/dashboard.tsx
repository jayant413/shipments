"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { ShipmentTable } from "./shipment-table"
import { ShipmentModal } from "./shipment-modal"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"
import { ExcelUploadModal } from "./excel-upload-modal"
import { FiltersPanel, type FilterState } from "./filters-panel"
import { LoadingSpinner } from "./loading-spinner"
import { shipmentService } from "@/lib/shipment-service"
import { exportToExcel } from "@/lib/excel-export"
import type { Shipment, ShipmentFormData } from "@/lib/types"

interface DashboardProps {
  onLogout?: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [selectedShipments, setSelectedShipments] = useState<string[]>([])

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    photosReceived: "all",
    dateRange: {},
  })

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isExcelUploadModalOpen, setIsExcelUploadModalOpen] = useState(false)
  const [editingShipment, setEditingShipment] = useState<Shipment | undefined>()
  const [deletingShipmentId, setDeletingShipmentId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    loadShipments()
  }, [])

  const filteredShipments = useMemo(() => {
    let filtered = shipments

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (shipment) =>
          shipment.shipmentId.toLowerCase().includes(searchLower) ||
          shipment.orderId.toLowerCase().includes(searchLower) ||
          shipment.itemId.toLowerCase().includes(searchLower) ||
          shipment.skuId.toLowerCase().includes(searchLower) ||
          (shipment.reason && shipment.reason.toLowerCase().includes(searchLower)),
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((shipment) => shipment.status === filters.status)
    }

    // Apply photos received filter
    if (filters.photosReceived && filters.photosReceived !== "all") {
      const photosFilter = filters.photosReceived === "yes"
      filtered = filtered.filter((shipment) => shipment.photosReceived === photosFilter)
    }

    // Apply date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter((shipment) => {
        if (!shipment.receivingDate) return false
        const shipmentDate = new Date(shipment.receivingDate)

        if (filters.dateRange?.from && shipmentDate < filters.dateRange.from) return false
        if (filters.dateRange?.to && shipmentDate > filters.dateRange.to) return false

        return true
      })
    }

    return filtered
  }, [shipments, filters])

  const loadShipments = async () => {
    setIsInitialLoading(true)
    try {
      const data = await shipmentService.getAllShipments()
      setShipments(data)
    } catch (error) {
      console.error("Error loading shipments:", error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setFilters((prev) => ({ ...prev, search: term }))
  }

  const handleExportAll = () => {
    exportToExcel(shipments, {
      filename: `all_shipments_${new Date().toISOString().split("T")[0]}.xlsx`,
    })
  }

  const handleExportFiltered = () => {
    exportToExcel(filteredShipments, {
      filename: `filtered_shipments_${new Date().toISOString().split("T")[0]}.xlsx`,
    })
  }

  const handleExportSelected = () => {
    const selectedShipmentData = shipments.filter((s) => selectedShipments.includes(s.id))
    exportToExcel(selectedShipmentData, {
      filename: `selected_shipments_${new Date().toISOString().split("T")[0]}.xlsx`,
    })
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      photosReceived: "all",
      dateRange: {},
    })
  }

  const handleSelectShipment = (shipmentId: string) => {
    setSelectedShipments((prev) =>
      prev.includes(shipmentId) ? prev.filter((id) => id !== shipmentId) : [...prev, shipmentId],
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedShipments(checked ? filteredShipments.map((s) => s.id) : [])
  }

  const handleCreateShipment = async (data: ShipmentFormData) => {
    setIsLoading(true)
    try {
      const newShipment = await shipmentService.createShipment(data)
      setShipments((prev) => [newShipment, ...prev])
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Error creating shipment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditShipment = async (data: ShipmentFormData) => {
    if (!editingShipment) return

    setIsLoading(true)
    try {
      const updatedShipment = await shipmentService.updateShipment(editingShipment.id, data)
      setShipments((prev) => prev.map((s) => (s.id === editingShipment.id ? updatedShipment : s)))
      setIsEditModalOpen(false)
      setEditingShipment(undefined)
    } catch (error) {
      console.error("Error updating shipment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteShipment = async () => {
    if (!deletingShipmentId) return

    setIsLoading(true)
    try {
      await shipmentService.deleteShipment(deletingShipmentId)
      setShipments((prev) => prev.filter((s) => s.id !== deletingShipmentId))
      setIsDeleteModalOpen(false)
      setDeletingShipmentId(undefined)
    } catch (error) {
      console.error("Error deleting shipment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExcelUpload = async (importedShipments: Shipment[]) => {
    try {
      const formDataArray: ShipmentFormData[] = importedShipments.map((shipment) => ({
        shipmentId: shipment.shipmentId,
        orderId: shipment.orderId,
        itemId: shipment.itemId,
        skuId: shipment.skuId,
        reason: shipment.reason,
        aging: shipment.aging,
        receivingDate: shipment.receivingDate ? new Date(shipment.receivingDate).toISOString().split("T")[0] : "",
        photosReceived: shipment.photosReceived,
        status: shipment.status,
        checked: shipment.checked,
      }))

      const createdShipments = await shipmentService.bulkCreateShipments(formDataArray)
      setShipments((prev) => [...createdShipments, ...prev])
    } catch (error) {
      console.error("Error uploading shipments:", error)
    }
  }

  const openEditModal = (shipment: Shipment) => {
    setEditingShipment(shipment)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (shipmentId: string) => {
    console.log("[v0] Opening delete modal for shipment:", shipmentId)
    setDeletingShipmentId(shipmentId)
    setIsDeleteModalOpen(true)
  }

  if (isInitialLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onSearch={handleSearch}
          searchTerm={filters.search}
          onAddShipment={() => setIsCreateModalOpen(true)}
          onImportExcel={() => setIsExcelUploadModalOpen(true)}
          onExportAll={handleExportAll}
          onExportFiltered={handleExportFiltered}
          onExportSelected={selectedShipments.length > 0 ? handleExportSelected : undefined}
          selectedCount={selectedShipments.length}
          totalCount={shipments.length}
          filteredCount={filteredShipments.length}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Shipment Management</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Track and manage your shipments efficiently</p>
            </div>

            <div className="space-y-6">
              <div className="w-full">
                <FiltersPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
              <div className="w-full">
                <ShipmentTable
                  shipments={filteredShipments}
                  searchTerm={filters.search}
                  selectedShipments={selectedShipments}
                  onSelectShipment={handleSelectShipment}
                  onSelectAll={handleSelectAll}
                  onEditShipment={openEditModal}
                  onDeleteShipment={openDeleteModal}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <ShipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateShipment}
        isLoading={isLoading}
      />

      <ShipmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingShipment(undefined)
        }}
        shipment={editingShipment}
        onSubmit={handleEditShipment}
        isLoading={isLoading}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          console.log("[v0] Closing delete modal")
          setIsDeleteModalOpen(false)
          setDeletingShipmentId(undefined)
        }}
        onConfirm={handleDeleteShipment}
        shipmentId={shipments.find((s) => s.id === deletingShipmentId)?.shipmentId}
        isLoading={isLoading}
      />

      <ExcelUploadModal
        isOpen={isExcelUploadModalOpen}
        onClose={() => setIsExcelUploadModalOpen(false)}
        onUploadComplete={handleExcelUpload}
      />
    </div>
  )
}
