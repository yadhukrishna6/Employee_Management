# 🏢 Emplyo — Enterprise Multi-Tenant Workforce & HRMS Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-emplyo--peach.vercel.app-blue?style=for-the-badge&logo=vercel)](https://emplyo-peach.vercel.app/)
[![Backend API](https://img.shields.io/badge/API%20Status-Healthy-emerald?style=for-the-badge&logo=render)](https://emplyo-backend.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

**Emplyo** is a production-ready, full-stack multi-tenant Human Capital Management (HRMS) & Workforce Operations SaaS platform built with **React 18, Vite, TypeScript, Tailwind CSS, Express, Prisma ORM, and PostgreSQL**.

---

## 🌐 Live Cloud Deployments

| Component | Provider | Live URL |
| :--- | :--- | :--- |
| **Frontend Application** | Vercel | 🔗 **[https://emplyo-peach.vercel.app](https://emplyo-peach.vercel.app)** |
| **Self-Service Sign Up** | Vercel | 🔗 **[https://emplyo-peach.vercel.app/register](https://emplyo-peach.vercel.app/register)** |
| **Backend REST API** | Render | 🔗 **[https://emplyo-backend.onrender.com](https://emplyo-backend.onrender.com)** |
| **Database** | Neon Cloud | 🐘 **Serverless PostgreSQL (AWS us-east-2)** |

---

## 👥 Instant Demo Accounts (Pre-Seeded)

Test any role directly on the **[Emplyo Live Portal](https://emplyo-peach.vercel.app/login)** using 1-click demo buttons:

| Role | Email | Password | Org Slug | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@example.com` | `Password@123` | *(None)* | System-wide cross-tenant governance, org provisioning & management |
| **Org Admin** | `admin@example.com` | `Password@123` | `ABCTECH` | Company settings, audit trails, full workforce control & permissions |
| **HR Director** | `hr@example.com` | `Password@123` | `ABCTECH` | Employee directory, attendance tracker, department management, leave reviews |
| **Team Manager** | `manager@example.com` | `Password@123` | `ABCTECH` | Team approvals, direct report hierarchy, performance appraisals |
| **Staff Employee** | `employee@example.com` | `Password@123` | `ABCTECH` | Daily punch clock, leave requests, payslip history, self-service dashboard |

---

## ✨ Key Platform Features

### 🏢 Multi-Tenant Data Isolation
- Strict organization-level data segregation (`organizationId`) across all business models.
- **Self-Service Tenant Onboarding** (`/register`): Atomic onboarding transaction that provisions the company workspace, default leave policies, and administrator account in a single operation.

### 🌳 Visual Organization Chart & Hierarchy
- Interactive multi-level reporting tree with zoom controls and list/tree view toggles.
- Role-specific hierarchy badges (**Executive**, **Manager**, **Individual Contributor**).
- Direct manager assignment and reporting lines.

### ⏱️ Smart Attendance Tracker
- Status-aware daily punch clock (Punch In / Active / Punch Out / Completed).
- Precision working hours calculator with automatic status assignment (`PRESENT` $\ge$ 4 hrs, `HALF_DAY` $<$ 4 hrs).
- Monthly statistics summaries: Present Days, Half Days, Absent Days, and Logged Hours.

### 🌴 Leave Management & Approval Workflows
- Multi-type leave balance engine (Casual, Sick, Annual, Unpaid).
- Overlap prevention validation and real-time balance deductions upon manager approval.

### 💰 Payroll & Payslips
- Configurable salary structures (Basic Pay, Allowances, Deductions).
- Automated monthly payslip generation with gross-to-net pay breakdowns.

### 📈 Performance Appraisals
- 4-pillar review scoring (Technical Skill, Communication, Teamwork, Problem Solving).
- Weighted score calculation with managerial feedback and review history.

### 🔒 Security & Architecture
- JWT Access Token (1d) + Token-Rotated Refresh Token (7d) session management.
- BCrypt password hashing, Helmet HTTP protection headers, and immutable Audit Trail logging.
- Universal high-definition corporate dummy avatar system.

---

## 🏗️ Technical Architecture

```mermaid
graph TD
    User([🌐 Browser / Client])
    Vercel[⚡ Vercel Frontend SPA<br/>React 18 + Vite + Tailwind CSS]
    Render[🚀 Render Express Backend<br/>Node.js + TypeScript + Zod]
    Neon[(🐘 Neon PostgreSQL<br/>Serverless Cloud Database)]

    User -->|HTTPS| Vercel
    Vercel -->|REST API + JWT| Render
    Render -->|Prisma ORM Pooler| Neon
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack React Query, React Router v6, React Hook Form, Zod, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod, JWT (JSON Web Tokens), BCrypt.js, Helmet, Morgan, CORS |
| **Database** | PostgreSQL 16 (Neon Serverless Cloud with Connection Pooling) |
| **Deployment** | Vercel (Frontend SPA), Render (Backend Web Service), Neon (Cloud PostgreSQL) |

---

## 💻 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/yadhukrishna6/Employee_Management.git
cd Employee_Management
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with your PostgreSQL connection string
# DATABASE_URL="postgresql://user:password@localhost:5432/employee_management?schema=public"
# PORT=5000
# JWT_SECRET="your_jwt_secret_key"
# JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"

# Generate Prisma client and push schema
npx prisma db push

# Seed sample enterprise data
npm run prisma:seed

# Start backend server
npm run dev
```
Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# (Optional) set VITE_API_URL in .env if running on custom port
# VITE_API_URL="http://localhost:5000/api"

# Start Vite dev server
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 📡 REST API Documentation

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new Organization & Administrator
- `POST /api/auth/login` — Authenticate user and receive JWT token pair
- `POST /api/auth/refresh` — Refresh access token via token rotation
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/change-password` — Change user password
- `POST /api/auth/logout` — Revoke refresh token and terminate session

### 👥 Employees & Departments (`/api/employees`, `/api/departments`)
- `GET /api/employees` — Paginated directory with search & department filters
- `POST /api/employees` — Onboard new employee + optional login user
- `GET /api/employees/:id` — Full employee dossier with department and manager
- `GET /api/employees/hierarchy/tree` — Multi-tenant organization tree structure
- `GET /api/departments` — Department list with manager & headcount stats

### ⏱️ Attendance & Leaves (`/api/attendance`, `/api/leaves`)
- `POST /api/attendance/check-in` — Daily punch clock check-in
- `POST /api/attendance/check-out` — Daily punch clock check-out with hours calculation
- `GET /api/attendance/my` — Employee's personal chronological attendance
- `GET /api/attendance/summary` — Aggregated monthly attendance metrics
- `POST /api/leaves` — Submit leave request with balance validation
- `PATCH /api/leaves/:id/approve` — Approve pending leave request
- `PATCH /api/leaves/:id/reject` — Reject leave request with feedback

### 💵 Payroll & Performance (`/api/payroll`, `/api/performance`)
- `POST /api/payroll/salary` — Configure employee salary structure
- `POST /api/payroll/payslips/generate` — Generate monthly payslip
- `GET /api/payroll/payslips` — List organization or personal payslips
- `POST /api/performance` — Submit appraisal review with 4-pillar ratings
- `GET /api/dashboard` — Role-customized dashboard analytical summaries

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
