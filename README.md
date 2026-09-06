# 🚀 Workspace Manager

A modern **frontend-only workspace and project management application** inspired by productivity tools like **Notion, Jira, and Linear**.

Built as a capstone project using **Next.js, TypeScript, Tailwind CSS, and Redux Toolkit**, Workspace Manager provides a complete client-side experience for managing workspaces, projects, tasks, teams, Kanban boards, calendars, notifications, comments, and more — without requiring a backend.

---

## ✨ Features

### 🔐 Authentication & User Management

* Mock login and signup
* Fake credential validation using local mock users
* Persisted login session using `localStorage`
* Editable user profile
* Avatar, name, and email management
* Multiple mock users for simulating different accounts
* Logout functionality

### 🏢 Workspace Management

* Create, rename, and delete workspaces
* Switch between multiple workspaces
* Workspace settings
* Customize workspace name, icon, and color
* Set default workspace view
* Workspace member management
* Fake member invitations using mock users

### 📁 Project Management

* Create, rename, archive, and delete projects
* Project descriptions
* Project color and icon customization
* Assign workspace members to projects
* Project templates with predefined task sets

### ✅ Task & Subtask Management

* Create, edit, and delete tasks
* Task descriptions
* Status management
* Priority levels
* Due dates
* Assignees
* Labels and tags
* Nested subtasks
* Mark tasks and subtasks as complete
* Task detail modal/page
* File attachments using client-side Blob/Base64 storage
* Convert subtasks into full tasks
* Duplicate tasks
* Bulk task actions

### 📊 Multiple Project Views

#### Kanban Board

* Drag-and-drop tasks
* Move tasks between columns
* Custom Kanban columns
* Reorder columns
* Project-specific board configuration

#### List / Table View

* Sortable task columns
* Group tasks by:

  * Assignee
  * Status
  * Priority
  * Label

#### Calendar View

* Display tasks according to due dates
* Navigate task schedules visually

### 🔎 Search, Filter & Sort

* Global search
* Search across:

  * Workspaces
  * Projects
  * Tasks
* Filter by:

  * Assignee
  * Label
  * Priority
  * Status
  * Due-date range
* Sort by:

  * Due date
  * Priority
  * Created date
  * Alphabetical order
* Save reusable filter presets

### 👥 Roles & Permissions

Simulated role-based access control:

* Owner
* Admin
* Member
* Viewer

Features include:

* Permission-based UI
* Restricted action handling
* Access-denied states
* Workspace-level role assignment

### 📝 Activity Logs

* Task activity history
* Project activity aggregation
* Track events such as:

  * Task created
  * Task edited
  * Status changed
  * Comments added
* Timestamped activities
* Acting user information
* Filter activity by user or action type

### 💬 Comments & Collaboration

* Task comment threads
* @mention autocomplete
* Edit your own comments
* Delete your own comments
* Mock collaborative updates
* Simulated live events using client-side intervals

### ↩️ Undo / Redo & Optimistic UX

* Undo task edits
* Redo task edits
* Undo task moves
* Undo deletions
* Optimistic UI updates
* Simulated network delays
* Fake failure and rollback handling
* Toast notifications
* Inline Undo actions

### 🔔 Notifications

Notification center with:

* Unread notification count
* Task assignment notifications
* @mention notifications
* Upcoming due-date notifications
* Mark notification as read
* Mark all notifications as read
* Notification preferences

### 💾 Persistence & Offline Support

Since there is no backend, application data is handled on the client.

* `localStorage` persistence
* IndexedDB support
* State rehydration after reload
* Simulated offline mode
* Online/offline indicator
* Fake synchronization system
* Manual sync button
* Export workspace data as JSON
* Import workspace data from JSON
* JSON validation
* Reset application data

### ⚙️ UI/UX Utilities

* Command Palette
* `Cmd + K` quick actions
* Keyboard shortcuts
* Dark/light theme
* Responsive design
* Collapsible sidebar
* Mobile navigation drawer
* Loading skeletons
* Empty states
* Confirmation dialogs
* Toast notifications

### ⚙️ Settings

#### App Settings

* Theme preferences
* Default project view
* Notification preferences

#### Workspace Settings

* Workspace information
* Members
* Roles
* Workspace configuration

#### Danger Zone

* Delete workspace
* Delete project
* Destructive-action confirmations

---

# 🛠️ Tech Stack

| Technology            | Purpose                                      |
| --------------------- | -------------------------------------------- |
| **Next.js**           | React framework and application architecture |
| **React**             | UI development                               |
| **TypeScript**        | Type safety                                  |
| **Tailwind CSS**      | Styling and responsive UI                    |
| **Redux Toolkit**     | Global state management                      |
| **Redux**             | Application state architecture               |
| **LocalStorage**      | Client-side persistence                      |
| **IndexedDB**         | Larger client-side data storage              |
| **HTML5 Drag & Drop** | Kanban interactions                          |

