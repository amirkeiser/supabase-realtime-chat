/**
 * Generate a UUID v4 compatible string
 * Falls back to a simple implementation for browsers that don't support crypto.randomUUID()
 * (e.g., older iOS Safari versions)
 */
export function generateUUID(): string {
  // Use native implementation if available
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback implementation for older browsers
  // This generates a UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

