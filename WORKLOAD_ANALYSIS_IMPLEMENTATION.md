# Workload Analysis Implementation Guide

## Overview
The workload analysis system has been completely redesigned to provide intelligent, data-driven workload assessments and personalized study recommendations based on upcoming academic events, their weight, and module content requirements.

## Key Features

### 1. Enhanced Workload Scoring
The system now calculates workload scores considering multiple factors:

- **Time Urgency**: Tasks due within 1 day get 5x multiplier, 2 days get 4x, etc.
- **Task Complexity**: Different weights for exam (3pt), assignment (2pt), presentation (2pt)
- **Event Weight**: Academic events include weight percentage (e.g., 20% exam)
- **Module Load**: Lecture, tutorial, and lab hours per week influence difficulty

**Formula**:
```
taskScore = complexity × urgencyMultiplier × (1 + eventWeight) × (1 + moduleHoursFactor × 0.3)
totalWorkloadScore = sum of all taskScores
```

### 2. Intelligent Workload Levels
Five-tier system replacing the previous simple Low/Medium/High:

| Level | Score | Characteristics |
|-------|-------|-----------------|
| **Critical** | >30 | Multiple urgent deadlines within 48 hours |
| **High** | 20-30 | Several upcoming events requiring attention |
| **Medium-High** | 10-20 | Moderate workload with planned events |
| **Medium** | 5-10 | Manageable workload |
| **Low** | <5 | Light workload or good progress |

### 3. Dynamic Study Suggestions
Study recommendations now adapt based on urgency levels:

- **Critical**: "5-6 hours/day" - Focus on exam revision and assignment completion
- **High**: "3-4 hours/day" - Divide study time between subjects
- **Medium**: "2-3 hours/day" - Consistent daily revision
- **Low**: "1-2 hours/day" - Regular class review and group study

### 4. Smart Recommendations
The recommendation system now:
- Filters out tasks with past deadlines
- Prioritizes based on:
  1. Exam/assignment type (exams first)
  2. Days until deadline (closer = higher priority)
  3. Event weight percentage
  4. Urgency level

Most urgent event displays with:
- Days remaining countdown
- Event type and deadline
- Personalized focus message
- Urgency level color coding

## Data Model Changes

### Task Model Enhancements
Added two new reference fields to link tasks with academic context:

```javascript
academicEvent: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "AcademicEvent",
  default: null,
},
module: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Module",
  default: null,
}
```

**Benefits**:
- Automatically correlate tasks with academic events
- Access event weight and module hours for calculations
- Enable content-based workload analysis

## Backend Architecture

### Utility Functions (workloadUtils.js)

#### getDaysUntilDeadline(deadline)
Calculates days remaining until a deadline.

#### getUrgencyMultiplier(daysLeft)
Returns urgency multiplier based on time proximity:
- `daysLeft <= 1`: 5x (very urgent)
- `daysLeft <= 2`: 4x (urgent)
- `daysLeft <= 3`: 3x (high priority)
- `daysLeft <= 5`: 2x (medium priority)
- `daysLeft <= 7`: 1.5x (standard)
- `daysLeft > 7`: 1x (low priority)

#### getTaskComplexityScore(task)
Assigns complexity points based on task type and urgency level.

#### calculateEnhancedWorkloadScore(tasksWithDetails)
Main scoring function that:
1. Validates and categorizes tasks by urgency
2. Applies complexity, urgency, weight, and hour factors
3. Returns total score and breakdown by urgency category
4. Provides `eventsByUrgency` object for recommendations

#### determineEnhancedWorkloadLevel(score)
Returns workload level, intensity, and personalized recommendation.

#### getEnhancedStudySuggestion(eventsByUrgency)
Generates context-aware study recommendations with:
- Study hours per day
- Focus areas
- Study strategy
- Task breakdown approach

### Service Functions (workloadService.js)

#### generateEnhancedWorkloadReportForUser(userId)
Main analysis function:

