# PlaceTrack — College Placement Management System

[![Node.js](https://img.shields.io/badge/Node.js-v22.21-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v4.21-000000?logo=express)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-v8-646CFF?logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_v8-47A248?logo=mongodb)](https://mongodb.com)
[![Tests](https://img.shields.io/badge/Tests-22%20Passed-brightgreen)](https://vitest.dev)

A modern full-stack web application developed for college **Training & Placement Offices (TPO)** to streamline student recruitment, corporate partner management, placement drives, deterministic eligibility verification, multi-round interview pipelines, and placement analytics.

Developed for the **AI Tools for Software Development** academic course.

---

## Key Features

1. **Role-Based Portals:** Tailored interfaces and backend authorization for **Admin**, **TPO Officer**, and **Students**.
2. **Deterministic Eligibility Engine:** Backend-enforced academic rules verifying CGPA, active backlogs, eligible departments, graduation batch, and application deadlines with detailed pass/fail feedback.
3. **Application & Interview Pipelines:** Multi-round interview tracking (Aptitude, Technical, HR, Final Decision) with scheduled dates, venue links, and interviewer notes.
4. **Job Offers & Placement Record:** Selection management, formal CTC package extension, student acceptance, and deduplicated placement statistics.
5. **Dynamic Dashboard Analytics:** Real-time calculated KPI cards and interactive Recharts visualizations (Department-wise placement comparison, Application status funnel, and Top recruiting partners).
6. **In-App Notifications:** Instant alerts for newly published drives, application status promotions, upcoming interview sessions, and formal job offers.
7. **System Security & Audit Trail:** JWT authentication, bcrypt password hashing, input sanitization, rate limiting, and an immutable administrative audit log.
8. **Zero-Configuration Local Setup:** In-memory MongoDB fallback automatically initializes when a local MongoDB service is absent, allowing instantaneous demonstration out of the box, with full support for MongoDB Atlas connection strings.

---

## Technology Stack

* **Frontend:** React 19, Vite, JavaScript (ES6+), React Router DOM, Tailwind CSS v4, Lucide React, Recharts, Axios, React Hot Toast.
* **Backend:** Node.js, Express.js (ES Modules), Mongoose ODM, JWT, bcryptjs, express-validator, Helmet, CORS, express-rate-limit.
* **Testing:** Vitest, Supertest.
* **AI Tooling Documented:** Google Antigravity (Agentic AI Software Development Platform, Google DeepMind).

---

## Demonstration Accounts & Credentials

Password for all demonstration accounts: **`Password@123`**

| Role | Email | Profile / Scenario |
|------|-------|--------------------|
| **Admin** | `admin@placetrack.edu` | Full system control, role management, audit trail inspection |
| **TPO Officer** | `tpo@placetrack.edu` | Drive creation, student eligibility inspection, interview scheduling, offers |
| **Student (Placed)** | `rahul.sharma@student.edu` | Computer Engg, CGPA: 9.25, Placed at Google (32.5 LPA) |
| **Student (Placed)** | `priya.patel@student.edu` | Information Tech, CGPA: 8.78, Placed at Microsoft (28.0 LPA) |
| **Student (In Process)** | `amit.kumar@student.edu` | Electronics & Telecom, CGPA: 7.82, Cleared TCS Aptitude Round |
| **Student (Shortlisted)** | `sneha.deshmukh@student.edu` | Computer Engg, CGPA: 8.45, Shortlisted for Microsoft AI drive |
| **Student (Applied)** | `rohan.verma@student.edu` | Mechanical Engg, CGPA: 6.75, Applied to TCS drive |
| **Student (Ineligible Test)** | `ananya.iyer@student.edu` | Information Tech, CGPA: 5.85 (Disqualified from high-CGPA drives) |

*Tip: The Login page and top Navbar feature one-click quick switch buttons for instant role switching during evaluations.*

---

## Installation & Setup Instructions

### Prerequisites
* **Node.js** (v18.0 or higher recommended, tested on v22)
* **npm** (v9.0 or higher)

### 1. Clone & Scaffolding
Navigate to the root directory:
```bash
cd PlaceTrack
```

### 2. Backend Setup
```bash
cd server
npm install
```
Configure environment variables if using MongoDB Atlas (optional):
```bash
# In server/.env
PORT=5000
MONGODB_URI=memory  # Or your MongoDB Atlas URI: mongodb+srv://<user>:<password>@cluster0.mongodb.net/placetrack
JWT_SECRET=placetrack_super_secret_jwt_key_2026_academic_demo
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Populate demonstration database:
```bash
npm run seed
```

Start the backend API server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

Access the application in your browser at: **`http://localhost:5173`**

---

## Automated Test Execution

PlaceTrack includes a comprehensive automated test suite testing authentication, security guards, student/company CRUD, deterministic eligibility checking, and application state transitions:

```bash
cd server
npm test
```

### Test Results Summary:
* Total Tests: **22 passed (100%)**
* Unit Tests (`tests/eligibility.test.js`): **8 passed**
* Integration & API Tests (`tests/api.test.js`): **14 passed**

---

## Project Structure

```
PlaceTrack/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/                # Axios instance with auth interceptors
│   │   ├── components/         # Navbar, Sidebar, StatCard, StatusBadge, Modal
│   │   ├── context/            # AuthContext & role state
│   │   ├── layouts/            # MainLayout, ProtectedRoute
│   │   ├── pages/              # Dashboard, Drives, Applications, Students, etc.
│   │   ├── App.jsx             # React Router configuration
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                     # Backend API (Node.js + Express ES Modules)
│   ├── scripts/
│   │   └── seed.js             # Demonstration data seeding script
│   ├── src/
│   │   ├── config/             # Database connection & memory fallback
│   │   ├── controllers/        # Auth, Students, Drives, Applications, Reports
│   │   ├── middleware/         # JWT auth, role authorization, error handling
│   │   ├── models/             # Mongoose schemas (User, Drive, Application, etc.)
│   │   ├── routes/             # Versioned REST route definitions (/api/v1/...)
│   │   ├── services/           # Eligibility engine, Audit logger, Notifications
│   │   ├── validators/         # Express-validator schemas
│   │   ├── app.js              # Express app configuration & middleware
│   │   └── server.js           # Server bootstrap & graceful shutdown
│   └── tests/                  # Vitest & Supertest automated test suite
├── docs/                       # Academic Documentation
│   ├── architecture.md         # System architecture & Mermaid ER diagrams
│   ├── api-documentation.md    # Complete REST API reference
│   ├── test-plan.md            # Test cases, Supertest results & Viva checklist
│   ├── ai-usage-log.md         # AI development lifecycle record
│   └── prompts.md              # Record of AI prompts & manual modifications
└── README.md
```

---

## Academic Documentation References
* [Architecture & System Design](docs/architecture.md)
* [REST API Reference](docs/api-documentation.md)
* [Test Plan & Manual Viva Checklist](docs/test-plan.md)
* [AI Usage Log](docs/ai-usage-log.md)
* [AI Prompts History](docs/prompts.md)
