# Dashboard Implementation Guide

## What's Been Implemented

The complete Global Job Dashboard has been implemented with:

### Frontend

- Interactive dashboard served from backend at `http://localhost:3000/`
- Real-time filtering by job handler, status, and category
- Search functionality
- Sortable columns
- Job history with status timeline
- JSON data viewer for each job

### Backend API Endpoints

#### Dashboard & Static Files

- **GET** `/` - Serves the dashboard HTML
- **GET** `/static/*` - Serves static assets

#### Job Endpoints

- **GET** `/api/jobs` - Get all jobs with complete data

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "jobHandler": "EMAIL",
        "jobCategory": "CRITICAL",
        "status": 0,
        "data": { "email": "user@example.com" },
        "history": [
          {
            "status": 0,
            "timestamp": "2026-02-28T10:00:00.000Z",
            "error": null
          }
        ],
        "createdAt": "2026-02-28T10:00:00.000Z",
        "updatedAt": "2026-02-28T10:00:00.000Z"
      }
    ]
  }
  ```

- **GET** `/api/jobs/updates?since={timestamp}` - Get jobs updated since timestamp

  ```bash
  curl "http://localhost:3000/api/jobs/updates?since=2026-02-28T10:00:00.000Z"
  ```

- **GET** `/api/jobs/:id` - Get job by ID
- **POST** `/api/jobs` - Create new job

  ```json
  {
    "jobHandler": "EMAIL",
    "jobCategory": "CRITICAL",
    "data": {
      "email": "user@example.com",
      "subject": "Welcome"
    }
  }
  ```

- **PUT** `/api/jobs/:id` - Update job status or data

  ```json
  {
    "status": 2,
    "data": { "retries": 3 }
  }
  ```

- **DELETE** `/api/jobs/:id` - Delete job

### Database Schema

**jobs table:**

```sql
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  job_handler VARCHAR(100) NOT NULL,
  job_category VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'SCHEDULED',
  data JSONB,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Job Status Mapping (Enums)

```
0 - SCHEDULED
1 - PUBLISHED
2 - PROCESSING
3 - PROCESSED
4 - RETRY
5 - ERROR
6 - DEAD
```

### Job Handler Types (Enums)

```
0 - EMAIL
1 - REPORT_GENERATION
2 - NOTIFICATION_CLEANUP
3 - WEBHOOK_TRIGGER
4 - CRM_SYNC
5 - PAYMENT
6 - REFUND
```

### Job Category Types (Enums)

```
0 - EXTERNAL
1 - STANDARD
2 - CRITICAL
```

## Quick Start

### 1. Start the server

```bash
npm run dev
```

### 2. Open dashboard

Visit `http://localhost:3000/` in your browser

### 3. Create a test job

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "jobHandler": 0,
    "jobCategory": 2,
    "data": {
      "email": "test@example.com",
      "subject": "Test Email"
    }
  }'
```

### 4. Poll for updates

```bash
curl "http://localhost:3000/api/jobs/updates?since=2026-02-28T10:00:00.000Z"
```

## Features

✅ **Real-time Updates** - `/api/jobs/updates` endpoint with timestamp-based polling
✅ **Advanced Filtering** - Filter by job handler, status, and category
✅ **Search** - Full-text search across all job data
✅ **Sorting** - Sort by created date, status, or handler
✅ **Job History** - Visual timeline of all status changes with error tracking
✅ **JSON Viewer** - Expandable raw JSON data view
✅ **Responsive Design** - Clean, modern dashboard UI
✅ **Static Serving** - All files served from backend, no separate frontend server needed

## Architecture

```
User Browser
    ↓
Express Server (Node.js + TypeScript)
    ├── Static Files (index.html)
    ├── /api/jobs endpoints
    ├── /api/jobs/updates (polling)
    └── Services → Repositories → PostgreSQL Database
```

## Project Structure Updates

```
src/
├── static/
│   └── index.html          (Dashboard frontend)
├── routes/
│   └── index.ts            (Updated with static serving)
├── controllers/
│   └── jobController.ts    (New getJobsUpdatedSince endpoint)
├── services/
│   └── jobService.ts       (New getJobsUpdatedSince method)
├── repositories/
│   └── jobRepository.ts    (New findUpdatedSince method)
├── models/
│   └── Job.ts              (Updated with new fields)
└── database/
    └── migrations.ts       (Updated schema)
```

## Testing the Dashboard

1. Create several jobs with different handlers and categories
2. Use the dashboard filters to find specific jobs
3. Click "View Details" to see job history and data
4. Update job status via API and watch dashboard update
5. Use the search box to find jobs by any data field

## Next Steps

- Implement real-time WebSocket polling instead of HTTP polling
- Add pagination for large job datasets
- Add job creation form in dashboard UI
- Add export/download functionality
- Implement job retry from dashboard
- Add admin controls for job management
