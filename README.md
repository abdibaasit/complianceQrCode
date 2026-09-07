# Compliance QR — Digital Complaint & Feedback Platform

> A modern SaaS platform that enables organizations to collect real-time, anonymous customer complaints and feedback through dynamic QR codes — no app download required.

[![GitHub repo](https://img.shields.io/badge/GitHub-abdibaasit%2FcomplianceQrCode-blue?logo=github)](https://github.com/abdibaasit/complianceQrCode)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 Overview

**Compliance QR** replaces traditional suggestion boxes with a fast, digital, QR-based system. Organizations (hospitals, hotels, universities, restaurants, banks, government offices, etc.) get a unique QR code that customers scan with any phone camera — instantly opening a mobile-friendly form to submit a complaint or piece of feedback, completely anonymously or with optional contact details for follow-up.

### How it works

```
Customer scans QR Code
        ↓
Mobile-first complaint / feedback form opens (no app needed)
        ↓
Submission saved instantly to the organization's dashboard
        ↓
Staff review, resolve, and send SMS/email updates to customers
```

---

## ✨ Key Features

### 👥 Customer Experience
- **QR Code Scanning** — works in any smartphone browser, zero app download
- **Anonymous Submissions** — customers can submit 100% anonymously or leave a phone number for follow-up
- **Bilingual Support** — forms and chatbot support both Somali and English
- **Complaint & Feedback Forms** — separate flows for complaints and positive feedback

### 🏢 Organization Dashboard
- **Real-time Complaint Inbox** — instant view of all incoming submissions
- **Complaint Resolution** — update status, add internal notes, respond to customers
- **QR Code Management** — generate, download, and print QR poster PDFs per branch/location
- **Analytics & Reports** — live charts, resolution rate tracking, category breakdowns
- **AI Copilot** — powered by Google Gemini AI, helps staff write professional response drafts
- **Subscription Management** — view plan status, renewal dates, and subscription history

### 🛡️ Super Admin Portal
- **Organization Management** — create, view, suspend, and manage all registered organizations
- **Submissions Overview** — platform-wide view of all complaints and feedback
- **QR Code Center** — manage QR codes across all organizations
- **Payments & Renewals** — track subscription payments and renewal records
- **Platform Complaints** — handle complaints submitted directly about the platform
- **Audit Logs** — full activity log for compliance and accountability
- **Admin User Management** — create and manage admin accounts
- **Platform Settings** — configure platform name, branding, and global settings

### 🤖 AI Chatbot
- Powered by **Google Gemini 1.5 Flash**
- Two modes: **Public** (answers questions about the platform) and **Organization** (helps staff draft complaint responses)
- Falls back to a rule-based engine if the API key is not configured

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **State Management** | TanStack React Query |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (Access + Refresh tokens, HTTP-only cookies) |
| **AI** | Google Generative AI (Gemini 1.5 Flash) |
| **QR Codes** | `qrcode` (server) + `qrcode.react` (client) |
| **PDF Export** | PDFKit (server), jsPDF (client) |
| **SMS** | Tabaarak SMS Gateway |
| **Email** | Nodemailer (SMTP / Gmail) |
| **Security** | Helmet, express-rate-limit, bcryptjs |
| **Scheduler** | node-cron |

---

## 📁 Project Structure

```
complianceQRcode/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── pages/
│       │   ├── public/       # Landing, About, Contact pages
│       │   ├── auth/         # Login
│       │   ├── customer/     # QR scan → complaint/feedback flow
│       │   ├── admin/        # Super admin dashboard
│       │   └── org/          # Organization dashboard
│       ├── components/       # Shared UI components
│       ├── layouts/          # Page layout wrappers
│       ├── context/          # Auth context
│       └── utils/            # API helpers, formatters
│
├── server/                   # Node.js / Express backend
│   └── src/
│       ├── config/           # DB, env, and app config
│       ├── controllers/      # Route handlers
│       ├── models/           # Mongoose schemas
│       ├── routes/           # API route definitions
│       ├── services/         # Business logic (AI chatbot, SMS, email)
│       ├── middleware/        # Auth, error handling, rate limiting
│       ├── jobs/             # Cron jobs (subscription checks, etc.)
│       ├── validators/       # Zod request validators
│       └── seed.js           # Database seeder
│
├── api/                      # Vercel serverless function entry point
├── Dockerfile                # Docker config for containerized deployment
├── railway.json              # Railway deployment config
└── vercel.json               # Vercel deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** v9+

### 1. Clone the repository

```bash
git clone https://github.com/abdibaasit/complianceQrCode.git
cd complianceQrCode
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure environment variables

Create `server/.env` by copying the example below:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/compliance-qr
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173

# Admin account (auto-seeded on first run)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@123456
ADMIN_FULLNAME=Platform Super Admin

# Google Gemini AI (optional — chatbot falls back without it)
# Get your key at https://aistudio.google.com/apikey
GEMINI_API_KEY=your_google_ai_studio_key

# SMTP Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Compliance QR <your@gmail.com>"

# Tabaarak SMS (optional)
TABAARAK_SMS_NAME=your_username
TABAARAK_SMS_PASSWORD=your_password
TABAARAK_SMS_BASE_URL=https://sms.tabaarak.com
```

### 4. Seed the database (optional)

```bash
npm run seed
```

This creates the default Super Admin account.

### 5. Run the development servers

**Backend** (runs on `http://localhost:5000`):
```bash
npm run dev:server
```

**Frontend** (runs on `http://localhost:5173`):
```bash
npm run dev:client
```

---

## 🔑 Default Login

After seeding, log in at `http://localhost:5173/login` with:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `Admin@123456` |

> ⚠️ Change the default password immediately in production.

---

## 🌐 API Endpoints

| Prefix | Description |
|---|---|
| `POST /api/auth/*` | Login, logout, refresh token |
| `GET/POST /api/admin/*` | Super admin — orgs, users, reports, settings |
| `GET/POST /api/org/*` | Organization dashboard — submissions, QR, profile |
| `POST /api/public/*` | Public QR form submission (no auth required) |
| `POST /api/chatbot` | AI chatbot message handler |

---

## 🐳 Deployment

### Docker

```bash
docker build -t compliance-qr .
docker run -p 5000:5000 --env-file server/.env compliance-qr
```

### Railway / Koyeb

The project includes `railway.json` and a multi-stage `Dockerfile` for easy one-click deployment on [Railway](https://railway.app) or [Koyeb](https://koyeb.com).

### Vercel (Serverless)

The `api/` folder and `vercel.json` configure the backend as a Vercel serverless function with the React SPA served from the `client/dist` build.

```bash
vercel --prod
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Abdibaasit**  
GitHub: [@abdibaasit](https://github.com/abdibaasit)