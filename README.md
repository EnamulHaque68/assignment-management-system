# Assignment & Submission Management System

A role-based assignment and submission management system built with **ASP.NET Core Web API + MongoDB** on the backend and **Next.js + TypeScript** on the frontend.

> **Status:** Backend is fully implemented (auth, RBAC, all APIs, business rules, seed data, unit tests, Swagger). Frontend is the next phase — see [Roadmap](#roadmap) below.

## Project Overview

Admins manage users, classes, subjects, and which teacher is assigned to which class/subject. Teachers create assignments (as Draft or Published) for their assigned classes and review student submissions with marks and feedback. Students see published assignments for their own class, submit answers before the deadline, and can update their submission until the deadline passes.

## Features

**Admin**
- Manage users (create/edit/delete/activate)
- Manage classes and subjects
- Assign teachers to a class + subject
- Full visibility into all assignments and submissions

**Teacher**
- Create assignments, save as Draft or Publish
- Edit / delete own assignments
- View submissions for their assignments
- Give marks and feedback, mark as Reviewed/Rejected

**Student**
- View published assignments for their own class only
- Submit an answer before the deadline
- Update their submission until the deadline
- View status, marks, and feedback once reviewed

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS *(next phase)* |
| Backend | ASP.NET Core 8 Web API, C# |
| Database | MongoDB |
| Auth | JWT + Role-Based Authorization |
| Testing | xUnit + Moq |
| API Docs | Swagger / OpenAPI |

## Architecture

```
Next.js (frontend)
      |
      | REST API / JSON
      v
ASP.NET Core Web API
      |
      +-- JWT Authentication
      +-- Role Authorization (Admin / Teacher / Student)
      +-- Controllers (thin)
      +-- Application Services (business rules)
      +-- Repositories
      |
      v
   MongoDB
```

Clean-architecture style layering:

```
AssignmentManagement.Domain          <- Entities, enums (no dependencies)
AssignmentManagement.Application     <- DTOs, service/repository interfaces, exceptions
AssignmentManagement.Infrastructure  <- MongoDB repositories, services, JWT, seeding
AssignmentManagement.API             <- Controllers, Program.cs, middleware, Swagger
AssignmentManagement.Tests           <- xUnit + Moq unit tests
```

## Project Structure

```
assignment-submission-management-system/
|
+-- backend/
|   +-- AssignmentManagement.sln
|   +-- AssignmentManagement.API/
|   +-- AssignmentManagement.Application/
|   +-- AssignmentManagement.Domain/
|   +-- AssignmentManagement.Infrastructure/
|   +-- AssignmentManagement.Tests/
|
+-- frontend/                  (to be added)
+-- database/seed/
+-- docs/screenshots/
+-- docker-compose.yml
+-- .gitignore
+-- .env.example
+-- README.md
```

## Prerequisites

- [.NET SDK 8+](https://dotnet.microsoft.com/download)
- [Node.js LTS](https://nodejs.org/) (for the upcoming frontend)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or a local MongoDB install)
- Git

## MongoDB Setup

**Option A — Docker (recommended):**

```bash
docker compose up -d
docker ps
```

MongoDB will be available at:

```
mongodb://admin:admin123@localhost:27017/
```

**Option B — Local MongoDB Community Server**, available at `mongodb://localhost:27017` (update `appsettings.json` / `MONGODB_CONNECTION_STRING` accordingly if auth isn't enabled).

> ⚠️ These are demo credentials for local development only — never use them in production, and never commit real production credentials.

## Backend Setup

```bash
cd backend
dotnet restore
dotnet build
dotnet run --project AssignmentManagement.API
```

On first run, the API automatically **seeds roles, demo users, a demo class/subject, a teacher assignment, and a sample assignment** — no manual migration step is needed (MongoDB doesn't use EF Core migrations; see `SeedService`). The seed is idempotent — it's safe to restart the API repeatedly without creating duplicates.

The API listens on `http://localhost:5000` by default (see `Properties/launchSettings.json`).

## Swagger

Open:

```
http://localhost:5000/swagger
```

To test protected endpoints:
1. `POST /api/auth/login` with one of the demo accounts below.
2. Copy the returned `token`.
3. Click **Authorize** in Swagger and enter `Bearer YOUR_TOKEN`.
4. Call any protected endpoint.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@assignment.local` | `Admin@123` |
| Teacher | `teacher@assignment.local` | `Teacher@123` |
| Student | `student@assignment.local` | `Student@123` |

These are seeded automatically at startup — demo credentials only, not for production use.

## API Overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/login` |
| Users *(Admin)* | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/{id}` |
| Classes | `GET /api/classes` (any role), `POST/PUT/DELETE` (Admin) |
| Subjects | `GET /api/subjects` (any role), `POST/PUT/DELETE` (Admin) |
| Teacher Assignments *(Admin)* | `GET/POST /api/teacher-assignments`, `DELETE /api/teacher-assignments/{id}` |
| Assignments | `GET /api/assignments`, `GET /api/assignments/{id}`, `POST/PUT/DELETE` (Teacher), `PATCH /{id}/publish`, `PATCH /{id}/draft` |
| Submissions | `POST /api/submissions` (Student), `PUT /api/submissions/{id}` (Student), `GET /api/submissions/my` (Student), `GET /api/submissions/assignment/{id}` (Teacher), `PUT /api/submissions/{id}/review` (Teacher) |

Full request/response shapes are documented live in Swagger.

## Business Rules Implemented

1. A Draft assignment is never visible to Students.
2. A Student only sees Published assignments for their own class.
3. A Student cannot submit after the assignment deadline.
4. A Student can update their submission only before the deadline.
5–6. A Student can never view or modify another student's submission.
7. A Teacher can only view/review submissions for assignments they own.
8. Marks can never exceed `MaximumMarks` (or be negative).
9. A Teacher can only create/edit assignments for a class+subject they're assigned to (via `TeacherAssignment`).
10. An assignment must be Published before a Student can submit to it.
11. One student can have exactly one submission per assignment — enforced both in the service layer and by a **unique compound MongoDB index** on `(assignmentId, studentId)`.
12. Inactive users cannot log in.

## Testing

```bash
cd backend
dotnet test
```

Test coverage (`AssignmentManagement.Tests`) includes: invalid/inactive login rejection, teacher-assignment authorization for creating assignments, draft-hidden-from-student, cross-class access denial, submit-before/after-deadline, duplicate-submission rejection, update-own-vs-others'-submission, teacher review authorization, and marks-exceeding-maximum rejection — plus authorization-contract tests confirming each controller action carries the correct `[Authorize(Roles = ...)]` requirement.

## MongoDB Design Notes

- Database: `AssignmentManagementDb`. Collections: `users`, `roles`, `classes`, `subjects`, `teacherAssignments`, `assignments`, `submissions`.
- Collections are kept separate (not deeply embedded) for easier authorization, indexing, and querying — documents reference each other by id.
- Indexes: unique `email` on `users`; `classId`/`subjectId`/`teacherId`/`deadline`/`status` on `assignments`; `assignmentId`/`studentId`/`status` on `submissions`, plus the unique compound `(assignmentId, studentId)` index.
- No EF Core migrations — `SeedService` ensures indexes and demo data exist at startup.

## Assumptions

1. Each student belongs to exactly one class.
2. A teacher may only create assignments for class/subject combinations an Admin has assigned to them.
3. Only Published assignments are visible to students.
4. Students cannot submit or update after the deadline.
5. Each student can have one submission per assignment.
6. A teacher can only review submissions for assignments they are authorized for.
7. Maximum marks must be greater than zero.
8. Marks cannot exceed maximum marks.
9. Submissions are text-based answers in this version; file upload is not implemented.
10. Notifications are out of scope for this version.
11. Admin has full read access to all assignments and submissions.

## Known Limitations

- Frontend (Next.js) is not yet implemented — this repository currently ships the backend only.
- File attachment submissions are not implemented (text answers only).
- Email / real-time notifications are not implemented.
- Advanced analytics dashboards are not implemented.
- No rate limiting / refresh-token rotation (a single JWT with an 8-hour expiry is used, suitable for this recruitment assignment).

## Roadmap

- [ ] Next.js + TypeScript + Tailwind frontend (Login, Admin/Teacher/Student dashboards)
- [ ] Central frontend API client + typed services
- [ ] Responsive polish
- [ ] Screenshots in `docs/screenshots/`
- [ ] Optional: pagination/filtering on list endpoints, full Docker Compose for backend+frontend

## Security Notes

- Passwords are hashed with BCrypt; password hashes are never returned in any API response.
- All authorization is enforced **server-side** via `[Authorize(Roles = ...)]` and service-layer ownership checks — the frontend's role-based UI is for UX only, not a security boundary.
- CORS is restricted to the frontend origin (`http://localhost:3000` by default).
- `appsettings.json` in this repo contains local-development-only demo secrets. For any real deployment, replace `Jwt:Secret` and the MongoDB credentials with values from environment variables / a secrets manager, and never commit them.
