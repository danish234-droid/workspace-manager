# Workspace Manager — Full-Stack Project & Workspace Management

A production-ready, full-stack Workspace & Project Management platform featuring Kanban boards, task scheduling, calendars, real-time collaboration, team roles, and secure MongoDB persistence.

The project is cleanly decoupled into two standalone applications ready for independent development and separate deployment:
- **`frontend/`**: Next.js 16 (App Router), React 19, Redux Toolkit, Tailwind CSS v4, Lucide Icons.
- **`backend/`**: Express.js REST API, TypeScript, MongoDB & Mongoose ORM, JWT Authentication, bcrypt password hashing.

---

## 📁 Repository Structure

```text
workspace-manager/
├── frontend/                     # Next.js Frontend Application
│   ├── app/                      # App router (login, signup, dashboard, workspaces, projects)
│   ├── components/               # UI, Kanban board, tasks, modals, navigation
│   ├── hooks/                    # Redux hooks, shortcuts, permissions
│   ├── lib/                      # API client (lib/api.ts), mock fallback data
│   ├── store/                    # Redux Toolkit slices (auth, workspace, project, task, ui)
│   ├── types/                    # TypeScript interfaces & types
│   ├── utils/                    # Persistence, dates, IDs, validations
│   ├── .env.example              # Frontend environment variables example
│   ├── Dockerfile                # Production Dockerfile for frontend
│   └── package.json              # Frontend dependencies and scripts
│
├── backend/                      # Express.js + MongoDB Backend API
│   ├── src/
│   │   ├── config/               # Database connection (db.ts)
│   │   ├── controllers/          # Auth, Workspaces, Projects, Tasks, Comments, Seed
│   │   ├── middleware/           # JWT auth middleware (auth.ts)
│   │   ├── models/               # Mongoose schemas (User, Workspace, Project, Task, etc.)
│   │   ├── routes/               # Express route definitions
│   │   ├── scripts/              # Standalone database seed script (seed.ts)
│   │   └── server.ts             # Express server setup, CORS, and port listening
│   ├── .env.example              # Backend environment variables example
│   ├── Dockerfile                # Production Dockerfile for backend
│   └── package.json              # Backend dependencies and scripts
│
├── package.json                  # Root runner scripts
└── README.md                     # Project documentation
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or [MongoDB Atlas](https://www.mongodb.com/atlas) connection string.

---

### 2. Backend Setup (`backend/`)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your settings:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/workspace_manager
   JWT_SECRET=workspace-manager-jwt-super-secret-key-2026
   CLIENT_URL=http://localhost:3000
   ```
4. Seed demo users, workspaces, and sample tasks into MongoDB:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend runs at `http://localhost:5000`. Test the health check at `http://localhost:5000/api/health`.

---

### 3. Frontend Setup (`frontend/`)

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🔑 Pre-Configured Demo Accounts

For instant testing and evaluation without manual signup:

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Alex Johnson** | `alex@workspace.dev` | `password123` | Lead Architect (Owner) |
| **Sarah Williams** | `sarah@workspace.dev` | `password123` | Product Manager (Admin) |
| **Michael Brown** | `michael@workspace.dev` | `password123` | Frontend Engineer (Member) |

*The login page also provides 1-click demo buttons to automatically populate these credentials.*

---

## 📡 REST API Endpoints

### Authentication
- `POST /api/auth/register` — Create new user account and default starter workspace
- `POST /api/auth/login` — Authenticate user and receive JWT token + session cookie
- `GET  /api/auth/me` — Fetch current authenticated user profile
- `POST /api/auth/logout` — Clear session
- `PUT  /api/auth/profile` — Update user profile details

### Workspaces
- `GET    /api/workspaces` — List workspaces accessible to authenticated user
- `POST   /api/workspaces` — Create new workspace
- `GET    /api/workspaces/:id` — Get workspace details and member list
- `PUT    /api/workspaces/:id` — Update workspace properties
- `DELETE /api/workspaces/:id` — Delete workspace and cascading assets
- `POST   /api/workspaces/:id/members` — Invite new member

### Projects
- `GET    /api/projects?workspaceId=:id` — Get projects for workspace
- `POST   /api/projects` — Create project
- `GET    /api/projects/:id` — Get project details & columns
- `PUT    /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project

### Tasks
- `GET    /api/tasks?projectId=:id` — Get tasks in project
- `POST   /api/tasks` — Create task
- `GET    /api/tasks/:id` — Get task detail
- `PUT    /api/tasks/:id` — Update task status, assignee, priority, due date
- `DELETE /api/tasks/:id` — Delete task

### Comments & Activities
- `GET  /api/comments?taskId=:id` — Get task comments
- `POST /api/comments` — Post new comment
- `GET  /api/activities?workspaceId=:id` — Get recent activity feed

### Seeding
- `GET /api/seed` or `POST /api/seed` — Seed demo data into MongoDB

---

## 🚀 Independent Deployment Guide

### Deploying Frontend Separately (e.g., Vercel / Netlify)

1. Push your repository to GitHub.
2. In Vercel or Netlify, set the **Root Directory** to `frontend`.
3. Set the Environment Variable:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed backend (e.g. `https://workspace-backend.onrender.com/api`).
4. Build Command: `npm run build`
5. Output Directory: `.next`

### Deploying Backend Separately (e.g., Render / Railway / Heroku / DigitalOcean)

1. In Render or Railway, set the **Root Directory** to `backend`.
2. Set Environment Variables:
   - `PORT`: `5000` (or dynamically assigned by provider)
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: A long secure secret key
   - `CLIENT_URL`: URL of your deployed frontend (e.g. `https://workspace-manager.vercel.app`)
3. Build Command: `npm run build`
4. Start Command: `npm run start`

---

## 🛡️ License
ISC
