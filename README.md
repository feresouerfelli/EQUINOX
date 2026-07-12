<div align="center">

<img src="public/images/logo.svg" alt="EQUINOX Logo" width="300" height="250" />


### 🎓 Tunisian University E-Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Arabic · Français · English** — A modern, multilingual e-learning platform built for Tunisian universities, featuring a Cisco-style course builder, D17 payment integration, and full RTL support.

</div>

---

## ✨ Features

- 🌍 **Multilingual** — Full support for Arabic (RTL default), French, and English via `next-intl`
- 🎨 **Dark Theme** — Premium dark UI with Emerald Green `#0A6B4A` and Gold `#C9A84C` accents
- 🏗️ **Cisco-Style Course Builder** — Modules → Chapters (video / reading / lab / quiz) with drag-and-drop upload
- 📹 **Rich Content** — Video player, PDF viewer, rich-text reading chapters, interactive quizzes
- 🔐 **Secure Auth** — OTP email verification, 2FA (Google Authenticator), IP blocking, login history
- 💳 **D17 Payment** — 4-step manual QR code payment flow with admin verification
- 📊 **Triple Dashboard** — Dedicated UIs for Students, Professors, and Admins
- 🏆 **Certificates** — Auto-generated PDF certificates upon course completion
- 📡 **Real-Time** — Live sessions via Laravel Reverb + Pusher
- 🔒 **Security System** — Incident logging, alerts, and IP-level access control

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | PHP 8.2, Laravel 11, Laravel Sanctum (token auth) |
| **Database** | MySQL 8 |
| **Real-Time** | Laravel Reverb, Pusher |
| **i18n** | next-intl (ar / fr / en) |
| **Rich Text** | Tiptap editor |
| **State** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Animations** | Framer Motion |
| **PDF** | barryvdh/laravel-dompdf |
| **2FA** | pragmarx/google2fa-laravel |
| **Web Server** | Apache (WAMP), Nginx (production) |

---

## 🗂️ Project Structure

```
EQUINOX/
├── backend/                        # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # AuthController, CourseControllers, etc.
│   │   ├── Models/                 # Course, Module, Chapter, Quiz, Certificate…
│   │   └── Services/               # SecurityService, LoginHistoryService
│   ├── database/migrations/        # All DB migrations
│   ├── routes/api.php              # All API routes
│   └── storage/app/public/         # Uploaded files (videos, PDFs, thumbnails)
│
├── src/                            # Next.js 14 App Router
│   ├── app/[locale]/
│   │   ├── admin/                  # Admin dashboard (courses, users, payments, security)
│   │   ├── professor/              # Professor dashboard (courses, uploads, analytics)
│   │   ├── courses/[id]/           # Student course viewer
│   │   └── payment/                # D17 payment flow
│   ├── components/                 # Shared components (Sidebar, CourseBuilder, etc.)
│   ├── lib/                        # API client (api.ts), Zustand store
│   ├── i18n/                       # next-intl routing & navigation config
│   └── messages/                   # ar.json, fr.json, en.json translations
│
├── public/                         # Static assets (logos, D17 QR, tutorial images)
├── nginx/                          # Nginx config for production
├── deploy/                         # Deployment scripts
├── middleware.ts                   # next-intl middleware
├── next.config.mjs                 # API & storage rewrites → Apache/Laravel
└── tailwind.config.ts
```

---

## 📐 Data Model (Course Structure)

```
Course
 ├── CourseModule (1..*)
 │    ├── CourseChapter (1..*)   type: video | reading | lab | quiz
 │    │    ├── content_path      (video / PDF file path)
 │    │    └── content_text      (markdown / HTML for reading)
 │    └── ModuleQuiz
 │         └── QuizQuestion (1..*)
 └── FinalExam
      └── QuizQuestion (1..*)
```

**Course Status Flow:**

```
draft → pending → published
              ↓
           rejected → draft  (re-submit after edits)
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| PHP | ≥ 8.2 |
| Composer | ≥ 2 |
| MySQL | ≥ 8.0 |
| WAMP / XAMPP | (local Apache) |

---

### 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/EQUINOX.git
cd EQUINOX
```

---

