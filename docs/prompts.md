# PlaceTrack — AI Development Prompt & Trajectory History
**Course:** AI Tools for Software Development  
**AI Platform:** Google Antigravity (Agentic AI Software Development Environment, Google DeepMind)  
**Academic Year:** 2026-27  
**Institution:** D.K.T.E. Society’s Textile and Engineering Institute, Ichalkaranji  
**Department:** Computer Science & Engineering  
**Student:** Varad Mahadev Kadam (PRN: 23UCS047)  
**Project Guide:** Dr. P. M. Gavali  

---

## 1. Overview of Agentic Prompting in Google Antigravity

In the **Google Antigravity** environment, prompting operates at an agentic level: prompts are structured directives that instruct the AI agent to reason across the active repository, formulate execution plans, invoke code modification tools, execute terminal commands, and perform closed-loop testing.

This document logs the major prompt directives, the autonomous actions taken by Google Antigravity, the outputs generated, manual refinements, and automated verification results.

---

### Prompt Entry 1: System Requirements & Business Rules Formalization
* **Phase:** Requirements Engineering
* **User Directive:**
  > "Act as a senior full-stack software engineer and systems architect. I am developing 'PlaceTrack — College Placement Management System' for my AI Tools for Software Development course. Formalize the deterministic eligibility checking rules, valid application status transitions, and role-based permissions (Admin, TPO, Student) so that edge cases like expired deadlines, backlog disqualification, duplicate applications, and multiple-offer counting are prevented. Ensure all business rules are pure, deterministic, and testable."
* **Antigravity Autonomous Actions:**
  - Evaluated the placement domain workflows and synthesized a 6-point deterministic eligibility matrix.
  - Formulated a finite state machine managing permissible application states: `Applied` ➔ `Shortlisted` ➔ `In Process` ➔ `Selected` ➔ `Rejected` / `Withdrawn`.
  - Structured role permissions ensuring students cannot alter academic metrics (CGPA, backlogs) or transition states to terminal outcomes.
* **Manual Refinement:** Required that disqualification reasons be returned as an itemized array of human-readable strings to provide complete transparency to students.
* **Verification:** Validated by unit tests in `server/tests/eligibility.test.js`.

---

### Prompt Entry 2: Mongoose Schema Synthesis & Referential Integrity
* **Phase:** Database Architecture
* **User Directive:**
  > "Design and create production-ready Mongoose schemas for PlaceTrack using ES modules syntax. Include User (with bcrypt pre-save password hashing and select: false on password), StudentProfile (CGPA, active backlogs, PRN, branch), Company, PlacementDrive, Application, InterviewRound, Offer, Notification, and AuditLog. Ensure relational references and compound indexes are established to prevent duplicate applications."
* **Antigravity Autonomous Actions:**
  - Invoked `write_to_file` to create 9 schemas in `server/src/models/`.
  - Injected `{ student: 1, drive: 1 }` compound unique index on `Application.js` to guarantee single-application integrity at the database engine level.
  - Added pre-save password hashing hook on `User.js` using `bcryptjs`.
* **Manual Refinement:** Added `toJSON: { virtuals: true }, toObject: { virtuals: true }` configurations across schemas for seamless JSON serialization.
* **Verification:** Tested database indexing and seed insertion via `npm run seed`.

---

### Prompt Entry 3: Centralized Eligibility Engine Service Formulation
* **Phase:** Backend Service Engineering
* **User Directive:**
  > "Implement a centralized, deterministic eligibility engine in a Node.js ES module `server/src/services/eligibilityService.js`. Given a StudentProfile and a PlacementDrive, compare CGPA, active backlogs, eligible departments, graduation batch, drive status, and application deadline. Return `{ isEligible: boolean, reasons: string[] }`. Also write a cohort evaluation function `evaluateCohort(students, drive)` that categorizes students into eligible and ineligible cohorts."
