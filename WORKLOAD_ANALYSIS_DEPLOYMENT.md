# Workload Analysis Implementation - Deployment Guide

## Summary of Changes

This document provides a complete overview of the workload analysis system implementation, all files modified, and deployment instructions.

## Modified Files

### Backend Models
1. **backend/models/Task.js**
   - Added `academicEvent` reference (ObjectId, ref: "AcademicEvent")
   - Added `module` reference (ObjectId, ref: "Module")
   - Purpose: Link tasks to their academic context for enhanced analysis

### Backend Services
1. **backend/services/workloadService.js**
   - Added imports for enhanced functions
   - Added `generateEnhancedWorkloadReportForUser()` function
   - Uses populate() for academicEvent and module relations
   - Returns comprehensive analysis with 7+ metrics

2. **backend/services/recommendationService.js**
   - Added filter: `deadline: { $gt: now }` to exclude past deadlines
   - Prevents showing overdue tasks as recommendations
   - Fixes "nm" (name missing) issue caused by past-date anomalies

### Backend Controllers
1. **backend/controllers/workloadController.js**
   - Added import for `generateEnhancedWorkloadReportForUser`
   - Added `getEnhancedWorkloadAnalysis()` endpoint handler
   - Maps to GET /api/workload/analysis/enhanced

2. **backend/controllers/dashboardController.js**
   - Removed: WorkloadReport.findOne() query
   - Added: `generateEnhancedWorkloadReportForUser()` call
   - Updated: `buildWorkloadSummary()` to use enhanced data
   - Updated: `getDashboardSummary()` to extract mostUrgentEvent
   - Smart recommendation now shows event with daysLeft counter

### Backend Utilities
1. **backend/utils/workloadUtils.js**
   - Added helper functions:
     * `getDaysUntilDeadline(deadline)` - Calculate days remaining
     * `getUrgencyMultiplier(daysLeft)` - Get 1x to 5x multiplier
     * `getTaskComplexityScore(task)` - Score based on type/urgency
   
   - Added new export functions:
     * `calculateEnhancedWorkloadScore(tasksWithDetails)` - Main scorer
     * `determineEnhancedWorkloadLevel(score)` - 5-tier classification
     * `getEnhancedStudySuggestion(eventsByUrgency)` - Smart recommendations
   
   - Keeps backward compatibility:
     * `calculateWorkloadScore()` - Still available
     * `determineWorkloadLevel()` - Still available
     * `getStudySuggestion()` - Still available

### Backend Routes
1. **backend/routes/workloadRoutes.js**
   - Added import for `getEnhancedWorkloadAnalysis`
   - Added route: `GET /analysis/enhanced`
   - Protected by auth middleware

### Frontend Components
1. **frontend/src/components/RecommendationCard.jsx**
   - Added `daysLeft` prop handling
   - Displays "X day(s) left" in metric stack
   - Shows time remaining prominently

2. **frontend/src/pages/DashboardPage.jsx**
   - Updated `normalizeSummary()` to handle new properties:
     * `studySuggestion.level`
     * `studySuggestion.focus`
     * `studySuggestion.strategy`
     * `smartRecommendation.daysLeft`
   - Updated recommendation card rendering to pass daysLeft
   - Updated study suggestion card to show strategy
   - Displays workload recommendation text

## New Endpoints

### GET /api/workload/analysis/enhanced
**Protected by**: `protect` middleware (authentication required)

**Request**:
```
GET /api/workload/analysis/enhanced
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Enhanced workload analysis generated successfully",
  "data": {
    "metrics": {
      "activeTasks": 4,
      "totalEvents": 4,
      "criticalEvents": 1,
      "highUrgencyEvents": 1,
      "mediumUrgencyEvents": 1,
      "lowUrgencyEvents": 1,
      "workloadScore": 18.5,
      "complexity": 10
    },
    "workloadAnalysis": {
      "level": "High",
      "intensity": "High",
      "score": 18.5,
      "recommendation": "Several upcoming events. Create a detailed study schedule."
    },
    "studySuggestion": {
      "level": "High",
      "suggestedStudyHoursPerDay": "3-4 hours/day",
      "focus": "Prioritize high-urgency events within next 48 hours",
      "strategy": "Divide study time between different subjects/assignments",
      "breakingDownTasks": true
    },
    "mostUrgentEvent": {
      "taskId": "60d5ec49c1234567890abcde",
      "title": "MIS Exam",
      "type": "exam",
      "deadline": "2026-04-11T09:00:00Z",
      "daysLeft": 3,
      "urgencyLevel": "High"
    },
    "allEvents": {
      "critical": [],
      "high": [{...}],
      "medium": [{...}],
      "low": [{...}]
    }
  }
}
```

## Database Migration

### For MongoDB
No data migration required - new fields are optional references.

**Optional Schema Update** (if using MongoDB schema validation):
```javascript
db.tasks.updateMany(
  {},
  { $set: { academicEvent: null, module: null } },
  { multi: true }
)
```

### For Existing Tasks
Recommendation: Run a script to link tasks to academic events based on title matching:

