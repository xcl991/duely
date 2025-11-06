# Google OAuth Setup Guide

## Setup Steps

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in the required fields (app name, support email, etc.)
   - Add scopes: `email` and `profile`
   - Add test users if needed
6. For **Application type**, select **Web application**
7. Add **Authorized redirect URIs**:
   - Development: `http://localhost:5566/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### 2. Update Environment Variables

Open `.env.local` and replace the placeholder values:

```env
GOOGLE_CLIENT_ID="your-actual-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret-here"
```

### 3. Restart the Development Server

After updating the environment variables, restart your development server to apply changes:

```bash
# Kill existing servers on ports 5555 and 5566
netstat -ano | findstr :5555
netstat -ano | findstr :5566
taskkill /F /PID <PID_NUMBER>

# Start fresh servers
cd Workspace
npx prisma studio --port 5555
npx next dev -p 5566
```

### 4. Test Google OAuth

1. Navigate to http://localhost:5566/auth/login
2. Click the "Sign in with Google" button
3. You should be redirected to Google's OAuth consent screen
4. After authorizing, you'll be redirected back to your dashboard

## How It Works

### Authentication Flow

1. User clicks "Sign in with Google"
2. They're redirected to Google's OAuth consent screen
3. After authorization, Google redirects back to your callback URL with an authorization code
4. NextAuth exchanges the code for user information
5. A user account is created or linked in your database
6. The user is logged in and redirected to the dashboard

### Database Integration

When a user signs in with Google:
- If it's their first time, a new `User` record is created
- An `Account` record is created to link the Google account to the user
- The `password` field remains `null` for OAuth users
- If a user with the same email already exists (registered with email/password), the accounts are automatically linked

### Account Linking

If a user:
1. Registers with email `user@example.com` and password
2. Later tries to sign in with Google using the same email

NextAuth will automatically link the Google account to the existing user account. The user can then log in using either method.

## Troubleshooting

### Error: "Redirect URI mismatch"

Make sure the redirect URI in Google Cloud Console exactly matches:
- Development: `http://localhost:5566/api/auth/callback/google`
- Note: Port number must match (5566 in this case)

### Error: "Invalid credentials"

Check that:
1. Environment variables are set correctly in `.env.local`
2. You've restarted the dev server after updating `.env.local`
3. The Client ID and Secret are copied correctly (no extra spaces)

### Google Sign-in Button Not Working

1. Check browser console for errors
2. Verify `NEXTAUTH_URL` is set to `http://localhost:5566` in `.env.local`
3. Ensure `NEXTAUTH_SECRET` is set

## Security Notes

- Never commit `.env.local` to version control
- Use different OAuth credentials for development and production
- Keep your Client Secret secure
- Regularly rotate credentials in production
- Review OAuth scopes to only request what you need

## Production Deployment

When deploying to production:

1. Create new OAuth credentials in Google Cloud Console for your production domain
2. Update environment variables in your hosting platform
3. Add production redirect URI: `https://yourdomain.com/api/auth/callback/google`
4. Update `NEXTAUTH_URL` to your production URL
5. Use a strong, random `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
