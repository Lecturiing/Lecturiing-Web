# Backend Requirements & Implementation Notes

This document tracks all backend/frontend gaps found and the changes implemented across the auth system.

---

## Implemented Changes

### 1. `passport.js` — Track `isNewUser` in Google OAuth

**File:** `/Users/Apple/Documents/lect_backend/src/config/passport.js`

**Change:** Added an `isNewUser` boolean that is `false` by default and set to `true` only when a brand-new account is created in the "3. Create new account via Google" branch. The value is now forwarded via `done(null, { user, role, isNewUser })`.

**Why:** The frontend callback needs to know whether to route the user through the profile-completion flow (`/google-details`) or the normal returning-user flow.

---

### 2. `auth.service.js` — Three additions

**File:** `/Users/Apple/Documents/lect_backend/src/services/auth.service.js`

#### a) `verifyOtp` — Return a `setupToken`
After email OTP verification, the service now signs and returns a short-lived access token (`setupToken`) so the frontend can immediately authenticate the next step (2FA setup) without requiring a separate login.

```
return { verified: true, setupToken };
```

#### b) `getMe(id, role)` — Fetch current user profile
Looks up the user by ID in the correct repository (Institution / Lecturer / AdminUser), returns the sanitized user object. Throws 404 if not found.

#### c) `disable2FA(id, role, code)` — Disable 2FA with TOTP verification
Verifies the supplied TOTP code against the stored secret, then clears `twoFactorEnabled`, `twoFactorSecret`, and `backupCodes`. Returns `{ disabled: true }` on success.

**Exports updated** to include `getMe` and `disable2FA`.

---

### 3. `auth.controller.js` — Four additions

**File:** `/Users/Apple/Documents/lect_backend/src/controllers/auth.controller.js`

#### a) `googleCallback` — Fully rewritten
- Reads `isNewUser` from `req.user`.
- If the user has `twoFactorEnabled`, issues a `tempToken` and redirects to `/auth/google/callback?require2fa=true&tempToken=...&role=...&isNewUser=...`.
- Otherwise issues full tokens and redirects with `token=...&role=...&isNewUser=...`.
- Error redirect now goes to `/?error=google_auth_failed` (was `/login?...`).

#### b) `getMe` controller
Reads `id` and `role` from `req.user` (set by the `authenticate` middleware) and returns the result of `authService.getMe`.

#### c) `disable2FA` controller
Reads `id`, `role` from `req.user` and `code` from `req.body`, delegates to `authService.disable2FA`.

#### d) Import fix
`signTemp` is now explicitly imported from `../utils/jwt` (was missing, needed for the 2FA branch in `googleCallback`).

**Exports updated** to include `getMe` and `disable2FA`.

---

### 4. `auth.routes.js` — Two new routes

**File:** `/Users/Apple/Documents/lect_backend/src/routes/auth.routes.js`

```
GET  /api/auth/me           — returns current user profile (requires Bearer token)
POST /api/auth/2fa/disable  — disable 2FA (requires Bearer token + { code } in body)
```

Both routes use the `authenticate` middleware. The disable route uses POST (not DELETE) so the request body is handled cleanly across all HTTP clients.

---

## Frontend Changes

### 5. `authService.js` — Two new methods

**File:** `/Users/Apple/Documents/lecturing/app/lib/services/authService.js`

```js
getMe: () => api.get('/api/auth/me')
disable2FA: (body) => api.post('/api/auth/2fa/disable', body)
```

### 6. `auth/google/callback/page.js` — Full rewrite

**File:** `/Users/Apple/Documents/lecturing/app/auth/google/callback/page.js`

New routing logic:
1. If `?error` param present → show error UI.
2. If `require2fa=true` + `tempToken` → store `tempToken` in localStorage, redirect to `/verify-2fa?role=...&via=google`.
3. Otherwise store the access token, call `authService.getMe()` to get the real user flags, then route:
   - admin → `/admin`
   - new Google user → `/google-details`
   - no 2FA → `/setup-2fa`
   - 2FA enabled but onboarding incomplete → `/dashboard/onboarding`
   - fully set up → `/dashboard`

