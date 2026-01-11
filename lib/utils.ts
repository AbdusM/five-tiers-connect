import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format phone number for display
 * 
 * @param phone - Phone number in various formats: "(215) 555-1234", "2155551234", "+12155551234", etc.
 * @returns Formatted phone number as "(XXX) XXX-XXXX" for 10-digit numbers, or original if invalid
 * 
 * @example
 * formatPhoneNumber("2155551234") // Returns "(215) 555-1234"
 * formatPhoneNumber("(215) 555-1234") // Returns "(215) 555-1234"
 * formatPhoneNumber("+12155551234") // Returns "(215) 555-1234"
 * formatPhoneNumber("123") // Returns "123" (invalid, returned as-is)
 * formatPhoneNumber(null) // Returns ""
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return ''
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX for 10-digit US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  // Format as +X (XXX) XXX-XXXX for 11-digit numbers starting with 1 (US country code)
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  // For other formats, return as-is (may be international, extension, or malformed)
  // In production, you might want to validate further or show a warning
  return phone
}

/**
 * Format full address for display
 * 
 * @param address - Street address
 * @param city - City name
 * @param state - State abbreviation (e.g., "PA")
 * @param zip - ZIP code
 * @returns Formatted address string
 * 
 * @example
 * formatAddress("123 Main St", "Philadelphia", "PA", "19104")
 * // Returns: "123 Main St, Philadelphia, PA 19104"
 */
export function formatAddress(
  address: string,
  city: string,
  state: string,
  zip: string
): string {
  return `${address}, ${city}, ${state} ${zip}`
}

/**
 * Create Google Maps URL for address
 * 
 * Opens in user's default maps app or browser
 * 
 * @param address - Street address
 * @param city - City name
 * @param state - State abbreviation
 * @param zip - ZIP code
 * @returns Google Maps URL with encoded address
 * 
 * @example
 * getMapsUrl("123 Main St", "Philadelphia", "PA", "19104")
 * // Returns: "https://maps.google.com/?q=123%20Main%20St%2C%20Philadelphia%2C%20PA%2019104"
 */
export function getMapsUrl(address: string, city: string, state: string, zip: string): string {
  const fullAddress = encodeURIComponent(formatAddress(address, city, state, zip))
  return `https://maps.google.com/?q=${fullAddress}`
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * Returns the great-circle distance between two points on Earth
 * 
 * @param lat1 - Latitude of first point (degrees)
 * @param lon1 - Longitude of first point (degrees)
 * @param lat2 - Latitude of second point (degrees)
 * @param lon2 - Longitude of second point (degrees)
 * @returns Distance in miles, rounded to 1 decimal place
 * 
 * @example
 * calculateDistance(39.9526, -75.1652, 40.7128, -74.0060)
 * // Returns distance between Philadelphia and New York (~95 miles)
 * 
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal place
}
