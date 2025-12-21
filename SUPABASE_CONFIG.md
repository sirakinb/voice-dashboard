# Supabase Configuration for Production

## Vercel Environment Variables
Set in Vercel Dashboard -> Project Settings -> Environment Variables:

```
NEXT_PUBLIC_SITE_URL=https://voice-dashboard-snowy.vercel.app
```

## Supabase Dashboard Configuration

### 1. Authentication -> URL Configuration

**Site URL:**
```
https://voice-dashboard-snowy.vercel.app
```

**Redirect URLs (add both for local dev and production):**
```
https://voice-dashboard-snowy.vercel.app/auth/callback
http://localhost:3030/auth/callback
```

### 2. Authentication -> Email Templates

Make sure the Magic Link template redirects to:
```
https://voice-dashboard-snowy.vercel.app/auth/callback
```

### 3. Authentication -> Settings -> Email Auth

- Enable email confirmations (if required)
- Configure SMTP settings if not using Supabase default email service
