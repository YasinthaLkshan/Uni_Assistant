# Testing Workload Integration with Academic Events

## System Overview
The workload system now analyzes **both**:
1. **Manual Tasks** - created by students
2. **Academic Events** - created by admins (exams, assignments, presentations, etc.)

The system filters events by:
- Student's semester and group number
- Event date is in the future (≥ today)
- Event type matches approved list

---

## Test Scenarios

### Scenario 1: Dashboard Load with Academic Events
**Prerequisites:**
- You are logged in as a student
- Admin has created academic events (exams, assignments) for your group and semester
- Your StudentProfile has: semester and groupNumber set

**Test Steps:**
1. Clear browser cache or open DevTools → Application → Clear storage
2. Reload the dashboard page
3. Open browser console (F12 → Console)
4. Look for logs like:
   ```
   User 65abc123... (Sem 1, Grp 1): Found 2 tasks, 7 academic events
   Workload calculation: Score=18.5, Level=High, Total Items=9
   Event breakdown: Critical=1, High=5, Medium=3, Low=0
   ```

**Expected Results:**
- ✅ Workload score > 0 (should be around 10-30 for multiple upcoming events)
- ✅ Workload level shows: Low, Medium, Medium-High, High, or Critical
- ✅ Console logs show academic events were found
- ✅ Breakdown shows mix of critical/high/medium/low urgency events

---

### Scenario 2: Smart Recommendation Display
**Test Steps:**
1. On dashboard, look at "Smart Recommendation" card
2. Verify it shows:
   - Title of most urgent event (e.g., "MID", "PAF", "ITPM")
   - Days left until deadline
   - Urgency indicator (red=critical, orange=high, yellow=medium)
   - Relevant message (e.g., "1 day until exam. Start preparation now.")

**Expected Results:**
- ✅ Shows next urgent academic event from admin calendar
- ✅ Days left countdown is accurate
- ✅ No longer shows past events or null values

---

### Scenario 3: Workload Level Accuracy
**Test Steps:**
1. Check your academic calendar (My Academic Events page)
2. Count:
   - How many exams/assignments in next 1 day = Critical
   - How many in next 2-3 days = High urgency
   - How many in next 5 days = Medium urgency
3. Open dashboard and verify workload level matches:
   - 1+ critical items → **Critical** or **High** level
   - 3+ high urgency items → **High** level
   - 2+ medium items → **Medium-High** level
   - Few low-weight events → **Low** or **Medium** level

**Expected Results:**
- ✅ Workload level reflects your actual academic load
- ✅ Study suggestion matches the level (e.g., High = 3-4 hrs/day suggested)

---

### Scenario 4: Event Scoring Calculation
**Scoring Formula:**
```
Score = Base + (Complexity × UrgencyMultiplier × EventWeight)
Where:
- Complexity: 1-7 (exams=+3, assignments=+2, urgent level=+2)
- UrgencyMultiplier: 5 (≤1 day), 4 (≤2 days), 3 (≤3 days), 2 (≤5 days), 1.5 (≤7 days), 1 (>7 days)
- EventWeight: (weightPercentage/100) — 100% exam adds 1.0x multiplier, 50% assignment adds 0.5x
```

**Example Calculation:**
```
Exam in 1 day, 100% weight:
Score = 4 (base) × 5 (urgency) × (1 + 1.0) = 40 points (CRITICAL)

Assignment in 3 days, 30% weight:
Score = 3 (base) × 3 (urgency) × (1 + 0.3) = 11.7 points (MEDIUM-HIGH)
```

**Test Steps:**
1. Note one specific event (e.g., MID exam on Apr 9, 100% weight)
2. Calculate expected score using formula above
3. Check if final workload score includes this event's contribution

**Expected Results:**
- ✅ Workload score increases proportionally with event weight
- ✅ Exams (higher weight) have larger impact than minor assignments

---

### Scenario 5: Deduplication Check
**Test Steps:**
1. Create a manual Task titled "MID"
2. Verify academic event "MID" exists in admin calendar
3. Reload dashboard and check console logs
4. Count total items: should be `tasks + events - 1` (one duplicate removed)

**Example:**
```
Before dedup: 2 tasks + 7 events = 9
After dedup: 8 items shown in scoring
Console should log: Total Items=8
```

**Expected Results:**
- ✅ No double-counting of same event
- ✅ Console shows correct item count after deduplication

---

### Scenario 6: Past Event Filtering
**Test Steps:**
1. Admin creates one event dated April 5, 2026 (yesterday)
2. Admin creates one event dated April 10, 2026 (future)
3. Reload dashboard
4. Check console logs and academic events count

**Expected Results:**
- ✅ Only April 10 event is included (past event filtered out)
- ✅ Console shows count of included events
- ✅ Past events don't affect workload score

---

## Server Logs to Check

When testing, run server with visible logs:
```bash
npm run dev
# or
node backend/server.js
```

**Look for these logs in console:**

✅ **Event Fetching**
```
User 65abc123... (Sem 1, Grp 1): Found 2 tasks, 7 academic events
```

✅ **Score Calculation**
```
Workload calculation: Score=18.5, Level=High, Total Items=9
Event breakdown: Critical=1, High=5, Medium=3, Low=0
```

❌ **Problems**
```
No student profile found for user 65abc123...  // StudentProfile not linked
```

---

## Troubleshooting

### Issue: Workload Score Still Shows 0
**Solutions:**
1. Verify StudentProfile exists:
   - Go to MongoDB: `db.studentprofiles.findOne({user: "yourUserId"})`
   - Should show `semester` and `groupNumber` fields
2. Verify AcademicEvents exist with matching semester/group:
   - Check: `db.academicevents.find({semester: 1, groupNumber: 1, eventDate: {$gt: new Date()}})`
3. Check browser console for error messages
4. Check server console for "No student profile found" warning

### Issue: Academic Events Not Appearing
**Solutions:**
1. Verify event date is in future (today or later): `eventDate: {$gt: now}`
2. Verify eventType is in approved list (see workloadService.js line 175-189)
3. Verify admin created event with correct semester and group number
4. Verify event weightPercentage is set (even 0% should work, but typically 10-100%)

### Issue: Wrong Workload Level
**Solutions:**
1. Count your upcoming events manually
2. Check the scoring formula above
3. Enable detailed logging in workloadService.js to see individual event scores
4. Verify event weights are set correctly (check in admin dashboard)

---

## Expected Behavior by Event Count

| Scenario | Task Count | Event Count | Expected Score | Expected Level |
|----------|-----------|-------------|-----------------|-----------------|
| No events | 0 | 0 | 0 | Low |
| 1 far event | 0 | 1 (7 days out) | ~3-5 | Low |
| 1 exam soon | 0 | 1 (2 days, 100%) | ~25-30 | High/Critical |
| 3 mixed events | 0 | 3 (2d + 3d + 5d exams) | ~15-20 | Medium-High/High |
| Week of exams | 0 | 5+ (all ≤5 days) | >30 | Critical |

---

## Performance Notes

- First load may be slightly slower (system fetches StudentProfile + Tasks + AcademicEvents in parallel)
- Subsequent loads should be fast (database indexes on semester+groupNumber)
- Console logs can be disabled in production by removing `console.log` statements

---

## Next Steps

1. **Test all scenarios above**
2. **Document any unexpected results with:**
   - Console log output
   - Expected vs actual workload score
   - Number of events found
3. **Report issues** if any tests fail unexpectedly

