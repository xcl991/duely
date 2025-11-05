/**
 * IP Geolocation utility
 * Detects country from IP address for language auto-detection
 */

interface GeolocationResponse {
  country_code?: string;
  country?: string;
}

/**
 * Get country code from IP address using free ipapi.co service
 * Note: This is a fallback for development. In production, use Vercel/Cloudflare headers
 */
export async function getCountryFromIP(ip: string): Promise<string | null> {
  try {
    // Skip for localhost/private IPs
    if (
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.")
    ) {
      return null;
    }

    // Use free ipapi.co service (1000 requests/day limit)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return null;
    }

    const data: GeolocationResponse = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return null;
  }
}

/**
 * Get language code from country code
 */
export function getLanguageFromCountry(countryCode: string | null): string {
  if (!countryCode) {
    return "en"; // Default to English
  }

  // Indonesia
  if (countryCode === "ID") {
    return "id";
  }

  // You can add more country mappings here
  // For example:
  // if (countryCode === "FR") return "fr";
  // if (countryCode === "ES") return "es";

  // Default to English for all other countries
  return "en";
}
