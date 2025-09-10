"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2, Eye, Package, Calendar, Clock } from "lucide-react"
import type { Shipment } from "@/lib/types"
import { getStatusColor, formatDate, getAgingColor, filterShipments, sortShipments } from "@/lib/shipment-utils"

interface ShipmentTableProps {
  shipments: Shipment[]
  searchTerm: string
  selectedShipments: string[]
  onSelectShipment: (shipmentId: string) => void
  onSelectAll: (checked: boolean) => void
  onEditShipment: (shipment: Shipment) => void
  onDeleteShipment: (shipmentId: string) => void
}

type SortField = keyof Shipment
type SortOrder = "asc" | "desc"

export function ShipmentTable({
  shipments,
  searchTerm,
  selectedShipments,
  onSelectShipment,
  onSelectAll,
  onEditShipment,
  onDeleteShipment,
}: ShipmentTableProps) {
  const [sortField, setSortField] = useState<SortField>("receivingDate")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const filteredAndSortedShipments = useMemo(() => {
    const filtered = filterShipments(shipments, searchTerm)
    return sortShipments(filtered, sortField, sortOrder)
  }, [shipments, searchTerm, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const isAllSelected =
    filteredAndSortedShipments.length > 0 &&
    filteredAndSortedShipments.every((shipment) => selectedShipments.includes(shipment.id))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg sm:text-xl">Shipments ({filteredAndSortedShipments.length})</CardTitle>
          {selectedShipments.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{selectedShipments.length} selected</span>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="block lg:hidden">
          <div className="space-y-4 p-4">
            {filteredAndSortedShipments.map((shipment) => (
              <Card key={shipment.id} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedShipments.includes(shipment.id)}
                        onCheckedChange={() => onSelectShipment(shipment.id)}
                      />
                      <div>
                        <p className="font-semibold text-sm">{shipment.shipmentId}</p>
                        <p className="text-xs text-muted-foreground">{shipment.orderId}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditShipment(shipment)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDeleteShipment(shipment.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Item ID</p>
                        <p className="font-medium">{shipment.itemId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Received</p>
                        <p className="font-medium">{formatDate(shipment.receivingDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Aging</p>
                        <p className={`font-medium ${getAgingColor(shipment.aging)}`}>{shipment.aging} days</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge className={getStatusColor(shipment.status)} variant="secondary">
                        {shipment.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Reason</p>
                    <p className="text-sm">{shipment.reason}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>SKU: {shipment.skuId}</span>
                      <span>Photos: {shipment.photosReceived ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="hidden lg:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} />
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("shipmentId")} className="h-auto p-0 font-semibold">
                    Shipment ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("orderId")} className="h-auto p-0 font-semibold">
                    Order ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Item ID</TableHead>
                <TableHead>SKU ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("aging")} className="h-auto p-0 font-semibold">
                    Aging
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("receivingDate")}
                    className="h-auto p-0 font-semibold"
                  >
                    Receiving Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedShipments.includes(shipment.id)}
                      onCheckedChange={() => onSelectShipment(shipment.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{shipment.shipmentId}</TableCell>
                  <TableCell>{shipment.orderId}</TableCell>
                  <TableCell>{shipment.itemId}</TableCell>
                  <TableCell>{shipment.skuId}</TableCell>
                  <TableCell className="max-w-xs truncate">{shipment.reason}</TableCell>
                  <TableCell>
                    <span className={getAgingColor(shipment.aging)}>{shipment.aging} days</span>
                  </TableCell>
                  <TableCell>{formatDate(shipment.receivingDate)}</TableCell>
                  <TableCell>
                    <Badge variant={shipment.photosReceived ? "default" : "secondary"}>
                      {shipment.photosReceived ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(shipment.status)}>{shipment.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditShipment(shipment)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDeleteShipment(shipment.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedShipments.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No shipments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first shipment"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
