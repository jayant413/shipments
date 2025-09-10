"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
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
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Header with Clear Button */}
          <div className="flex items-center justify-between w-full mb-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Filters
            </h3>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-1 h-8 px-2 text-xs bg-transparent"
              >
                <FilterX className="h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>

          {/* Search Filter */}
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search" className="text-xs text-muted-foreground">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search by ID, SKU, or reason..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[140px]">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Status" />
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
          <div className="min-w-[120px]">
            <Label className="text-xs text-muted-foreground">Photos</Label>
            <Select value={filters.photosReceived} onValueChange={(value) => updateFilter("photosReceived", value)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Photos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Received</SelectItem>
                <SelectItem value="no">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="flex gap-2">
            <div className="min-w-[120px]">
              <Label className="text-xs text-muted-foreground">From Date</Label>
              <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-8 justify-start text-left font-normal text-sm",
                      !filters.dateRange.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd") : "From"}
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
            <div className="min-w-[120px]">
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <Popover open={isDateToOpen} onOpenChange={setIsDateToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-8 justify-start text-left font-normal text-sm",
                      !filters.dateRange.to && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {filters.dateRange.to ? format(filters.dateRange.to, "MMM dd") : "To"}
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
