# Language Auto-Detection Implementation

## Overview
Duely now automatically detects user's language based on their IP location and browser settings.

## How It Works

### 1. Server-Side Detection (Middleware)
The middleware (`src/middleware.ts`) detects the user's country from their IP address using:

**Production (Deployed on Vercel/Cloudflare):**
- `x-vercel-ip-country` header (Vercel)
- `cf-ipcountry` header (Cloudflare)
- `request.geo.country` (Next.js built-in)

**Detection Logic:**
- If country code = `ID` (Indonesia) → Set language to `id` (Indonesian)
- All other countries → Set language to `en` (English)

The detected language is saved in a cookie (`duely-language`) that expires in 1 year.

### 2. Client-Side Fallback (Browser Language)
If no language is detected server-side (e.g., in development), the client-side component (`LanguageDetector`) checks the browser's language:

```typescript
navigator.language // e.g., "id-ID", "en-US"
```

- If browser language starts with `id` → Indonesian
- Otherwise → English

### 3. User Preference Override
Users can always manually change their language using the language selector, which will override the auto-detected language.

## Implementation Files

### Core Files:
1. **`src/middleware.ts`**
   - Server-side IP-based language detection
   - Sets language cookie automatically

2. **`src/lib/utils/ip-geolocation.ts`**
   - Utility functions for IP geolocation
   - Fallback API for development (ipapi.co)

3. **`src/components/providers/language-detector.tsx`**
   - Client-side browser language detection
   - Runs on first visit if no language is set

4. **`src/app/layout.tsx`**
   - Integrates LanguageDetector into app

## Testing

### Test in Development:
Since localhost doesn't have geolocation data, the browser language will be used:

```typescript
// Set browser language to Indonesian in Chrome DevTools
navigator.language = "id-ID"
// Refresh page → Should show Indonesian

// Set browser language to English
navigator.language = "en-US"
// Refresh page → Should show English
```

### Test in Production (Vercel):
1. Deploy to Vercel
2. Access from Indonesia → Should automatically show Indonesian
3. Access from other countries → Should show English
4. Check cookies: `duely-language=id` or `duely-language=en`

## API Rate Limits

### Free Tier (ipapi.co):
- 1,000 requests/day
- Used only in development as fallback
- In production, Vercel/Cloudflare headers are used (no limits)

## Future Enhancements

### Add More Languages:
Edit `getLanguageFromCountry()` in `src/middleware.ts`:

```typescript
function getLanguageFromCountry(country: string | null): string {
  if (country === "ID") return "id"; // Indonesia
  if (country === "FR") return "fr"; // France
  if (country === "ES") return "es"; // Spain
  if (country === "JP") return "ja"; // Japan
  // ... add more
  return "en"; // Default
}
```

### Priority Order:
1. **User's manual selection** (stored in cookie)
2. **IP-based detection** (middleware)
3. **Browser language** (client-side fallback)
4. **Default to English**

## Cookie Details

**Cookie Name:** `duely-language`
**Values:** `en` | `id`
**Path:** `/`
**Max Age:** 365 days (1 year)
**SameSite:** Lax (default)

## Troubleshooting

### Language not changing?
1. Clear cookies: `duely-language`
2. Clear browser cache
3. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Still showing wrong language?
1. Check browser language: `navigator.language`
2. Check cookie: DevTools → Application → Cookies
3. Check middleware logs (in Vercel dashboard)

## Performance

- **Server-side detection:** ~0ms (reads headers)
- **Client-side detection:** ~0ms (reads navigator.language)
- **No external API calls** in production
- **Cookie cached** for 1 year

## Privacy

- No personal data is collected
- Only country code is detected from IP
- IP address is not stored
- Language preference is stored locally in cookie
