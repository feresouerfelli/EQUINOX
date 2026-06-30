# EduTN - Context Prompt for AI Assistants

> Copy this entire document and paste it at the start of any new AI conversation to give it full context about the EduTN project.

---

## PROJECT OVERVIEW

**EduTN** is a production-ready Tunisian university e-learning platform with:
- **3 user roles**: Student, Professor, Admin
- **Frontend**: Next.js 14 (App Router) + React 18 + Tailwind CSS
- **Backend**: Laravel 11 (PHP 8.2+) + MySQL 8
- **Auth**: Laravel Sanctum (JWT tokens)
- **i18n**: next-intl with 3 locales: Arabic (ar, RTL), French (fr, LTR, **default**), English (en, LTR)
- **Payments**: D17, Konnect, Flouci, Bank Transfer
- **AI**: Google Gemini API with Wikipedia/DuckDuckGo enrichment
- **Live sessions**: WebRTC (planned)

---

## ARCHITECTURE

```
Frontend (Next.js 14)          Backend (Laravel 11)         Database (MySQL 8)
─────────────────────          ──────────────────────       ──────────────────
src/app/[locale]/              backend/app/Http/            backend/database/migrations/
├── login/                     │   Controllers/Api/         └── 2026_06_25_000000_create_all_tables.php
├── register/                  │   ├── AuthController.php   (single migration, 19 tables)
├── dashboard/ (student)       │   ├── AdminController.php
│   ├── courses/               │   ├── ProfessorController.php
│   ├── ai/                    │   ├── CourseController.php
│   ├── live/                  │   ├── AIController.php
│   ├── forum/                 │   ├── PaymentController.php
│   ├── profile/               │   ├── LiveSessionController.php
│   └── settings/              │   ├── ForumController.php
├── professor/                 │   ├── NotebookController.php
│   ├── courses/               │   ├── SubscriptionController.php
│   ├── live/                  │   ├── NotificationController.php
│   ├── students/              │   └── NotebookController.php
│   ├── analytics/             │
│   └── settings/              │   Models/ (15 models)
├── admin/                     │   ├── User.php, Professor.php, Course.php
│   ├── users/                 │   ├── Enrollment.php, Payment.php
│   ├── courses/               │   ├── LiveSession.php, Lesson.php
│   ├── payments/              │   ├── AiChat.php, AiUsage.php, Notebook.php
│   └── broadcast/             │   ├── Notification.php, Subscription.php
├── courses/ (catalog)         │   ├── CourseGroup.php, GroupPost.php, GroupReply.php
│   ├── [id]/                  │
│   └── [id]/watch/            │   Middleware/
├── live/[id]/                 │   ├── AdminMiddleware.php
├── payment/                   │   ├── ProfessorMiddleware.php
└── layout.tsx (RTL support)   │   └── Authenticate.php (custom, redirectTo=null)
                               │
src/components/                │   routes/api.php (all endpoints)
├── AuthGuard.tsx              │   bootstrap/app.php (CSRF disabled for api/*)
├── Navbar.tsx, Footer.tsx
├── Hero.tsx, Features.tsx     └── config/sanctum.php (stateful: localhost:3000)
├── Pricing.tsx, PaymentShowcase.tsx
├── LanguageSwitcher.tsx
└── ... (12 components total)
```

---

## COLOR SYSTEM (MUST FOLLOW)

| Name | Hex | Usage |
|------|-----|-------|
| Emerald Green | `#0A6B4A` | Primary buttons, headers, accents |
| Antique Gold | `#C9A84C` | Headlines, shimmer text, CTAs glow |
| Ivory Beige | `#FAF8F2` | Backgrounds, cards |
| Dark | `#0D2B1E` | Text, dark sections |

**Tailwind custom classes**: `emerald-*`, `gold-*`, `ivory-*`, `dark-*`

---

## DESIGN RULES (CRITICAL)