```javascript
// Returns:
{
  metrics: {
    activeTasks,
    totalEvents,
    criticalEvents,
    highUrgencyEvents,
    mediumUrgencyEvents,
    lowUrgencyEvents,
    workloadScore,
    complexity
  },
  workloadAnalysis: {
    level,           // Critical/High/Medium-High/Medium/Low
    intensity,
    score,
    recommendation   // Personalized text
  },
  studySuggestion: {
    level,
    suggestedStudyHoursPerDay,
    focus,
    strategy,
    breakingDownTasks
  },
  mostUrgentEvent: {
    taskId,
    title,
    type,
    deadline,
    daysLeft,
    urgencyLevel
  },
  allEvents: {
    critical: [],
    high: [],
    medium: [],
    low: []
  }
}
```

### Controller Updates (dashboardController.js)

#### getDashboardSummary()
Enhanced to:
1. Call `generateEnhancedWorkloadReportForUser()`
2. Extract most urgent event for smart recommendation
3. Build comprehensive workload summary
4. Return updated study suggestions

### Route Updates (workloadRoutes.js)

**New Endpoint**:
```
GET /api/workload/analysis/enhanced
```

Returns enhanced workload analysis with all details above.

## Frontend Implementation

### Dashboard Page Updates
- Passes `daysLeft` to RecommendationCard
- Displays study suggestion strategy
- Shows workload intensity and recommendation
- Updates workload summary with enhanced metrics

### RecommendationCard Component
Enhanced to display:
- Task title (fixes "nm" bug)
- Days remaining countdown
- Event type
- Deadline
- Urgency level badge
- Dynamic message with preparation guidance

### Study Suggestion Card
Now shows:
- Adaptive study hours based on urgency
- Personalized focus areas
- Study strategy (how to approach revision)
- Actionable guidance

## API Response Example

```json
{
  "success": true,
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
      "focus": "Prioritize high-weight exams and assignments within next 48 hours",
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
    }
  }
}
```

## Usage Examples

### 1. Get Workload Analysis
```javascript
const response = await fetch('/api/workload/analysis/enhanced', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const analysis = await response.json();
```

### 2. Dashboard Integration
```javascript
const { data: { smartRecommendation, workloadSummary } } = 
  await getDashboardSummary();
```

## Migration and Setup

### Required Actions
1. Update Task model with new fields
2. Redeploy backend services
3. Clear any cached workload reports (optional)

### Optional Enhancements
1. Link existing tasks to academic events via module titles
2. Create a migration script to populate academicEvent references
3. Add analytics dashboard for workload trends

## Testing Recommendations

### Test Scenarios
1. **Critical Workload**: Create exam within 12 hours; verify 5x urgency multiplier
2. **Past Deadline**: Create task with past deadline; verify not in recommendations
3. **Event Weight**: Create 30% weight event; verify 1.3x score multiplier
4. **Multiple Events**: Create 5+ tasks; verify correct categorization
5. **Study Suggestions**: Test at each workload level for appropriate hours

### Sample Test Data
```javascript
// Critical event (exam in 2 days, 20% weight)
{
  title: "MIS Exam",
  type: "exam",
  deadline: Date.now() + 2 * 24 * 60 * 60 * 1000,
  urgencyLevel: "High",
  academicEvent: eventId // links to 20% weight event
}
```

## Performance Considerations

- Populate queries used for related data (academicEvent, module)
- Lean queries for dashboard summary
- Caching recommended for workload reports (5-10 minute TTL)

## Future Enhancements

1. **Content Coverage**: Link exams to specific lectures/chapters
2. **Study History**: Track completed revision sessions
3. **Predictive Analysis**: Suggest optimal study start dates
4. **Collaboration**: Group workload for team projects
5. **AI Recommendations**: ML-based personalized study plans

---

**Last Updated**: April 2026
**Version**: 1.0 - Enhanced Workload Analysis System