* **Antigravity Autonomous Actions:**
  - Invoked `write_to_file` to scaffold `eligibilityService.js`.
  - Implemented explicit numerical casting (`Number(student.cgpa)`, `Number(drive.minCgpa)`) to eliminate edge-case string coercion bugs.
  - Added timestamp deadline comparisons (`Date.now() <= new Date(drive.deadline).getTime()`).
* **Manual Refinement:** Ensured that missing profiles or incomplete academic metrics safely return false with descriptive disqualification notices.
* **Verification:** 8 unit tests in `server/tests/eligibility.test.js` executed with 100% pass rate.

---

### Prompt Entry 4: Dashboard Analytics Aggregation Queries
* **Phase:** Backend Aggregation Pipelines
* **User Directive:**
  > "Construct MongoDB aggregation pipelines in `server/src/controllers/reportController.js` to compute real-time placement statistics for the TPO dashboard. Calculate: total registered students, unique placed students, deduplicated placement percentage, department-wise placement statistics (total students vs placed students), top hiring companies, and application status funnel counts. Ensure multiple job offers to a single student do not inflate the unique placed count."
* **Antigravity Autonomous Actions:**
  - Synthesized Mongoose `$facet` and `$lookup` aggregation pipelines.
  - Implemented `$addToSet` to collect distinct student IDs holding accepted/selected offers, ensuring strict deduplication in placement percentage calculations.
  - Formatted numerical values using `$round` to 1 decimal place with divide-by-zero safeguards.
* **Manual Refinement:** Wrapped aggregation pipelines in defensive try-catch handlers with descriptive error logging to `auditService`.
* **Verification:** Tested endpoint `GET /api/v1/dashboard/summary` via Supertest in `server/tests/api.test.js`.

---

### Prompt Entry 5: Responsive Academic UI Layout & Modern Component Tree
* **Phase:** Frontend Engineering
* **User Directive:**
  > "Build a modern, responsive academic placement portal in React 19 using Vite and Tailwind CSS v4. Include a dark slate sidebar (`bg-slate-900`) with Lucide icons, role-aware navigation links, active states, top navbar with in-app notification dropdown, and a quick-demo account switcher. Create interactive dashboard KPI cards and Recharts visualizations for department comparisons and placement funnels."
* **Antigravity Autonomous Actions:**
  - Scaffolded React 19 component tree in `client/src/`: layouts, components, context, and 12 dedicated pages.
  - Integrated Lucide React icons, Recharts responsive charts, and React Hot Toast notifications.
  - Added one-click demo login buttons directly onto the login page and top navbar for seamless examiner demonstration.
* **Manual Refinement:** Customized status badge colors with accessible contrast ratios for `Applied` (blue), `Shortlisted` (purple), `In Process` (amber), `Selected` (emerald), and `Rejected` (rose).
* **Verification:** Production bundle built successfully via `npm run build` in 1.0s.

---

### Prompt Entry 6: Autonomous Closed-Loop Error Diagnosis & Defect Resolution
* **Phase:** System Integration & Debugging
* **User Directive:**
  > "Solve the runtime server connection crash occurring during nodemon startup, resolve Vite frontend build warnings, and verify that the full test suite passes."
* **Antigravity Autonomous Actions:**
  1. *Dual Connection Crash:* Inspected nodemon crash log, identified duplicate Mongoose connection attempt in `server/scripts/seed.js`, and inserted a `mongoose.connection.readyState !== 1` condition.
  2. *Lucide Icon Export Resolution:* Detected unexported `Linkedin` and `Github` imports in `StudentProfilePage.jsx` during `npm run build`, and replaced them with standard SVG exports `Globe` and `Code`.
  3. *Port Clearance:* Identified running node instances holding ports 5000 and 5173, and terminated the orphaned background processes to allow clean terminal execution.
  4. *Automated Testing:* Executed `npm test` across `server/tests/eligibility.test.js` and `server/tests/api.test.js`, confirming all 22 test cases pass.
* **Outcome:** Zero runtime crashes; 100% build pass; all 22 tests green.
