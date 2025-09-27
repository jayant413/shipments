// Server-side MongoDB operations are now handled in API routes
// This file is kept for compatibility but is no longer used
export async function createClient() {
  throw new Error('Server client should not be used directly. Use API routes instead.')
}