1. **RTL-first**: Arabic is default. RTL flips automatically for AR; LTR for FR/EN via `next-intl`
2. **Flat surfaces only**: NO gradients on buttons, cards, or backgrounds
3. **Micro-interactions**: Hover lift +4px, icon rotate/scale on hover
4. **Gold shimmer headline**: On landing page hero
5. **Grid overlays**: Subtle decorative grid pattern on sections
6. **Floating orbs**: Decorative animated circles on hero
7. **Gold glow pulse**: On CTA buttons (`.gold-glow` class)
8. **Mobile-first**: 70%+ mobile users in Tunisia
9. **Custom CSS classes**: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.card`, `.card-dark`, `.input-field`, `.section-title`, `.badge-gold`, `.badge-emerald`, `.shimmer-text`, `.gold-glow`, `.grid-overlay`, `.orb`, `.nav-link`
10. **Font families**: `Inter` (LTR) + `Noto Sans Arabic` (RTL), loaded via Google Fonts

---

## DATABASE SCHEMA (19 tables in single migration)

### Core Tables
- **users**: id, name, email, phone, password, role (student/professor/admin), avatar_url, lang, is_active, email_verified_at
- **professors**: id, user_id (FK→users), bio_ar, bio_fr, bio_en, specialty, is_verified, rating, total_students
- **courses**: id, professor_id (FK→professors), title_ar, title_fr, title_en, description_ar, description_fr, description_en, thumbnail_url, specialty, level, price_dt, is_free, status (draft/pending/active/archived), total_lessons, total_duration_min
- **lessons**: id, course_id (FK→courses), title, description, video_url, duration_min, order_num, is_free, type (video/document/quiz)
- **enrollments**: id, user_id (FK→users), course_id (FK→courses), progress_percent, last_lesson_id, enrolled_at, completed_at
- **live_sessions**: id, professor_id (FK→professors), course_id (FK→courses), title, scheduled_at, duration_min, livekit_room_name, status (scheduled/live/ended/cancelled)
- **payments**: id, user_id (FK→users), subscription_id, gateway (d17/konnect/flouci/bank/manual), gateway_reference, amount_dt, status (pending/success/failed), gateway_response
- **subscriptions**: id, user_id (FK→users), plan (free/premium/enterprise), status (active/cancelled/expired), start_date, end_date, gateway, amount_dt
- **ai_chats**: id, user_id, course_id, message, response, tokens_used
- **ai_usage**: id, user_id, date, total_tokens
- **notebooks**: id, user_id, course_id, content_json
- **notifications**: id, user_id, title, body, type, read_at
- **course_groups**: id, course_id, name, description
- **group_posts**: id, group_id, user_id, title, body
- **group_replies**: id, post_id, user_id, body
- **personal_access_tokens**: (Sanctum table)

### Important FK relationships
- `payments` has NO `course_id` — revenue is calculated via enrollments (enrollment→user→payment)
- `professors.user_id` references `users.id` (not another professors table)
- `courses.professor_id` references `professors.id`
- `enrollments.course_id` references `courses.id`

---

## API ENDPOINTS (All prefixed with `/api`)

### Public (no auth)
```
POST /auth/register          { name, email, phone, password, role }
POST /auth/login             { email, password } → { user, token }
POST /auth/otp/verify        { email, code }
POST /auth/otp/resend        { email }
POST /auth/forgot-password   { email }
POST /auth/reset-password    { email, password, token }
POST /auth/refresh           { token }
```

### Protected (requires `Authorization: Bearer <token>`)
```
POST /auth/logout
GET  /courses                → paginated courses list
GET  /courses/{id}           → course detail
GET  /courses/{id}/lessons   → lessons for course
POST /enrollments            { course_id }
GET  /student/courses        → enrolled courses
PUT  /lesson-progress/{id}   { progress_percent }
GET  /live-sessions          → all live sessions
POST /live-sessions/{id}/join
POST /live-sessions/{id}/end
POST /ai/chat                { courseId, message } → AI response
GET  /ai/history/{courseId}  → chat history
POST /ai/quiz                { courseId }
POST /ai/dictionary          { word }
POST /ai/search              { query }
GET  /notebooks/{courseId}
PUT  /notebooks/{courseId}   { content_json }
POST /notebooks/{courseId}/export-pdf
POST /payments/d17/initiate  { courseId, amount }
POST /payments/konnect/initiate
POST /payments/flouci/initiate
POST /payments/bank/submit-proof
GET  /payments/history
GET  /payments/{id}/invoice
GET  /subscription
POST /subscription/cancel
POST /subscription/upgrade
GET  /groups/{courseId}/posts
POST /groups/{courseId}/posts    { title, body }
POST /groups/{courseId}/posts/{postId}/replies  { body }
PUT  /groups/{courseId}/posts/{postId}/like
GET  /notifications
PUT  /notifications/read-all
```

### Admin (requires `admin` middleware)
```
GET  /admin/stats            → { total_students, revenue_mtd, active_subscriptions, ... }
GET  /admin/users            → paginated users (supports ?search=, ?role=)
PUT  /admin/users/{id}/ban   → toggle ban
POST /admin/professors       { name, email, specialty }
GET  /admin/courses/pending  → courses awaiting approval
GET  /admin/courses/all      → all courses (supports ?search=, ?status=)
PUT  /admin/courses/{id}/approve
GET  /admin/payments         → all payments (supports ?method=, ?status=)
POST /admin/broadcast        { title, body, target }
```

### Professor (requires `professor` middleware)
```
GET  /professor/courses      → professor's courses with enrollment counts
GET  /professor/stats        → { total_students, total_courses, active_courses, revenue, avg_progress, ... }
GET  /professor/students     → enrolled students in professor's courses
GET  /professor/live-sessions → professor's live sessions
POST /professor/live-sessions { course_id, title, scheduled_at, duration_min }
GET  /professor/analytics    → { kpis, courses[], monthly_revenue[] }
GET  /professor/profile      → { user: {name, email, phone}, professor: {bio_ar, specialty} }
PUT  /professor/profile      { name, bio_ar, specialty }
```

---

## AUTH SYSTEM

- **Token format**: Sanctum personal access tokens (format: `<id>|<hash>`)
- **Login response**: `{ user: { id, name, email, phone, role, ... }, token: "..." }`
- **Frontend storage**: Zustand persist store (`useAuthStore`) in localStorage
- **API calls**: `src/lib/api.ts` — all requests include `Accept: application/json` and `Content-Type: application/json` headers
- **Role-based routing**: `src/components/AuthGuard.tsx` redirects based on `user.role`
- **Middleware aliases**: `admin` → `AdminMiddleware`, `professor` → `ProfessorMiddleware`
- **CSRF**: Disabled for all `api/*` routes in `bootstrap/app.php`

### Seeded Accounts
| Role | Email | Password | DB ID |
|------|-------|----------|-------|
| Admin | admin@edutn.tn | password | 1 |
| Professor | prof@edutn.tn | password | 4 |
| Student | student@edutn.tn | password | 3 |

---

## i18n SYSTEM

- **Library**: next-intl 3
- **Locales**: `ar` (Arabic, RTL), `fr` (French, LTR, **default**), `en` (English, LTR)
- **Routing**: `/ar/...`, `/fr/...`, `/en/...` — URL path prefix
- **Messages**: `src/messages/ar.json`, `src/messages/fr.json`, `src/messages/en.json`
- **Namespaces**: `common`, `nav`, `hero`, `trust`, `features`, `whoIsIt`, `pricing`, `payments`, `testimonials`, `cta`, `footer`, `auth`, `dashboard`, `courses`, `player`, `live`, `aiNotebook`, `payment`, `forum`, `admin`, `profSidebar`, `adminSidebar`, `studentSidebar`
- **RTL**: Handled via `dir={locale === "ar" ? "rtl" : "ltr"}` in `<html>` tag
- **Language switcher**: `src/components/LanguageSwitcher.tsx` — preserves current path when switching locale

---

## KEY FILES TO MODIFY

| What | File |
|------|------|
| Global styles & custom classes | `src/app/globals.css` |
| Tailwind config (colors, fonts, animations) | `tailwind.config.ts` |
| Next.js config | `next.config.mjs` |
| i18n routing config | `src/i18n/routing.ts` |
| Locale messages | `src/messages/{ar,fr,en}.json` |
| API wrapper | `src/lib/api.ts` |
| Auth store | `src/lib/store.ts` |
| Role-based guard | `src/components/AuthGuard.tsx` |
| Locale layout (RTL, fonts) | `src/app/[locale]/layout.tsx` |
| All routes | `backend/routes/api.php` |
| Middleware config | `backend/bootstrap/app.php` |
| Sanctum config | `backend/config/sanctum.php` |
| Environment vars | `backend/.env`, `.env.local` |
| All controllers | `backend/app/Http/Controllers/Api/*.php` |
| All models | `backend/app/Models/*.php` |
| Payment services | `backend/app/services/KonnectGateway.php`, `FlouciGateway.php`, `D17Gateway.php` |

---

## HOW TO RUN

```bash
# Frontend (port 3000)
cd C:\Users\Feres\Music\Ferfer2
npm run dev

# Backend (port 8000)
cd C:\Users\Feres\Music\Ferfer2\backend
php artisan serve --host=127.0.0.1 --port=8000

# PHP binary (WAMP)
C:\wamp64\bin\php\php8.3.14\php.exe

# MySQL
C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe -u root edutn
```

---

---

## PAYMENT GATEWAYS (Implemented, credentials needed)

### Konnect (https://dashboard.konnect.network)
- **Config**: `backend/.env` → `KONNECT_API_KEY`, `KONNECT_WALLET_ID`, `KONNECT_MODE=sandbox`
- **API**: POST `https://api.sandbox.konnect.network/api/v2/payments/init-payment`
- **Auth**: `x-api-key` header
- **Flow**: Init → returns `payUrl` → redirect user → webhook GET with `payment_ref`
- **Webhook**: GET `?payment_ref=xxx` → verify via `GET /payments/:paymentRef`

### Flouci (https://developers.flouci.com)
- **Config**: `backend/.env` → `FLOUCI_PUBLIC_KEY`, `FLOUCI_SECRET_KEY`, `FLOUCI_MODE=sandbox`
- **API**: POST `https://developers.flouci.com/api/v2/generate_payment`
- **Auth**: `Authorization: Bearer <PUBLIC_KEY>:<PRIVATE_KEY>`
- **Flow**: Generate → returns `link` → redirect user → webhook POST
- **Verify**: GET `https://developers.flouci.com/api/v2/verify_payment/{payment_id}`

### D17 (https://d17.tn - La Poste Tunisienne)
- **Config**: `backend/.env` → `D17_MERCHANT_ID`, `D17_MERCHANT_KEY`, `D17_API_URL`
- **API**: QR-code based via D17 mobile app (API docs not publicly available)
- **Flow**: Initiate → generate QR code → user scans with D17 app → webhook
- **Note**: Contact La Poste Tunisienne for merchant API access at https://d17.tn/fr/commercant

---

## CRITICAL BUGS / KNOWN ISSUES

1. **POST requests require `Accept: application/json`** — Without it, Laravel returns a 302 redirect to `/` with a meta-refresh HTML page (not a standard HTTP redirect, no Location header). The frontend `api.ts` already sends this header, so this only affects raw curl/Postman tests.

2. **`payments` table has NO `course_id` column** — Revenue per professor must be calculated by joining through enrollments: `Payment::whereIn('user_id', $enrollments->pluck('user_id'))`.

3. **`professors.user_id` is NOT the login user's ID** — The `professor_id` in the request comes from `ProfessorMiddleware`, which looks up the professor record by `user_id`. The `professor_id` FK on courses references the `professors` table, not the `users` table.

4. **Professor analytics endpoint** returns `monthly_revenue` with translated month names (via `translatedFormat('M')`). This depends on the app locale being set correctly.

5. **Professor settings page** disables editing email and phone (read-only fields) — the `updateProfile` endpoint only accepts `name`, `bio_ar`, `bio_fr`, `bio_en`, `specialty`.

---

## CURRENT STATE (What's done)

- [x] Full landing page with hero, features, pricing, testimonials, footer
- [x] Auth pages: login, register, OTP verify, forgot/reset password
- [x] Student dashboard: overview, courses (with empty states), AI notebook, live, forum, profile, settings
- [x] Professor dashboard: overview, courses, live sessions (with create modal), students, analytics, settings — ALL connected to real API
- [x] Admin dashboard: overview, users (search, ban, add professor), courses (status filter), payments (method/status filters) — ALL connected to real API
- [x] Course catalog and detail pages
- [x] AI Notebook with Gemini API, Wikipedia/DuckDuckGo enrichment, quiz, dictionary, TTS
- [x] All translation keys in all 3 locales (ar, fr, en)
- [x] AuthGuard for all 3 role-based dashboards
- [x] Language switcher preserving current path
- [x] Database: 19 tables, seeded data (6 courses, 3 users, 3 enrollments)
- [x] All backend endpoints functional and tested via curl

## CURRENT STATE (What's NOT done)

- [ ] Real-time notifications (WebSocket/Soketi not set up)
- [ ] Payment gateway merchant credentials (Konnect: get from dashboard.konnect.network, Flouci: get from developers.flouci.com, D17: contact La Poste Tunisienne)
- [ ] Live session WebRTC implementation (UI exists, no LiveKit/WebRTC backend)
- [ ] File upload for course thumbnails and lesson videos
- [ ] Professor course CRUD (create/edit/delete) — only list/view exists
- [ ] Email sending (OTP, forgot password) — endpoints exist but need SMTP config
- [ ] Video player for lesson watching
- [ ] Search functionality across courses
- [ ] Admin course creation (only approve/edit existing)
- [ ] Notification preferences per user
- [ ] Responsive testing on real mobile devices

---

## STYLE CONVENTIONS

- **Component style**: Functional components with `"use client"` directive for client-side pages
- **State management**: Zustand for auth + notifications, React Query available but not heavily used yet
- **Form validation**: React Hook Form + Zod schemas (available, not all pages use it yet)
- **Backend**: Laravel Eloquent ORM, API Resources not yet used (raw JSON responses)
- **CSS**: Tailwind utility-first + custom CSS classes in `globals.css`
- **TypeScript**: Used throughout frontend, strict mode enabled
