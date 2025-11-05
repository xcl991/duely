# Currency Conversion Setup Guide

## 🎯 Overview
Sistem ini akan otomatis convert antar mata uang menggunakan exchange rate yang di-update setiap hari jam 12 siang WIB.

## 📋 Status Saat Ini

### ✅ Yang Sudah Dikerjakan:
1. **Database Schema** - Model `ExchangeRate` sudah ditambahkan ke Prisma
2. **Settings Auto-Refresh** - Currency changes akan otomatis refresh semua pages
3. **IDR Currency** - Rupiah sudah ditambahkan ke currency options

### 🚧 Yang Perlu Dilakukan:

## 1. Setup API Key (PENTING!)

### Daftar API Gratis (Pilih salah satu):

#### Rekomendasi: **ExchangeRate-API** (Paling Mudah)
- Website: https://www.exchangerate-api.com/
- Free tier: 1,500 requests/month
- Signup: https://app.exchangerate-api.com/sign-up
- ✅ Tidak perlu credit card
- ✅ Update daily otomatis
- ✅ Support 161 currencies

#### Alternatif Lain:
1. **Fixer.io** - 100 requests/month (perlu credit card)
2. **CurrencyAPI.com** - 300 requests/month
3. **Open Exchange Rates** - 1,000 requests/month

### Setelah dapat API Key:
1. Copy API key Anda
2. Buka file `.env.local`
3. Replace `your-api-key-here` dengan API key Anda:
   ```
   EXCHANGE_RATE_API_KEY="abc123yourkey"
   ```

## 2. Cara Kerja Sistem

### Flow Conversion:
```
User Display Currency (IDR)
    ↓
Subscription Currency (USD, EUR, dll)
    ↓
Convert menggunakan latest exchange rate
    ↓
Display in Dashboard
```

### Example:
- User settings currency: **IDR (Rp)**
- Subscription 1: **$10.00 USD**
- Subscription 2: **€5.00 EUR**
- Subscription 3: **Rp100,000 IDR**

Dashboard akan show:
- Total: **Rp261,500** (semua di-convert ke IDR)

## 3. Update Exchange Rates

### Manual Update (Testing):
```bash
# Test fetch rates
curl http://localhost:5566/api/exchange-rates/update

# Check Prisma Studio
npx prisma studio
# Buka table ExchangeRate
```

### Automatic Daily Update (Production):
Ada 2 opsi:

#### Option A: Vercel Cron Jobs (Recommended)
File `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/exchange-rates/update",
    "schedule": "0 5 * * *"
  }]
}
```
Note: `0 5 * * *` = 12:00 PM WIB (UTC+7 = 5 AM UTC)

#### Option B: Node-cron (Self-hosted)
Install:
```bash
npm install node-cron
```

## 4. Testing

### Test 1: Check Currency Display
1. Buka Settings → Change currency ke IDR
2. Klik Save
3. Dashboard harus auto-refresh
4. Semua amounts harus berubah ke Rupiah

### Test 2: Add Subscription dengan Currency Berbeda
1. Buka Subscriptions page
2. Add subscription:
   - Service: Netflix
   - Amount: $10
   - Currency: USD
3. Balik ke Dashboard
4. Netflix harus ditampilkan dalam IDR

### Test 3: Manual Rate Update
```bash
curl http://localhost:5566/api/exchange-rates/update
```
Check response:
```json
{
  "success": true,
  "message": "Exchange rates updated successfully",
  "rates": {
    "USD_TO_IDR": 15650,
    "EUR_TO_IDR": 17200,
    ...
  }
}
```

## 5. Monitoring

### Check Rates di Prisma Studio:
```bash
npx prisma studio
```
- Open `ExchangeRate` table
- Verify ada data untuk:
  - USD → IDR
  - EUR → IDR
  - GBP → IDR
  - dll.

### Check Logs:
- Next.js console akan show conversion logs
- Format: `Converting $10.00 USD → Rp156,500 IDR (rate: 15650)`

## 6. Troubleshooting

### Issue: Currency tidak berubah setelah save settings
**Solution**:
- Clear browser cache
- Hard refresh (Ctrl + Shift + R)
- Check console untuk errors

### Issue: API rate limit exceeded
**Solution**:
- ExchangeRate-API: 1,500/month
- Jika habis, daftar akun baru atau upgrade
- Atau gunakan API alternatif (Fixer, CurrencyAPI)

### Issue: Conversion rate tidak akurat
**Solution**:
- Exchange rates update 1x sehari (jam 12 siang WIB)
- Untuk real-time rates, perlu API berbayar
- Atau update lebih sering (tapi hati-hati rate limit)

## 7. Customization

### Update Schedule:
Edit jam update di `vercel.json` atau cron job.

WIB to UTC conversion:
- 12:00 PM WIB = 05:00 AM UTC → `0 5 * * *`
- 06:00 AM WIB = 11:00 PM UTC → `0 23 * * *`
- 09:00 PM WIB = 02:00 PM UTC → `0 14 * * *`

### Add More Currencies:
Edit `src/app/(dashboard)/settings/page.tsx`:
```typescript
<SelectItem value="MYR">MYR (RM)</SelectItem>
<SelectItem value="SGD">SGD (S$)</SelectItem>
<SelectItem value="THB">THB (฿)</SelectItem>
```

## 8. Production Checklist

- [ ] API key sudah di .env
- [ ] Test manual rate update
- [ ] Test conversion di dashboard
- [ ] Setup Vercel cron atau node-cron
- [ ] Monitor logs selama 1 minggu
- [ ] Backup database regular

## 📞 Support

Jika ada masalah:
1. Check console logs
2. Check Prisma Studio untuk verify data
3. Test API key valid: `curl https://v6.exchangerate-api.com/v6/YOUR-KEY/latest/USD`

---

**Status**: ✅ Auto-refresh sudah aktif, tinggal setup API key dan cron job!
