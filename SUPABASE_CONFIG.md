# Supabase Configuration for Production

## Vercel Environment Variables

Set in Vercel Dashboard -> Project Settings -> Environment Variables:

```
NEXT_PUBLIC_SITE_URL=https://voice-dashboard-snowy.vercel.app
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

`NEXT_PUBLIC_SITE_URL` should match the URL users actually open in the browser.

## Supabase Dashboard Configuration

### 1. Authentication -> URL Configuration

**CRITICAL:** Site URL and redirect URLs must have **no leading or trailing spaces**.
A space before `https://` breaks magic-link sign-in (Supabase logs: `parse " https://..."`).

**Site URL:**

```
https://voice-dashboard-snowy.vercel.app
```

NOT ` https://voice-dashboard-snowy.vercel.app` (no leading space).

**Redirect URLs** — add every domain users may sign in from:

```
https://voice-dashboard-snowy.vercel.app/auth/callback
http://localhost:3000/auth/callback
http://localhost:10000/auth/callback
http://localhost:23000/auth/callback
```

If you use a custom domain, add that too:

```
https://your-custom-domain.com/auth/callback
```

### 2. Authentication -> Email Templates (Magic Link)

The link must land on your app callback, not only on Supabase. Use:

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
```

Or rely on Supabase's default PKCE flow with `{{ .ConfirmationURL }}` as long as redirect URLs above are configured.

### 3. Magic link expiry

If users see `otp_expired`, the link was used already or timed out (default ~1 hour). They must request a new link from `/login`.

**Do not reuse old emails** — each link works once.

### 4. Authentication -> Settings -> Email Auth

- Enable email confirmations (if required)
- Configure SMTP settings if not using Supabase default email service
