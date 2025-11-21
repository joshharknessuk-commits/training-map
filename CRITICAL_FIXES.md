# 🚨 CRITICAL FIXES REQUIRED BEFORE LAUNCH

## ⛔ **LAUNCH BLOCKERS** - Must Fix Now

### 1. Stripe Webhook Handlers Not Implemented
**Status:** 🔴 CRITICAL
**File:** `apps/grapplemap-web/app/api/webhooks/stripe/route.ts`

**Problem:** All webhook handlers are logging only - they don't update the database. Users will pay but never get access.

**What happens now:**
- User completes checkout ➔ Payment succeeds ➔ Nothing happens in database ➔ User has no access
- Subscription renews ➔ Payment succeeds ➔ Status not updated ➔ User loses access
- User cancels ➔ Database not updated ➔ User keeps access (financial loss)

**Fix Required:**
```typescript
// Implement these 6 handlers (lines 88-180):
- handleCheckoutCompleted() - Activate membership after payment
- handleSubscriptionCreated() - Set status to 'active'
- handleSubscriptionUpdated() - Update status based on Stripe status
- handleSubscriptionDeleted() - Mark as 'canceled'
- handleInvoicePaid() - Reactivate if was past_due
- handleInvoicePaymentFailed() - Set status to 'past_due'
```

**Impact if not fixed:** Payment system completely broken. Users pay, get nothing.

---

### 2. Insecure QR Code Secret
**Status:** 🔴 CRITICAL
**File:** `apps/grapplemap-web/app/api/qr-code/route.ts` Line 14

**Problem:**
```typescript
const secret = process.env.QR_SECRET || 'default-secret-change-in-production';
```

**Attack:** If `QR_SECRET` environment variable is not set, anyone can:
1. Reverse engineer the default secret ("default-secret-change-in-production")
2. Generate fake QR codes
3. Check in at gyms without paying
4. Gyms lose revenue

**Fix Required:**
```typescript
const secret = process.env.QR_SECRET;
if (!secret) {
  throw new Error('QR_SECRET environment variable is required');
}
```

**Impact if not fixed:** Unlimited free gym access for attackers. Financial loss.

---

### 3. File Upload Security Vulnerabilities
**Status:** 🔴 CRITICAL
**File:** `apps/grapplemap-web/app/api/upload/avatar/route.ts`

**Problems:**
1. **Trusts user input** (Line 40): `const ext = file.name.split('.').pop()`
   - Attacker uploads `malware.php.jpg` ➔ Gets stored as `.jpg` ➔ Could execute if misconfigured
2. **No magic byte validation:** Relies on `Content-Type` header (easily spoofed)
3. **Stored in public directory:** Files directly accessible via web
4. **No cleanup:** Old avatars never deleted ➔ disk fills up

**Attacks possible:**
- Upload webshell (`.php`, `.aspx`)
- Upload malicious SVG with JavaScript (XSS)
- Path traversal (`../../../etc/passwd`)
- Disk exhaustion (upload gigabytes)

**Fix Required:**
```typescript
// 1. Validate magic bytes, not just extension
// 2. Whitelist extensions: only jpg, jpeg, png
// 3. Store outside public/ or use Cloudinary/S3
// 4. Delete old avatar on update
```

**Impact if not fixed:** Server compromise, XSS attacks, disk failure.

---

## 🔥 HIGH PRIORITY - Fix Before Production

### 4. No CSRF Protection
**Status:** 🟠 HIGH
**All POST/PUT/DELETE routes**

**Problem:** No CSRF token validation. Attacker creates malicious site:

```html
<form action="https://grapplemap.uk/api/account/delete" method="POST">
  <input type="submit" value="Click for prize!">
</form>
```

User clicks ➔ Account deleted while they're logged in.

**Fix:** Implement CSRF token verification or use same-site cookies.

---

### 5. Session Not Invalidated on Password Change
**Status:** 🟠 HIGH
**Files:** `apps/grapplemap-web/app/api/account/change-password/route.ts`

**Problem:** After password change, old sessions remain valid.

