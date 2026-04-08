# Uni Assistant — Lecturer Scheduling System: Developer Handoff

> **Last updated:** 2026-04-08
> **Status:** Lecturer-side features complete. Admin and Student functions pending.

---

## Overview

Seven new features have been built on the lecturer side for academic scheduling. This document outlines what **admin** and **student** developers need to build to complete the system.

**Tech Stack:** Node.js + Express + MongoDB (backend) | React 18 + Vite (frontend)

---

## Architecture Reference

### New Backend Models

| Model | File | Purpose |
|-------|------|---------|
| `Programme` | `backend/models/Programme.js` | BSc, HND, Diploma, Certificate programmes |
| `Module` (enhanced) | `backend/models/Module.js` | Now has `programme`, `credits`, `lecturerAssignments` |
| `LectureSchedule` | `backend/models/LectureSchedule.js` | Individual 2-hour lecture sessions per date/slot |
| `Holiday` | `backend/models/Holiday.js` | Admin-managed closed days (poya, public, university) |
| `ScheduleChangeRequest` | `backend/models/ScheduleChangeRequest.js` | Lecturer requests to reschedule submitted sessions |
| `VivaSchedule` | `backend/models/VivaSchedule.js` | 3 viva types per assignment (30%, 80%, final) |
| `ExamPaper` (enhanced) | `backend/models/ExamPaper.js` | Now has `programme`, `module` refs |

### New Backend Services

| Service | File | Key Exports |
|---------|------|-------------|
| `programme.service.js` | `backend/services/` | CRUD for programmes |
| `lectureSchedule.service.js` | `backend/services/` | `addSessions`, `checkConflicts`, `submitSchedule`, `getScheduleSummary` |
| `holiday.service.js` | `backend/services/` | CRUD + `isHoliday(date)`, `getHolidaysInRange(start, end)` |
| `scheduleChangeRequest.service.js` | `backend/services/` | `fileChangeRequest`, `approveRequest`, `rejectRequest` |
| `vivaSchedule.service.js` | `backend/services/` | `proposeViva`, `approveViva`, `rejectViva`, clash detection |
| `examSchedule.service.js` | `backend/services/` | `getPossibleExamDates`, `validateExamDate`, `getExamWindow` |

### Existing API Routes (already mounted in `server.js`)

| Route Base | File | Auth |
|-----------|------|------|
| `/api/admin/programmes` | `programmeRoutes.js` | admin |
| `/api/holidays` | `holidayRoutes.js` | GET: any auth, POST/PUT/DELETE: admin |
| `/api/schedule-change-requests` | `scheduleChangeRequestRoutes.js` | lecturer + admin |
| `/api/viva-schedule` | `vivaScheduleRoutes.js` | lecturer + admin |
| `/api/lecturer/schedule/*` | `lecturerRoutes.js` | lecturer |
| `/api/lecturer/exam-schedule/*` | `lecturerRoutes.js` | lecturer |

### Time Slot Constants

All scheduling uses fixed 2-hour slots (defined in `LectureSchedule.js`):

| Slot | Start | End |
|------|-------|-----|
| 1 | 09:00 | 11:00 |
| 2 | 11:30 | 13:30 |
| 3 | 14:00 | 16:00 |

### Key Business Rules

- Weekends are **open** for scheduling (not blocked)
- Only admin-set holidays block scheduling
- Conflict detection checks: lecturer double-booking + batch (programme+year+group) clashes
- Exam window: 1 to 2 weeks after last lecture for a module+group
- Final viva day: NO lectures allowed for that batch on the same day
- Lecturers cannot edit submitted schedules — must file a change request

---

## What's Already Built (Complete)

### Admin Pages (done)

| Page | Route | Purpose |
|------|-------|---------|
| `AdminProgrammesPage` | `/admin/programmes` | CRUD for programmes |
| `AdminModulesPage` | `/admin/modules` | Enhanced with programme, credits, per-group lecturer assignments |
| `AdminHolidaysPage` | `/admin/holidays` | Manage closed days |
| `AdminChangeRequestsPage` | `/admin/change-requests` | Approve/reject schedule change requests |
| `AdminVivaReviewPage` | `/admin/viva-review` | Approve/reject proposed vivas |

### Lecturer Pages (done)

