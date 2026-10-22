# PlaceTrack — Automated Test Plan & Quality Assurance Report

## 1. Automated Test Framework
* **Runner:** Vitest v2.1.8
* **API Testing Library:** Supertest v7.0.0
* **Database Driver:** Mongoose v8.9.5 + in-memory MongoDB Server
* **Command to Execute:** `npm test` inside `server/` directory

---

## 2. Automated Test Results (Executed & Verified)

```
 RUN  v2.1.9 D:/PlaceTrack/server

 ✓ tests/eligibility.test.js (8 tests) 32ms
 ✓ tests/api.test.js (14 tests) 3845ms

 Test Files  2 passed (2)
      Tests  22 passed (22)
   Duration  5.98s
```

---

## 3. Test Suites Breakdown

### Suite A: Deterministic Eligibility Engine (`tests/eligibility.test.js`)
| # | Test Case Description | Input Data | Expected Output | Actual Output | Status |
|---|-----------------------|------------|-----------------|---------------|--------|
| 1 | Student meets all eligibility criteria | CGPA: 8.5, Backlogs: 0, Dept: CE, Year: 2025 | `isEligible: true`, `reasons: []` | Qualified | **PASS** |
| 2 | Student CGPA below drive minimum | CGPA: 7.1 vs Min CGPA: 7.5 | `isEligible: false`, reasons contains CGPA | Disqualified with CGPA notice | **PASS** |
| 3 | Active backlogs exceed permitted limit | Active Backlogs: 1 vs Max Backlogs: 0 | `isEligible: false`, reasons contains backlogs | Disqualified with backlogs notice | **PASS** |
| 4 | Student department not eligible | Dept: Civil Engineering vs Allowed: [CE, IT] | `isEligible: false`, reasons contains dept | Disqualified with department notice | **PASS** |
| 5 | Graduation batch does not match | Batch: 2026 vs Allowed: [2025] | `isEligible: false`, reasons contains batch | Disqualified with graduation batch notice | **PASS** |
| 6 | Application deadline passed | Drive deadline 1 day in past | `isEligible: false`, reasons contains deadline | Disqualified with expired notice | **PASS** |
| 7 | Drive status is Draft | Drive status: Draft | `isEligible: false`, reasons contains draft | Disqualified with unlisted status | **PASS** |
| 8 | Cohort evaluation breakdown | 3 candidate profiles (1 pass, 2 fail) | Qualified: 1, Disqualified: 2 | Accurate cohort breakdown | **PASS** |

### Suite B: End-to-End API Integration & Security (`tests/api.test.js`)
| # | Endpoint & Scenario | Method | Expected HTTP Code | Actual Result | Status |
|---|---------------------|--------|-------------------|---------------|--------|
| 1 | Valid student login | `POST /api/v1/auth/login` | 200 OK | Token returned, password hash excluded | **PASS** |
| 2 | Invalid password rejection | `POST /api/v1/auth/login` | 401 Unauthorized | Rejection with clean error message | **PASS** |
| 3 | Missing login fields | `POST /api/v1/auth/login` | 400 Bad Request | Validation error array | **PASS** |
| 4 | Missing token on protected route | `GET /api/v1/auth/me` | 401 Unauthorized | Access blocked | **PASS** |
| 5 | Role authorization guard | `GET /api/v1/admin/users` | 403 Forbidden | Blocked student role | **PASS** |
| 6 | Paginated student list | `GET /api/v1/students` | 200 OK | Populated student list with total count | **PASS** |
| 7 | Duplicate company name | `POST /api/v1/companies` | 400 Bad Request | Duplicate name error caught | **PASS** |
| 8 | Student editing protected CGPA field | `PATCH /api/v1/students/:id` | 403 Forbidden | Blocked modification of protected field | **PASS** |
| 9 | Fetch published drives | `GET /api/v1/drives` | 200 OK | Filtered drives with eligibility computed | **PASS** |
| 10 | Cohort analysis endpoint | `GET /api/v1/drives/:id/eligibility` | 200 OK | Eligible and ineligible student breakdown | **PASS** |
| 11 | Duplicate drive application prevention | `POST /api/v1/applications` | 400 Bad Request | Database & logic compound index prevents duplicate | **PASS** |
| 12 | Ineligible application rejection | `POST /api/v1/applications` | 400 Bad Request | Disqualified student cannot apply | **PASS** |
| 13 | Live calculated dashboard KPIs | `GET /api/v1/dashboard/summary` | 200 OK | Placement rate = 33.3%, matching 2/6 placed records | **PASS** |
| 14 | Placement reports & interview funnel | `GET /api/v1/reports/placements` | 200 OK | Aggregated department and conversion metrics | **PASS** |

---

## 4. Manual Smoke-Test Viva Checklist

Use this checklist during academic examination or project presentation:

1. **Demonstration Account Login:**
   - [ ] Navigate to `http://localhost:5173/login`.
   - [ ] Click "TPO Officer" quick-fill button, click "Sign In to Portal".
   - [ ] Verify TPO Dashboard displays KPI cards, department bar chart, and upcoming interviews.

2. **Placement Drive Lifecycle:**
   - [ ] Go to "Placement Drives", click "Create Placement Drive".
   - [ ] Fill form: Company: Google, Role: "Cloud Engineer", Package: 16 LPA, Min CGPA: 7.5, Max Backlogs: 0.
   - [ ] Click "Publish Drive", observe instant appearance in published listing.
   - [ ] Click on drive, open "Eligibility Cohort Analysis" tab to view which students qualify.

3. **Student Eligibility & Application:**
   - [ ] In the top navbar, click "Student" in the quick-switch toolbar (switches to Rahul Sharma, CGPA 9.25).
   - [ ] Observe Student Dashboard: displays "Placed: Google (32.5 LPA)" with personal KPIs.
   - [ ] Switch to Student "Ananya Iyer" (CGPA 5.85, Backlogs 2).
   - [ ] Go to "Placement Drives": notice green "Eligible" badge on low-threshold drives and red "Not Eligible" banner with exact failing reasons on high-threshold drives.
   - [ ] Verify the "Apply Now" button is disabled with "Cannot Apply" on ineligible drives.

4. **Interview Scheduling & Outcome:**
   - [ ] Switch back to TPO Officer.
   - [ ] Navigate to "Applications", click "Details" on an active candidate.
   - [ ] Click "Schedule Interview", select "Technical Interview", specify date/time.
   - [ ] Under Interview Rounds, click "Clear" to record positive outcome.
   - [ ] Click "Issue Offer", set package CTC to 12.0 LPA, submit.
   - [ ] Verify the application status progresses to "Selected".

5. **Placement Reports & Audit Trail:**
   - [ ] Go to "Placement Reports" via sidebar.
   - [ ] Inspect Department Placement Summary table and Drive Funnel conversion rates.
   - [ ] Switch to Admin, navigate to "System Audit Trail".
   - [ ] Verify every login, status change, and drive creation has an immutable timestamped log.