**Attack scenario:**
1. Attacker steals session cookie
2. User changes password thinking they're safe
3. Attacker still has access with old session

**Fix:** Invalidate all sessions when password changes.

---

### 6. Race Condition in Booking System
**Status:** 🟠 HIGH
**File:** `apps/grapplemap-web/app/api/bookings/route.ts` Lines 54-101

**Problem:** No transaction wrapping capacity check and booking creation.

**What happens:**
1. User A checks: "10/10 spots filled? No, only 9"
2. User B checks (same microsecond): "10/10 spots filled? No, only 9"
3. Both create booking
4. Result: 11/10 bookings ➔ Class overbooked

**Fix:** Wrap in database transaction with row locking.

---

### 7. Profile Update Accepts Any Input (XSS Risk)
**Status:** 🟠 HIGH
**File:** `apps/grapplemap-web/app/api/profile/route.ts` Lines 39-114

**Problems:**
1. No input validation (user can set 10MB bio, crash browser)
2. No sanitization (XSS via displayName, bio, instagramHandle)
3. User can set arbitrary `avatarUrl` (bypass upload security)
4. User can set arbitrary `homeGymId` (unauthorized gym access)

**Attack:**
```javascript
// Attacker sets displayName to:
displayName: '<img src=x onerror="alert(document.cookie)">'
// When viewed by other users: XSS executes
```

**Fix:** Use Zod validation schema, sanitize all text, remove avatarUrl from update.

---

## 🟡 IMPORTANT - Fix Soon

### 8. No Rate Limiting (DoS Risk)
**Status:** 🟡 IMPORTANT
**All routes except `/api/claim`**

**Vulnerable:**
- `/api/auth/signup` - Create 1000s of fake accounts
- `/api/upload/avatar` - Fill disk with uploads
- `/api/bookings` - Book every class immediately
- `/api/profile` - DoS database with constant updates

**Fix:** Add rate limiting middleware to all routes.

---

### 9. Email Validation Too Weak
**Status:** 🟡 IMPORTANT
**Multiple files**

**Current validation:**
```typescript
if (!email || !email.includes('@')) { ... }
```

**This accepts:**
- `"@"` ✅ (valid!)
- `"test@"` ✅ (valid!)
- `"@@@@@"` ✅ (valid!)

**Fix:** Use proper email regex or `validator.js`

---

### 10. QR Code Expiry Bug
**Status:** 🟡 IMPORTANT
**File:** `apps/grapplemap-web/app/api/qr-code/route.ts` Line 124

**Problem:**
```typescript
if (currentHourTimestamp - tokenHourTimestamp > 0) {
  return NextResponse.json({ error: 'Token expired' }, { status: 400 });
}
```

**Current behavior:** Token expires **immediately** when hour changes (could be 1 second)
**Expected:** Token valid for 1 **full** hour

**Fix:** Change to `>= 1`

---

### 11. Memory Leak in Rate Limiter
**Status:** 🟡 IMPORTANT
**File:** `apps/grapplemap-web/app/api/claim/route.ts` Line 14

**Problem:**
```typescript
const rateLimitStore = new Map<string, RateLimitEntry>();
// Never cleared! Grows forever.
```

**Impact:** In production, Map grows to millions of entries ➔ Out of memory ➔ Server crash

**Fix:** Periodic cleanup or use Redis for rate limiting.

---

## 📝 ARCHITECTURAL ISSUES (Ousterhout Principles)