| Page | Route | Purpose |
|------|-------|---------|
| `LecturerSchedulePage` | `/lecturer/schedule` | Calendar-based lecture scheduling with conflict detection |
| `LecturerChangeRequestsPage` | `/lecturer/change-requests` | File reschedule requests |
| `LecturerExamSchedulePage` | `/lecturer/exam-schedule` | View possible exam dates |
| `LecturerVivaPage` | `/lecturer/vivas` | Propose viva dates |
| `LecturerDashboardPage` | `/lecturer/dashboard` | Shows pending tasks with actionable links |

---

## ADMIN: Functions To Build

### A1. Admin Dashboard — Pending Approvals (Priority: HIGH)

**What:** Add pending approval counters and links to `AdminDashboardOverviewPage.jsx`.

**Backend changes needed:**

File: `backend/services/adminAcademic.service.js` (or create `adminDashboard.service.js`)

```
New function: getAdminPendingCounts()
Returns:
  - pendingChangeRequests: ScheduleChangeRequest.countDocuments({ status: "pending" })
  - pendingVivas: VivaSchedule.countDocuments({ status: "proposed" })
  - pendingExamPapers: ExamPaper.countDocuments({ status: "Pending" })
  - totalProgrammes: Programme.countDocuments()
  - totalHolidays: Holiday.countDocuments({ date: { $gte: startOfYear } })
```

**Frontend changes:**
- File: `frontend/src/pages/admin/AdminDashboardOverviewPage.jsx`
- Add metric cards for pending counts
- Add clickable links to the respective approval pages

---

### A2. Admin Lecture Schedule Overview (Priority: HIGH)

**What:** Admin page to view all submitted lecture schedules across lecturers.

**Backend:**

File: `backend/routes/adminScheduleRoutes.js` (new)

```
GET  /api/admin/lecture-schedules                    — List all schedules (with filters)
GET  /api/admin/lecture-schedules/lecturer/:lecturerId — Filter by lecturer
GET  /api/admin/lecture-schedules/module/:moduleId     — Filter by module
GET  /api/admin/lecture-schedules/stats                — Summary stats
```

Service: `backend/services/adminSchedule.service.js` (new)

```javascript
// Query LectureSchedule model
// Populate: module (moduleCode, moduleName), lecturer (name, email), programme
// Filters: lecturer, module, programme, semester, status, date range
// Stats: total sessions, by status (draft/submitted), by lecturer
```

**Frontend:**

File: `frontend/src/pages/admin/AdminLecturerSchedulesPage.jsx` (new)

- Filter by: lecturer, module, programme, status
- Table: Lecturer | Module | Group | Total Sessions | Submitted | Draft | Last Updated
- Expandable rows to see individual session dates
- Route: `/admin/lecturer-schedules`

---

### A3. Admin Exam Paper Review (Priority: MEDIUM)

**What:** Admin page to review and approve/reject exam paper submissions.

**Backend:**

The ExamPaper model already has `status: ["Pending", "Approved", "Rejected"]` and `adminRemarks`. Need admin-specific endpoints:

File: `backend/routes/adminExamRoutes.js` (new)

```
GET  /api/admin/exam-papers           — List all exam papers (filter by status)
PUT  /api/admin/exam-papers/:id/approve — Approve with remarks
PUT  /api/admin/exam-papers/:id/reject  — Reject with remarks
```

Service: `backend/services/adminExam.service.js` (new)

```javascript
// Query ExamPaper model
// Populate: lecturer (name, email), module
// On approve: validate examDate against exam window using examSchedule.service.js
// Set status, adminRemarks, update timestamps
```

**Frontend:**

File: `frontend/src/pages/admin/AdminExamPapersPage.jsx` (new)

- Filter by status (default: Pending)
- Table: Lecturer | Module | Exam Title | Type | Date | File | Status | Actions
- Approve/Reject buttons with remarks textarea
- Route: `/admin/exam-papers`

---

## STUDENT: Functions To Build

### S1. Student Lecture Schedule (Priority: HIGH)

**What:** Students see their scheduled lectures from `LectureSchedule` model.

**Backend:**

File: `backend/routes/studentAcademicRoutes.js` (add endpoints)

```
GET  /api/student/lecture-schedule          — Student's lecture schedule
GET  /api/student/lecture-schedule/:moduleId — Filter by module
```

Service: `backend/services/studentAcademic.service.js` (add function)

