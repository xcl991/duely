# Email Setup Guide - Resend

Aplikasi Duely menggunakan **Resend** untuk mengirim email password reset. Resend dipilih karena:
- ✅ Free tier yang generous (3,000 emails/bulan)
- ✅ Setup yang mudah
- ✅ Modern API
- ✅ Perfect untuk Next.js

## Setup Resend (Gratis)

### 1. Buat Akun Resend

1. Kunjungi https://resend.com
2. Klik **Sign Up** atau **Get Started**
3. Daftar menggunakan GitHub atau Google account (gratis)

### 2. Dapatkan API Key

1. Setelah login, masuk ke **API Keys** di dashboard
2. Klik **Create API Key**
3. Berikan nama (contoh: "Duely Development")
4. Pilih permissions: **Sending access** (default)
5. Klik **Add**
6. **Copy API key** yang ditampilkan (hanya muncul sekali!)

### 3. Update Environment Variables

Buka file `.env.local` dan update:

```env
# Email Service (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"  # Paste API key Anda di sini
EMAIL_FROM="Duely <noreply@yourdomain.com>"  # Atau gunakan default
```

### 4. Test Email (Opsional - untuk custom domain)

**Catatan**: Untuk development, Anda bisa menggunakan domain default Resend (`onboarding@resend.dev`). Tetapi untuk production, sebaiknya verify domain sendiri.

#### Verify Domain (Production):

1. Di dashboard Resend, klik **Domains**
2. Klik **Add Domain**
3. Masukkan domain Anda (contoh: `duely.com`)
4. Tambahkan DNS records yang diberikan ke domain provider Anda:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)
5. Klik **Verify** setelah DNS records ditambahkan
6. Update `EMAIL_FROM` di `.env.local`:
   ```env
   EMAIL_FROM="Duely <noreply@duely.com>"
   ```

## Free Tier Limits

### Resend Free Tier:
- 📧 **3,000 emails per bulan**
- 📧 **100 emails per hari**
- ✅ Unlimited domains
- ✅ Email API
- ✅ Analytics
- ✅ DKIM, SPF, DMARC support

Perfect untuk development dan small production apps!

## Mode Development vs Production

### Development (tanpa RESEND_API_KEY):
- Reset links akan ditampilkan di **console/terminal**
- Tidak ada email yang terkirim
- Cukup copy link dari console dan paste di browser

### Production (dengan RESEND_API_KEY):
- Email otomatis terkirim ke user
- Email template yang profesional
- User dapat reset password via email mereka

## Email Template

Template email yang sudah dibuat:
- ✅ Responsive design
- ✅ Branded dengan warna Duely (teal)
- ✅ Clear call-to-action button
- ✅ Security notice
- ✅ Expiration warning (1 hour)
- ✅ Alternative text link (jika button tidak work)

Preview template ada di: `src/lib/email/resend.ts`

## Troubleshooting

### Email tidak terkirim?

1. **Check API key**: Pastikan `RESEND_API_KEY` benar di `.env.local`
2. **Restart server**: Stop dan start ulang dev server setelah update env
3. **Check console**: Lihat apakah ada error di terminal
4. **Verify domain**: Jika menggunakan custom domain, pastikan sudah verified

### Email masuk spam?

1. **Verify domain**: Setup SPF, DKIM, DMARC records
2. **Warm up**: Mulai dengan volume rendah, gradually increase
3. **Content**: Hindari spam words (FREE, URGENT, CLICK HERE, dll)
4. **Test**: Gunakan mail-tester.com untuk check spam score

### Rate limit exceeded?

Free tier: 100 emails/hari. Jika exceed:
1. Upgrade ke paid plan (mulai $20/bulan untuk 50k emails)
2. Atau gunakan multiple API keys (not recommended)

## Alternative Email Services

Jika Resend tidak sesuai, alternatif gratis lain:

### 1. **SendGrid** (100 emails/hari)
```bash
npm install @sendgrid/mail
```

### 2. **Brevo** (300 emails/hari)
```bash
npm install @sendinblue/client
```

### 3. **Mailgun** (5,000 emails/bulan trial)
```bash
npm install mailgun-js
```

### 4. **Amazon SES** (62,000 emails/bulan dari EC2)
```bash
npm install @aws-sdk/client-ses
```

## Support

- 📖 Resend Docs: https://resend.com/docs
- 💬 Resend Discord: https://resend.com/discord
- 🐛 Issues: Report di Resend dashboard atau Discord

## Security Best Practices

1. ✅ Never commit `.env.local` to git
2. ✅ Use different API keys for dev/staging/prod
3. ✅ Rotate API keys regularly
4. ✅ Monitor email sending activity
5. ✅ Set up rate limiting
6. ✅ Validate email addresses before sending

## Cost Estimation

### Free tier (0-3,000 emails/bulan):
- **Cost**: $0 ✅
- **Perfect for**: Development, small apps, testing

### Beyond free tier:
- **50,000 emails/bulan**: $20/month
- **100,000 emails/bulan**: $80/month
- **500,000 emails/bulan**: $300/month

Untuk subscription app seperti Duely, 3,000 emails gratis sudah cukup untuk ~1,000 active users (dengan asumsi ~3 emails/user/bulan untuk password resets, notifications, dll).