### 12. Repeated Auth Boilerplate (Shallow Modules)
**Every API route has:**
```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Appears in 15+ files.** Violates DRY and "deep modules" principle.

**Fix:** Create auth middleware:
```typescript
export const withAuth = (handler) => async (req) => {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  return handler(req, session);
};
```

---

### 13. Inconsistent Error Responses (Information Leakage)
**Different files return:**
- `{ error: string }`
- `{ message: string }`
- `{ success: boolean, message: string }`
- `{ error: string, details: object }`

**Problem:** Confusing API, leaks implementation details.

**Fix:** Standardized error format:
```typescript
{
  success: boolean,
  error?: { code: string, message: string },
  data?: any
}
```

---

## 🐛 BUGS

### 14. Null Spread Bug
**File:** `apps/grapplemap-web/app/profile/page.tsx` Line 327

```typescript
setProfile({ ...profile, avatarUrl: data.url });  // profile could be null!
```

**Impact:** Runtime error crashes page.

---

### 15. User Deleted But Still Charged
**File:** `apps/grapplemap-web/app/api/account/delete/route.ts` Lines 36-51

**Problem:** If Stripe cancellation fails, continues with deletion:
```typescript
try {
  await stripe.subscriptions.cancel(...);
} catch (stripeError) {
  console.error(...);
  // Continue with deletion even if Stripe fails
}
```

**Result:** User deleted from DB, Stripe still charges monthly!

**Fix:** Either fail deletion or add manual review queue.

---

## 📋 IMMEDIATE ACTION ITEMS

### Before Launch (Next 24 Hours)
1. [ ] Implement all 6 Stripe webhook handlers
2. [ ] Remove QR_SECRET default value
3. [ ] Add file upload magic byte validation
4. [ ] Add CSRF protection (or document risk acceptance)
5. [ ] Add basic input validation to profile updates
6. [ ] Fix QR code expiry logic
7. [ ] Test entire payment flow end-to-end

### Before Production (Next Week)
8. [ ] Add rate limiting to all routes
9. [ ] Implement session invalidation
10. [ ] Fix booking race condition with transactions
11. [ ] Add proper email validation
12. [ ] Fix memory leak in rate limiter
13. [ ] Implement auth middleware
14. [ ] Standardize error responses
15. [ ] Fix account deletion to check Stripe success

### After Launch (First Month)
16. [ ] Add password reset flow
17. [ ] Add email verification
18. [ ] Migrate avatars to Cloudinary/S3
19. [ ] Add audit logging
20. [ ] Implement health check endpoint
21. [ ] Add API versioning
22. [ ] Set up error monitoring (Sentry)
23. [ ] Add performance monitoring
24. [ ] Implement feature flags

---

## 🔧 QUICK FIXES (Copy-Paste Ready)

### Fix #2: QR Secret
```typescript
// apps/grapplemap-web/app/api/qr-code/route.ts Line 14
const secret = process.env.QR_SECRET;
if (!secret) {
  throw new Error('QR_SECRET must be set in environment variables');
}
```

### Fix #10: QR Expiry
```typescript
// apps/grapplemap-web/app/api/qr-code/route.ts Line 124
if (currentHourTimestamp - tokenHourTimestamp >= 1) {
  return NextResponse.json({ error: 'Token expired' }, { status: 400 });
}
```

### Fix #9: Email Validation
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !emailRegex.test(email)) {
  return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
}
```

---

## 📊 RISK ASSESSMENT

| Issue | Severity | Likelihood | Risk Score | Status |
|-------|----------|------------|------------|--------|
| #1 Stripe webhooks | Critical | 100% | 🔴 10/10 | Launch blocker |
| #2 QR secret | Critical | 80% | 🔴 9/10 | Launch blocker |
| #3 File upload | High | 60% | 🟠 8/10 | Pre-prod |
| #4 CSRF | High | 40% | 🟠 7/10 | Pre-prod |
| #5 Session invalidation | Medium | 30% | 🟡 6/10 | Pre-prod |
| #6 Booking race | Medium | 20% | 🟡 5/10 | Pre-prod |
| #7 Profile XSS | High | 50% | 🟠 7/10 | Pre-prod |

---

## 🎯 SUCCESS CRITERIA

**Minimum for Launch:**
- ✅ #1 Stripe webhooks working (test with Stripe CLI)
- ✅ #2 QR secret has no default
- ✅ Payment flow tested end-to-end
- ✅ All environment variables documented
- ✅ Database migrations run

**Ready for Production:**
- ✅ All Critical + High issues fixed
- ✅ Rate limiting implemented
- ✅ Error monitoring configured
- ✅ Backups configured
- ✅ Terms of service published

---

*Generated by comprehensive code review based on John Ousterhout's "A Philosophy of Software Design" principles*