---

# 🏗️ Application Architecture

The application follows a modular frontend architecture:

```text
Workspace Manager
│
├── Authentication
│   ├── Login
│   ├── Signup
│   └── User Profile
│
├── Workspaces
│   ├── Workspace List
│   ├── Members
│   └── Settings
│
├── Projects
│   ├── Project Dashboard
│   ├── Project Settings
│   └── Templates
│
├── Tasks
│   ├── Task Management
│   ├── Subtasks
│   ├── Comments
│   └── Attachments
│
├── Views
│   ├── Kanban
│   ├── List
│   └── Calendar
│
├── Collaboration
│   ├── Activity
│   ├── Comments
│   └── Mentions
│
├── Notifications
│
├── Search & Filters
│
├── Permissions
│
├── Undo / Redo
│
└── Settings
```

---

# 🧠 State Management

**Redux Toolkit** is used to manage the application's global state.

Example state structure:

```text
Redux Store
│
├── auth
├── users
├── workspaces
├── projects
├── tasks
├── comments
├── notifications
├── activities
├── filters
├── ui
└── settings
```

Redux handles communication between different parts of the application while client-side persistence keeps data available after page reloads.

---

# 🔄 Data Flow

```text
User Action
     ↓
React Component
     ↓
Redux Action / Thunk
     ↓
Redux Reducer
     ↓
Global State Updated
     ↓
UI Re-render
     ↓
localStorage / IndexedDB
```

For simulated optimistic operations:

```text
User Action
     ↓
Immediate UI Update
     ↓
Simulated Network Delay
     ↓
Success → Keep Changes
     │
     └── Failure → Rollback State
```

---

# 📱 Responsive Design

Workspace Manager is designed to work across:

* 🖥️ Desktop
* 💻 Laptop
* 📱 Tablet
* 📱 Mobile

The interface includes responsive navigation, a collapsible sidebar, mobile drawers, adaptive boards, and responsive task views.

---

# 🎨 UI Inspiration

The application's workflow and usability are inspired by modern productivity platforms such as:

* Notion
* Jira
* Linear

The goal is to combine **project management, task management, collaboration, and productivity features** into one modern workspace.

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/workspace-manager.git
```

## 2. Navigate to the Project

```bash
cd workspace-manager
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Start Development Server

```bash
npm run dev
```

## 5. Open in Browser

```text
http://localhost:3000
```

---

# 📦 Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Runs the production build.

```bash
npm run lint
```

Checks the project for linting issues.

---

# 🔑 Demo Authentication

This project uses **mock authentication** because it is frontend-only.

Example:

```text
Email: demo@example.com
Password: demo123
```

> Demo credentials may vary depending on the mock users configured in the application.

---

# 🗂️ Project Goals

This capstone project demonstrates practical knowledge of:

* Next.js application development
* React component architecture
* TypeScript
* Tailwind CSS
* Redux Toolkit
* Global state management
* Client-side persistence
* CRUD operations
* Drag-and-drop interfaces
* Role-based permissions
* Responsive UI design
* Search and filtering
* Optimistic UI
* Undo/redo functionality
* Mock authentication
* Offline-state simulation
* Modern dashboard design

---

# 🔒 Backend Status

**No backend is required.**

Authentication, collaboration, persistence, synchronization, and network operations are intentionally simulated on the client.

```text
Frontend
   │
   ├── Redux Toolkit
   ├── LocalStorage
   ├── IndexedDB
   ├── Mock Data
   └── Simulated API Operations
```

This makes the project ideal for demonstrating advanced frontend engineering concepts without requiring a server or database.

---

# 📌 Capstone Highlights

### 70+ Frontend Features

The project covers **14 major feature domains**, including:

* Authentication
* Workspaces
* Projects
* Tasks
* Views
* Search & Filtering
* Permissions
* Activity Logs
* Collaboration
* Undo/Redo
* Notifications
* Persistence & Offline Support
* UI/UX Utilities
* Settings

---

# 🎯 Future Improvements

Although this version is frontend-only, it can be extended with a real backend in the future.

Possible upgrades:

* Node.js / Express backend
* MongoDB database
* JWT authentication
* Real-time collaboration with Socket.IO
* Cloud file storage
* Real email invitations
* Server-side permissions
* Cloud synchronization
* Real-time notifications
* Production deployment

---

# 👨‍💻 Author

**Danish**

Software Engineering Student
MERN Stack Developer

---

# 📄 License

This project was created for **educational and capstone project purposes**.
