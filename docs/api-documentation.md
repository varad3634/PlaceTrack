# PlaceTrack — REST API Documentation
**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api/v1`

---

## 1. Authentication & Session Management

### 1.1 Login
* **URL:** `POST /api/v1/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "tpo@placetrack.edu",
  "password": "Password@123"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67b848c48a74e51240c5da01",
    "name": "Prof. Sunita Kulkarni (TPO)",
    "email": "tpo@placetrack.edu",
    "role": "tpo",
    "department": "Training & Placement Office",
    "avatar": "https://..."
  }
}
```
* **Error Responses:**
  * `400 Bad Request`: Validation error (malformed email, missing password)
  * `401 Unauthorized`: Invalid credentials
  * `403 Forbidden`: Account deactivated

### 1.2 Get Current User
* **URL:** `GET /api/v1/auth/me`
* **Access:** Private (Bearer Token)
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):** Returns current user and attached student profile if role is `student`.

### 1.3 Logout
* **URL:** `POST /api/v1/auth/logout`
* **Access:** Private (Bearer Token)
* **Success Response (200 OK):** `{ "success": true, "message": "User logged out successfully." }`

---

## 2. Student Management

### 2.1 Get Students
* **URL:** `GET /api/v1/students`
* **Access:** Private (`admin`, `tpo`)
* **Query Parameters:** `page`, `limit`, `department`, `isPlaced`, `graduationYear`, `minCgpa`, `search`
* **Success Response (200 OK):** Returns paginated student profiles with populated user details.

### 2.2 Get Single Student
* **URL:** `GET /api/v1/students/:id`
* **Access:** Private (`admin`, `tpo`, or student owner)
* **Success Response (200 OK):** Student profile, placement status, and history of submitted applications.

### 2.3 Create Student Account & Profile
* **URL:** `POST /api/v1/students`
* **Access:** Private (`admin`, `tpo`)
* **Request Body:**
```json
{
  "name": "Arjun Patel",
  "email": "arjun.patel@student.edu",
  "password": "Password@123",
  "prn": "PRN2024099",
  "department": "Computer Engineering",
  "graduationYear": 2025,
  "cgpa": 8.75,
  "activeBacklogs": 0,
  "skills": ["React", "Python", "SQL"]
}
```
* **Success Response (201 Created)**

### 2.4 Update Student Profile
* **URL:** `PATCH /api/v1/students/:id`
* **Access:** Private
* **Rules:**
  * Students can only update `skills`, `phone`, `resumeUrl`, `linkedinUrl`, `githubUrl`.
  * Modifying administrative fields (`cgpa`, `activeBacklogs`, `department`, `prn`, `isPlaced`) by students returns `403 Forbidden`.
  * Admins and TPOs can update all fields.

### 2.5 Delete Student
* **URL:** `DELETE /api/v1/students/:id`
* **Access:** Private (`admin`, `tpo`)
* **Success Response (200 OK)**

### 2.6 Student Drive Eligibility Matrix
* **URL:** `GET /api/v1/students/:id/eligibility`
* **Access:** Private
* **Success Response (200 OK):** Evaluates student against all active drives and returns pass/fail status and reasons.

---

## 3. Company Management

### 3.1 Get Companies
* **URL:** `GET /api/v1/companies`
* **Access:** Private
* **Query Parameters:** `industry`, `isActive`, `search`, `page`, `limit`
* **Success Response (200 OK)**

### 3.2 Create Company
* **URL:** `POST /api/v1/companies`
* **Access:** Private (`admin`, `tpo`)
* **Request Body:**
```json
{
  "name": "Infosys Ltd",
  "industry": "IT Services & Consulting",
  "hrContactName": "Priya Sen",
  "hrContactEmail": "priya.sen@infosys-demo.com",
  "location": "Bangalore / Pune"
}
```
* **Success Response (201 Created)**

### 3.3 Update Company
* **URL:** `PATCH /api/v1/companies/:id`
* **Access:** Private (`admin`, `tpo`)

### 3.4 Deactivate or Delete Company
* **URL:** `DELETE /api/v1/companies/:id`
* **Access:** Private (`admin`, `tpo`)
* **Note:** Soft-deactivates if active drives exist to protect referential integrity.

---

## 4. Placement Drive Management

### 4.1 Get Placement Drives
* **URL:** `GET /api/v1/drives`
* **Access:** Private
* **Query Parameters:** `status`, `department`, `minSalary`, `search`, `page`, `limit`
* **Success Response (200 OK):** Drives with company information, applicant counts, and student-specific eligibility evaluations.

### 4.2 Create Placement Drive
* **URL:** `POST /api/v1/drives`
* **Access:** Private (`admin`, `tpo`)
* **Request Body:**
```json
{
  "company": "67b848c48a74e51240c5da12",
  "jobTitle": "Associate Cloud Architect",
  "jobDescription": "Build next-generation multi-cloud solutions...",
  "salaryPackage": 14.5,
  "minCgpa": 7.5,
  "maxBacklogs": 0,
  "eligibleDepartments": ["Computer Engineering", "Information Technology"],
  "graduationYears": [2025],
  "applicationDeadline": "2026-11-15T18:30:00.000Z",
  "status": "Published"
}
```
* **Success Response (201 Created)**

### 4.3 Update Drive Status
* **URL:** `PATCH /api/v1/drives/:id/status`
* **Access:** Private (`admin`, `tpo`)
* **Request Body:** `{ "status": "Published" }` (or `Draft`, `Closed`, `Cancelled`)
* **Trigger:** Transition to `Published` automatically notifies all eligible students in the college.

### 4.4 Get Drive Eligibility Cohort Analysis
* **URL:** `GET /api/v1/drives/:id/eligibility`
* **Access:** Private (`admin`, `tpo`)
* **Success Response (200 OK):** Live evaluation of all students against drive criteria with counts and lists of qualified and disqualified candidates.

---

## 5. Application Pipeline

### 5.1 Get Applications
* **URL:** `GET /api/v1/applications`
* **Access:** Private (Students only view their own applications; TPO/Admin view all)
* **Query Parameters:** `status`, `drive`, `company`, `department`, `page`, `limit`

### 5.2 Apply to Placement Drive
* **URL:** `POST /api/v1/applications`
* **Access:** Private (`student` only)
* **Request Body:** `{ "driveId": "67b848c48a74e51240c5da25" }`
* **Enforcements:**
  * Deterministic backend eligibility check
  * Duplicate check (compound unique index `student + drive`)
  * Application deadline verification
  * Drive status verification (`Published` only)

### 5.3 Update Application Status
* **URL:** `PATCH /api/v1/applications/:id/status`
* **Access:** Private
* **Rules:**
  * Students can only transition their own application to `Withdrawn`.
  * TPO/Admin can transition between validated states: `Applied` -> `Shortlisted` -> `In Process` -> `Selected` -> `Rejected`.

---

## 6. Interview Management

### 6.1 Schedule Interview Round
* **URL:** `POST /api/v1/applications/:id/interviews`
* **Access:** Private (`admin`, `tpo`)
* **Request Body:**
```json
{
  "roundNumber": 2,
  "roundName": "Technical Interview (Algorithms)",
  "scheduledDate": "2026-11-05T10:00:00.000Z",
  "venueOrLink": "Google Meet Link",
  "interviewerName": "Akash Narang, Staff SWE"
}
```

### 6.2 Update Interview Outcome
* **URL:** `PATCH /api/v1/interviews/:id`
* **Access:** Private (`admin`, `tpo`)
* **Request Body:**
```json
{
  "status": "Cleared",
  "feedback": "Strong problem solving in graph traversal."
}
```

---

## 7. Job Offers & Selection (Module 9)

### 7.1 Extend Job Offer
* **URL:** `POST /api/v1/applications/:id/offer`
* **Access:** Private (`admin`, `tpo`)
* **Request Body:**
```json
{
  "jobRole": "Software Engineer",
  "packageLpa": 32.5,
  "responseDeadline": "2026-11-20T23:59:59.000Z"
}
```

### 7.2 Respond to Offer
* **URL:** `PATCH /api/v1/offers/:id`
* **Access:** Private (Student or TPO)
* **Request Body:** `{ "status": "Accepted" }` (or `Declined`)
* **Effect:** Accepting an offer marks the student's profile `isPlaced = true`, records company, and ensures deduplicated placement metrics.

---

## 8. Dashboard & Reports

### 8.1 Summary Metrics
* **URL:** `GET /api/v1/dashboard/summary`
* **Access:** Private (Role-based response)

### 8.2 Detailed Reports
* **URL:** `GET /api/v1/reports/placements`
* **Access:** Private (`admin`, `tpo`)
* **Returns:** Department rates, drive conversion percentages, interview funnel pass rates.

### 8.3 Notifications
* **URL:** `GET /api/v1/notifications`
* **Access:** Private
* **Mark Read:** `PATCH /api/v1/notifications/:id/read`
* **Mark All Read:** `PATCH /api/v1/notifications/read-all`
