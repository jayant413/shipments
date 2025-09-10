"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { getShipments } from "@/lib/shipment-service"
import type { Shipment } from "@/lib/types"

interface AnalyticsDashboardProps {
  onLogout?: () => void
}

export function AnalyticsDashboard({ onLogout }: AnalyticsDashboardProps) {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadShipments()
  }, [])

  const loadShipments = async () => {
    try {
      const data = await getShipments()
      setShipments(data)
    } catch (error) {
      console.error("Failed to load shipments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statusData = shipments.reduce(
    (acc, shipment) => {
      const status = shipment.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieChartData = Object.entries(statusData).map(([status, count]) => ({
    name: status,
    value: count,
    percentage: ((count / shipments.length) * 100).toFixed(1),
  }))

  const reasonData = shipments.reduce(
    (acc, shipment) => {
      const reason = shipment.reason
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const barChartData = Object.entries(reasonData).map(([reason, count]) => ({
    reason: reason.length > 15 ? reason.substring(0, 15) + "..." : reason,
    count,
  }))

  const photosData = shipments.reduce(
    (acc, shipment) => {
      const status = shipment.photos_received ? "Received" : "Pending"
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const photosChartData = Object.entries(photosData).map(([status, count]) => ({
    name: status,
    value: count,
  }))

  const agingData = shipments.reduce(
    (acc, shipment) => {
      const aging = Number.parseInt(shipment.aging.toString()) || 0
      let category = "0-7 days"
      if (aging > 30) category = "30+ days"
      else if (aging > 14) category = "15-30 days"
      else if (aging > 7) category = "8-14 days"

      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const agingChartData = Object.entries(agingData).map(([category, count]) => ({
    category,
    count,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Overview of shipment data and trends</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{shipments.length}</p>
                <p className="text-sm text-muted-foreground">Total Shipments</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Open Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {shipments.filter((s) => s.status.toLowerCase().includes("open")).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Photos Received</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {shipments.filter((s) => s.photos_received).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Aging</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      shipments.reduce((sum, s) => sum + (Number.parseInt(s.aging.toString()) || 0), 0) /
                        shipments.length || 0,
                    )}{" "}
                    days
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Customer Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {shipments.filter((s) => s.reason.toLowerCase().includes("return")).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Status Distribution</CardTitle>
                  <CardDescription>Breakdown of shipments by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Reason Analysis Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Reasons</CardTitle>
                  <CardDescription>Most common reasons for shipments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="reason" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Photos Status Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Photos Received Status</CardTitle>
                  <CardDescription>Status of photo submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={photosChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {photosChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Aging Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Aging Distribution</CardTitle>
                  <CardDescription>Shipments grouped by aging periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={agingChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
