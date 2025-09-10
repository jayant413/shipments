"use client"

export interface AuthState {
  isAuthenticated: boolean
  username: string | null
  loginTime: number | null
}

const AUTH_KEY = "shipment_auth"
const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export function login(username: string): void {
  const authState: AuthState = {
    isAuthenticated: true,
    username,
    loginTime: Date.now(),
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(authState))
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY)
}

export function getAuthState(): AuthState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, username: null, loginTime: null }
  }

  try {
    const stored = localStorage.getItem(AUTH_KEY)
    if (!stored) {
      return { isAuthenticated: false, username: null, loginTime: null }
    }

    const authState: AuthState = JSON.parse(stored)

    if (authState.loginTime && Date.now() - authState.loginTime > SESSION_DURATION) {
      logout()
      return { isAuthenticated: false, username: null, loginTime: null }
    }

    return authState
  } catch {
    logout()
    return { isAuthenticated: false, username: null, loginTime: null }
  }
}

export function isSessionExpired(): boolean {
  const authState = getAuthState()
  if (!authState.loginTime) return true

  return Date.now() - authState.loginTime > SESSION_DURATION
}

export function getTimeUntilExpiry(): number {
  const authState = getAuthState()
  if (!authState.loginTime) return 0

  const elapsed = Date.now() - authState.loginTime
  return Math.max(0, SESSION_DURATION - elapsed)
}
