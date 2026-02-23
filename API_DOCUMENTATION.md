# AERS API Documentation

Complete API reference for the Alert Escalation & Resolution System (AERS) backend.

**Base URL**: `http://localhost:8080` (local) or your deployed backend URL

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Alert APIs](#alert-apis)
3. [Dashboard APIs](#dashboard-apis)
4. [Configuration/Rules APIs](#configurationrules-apis)
5. [Health Check API](#health-check-api)
6. [Important Notes](#important-notes)

---

## Authentication APIs

### 1. POST `/api/auth/signup`

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "User created successfully"
}
```

**Validation:**
- `name`: Required
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: User with this email already exists

---

### 2. POST `/api/auth/login`

Login existing user.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input
- `404 Not Found`: User does not exist
- `401 Unauthorized`: Incorrect password

---

### 3. GET `/api/auth/me` 🔒

Get current user details (requires authentication).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required or invalid token
- `404 Not Found`: User not found

---

### 4. POST `/api/auth/refresh` 🔒

Refresh JWT token (requires authentication).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Failed to refresh token

---

## Alert APIs

### 5. POST `/api/alerts`

Ingest a new alert into the system.

**Request Body (Overspeeding Alert):**
```json
{
  "alertId": "ALT-2024-001",
  "driverId": "DRV-12345",
  "sourceType": "Overspeeding",
  "severity": "Info",
  "timestamp": "2024-02-23T10:30:00Z",
  "status": "OPEN",
  "metadata": {
    "driverId": "DRV-12345",
    "driverName": "John Smith",
    "driverPhone": "+1-555-0123",
    "speed": 85,
    "limit": 60,
    "location": "Highway 101",
    "document_valid": false
  }
}
```

**Request Body (Compliance Alert):**
```json
{
  "alertId": "ALT-2024-002",
  "driverId": "DRV-67890",
  "sourceType": "Compliance",
  "severity": "Info",
  "timestamp": "2024-02-23T11:00:00Z",
  "status": "OPEN",
  "metadata": {
    "driverId": "DRV-67890",
    "driverName": "Alice Johnson",
    "driverPhone": "+1-555-0456",
    "document_type": "license",
    "document_valid": true,
    "expiry_date": "2025-12-31"
  }
}
```

**Request Body (Negative Feedback Alert):**
```json
{
  "alertId": "ALT-2024-003",
  "driverId": "DRV-11111",
  "sourceType": "Negative Feedback",
  "severity": "Info",
  "timestamp": "2024-02-23T12:00:00Z",
  "status": "OPEN",
  "metadata": {
    "driverId": "DRV-11111",
    "driverName": "Bob Williams",
    "driverPhone": "+1-555-0789",
    "rating": 1,
    "comment": "Driver was rude",
    "customer_id": "CUST-999"
  }
}
```

**Response (201 Created):**
```json
{
  "alertId": "ALT-2024-001",
  "status": "success"
}
```

**Field Descriptions:**
- `alertId`: Unique identifier for the alert
- `driverId`: Driver identifier (optional)
- `sourceType`: Type of alert (Overspeeding, Compliance, Negative Feedback, etc.)
- `severity`: Alert severity (Info, Warning, Critical)
- `timestamp`: ISO 8601 timestamp
- `status`: Alert status (OPEN, ESCALATED, AUTO-CLOSED, RESOLVED)
- `metadata`: Additional alert-specific data
  - `driverId`: Driver identifier (stored in metadata for aggregation)
  - `driverName`: Full name of the driver
  - `driverPhone`: Contact phone number of the driver
  - Other source-type specific fields

**Error Responses:**
- `400 Bad Request`: Invalid alert format
- `500 Internal Server Error`: Failed to ingest alert

---

### 6. GET `/api/alerts`

Retrieve all alerts.

**Response (200 OK):**
```json
[
  {
    "alertId": "ALT-2024-001",
    "driverId": "DRV-12345",
    "sourceType": "Overspeeding",
    "severity": "Critical",
    "timestamp": "2024-02-23T10:30:00Z",
    "status": "ESCALATED",
    "metadata": {
      "driverId": "DRV-12345",
      "driverName": "John Smith",
      "driverPhone": "+1-555-0123",
      "speed": 85,
      "limit": 60,
      "location": "Highway 101"
    },
    "history": [
      {
        "state": "OPEN",
        "time": "2024-02-23T10:30:00Z",
        "note": "Alert created"
      },
      {
        "state": "ESCALATED",
        "time": "2024-02-23T10:35:00Z",
        "note": "Escalated to Critical due to 3 occurrences in 60 minutes"
      }
    ]
  }
]
```

**Error Responses:**
- `500 Internal Server Error`: Failed to fetch alerts

---

### 7. GET `/api/alerts/:alertId`

Get specific alert by ID.

**URL Parameters:**
- `alertId`: The unique alert identifier

**Example:** `GET /api/alerts/ALT-2024-001`

**Response (200 OK):**
```json
{
  "alertId": "ALT-2024-001",
  "driverId": "DRV-12345",
  "sourceType": "Overspeeding",
  "severity": "Critical",
  "timestamp": "2024-02-23T10:30:00Z",
  "status": "ESCALATED",
  "metadata": {
    "driverId": "DRV-12345",
    "driverName": "John Smith",
    "driverPhone": "+1-555-0123",
    "speed": 85,
    "limit": 60,
    "location": "Highway 101"
  },
  "history": [
    {
      "state": "OPEN",
      "time": "2024-02-23T10:30:00Z",
      "note": "Alert created"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Alert not found

---

### 8. PATCH `/api/alerts/:alertId/resolve`

Mark an alert as resolved.

**URL Parameters:**
- `alertId`: The unique alert identifier

**Example:** `PATCH /api/alerts/ALT-2024-001/resolve`

**Response (200 OK):**
```json
{
  "id": "ALT-2024-001",
  "status": "RESOLVED",
  "message": "Alert resolved successfully"
}
```

**Error Responses:**
- `500 Internal Server Error`: Failed to resolve alert

---

## Dashboard APIs

### 9. GET `/api/dashboard/stats`

Get overall dashboard statistics.

**Response (200 OK):**
```json
{
  "totalAlerts": 150,
  "openAlerts": 25,
  "escalatedAlerts": 10,
  "resolvedAlerts": 110,
  "autoClosedAlerts": 5
}
```

**Error Responses:**
- `500 Internal Server Error`: Failed to fetch stats

---

### 10. GET `/api/dashboard/trends`

Get alert trends over a specified time period.

**Query Parameters:**
- `days`: Number of days to retrieve (default: 7)

**Example:** `GET /api/dashboard/trends?days=14`

**Response (200 OK):**
```json
[
  {
    "date": "2024-02-16",
    "count": 12,
    "escalated": 3
  },
  {
    "date": "2024-02-17",
    "count": 15,
    "escalated": 5
  },
  {
    "date": "2024-02-18",
    "count": 10,
    "escalated": 2
  }
]
```

**Error Responses:**
- `500 Internal Server Error`: Failed to fetch trends data

---

### 11. GET `/api/dashboard/top-offenders`

Get drivers with the most alerts.

**Query Parameters:**
- `limit`: Number of results to return (default: 5)

**Example:** `GET /api/dashboard/top-offenders?limit=10`

**Response (200 OK):**
```json
[
  {
    "driverId": "DRV-12345",
    "driverName": "John Smith",
    "driverPhone": "+1-555-0123",
    "alertCount": 25,
    "severity": "Critical"
  },
  {
    "driverId": "DRV-67890",
    "driverName": "Alice Johnson",
    "driverPhone": "+1-555-0456",
    "alertCount": 18,
    "severity": "Warning"
  },
  {
    "driverId": "DRV-11111",
    "driverName": "Bob Williams",
    "driverPhone": "+1-555-0789",
    "alertCount": 15,
    "severity": "Critical"
  }
]
```

**Error Responses:**
- `500 Internal Server Error`: Failed to fetch top offenders

---

### 12. GET `/api/dashboard/recent-events`

Get recent alert events.

**Query Parameters:**
- `limit`: Number of results to return (default: 10)

**Example:** `GET /api/dashboard/recent-events?limit=20`

**Response (200 OK):**
```json
[
  {
    "alertId": "ALT-2024-003",
    "driverId": "DRV-11111",
    "sourceType": "Negative Feedback",
    "severity": "Warning",
    "status": "ESCALATED",
    "timestamp": "2024-02-23T12:00:00Z"
  },
  {
    "alertId": "ALT-2024-002",
    "driverId": "DRV-67890",
    "sourceType": "Compliance",
    "severity": "Info",
    "status": "AUTO-CLOSED",
    "timestamp": "2024-02-23T11:00:00Z"
  }
]
```

**Error Responses:**
- `500 Internal Server Error`: Failed to fetch recent events

---

## Configuration/Rules APIs

### 13. GET `/api/config/rules`

Get all configured rules.

**Response (200 OK):**
```json
{
  "Compliance": {
    "auto_close_if": "document_valid"
  },
  "Negative Feedback": {
    "escalate_if_count": 2,
    "window_mins": 1440,
    "target_severity": "Warning"
  },
  "Overspeeding": {
    "escalate_if_count": 3,
    "window_mins": 60,
    "target_severity": "Critical"
  }
}
```

---

### 14. GET `/api/config/rules/:ruleName`

Get a specific rule configuration.

**URL Parameters:**
- `ruleName`: Name of the rule (e.g., Overspeeding, Compliance, Negative Feedback)

**Example:** `GET /api/config/rules/Overspeeding`

**Response (200 OK):**
```json
{
  "escalate_if_count": 3,
  "window_mins": 60,
  "target_severity": "Critical"
}
```

**Error Responses:**
- `404 Not Found`: Rule not found

---

### 15. PUT `/api/config/rules/:ruleName` 🔒

Update a specific rule configuration (requires authentication).

**URL Parameters:**
- `ruleName`: Name of the rule to update

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Example:** `PUT /api/config/rules/Overspeeding`

**Request Body:**
```json
{
  "escalate_if_count": 5,
  "window_mins": 120,
  "target_severity": "Warning"
}
```

**Response (200 OK):**
```json
{
  "message": "Rule updated successfully",
  "rule": {
    "escalate_if_count": 5,
    "window_mins": 120,
    "target_severity": "Warning"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid rule format
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Failed to save rule to file

---

### 16. POST `/api/config/rules/reload` 🔒

Reload all rules from the configuration file (requires authentication).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "message": "Rules reloaded successfully",
  "rules": {
    "Compliance": {
      "auto_close_if": "document_valid"
    },
    "Negative Feedback": {
      "escalate_if_count": 2,
      "window_mins": 1440,
      "target_severity": "Warning"
    },
    "Overspeeding": {
      "escalate_if_count": 3,
      "window_mins": 60,
      "target_severity": "Critical"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Failed to reload rules

---

## Health Check API

### 17. GET `/api/health`

Check the health status of the AERS system.

**Response (200 OK):**
```json
{
  "status": "AERS System Operational",
  "database": "Connected",
  "redis": "Connected",
  "uptime": "2h15m30s"
}
```

**Field Descriptions:**
- `status`: Overall system status
- `database`: MongoDB connection status (Connected/Disconnected)
- `redis`: Redis cache connection status (Connected/Disconnected/Not Configured)
- `uptime`: Time since server started

---

## Important Notes

### Authentication

Protected routes (marked with 🔒) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

You can obtain a JWT token by:
1. Signing up via `/api/auth/signup`
2. Logging in via `/api/auth/login`

### Alert Status Values

- `OPEN`: Alert has been created and is awaiting processing
- `ESCALATED`: Alert has been escalated based on rule conditions
- `AUTO-CLOSED`: Alert was automatically closed by the system (e.g., Compliance alerts with valid documents)
- `RESOLVED`: Alert has been manually resolved by a user

### Alert Severity Values

- `Info`: Informational alert
- `Warning`: Warning level alert
- `Critical`: Critical level alert requiring immediate attention

### Source Types

- `Overspeeding`: Driver exceeded speed limits
- `Compliance`: Document validation alerts (license, insurance, etc.)
- `Negative Feedback`: Customer complaints or negative ratings
- Custom types can be added as needed

### Rule Logic

#### Compliance Rule
```json
{
  "auto_close_if": "document_valid"
}
```
- Automatically closes alerts when `metadata.document_valid` is `true`

#### Overspeeding Rule
```json
{
  "escalate_if_count": 3,
  "window_mins": 60,
  "target_severity": "Critical"
}
```
- Escalates to `Critical` if 3 or more overspeeding alerts occur within 60 minutes for the same driver

#### Negative Feedback Rule
```json
{
  "escalate_if_count": 2,
  "window_mins": 1440,
  "target_severity": "Warning"
}
```
- Escalates to `Warning` if 2 or more negative feedback alerts occur within 1440 minutes (24 hours) for the same driver

### CORS Configuration

The backend is configured to accept requests from:
- Production: `https://aers-alert-escalation-resolution-sy.vercel.app`
- Local Vite: `http://localhost:5173`
- Local React: `http://localhost:3000`

### Testing with Postman

1. **Create a new environment** with variables:
   - `base_url`: `http://localhost:8080`
   - `token`: (will be set after login)

2. **Authentication flow**:
   - Sign up or login to get a JWT token
   - Save the token to your environment variable
   - Use `{{token}}` in Authorization headers for protected routes

3. **Sample test sequence**:
   1. POST `/api/auth/signup` - Create a user
   2. GET `/api/health` - Check system health
   3. POST `/api/alerts` - Create test alerts
   4. GET `/api/alerts` - View all alerts
   5. GET `/api/dashboard/stats` - View statistics
   6. PATCH `/api/alerts/:alertId/resolve` - Resolve an alert

### Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

### Error Handling

All errors follow a consistent format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server-side error

---

## Support

For issues or questions, please refer to the project repository or contact the development team.

**Project**: AERS - Alert Escalation & Resolution System  
**Version**: 1.0  
**Last Updated**: February 23, 2026
