# Employee Record Management System (ERMS)

A full-stack web application for managing employee records, built with React, Node.js, Express, and MongoDB.

## Architecture

```
erms/
├── backend/          # Express API server
│   ├── config/       # Database connection
│   ├── controllers/  # Request handlers
│   ├── middleware/    # Auth & authorization
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── seed/         # Database seeder
│   └── server.js     # Entry point
│
└── frontend/         # React SPA
    ├── public/
    └── src/
        ├── api/          # Axios instance
        ├── components/   # Layout, Sidebar, ProtectedRoute
        ├── context/      # Auth context
        ├── pages/        # All page components
        ├── App.jsx       # Router setup
        └── index.js      # Entry point
```

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router v6, Axios
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Auth**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v16+)
- MongoDB (running locally on port 27017)

## Setup Instructions

### 1. Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (already provided):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/erms
JWT_SECRET=erms_jwt_secret_key_2024
JWT_EXPIRE=24h
```

Start the backend server:

```bash
npm run dev
```

Seed the database with sample data:

```bash
npm run seed
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the React development server:

```bash
npm start
```

The app will open at `http://localhost:3000`.

### 4. Login

Use these demo credentials:

| Role    | Email            | Password      |
|---------|------------------|---------------|
| Admin   | admin@erms.com   | password123   |
| Employee| john@erms.com   | password123   |

## API Endpoints

| Module        | Method | Endpoint                        | Auth  | Role   |
|---------------|--------|---------------------------------|-------|--------|
| Auth          | POST   | /api/auth/login                 | No    | Any    |
| Auth          | POST   | /api/auth/logout                | Yes   | Any    |
| Auth          | GET    | /api/auth/me                    | Yes   | Any    |
| Employees     | GET    | /api/employees                  | Yes   | Any    |
| Employees     | GET    | /api/employees/:id              | Yes   | Any    |
| Employees     | POST   | /api/employees                  | Yes   | Admin  |
| Employees     | PUT    | /api/employees/:id              | Yes   | Admin  |
| Employees     | DELETE | /api/employees/:id              | Yes   | Admin  |
| Departments   | GET    | /api/departments                | Yes   | Any    |
| Departments   | POST   | /api/departments                | Yes   | Admin  |
| Departments   | PUT    | /api/departments/:id            | Yes   | Admin  |
| Departments   | DELETE | /api/departments/:id            | Yes   | Admin  |
| Leaves        | GET    | /api/leaves                     | Yes   | Any    |
| Leaves        | POST   | /api/leaves                     | Yes   | Any    |
| Leaves        | PUT    | /api/leaves/:id/approve         | Yes   | Admin  |
| Leaves        | PUT    | /api/leaves/:id/reject          | Yes   | Admin  |
| Attendance    | POST   | /api/attendance/checkin         | Yes   | Any    |
| Attendance    | POST   | /api/attendance/checkout        | Yes   | Any    |
| Attendance    | GET    | /api/attendance                 | Yes   | Any    |
| Payroll       | GET    | /api/payroll                    | Yes   | Any    |
| Payroll       | POST   | /api/payroll                    | Yes   | Admin  |
| Payroll       | GET    | /api/payroll/:id/payslip        | Yes   | Any    |
| Announcements | GET    | /api/announcements              | Yes   | Any    |
| Announcements | POST   | /api/announcements              | Yes   | Admin  |
| Announcements | DELETE | /api/announcements/:id          | Yes   | Admin  |
| Dashboard     | GET    | /api/dashboard/stats            | Yes   | Any    |

## Features

- **Authentication**: JWT-based login with role-based access control
- **Dashboard**: Overview stats with department distribution and recent leaves
- **Employee Management**: CRUD with search and department filter
- **Department Management**: CRUD with department head assignment
- **Leave Management**: Request, approve/reject with status tracking
- **Attendance**: Daily check-in/check-out with late/half-day detection
- **Payroll**: Salary management with payslip generation
- **Announcements**: Admin posts with priority levels

## Database Models

- **User**: name, email, password (hashed), role, department, position, phone, joinDate
- **Department**: name, description, head (ref User)
- **Leave**: employee (ref), type, startDate, endDate, reason, status, reviewedBy
- **Attendance**: employee (ref), date, checkIn, checkOut, status
- **Payroll**: employee (ref), month, year, basicSalary, hra, da, bonus, deductions, netSalary
- **Announcement**: title, message, postedBy (ref), priority, isActive

## Deploy to Render

### Prerequisites
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)
- A [Render](https://render.com) account

### Step 1: Push to GitHub

```bash
cd dbms
git init
git add .
git commit -m "Initial commit: ERMS project"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Step 2: Deploy Backend (Web Service)

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:

| Key            | Value                                              |
|----------------|----------------------------------------------------|
| `MONGO_URI`    | `mongodb+srv://<user>:<pass>@cluster.mongodb.net/erms` |
| `JWT_SECRET`   | `erms_jwt_secret_key_2024`                         |
| `JWT_EXPIRE`   | `24h`                                              |
| `FRONTEND_URL` | `https://erms-frontend.onrender.com`               |

5. Deploy → note your backend URL (e.g. `https://erms-backend.onrender.com`)

### Step 3: Seed the Database

After backend deploys, run the seed script once:

```bash
# Locally, update backend/.env with your Atlas MONGO_URI, then:
cd backend
npm install
npm run seed
```

### Step 4: Deploy Frontend (Static Site)

1. Render Dashboard → **New** → **Static Site**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Add Environment Variable:

| Key                | Value                                           |
|--------------------|-------------------------------------------------|
| `REACT_APP_API_URL`| `https://erms-backend.onrender.com/api`         |

5. Deploy

### Step 5: Update CORS

After both services are live, update the backend's `FRONTEND_URL` env var on Render to match your actual frontend URL, then redeploy the backend.
