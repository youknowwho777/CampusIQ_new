# CampusIQ — Smart Academic Management System

CampusIQ is a full-stack, presentation-ready academic management web application built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**.

---

## 🌟 Demo Credentials for Evaluation

For rapid demonstration and grading, the login page features **one-click demo autofill buttons**, or you may sign in manually using the credentials below:

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@campusiq.edu` | `Password123!` | System administrator with full institutional control |
| **TEACHER** | `turing@campusiq.edu` | `Password123!` | Dr. Alan Turing (Instructs CS101) |
| **TEACHER** | `hopper@campusiq.edu` | `Password123!` | Dr. Grace Hopper (Instructs CS401) |
| **TEACHER** | `knuth@campusiq.edu` | `Password123!` | Dr. Donald Knuth (Instructs CS201) |
| **TEACHER** | `lovelace@campusiq.edu` | `Password123!` | Dr. Ada Lovelace (Instructs CS301) |
| **TEACHER** | `shannon@campusiq.edu` | `Password123!` | Dr. Claude Shannon (Instructs CS501) |
| **STUDENT** | `student1@campusiq.edu` | `Password123!` | Alexander Smith (`CIQ-2026-001`) |
| **STUDENT** | `student2@campusiq.edu` | `Password123!` | Emma Watson (`CIQ-2026-002`) |
| **PENDING** | `sarah.connor@campusiq.edu` | `Password123!` | Student awaiting Admin approval |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** (v14+ running on port `5432` with database `campusiq`)

---

### Step 1: Database Setup
1. Ensure PostgreSQL is running on `127.0.0.1:5432`.
2. Create database `campusiq` (if not already present):
   ```sql
   CREATE DATABASE campusiq;
   ```
3. Configure `backend/.env` (pre-configured with local default):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campusiq?schema=public"
   ```

---

### Step 2: Backend Setup & Seeding
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run Prisma database migrations
npx prisma migrate dev --name init

# Seed database with realistic presentation data (Admin, 5 Teachers, 20 Students, Enrollments, Attendance & Marks)
npm run seed

# Run automated backend test suite (optional verification)
node test-backend.js

# Start backend server
npm run dev
```
The backend API server will start on **`http://localhost:5000`** (Health endpoint: `http://localhost:5000/api/health`).

---

### Step 3: Frontend Setup & Launch
Open a second terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend portal will start at **`http://localhost:5173`**.

---

## 🎯 Role-Based Architecture & Features

### 1. 🛡️ Administrator (`ADMIN`)
- **System Dashboard**: Institutional statistics (active students, active teachers, active courses, pending applications, overall attendance rate).
- **User Directory**: View, filter, edit, and deactivate/reactivate students and teachers. Direct creation of faculty and student accounts.
- **Pending Registrations**: Review student self-registrations. Approve (grants immediate login eligibility) or Reject (blocks portal access).
- **Course Management**: Full CRUD operations on academic courses (e.g. `CS101`, `CS201`, `CS301`).
- **Faculty Course Assignment**: Allocate teachers to academic courses.
- **Student Course Enrollment**: Enroll active students into courses.
- **Audit Logs**: System-wide inspection of all recorded attendance and assessment marks across all subjects.

### 2. 👨‍🏫 Teacher (`TEACHER`)
- **Enforced Access Boundaries**: Teachers can **only** view and modify courses and students assigned to them.
- **Course Roster**: Inspect enrolled students with roll numbers and contact emails.
- **Daily Attendance Marking**: Select assigned course and date, view existing registers or mark new ones (`PRESENT`, `ABSENT`, `LATE`), bulk quick-fill buttons, real-time database upsert.
- **Grading & Marks**: Enter and update student scores with assessment name and maximum marks. Enforces validation rules (`0 <= obtainedMarks <= maxMarks`).

### 3. 🎓 Student (`STUDENT`)
- **Academic Dashboard**: Overview of enrolled subjects, attendance standing indicator (with $\ge 75\%$ threshold warning), and cumulative grade average.
- **Course-Wise Attendance**: Detailed metrics per course (Total sessions, Present, Absent, Late, Attendance Percentage $\frac{\text{Present}}{\text{Total}} \times 100$) plus session-by-session history log.
- **Academic Grades**: Assessment breakdowns per course with percentage scores and cumulative grade performance rating.
- **Student Profile**: Academic identity card with verified roll number and enrollment records.

---

## 🔒 Security & Authorization Highlights

1. **Server-Enforced RBAC**: The backend database is the sole source of truth for user roles. Client-supplied roles in request bodies are ignored.
2. **Dual-Layer Authentication**: Supports `HttpOnly` secure cookies and `Authorization: Bearer <token>` headers.
3. **Strict Course Boundaries**: Teachers attempting to record marks or attendance for unassigned courses are rejected with `403 Forbidden`.
4. **Registration Gate**: Student registrations default to `PENDING` status. No JWT token is issued upon registration, and authentication attempts are blocked until an administrator approves the application.
5. **Robust Validation**: Powered by `Zod` schema validation preventing malformed requests or invalid score ranges.

---

## 🧪 Verification & Automated Testing

The project includes an integration and security test suite (`backend/test-backend.js`) verifying:
- [x] Common authentication & JWT issuance.
- [x] Rejection of incorrect passwords (`401`).
- [x] Blocking pending & rejected student accounts (`403`).
- [x] Role-Based Access Control boundaries (Students/Teachers blocked from Admin APIs).
- [x] Teacher unassigned course protection (`403`).
- [x] Attendance upsert & calculation verification.
- [x] Marks entry & boundary limits (`obtained <= max`).
- [x] Admin approval workflow (Pending $\to$ Active $\to$ Login allowed).

Run tests anytime with:
```bash
cd backend
node test-backend.js
```

---

## 📁 Repository Structure
```
c:\SE Project\
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/ (db.js, jwt.js)
│   │   ├── controllers/ (auth, admin, teacher, student)
│   │   ├── middleware/ (auth, rbac, validate, error)
│   │   ├── routes/ (auth, admin, teacher, student)
│   │   ├── utils/ (token.js, response.js)
│   │   ├── validators/ (authValidators, academicValidators)
│   │   └── server.js
│   ├── test-backend.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ (Sidebar, Header, StatCard, Badge, Modal, Alert, LoadingSpinner)
│   │   ├── context/ (AuthContext.jsx)
│   │   ├── layouts/ (DashboardLayout.jsx)
│   │   ├── pages/ (auth, admin, teacher, student)
│   │   ├── services/ (api.js)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── PROJECT_STATUS.md
├── AI_HANDOFF.md
└── README.md
```
