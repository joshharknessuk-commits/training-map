# GrappleMap Launch Checklist

## 🗄️ Database Setup

- [ ] Run database migrations for new schema
  ```bash
  # Add 'free' to membership_tier enum
  ALTER TYPE membership_tier ADD VALUE 'free';

  # Update default tier (if needed)
  ALTER TABLE users ALTER COLUMN membership_tier SET DEFAULT 'free';
  ```
- [ ] Verify all tables exist (users, user_profiles, gyms, open_mats, check_ins, gym_payouts)
- [ ] Create database indexes for performance
- [ ] Set up automated backups

## 🔐 Environment Variables

### Required (App Won't Work Without These)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `QR_SECRET` - Generate with `openssl rand -base64 32`

### Required for Paid Features
- [ ] `STRIPE_SECRET_KEY` - Stripe API secret key
- [ ] `STRIPE_PRICE_STANDARD` - Price ID for £29 tier
- [ ] `STRIPE_PRICE_PRO` - Price ID for £59 tier
- [ ] `STRIPE_PRICE_ACADEMY` - Price ID for £99 tier
- [ ] `STRIPE_WEBHOOK_SECRET` - From Stripe webhook dashboard
- [ ] `STRIPE_PORTAL_URL` - Customer portal URL

### Optional (Can Add Later)
- [ ] SMTP configuration for emails
- [ ] Analytics tracking IDs
- [ ] Sentry DSN for error tracking

## 💳 Stripe Configuration

- [ ] Create products in Stripe Dashboard:
  - Network (£29/month)
  - Network Pro (£59/month)
  - Academy Plan (£99/month)
- [ ] Get price IDs and add to environment variables
- [ ] Set up webhook endpoint: `/api/webhooks/stripe`
- [ ] Configure webhook events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- [ ] Enable Customer Portal in Stripe
- [ ] Test payment flow end-to-end

## 🔒 Security Audit

- [ ] All API routes check authentication (`auth()` call)
- [ ] No sensitive data in client-side code
- [ ] Environment variables not committed to git
- [ ] QR codes use HMAC signatures
- [ ] SQL injection protection (using Drizzle ORM ✓)
- [ ] File upload validation (type, size)
- [ ] Rate limiting on auth endpoints (TODO)
- [ ] CORS configured properly (TODO)

## 🧪 Testing

- [ ] Test free tier signup flow
- [ ] Test paid tier checkout flow (all tiers)
- [ ] Test QR code generation (paid tiers only)
- [ ] Test QR code blocks free tier users
- [ ] Test membership cancellation
- [ ] Test payment method update
- [ ] Test avatar upload
- [ ] Test profile editing
- [ ] Test password change
- [ ] Test account deletion
- [ ] Test gym inquiry form
- [ ] Test webhook handling (use Stripe CLI)

## 📝 Content & Data

- [ ] Seed database with initial gyms
- [ ] Create initial open mats schedule
- [ ] Add partner gym logos/images
- [ ] Write support email templates
- [ ] Create terms of service
- [ ] Create privacy policy
- [ ] Create cancellation policy

## 🚀 Deployment

- [ ] Set up hosting (Vercel recommended for Next.js)
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Configure DNS records
- [ ] Set production environment variables
- [ ] Run database migrations on production
- [ ] Test production deployment
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Configure error alerting

## 📧 Post-Launch

- [ ] Set up email sending (SendGrid/Postmark/Resend)
- [ ] Email verification flow (TODO)
- [ ] Password reset flow (TODO)
- [ ] Implement rate limiting
- [ ] Add email notifications for:
  - Successful signup
  - Payment receipt
  - Membership cancelled
  - Payment failed
- [ ] SMS reminders for Pro tier (Twilio)

## 🐛 Known Issues / TODOs

- [ ] Password reset flow not implemented
- [ ] Email verification not implemented
- [ ] Rate limiting not configured
- [ ] No CORS configuration
- [ ] Avatar uploads use local storage (migrate to Cloudinary/S3)
- [ ] QR code shows placeholder (install QR library)
- [ ] No email notifications yet
- [ ] Webhook handlers have TODOs for database updates

## 📊 Monitoring

- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (Vercel Analytics, Plausible)
- [ ] Set up performance monitoring
- [ ] Create admin dashboard for metrics

## 🎯 Launch Readiness

### Minimum Viable Product (Can Launch)
- [x] Free tier signup works
- [x] Paid tier checkout works
- [x] QR codes generate for paid tiers
- [x] Profile management works
- [x] Membership cancellation works
- [ ] Database migrations run
- [ ] Stripe configured
- [ ] Environment variables set

### Production Ready (Recommended)
- [ ] All MVP items ✓
- [ ] Password reset flow
- [ ] Email notifications
- [ ] Terms of service
- [ ] Privacy policy
- [ ] Error monitoring
- [ ] Backups configured

### Full Featured (Future)
- [ ] All Production Ready items ✓
- [ ] Email verification
- [ ] SMS reminders
- [ ] Social sharing
- [ ] Streak tracking
- [ ] Analytics dashboard
- [ ] Guest pass system
