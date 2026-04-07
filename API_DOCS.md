# Lecturiing API Documentation

> **Version:** 1.0.0 | **Base URL:** `http://localhost:5000` | **Prefix:** `/api`

This document covers every API endpoint in the Lecturiing backend. Use it as your integration reference when building the frontend.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Base URL & Headers](#2-base-url--headers)
3. [Authentication Flow](#3-authentication-flow)
4. [Auth Endpoints](#4-auth-endpoints)
5. [Jobs](#5-jobs)
6. [Lecturers](#6-lecturers)
7. [Applications](#7-applications)
8. [Shortlist](#8-shortlist)
9. [Offers](#9-offers)
10. [Contracts](#10-contracts)
11. [Hired Lecturers](#11-hired-lecturers)
12. [Documents](#12-documents)
13. [Verification (KYC)](#13-verification-kyc)
14. [Notifications](#14-notifications)
15. [Performance Reviews](#15-performance-reviews)
16. [Onboarding](#16-onboarding)
17. [Admin – Institutions](#17-admin--institutions)
18. [Admin – Lecturers](#18-admin--lecturers)
19. [Admin – Verifications](#19-admin--verifications)
20. [Admin – Platform](#20-admin--platform)
21. [Enums & Constants](#21-enums--constants)
22. [Error Responses](#22-error-responses)
23. [Real-time Events (Socket.io)](#23-real-time-events-socketio)

---

## 1. Overview

| Role | Access |
|------|--------|
| `institution` | Post jobs, hire lecturers, manage contracts, upload KYC docs |
| `lecturer` | Browse jobs, apply, receive offers, sign documents |
| `admin` | Approve lecturers, review KYC, manage platform |

**Authentication:** JWT Bearer tokens. Access tokens expire in 15 min; refresh tokens in 7 days (stored as httpOnly cookie).

---

## 2. Base URL & Headers

```
Base URL:  http://localhost:5000
API prefix: /api
```

### Required Headers

| Header | Value | When Required |
|--------|-------|---------------|
| `Authorization` | `Bearer <accessToken>` | All protected routes |
| `Content-Type` | `application/json` | POST/PATCH with JSON body |
| `Content-Type` | `multipart/form-data` | File upload endpoints |

Cookies:
- `refreshToken` — httpOnly cookie set automatically on login/OAuth. Used by `POST /api/auth/refresh`.

---

## 3. Authentication Flow

### 3.1 Institution Signup Flow

```
1. POST /api/auth/signup          → { userId }
2. POST /api/auth/verify-otp      → { verified: true }
3. GET  /api/auth/setup-2fa       → { secret, qrCodeUrl, backupCodes[] }
   (scan QR in Google Authenticator / Authy)
4. POST /api/auth/confirm-2fa     → { accessToken, user }
   (sets refreshToken cookie)
5. PATCH /api/onboarding/1  →  /2  →  /3  →  /4   (complete profile)
```

### 3.2 Login Flow

```
1. POST /api/auth/login
   ├── 2FA disabled → { accessToken, user }  (sets refreshToken cookie)
   └── 2FA enabled  → { require2fa: true, tempToken }

2. If require2fa:
   POST /api/auth/verify-2fa  { tempToken, code }
   → { accessToken, user }  (sets refreshToken cookie)
```

### 3.3 Google OAuth Flow

```
1. Redirect browser to:
   GET /api/auth/google?role=institution   (or ?role=lecturer)

2. User signs in with Google → backend redirects to:
   {FRONTEND_URL}/auth/google/callback?token=<accessToken>&role=institution

3. Frontend reads token from URL, stores it.
   Optionally call:
   GET /api/auth/google/session  → { accessToken, role, id }
   to refresh using the cookie.
```

### 3.4 Token Refresh

```
POST /api/auth/refresh
(sends refreshToken cookie automatically)
→ { accessToken }
```

---

## 4. Auth Endpoints

### POST `/api/auth/signup`
Register a new institution account.

**Auth:** None

**Request Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `institutionName` | string | ✅ | Min 2 chars |
| `institutionType` | string | ✅ | See [InstitutionType enum](#21-enums--constants) |
| `email` | string | ✅ | Valid email |
| `username` | string | ✅ | Min 3 chars, unique |
| `password` | string | ✅ | Min 8 chars |
| `confirmPassword` | string | ✅ | Must match password |

**Response `201`:**
```json
{ "userId": "uuid" }
```

---

### POST `/api/auth/login`
Log in as institution, lecturer, or admin.

**Auth:** None

**Request Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `username` | string | ✅ | Username or email |
| `password` | string | ✅ | |
| `role` | string | ✅ | `institution` \| `lecturer` \| `admin` |

**Response `200` (no 2FA):**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "uuid",
    "name": "MIT",
    "email": "admin@mit.edu",
    "role": "institution",
    "twoFactorEnabled": false,
    "emailVerified": true,
    "onboardingComplete": false
  }
}
```

**Response `200` (2FA required):**
```json
{
  "require2fa": true,
  "tempToken": "eyJ..."
}
```

---

### POST `/api/auth/verify-otp`
Verify email after signup.

**Auth:** None

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| `userId` | string (UUID) | ✅ |
| `otp` | string | ✅ | 6-digit code sent to email |

**Query Params:**
| Param | Default | Notes |
|-------|---------|-------|
| `role` | `institution` | `institution` \| `lecturer` |

**Response `200`:**
```json
{ "verified": true }
```

---

### GET `/api/auth/setup-2fa`
Generate TOTP secret and QR code for authenticator app setup.

**Auth:** Bearer token required

**Response `200`:**
```json
{
  "secret": "BASE32SECRET",
  "qrCodeUrl": "data:image/png;base64,...",
  "backupCodes": ["ABCD1234", "EFGH5678", "..."]
}
```
> Save `backupCodes` — they are shown only once.

---

### POST `/api/auth/confirm-2fa`
Confirm 2FA setup by verifying first TOTP code.

**Auth:** Bearer token required

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| `code` | string | ✅ | 6-digit TOTP code from app |

**Response `200`:**
```json
{
  "accessToken": "eyJ...",
  "user": { "id": "uuid", "twoFactorEnabled": true, "..." : "..." }
}
```

---

### POST `/api/auth/verify-2fa`
Complete login when 2FA is required.

**Auth:** None

**Request Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `tempToken` | string | ✅ | From login response |
| `code` | string | ☑️ | TOTP code (provide one of code or backupCode) |
| `backupCode` | string | ☑️ | One-time backup code |

**Response `200`:**
```json
{
  "accessToken": "eyJ...",
  "user": { "id": "uuid", "role": "institution", "..." : "..." }
}
```

---

### POST `/api/auth/refresh`
Get a new access token using the refresh cookie.

**Auth:** `refreshToken` httpOnly cookie (sent automatically)

**Response `200`:**
```json
{ "accessToken": "eyJ..." }
```

---

### POST `/api/auth/logout`
Clear the refresh cookie.

**Auth:** None

**Response `200`:**
```json
{ "ok": true }
```

---

### GET `/api/auth/google?role=institution`
Initiate Google OAuth. Redirects browser to Google sign-in.

**Auth:** None

**Query Params:**
| Param | Values | Default |
|-------|--------|---------|
| `role` | `institution` \| `lecturer` | `institution` |

> This is a browser redirect, not an AJAX call. Point the browser to this URL.

---

### GET `/api/auth/google/callback`
OAuth callback (handled by backend — do not call directly).

After success, browser is redirected to:
```
{FRONTEND_URL}/auth/google/callback?token=<accessToken>&role=<role>
```

---

### GET `/api/auth/google/session`
Exchange the refresh cookie for a fresh access token after Google redirect.

**Auth:** `refreshToken` cookie

**Response `200`:**
```json
{
  "accessToken": "eyJ...",
  "role": "institution",
  "id": "uuid"
}
```

---

## 5. Jobs

> All routes require **institution** role.

### GET `/api/jobs`
List institution's jobs.

**Auth:** Bearer (institution)

**Query Params:**
| Param | Type | Notes |
|-------|------|-------|
| `status` | string | `active` \| `draft` \| `closed` |
| `field` | string | Filter by subject field |
| `page` | number | Default: 1 |
| `pageSize` | number | Default: 20 |

**Response `200`:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "institutionId": "uuid",
      "title": "Lecturer in Computer Science",
      "field": "Computer Science",
      "description": "We are looking for...",
      "requirements": ["PhD preferred", "5+ years teaching"],
      "status": "active",
      "contractType": "Part-time",
      "duration": "6 months",
      "budgetMin": 2000,
      "budgetMax": 4000,
      "currency": "USD",
      "deadline": "2026-06-01T00:00:00.000Z",
      "linkedDocumentIds": ["uuid1", "uuid2"],
      "applicantCount": 12,
      "createdAt": "2026-03-01T00:00:00.000Z",
      "updatedAt": "2026-03-15T00:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 20
}
```

---

### POST `/api/jobs`
Create a new job posting.

**Auth:** Bearer (institution)

**Request Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | ✅ | Min 2 chars |
| `field` | string | ✅ | |
| `description` | string | ✅ | Min 10 chars |
| `requirements` | string[] | ☑️ | Array of strings |
| `contractType` | string | ✅ | See [ContractType enum](#21-enums--constants) |
| `duration` | string | ☑️ | e.g. `"6 months"` |
| `budgetMin` | number | ✅ | |
| `budgetMax` | number | ✅ | |
| `currency` | string | ☑️ | Default: `"USD"` |
| `deadline` | string | ☑️ | ISO 8601 date |
| `status` | string | ☑️ | `"draft"` \| `"active"` — default: `"draft"` |
| `linkedDocumentIds` | string[] | ☑️ | Document UUIDs to attach |

**Response `201`:** Created job object (same shape as GET item)

---

### GET `/api/jobs/:id`
Get a single job.

**Auth:** Bearer (institution)

**Response `200`:** Job object

---

### PATCH `/api/jobs/:id`
Update a job (partial update — all fields optional).

**Auth:** Bearer (institution)

**Request Body:** Any subset of job creation fields

**Response `200`:** Updated job object

---

### DELETE `/api/jobs/:id`

**Auth:** Bearer (institution)

**Response `200`:**
```json
{ "ok": true }
```

---

### GET `/api/jobs/:id/applicants`
List applicants for a specific job.

**Auth:** Bearer (institution)

**Query Params:** `page`, `pageSize`

**Response `200`:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "jobId": "uuid",
      "lecturerId": "uuid",
      "status": "pending",
      "coverNote": "I am interested in...",
      "appliedAt": "2026-03-20T00:00:00.000Z",
      "lecturer": {
        "id": "uuid",
        "name": "Dr. John Doe",
        "field": "Computer Science",
        "rating": 4.8,
        "hourlyRate": 75
      }
    }
  ],
  "total": 12
}
```

---

### PATCH `/api/jobs/:id/documents`
Link or replace contract documents for this job.

**Auth:** Bearer (institution)

**Request Body:**
```json
{ "documentIds": ["uuid1", "uuid2"] }
```

**Response `200`:** Updated job object

---

## 6. Lecturers

> Requires any authenticated role.

### GET `/api/lecturers`
Search the lecturer directory (only approved + active lecturers).

**Auth:** Bearer (any role)

**Query Params:**
| Param | Type | Notes |
|-------|------|-------|
| `search` | string | Searches name, field, bio |
| `field` | string | Exact match on academic field |
| `qualification` | string | See [Qualification enum](#21-enums--constants) |
| `country` | string | |
| `timezone` | string | e.g. `GMT+1` |
| `maxRate` | number | Max hourly rate filter |
| `availability` | string | `Full-time` \| `Part-time` |
| `page` | number | Default: 1 |
| `pageSize` | number | Default: 20 |

**Response `200`:**
```json
{
  "lecturers": [
    {
      "id": "uuid",
      "name": "Dr. Sarah Johnson",
      "initials": "SJ",
      "color": "#6366f1",
      "title": "Associate Professor",
      "field": "Computer Science",
      "qualification": "PhD",
      "yearsOfExperience": 10,
      "country": "Ghana",
      "timezone": "GMT+0",
      "hourlyRate": 75,
      "currency": "USD",
      "rating": 4.8,
      "reviewCount": 23,
      "availability": "Part-time",
      "specializations": ["Machine Learning", "Algorithms"],
      "bio": "Experienced lecturer with 10 years...",
      "languages": ["English", "French"],
      "certifications": ["AWS Solutions Architect"],
      "approvalStatus": "approved",
      "accountStatus": "active",
      "joinedAt": "2025-01-15T00:00:00.000Z"
    }
  ],
  "total": 142,
  "page": 1,
  "pageSize": 20
}
```

---

### GET `/api/lecturers/:id`
Get full lecturer profile.

**Auth:** Bearer (any role)

**Response `200`:** Full lecturer object including `education`, `workExperience`, `portfolio`, `teachingPhilosophy`

---

## 7. Applications

### POST `/api/applications`
Lecturer applies to a job.

**Auth:** Bearer (lecturer)

**Request Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `jobId` | string (UUID) | ✅ | Must be an active job |
| `coverNote` | string | ☑️ | Optional cover letter |

**Response `201`:**
```json
{
  "id": "uuid",
  "jobId": "uuid",
  "lecturerId": "uuid",
  "institutionId": "uuid",
  "status": "pending",
  "coverNote": "I am excited to apply...",
  "appliedAt": "2026-03-20T00:00:00.000Z"
}
```

---

### GET `/api/applications`
List applications.
- Institution sees applications for their jobs
- Lecturer sees their own applications

**Auth:** Bearer (institution or lecturer)

**Query Params:**
| Param | Type | Notes |
|-------|------|-------|
| `jobId` | UUID | Filter by job |
| `status` | string | Filter by status |
| `page` | number | Default: 1 |
| `pageSize` | number | Default: 20 |

**Response `200`:**
```json
{
  "applications": [ "..." ],
  "total": 8
}
```

---

### PATCH `/api/applications/:id/status`
Update application status (institution only).

**Auth:** Bearer (institution)

**Request Body:**
```json
{ "status": "shortlisted" }
```

Valid statuses: `pending` | `shortlisted` | `interview_scheduled` | `declined` | `offer_sent`

**Response `200`:** Updated application object

---

## 8. Shortlist

> All routes require **institution** role.

### GET `/api/shortlist`
Get all shortlisted candidates with their linked jobs.

**Auth:** Bearer (institution)

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "institutionId": "uuid",
    "lecturerId": "uuid",
    "jobId": "uuid",
    "status": "new",
    "interviewDate": null,
    "calendlyLink": null,
    "addedAt": "2026-03-22T00:00:00.000Z",
    "lecturer": { "id": "uuid", "name": "Dr. John Doe", "field": "Business" },
    "job": { "id": "uuid", "title": "Business Lecturer" }
  }
]
```

---

### POST `/api/shortlist`
Add a lecturer to the shortlist.

**Auth:** Bearer (institution)

**Request Body:**
```json
{
  "lecturerId": "uuid",
  "jobId": "uuid"
}
```

**Response `201`:** Shortlist entry object

---

### DELETE `/api/shortlist/:id`
Remove from shortlist.

**Auth:** Bearer (institution)

**Response `200`:**
```json
{ "ok": true }
```

---

### PATCH `/api/shortlist/:id`
Update shortlist entry status or details.

**Auth:** Bearer (institution)

**Request Body (all optional):**
```json
{
  "status": "interview_scheduled",
  "interviewDate": "2026-04-10T14:00:00.000Z",
  "calendlyLink": "https://calendly.com/..."
}
```

**Response `200`:** Updated shortlist entry

---

### POST `/api/shortlist/:id/schedule`
Schedule an interview for a shortlisted candidate.

**Auth:** Bearer (institution)

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| `interviewDate` | string (ISO) | ✅ |
| `calendlyLink` | string (URL) | ☑️ |

**Response `200`:** Updated shortlist entry with `status: "interview_scheduled"`

---

## 9. Offers

### GET `/api/offers`
List offers.
- Institution sees offers they sent
- Lecturer sees offers they received

**Auth:** Bearer (institution or lecturer)

**Response `200`:** Array of offer objects with related `lecturer`, `job`, `institution`

---

### POST `/api/offers`
Send a job offer to a lecturer.

**Auth:** Bearer (institution)

**Request Body:**
```json
{
  "lecturerId": "uuid",
  "jobId": "uuid"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "institutionId": "uuid",
  "lecturerId": "uuid",
  "jobId": "uuid",
  "status": "pending",
  "offeredAt": "2026-03-25T00:00:00.000Z",
  "sentDocumentIds": [],
  "signedDocumentIds": []
}
```
> Also triggers email notification and in-app notification to the lecturer.

---

### PATCH `/api/offers/:id/status`
Lecturer accepts or declines an offer.

**Auth:** Bearer (lecturer)

**Request Body:**
```json
{ "status": "approved" }
```

Valid values: `approved` | `declined`

**Response `200`:** Updated offer object
> Triggers notification to the institution.

---

### POST `/api/offers/:id/send-documents`
Institution sends documents to lecturer for signing.

**Auth:** Bearer (institution)

**Request Body:**
```json
{ "documentIds": ["uuid1", "uuid2"] }
```

**Response `200`:** Updated offer with `sentDocumentIds`

---

### PATCH `/api/offers/:id/documents`
Lecturer marks documents as signed.

**Auth:** Bearer (lecturer)

**Request Body:**
```json
{ "signedDocumentIds": ["uuid1", "uuid2"] }
```

**Response `200`:** Updated offer with `signedDocumentIds`
> Triggers `doc_signed` notification to institution.

---

## 10. Contracts

> All routes require **institution** role.

### GET `/api/contracts`
List institution's contracts with lecturer and job details.

**Auth:** Bearer (institution)

**Response `200`:** Array of contract objects

---

### POST `/api/contracts`
Create a contract from an accepted offer.

**Auth:** Bearer (institution)

**Request Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `offerId` | UUID | ✅ | Must be an approved offer |
| `contractType` | string | ✅ | See ContractType enum |
| `amount` | number | ✅ | Monthly amount |
| `currency` | string | ☑️ | Default: `USD` |
| `startDate` | string (ISO) | ✅ | |
| `endDate` | string (ISO) | ✅ | |

**Response `201`:** Contract object

---

### GET `/api/contracts/:id`
Get a single contract with full details.

**Auth:** Bearer (institution)

**Response `200`:** Contract object with `lecturer` and `job` relations

---

### PATCH `/api/contracts/:id/status`
Update contract status.

**Auth:** Bearer (institution)

**Request Body:**
```json
{ "status": "active" }
```

Valid: `active` | `pending_acceptance` | `completed` | `disputed` | `draft`

---

### POST `/api/contracts/:id/escrow`
Initiate escrow deposit (Step 1 of payment).

**Auth:** Bearer (institution)

**Request Body:**
```json
{ "amount": 4000 }
```

**Response `200`:**
```json
{
  "contract": { "id": "uuid", "escrowStatus": "in_escrow", "escrowAmount": 4000, "...": "..." },
  "payment": {
    "success": true,
    "transactionId": "demo_escrow_1234567890",
    "amount": 4000,
    "fee": 80,
    "currency": "USD",
    "status": "in_escrow"
  }
}
```
> Platform fee is 2% of escrow amount.

---

### PATCH `/api/contracts/:id/escrow/release`
Release escrow funds to lecturer.

**Auth:** Bearer (institution)

**Response `200`:**
```json
{
  "contract": { "escrowStatus": "released", "fundsReleasedAt": "...", "...": "..." },
  "payment": { "success": true, "payout": 3920, "fee": 80, "...": "..." }
}
```

---

### PATCH `/api/contracts/:id/escrow/dispute`
Open a payment dispute.

**Auth:** Bearer (institution)

**Request Body:**
```json
{ "reason": "Lecturer did not complete the engagement" }
```

**Response `200`:**
```json
{
  "contract": { "escrowStatus": "disputed", "status": "disputed", "...": "..." },
  "dispute": { "success": true, "disputeId": "demo_dispute_...", "status": "disputed" }
}
```

---

## 11. Hired Lecturers

> All routes require **institution** role.

### GET `/api/hired`
List all hired lecturers with job and contract details.

**Auth:** Bearer (institution)

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "institutionId": "uuid",
    "lecturerId": "uuid",
    "jobId": "uuid",
    "contractId": "uuid",
    "contractType": "Part-time",
    "hourlyRate": 75,
    "currency": "USD",
    "startDate": "2026-04-01T00:00:00.000Z",
    "endDate": "2026-10-01T00:00:00.000Z",
    "status": "active",
    "hiredAt": "2026-03-28T00:00:00.000Z",
    "lecturer": { "id": "uuid", "name": "Dr. Sarah Johnson", "...": "..." },
    "job": { "id": "uuid", "title": "CS Lecturer" }
  }
]
```

---

### POST `/api/hired`
Finalise a hire from a completed contract.

**Auth:** Bearer (institution)

**Request Body:**
```json
{ "contractId": "uuid" }
```

**Response `201`:** HiredLecturer object

---

## 12. Documents

> All routes require **institution** role.

### GET `/api/documents`
List institution's contract document library.

**Auth:** Bearer (institution)

**Query Params:**
| Param | Type | Notes |
|-------|------|-------|
| `category` | string | `Contract` \| `NDA` \| `IP` \| `Policy` |

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "institutionId": "uuid",
    "title": "Standard Employment Contract",
    "category": "Contract",
    "description": "Standard terms for full-time engagement",
    "pages": 8,
    "fileUrl": "https://res.cloudinary.com/...",
    "mimeType": "application/pdf",
    "createdAt": "2026-01-10T00:00:00.000Z"
  }
]
```

---

### POST `/api/documents`
Upload a document to the library.

**Auth:** Bearer (institution)

**Request:** `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `file` | File | ✅ | Max 20MB |
| `title` | string | ✅ | |
| `category` | string | ✅ | `Contract` \| `NDA` \| `IP` \| `Policy` |
| `description` | string | ☑️ | |
| `pages` | number | ☑️ | Default: 1 |

**Response `201`:** Document object with Cloudinary `fileUrl`

---

### GET `/api/documents/:id`
Get document metadata (includes `fileUrl` for preview/download).

**Auth:** Bearer (institution)

---

### PATCH `/api/documents/:id`
Update document metadata (title, category, description).

**Auth:** Bearer (institution)

**Request Body:** Any subset of non-file fields

---

### DELETE `/api/documents/:id`
Delete document and remove from Cloudinary.

**Auth:** Bearer (institution)

**Response `200`:**
```json
{ "ok": true }
```

---

## 13. Verification (KYC)

> All routes require **institution** role.

### GET `/api/verification`
Get current verification status and submitted documents.

**Auth:** Bearer (institution)

**Response `200`:**
```json
{
  "verificationStatus": "in_review",
  "documents": [
    {
      "id": "uuid",
      "label": "certificate_of_incorporation",
      "fileUrl": "https://res.cloudinary.com/...",
      "status": "in_review",
      "submittedAt": "2026-03-10T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/verification/submit`
Submit KYC documents for review.

**Auth:** Bearer (institution)

**Request:** `multipart/form-data`

Upload up to 5 files. Each file's `fieldname` becomes the document `label`:

| Fieldname | Document |
|-----------|----------|
| `certificate_of_incorporation` | Certificate of Incorporation |
| `tax_certificate` | Tax Identification Certificate |
| `signatory_id` | Authorized Signatory ID |
| `proof_of_address` | Proof of Address |
| `letterhead` | Official Letterhead Sample |

**Response `200`:**
```json
{
  "verificationStatus": "in_review",
  "documents": [ "..." ]
}
```

---

### PATCH `/api/verification/resubmit`
Resubmit after a failed verification.

**Auth:** Bearer (institution)

**Response `200`:**
```json
{ "verificationStatus": "in_review" }
```

---

## 14. Notifications

### GET `/api/notifications`
List notifications for the logged-in user.

**Auth:** Bearer (any role)

**Query Params:** `page`, `pageSize`

**Response `200`:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "recipientId": "uuid",
      "recipientRole": "institution",
      "type": "application",
      "read": false,
      "title": "New application received",
      "body": "A lecturer applied for \"CS Lecturer\"",
      "href": "/dashboard/jobs/uuid/applicants",
      "actorInitials": "SJ",
      "actorColor": "#6366f1",
      "createdAt": "2026-03-25T10:00:00.000Z"
    }
  ],
  "total": 15,
  "unread": 3
}
```

---

### PATCH `/api/notifications/:id/read`
Mark a notification as read.

**Auth:** Bearer (any role)

**Response `200`:**
```json
{ "ok": true }
```

---

### PATCH `/api/notifications/read-all`
Mark all notifications as read.

**Auth:** Bearer (any role)

**Response `200`:**
```json
{ "ok": true }
```

---

### DELETE `/api/notifications/:id`
Delete a notification.

**Auth:** Bearer (any role)

**Response `200`:**
```json
{ "ok": true }
```

---

## 15. Performance Reviews

### GET `/api/reviews`
List reviews submitted by the institution.

**Auth:** Bearer (institution)

**Query Params:**
| Param | Type | Notes |
|-------|------|-------|
| `lecturerId` | UUID | Filter by specific lecturer |

**Response `200`:** Array of review objects

---

### POST `/api/reviews`
Submit a performance review for a lecturer.

**Auth:** Bearer (institution)

**Request Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `lecturerId` | UUID | ✅ | |
| `contractId` | UUID | ✅ | Must be the institution's contract |
| `overallRating` | number | ✅ | 1–5 |
| `categories.teaching` | number | ✅ | 1–5 |
| `categories.punctuality` | number | ✅ | 1–5 |
| `categories.communication` | number | ✅ | 1–5 |
| `categories.studentFeedback` | number | ✅ | 1–5 |
| `review` | string | ✅ | Min 10 chars |

**Request Body Example:**
```json
{
  "lecturerId": "uuid",
  "contractId": "uuid",
  "overallRating": 5,
  "categories": {
    "teaching": 5,
    "punctuality": 4,
    "communication": 5,
    "studentFeedback": 5
  },
  "review": "Dr. Johnson was exceptional. Students loved her teaching style."
}
```

**Response `201`:** Review object
> Also updates the lecturer's average `rating` and `reviewCount`.

---

### GET `/api/reviews/:lecturerId`
Get all reviews for a specific lecturer (public).

**Auth:** Bearer (any role)

**Response `200`:** Array of review objects

---

## 16. Onboarding

> Requires **institution** role. Complete all 4 steps after signup.

### PATCH `/api/onboarding/:step`
Update onboarding step. Steps: `1`, `2`, `3`, `4`.

**Auth:** Bearer (institution)

#### Step 1 — Institution Profile
```json
{
  "institutionName": "MIT Online",
  "institutionType": "University",
  "website": "https://mit.edu",
  "size": "2000-10000"
}
```

#### Step 2 — Location & Contact
```json
{
  "country": "USA",
  "address": "77 Massachusetts Ave, Cambridge",
  "contactName": "Jane Smith",
  "contactEmail": "jane@mit.edu",
  "contactPhone": "+1-617-253-1000"
}
```

#### Step 3 — Hiring Preferences
```json
{
  "fields": ["Computer Science", "Mathematics"],
  "budgetMin": 2000,
  "budgetMax": 5000,
  "contractTypes": ["Part-time", "Contract"],
  "preferOnline": true
}
```

#### Step 4 — Complete Onboarding
Send empty body `{}`. Sets `onboardingComplete: true`.

**Response `200`:** Updated institution profile (sensitive fields stripped)

---

## 17. Admin – Institutions

> All routes require **admin** role.

### GET `/api/admin/institutions`

**Query Params:**
| Param | Type | Notes |
|-------|------|-------|
| `status` | string | `active` \| `suspended` |
| `verificationStatus` | string | `verified` \| `in_review` \| `failed` \| `pending` |
| `search` | string | Searches name and email |
| `page` | number | |
| `pageSize` | number | |

**Response `200`:**
```json
{ "institutions": [ "..." ], "total": 42 }
```

---

### GET `/api/admin/institutions/:id`
Get full institution detail.

**Response `200`:** Institution object (sensitive fields stripped)

---

### PATCH `/api/admin/institutions/:id/status`
Suspend or reactivate an institution.

**Request Body:**
```json
{ "status": "suspended", "reason": "Policy violation" }
```

**Response `200`:**
```json
{ "ok": true }
```

---

## 18. Admin – Lecturers

> All routes require **admin** role.

### GET `/api/admin/lecturers`

**Query Params:** `approvalStatus`, `accountStatus`, `page`, `pageSize`

**Response `200`:**
```json
{ "lecturers": [ "..." ], "total": 87 }
```

---

### GET `/api/admin/lecturers/:id`
Full lecturer profile.

---

### PATCH `/api/admin/lecturers/:id/approval`
Approve or reject a lecturer.

**Request Body:**
```json
{ "approvalStatus": "approved" }
```

or

```json
{ "approvalStatus": "rejected", "reason": "Incomplete credentials" }
```

**Response `200`:**
```json
{ "ok": true }
```

---

### PATCH `/api/admin/lecturers/:id/status`
Suspend or reactivate a lecturer account.

**Request Body:**
```json
{ "status": "suspended", "reason": "Multiple complaints" }
```

**Response `200`:**
```json
{ "ok": true }
```

---

## 19. Admin – Verifications

> All routes require **admin** role.

### GET `/api/admin/verifications`
List institutions that have submitted KYC documents.

**Query Params:** `status` (`in_review` \| `verified` \| `failed`), `page`, `pageSize`

**Response `200`:**
```json
{ "institutions": [ "..." ], "total": 8 }
```

---

### PATCH `/api/admin/verifications/:institutionId`
Approve or reject an institution's KYC.

**Request Body:**
```json
{ "decision": "verified", "note": "All documents verified successfully." }
```

or

```json
{ "decision": "failed", "note": "Tax certificate is expired." }
```

**Response `200`:**
```json
{ "ok": true, "verificationStatus": "verified" }
```
> Sends email notification and in-app notification to the institution.

---

## 20. Admin – Platform

> All routes require **admin** role.

### GET `/api/admin/stats`
Platform-wide statistics.

**Response `200`:**
```json
{
  "institutions": 120,
  "lecturers": 850,
  "jobs": 340,
  "contracts": 215,
  "activeContracts": 89
}
```

---

### GET `/api/admin/activity`
Recent platform activity feed.

**Query Params:** `limit` (default: 20)

**Response `200`:** Array of recent notification objects

---

### GET `/api/admin/analytics`
Aggregated revenue analytics.

**Response `200`:**
```json
{
  "totalRevenue": 4320.50,
  "totalContracts": 215
}
```

---

### GET `/api/admin/moderation`
Moderation queue: pending lecturer approvals + pending KYC reviews.

**Response `200`:**
```json
{
  "pendingLecturers": 12,
  "pendingVerifications": 5,
  "items": [ "..." ]
}
```

---

## 21. Enums & Constants

### Roles
| Value | Description |
|-------|-------------|
| `institution` | Educational institution account |
| `lecturer` | Lecturer account |
| `admin` | Platform administrator |

### InstitutionType
`University` | `College` | `High School` | `Primary School` | `Vocational Institute` | `Online Academy` | `Other`

### AccountStatus
| Value | Description |
|-------|-------------|
| `active` | Account in good standing |
| `suspended` | Account suspended by admin |

### VerificationStatus
| Value | Description |
|-------|-------------|
| `pending` | Not yet submitted |
| `in_review` | Submitted, under review |
| `verified` | KYC approved |
| `failed` | KYC rejected |

### ApprovalStatus (Lecturers)
| Value | Description |
|-------|-------------|
| `approved` | Lecturer approved and visible |
| `pending` | Awaiting admin review |
| `rejected` | Application rejected |

### Plan
`Starter` | `Professional` | `Enterprise`

### JobStatus
| Value | Description |
|-------|-------------|
| `active` | Publicly visible, accepting applications |
| `draft` | Hidden, not published |
| `closed` | No longer accepting applications |

### ContractType
`Full-time` | `Part-time` | `Contract` | `Hourly`

### Availability
`Full-time` | `Part-time`

### Qualification
`Bachelor's` | `Master's / MSc` | `PhD` | `Professional Cert.`

### ApplicationStatus
| Value | Description |
|-------|-------------|
| `pending` | Just submitted |
| `shortlisted` | Added to institution shortlist |
| `interview_scheduled` | Interview arranged |
| `declined` | Application rejected |
| `offer_sent` | Offer extended to this applicant |

### ShortlistStatus
`new` | `interview_scheduled` | `offer_sent` | `accepted` | `rejected`

### OfferStatus
`pending` | `approved` | `declined`

### ContractStatus
`active` | `pending_acceptance` | `completed` | `disputed` | `draft`

### EscrowStatus
| Value | Description |
|-------|-------------|
| `not_initiated` | No escrow created yet |
| `in_escrow` | Funds deposited and held |
| `released` | Funds released to lecturer |
| `disputed` | Dispute open — admin review |

### HireStatus
`active` | `starting_soon` | `completed`

### DocumentCategory
`Contract` | `NDA` | `IP` | `Policy`

### NotificationType
| Value | Triggered By |
|-------|-------------|
| `application` | Lecturer applies to a job |
| `offer_accepted` | Lecturer accepts an offer |
| `offer_declined` | Lecturer declines an offer |
| `doc_signed` | Lecturer signs documents |
| `verification` | Admin reviews KYC |
| `shortlist` | Lecturer shortlisted |

### Fields (Academic)
`Computer Science` | `Business` | `Engineering` | `Mathematics` | `Humanities` | `Arts & Design` | `Medicine` | `Law` | `Education`

### Countries
`Ghana` | `Nigeria` | `Kenya` | `South Africa` | `Germany` | `UK` | `USA` | `India` | `Brazil` | `Canada`

### Timezones
`GMT-8` | `GMT-5` | `GMT-3` | `GMT+0` | `GMT+1` | `GMT+2` | `GMT+3` | `GMT+5:30` | `GMT+8`

---

## 22. Error Responses

All errors follow this shape:

```json
{
  "message": "Human-readable error description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `400` | Bad request / business logic error |
| `401` | Not authenticated (missing/invalid token) |
| `403` | Authenticated but not authorized (wrong role, email not verified) |
| `404` | Resource not found |
| `422` | Validation error — body does not match schema |
| `500` | Internal server error |

### Validation Error (422)
```json
{
  "message": "Validation error",
  "errors": {
    "email": ["Invalid email"],
    "password": ["String must contain at least 8 character(s)"]
  }
}
```

---

## 23. Real-time Events (Socket.io)

Connect to `http://localhost:5000` using Socket.io client.

### Connection
```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');

// Join your user room after login
socket.emit('join', userId);
```

### Incoming Events

| Event | Payload | Triggered When |
|-------|---------|----------------|
| `notification:new` | `Notification` object | Any new notification is created |
| `application:status` | `{ applicationId, status }` | Application status changes |
| `offer:update` | `{ offerId, status }` | Offer accepted or declined |
| `document:signed` | `{ offerId, signedDocumentIds }` | Lecturer signs documents |
| `verification:update` | `{ institutionId, status }` | KYC decision made |

### Example Frontend Handler
```js
socket.on('notification:new', (notification) => {
  // Add to notification bell, show toast
  addNotification(notification);
});
```

---

*Generated for Lecturiing platform — 2026-03-30*
