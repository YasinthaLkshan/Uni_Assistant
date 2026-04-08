# Workload Analysis - Quick Developer Reference

## File Structure

```
backend/
├── models/
│   └── Task.js (✏️ MODIFIED - added academicEvent, module refs)
├── services/
│   ├── workloadService.js (✏️ ADDED generateEnhancedWorkloadReportForUser)
│   └── recommendationService.js (✏️ FIXED past deadline filter)
├── controllers/
│   ├── workloadController.js (✏️ ADDED getEnhancedWorkloadAnalysis)
│   └── dashboardController.js (✏️ UPDATED to use enhanced analysis)
├── routes/
│   └── workloadRoutes.js (✏️ ADDED /analysis/enhanced route)
└── utils/
    └── workloadUtils.js (✏️ ENHANCED with new functions)

frontend/
└── src/
    ├── components/
    │   └── RecommendationCard.jsx (✏️ UPDATED with daysLeft)
    └── pages/
        └── DashboardPage.jsx (✏️ UPDATED normalizeSummary)

Documentation/
├── WORKLOAD_ANALYSIS_SUMMARY.md
├── WORKLOAD_ANALYSIS_IMPLEMENTATION.md
└── WORKLOAD_ANALYSIS_DEPLOYMENT.md
```

## Function APIs

### workloadUtils.js Exports

```javascript
// Original functions (still available)
export const calculateWorkloadScore(tasks)
export const determineWorkloadLevel(score)
export const getStudySuggestion(level)

// New functions
export const calculateEnhancedWorkloadScore(tasksWithDetails)
export const determineEnhancedWorkloadLevel(score)
export const getEnhancedStudySuggestion(eventsByUrgency)

// Helper functions (internal)
const getDaysUntilDeadline(deadline) → Number
const getUrgencyMultiplier(daysLeft) → Number (1-5)
const getTaskComplexityScore(task) → Number (1-7)
```

### workloadService.js Exports

```javascript
// Original function (still available)
export const generateWorkloadReportForUser(userId)

// New function
export const generateEnhancedWorkloadReportForUser(userId)
  → Returns: {
      metrics: { ... },
      workloadAnalysis: { level, intensity, score, recommendation },
      studySuggestion: { ... },
      mostUrgentEvent: { taskId, title, type, deadline, daysLeft, urgencyLevel },
      allEvents: { critical: [], high: [], medium: [], low: [] }
    }
```

### recommendationService.js

```javascript
// Modified function
export const getBestTaskRecommendation(userId)
  → Now filters: deadline: { $gt: now }
```

## Integration Examples

### Use Case 1: Get Enhanced Workload on Dashboard
```javascript
import { generateEnhancedWorkloadReportForUser } from "../services/workloadService.js";

const enhancedAnalysis = await generateEnhancedWorkloadReportForUser(userId);
const { smartRecommendation, studySuggestion } = enhancedAnalysis;
```

### Use Case 2: Create Smart Recommendation Message
```javascript
const createRecommendationMessage = (event) => {
  if (!event) return "No upcoming tasks";
  return `${event.daysLeft} day(s) until ${event.type}. Start preparation now.`;
};
```

### Use Case 3: Determine Study Hours
```javascript
const getStudyHours = (eventsByUrgency) => {
  const criticalCount = eventsByUrgency.critical?.length || 0;
  
  if (criticalCount > 0) return "5-6 hours/day";
  if (eventsByUrgency.high?.length > 0) return "3-4 hours/day";
  // ... etc
};
```

## Database Queries

### Get User's Active Tasks with Event Details
```javascript
const tasks = await Task.find({
  user: userId,
  status: { $ne: "Completed" }
})
  .populate("academicEvent", "title eventType weightPercentage")
  .populate("module", "lectureHoursPerWeek tutorialHoursPerWeek labHoursPerWeek")
  .lean();
```

### Get Most Urgent Upcoming Event
```javascript
const now = new Date();
const mostUrgent = await Task.find({
  user: userId,
  status: { $ne: "Completed" },
  deadline: { $gt: now }
})
  .populate("academicEvent")
  .sort({ deadline: 1 })
  .limit(1)
  .lean();
```

