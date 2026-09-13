<div align="center">

# 🎓 Assignment Management System

**A professional, role-based platform for managing classes, subjects, assignments, submissions, reviews, and academic workflows — end to end.**

[![.NET](https://img.shields.io/badge/.NET-8-512BD4?logo=dotnet&logoColor=white)](#)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-8-512BD4?logo=dotnet&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-Unspecified-lightgrey)](#-license)

</div>

<p align="center">
  <img src="docs/assignment.png" alt="Assignment Management System banner" width="100%" />
</p>

<p align="center">
  <em>Learn • Assign • Submit • Review • Succeed</em>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Highlights](#-key-highlights)
- [User Roles & Capabilities](#-user-roles--capabilities)
- [System Architecture](#️-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Authentication & Authorization](#-authentication--authorization)
- [Assignment Workflow](#-assignment-workflow)
- [Core Business Rules](#️-core-business-rules)
- [Data Model](#️-mongodb-data-model)
- [Getting Started](#-getting-started)
- [Demo Accounts](#-demo-accounts)
- [Frontend Routes](#️-frontend-routes)
- [API Overview](#-api-overview)
- [Testing](#-testing)
- [Code Quality & Design Principles](#-code-quality--design-principles)
- [Security Considerations](#-security-considerations)
- [Docker Commands](#-docker--mongodb-commands)
- [Production Build](#️-production-build)
- [End-to-End Workflow](#-typical-end-to-end-workflow)
- [Current Scope & Limitations](#-current-scope--limitations)
- [Future Roadmap](#️-future-roadmap)
- [Development Guidelines](#-development-guidelines)
- [License](#-license)

---

## 📌 Overview

**Assignment Management System** is a full-stack academic workflow application built around three distinct user roles — **Admin**, **Teacher**, and **Student** — each with a purpose-built experience.

The platform centralizes academic administration and assignment workflows in a single system:

- **Administrators** control users, classes, subjects, and teacher-to-class/subject assignments.
- **Teachers** create and manage assignments, publish them, and review student submissions.
- **Students** access assignments available to their class, submit work, update submissions before deadlines, and view results.

The application pairs a **React + TypeScript** frontend with an **ASP.NET Core 8 Web API** backend, backed by **MongoDB** for persistence and **JWT-based authentication** for secure, role-aware access.

---

## ✨ Key Highlights

| | |
|---|---|
| 🔐 | JWT authentication with role-based authorization |
| 👥 | Dedicated Admin, Teacher, and Student experiences |
| 📚 | Class and subject management |
| 👨‍🏫 | Teacher-to-class/subject assignment mapping |
| 📝 | Full assignment lifecycle: Draft → Published |
| 📤 | Student submission workflow with deadline enforcement |
| ✅ | Teacher review, marks, and feedback |
| 🛡️ | Server-side ownership and access-control validation |
| 📊 | Role-specific dashboards |
| 🎨 | Responsive React UI with reusable components |
| ⚡ | React Query for server-state management |
| 🧩 | Zod + React Hook Form for typed form validation |
| 🗄️ | MongoDB repositories with application-level business rules |
| 🧪 | xUnit + Moq automated test suite |
| 📖 | Swagger / OpenAPI documentation |
| 🐳 | Docker Compose support for MongoDB |
| 🌱 | Automatic, idempotent seed data on API startup |

---

## 👤 User Roles & Capabilities

### 🔴 Admin — *Full system management*

- Manage users — create, update, activate/deactivate, delete, batch-create
- Manage classes and subjects
- Assign teachers to class + subject combinations
- View all assignments system-wide
- Access the administrative dashboard
- Maintain system-level academic configuration

### 🔵 Teacher — *Assignment ownership & review*

- View teacher dashboard and owned assignments
- Create, edit, and delete assignments
- Save assignments as Draft or Publish them
- Move published assignments back to Draft
- View and review submissions for owned assignments
- Award marks and provide feedback
- Manage teacher profile

### 🟢 Student — *Class-scoped participation*

- View student dashboard
- View published assignments for their own class
- Open assignment details and submit answers
- Update submissions before the deadline
- View own submissions, marks, and feedback
- Manage student profile

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    React + TypeScript UI                      │
│        Vite • React Router • React Query • Tailwind           │
└──────────────────────────────┬────────────────────────────────┘
                                │ REST / JSON + JWT
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                  ASP.NET Core 8 Web API                       │
│                                                                │
│  Controllers → Application Interfaces → Infrastructure        │
│  JWT Authentication • RBAC • Validation • Business Rules       │
└──────────────────────────────┬────────────────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                         MongoDB                                │
│  users • roles • classes • subjects • teacherAssignments       │
│  assignments • submissions                                     │
└──────────────────────────────────────────────────────────────┘
```

**Backend layering**

```
AssignmentManagement.Domain
        │
        ▼
AssignmentManagement.Application
        │
        ▼
AssignmentManagement.Infrastructure
        │
        ▼
AssignmentManagement.API

AssignmentManagement.Tests  →  Tests application/backend behavior
```

**Layer responsibilities**

| Layer | Responsibility |
|---|---|
| **Domain** | Entities, enums, core domain models |
| **Application** | DTOs, interfaces, application contracts, exceptions |
| **Infrastructure** | MongoDB repositories, services, JWT, password hashing, seed data |
| **API** | Controllers, authentication, authorization, middleware, Swagger, HTTP pipeline |
| **Tests** | Unit and authorization-focused automated tests |
| **Frontend** | React UI, routing, role-based pages, forms, API clients, dashboards |

---

## 🧰 Technology Stack

<table>
<tr>
<td valign="top" width="33%">

**Frontend**
- React 19
- TypeScript 5.7
- Vite 6
- React Router DOM 7
- TanStack React Query 5
- Axios
- React Hook Form
- Zod
- Tailwind CSS 4
- Three.js
- Canvas Confetti
- Oxlint

</td>
<td valign="top" width="33%">

**Backend**
- C#
- ASP.NET Core 8 Web API
- JWT Bearer Authentication
- BCrypt password hashing
- Swagger / OpenAPI
- MongoDB Driver 2.28

**Testing**
- xUnit
- Moq
- Microsoft.NET.Test.Sdk
- Coverlet Collector

</td>
<td valign="top" width="33%">

**Database**
- MongoDB
- Separate collections for users, roles, classes, subjects, teacher assignments, assignments, submissions
- Unique email index
- Unique compound submission index (assignment + student)
- Additional query-supporting indexes

**Infrastructure**
- Docker Compose
- Git
- Visual Studio / VS Code compatible

</td>
</tr>
</table>

---

## 📂 Project Structure

```
assignment-management-system/
│
├── backend/
│   ├── AssignmentManagement.sln
│   │
│   ├── AssignmentManagement.API/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── Properties/
│   │
│   ├── AssignmentManagement.Application/
│   │   ├── DTOs/
│   │   ├── Exceptions/
│   │   └── Interfaces/
│   │
│   ├── AssignmentManagement.Domain/
│   │   ├── Entities/
│   │   └── Enums/
│   │
│   ├── AssignmentManagement.Infrastructure/
│   │   ├── Data/
│   │   ├── Repositories/
│   │   └── Services/
│   │
│   └── AssignmentManagement.Tests/
│       ├── AssignmentServiceTests.cs
│       ├── AuthServiceTests.cs
│       ├── AuthorizationTests.cs
│       └── SubmissionServiceTests.cs
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── lib/
│       ├── pages/
│       │   ├── admin/
│       │   ├── teacher/
│       │   └── student/
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       ├── types/
│       └── utils/
│
├── docs/
│   └── assets/
│       └── assignment-management-banner.png
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔑 Authentication & Authorization

Authentication is implemented with **JWT Bearer tokens**.

```
User enters credentials
        ↓
POST /api/auth/login
        ↓
Credentials validated
        ↓
JWT generated
        ↓
Frontend stores authenticated session
        ↓
Axios attaches Bearer token
        ↓
API validates JWT
        ↓
Role + ownership rules applied
        ↓
Authorized resource returned
```

**Supported roles:** `Admin` · `Teacher` · `Student`

> ⚠️ Authorization is enforced **server-side**. Frontend role-based routing and UI restrictions improve user experience but are never treated as a security boundary.

---

## 🔄 Assignment Workflow

```
Teacher creates assignment
        │
        ▼
     DRAFT
        │
        │ Publish
        ▼
   PUBLISHED
        │
        │ Student sees assignment
        ▼
 Student submits answer
        │
        ▼
    SUBMITTED
        │
        │ Teacher reviews
        ▼
    REVIEWED
```

Teachers can move an assignment between **Draft** and **Published** states according to the implemented API rules.

---

## 🛡️ Core Business Rules

- Draft assignments are not visible to students.
- Students can only see published assignments belonging to their own class.
- Students cannot submit an assignment after its deadline.
- Students cannot update a submission after its deadline.
- Students can access only their own submissions.
- Teachers can view/review submissions only for assignments they are authorized to manage.
- Teachers can create/edit assignments only for class + subject combinations assigned to them.
- An assignment must be published before a student can submit it.
- A student can have only one submission per assignment (enforced via a MongoDB compound index).
- Marks cannot be negative or exceed the assignment's maximum marks.
- Inactive users cannot log in.
- Password hashes are never returned in API responses.
- Authorization is validated server-side even when the frontend hides unavailable UI actions.

---

## 🗃️ MongoDB Data Model

**Collections:** `roles` · `users` · `classes` · `subjects` · `teacherAssignments` · `assignments` · `submissions`

**Relationships**

```
Role
 └── User
      └── Class (Student)

Teacher
 └── TeacherAssignment
      ├── Class
      └── Subject

Teacher
 └── Assignment
      ├── Class
      └── Subject
           └── Submission
                └── Student
```

**Important indexes**

- Unique email index on `users`
- Assignment indexes around class, subject, teacher, deadline, and status
- Submission indexes around assignment, student, and status
- Unique compound `(assignmentId, studentId)` submission index

> MongoDB indexes and demo data are ensured by the seed service at application startup — no Entity Framework migration workflow is required.

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Notes |
|---|---|
| [.NET 8 SDK](https://dotnet.microsoft.com/download) | Required to run the backend |
| [Node.js LTS](https://nodejs.org/) | Required to run the frontend |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Recommended for MongoDB |
| [Git](https://git-scm.com/) | Version control |

Verify installations:

```bash
dotnet --version
node --version
npm --version
docker --version
```

### 1️⃣ Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd assignment-management-system
```

### 2️⃣ Start MongoDB

```bash
docker compose up -d
docker ps
```

MongoDB is exposed by default on `localhost:27017`.

```bash
# Stop MongoDB
docker compose down

# Stop and remove the persisted data volume (⚠️ resets dev data)
docker compose down -v
```

### 3️⃣ Configure the Backend

The backend reads MongoDB and JWT settings from ASP.NET Core configuration:

```json
{
  "MongoDb": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "AssignmentManagementDb"
  },
  "Jwt": {
    "Secret": "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS",
    "Issuer": "AssignmentManagementAPI",
    "Audience": "AssignmentManagementClient",
    "ExpiryMinutes": 480
  }
}
```

> 🔒 For production, use a long, randomly generated JWT secret and a proper secret manager. Never commit real production credentials.

### 4️⃣ Run the Backend

```bash
cd backend
dotnet restore
dotnet build
dotnet run --project AssignmentManagement.API
```

| Service | URL |
|---|---|
| API | http://localhost:5000 |
| Swagger | http://localhost:5000/swagger |

The API performs idempotent startup seeding for roles, demo users, classes, subjects, teacher assignments, and a sample published assignment.

### 5️⃣ Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite typically serves the frontend at `http://localhost:5173`.

Create `frontend/.env` from `frontend/.env.example` if needed:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> Note: the frontend uses Vite environment variables, so the correct prefix is `VITE_`, not `NEXT_PUBLIC_`.

### 6️⃣ Verify the Application

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| Swagger | http://localhost:5000/swagger |

Open the frontend and sign in using one of the seeded accounts below.

---

## 🔐 Demo Accounts

The seed service creates these demo users automatically on first API startup.

| Role | Name | Email | Password |
|---|---|---|---|
| Admin | System Administrator | `admin@assignment.local` | `Admin@123` |
| Teacher | Prof. Robert Davis | `teacher@assignment.local` | `Teacher@123` |
| Teacher | Dr. Elena Rostova | `teacher2@assignment.local` | `Teacher@123` |
| Student | Alex Morgan | `student@assignment.local` | `Student@123` |
| Student | Sarah Connor | `student2@assignment.local` | `Student@123` |
| Student | David Chen | `student3@assignment.local` | `Student@123` |

**Seeded academic data**

- Classes: `CSE-6`, `CSE-7`
- Subjects: `Web Engineering`, `Database Systems`
- Teacher/class/subject assignments for the demo teachers
- Sample published assignment: *REST API Development*

> These credentials and records are intended for local development/demo use only.

---

## 🖥️ Frontend Routes

**Public**

| Route | Purpose |
|---|---|
| `/login` | Login screen |
| `/unauthorized` | Unauthorized access page |

**Shared (authenticated)**

| Route | Purpose |
|---|---|
| `/profile` | Current-user profile and account management |

**Admin**

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Admin overview |
| `/admin/users` | User management |
| `/admin/classes` | Class management |
| `/admin/subjects` | Subject management |
| `/admin/teacher-assignments` | Teacher/class/subject assignment management |
| `/admin/assignments` | Assignment overview |

**Teacher**

| Route | Purpose |
|---|---|
| `/teacher/dashboard` | Teacher overview |
| `/teacher/assignments` | Manage assignments |
| `/teacher/assignments/create` | Create assignment |
| `/teacher/assignments/:id/submissions` | Review assignment submissions |

**Student**

| Route | Purpose |
|---|---|
| `/student/dashboard` | Student overview |
| `/student/assignments` | View available assignments |
| `/student/submissions` | View own submissions |

---

## 📡 API Overview

The backend exposes REST endpoints under `/api`.

| Module | Endpoint | Access |
|---|---|---|
| Authentication | `POST /api/auth/login` | Public |
| Users | `/api/users` | Admin |
| Classes | `/api/classes` | Authenticated; write access for Admin |
| Subjects | `/api/subjects` | Authenticated; write access for Admin |
| Teacher Assignments | `/api/teacher-assignments` | Admin |
| Assignments | `/api/assignments` | Authenticated; write access for Teacher |
| Submissions | `/api/submissions` | Role-specific |
| Profile | `/api/profile` | Authenticated user |

**Example — Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@assignment.local",
  "password": "Admin@123"
}
```

Protected requests use:

```http
Authorization: Bearer <JWT_TOKEN>
```

> For complete request/response schemas, open Swagger while the backend is running.

---

## 🧪 Testing

Run all backend tests from the `backend` directory:

```bash
cd backend
dotnet test
```

The test project covers key authentication, authorization, assignment, and submission behavior, including:

- Invalid login rejection
- Inactive-user login rejection
- Teacher authorization for assignment creation
- Draft assignment visibility rules
- Cross-class student access restrictions
- Deadline validation
- Duplicate submission rejection
- Student ownership checks
- Teacher submission-review authorization
- Marks exceeding maximum marks
- Controller authorization contracts

---

## 🔍 Code Quality & Design Principles

<table>
<tr>
<td valign="top" width="50%">

**Backend**
- Thin API controllers
- Dependency injection
- Repository abstractions
- Service-layer business rules
- DTO-based API contracts
- JWT authentication & role-based authorization
- BCrypt password hashing
- Centralized exception middleware
- Idempotent startup seeding
- MongoDB indexing for uniqueness/query constraints

</td>
<td valign="top" width="50%">

**Frontend**
- Feature-oriented page organization
- Reusable UI components
- Protected & role-based route guards
- Centralized Axios client
- React Query for API/server state
- React Hook Form + Zod validation
- Shared TypeScript types
- Toast and error-state components
- Responsive shell with sidebar/topbar navigation

</td>
</tr>
</table>

---

## 🔐 Security Considerations

This project is configured for **local development and demonstration**. Before production deployment:

- [ ] Replace demo JWT secrets with strong, randomly generated secrets
- [ ] Store secrets in environment variables or a proper secret manager
- [ ] Never commit production credentials
- [ ] Use HTTPS in production
- [ ] Restrict CORS to trusted production origins
- [ ] Consider refresh-token rotation for long-lived sessions
- [ ] Add rate limiting and abuse protection on authentication endpoints
- [ ] Review MongoDB network exposure and authentication configuration
- [ ] Remove or restrict demo accounts and seed data in production
- [ ] Review logging to ensure credentials and tokens are never logged

---

## 🐳 Docker / MongoDB Commands

```bash
# Start MongoDB
docker compose up -d

# View running containers
docker ps

# View MongoDB logs
docker logs assignment-management-mongodb

# Stop services
docker compose down

# Reset MongoDB development data
docker compose down -v
docker compose up -d
```

---

## 🏗️ Production Build

**Frontend**

```bash
cd frontend
npm install
npm run build
npm run preview   # preview the production build locally
```

**Backend**

```bash
cd backend
dotnet restore
dotnet build --configuration Release
```

> For deployment, configure production MongoDB, JWT, CORS, HTTPS, and secret-management settings through the target environment rather than committing sensitive configuration.

---

## 🧭 Typical End-to-End Workflow

```
1.  Admin logs in
2.  Admin creates users/classes/subjects
3.  Admin assigns Teacher → Class + Subject
4.  Teacher logs in
5.  Teacher creates an assignment
6.  Teacher saves Draft or publishes it
7.  Student logs in
8.  Student sees published assignments for own class
9.  Student submits answer before deadline
10. Teacher opens submissions
11. Teacher reviews, marks, and provides feedback
12. Student views submission result
```

---

## 🚧 Current Scope & Limitations

The current implementation focuses on the core assignment-management workflow.

**Not currently included as a core workflow:**

- File attachment submission
- Email notifications
- Real-time notifications
- Advanced analytics/reporting
- Refresh-token rotation
- Full production deployment infrastructure
- Advanced pagination/filtering across every list endpoint

> The current submission model is text-answer based.

---

## 🗺️ Future Roadmap

- [ ] File upload support for assignment submissions
- [ ] Email and in-app notifications
- [ ] Advanced dashboard analytics
- [ ] Assignment search, filtering, sorting, and pagination
- [ ] Refresh tokens and session management improvements
- [ ] Audit logs
- [ ] Richer teacher grading workflows
- [ ] Calendar/deadline visualization
- [ ] Production Docker images for API and frontend
- [ ] CI/CD pipeline
- [ ] Expanded integration/end-to-end tests
- [ ] Automated database backup strategy

---

## 🤝 Development Guidelines

When extending the system:

- Keep domain entities free from infrastructure concerns.
- Put business rules in application/infrastructure services rather than controllers.
- Keep API contracts represented by DTOs.
- Add authorization at the API level for every protected operation.
- Validate ownership server-side.
- Add or update tests for new business rules.
- Keep frontend API calls inside the API/service layer.
- Reuse shared UI components instead of duplicating presentation logic.
- Never expose password hashes or sensitive authentication data.
- Keep environment-specific configuration outside source-controlled secrets.

---

## 📄 License

No explicit open-source license is currently defined in this repository.

If this project is intended for public distribution, add an appropriate `LICENSE` file and update this section accordingly.

---

<div align="center">

### 👨‍💻 Project Summary

**Assignment Management System** provides a structured digital workflow for academic assignment administration, teaching, submission, and evaluation.

It combines a role-aware React frontend with an ASP.NET Core 8 API and MongoDB backend, emphasizing clean separation of concerns, server-side authorization, predictable assignment workflows, and a maintainable codebase.

<br />

**Learn • Assign • Submit • Review • Succeed**

</div>
