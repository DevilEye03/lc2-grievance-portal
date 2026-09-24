# LAW CENTRE II Grievance Portal

A production-ready, full-stack **College Grievance Redressal** web application for **Law Centre II** built with **Next.js 14**, **Prisma ORM**, **Tailwind CSS**, and **JWT authentication**.

---

## ✨ Features

- 🎫 **Auto-generated Ticket IDs** — Format `GRV-YYYY-XXXX`, sequential per year
- 🕐 **SLA Enforcement** — 48-hour acknowledgment, 7-day resolution deadlines with visual breach indicators
- 📋 **Multi-step Submission Form** — With file attachment support (JPG, PNG, PDF up to 5MB)
- 🔍 **Public Tracking** — No login required; track by Ticket ID + email
- 🛡️ **JWT Admin Portal** — Role-based access: SUPER_ADMIN, DEPARTMENT_HEAD, OFFICER
- 📧 **Email Notifications** — On submission, status updates, and authority replies (console fallback if SMTP unconfigured)
- 📊 **Dashboard** — KPI cards, category breakdown, SLA breach counts
- 📥 **CSV Export** — Download filtered complaint reports
- 🚫 **Mandatory Reply Validation** — Cannot resolve/close without ≥20 char official response

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone and install dependencies

```bash
cd "LC2 Helpdesk"
npm install
```

### 2. Configure environment variables

```bash
copy .env.example .env
```

The default `.env` uses **SQLite** (no database installation needed for development):
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="xyz-grievance-portal-super-secret-jwt-key-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize the database and seed

```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@college.edu` |
| Password | `Admin@123` |
| Role | SUPER_ADMIN |

---

## 🧪 Seeded Test Data

| Ticket ID | Status | Scenario |
|-----------|--------|----------|
| GRV-{YEAR}-0001 | REGISTERED | Filed today — within SLA |
| GRV-{YEAR}-0002 | REGISTERED | Filed 4 days ago — ACK SLA breached (red badge) |
| GRV-{YEAR}-0003 | IN_PROGRESS | Filed 8 days ago — Resolution SLA breached (red badge) |
| GRV-{YEAR}-0004 | RESOLVED | Complete with official authority reply |
| GRV-{YEAR}-0005 | CLOSED | Historical complaint |

---

## 🐳 Production Deployment (Docker)

### One-command deployment

```bash
docker-compose up -d --build
```

This starts:
- **MySQL 8.0** database with persistent volume
- **Next.js app** on port 3000 with persistent uploads volume

### Environment Variables for Production

Create a `.env` file with production values:

```env
DATABASE_URL=mysql://grievance:grievance123@db:3306/grievance_db
JWT_SECRET=your-very-long-random-secret-here
NEXT_PUBLIC_APP_URL=https://your-domain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
SMTP_FROM=LAW CENTRE II Grievance Portal <noreply@lc2.du.ac.in>
MYSQL_ROOT_PASSWORD=your-root-password
MYSQL_USER=grievance
MYSQL_PASSWORD=your-db-password
```

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ destroys data)
docker-compose down -v

# Run seeds inside container
docker-compose exec app npx prisma db seed
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── portal/          # Public landing page
│   ├── submit/          # File grievance form
│   ├── track/           # Public tracking
│   ├── admin/           # Protected admin panel
│   └── api/             # REST API routes
├── components/
│   ├── ui/              # Atomic UI components
│   ├── layout/          # Nav, Sidebar, Topbar
│   ├── portal/          # Student-facing components
│   └── admin/           # Admin-facing components
├── lib/
│   ├── prisma.ts        # Database client
│   ├── auth.ts          # JWT utilities
│   ├── mailer.ts        # Email notifications
│   ├── ticketId.ts      # GRV-YYYY-XXXX generator
│   ├── sla.ts           # SLA computation
│   └── validations.ts   # Zod schemas
├── middleware.ts         # Route protection
└── types/index.ts        # Shared types
```

---

## 🔗 Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/portal` | Public | Landing page |
| `/submit` | Public | Submit grievance |
| `/track` | Public | Track by Ticket ID + email |
| `/admin/login` | Public | Admin login |
| `/admin/dashboard` | Admin | KPI dashboard |
| `/admin/complaints` | Admin | All complaints with filters |
| `/admin/complaints/[id]` | Admin | Detail + reply |
| `/admin/users` | SUPER_ADMIN | User management |
| `/admin/whatsapp-simulator` | Admin | Interactive WhatsApp Bot simulator |

---

## 📱 WhatsApp Bot Integration (Meta WhatsApp Cloud API)

The system includes a full conversational WhatsApp Bot for **LAW CENTRE II** that allows students to:
- 📝 **Submit grievances conversationally** step-by-step (Name ➔ Roll ➔ Email ➔ Category ➔ Subject ➔ Description ➔ Attachments)
- 🎫 **Receive instant sequential Ticket IDs** (`GRV-YYYY-XXXX`)
- 🔍 **Track grievance status** and read official administrative resolutions directly in WhatsApp
- 📢 **Receive automated real-time WhatsApp alerts** when an administrator updates the status or posts an official resolution
- 📚 **Browse FAQs and college grievance categories**

### WhatsApp Webhook Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/whatsapp` | Meta Webhook Verification challenge handler |
| `POST` | `/api/whatsapp` | Meta Cloud API incoming message dispatcher & media receiver |
| `POST` | `/api/whatsapp/simulate` | Local WhatsApp simulator endpoint (chat testing) |
| `DELETE` | `/api/whatsapp/simulate` | Reset test chat session |
| `PAGE` | `/admin/whatsapp-simulator` | Interactive WhatsApp testing console in Admin Portal |

### WhatsApp Environment Variables

```env
WHATSAPP_PHONE_NUMBER_ID="your-meta-phone-number-id"
WHATSAPP_ACCESS_TOKEN="your-meta-cloud-api-token"
WHATSAPP_VERIFY_TOKEN="lc2_grievance_bot_verify_token_2026"
```

*Note: If `WHATSAPP_ACCESS_TOKEN` is blank, outgoing messages print to the console / simulator gracefully.*


## 📧 Email Configuration

Leave `SMTP_HOST` empty to use the **console fallback** — all emails will be printed to the terminal.

For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) with:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database (dev) | SQLite via Prisma |
| Database (prod) | MySQL 8.0 via Prisma |
| Auth | JWT + bcrypt + HTTP-only cookies |
| Email | Nodemailer |
| Validation | Zod |
| Icons | Lucide React |
| Deployment | Docker + Docker Compose |