### 2 — Backend Setup (Laravel)

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file and configure it
cp .env.example .env
# Edit .env: set DB_DATABASE, DB_USERNAME, DB_PASSWORD, MAIL_*, etc.

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Create storage symlink
php artisan storage:link
```

**Key `.env` variables to configure:**

```env
APP_URL=http://localhost/EQUINOX/backend/public

DB_HOST=127.0.0.1
DB_DATABASE=equinox
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_FROM_ADDRESS="noreply@equinox.tn"

# Optional: Claude AI integration
ANTHROPIC_API_KEY=your-claude-api-key
```

---

### 3 — Frontend Setup (Next.js)

```bash
# From the project root
npm install

# Copy and configure the env file
cp .env.local.example .env.local
```

**`.env.local` variables:**

```env
NEXT_PUBLIC_API_URL=http://localhost/EQUINOX/backend/public
NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_APP_CLUSTER=your-cluster
```

```bash
# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:3000**

---

## 🌐 API Overview

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login (returns Sanctum token) |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/verify-otp` | Email OTP verification |
| `POST` | `/api/auth/2fa/verify` | 2FA token verification |

### Professor Routes *(requires `professor` middleware)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/professor/courses-manage` | List professor's courses |
| `POST` | `/api/professor/courses-manage` | Create course (draft) |
| `PUT` | `/api/professor/courses-manage/{id}` | Update course info |
| `PATCH` | `/api/professor/courses-manage/{id}/submit` | Submit for review |
| `PATCH` | `/api/professor/courses-manage/{id}/withdraw` | Withdraw from review |
| `POST` | `/api/professor/courses-manage/{id}/modules` | Add module |
| `POST` | `/api/professor/professor-modules/{id}/chapters` | Add chapter |

### Admin Routes *(requires `admin` middleware)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/courses-manage` | List all courses |
| `PATCH` | `/api/admin/courses-manage/{id}/approve` | Approve course |
| `PATCH` | `/api/admin/courses-manage/{id}/reject` | Reject with reason |

### Student Routes *(requires `auth` middleware)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/course-catalog` | Browse published courses |
| `POST` | `/api/course-view/{id}/enroll` | Enroll in course |
| `POST` | `/api/course-view/{courseId}/chapters/{chapterId}/complete` | Mark chapter complete |
| `POST` | `/api/course-view/{courseId}/modules/{moduleId}/quiz` | Submit module quiz |

### File Uploads

| Method | Endpoint | Max Size |
|---|---|---|
| `POST` | `/api/upload/thumbnail/{courseId}` | 5 MB |
| `POST` | `/api/upload/video/{lessonId}` | 500 MB |
| `POST` | `/api/upload/pdf/{lessonId}` | 50 MB |
| `POST` | `/api/upload/professor-file` | 500 MB |

---

## 💳 D17 Payment System

The platform integrates a manual QR-based payment flow for the Tunisian **D17** app:

1. **Student** selects a plan
2. **QR code** is displayed for payment via D17
3. **Student uploads** a payment screenshot as proof
4. **Admin verifies** the payment and activates the subscription

> No third-party payment gateway is involved — admin verification is fully manual.

---

## 🔐 Security Features

- Token-based authentication via **Laravel Sanctum**
- **OTP email verification** on registration and login
- **Two-Factor Authentication** (Google Authenticator / TOTP)
- **IP blocking** for suspicious activity
- **Login history** tracking per user
- **Security incident** logging and alert system
- Apache `.htaccess` `Authorization` header fix for Sanctum compatibility

---

## 🌍 Internationalization

The platform is fully multilingual using `next-intl`:

| Language | Code | Direction |
|---|---|---|
| Arabic | `ar` | RTL (default) |
| French | `fr` | LTR |
| English | `en` | LTR |

Translation files are located in `src/messages/` (`ar.json`, `fr.json`, `en.json`).
All components support RTL via `dir="rtl"` on the root element.

---

## 📦 Deployment

For production deployment, refer to the configuration files in:

- `nginx/` — Nginx server block configuration
- `deploy/` — Deployment automation scripts
- `auto-start.bat` — Windows auto-start script (WAMP environment)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'feat: add my feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made By Feres Ouerfelli

**EQUINOX EduTN** — Empowering Tunisian Higher Education

</div>
