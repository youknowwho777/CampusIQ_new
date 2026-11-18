# CampusIQ — AI Agent Handoff Guide

## Project State
The MVP for **CampusIQ — Smart Academic Management System** is complete, fully functional, and verified.

## Quick References
- **Backend Port**: `5000` (`http://localhost:5000/api`)
- **Frontend Port**: `5173` (`http://localhost:5173`)
- **Database**: PostgreSQL 18 on `127.0.0.1:5432/campusiq`
- **Prisma Schema**: `backend/prisma/schema.prisma`
- **Seed Script**: `backend/prisma/seed.js`
- **Automated Tests**: `backend/test-backend.js` (Run `node test-backend.js` inside `backend`)
- **Frontend Build**: Verified with `npm run build` in `frontend`

## Demo Login Credentials
- **Admin**: `admin@campusiq.edu` / `Password123!`
- **Teacher**: `turing@campusiq.edu` / `Password123!` (assigned to CS101)
- **Student**: `student1@campusiq.edu` / `Password123!` (Alexander Smith)
- **Pending Student (for approval demo)**: `sarah.connor@campusiq.edu` / `Password123!`

## Guidelines for Subsequent Agents
1. Before modifying database schema, generate a new Prisma migration with `npx prisma migrate dev`.
2. Do not remove the RBAC checks in controllers:
   - Teacher must be verified on `CourseTeacher` before editing attendance or marks.
   - All submitted student IDs in attendance/marks must belong to `Enrollment` for that course.
   - Student can only query their own ID derived from `req.user.id`.
3. Keep `PROJECT_STATUS.md` updated after any future feature additions.