```javascript
// Example: Link tasks to events by title
db.tasks.aggregate([
  {
    $lookup: {
      from: "academicevents",
      let: { taskTitle: "$title" },
      pipeline: [
        { $match: { $expr: { $regexMatch: { input: "$title", regex: "$$taskTitle", options: "i" } } } }
      ],
      as: "event"
    }
  },
  { $set: { academicEvent: { $first: "$event._id" } } },
  { $out: "tasks" }
])
```

## Deployment Checklist

- [ ] **Backend**
  - [ ] Pull latest code
  - [ ] Run `npm install` (if dependencies changed)
  - [ ] Verify `.env` configuration
  - [ ] Test locally: `npm run dev`
  - [ ] Check API endpoints: `GET /api/workload/analysis/enhanced`
  - [ ] Deploy to staging
  - [ ] Run smoke tests

- [ ] **Frontend**
  - [ ] Pull latest code
  - [ ] Run `npm install` (if dependencies changed)
  - [ ] Test dashboard page locally
  - [ ] Verify workload card updates
  - [ ] Check recommendation card displays correctly
  - [ ] Test with different workload levels
  - [ ] Build: `npm run build`
  - [ ] Deploy to staging
  - [ ] Test in staging environment

- [ ] **Database**
  - [ ] Backup existing data
  - [ ] Optional: Run task-event linking script
  - [ ] Verify no errors in logs

- [ ] **Testing**
  - [ ] Test with fresh task creation
  - [ ] Test with multiple upcoming events
  - [ ] Test past deadline filtering
  - [ ] Test event weight calculations
  - [ ] Verify study suggestions change based on workload

## Environment Variables
No new environment variables required.

## Backward Compatibility
✅ All existing endpoints continue to work:
- `GET /api/workload/` - Still available
- `GET /api/workload/latest` - Still available
- All existing task endpoints unchanged
- RecommendationCard component still works with old props

## Performance Notes

### Optimization
- Populate queries used to fetch academicEvent and module in one round trip
- Lean queries used for read-only operations
- Dashboard summary uses parallel Promise.all()

### Caching Recommendation
For high-load scenarios, consider caching workload reports:
```javascript
// Suggested: Cache for 5-10 minutes per user
const WORKLOAD_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

## Monitoring & Logging

### Key Metrics to Monitor
1. Workload score distribution across users
2. Average urgency categories (critical/high/medium/low)
3. Study suggestion adherence
4. Most recommended events

### Logs to Watch
- Missing academicEvent/module references (OK - optional)
- Notification creation cooldown triggers
- Dashboard response times (should be <500ms)

## Rollback Plan

If issues occur:

1. **Quick Rollback**:
   - Revert dashboardController.js to call old `getBestTaskRecommendation()`
   - Use `WorkloadReport.findOne()` instead of enhanced generation

2. **Full Rollback**:
   - Remove new fields from Task model (optional)
   - Revert all service files
   - Revert frontend components to previous version

3. **Emergency**: Deployment pipeline can roll back to previous stable version

## Support & Troubleshooting

### Common Issues

**1. "mostUrgentEvent is null"**
- Cause: No tasks with future deadlines
- Expected behavior: Dashboard shows "No recommendation yet"
- Resolution: User needs to create tasks

**2. Smart recommendation showing wrong event**
- Cause: academicEvent not linked to task
- Solution: Run task-event linking script (optional)

**3. Study suggestion not updating**
- Cause: Workload level not changing due to missing events
- Support: Check that tasks have correct deadlines

**4. Dashboard loads slowly**
- Cause: Enhanced workload generation with many tasks
- Solution: Implement result caching (see Performance Notes)

### Debug Mode
Add logging to generateEnhancedWorkloadReportForUser():
```javascript
console.log(`Analyzing ${tasksWithDetails.length} tasks`);
console.log(`Score: ${enchancedScoreResult.score}`);
console.log(`Level: ${enhancedLevelResult.level}`);
```

## Testing Playlist

### Manual Testing Steps

1. **Create fresh task**:
   - Create new task due in 3 days
   - Verify appears in dashboard
   - Check workload score increases

2. **Test urgency levels**:
   - Create task due in 12 hours → Should show critical
   - Create task due in 3 days → Should show high
   - Create task due in 7 days → Should show medium/low

3. **Test past deadline fix**:
   - Create task with past deadline
   - Verify NOT shown in recommendations
   - Verify no UI errors

4. **Test study suggestions**:
   - 1 critical event → Should recommend "5-6 hours/day"
   - 3 high events → Should recommend "3-4 hours/day"
   - No events → Should recommend "1 hour/day"

## Documentation Files

- `WORKLOAD_ANALYSIS_IMPLEMENTATION.md` - Technical implementation details
- `WORKLOAD_ANALYSIS_DEPLOYMENT.md` - This file
- README sections updated with new API endpoints

## Contact & Support

For questions about the implementation:
1. Check WORKLOAD_ANALYSIS_IMPLEMENTATION.md
2. Review code comments in modified files
3. Check git history for changes
4. Run test suite

---

**Deployment Version**: 1.0
**Date**: April 2026
**Status**: Ready for Production