### 7. `/google-details` route

**Files:**
- `/Users/Apple/Documents/lecturing/app/google-details/page.js` (Next.js page wrapper)
- `/Users/Apple/Documents/lecturing/app/components/google-details/GoogleDetailsPage.js`
- `/Users/Apple/Documents/lecturing/app/components/google-details/GoogleDetailsPage.module.css`

Form for new Google-OAuth users to fill in institution details before continuing to 2FA setup. Fields: Institution Name (required), Institution Type (required dropdown), Website (optional), Size (optional). On submit calls `onboardingService.saveStep(1, data)` then redirects to `/setup-2fa`.

### 8. `/dashboard/settings` route

**Files:**
- `/Users/Apple/Documents/lecturing/app/dashboard/settings/page.js`
- `/Users/Apple/Documents/lecturing/app/components/dashboard/settings/SettingsPage.js`
- `/Users/Apple/Documents/lecturing/app/components/dashboard/settings/SettingsPage.module.css`

Settings page with a 2FA management section:
- Fetches current user via `authService.getMe()`, falls back to localStorage.
- If 2FA disabled: shows "Set Up 2FA" button → `/setup-2fa`.
- If 2FA enabled: shows "Reset 2FA" button + a disable form that accepts the current TOTP code and calls `authService.disable2FA({ code })`. On success updates local state and localStorage.

---

## Known Gaps / Items Requiring Attention

### Backend

1. **`verifyOtp` controller** — The controller at `auth.controller.js::verifyOtp` currently just returns the raw service result (`res.json(result)`). Now that the service returns `{ verified: true, setupToken }`, the frontend must be updated to read and store `setupToken` from the OTP verification response.

2. **JWT `signTemp` availability** — Confirm that `signTemp` is exported from `src/utils/jwt.js`. If it does not exist, it must be created (signs a short-lived token, e.g. 10 min, with a `step` claim).

3. **`onboardingService.saveStep`** — The `/google-details` page calls `onboardingService.saveStep(1, data)` which must map to `PATCH /api/onboarding/1`. Verify this endpoint exists and accepts `{ institutionName, institutionType, website, size }`.

4. **`twoFactorEnabled` / `onboardingComplete` in DB entities** — Ensure both columns exist on the `Institution` and `Lecturer` TypeORM entities. If `onboardingComplete` is missing, the routing in the Google callback page will always fall through to `/dashboard`.

5. **Lecturer Google sign-up** — The `/google-details` form only collects institution fields. If a `lecturer` signs up via Google, they should be routed to a different details form (or the `isNewUser` flow should be skipped for lecturers). Currently `isNewUser=true` for a lecturer will land them on the institution details form.

6. **`backupCodes` column type** — `disable2FA` sets `backupCodes: null`. Confirm the DB column allows null (it should, since it's nullable by design).

7. **Rate limiting on `/api/auth/2fa/disable`** — No rate limiting is applied to the disable endpoint. Consider adding brute-force protection (e.g. express-rate-limit) to prevent code enumeration.

### Frontend

8. **OTP page** — After `verifyOtp` succeeds, the OTP page must read `setupToken` from the response and store it as the access token before redirecting to `/setup-2fa`. Without this, the `GET /api/auth/setup-2fa` call (which requires auth) will fail.

9. **`verify-2fa` page `via=google` param** — The verify-2fa page should check for `?via=google` so that after successful 2FA verification it routes `isNewUser` users to `/google-details` instead of `/dashboard`. This is not yet implemented.

10. **Dashboard layout** — The new `/dashboard/settings` route needs to be added to the dashboard sidebar navigation so users can reach it.

11. **`api.js` Content-Type** — Verify the `api.post` helper sets `Content-Type: application/json` by default. If it does not, the `disable2FA` call body will not be parsed by Express's JSON middleware.
