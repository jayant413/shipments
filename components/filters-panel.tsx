"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, FilterX, Search } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export interface FilterState {
  search: string
  status: string
  photosReceived: string
  dateRange: {
    from?: Date
    to?: Date
  }
}

interface FiltersPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  className?: string
}

export function FiltersPanel({ filters, onFiltersChange, onClearFilters, className }: FiltersPanelProps) {
  const [isDateFromOpen, setIsDateFromOpen] = useState(false)
  const [isDateToOpen, setIsDateToOpen] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const updateDateRange = (type: "from" | "to", date?: Date) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date,
      },
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.photosReceived !== "all" ||
    filters.dateRange.from ||
    filters.dateRange.to

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2 bg-transparent"
            >
              <FilterX className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Filter */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by ID, SKU, or reason..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Photos Received Filter */}
        <div className="space-y-2">
          <Label>Photos Received</Label>
          <Select value={filters.photosReceived} onValueChange={(value) => updateFilter("photosReceived", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select photos status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Receiving Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">From</Label>
              <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd, yyyy") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) => {
                      updateDateRange("from", date)
                      setIsDateFromOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">To</Label>
              <Popover open={isDateToOpen} onOpenChange={setIsDateToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.to && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? format(filters.dateRange.to, "MMM dd, yyyy") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) => {
                      updateDateRange("to", date)
                      setIsDateToOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