### Filter Out Overdue Tasks
```javascript
const activeOnly = await Task.find({
  user: userId,
  status: { $ne: "Completed" },
  deadline: { $gt: new Date() } // Key filter
})
  .lean();
```

## Response Examples

### Enhanced Workload Analysis Response
```json
{
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
    "taskId": "60d5ec49...",
    "title": "MIS Exam",
    "type": "exam",
    "deadline": "2026-04-11T09:00:00Z",
    "daysLeft": 3,
    "urgencyLevel": "High"
  }
}
```

### Smart Recommendation Response (Dashboard)
```json
{
  "taskId": "60d5ec49...",
  "title": "MIS Exam",
  "type": "exam",
  "urgencyLevel": "High",
  "deadline": "2026-04-11T09:00:00Z",
  "daysLeft": 3,
  "message": "3 day(s) until exam. Start preparation now."
}
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `mostUrgentEvent is null` | No tasks with future deadlines | Check task creation; verify deadline dates |
| Dashboard loads slowly | Many tasks being analyzed | Implement caching (5-10 min TTL) |
| Study hours not updating | Tasks not being picked up | Verify task status != "Completed" |
| Recommendation shows wrong event | Tasks not linked to events | Link via academic event title match |
| Past deadlines showing | Old filter not applied | Verify `deadline: { $gt: now }` filter |

## Testing Checklist

- [ ] Create task due in 12 hours → Should be critical
- [ ] Create task due in 3 days → Should be high urgency
- [ ] Create task due in 7+ days → Should be low urgency
- [ ] Create past-due task → Should not appear in recommendations
- [ ] Create exam with 30% weight → Should increase score by ~1.3x
- [ ] Create 5 tasks → Dashboard should show all categories
- [ ] Test with no tasks → Should show default "No recommendation"
- [ ] Verify dashboard loads in <500ms
- [ ] Check all API responses have correct structure
- [ ] Verify study suggestions match workload level

## Performance Tips

1. **Use Lean Queries**: `.lean()` for read-only operations
2. **Populate Efficiently**: Only select needed fields
3. **Parallel Queries**: Use `Promise.all()` for independent queries
4. **Cache Results**: Dashboard workload changes infrequently
5. **Index Deadline**: Add index on Task.deadline for sorting

## Debugging

### Enable Logging
```javascript
// In workloadService.js
console.log(`Processing ${tasksWithDetails.length} tasks`);
console.log(`Calculated workload score: ${enchancedScoreResult.score}`);
console.log(`Workload level: ${enhancedLevelResult.level}`);
console.log(`Most urgent: ${mostUrgentEvent?.title}`);
```

### Verify Data Structure
```javascript
// Check task enrichment
console.log(JSON.stringify(tasksWithDetails[0], null, 2));

// Check urgency calculation
console.log(`Event weight: ${taskDetail.academicEvent?.weightPercentage}`);
console.log(`Module hours: ${taskDetail.moduleData?.lectureHoursPerWeek}`);
```

## API Testing

### Using cURL
```bash
# Get enhanced workload analysis
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/workload/analysis/enhanced

# Get dashboard summary
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/dashboard
```

### Using Postman
1. Set up Bearer token authentication
2. GET `/api/workload/analysis/enhanced`
3. Verify response structure matches examples
4. Check metrics calculate correctly

## Related Documentation

- **Implementation Details**: `WORKLOAD_ANALYSIS_IMPLEMENTATION.md`
- **Deployment Guide**: `WORKLOAD_ANALYSIS_DEPLOYMENT.md`
- **User Summary**: `WORKLOAD_ANALYSIS_SUMMARY.md`

## Maintenance Notes

- Review workload scores monthly for accuracy
- Monitor if constants need adjustment:
  - NOTIFICATION_COOLDOWN_MINUTES
  - EXAM_ALERT_WINDOW_DAYS
  - Urgency multiplier thresholds
- Check if study suggestion hours match student feedback
- Update documentation if algorithm changes

---

**Last Updated**: April 2026
**Version**: 1.0 - Enhanced Workload Analysis
**Maintainer**: Academic Assistant Team
