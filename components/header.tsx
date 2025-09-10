"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, Upload, Download, LogOut, User, ChevronDown } from "lucide-react"
import { getAuthState } from "@/lib/auth"

interface HeaderProps {
  onSearch: (term: string) => void
  searchTerm?: string
  onAddShipment: () => void
  onImportExcel: () => void
  onExportAll: () => void
  onExportFiltered: () => void
  onExportSelected?: () => void
  selectedCount?: number
  totalCount?: number
  filteredCount?: number
  onLogout?: () => void
}

export function Header({
  onSearch,
  searchTerm = "",
  onAddShipment,
  onImportExcel,
  onExportAll,
  onExportFiltered,
  onExportSelected,
  selectedCount = 0,
  totalCount = 0,
  filteredCount = 0,
  onLogout,
}: HeaderProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const authState = getAuthState()

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value)
    onSearch(value)
  }

  if (searchTerm !== localSearchTerm && searchTerm !== undefined) {
    setLocalSearchTerm(searchTerm)
  }

  return (
    <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search shipments..."
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-input"
            />
          </div>

          {totalCount > 0 && (
            <div className="hidden lg:flex items-center text-sm text-muted-foreground">
              <span>
                Showing {filteredCount} of {totalCount} shipments
                {selectedCount > 0 && ` (${selectedCount} selected)`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {authState.username && (
            <div className="hidden sm:flex items-center space-x-2 mr-2 px-3 py-1 bg-muted rounded-md">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{authState.username}</span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Export</span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onExportAll}>
                <Download className="mr-2 h-4 w-4" />
                Export All ({totalCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportFiltered}>
                <Download className="mr-2 h-4 w-4" />
                Export Filtered ({filteredCount})
              </DropdownMenuItem>
              {onExportSelected && selectedCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onExportSelected}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected ({selectedCount})
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={onImportExcel}>
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Import Excel</span>
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground" onClick={onAddShipment}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Shipment</span>
          </Button>

          {onLogout && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
