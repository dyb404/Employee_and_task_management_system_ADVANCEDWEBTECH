# WorkFlow — Frontend

React frontend for the Employee & Task Management System.

## Tech Stack
- React 18 (Create React App)
- React Router v6
- Fetch API (no Axios)
- CSS Variables based design system

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure backend URL**  
   Open `src/utils/api.js` and verify the base URL:
   ```js
   export const API_BASE = 'http://localhost:5000/api';
   ```
   Change the port/host if your backend runs elsewhere.

3. **Start the dev server**
   ```bash
   npm start
   ```
   App runs at `http://localhost:3000`

---

## Backend Setup (run separately)
Make sure the backend is running on port 5000 before starting the frontend.

```bash
cd ../backend
node server.js
```

---

## Features by Role

### Admin & Manager
- **Dashboard** — stats overview, recent tasks, attendance log
- **Employees** — card-based list, add/edit/deactivate employees
- **Tasks (Kanban)** — create tasks, assign to employees, delete
- **Attendance** — view all employee attendance records
- **Profile** — account info and permissions

### Employee
- **Dashboard** — personal stats
- **My Tasks** — see only own tasks, progress bar, update status
- **Tasks** — kanban view of all tasks (read + update status)
- **Attendance** — check-in/check-out, view own history
- **Profile** — account info

---

## Project Structure

```
src/
├── context/
│   ├── AuthContext.jsx      # JWT auth state, login/logout
│   └── ToastContext.jsx     # Global toast notifications
├── utils/
│   └── api.js               # All API calls + helper functions
├── components/
│   └── layout/
│       ├── Sidebar.jsx      # Navigation sidebar
│       ├── Topbar.jsx       # Top header bar
│       └── AppLayout.jsx    # Protected route + layout wrapper
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── EmployeesPage.jsx    # CRUD employees
│   ├── TasksPage.jsx        # Kanban task board
│   ├── AttendancePage.jsx   # Check-in/out + records
│   ├── MyTasksPage.jsx      # Employee's own tasks
│   └── ProfilePage.jsx
├── index.css                # Global design system & variables
├── App.jsx                  # Route definitions
└── index.js                 # Entry point
```

---

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/employees | Get all employees |
| POST | /api/employees | Create employee |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Deactivate employee |
| GET | /api/tasks | Get tasks |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id/status | Update task status |
| DELETE | /api/tasks/:id | Delete task |
| POST | /api/attendance/checkin | Check in |
| PATCH | /api/attendance/checkout | Check out |
| GET | /api/attendance | Get attendance records |
