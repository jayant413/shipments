"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LoginForm } from "./login-form"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { getAuthState, login, logout, isSessionExpired } from "@/lib/auth"

interface AuthWrapperProps {
  children?: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authState = getAuthState()
    setIsAuthenticated(authState.isAuthenticated)
    setIsLoading(false)

    const interval = setInterval(() => {
      if (isSessionExpired()) {
        console.log("[v0] Session expired, logging out")
        handleLogout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    console.log("[v0] User logged in successfully")
    login("Roshan")
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    console.log("[v0] User logged out")
    logout()
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  if (children) {
    return <>{children}</>
  }

  return <AnalyticsDashboard onLogout={handleLogout} />
}
