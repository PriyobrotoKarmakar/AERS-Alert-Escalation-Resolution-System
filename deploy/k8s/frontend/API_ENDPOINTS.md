# API Integration Documentation

## Overview
This document outlines all the API endpoints that the frontend expects from the backend. All API calls are configured to use the base URL from `VITE_API_URL` environment variable (defaults to `http://localhost:8080/api`).

## Authentication
All authenticated endpoints expect a `Bearer` token in the `Authorization` header. The token is automatically added by the axios interceptor.

---

## Authentication Endpoints (`/api/auth`)

### POST /api/auth/login
**Description:** User login
**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

### POST /api/auth/signup
**Description:** User registration
**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

### POST /api/auth/logout
**Description:** User logout
**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
**Description:** Get current authenticated user
**Response:**
```json
{
  "id": "string",
  "email": "string",
  "name": "string"
}
```

### POST /api/auth/refresh
**Description:** Refresh authentication token
**Response:**
```json
{
  "token": "string"
}
```

---

## Dashboard Endpoints (`/api/dashboard`)

### GET /api/dashboard/stats
**Description:** Get dashboard statistics
**Response:**
```json
{
  "totalActive": 24,
  "escalated": 7,
  "autoClosed24h": 142,
  "changePercent": 4,
  "timeSaved": "4.5"
}
```

### GET /api/dashboard/trends?days=7
**Description:** Get alert trends over time
**Query Parameters:**
- `days` (number): Number of days to fetch trends for (default: 7)

**Response:**
```json
[
  {
    "name": "Mon",
    "total": 120,
    "escalated": 15,
    "autoClosed": 85
  },
  {
    "name": "Tue", 
    "total": 132,
    "escalated": 18,
    "autoClosed": 90
  }
]
```

### GET /api/dashboard/top-offenders?limit=5
**Description:** Get drivers with most open alerts
**Query Parameters:**
- `limit` (number): Maximum number of drivers to return (default: 5)

**Response:**
```json
[
  {
    "id": "DRV-1042",
    "driverId": "DRV-1042",
    "name": "Rajesh Kumar",
    "driverName": "Rajesh Kumar",
    "openAlerts": 4,
    "alertCount": 4,
    "severity": "Critical"
  }
]
```

### GET /api/dashboard/recent-events?limit=10
**Description:** Get recent alert lifecycle events
**Query Parameters:**
- `limit` (number): Maximum number of events to return (default: 10)

**Response:**
```json
[
  {
    "id": "ALT-9921",
    "alertId": "ALT-9921",
    "type": "Overspeeding",
    "sourceType": "Overspeeding",
    "state": "ESCALATED",
    "status": "ESCALATED",
    "time": "10 mins ago",
    "timestamp": "2026-02-21T10:15:00Z"
  }
]
```

---

## Alerts Endpoints (`/api/alerts`)

### GET /api/alerts
**Description:** Fetch all alerts
**Response:**
```json
[
  {
    "id": "ALT-9921",
    "alertId": "ALT-9921",
    "driverId": "DRV-1042",
    "vehicle": "KA-01-MH-4421",
    "sourceType": "Overspeeding",
    "severity": "Critical",
    "status": "ESCALATED",
    "eventCount": 3,
    "timestamp": "2026-02-21T10:15:00Z"
  }
]
```

### GET /api/alerts/:alertId
**Description:** Get detailed information about a specific alert
**Path Parameters:**
- `alertId` (string): The alert ID

**Response:**
```json
{
  "id": "ALT-9921",
  "alertId": "ALT-9921",
  "driverId": "DRV-1042",
  "vehicle": "KA-01-MH-4421",
  "sourceType": "Overspeeding",
  "severity": "Critical",
  "status": "ESCALATED",
  "eventCount": 3,
  "timestamp": "2026-02-21T10:15:00Z",
  "history": [
    {
      "state": "OPEN",
      "time": "2026-02-21T09:45:00Z",
      "note": "Initial speed violation detected (85 km/h)."
    },
    {
      "state": "ESCALATED",
      "time": "2026-02-21T10:15:00Z",
      "note": "Rule triggered: 3 violations within 1 hour."
    }
  ]
}
```

### PATCH /api/alerts/:alertId/resolve
**Description:** Manually resolve an alert
**Path Parameters:**
- `alertId` (string): The alert ID to resolve

**Response:**
```json
{
  "id": "ALT-9921",
  "status": "RESOLVED",
  "message": "Alert resolved successfully"
}
```

### POST /api/alerts
**Description:** Create/ingest a new alert
**Request Body:**
```json
{
  "driverId": "DRV-1042",
  "vehicle": "KA-01-MH-4421",
  "sourceType": "Overspeeding",
  "severity": "Critical",
  "metadata": {}
}
```
**Response:**
```json
{
  "id": "ALT-9922",
  "message": "Alert created successfully"
}
```

---

## Configuration Endpoints (`/api/config`)

### GET /api/config/rules
**Description:** Get all active rules configuration
**Response:**
```json
{
  "overspeed": {
    "escalate_if_count": 3,
    "window_mins": 60,
    "severity": "Critical"
  },
  "feedback_negative": {
    "escalate_if_count": 2,
    "window_mins": 1440,
    "severity": "Warning"
  },
  "compliance": {
    "auto_close_if": "document_valid",
    "window_mins": 10080
  }
}
```

### GET /api/config/rules/:ruleName
**Description:** Get a specific rule by name
**Path Parameters:**
- `ruleName` (string): Name of the rule (e.g., "overspeed", "feedback_negative", "compliance")

**Response:**
```json
{
  "escalate_if_count": 3,
  "window_mins": 60,
  "severity": "Critical"
}
```

### PUT /api/config/rules/:ruleId
**Description:** Update a specific rule
**Path Parameters:**
- `ruleId` (string): The rule ID to update

**Request Body:**
```json
{
  "escalate_if_count": 5,
  "window_mins": 120,
  "severity": "High"
}
```
**Response:**
```json
{
  "message": "Rule updated successfully",
  "rule": {
    "escalate_if_count": 5,
    "window_mins": 120,
    "severity": "High"
  }
}
```

### POST /api/config/rules/reload
**Description:** Reload rules from config file
**Response:**
```json
{
  "message": "Rules reloaded successfully",
  "count": 3
}
```

---

## Error Handling

All endpoints should return standardized error responses:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (token missing/invalid)
- `404` - Not Found
- `500` - Internal Server Error

---

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
```

For production, update this to your production API URL.

---

## Testing the Integration

Once the backend is ready:

1. Start the backend server
2. Update the `.env` file with the correct API URL
3. Start the frontend dev server: `npm run dev`
4. All pages should now fetch real data from the backend

---

## Notes

- All timestamps should be in ISO 8601 format
- Field names are flexible - the frontend handles both camelCase and snake_case variations (e.g., `alertId` or `alert_id`, `driverId` or `driver_id`)
- Loading states and error handling are built into all pages
- Authentication token is automatically included in all requests via axios interceptor
