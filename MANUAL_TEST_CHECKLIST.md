# Uni Assistant Manual Testing Checklist

Use this checklist during development testing before merging major changes.

## Test Setup

- [X] Backend server is running and connected to MongoDB.
- [X] Frontend app is running.
- [X] Browser local storage/session is clear before auth flow tests.
- [X] Use a fresh test user email for registration tests.

## 1) User Registration

- [X] Open Register page.
- [ ] Submit valid name, valid email, valid password, matching confirm password.
- [ ] Verify account creation succeeds.
- [ ] Verify app redirects to dashboard after successful registration.
- [ ] Verify invalid email format is rejected.
- [ ] Verify short password (< 6 chars) is rejected.
- [ ] Verify mismatched confirm password is rejected.
- [ ] Verify duplicate email registration is rejected with clear error.

Expected result:

- User can register once with a unique email and sees actionable validation errors for invalid input.

## 2) Login

- [ ] Open Login page.
- [ ] Login with valid registered credentials.
- [ ] Verify redirect to dashboard on success.
- [ ] Logout and attempt login with wrong password.
- [ ] Attempt login with unregistered email.
- [ ] Verify failure messages are shown and app does not log in.

Expected result:

- Valid credentials log in successfully; invalid credentials are blocked with clear feedback.

## 3) Protected Routes

- [ ] While logged out, directly open protected URLs (Dashboard, Tasks).
- [ ] Verify redirect to Login page.
- [ ] While logged in, open protected routes normally.
- [ ] Verify protected pages are accessible.
- [ ] Logout and use browser back button to revisit protected pages.
- [ ] Verify app returns to Login and does not expose protected content.

Expected result:

- Unauthenticated access is blocked; authenticated users can access protected pages.

## 4) Task Creation

- [ ] Open Tasks page.
- [ ] Create a task with valid title, type, future deadline, priority, description.
- [ ] Verify new task appears in task list.
- [ ] Create multiple tasks with different deadlines and priorities.
- [ ] Verify list displays tasks correctly with urgency badge.
- [ ] Attempt creating task with missing required fields.
- [ ] Verify validation blocks submission and shows clear messages.

Expected result:

- Valid tasks are created and visible immediately; invalid tasks are rejected.

## 5) Task Update

- [ ] Select an existing task and click Edit.
- [ ] Update title/type/deadline/priority/description and save.
- [ ] Verify updated values are reflected in the list.
- [ ] Change task status (Not Started -> In Progress -> Completed).
- [ ] Verify status updates persist after page refresh.

Expected result:

- Task edits and status updates are saved and rendered correctly.

## 6) Task Deletion

- [ ] Delete an existing task.
- [ ] Verify task is removed from list immediately.
- [ ] Refresh page and verify deleted task does not return.
- [ ] Delete task currently being edited and verify form resets safely.

Expected result:

- Deleted tasks are permanently removed and UI state remains stable.

## 7) Urgency Calculation

- [ ] Create or edit tasks with deadlines in these windows:
- [ ] Far deadline (low urgency expected).
- [ ] Near deadline (medium urgency expected).
- [ ] Very near deadline (high urgency expected).
- [ ] Verify urgency badges/colors align with backend urgency logic.
- [ ] Refresh and verify urgency remains consistent.

Expected result:

- Urgency level is calculated correctly and displayed consistently.

## 8) Workload Calculation

- [ ] Ensure user has a mixed set of tasks (count, urgency, exams).
- [ ] Open Dashboard and capture workload score/level.
- [ ] Add high-urgency tasks and refresh summary.
- [ ] Verify workload score/level increases appropriately.
- [ ] Complete/remove tasks and verify score/level updates downward when expected.

Expected result:

- Workload score and level react logically to task volume and urgency.

## 9) Smart Recommendation

- [ ] Open Dashboard with at least one pending task.
- [ ] Verify recommendation card appears with title/message/type/urgency.
- [ ] Add a more urgent task and refresh.
- [ ] Verify recommendation changes to prioritize the most critical item.
- [ ] Mark top-priority task completed and refresh.
- [ ] Verify recommendation updates to the next best task.

Expected result:

- Recommendation content updates dynamically based on current task state and urgency.

## 10) Dashboard Data Loading

- [ ] Reload Dashboard.
- [ ] Verify loading UI appears (spinner + skeleton placeholders).
- [ ] Verify smooth transition from loading state to final content.
- [ ] Simulate API failure (stop backend or use invalid token) and reload.
- [ ] Verify error state appears with retry option.
- [ ] Restore backend and verify retry loads data successfully.

Expected result:

- Dashboard loading, success, and error states are all handled cleanly.

## 11) Notification Generation

- [ ] Create/update tasks to trigger workload or urgency changes.
- [ ] Verify unread notification count changes on dashboard summary.
- [ ] Trigger same scenario repeatedly in a short period.
- [ ] Verify duplicate notification spam is not generated rapidly.
- [ ] Refresh and verify notification count persists.

Expected result:

- Notifications are generated for meaningful events, deduplicated when appropriate, and persisted.

## Final Regression Sweep

- [ ] Registration -> Login -> Dashboard -> Tasks -> Logout flow completes without errors.
- [ ] No console errors in browser during normal usage.
- [ ] Core pages remain responsive on mobile viewport widths.
- [ ] Build still succeeds after changes.

Sign-off:

- Tester: ____________________
- Date: ____________________
- Build/Commit: ____________________
- Notes: ____________________