```javascript
// Determine student's programme, year, group from StudentProfile
// Query LectureSchedule where:
//   programme = student.programme
//   academicYear = student.academicYear
//   group = student.groupNumber
//   status = "submitted"
// Populate: module (moduleCode, moduleName), lecturer (name)
// Sort by date, slot
```

**Frontend:**

File: `frontend/src/pages/MyLectureSchedulePage.jsx` (new)

- Shows upcoming lectures in a list/calendar view
- Columns: Date | Day | Time Slot | Module | Lecturer | Type (theory/lab)
- Filter by module
- Highlight today's lectures
- Route: `/my-lecture-schedule`

**Note:** The existing `MyTimetablePage.jsx` reads from `TimetableEntry` model (old system). Either update it to also query `LectureSchedule`, or create a separate page.

---

### S2. Student Viva Schedule (Priority: HIGH)

**What:** Students see their approved viva dates.

**Backend:**

File: `backend/routes/studentAcademicRoutes.js` (add endpoints)

```
GET  /api/student/viva-schedule — Student's approved vivas
```

Service: `backend/services/studentAcademic.service.js` (add function)

```javascript
// Determine student's programme, year, group from StudentProfile
// Query VivaSchedule where:
//   programme = student.programme
//   academicYear = student.academicYear
//   group = student.groupNumber
//   status = "approved"
// Populate: module (moduleCode, moduleName), lecturer (name)
// Sort by date
```

**Frontend:**

File: `frontend/src/pages/MyVivaSchedulePage.jsx` (new)

- Table: Assignment | Viva Type | Module | Date | Day | Time Slot | Lecturer
- Viva type labels: Documentation Check (30%) | Progress Check (80%) | Final Viva
- Highlight upcoming vivas
- Route: `/my-vivas`

---

### S3. Student Exam Schedule (Priority: HIGH)

**What:** Students see their upcoming exam dates.

**Backend:**

File: `backend/routes/studentAcademicRoutes.js` (add endpoints)

```
GET  /api/student/exam-schedule — Student's exams
```

Service: `backend/services/studentAcademic.service.js` (add function)

```javascript
// Determine student's programme, year, group, semester from StudentProfile
// Query ExamPaper where:
//   programme = student.programme OR groups includes student.groupNumber
//   semester = student.semester
//   status = "Approved"
// Return: moduleCode, moduleName, examTitle, examType, examDate, duration, totalMarks
// NEVER return: filePath, fileName (exam papers must not be visible to students)
// Sort by examDate
```

**CRITICAL:** Exam paper files must NEVER be exposed to students. Only return metadata (title, date, type, marks).

**Frontend:**

File: `frontend/src/pages/MyExamSchedulePage.jsx` (new)

- Table: Module | Exam Title | Type (Mid/End/Supplementary) | Date | Duration | Total Marks
- No file download links
- Route: `/my-exams`

---

### S4. Student Holiday Calendar (Priority: LOW)

**What:** Students can view the holiday calendar.

**Backend:**

The `/api/holidays` GET route already uses `protect` middleware only (no admin check), so **students can already access it**. No backend changes needed.

**Frontend:**

File: `frontend/src/pages/MyHolidayCalendarPage.jsx` (new)

- Uses existing `holidayService.js` — `listHolidays({ year })` already works
- Calendar or list view of holidays
- Filter by year
- Color-coded by type (Poya, Public, University)
- Route: `/my-holidays`

---

### S5. Student Programme Info (Priority: LOW)

**What:** Students see their programme details (name, duration, structure).

**Backend:**

File: `backend/routes/studentAcademicRoutes.js` (add endpoint)

```
GET  /api/student/my-programme — Student's programme details
```

Service:

```javascript
// Get student's StudentProfile
// If programme field exists, populate Programme model
// Return: programmeCode, programmeName, programmeType, duration, groups, description
// Include year/semester breakdown
```

**Note:** This requires linking `StudentProfile` to `Programme`. The `StudentProfile` model may need a `programme` field added.

**Frontend:**

File: `frontend/src/pages/MyProgrammePage.jsx` (new)

- Programme name, code, type, duration
- Year/semester structure breakdown
- Route: `/my-programme`

---

## Integration Checklist

### For each new page, developers need to:

