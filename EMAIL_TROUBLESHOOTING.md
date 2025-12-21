# Email Troubleshooting Guide

## Current Status
- ✅ User is created in Supabase (API call succeeds)
- ❌ Email is not being delivered

## Most Common Cause: SMTP Not Configured

Supabase's default email service has limitations and may not work reliably in production.

### Solution: Configure Custom SMTP

1. Go to Supabase Dashboard → Project Settings → Auth → SMTP Settings

2. Configure one of these options:

#### Option A: SendGrid (Recommended for production)
- Sign up at sendgrid.com
- Create an API key
- Enter in Supabase:
  - SMTP Host: `smtp.sendgrid.net`
  - SMTP Port: `587`
  - SMTP User: `apikey`
  - SMTP Password: Your SendGrid API key
  - Sender Email: Your verified sender email
  - Sender Name: Jackson Rental Homes

#### Option B: Gmail (Quick setup)
- Use Gmail App Password
- SMTP Host: `smtp.gmail.com`
- SMTP Port: `587`
- SMTP User: Your Gmail address
- SMTP Password: Gmail App Password (not regular password)

#### Option C: Mailgun, AWS SES, or other SMTP service

### Other Things to Check:

1. **Authentication Logs**
   - Dashboard → Authentication → Logs
   - Look for email send attempts and errors

2. **Email Templates**
   - Dashboard → Authentication → Email Templates → Magic Link
   - Verify template is enabled and contains: `{{ .ConfirmationURL }}`

3. **Rate Limiting**
   - Dashboard → Authentication → Settings
   - Check if rate limits are too restrictive

4. **Email Auth Settings**
   - Dashboard → Authentication → Settings → Email Auth
   - Enable email signup/login
   - Configure email confirmation settings

## Quick Test
After configuring SMTP, try sending a test email in Supabase Dashboard → Authentication → Logs to verify delivery works.
