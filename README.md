# 🏢 Enterprise Multi-Tenant Employee Management System

A production-style Multi-Tenant Human Capital SaaS application built with **Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, React 18, Vite, Tailwind CSS, TanStack Query, and React Hook Form**.

---

## 🌟 Key Features

* **Strict Multi-Tenancy**: Organization-level data isolation (`organizationId`) across all business entities.
* **Role-Based Access Control (RBAC)**: Enforced authoritative backend permissions for `SUPER_ADMIN`, `ORGANIZATION_ADMIN`, `HR`, `MANAGER`, and `EMPLOYEE`.
* **JWT Authentication & Token Rotation**: Secure short-lived Access Tokens (1d) + long-lived Refresh Tokens (7d) with database-backed rotation.
* **Employee Directory**: Paginated directory with live search debounce, department/status filters, auto-generated employee codes, and provisioned user login accounts.
* **Attendance Engine**: Interactive check-in/out widget, working hours calculation, and monthly statistical summaries.
* **Leave Management**: Leave balance tracking, date overlap validation, and multi-tier approval/rejection workflows.
* **Payroll & Payslips**: Salary structure configuration (Basic, Allowances, Deductions) and monthly payslip generation.
* **Performance Reviews**: Periodic appraisal system with 4-pillar ratings (Technical, Communication, Teamwork, Problem Solving) and overall scoring.
* **Live Notifications & Audit Trail**: Real-time unread alert counter and immutable system audit logs.

---

## 🏗️ Architecture & Technology Stack

```text
employee-management/
│
├── backend/                  <-- Express + TypeScript + Prisma ORM + PostgreSQL
│   ├── prisma/
│   │   ├── schema.prisma     <-- 13 relational models + indexes + enums
│   │   └── seed.ts           <-- Enterprise test seeder script
│   └── src/
│       ├── config/           <-- Database client & Zod-validated env
│       ├── middleware/       <-- Auth, RBAC, Zod validation, Error handling
│       ├── modules/          <-- 12 feature domains (Controller-Service-Route)
│       └── utils/            <-- Response helpers, logger, JWT & bcrypt
│
└── frontend/                 <-- React 18 + Vite + TypeScript + Tailwind CSS
    └── src/
        ├── components/ui/    <-- Reusable design system (Button, Modal, Table, etc.)
        ├── context/          <-- Global AuthContext & token management
        ├── layouts/          <-- Responsive DashboardLayout, Sidebar & Topbar
        ├── pages/            <-- Role-based pages & dashboards
        ├── routes/           <-- Role-protected React Router routes
        └── services/         <-- Typed Axios API clients & TanStack Query hooks
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Node.js** (v18.x or v20.x+)
* **PostgreSQL** instance running locally or on cloud (Supabase/Neon/Railway/Docker)

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and adjust your DATABASE_URL:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/employee_management?schema=public"

# Run database migrations to create tables
npx prisma migrate dev --name init

# Seed database with demo enterprise organization & role accounts
npm run prisma:seed

# Start backend development server (with hot reload)
npm run dev
```
Backend API will be live at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend Vite development server
npm run dev
```
Frontend UI will be live at: `http://localhost:5173`

---

## 👥 Demo Credentials (Pre-Seeded)

| Role | Email | Password | Organization Code |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@example.com` | `Password@123` | *(None / System-wide)* |
| **Org Admin** | `admin@example.com` | `Password@123` | `ABCTECH` |
| **HR Manager** | `hr@example.com` | `Password@123` | `ABCTECH` |
| **Manager** | `manager@example.com` | `Password@123` | `ABCTECH` |
| **Employee** | `employee@example.com` | `Password@123` | `ABCTECH` |

*(Tip: You can also use the one-click demo login buttons on the `/login` page!)*

---

## 📡 Key REST API Endpoints

### Authentication
* `POST /api/auth/register` - Register new Organization & Admin
* `POST /api/auth/login` - Login with email & password
* `POST /api/auth/refresh` - Rotate refresh token
* `GET /api/auth/me` - Get current user profile
* `POST /api/auth/change-password` - Update password

### Employees & Departments
* `GET /api/employees` - List employees (search, pagination, filters)
* `POST /api/employees` - Create employee + optional login account
* `GET /api/departments` - List departments with manager & headcounts

### Attendance & Leaves
* `POST /api/attendance/check-in` - Daily check in
* `POST /api/attendance/check-out` - Daily check out & hours calculation
* `GET /api/attendance/summary` - Monthly attendance metrics
* `POST /api/leaves` - Apply for leave (with balance & overlap checks)
* `PATCH /api/leaves/:id/approve` - Approve leave request
* `PATCH /api/leaves/:id/reject` - Reject leave request

### Payroll, Performance & Analytics
* `GET /api/dashboard` - Role-tailored dashboard aggregations
* `POST /api/payroll/salary` - Configure employee salary structure
* `POST /api/payroll/payslips/generate` - Generate monthly payslip
* `POST /api/performance` - Submit employee review & scores
