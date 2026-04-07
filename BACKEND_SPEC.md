# Lecturiing – Backend Specification

> Auto-generated from full codebase analysis. Use this document to build the complete backend for the Lecturiing platform.

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Routes & Page Structure](#2-routes--page-structure)
3. [Authentication & 2FA Flows](#3-authentication--2fa-flows)
4. [Data Models](#4-data-models)
5. [Core Workflows](#5-core-workflows)
6. [Forms & Input Structures](#6-forms--input-structures)
7. [API Endpoints](#7-api-endpoints)
8. [Enums & Constants](#8-enums--constants)
9. [Real-time & Integrations](#9-real-time--integrations)
10. [Recommended Stack](#10-recommended-stack)

---

## 1. Application Overview

**Lecturiing** is a two-sided marketplace connecting educational institutions with qualified lecturers.

| Role | Description |
|------|-------------|
| `institution` | Registers, posts jobs, hires lecturers, manages contracts |
| `lecturer` | Browses jobs, applies, receives offers, signs contracts |
| `admin` | Manages the platform, approves verifications, moderates content |

**Tech (Frontend):** Next.js 16 (App Router), React 19, client-side state only (all mock data — no backend yet).

---

## 2. Routes & Page Structure

### Public (Unauthenticated)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `LoginPage` | Dual-role login (admin \| institution) |
| `/signup` | `SignupForm` | Institution registration |
| `/verify-otp` | `OtpPage` | Email OTP verification post-signup |
| `/setup-2fa` | `Setup2FAPage` | TOTP QR code setup via authenticator app |
| `/verify-2fa` | `Verify2FAPage` | 2FA code or backup-code verification on login |

### Institution Dashboard (Protected – role: `institution`)

| Route | Purpose |
|-------|---------|
| `/dashboard` | Overview: stats, quick actions, recent activity |
| `/dashboard/jobs` | List jobs (tabs: all / active / draft / closed) |
| `/dashboard/jobs/new` | Create new job posting |
| `/dashboard/jobs/[id]/applicants` | Applicants for a specific job |
| `/dashboard/shortlist` | Shortlisted candidates + interview scheduling |
| `/dashboard/offers` | Job offers + document e-signature workflow |
| `/dashboard/contracts` | Active contracts + escrow management |
| `/dashboard/hired` | Completed hires with signed documents |
| `/dashboard/lecturers` | Search & filter lecturer directory |
| `/dashboard/lecturers/[id]` | Full lecturer profile |
| `/dashboard/onboarding` | 4-step institution setup wizard |
| `/dashboard/verification` | KYC document upload |
| `/dashboard/documents` | Contract document library |
| `/dashboard/performance` | Performance reviews for hired lecturers |
| `/dashboard/notifications` | Notification center |

### Admin Panel (Protected – role: `admin`)

| Route | Purpose |
|-------|---------|
| `/admin` | Platform overview: institutions, lecturers, jobs, revenue |
| `/admin/institutions` | Manage all institutions |
| `/admin/institutions/[id]` | Institution detail |
| `/admin/lecturers` | Approve / manage lecturers |
| `/admin/lecturers/[id]` | Lecturer detail |
| `/admin/verifications` | Review institution KYC |
| `/admin/moderation` | Content moderation queue |
| `/admin/analytics` | Platform analytics |
| `/admin/settings` | Admin settings |

---

## 3. Authentication & 2FA Flows

### 3.1 Login Flow

```
POST /api/auth/login  { username, password, role }
        │
        ▼
  Check credentials
        │
  ─── 2FA enabled? ───────────────────┐
        │ Yes                          │ No
        ▼                             ▼
  Return { require2fa: true }    Return JWT + redirect
        │
        ▼
  Client redirects to /verify-2fa?role={role}
        │
  POST /api/auth/verify-2fa  { code | backupCode, tempToken }
        │
        ▼
  Return JWT + user object
        │
  Redirect to /dashboard or /admin
```

### 3.2 Signup Flow (Institution)

```
POST /api/auth/signup  { institutionName, institutionType, email, username, password }
        │
        ▼
  Create unverified institution account
  Send OTP to email
  Return { userId, message }
        │
        ▼
  Client → /verify-otp
  POST /api/auth/verify-otp  { userId, otp }
        │
        ▼
  Mark email verified
  Return { verified: true }
        │
        ▼
  Client → /setup-2fa
  GET /api/auth/setup-2fa  (authenticated)
        │
        ▼
  Generate TOTP secret
  Return { secret, qrCodeUrl, backupCodes[] }
        │
        ▼
  Client shows QR code (Google Authenticator, Authy, Microsoft Authenticator)
  POST /api/auth/confirm-2fa  { code }
        │
        ▼
  Verify code against secret
  Save secret + backup codes (hashed) to DB
  Mark 2FA enabled
        │
        ▼
  Return JWT → redirect to /dashboard
```

### 3.3 2FA Implementation Details

| Property | Detail |
|----------|--------|
| Algorithm | TOTP (RFC 6238) |
| Library | `speakeasy` or `otplib` |
| Code length | 6 digits |
| Window | ±1 step (30s) |
| Backup codes | 8 × 8-character alphanumeric, hashed with bcrypt |
| QR label | `Lecturiing:{username}` |
| Issuer | `Lecturiing` |

**Supported apps:** Google Authenticator, Authy, Microsoft Authenticator.

### 3.4 Token Strategy

| Token | Expiry | Storage |
|-------|--------|---------|
| Access JWT | 15 min | Memory / httpOnly cookie |
| Refresh JWT | 7 days | httpOnly cookie |
| Temp (pre-2FA) JWT | 5 min | Memory |
| OTP (email) | 10 min | DB (hashed) |

---

## 4. Data Models

### 4.1 User / Institution

```ts
interface Institution {
  id: string;                        // UUID
  name: string;
  initials: string;                  // Derived (e.g. "MIT")
  color: string;                     // Avatar background hex
  type: InstitutionType;             // See enum
  country: string;
  city: string;
  address: string;
  website?: string;
  linkedIn?: string;
  size: string;                      // "< 500" | "500-2000" | "2000-10000" | "10000+"
  status: AccountStatus;             // active | suspended
  verificationStatus: VerificationStatus; // verified | in_review | failed
  plan: Plan;                        // Starter | Professional | Enterprise
  monthlySpend: number;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;          // Encrypted TOTP secret
  backupCodes?: string[];            // Hashed backup codes
  emailVerified: boolean;
  onboardingComplete: boolean;
  hiringPreferences?: {
    fields: string[];
    budgetMin: number;
    budgetMax: number;
    contractTypes: ContractType[];
    preferOnline: boolean;
  };
  stats: {
    jobs: number;
    lecturers: number;
    activeContracts: number;
    pendingVerifications: number;
  };
  joinedAt: Date;
  lastActive: Date;
}
```

### 4.2 Lecturer

```ts
interface Lecturer {
  id: string;
  name: string;
  initials: string;
  color: string;
  title: string;                     // e.g. "Associate Professor"
  field: string;                     // e.g. "Computer Science"
  qualification: Qualification;
  yearsOfExperience: number;
  country: string;
  timezone: string;
  hourlyRate: number;
  currency: string;
  rating: number;                    // 0–5
  reviewCount: number;
  availability: Availability;        // Full-time | Part-time
  specializations: string[];
  bio: string;
  languages: string[];
  teachingPhilosophy: string;
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  workExperience: {
    role: string;
    institution: string;
    period: string;
    description: string;
  }[];
  portfolio: {
    title: string;
    type: string;
    year: number;
    url: string;
  }[];
  certifications: string[];
  accountStatus: AccountStatus;
  approvalStatus: ApprovalStatus;    // approved | pending | rejected
  suspensionReason?: string;
  email: string;
  phone: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  emailVerified: boolean;
  joinedAt: Date;
}
```

### 4.3 Job

```ts
interface Job {
  id: string;
  institutionId: string;             // FK → Institution
  title: string;
  field: string;
  description: string;
  requirements: string[];
  status: JobStatus;                 // active | draft | closed
  contractType: ContractType;
  duration: string;                  // e.g. "6 months"
  budgetMin: number;
  budgetMax: number;
  currency: string;
  deadline: Date;
  linkedDocumentIds: string[];       // FK → ContractDocument[]
  applicantCount: number;            // Denormalized counter
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.4 Application

```ts
interface Application {
  id: string;
  jobId: string;                     // FK → Job
  lecturerId: string;                // FK → Lecturer
  institutionId: string;             // FK → Institution (denormalized)
  status: ApplicationStatus;         // pending | shortlisted | interview_scheduled | declined | offer_sent
  coverNote?: string;
  appliedAt: Date;
  updatedAt: Date;
}
```

### 4.5 Shortlist

```ts
interface ShortlistEntry {
  id: string;
  institutionId: string;
  lecturerId: string;
  jobId: string;
  status: ShortlistStatus;           // new | interview_scheduled | offer_sent | accepted | rejected
  interviewDate?: Date;
  calendlyLink?: string;
  addedAt: Date;
  updatedAt: Date;
}
```

### 4.6 Offer

```ts
interface Offer {
  id: string;
  institutionId: string;
  lecturerId: string;
  jobId: string;
  status: OfferStatus;               // pending | approved | declined
  offeredAt: Date;
  respondedAt?: Date;
  sentDocumentIds: string[];         // FK → ContractDocument[]
  signedDocumentIds: string[];       // Subset of sentDocumentIds
}
```

### 4.7 Contract

```ts
interface Contract {
  id: string;
  institutionId: string;
  lecturerId: string;
  jobId: string;
  offerId: string;                   // FK → Offer
  status: ContractStatus;            // active | pending_acceptance | completed | disputed | draft
  contractType: ContractType;
  amount: number;                    // Per month USD
  currency: string;
  startDate: Date;
  endDate: Date;
  escrowStatus: EscrowStatus;        // not_initiated | in_escrow | released | disputed
  escrowAmount?: number;
  escrowInitiatedAt?: Date;
  fundsReleasedAt?: Date;
  signedDocumentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.8 HiredLecturer

```ts
interface HiredLecturer {
  id: string;
  institutionId: string;
  lecturerId: string;
  jobId: string;
  contractId: string;
  contractType: ContractType;
  hourlyRate: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  status: HireStatus;                // active | starting_soon | completed
  signedDocumentIds: string[];
  hiredAt: Date;
}
```

### 4.9 ContractDocument

```ts
interface ContractDocument {
  id: string;
  institutionId: string;
  title: string;
  category: DocumentCategory;        // Contract | NDA | IP | Policy
  description: string;
  pages: number;
  fileUrl: string;                   // S3 URL
  mimeType: string;
  lastUpdated: Date;
  createdAt: Date;
}
```

### 4.10 VerificationDocument

```ts
interface VerificationDocument {
  id: string;
  institutionId: string;
  label: string;                     // e.g. "Certificate of Incorporation"
  description: string;
  fileUrl: string;                   // S3 URL
  mimeType: string;
  status: VerificationDocStatus;     // pending | in_review | verified | failed
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNote?: string;
}
```

### 4.11 Notification

```ts
interface Notification {
  id: string;
  recipientId: string;               // Institution or Lecturer or Admin ID
  recipientRole: Role;
  type: NotificationType;            // application | offer_accepted | offer_declined | doc_signed | verification | shortlist
  read: boolean;
  title: string;
  body: string;
  href: string;                      // Deep-link within app
  actorInitials?: string;
  actorColor?: string;
  icon?: string;                     // shield | star (system notifications)
  createdAt: Date;
}
```

### 4.12 PerformanceReview

```ts
interface PerformanceReview {
  id: string;
  institutionId: string;
  lecturerId: string;
  contractId: string;
  jobTitle: string;
  overallRating: number;             // 1–5
  categories: {
    teaching: number;
    punctuality: number;
    communication: number;
    studentFeedback: number;
  };
  review: string;
  completedAt: Date;                 // When the engagement ended
  reviewedAt: Date;                  // When the review was submitted
}
```

### 4.13 AdminUser

```ts
interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  createdAt: Date;
  lastLogin: Date;
}
```

---

## 5. Core Workflows

### 5.1 Job Posting → Hiring Pipeline

```
Institution                   Backend                     Lecturer
─────────────────────────────────────────────────────────────────
Create Job (draft)       →   POST /api/jobs
Publish Job (active)     →   PATCH /api/jobs/:id
                                                    Browse /api/lecturers/jobs
                                                    Apply → POST /api/applications
View Applicants          ←   GET /api/jobs/:id/applicants
Shortlist                →   PATCH /api/applications/:id/status { status: "shortlisted" }
                              POST /api/shortlist
Schedule Interview       →   PATCH /api/shortlist/:id { interviewDate }
                         →   Calendly embed / webhook
Send Offer               →   POST /api/offers
                                                    Receive notification
                                                    Accept offer → PATCH /api/offers/:id { status: "approved" }
Send Docs for Signature  →   POST /api/offers/:id/send-documents
                                                    Sign docs → PATCH /api/offers/:id/documents
Create Contract          →   POST /api/contracts
Initiate Escrow          →   POST /api/contracts/:id/escrow
Release Funds            →   PATCH /api/contracts/:id/escrow/release
Mark as Hired            →   POST /api/hired
Submit Review            →   POST /api/reviews
```

### 5.2 Escrow Workflow

```
Step 1 – Explain   Institution reads escrow explanation modal
Step 2 – Confirm   Institution confirms amount (= contract amount)
                   Platform fee = 2% of escrow amount
Step 3 – Deposit   Funds deposited (Stripe payment intent)
                   escrowStatus → "in_escrow"
       …work completes…
Release Funds      Institution clicks "Release Funds"
                   escrowStatus → "released"
                   Lecturer receives payment minus platform fee
Dispute (optional) Either party raises dispute
                   escrowStatus → "disputed"
                   Admin reviews
```

### 5.3 Verification / KYC Workflow

```
Institution uploads 5 required documents:
  1. Certificate of Incorporation / Registration
  2. Tax Identification Certificate
  3. Authorized Signatory ID
  4. Proof of Address
  5. Official Letterhead Sample

Optional fields: website, LinkedIn URL, additional notes

POST /api/verification/submit
        │
        ▼
  verificationStatus → "in_review"
  Admin reviews in /admin/verifications
        │
  ─── Decision ──────────────────────┐
        │ Approved                    │ Rejected
        ▼                            ▼
  verificationStatus            verificationStatus
  → "verified"                  → "failed"
                                Institution notified
                                Can resubmit via
                                PATCH /api/verification/resubmit
```

### 5.4 Document E-Signature Workflow

```
1. Institution has document library (ContractDocuments)
2. When posting a job, institution links relevant documents
3. After offer is accepted:
   Institution selects docs → POST /api/offers/:id/send-documents
4. Lecturer receives notification with docs to sign
5. Each doc has status: pending | signed
6. Lecturer signs → PATCH /api/offers/:id/documents { signedDocumentIds: [...] }
7. When all docs signed → Offer moves to contract creation
```

---

## 6. Forms & Input Structures

### Login
```ts
{ role: "admin" | "institution"; username: string; password: string }
```

### Signup
```ts
{
  institutionName: string;
  institutionType: InstitutionType;
  email: string;
  username: string;
  password: string;          // min 8 chars, must match confirmPassword
  confirmPassword: string;
}
```

### Verify OTP
```ts
{ userId: string; otp: string }   // 6-digit numeric
```

### Verify 2FA
```ts
{ tempToken: string; code?: string; backupCode?: string }
```

### Job Creation
```ts
{
  title: string;
  field: string;
  description: string;
  requirements: string[];
  contractType: ContractType;
  duration: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  deadline: string;          // ISO date
  status: "draft" | "active";
  linkedDocumentIds: string[];
}
```

### Onboarding – Step 1 (Institution Profile)
```ts
{ institutionName: string; institutionType: string; website: string; size: string }
```

### Onboarding – Step 2 (Location & Contact)
```ts
{ country: string; address: string; contactName: string; contactEmail: string; contactPhone: string }
```

### Onboarding – Step 3 (Hiring Preferences)
```ts
{ fields: string[]; budgetMin: number; budgetMax: number; contractTypes: ContractType[]; preferOnline: boolean }
```

### Lecturer Search Filters
```ts
{
  search?: string;           // name, field, or specialization keyword
  field?: string;
  qualification?: Qualification;
  country?: string;
  timezone?: string;
  maxRate?: number;
  availability?: Availability;
  page?: number;
  pageSize?: number;
}
```

### Performance Review
```ts
{
  lecturerId: string;
  contractId: string;
  overallRating: number;
  categories: { teaching: number; punctuality: number; communication: number; studentFeedback: number };
  review: string;
}
```

---

## 7. API Endpoints

### Authentication

| Method | Endpoint | Body / Params | Response |
|--------|----------|---------------|----------|
| POST | `/api/auth/signup` | Signup form | `{ userId }` |
| POST | `/api/auth/login` | `{ username, password, role }` | JWT or `{ require2fa, tempToken }` |
| POST | `/api/auth/verify-otp` | `{ userId, otp }` | `{ verified: true }` |
| GET | `/api/auth/setup-2fa` | — (auth required) | `{ secret, qrCodeUrl, backupCodes }` |
| POST | `/api/auth/confirm-2fa` | `{ code }` | JWT |
| POST | `/api/auth/verify-2fa` | `{ tempToken, code?, backupCode? }` | JWT |
| POST | `/api/auth/refresh` | — (refresh cookie) | new access JWT |
| POST | `/api/auth/logout` | — | `{ ok: true }` |

### Jobs

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/jobs` | Query: `status`, `field`, `page`, `pageSize` |
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs/:id` | Job detail |
| PATCH | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |
| GET | `/api/jobs/:id/applicants` | Paginated applicant list |
| PATCH | `/api/jobs/:id/documents` | Link/unlink contract documents |

### Lecturers (Institution-facing)

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/lecturers` | Search with filters (see Lecturer Search Filters) |
| GET | `/api/lecturers/:id` | Full profile |

### Applications

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/applications` | Lecturer applies to job |
| GET | `/api/applications` | Query: `jobId`, `status` |
| PATCH | `/api/applications/:id/status` | `{ status }` |

### Shortlist

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/shortlist` | Institution's shortlist |
| POST | `/api/shortlist` | Add `{ lecturerId, jobId }` |
| DELETE | `/api/shortlist/:id` | Remove entry |
| PATCH | `/api/shortlist/:id` | Update status or interviewDate |
| POST | `/api/shortlist/:id/schedule` | `{ interviewDate, calendlyLink? }` |

### Offers

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/offers` | Institution's offers |
| POST | `/api/offers` | `{ lecturerId, jobId }` |
| PATCH | `/api/offers/:id/status` | `{ status }` — lecturer accepts/declines |
| POST | `/api/offers/:id/send-documents` | `{ documentIds[] }` |
| PATCH | `/api/offers/:id/documents` | `{ signedDocumentIds[] }` |

### Contracts

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/contracts` | Institution's contracts |
| POST | `/api/contracts` | From accepted offer |
| GET | `/api/contracts/:id` | Contract detail |
| PATCH | `/api/contracts/:id/status` | `{ status }` |
| POST | `/api/contracts/:id/escrow` | Initiate escrow `{ amount }` |
| PATCH | `/api/contracts/:id/escrow/release` | Release funds |
| PATCH | `/api/contracts/:id/escrow/dispute` | Open dispute |

### Hired

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/hired` | Hired lecturers for institution |
| POST | `/api/hired` | `{ contractId }` — finalise hire |

### Documents

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/documents` | Document library (filter: `category`) |
| POST | `/api/documents` | Upload + metadata |
| GET | `/api/documents/:id` | Document detail / preview URL |
| PATCH | `/api/documents/:id` | Update metadata |
| DELETE | `/api/documents/:id` | Delete document |

### Verification

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/verification` | Current verification status |
| POST | `/api/verification/submit` | Upload documents |
| PATCH | `/api/verification/resubmit` | Resubmit after failure |

### Notifications

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/notifications` | Paginated notifications |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Performance Reviews

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/reviews` | Institution's reviews (filter: `lecturerId`) |
| POST | `/api/reviews` | Submit review |
| GET | `/api/reviews/:lecturerId` | Reviews for one lecturer |

### Admin – Institutions

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/admin/institutions` | Filter: `status`, `verificationStatus`, search |
| GET | `/api/admin/institutions/:id` | Detail + stats |
| PATCH | `/api/admin/institutions/:id/status` | `{ status, reason? }` |

### Admin – Lecturers

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/admin/lecturers` | Filter: `approvalStatus`, `accountStatus` |
| GET | `/api/admin/lecturers/:id` | Full profile |
| PATCH | `/api/admin/lecturers/:id/approval` | `{ approvalStatus, reason? }` |
| PATCH | `/api/admin/lecturers/:id/status` | `{ status, reason? }` |

### Admin – Verifications

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/admin/verifications` | Filter: `status` |
| PATCH | `/api/admin/verifications/:institutionId` | `{ decision: "verified"\|"failed", note? }` |

### Admin – Platform

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/admin/stats` | Platform-wide statistics |
| GET | `/api/admin/activity` | Recent platform activity feed |
| GET | `/api/admin/analytics` | Aggregated analytics |
| GET | `/api/admin/moderation` | Moderation queue |

---

## 8. Enums & Constants

```ts
type Role = "institution" | "lecturer" | "admin";

type InstitutionType =
  | "University" | "College" | "High School" | "Primary School"
  | "Vocational Institute" | "Online Academy" | "Other";

type AccountStatus = "active" | "suspended";
type ApprovalStatus = "approved" | "pending" | "rejected";
type VerificationStatus = "verified" | "in_review" | "failed";
type VerificationDocStatus = "pending" | "in_review" | "verified" | "failed";
type Plan = "Starter" | "Professional" | "Enterprise";

type JobStatus = "active" | "draft" | "closed";
type ContractType = "Full-time" | "Part-time" | "Contract" | "Hourly";
type Availability = "Full-time" | "Part-time";
type Qualification = "Bachelor's" | "Master's / MSc" | "PhD" | "Professional Cert.";

type ApplicationStatus =
  | "pending" | "shortlisted" | "interview_scheduled" | "declined" | "offer_sent";

type ShortlistStatus =
  | "new" | "interview_scheduled" | "offer_sent" | "accepted" | "rejected";

type OfferStatus = "pending" | "approved" | "declined";

type ContractStatus =
  | "active" | "pending_acceptance" | "completed" | "disputed" | "draft";

type EscrowStatus = "not_initiated" | "in_escrow" | "released" | "disputed";

type HireStatus = "active" | "starting_soon" | "completed";

type DocumentCategory = "Contract" | "NDA" | "IP" | "Policy";

type NotificationType =
  | "application" | "offer_accepted" | "offer_declined"
  | "doc_signed" | "verification" | "shortlist";

const FIELDS = [
  "Computer Science", "Business", "Engineering", "Mathematics",
  "Humanities", "Arts & Design", "Medicine", "Law", "Education"
];

const COUNTRIES = [
  "Ghana", "Nigeria", "Kenya", "South Africa",
  "Germany", "UK", "USA", "India", "Brazil", "Canada"
];

const TIMEZONES = [
  "GMT-8", "GMT-5", "GMT-3", "GMT+0",
  "GMT+1", "GMT+2", "GMT+3", "GMT+5:30", "GMT+8"
];
```

---

## 9. Real-time & Integrations

### 9.1 Real-time Notifications

Use **WebSockets (Socket.io)** or **Server-Sent Events** to push notifications to connected clients.

Events to emit:
- `notification:new` — new notification for a user
- `application:status` — applicant status changed
- `offer:update` — offer accepted/declined
- `document:signed` — document signature received
- `verification:update` — verification status changed

### 9.2 Email

Use **SendGrid** or **AWS SES** for:
- OTP on signup
- Offer notifications to lecturers
- Verification status updates
- Interview reminders

### 9.3 Calendar / Interview Scheduling

The frontend embeds a **Calendly** iframe. Backend needs to:
- Store `calendlyLink` on shortlist entries
- (Optional) Use Calendly webhook to auto-update `interviewDate` when an event is booked

### 9.4 E-Signature

Frontend currently simulates document signing. Integrate with:
- **DocuSign** or **HelloSign (Dropbox Sign)**
- Store `envelopeId` on offer/contract
- Webhook callback to update `signedDocumentIds`

### 9.5 Escrow / Payments

Frontend simulates a 3-step escrow flow. Integrate with:
- **Stripe** — payment intents for escrow deposits
- Platform fee: **2%** of escrow amount
- On `release`, transfer funds minus fee to lecturer

### 9.6 File Storage

All document uploads (KYC + contract templates) go to **AWS S3** (or equivalent):
- Bucket with private ACL
- Signed URLs for secure access
- Accepted MIME types enforced server-side

---

## 10. Recommended Stack

| Layer | Choice |
|-------|--------|
| Framework | Node.js + Express OR Next.js API Routes |
| Database | PostgreSQL (preferred for relational integrity) |
| ORM | Prisma or TypeORM |
| Auth | JWT (access + refresh) + bcrypt |
| 2FA | `speakeasy` or `otplib` (TOTP) |
| File Storage | AWS S3 |
| Email | SendGrid or AWS SES |
| Payments | Stripe |
| E-Signature | DocuSign or HelloSign |
| Real-time | Socket.io |
| Validation | Zod or Joi |
| Search | PostgreSQL full-text search (or Elasticsearch at scale) |
| Logging | Winston + Morgan |
| Queue (optional) | BullMQ + Redis (for email jobs, webhooks) |

---

*Generated from full codebase analysis of `/Users/Apple/Documents/lecturing` on 2026-03-30.*
