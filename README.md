# CivicFix — Smart Citizen Issue Reporting & Resolution Management Platform

> **Tagline: Report It. Track It. Fix It.**
> *A production-grade, secure, light-themed civic technology SaaS platform connecting citizens, administrators, and field operations teams.*

---

## 🏛️ Overview

**CivicFix** is a complete digital civic issue reporting and resolution system designed for local municipalities, college campuses, housing societies, and civic organizations. 

CivicFix establishes a transparent, accountable pipeline:
1. **Citizens** report neighbourhood problems with real photographs, GPS/manual locality markers, and track real-time resolution timelines with interactive before/after verification.
2. **Administrators** verify reports, prevent duplicate spam via an automated duplicate detection engine, assign certified field workers, configure SLA targets, and perform quality review on completion evidence.
3. **Field Workers** access mobile-first task lists, accept dispatches, upload on-site progress notes, submit verified resolution evidence, and submit for final administrative sign-off.

---

## 🎨 UI/UX Theme & Design Guidelines

- **Clean Light Aesthetic**: Crisp white and warm soft-slate backgrounds (`#f8fafc`, `#ffffff`), subtle borders (`#e2e8f0`), and vibrant civic accents (emerald, sky, amber, rose).
- **Anti-Fatigue Accessibility**: Absolutely NO dark blue or dark black backgrounds. High contrast typography using **Plus Jakarta Sans** and **JetBrains Mono**.
- **Responsive Layout**: Designed mobile-first for citizen smartphone reporting and field tablet/phone operations, alongside an expansive desktop command centre for administrators.

---

## 🚀 Key Features

### 1. Citizen Experience
- **Mobile-first reporting wizard** with real-time GPS coordinate capture (Geolocation API) or manual landmark search.
- **Multi-photo evidence upload** with live previews and client-side validation.
- **Unique Complaint Code** generator (e.g. `CF-2026-000124`).
- **Complete lifecycle tracking timeline**: From `SUBMITTED` ➔ `UNDER REVIEW` ➔ `VERIFIED` ➔ `ASSIGNED` ➔ `IN PROGRESS` ➔ `RESOLUTION SUBMITTED` ➔ `RESOLVED`.
- **Interactive Before/After Evidence Viewer**: Compare original citizen report photos side-by-side with verified field repair photos using an interactive split-slider.
- **Citizen Feedback**: 1–5 star rating, quality assessment, and comment once resolved.

### 2. Administrator Command Center
- **Live KPI Metrics**: Total Complaints, Newly Submitted, Under Review, Verified, In Progress, Resolved, Overdue count.
- **Verification Queue**: Approve with priority rating (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), or reject with mandatory audit remarks.
- **Duplicate Detection Engine**: Compares title similarity, locality, category, and GPS distance to group duplicate reports and link them to primary operational issues without deleting records.
- **Worker Dispatch Management**: Directory of field workers with specializations, active workloads, and one-click assignment.
- **Resolution Review & Sign-Off**: Mandatory two-step verification where admins review worker completion photos and notes before marking complaints as `RESOLVED`.
- **Operations Analytics**: Interactive SVG charts showing category distributions, locality breakdowns, monthly trends, and SLA compliance gauges.
- **Data Export**: Export complaints as CSV, JSON, or browser Print-to-PDF reports.

### 3. Field Worker Operations
- Mobile-optimized assignment dashboard with location details and direct public map directions.
- Task acknowledgment (`Accept Assignment`), work commencement (`In Progress`), and intermediate progress notes.
- High-fidelity resolution photo evidence submission.

### 4. Interactive Demo Mode & Live Supabase Switch
- **Dual Mode Support**:
  - **Live Cloud Supabase Mode**: Connect your real Supabase project by entering your Supabase URL & Anon Key.
  - **Interactive Demo Workspace**: Pre-loaded with realistic, explicitly marked `DEMO DATA` covering road potholes, garbage accumulation, streetlight outages, drainage blockages, and water leaks. Demonstrates every single role workflow without requiring immediate cloud credentials.

---

## 📦 Technology Stack

- **Frontend**: React 19 + TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Database & Backend**: PostgreSQL + Supabase.
- **Storage**: Supabase Storage Buckets (`complaint-reports`, `worker-evidence`).
- **Browser APIs**: Geolocation API, File API, Notification API, SVG Canvas.

---

## 🗄️ Database Architecture (`supabase-schema.sql`)

The database includes full Row Level Security (RLS) enforcement and secure RPC functions:

- `profiles` — User profile, contact, and system role (`CITIZEN`, `ADMIN`, `WORKER`).
- `categories` — Service categories with customizable SLA turnaround targets.
- `complaints` — Core incident records with coordinates, locality, priority, and status.
- `complaint_media` — Multi-photo evidence records for before, during, and after repair.
- `workers` — Worker specialization, assigned zones, and live workload counter.
- `assignments` — Dispatch logs and task statuses.
- `complaint_updates` — Audit trail of every status transition and note.
- `duplicate_links` — Associations between duplicate citizen reports and primary incidents.
- `resolution_reviews` — Official admin sign-offs on worker evidence.
- `feedback` — Citizen satisfaction ratings and comments.
- `notifications` — Role-specific in-app notification center.
- `audit_logs` — Security and administrative compliance log.

### Installing Database Schema
1. Open your Supabase Dashboard: `https://supabase.com/dashboard/project/<your-project-id>`.
2. Navigate to the **SQL Editor**.
3. Copy the entire contents of `/supabase-schema.sql` and click **Run**.
4. Navigate to **Storage** and confirm two private buckets:
   - `complaint-reports`
   - `worker-evidence`

---

## 🔒 Security & Row Level Security (RLS) Rules

- **Zero Client Role Trust**: Role elevation is barred from the client. Users cannot change their own `role` in the database.
- **Privacy Enforcement**: Citizens can only view complaints submitted by their own account.
- **Worker Isolation**: Field workers only see incidents officially assigned to them.
- **Privileged Status Control**: Only verified administrators can transition complaints to `VERIFIED`, `REJECTED`, or `RESOLVED`.
- **Secret Protection**: The `service_role` secret is never exposed in frontend code; only public anon keys are used with RLS and SECURITY DEFINER RPC functions.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🌐 Netlify / Vercel Deployment

1. Push this repository to GitHub/GitLab.
2. Connect the repository to Netlify or Vercel.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key

---

## ⚖️ Disclaimer

CivicFix is an independent civic issue reporting and resolution platform suitable for pilot testing across campuses, municipalities, and local communities. It is not affiliated with any official government authority unless explicitly integrated by an authorized agency.