1. **Backend:** Create service function(s)
2. **Backend:** Create controller function(s)
3. **Backend:** Add route(s) to appropriate route file
4. **Backend:** Register route in `server.js` (if new route file)
5. **Frontend:** Create API service function in `frontend/src/services/`
6. **Frontend:** Create page component in `frontend/src/pages/`
7. **Frontend:** Add route path to `frontend/src/routes/routePaths.js`
8. **Frontend:** Add route to `frontend/src/routes/AppRoutes.jsx`
9. **Frontend:** Add sidebar nav item to the relevant layout file:
   - Admin: `frontend/src/layouts/AdminLayout.jsx`
   - Student: `frontend/src/layouts/MainLayout.jsx`

### Existing patterns to follow:

- **Backend service:** See `backend/services/module.service.js` for CRUD pattern
- **Backend controller:** See `backend/controllers/module.controller.js` for response format
- **Backend routes:** See `backend/routes/moduleRoutes.js` for middleware chain
- **Frontend service:** See `frontend/src/services/moduleManagementService.js`
- **Frontend page:** See `frontend/src/pages/admin/AdminModulesPage.jsx` for full CRUD pattern
- **Error handling:** Use `AppError` (backend), `extractApiErrorMessage` (frontend)

### Standard response format:

```json
{
  "success": true,
  "message": "Description",
  "data": { ... }
}
```

---

## File Structure Summary

```
backend/
  models/
    Programme.js          — NEW
    LectureSchedule.js    — NEW
    Holiday.js            — NEW
    ScheduleChangeRequest.js — NEW
    VivaSchedule.js       — NEW
    Module.js             — ENHANCED (programme, credits, lecturerAssignments)
    ExamPaper.js          — ENHANCED (programme, module refs)
  services/
    programme.service.js          — NEW
    lectureSchedule.service.js    — NEW
    holiday.service.js            — NEW
    scheduleChangeRequest.service.js — NEW
    vivaSchedule.service.js       — NEW
    examSchedule.service.js       — NEW
    lecturer.service.js           — ENHANCED (resolveLecturerModules, dashboard)
    module.service.js             — ENHANCED (new fields)
  controllers/
    programme.controller.js            — NEW
    lectureSchedule.controller.js      — NEW
    holiday.controller.js              — NEW
    scheduleChangeRequest.controller.js — NEW
    vivaSchedule.controller.js         — NEW
    examSchedule.controller.js         — NEW
    module.controller.js               — ENHANCED
  routes/
    programmeRoutes.js                  — NEW
    holidayRoutes.js                    — NEW
    scheduleChangeRequestRoutes.js      — NEW
    vivaScheduleRoutes.js               — NEW
    lecturerRoutes.js                   — ENHANCED (schedule + exam endpoints)

frontend/
  src/
    services/
      programmeManagementService.js    — NEW
      lectureScheduleService.js        — NEW
      holidayService.js                — NEW
      scheduleChangeRequestService.js  — NEW
      vivaScheduleService.js           — NEW
      examScheduleService.js           — NEW
      moduleManagementService.js       — ENHANCED
    pages/
      admin/
        AdminProgrammesPage.jsx        — NEW
        AdminHolidaysPage.jsx          — NEW
        AdminChangeRequestsPage.jsx    — NEW
        AdminVivaReviewPage.jsx        — NEW
        AdminModulesPage.jsx           — ENHANCED
      lecturer/
        LecturerSchedulePage.jsx       — NEW
        LecturerChangeRequestsPage.jsx — NEW
        LecturerExamSchedulePage.jsx   — NEW
        LecturerVivaPage.jsx           — NEW
        LecturerDashboardPage.jsx      — ENHANCED
    routes/
      routePaths.js                    — ENHANCED
      AppRoutes.jsx                    — ENHANCED
    layouts/
      AdminLayout.jsx                  — ENHANCED (sidebar items)
      LecturerLayout.jsx              — ENHANCED (sidebar items)
```

---

## Priority Order for Remaining Work

| # | Task | Owner | Priority |
|---|------|-------|----------|
| 1 | Admin Dashboard — pending approval counts | Admin Dev | HIGH |
| 2 | Admin Lecture Schedule Overview page | Admin Dev | HIGH |
| 3 | Student Lecture Schedule page | Student Dev | HIGH |
| 4 | Student Viva Schedule page | Student Dev | HIGH |
| 5 | Student Exam Schedule page | Student Dev | HIGH |
| 6 | Admin Exam Paper Review page | Admin Dev | MEDIUM |
| 7 | Student Holiday Calendar page | Student Dev | LOW |
| 8 | Student Programme Info page | Student Dev | LOW |
