# PlaceTrack — AI Development Usage Log
**Course:** AI Tools for Software Development  
**AI Platform Documented:** Google Antigravity (Agentic AI Software Development Environment, Google DeepMind)  
**Academic Session:** 2026-27  
**Institution:** D.K.T.E. Society’s Textile and Engineering Institute, Ichalkaranji  
**Department:** Computer Science & Engineering  
**Student:** Varad Mahadev Kadam (PRN: 23UCS047)  
**Project Guide:** Dr. P. M. Gavali  

---

## 1. Agentic AI-Assisted Development Overview

This document records the systematic application of **Google Antigravity**—Google DeepMind's agentic AI coding environment—across the full lifecycle of **PlaceTrack — College Placement Management System**.

Unlike passive AI conversational models that merely generate isolated text snippets requiring manual developer copy-pasting, **Google Antigravity functions as an autonomous, workspace-aware software engineering agent**. It observes the local repository, formulates multi-step execution plans, performs surgical code edits, executes terminal commands, and carries out closed-loop error diagnostics directly in the environment.

```
+-------------------------------------------------------------------------------------------------+
|                    GOOGLE ANTIGRAVITY AGENTIC SOFTWARE ENGINEERING LIFECYCLE                    |
|                                                                                                 |
|   [1. Requirements & State Machine]  --->  [2. Database Schema Synthesis]                       |
|   - Formalize 6-point eligibility          - 9 Mongoose ODM models                              |
|   - Define valid state transitions         - Compound unique index on applications              |
|                   |                                       |                                     |
|                   v                                       v                                     |
|   [4. Frontend Engineering]          <---  [3. Deterministic Eligibility Engine]                |
|   - React 19 + Tailwind CSS v4             - Algorithmic, auditable service                     |
|   - Interactive Recharts & UI              - Zero runtime LLM dependencies                      |
|                   |                                                                             |
|                   v                                                                             |
|   [5. Closed-Loop Diagnostics]       --->  [6. Automated QA & Verification]                     |
|   - Mongoose connection guard              - Vitest & Supertest suites                          |
|   - Lucide icon export resolution          - 22/22 Automated tests passing                      |
+-------------------------------------------------------------------------------------------------+
```

---

## 2. Phase-by-Phase Antigravity Interaction Breakdown

### Phase 1: Requirements Analysis & Role-Based Permissions
* **Objective:** Formalize business rules for 3 distinct user roles (Admin, TPO, Student) and establish strict boundary constraints.
* **Agentic Trajectory:** Antigravity inspected the domain specifications to identify critical failure modes (e.g., student applying twice to the same drive, unauthorized tampering with CGPA/backlogs, duplicate counting in placement ratios).
* **Architectural Decision:** Maintained a strict boundary: **AI was employed to engineer the architecture, schemas, and code, while runtime student eligibility verification is 100% deterministic, auditable JavaScript code.**

### Phase 2: Database Schema Architecture (Mongoose ODM)
* **Objective:** Design 9 relational Mongoose schemas (`User`, `StudentProfile`, `Company`, `PlacementDrive`, `Application`, `InterviewRound`, `Offer`, `Notification`, `AuditLog`).
* **Agentic Trajectory:** Antigravity generated schemas with strict type constraints, referential relationships (`ref`), pre-save hashing hooks, and index optimizations.
* **Integrity Guardrail:** Antigravity synthesized a compound unique index `{ student: 1, drive: 1 }` on the `Application` schema, preventing race conditions or duplicate submissions at the database layer.

### Phase 3: Centralized Eligibility Engine Service
* **Objective:** Formulate a single source of truth for candidate qualification without redundant logic across routes.
* **Agentic Trajectory:** Antigravity constructed `server/src/services/eligibilityService.js` to execute deterministic checks against 6 criteria:
  1. Minimum CGPA threshold
  2. Maximum allowable active backlogs
  3. Eligible academic departments
  4. Target graduation batch year
  5. Application deadline timestamp
  6. Placement drive publication status (`Published` vs `Draft`/`Archived`)
* **Feedback Enhancement:** Structured the return payload as `{ isEligible: boolean, reasons: string[] }`, ensuring disqualified students receive itemized, transparent justifications.

### Phase 4: UI/UX & Component Engineering (React + Tailwind CSS)
* **Objective:** Create a modern academic administration interface with a dark slate sidebar (`bg-slate-900`), responsive layout, and real-time visualization widgets.
* **Agentic Trajectory:** Antigravity synthesized the React 19 component tree utilizing Vite, Tailwind CSS v4, Lucide icons, and Recharts.
* **Usability Enhancement:** Added one-click demo login buttons on the login interface and top navigation bar, allowing evaluators and external examiners to immediately switch between Admin, TPO, and Student roles with pre-seeded credentials.

### Phase 5: Autonomous Diagnostics & Self-Correction
* **Dual-Connection Crash Fix:** When the server auto-seed script threw `MongooseError: Can't call openUri() on an active connection with different connection strings`, Antigravity autonomously diagnosed the trace and injected a `mongoose.connection.readyState !== 1` condition in `server/scripts/seed.js`.
* **Vite Lucide Icon Export Resolution:** When the frontend build failed due to unexported icons (`Linkedin`, `Github`), Antigravity identified the issue, replaced them with standard SVG exports (`Globe`, `Code`), and verified a clean production build (`npm run build` in 1.0s).
* **Port Conflict Management:** Autonomously cleared orphaned processes on ports 5000 and 5173 when terminal port collisions occurred.

### Phase 6: Automated Testing & Verification
* **Objective:** Validate endpoints and business rules with Vitest and Supertest.
* **Agentic Trajectory:** Antigravity created and executed unit and integration suites (`tests/eligibility.test.js` and `tests/api.test.js`).
* **Outcome:** Executed test suite (`npm test`), verifying a **100% pass rate across 22 test cases** (8 unit tests, 14 API integration tests).

---

## 3. Google Antigravity Code Interventions Summary

| File / Component | Initial State / Challenge | Antigravity Action & Refinement | Engineering Rationale |
|---|---|---|---|
| `server/src/models/Application.js` | Basic student and drive references | Injected `{ student: 1, drive: 1 }` compound unique index | Database-level guarantee against race condition duplicates |
| `server/src/config/db.js` | Standard MongoDB Atlas connection | Engineered automatic in-memory fallback | Guarantees zero-config instant demonstration if MongoDB service is unavailable |
| `server/scripts/seed.js` | Unconditional `connectDB()` call | Injected `readyState !== 1` check | Prevents dual connection crash during server auto-seed startup |
| `client/src/pages/StudentProfilePage.jsx` | Unexported social icon imports | Substituted standard `Globe` and `Code` icons | Resolved Vite bundling failure; enabled clean production build |
| `server/src/controllers/studentController.js` | Standard profile update | Implemented strict blacklist of academic fields for student role | Enforces academic integrity: students cannot alter their own CGPA or backlogs |
| `server/src/services/eligibilityService.js` | Binary eligibility check | Enhanced with itemized human-readable `reasons[]` array | Delivers transparent, auditable feedback for disqualified candidates |

---

## 4. Academic Integrity & Tool Boundaries

1. **Deterministic Execution:** While Google Antigravity was leveraged extensively for code generation, schema synthesis, and automated debugging, **all runtime evaluation logic (student eligibility, interview round progression, offer extension) is executed by pure, deterministic JavaScript and MongoDB queries without runtime AI dependencies.**
2. **Auditable Artifacts:** All prompt histories, agentic tool invocations, and manual refinements have been logged transparently to satisfy the academic requirements of the **AI Tools for Software Development** course.
