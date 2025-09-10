"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, BarChart3, Settings, Menu, X } from "lucide-react"

const navigation = [
  { name: "Analytics", href: "/", icon: LayoutDashboard },
  { name: "Shipments", href: "/shipments", icon: Package },
  { name: "Reports", href: "#", icon: BarChart3 },
  { name: "Settings", href: "#", icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (href: string) => {
    if (href !== "#") {
      router.push(href)
    }
    setIsOpen(false)
  }

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="bg-background shadow-md">
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-sidebar-primary" />
              <span className="text-xl font-bold text-sidebar-foreground">ShipTrack</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isCurrent = pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isCurrent ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCurrent
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-sidebar-primary-foreground">R</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Roshan</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">Admin User</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
          onTouchStart={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
