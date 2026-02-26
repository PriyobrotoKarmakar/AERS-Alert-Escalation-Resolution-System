# AERS Backend - Alert Escalation Resolution System

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [Alert Processing Workflow](#alert-processing-workflow)
- [Rule Engine](#rule-engine)
- [Auto-Close Mechanism](#auto-close-mechanism)
- [Escalation Logic](#escalation-logic)
- [Dashboard & Caching](#dashboard--caching)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Development Guide](#development-guide)

---

## 🎯 Overview

The AERS Backend is a sophisticated **alert management and escalation system** designed for fleet monitoring. It automatically processes incoming alerts, applies intelligent rule-based escalation, implements auto-closing for compliant events, and provides real-time dashboards for monitoring fleet operations.

### Key Features
- ✅ **Real-time Alert Ingestion** with automatic processing
- ✅ **Rule-based Escalation** triggered by frequency patterns
- ✅ **Auto-Close Mechanism** for compliant documents
- ✅ **JWT Authentication** with secure token management
- ✅ **Redis Caching** for optimized dashboard performance
- ✅ **MongoDB Storage** with unique email constraints
- ✅ **RESTful API** with Gin web framework
- ✅ **Historical Tracking** of all alert state changes

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Frontend)                       │
│            React + Vite + TailwindCSS + Shadcn/ui           │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS/REST API
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                     AERS Backend (Gin)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            API Layer (HTTP Handlers)                   │ │
│  │  • Auth Handler    • Alert Handler                     │ │
│  │  • Dashboard Handler  • Rules Handler                  │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   ↓                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Business Logic Layer (Services)               │ │
│  │  • Auth Service   • Alert Service                      │ │
│  │  • Dashboard Service  • Rule Engine                    │ │
│  └────────────┬─────────────────────────────┬─────────────┘ │
│               ↓                             ↓                │
│  ┌────────────────────────┐  ┌────────────────────────────┐ │
│  │  Repository Layer      │  │    Rule Engine             │ │
│  │  • Auth Repository     │  │  • Config Loader           │ │
│  │  • Alert Repository    │  │  • Escalation Evaluator    │ │
│  │  • Dashboard Repo      │  │  • Auto-Close Evaluator    │ │
│  └────────┬───────────────┘  └────────────────────────────┘ │
└───────────┼──────────────────────────────────────────────────┘
            │
            ↓
┌───────────────────────┬─────────────────────────────────────┐
│                       │                                     │
│   MongoDB Atlas       │        Upstash Redis                │
│   • users collection  │     • Dashboard cache               │
│   • alerts collection │     • Stats cache                   │
│   • Unique indexes    │     • TTL: 5-10 mins                │
└───────────────────────┴─────────────────────────────────────┘
```

### Request Flow Diagram

```
Client Request
     │
     ↓
┌─────────────────────┐
│  Gin Router         │
│  • CORS Middleware  │
│  • Route Matching   │
└──────────┬──────────┘
           │
           ↓
    ┌──────────────┐
    │ Auth Check?  │──── No ────→ Public Routes (login/signup)
    └──────┬───────┘
           │ Yes
           ↓
┌─────────────────────────┐
│  JWT Middleware         │
│  • Extract Token        │
│  • Verify Signature     │
│  • Parse Claims         │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│  Handler Function       │
│  • Validate Request     │
│  • Call Service Layer   │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│  Service Layer          │
│  • Business Logic       │
│  • Rule Evaluation      │
│  • Cache Operations     │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│  Repository Layer       │
│  • MongoDB Operations   │
│  • CRUD Operations      │
└──────────┬──────────────┘
           │
           ↓
     JSON Response
```

---

## 📁 Project Structure

```
backend/
│
├── cmd/
│   └── api/
│       └── main.go                 # Application entry point
│
├── internal/                       # Private application code
│   ├── alerts/                     # Alert management module
│   │   ├── handler.go              # HTTP handlers for alert endpoints
│   │   ├── service.go              # Alert business logic
│   │   └── repository.go           # MongoDB operations for alerts
│   │
│   ├── auth/                       # Authentication module
│   │   ├── handler.go              # Auth endpoints (login/signup/refresh)
│   │   ├── service.go              # JWT generation, password hashing
│   │   ├── repository.go           # User CRUD with unique email index
│   │   └── middleware.go           # JWT verification middleware
│   │
│   ├── dashboard/                  # Dashboard analytics module
│   │   ├── handler.go              # Dashboard API endpoints
│   │   ├── service.go              # Stats aggregation with caching
│   │   └── repository.go           # MongoDB aggregation pipelines
│   │
│   ├── rules/                      # Rule engine module
│   │   ├── engine.go               # Core rule evaluation logic
│   │   └── handler.go              # Rule management endpoints
│   │
│   └── models/                     # Data models
│       ├── alert.go                # Alert struct and status constants
│       └── user.go                 # User authentication model
│
├── pkg/                            # Public reusable packages
│   ├── cache/                      # Redis caching implementation
│   │   └── cache.go                # Cache operations with TLS support
│   │
│   └── db/                         # Database connectivity
│       └── mongo.go                # MongoDB connection setup
│
├── config/                         # Configuration files
│   └── rules.json                  # Rule definitions (auto-close, escalation)
│
├── Dockerfile                      # Multi-stage production build
├── docker-compose.yml              # Local development setup
├── go.mod                          # Go dependencies
├── go.sum                          # Dependency checksums
├── .env.example                    # Environment variable template
└── README.md                       # This file

```

---

## 🛠️ Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Go** | Backend language | 1.22+ |
| **Gin** | HTTP web framework | Latest |
| **MongoDB** | Primary database | Atlas Cloud |
| **Redis** | Caching layer | Upstash (TLS) |
| **JWT** | Authentication | golang-jwt/jwt/v5 |
| **Bcrypt** | Password hashing | golang.org/x/crypto |
| **Docker** | Containerization | Multi-stage |
| **Cloud Run** | Deployment platform | Google Cloud |

---

## 📡 API Documentation

### Base URL
```
Production: https://alert-escalation-resolution-system-backend-387860847580.asia-south1.run.app
Local: http://localhost:8080
```

### API Endpoints

#### 🔐 Authentication Endpoints

##### 1. **POST /api/auth/signup**
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `name`: Required, string
- `email`: Required, valid email format, unique in database
- `password`: Required, minimum 8 characters

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "User created successfully"
}
```

**Error Responses:**
- **400 Bad Request**: Invalid input format
- **409 Conflict**: Email already exists
- **500 Internal Server Error**: Server-side error

**Workflow:**
1. Handler validates input using Gin binding
2. Service checks if email already exists in database
3. Service hashes password using bcrypt (cost factor 10)
4. Repository creates user with unique email index
5. Service generates JWT token (24-hour expiry)
6. Token returned to client for subsequent requests

---

##### 2. **POST /api/auth/login**
Authenticate existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

**Error Responses:**
- **400 Bad Request**: Missing or invalid fields
- **401 Unauthorized**: User not found or invalid password
- **500 Internal Server Error**: Server error

**Workflow:**
1. Handler validates email and password presence
2. Service fetches user by email from MongoDB
3. Service compares hashed password using bcrypt
4. Service generates new JWT token on success
5. Token returned for authenticated requests

---

##### 3. **GET /api/auth/me** 🔒
Get current authenticated user information.

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Workflow:**
1. JWT middleware extracts token from Authorization header
2. Middleware verifies token signature and expiry
3. Email extracted from token claims
4. Service fetches user details from MongoDB
5. User data returned (password excluded)

---

##### 4. **POST /api/auth/refresh** 🔒
Refresh JWT token for extended session.

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token refreshed successfully"
}
```

---

#### 🚨 Alert Endpoints

##### 5. **POST /api/alerts**
Ingest a new alert into the system.

**Request Body:**
```json
{
  "driverId": "DRV123",
  "sourceType": "Overspeeding",
  "severity": "High",
  "metadata": {
    "speed": 120,
    "speedLimit": 80,
    "location": "Highway 1",
    "driverId": "DRV123"
  }
}
```

**Success Response (201):**
```json
{
  "alertId": "ALT-a1b2c3d4",
  "status": "success"
}
```

**Alert Processing Workflow:**
```
Alert Received
     │
     ↓
Generate AlertID (ALT-{UUID})
     │
     ↓
Set Initial Status = "OPEN"
     │
     ↓
Add History Entry (Alert Created)
     │
     ↓
┌──────────────────┐
│ Auto-Close Check │
└────────┬─────────┘
         │
    ┌────┴────┐
    │ Match?  │──── YES ──→ Status = AUTO-CLOSED
    └────┬────┘              Add History Entry
         │ NO                Save to MongoDB
         ↓                   Invalidate Cache
┌────────────────────┐       Return AlertID
│ Escalation Check   │
└────────┬───────────┘
         │
    ┌────┴─────────────────┐
    │ Count Recent Alerts  │
    │ (Same Driver & Type) │
    └────────┬─────────────┘
             │
        ┌────┴────┐
        │ Count ≥ │
        │ Thresh? │──── YES ──→ Status = ESCALATED
        └────┬────┘              Severity = Target
             │ NO                Add History Entry
             ↓
     Save to MongoDB
     Invalidate Dashboard Cache
     Return AlertID
```

---

##### 6. **GET /api/alerts**
Retrieve all alerts.

**Success Response (200):**
```json
[
  {
    "alertId": "ALT-a1b2c3d4",
    "driverId": "DRV123",
    "sourceType": "Overspeeding",
    "severity": "Critical",
    "status": "ESCALATED",
    "timestamp": "2026-02-22T10:30:00Z",
    "metadata": { /* ... */ },
    "history": [
      {
        "state": "OPEN",
        "time": "2026-02-22T10:30:00Z",
        "note": "Alert generated by Overspeeding module"
      },
      {
        "state": "ESCALATED",
        "time": "2026-02-22T10:30:05Z",
        "note": "Auto-escalated by Rule Engine"
      }
    ]
  }
]
```

---

##### 7. **GET /api/alerts/:alertId**
Retrieve specific alert by ID.

**Example:**
```
GET /api/alerts/ALT-a1b2c3d4
```

**Success Response (200):**
```json
{
  "alertId": "ALT-a1b2c3d4",
  "driverId": "DRV123",
  "sourceType": "Overspeeding",
  "severity": "Critical",
  "status": "ESCALATED",
  "timestamp": "2026-02-22T10:30:00Z",
  "metadata": { /* ... */ },
  "history": [ /* ... */ ]
}
```

**Error Response (404):**
```json
{
  "error": "Alert not found"
}
```

---

##### 8. **PATCH /api/alerts/:alertId/resolve** 🔒
Mark an alert as resolved (requires authentication).

**Example:**
```
PATCH /api/alerts/ALT-a1b2c3d4/resolve
```

**Success Response (200):**
```json
{
  "id": "ALT-a1b2c3d4",
  "status": "RESOLVED",
  "message": "Alert resolved successfully"
}
```

**Workflow:**
1. Extract alertId from URL parameter
2. Update alert status to "RESOLVED" in MongoDB
3. Add history entry with current timestamp
4. Invalidate dashboard cache (stats changed)
5. Return success confirmation

---

#### 📊 Dashboard Endpoints

##### 9. **GET /api/dashboard/stats** 🔒
Get aggregated alert statistics.

**Success Response (200):**
```json
{
  "total": 1250,
  "open": 45,
  "escalated": 12,
  "autoClosed": 890,
  "resolved": 303
}
```

**Caching Strategy:**
- Cache Key: `dashboard:stats`
- TTL: 5 minutes
- Cache invalidated on: Alert creation, Alert resolution

**Workflow:**
1. Check Redis cache for `dashboard:stats` key
2. If cache hit, deserialize and return JSON
3. If cache miss, execute MongoDB aggregation:
   ```javascript
   db.alerts.aggregate([
     {
       $group: {
         _id: "$status",
         count: { $sum: 1 }
       }
     }
   ])
   ```
4. Transform aggregation results to stats object
5. Store in Redis with 5-minute TTL
6. Return stats to client

---

##### 10. **GET /api/dashboard/top-offenders** 🔒
Get drivers with most alerts.

**Query Parameters:**
- `limit` (optional): Number of results (default: 5)

**Success Response (200):**
```json
[
  {
    "driverId": "DRV123",
    "count": 25,
    "severity": "Critical"
  },
  {
    "driverId": "DRV456",
    "count": 18,
    "severity": "High"
  }
]
```

**Caching:**
- Cache Key: `dashboard:top_offenders`
- TTL: 10 minutes

**MongoDB Aggregation:**
```javascript
db.alerts.aggregate([
  {
    $match: { driverId: { $exists: true, $ne: "" } }
  },
  {
    $group: {
      _id: "$driverId",
      count: { $sum: 1 },
      maxSeverity: { $max: "$severity" }
    }
  },
  {
    $sort: { count: -1 }
  },
  {
    $limit: 5
  }
])
```

---

##### 11. **GET /api/dashboard/recent-events** 🔒
Get recent alert events with history.

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)

**Success Response (200):**
```json
[
  {
    "alertId": "ALT-a1b2c3d4",
    "sourceType": "Overspeeding",
    "status": "ESCALATED",
    "timestamp": "2026-02-22T10:30:00Z",
    "history": [
      {
        "state": "OPEN",
        "time": "2026-02-22T10:30:00Z",
        "note": "Alert generated"
      }
    ]
  }
]
```

**Caching:**
- Cache Key: `dashboard:recent_events`
- TTL: 2 minutes

---

#### ⚙️ Rules Management Endpoints

##### 12. **GET /api/rules** 🔒
Get all configured rules.

**Success Response (200):**
```json
{
  "overspeeding": {
    "escalate_if_count": 3,
    "window_mins": 60,
    "target_severity": "Critical"
  },
  "negative feedback": {
    "escalate_if_count": 2,
    "window_mins": 1440,
    "target_severity": "Warning"
  },
  "compliance": {
    "auto_close_if": "document_valid"
  }
}
```

**Note:** All rule keys are normalized to lowercase for case-insensitive matching.

---

##### 13. **PUT /api/rules/:sourceType** 🔒
Update or create a rule for specific source type.

**Example:**
```
PUT /api/rules/overspeeding
```

**Request Body:**
```json
{
  "escalate_if_count": 5,
  "window_mins": 120,
  "target_severity": "Critical"
}
```

**Success Response (200):**
```json
{
  "message": "Rule for 'overspeeding' updated successfully"
}
```

**Workflow:**
1. Normalize sourceType to lowercase
2. Update in-memory rule configuration
3. Persist changes to `config/rules.json` file
4. Return success confirmation

---

##### 14. **DELETE /api/rules/:sourceType** 🔒
Remove a rule configuration.

**Example:**
```
DELETE /api/rules/overspeeding
```

**Success Response (200):**
```json
{
  "message": "Rule for 'overspeeding' deleted successfully"
}
```

---

##### 15. **GET /api/health**
Health check endpoint (public).

**Success Response (200):**
```json
{
  "status": "AERS System Operational",
  "database": "Connected",
  "redis": "Connected",
  "uptime": "5h32m15s"
}
```

**Status Values:**
- `database`: "Connected" or "Disconnected"
- `redis`: "Connected", "Disconnected", or "Not Configured"

**Used For:**
- Cloud Run health checks
- Monitoring and alerting
- Startup validation

---

## 🔐 Authentication Flow

### JWT Token Structure

**Token Claims:**
```json
{
  "email": "john@example.com",
  "iss": "aers-backend",
  "aud": "aers-frontend",
  "sub": "john@example.com",
  "iat": 1708617600,
  "exp": 1708704000
}
```

**Token Lifecycle:**
1. **Generation** (Signup/Login):
   ```go
   token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
       "email": email,
       "iss":   "aers-backend",
       "aud":   "aers-frontend",
       "sub":   email,
       "iat":   now.Unix(),
       "exp":   now.Add(time.Hour * 24).Unix(), // 24-hour expiry
   })
   signedToken, _ := token.SignedString([]byte(jwtSecret))
   ```

2. **Storage** (Client):
   - Token stored in `localStorage` on frontend
   - Attached to requests via `Authorization: Bearer <token>` header

3. **Verification** (Middleware):
   ```go
   func AuthMiddleware() gin.HandlerFunc {
       return func(c *gin.Context) {
           // 1. Extract token from Authorization header
           tokenString := strings.Replace(
               c.GetHeader("Authorization"),
               "Bearer ", "", 1
           )
           
           // 2. Parse and validate token
           token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
               // Verify signing method
               if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                   return nil, fmt.Errorf("unexpected signing method")
               }
               return []byte(jwtSecret), nil
           })
           
           // 3. Check validity and expiry
           if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
               // 4. Extract email from claims
               email := claims["email"].(string)
               
               // 5. Store in Gin context for handlers
               c.Set("email", email)
               c.Next()
           } else {
               c.JSON(401, gin.H{"error": "Invalid or expired token"})
               c.Abort()
               return
           }
       }
   }
   ```

4. **Refresh** (Optional):
   - Client can request token refresh before expiry
   - New token generated with extended expiry
   - Old token becomes invalid

### Password Security

**Hashing Algorithm:** bcrypt with cost factor 10

**Signup Password Hashing:**
```go
hashedPassword, err := bcrypt.GenerateFromPassword(
    []byte(password),
    bcrypt.DefaultCost, // Cost factor: 10
)
```

**Login Password Verification:**
```go
err := bcrypt.CompareHashAndPassword(
    []byte(user.Password), // Stored hash
    []byte(password),      // Provided password
)
```

**Security Features:**
- Automatic salt generation per password
- Computationally expensive (prevents brute force)
- One-way encryption (cannot be reversed)

### Email Uniqueness Protection

**Database-Level Constraint:**
```go
// Repository initialization creates unique index
indexModel := mongo.IndexModel{
    Keys:    bson.D{{Key: "email", Value: 1}},
    Options: options.Index().SetUnique(true),
}
collection.Indexes().CreateOne(ctx, indexModel)
```

**Application-Level Check:**
```go
// Service layer checks before insertion
existingUser, _ := s.repo.GetUserByEmail(ctx, email)
if existingUser != nil {
    return "", errors.New("user already exists")
}
```

**Duplicate Key Error Handling:**
```go
err := s.repo.CreateUser(ctx, user)
if mongo.IsDuplicateKeyError(err) {
    return "", errors.New("user with this email already exists")
}
```

---

## 🎯 Alert Processing Workflow

### Complete Alert Lifecycle

```
INGESTION
    │
    ↓
┌─────────────────────────────┐
│ Generate Unique Alert ID    │
│ Format: ALT-{UUID[0:8]}     │
└──────────┬──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│ Set Initial Values          │
│ • Status = "OPEN"           │
│ • Timestamp = Now()         │
│ • Add Creation History      │
└──────────┬──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│ AUTO-CLOSE EVALUATION       │
│ Check if metadata matches   │
│ auto_close_if condition     │
└──────────┬──────────────────┘
           │
      ┌────┴────┐
      │ Match?  │
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
   YES            NO
    │             │
    ↓             ↓
┌─────────┐  ┌────────────────────────┐
│ AUTO-   │  │ ESCALATION EVALUATION  │
│ CLOSE   │  │ Query recent alerts by │
│         │  │ driver + source type   │
│ Add     │  └──────────┬─────────────┘
│ History │             │
└─────────┘        ┌────┴────┐
    │              │ Count ≥ │
    │              │ Thresh? │
    │              └────┬────┘
    │                   │
    │            ┌──────┴──────┐
    │            │             │
    │           YES            NO
    │            │             │
    │            ↓             │
    │       ┌─────────┐        │
    │       │ESCALATE │        │
    │       │         │        │
    │       │ Update  │        │
    │       │ Severity│        │
    │       │         │        │
    │       │ Add     │        │
    │       │ History │        │
    │       └─────────┘        │
    │            │             │
    └────────────┴─────────────┘
                 │
                 ↓
        ┌────────────────┐
        │ Save to MongoDB│
        └────────┬───────┘
                 │
                 ↓
        ┌────────────────┐
        │ Invalidate Cache│
        └────────┬───────┘
                 │
                 ↓
         Return AlertID
```

### Detailed Processing Steps

#### Step 1: Alert ID Generation
```go
alert.AlertID = "ALT-" + uuid.New().String()[:8]
// Example: ALT-a1b2c3d4
```
- Generates unique identifier using UUID
- Truncated to 8 characters for readability
- Prefixed with "ALT-" for easy identification

#### Step 2: Status Initialization
```go
alert.Status = models.StatusOpen
alert.Timestamp = time.Now()
alert.History = []models.HistoryEntry{
    {
        State: models.StatusOpen,
        Time:  alert.Timestamp,
        Note:  "Alert generated by " + alert.SourceType + " module",
    },
}
```
- Sets initial status to "OPEN"
- Records creation timestamp
- Creates first history entry for tracking

#### Step 3: Auto-Close Check
```go
if s.engine.EvaluateAutoClose(&alert) {
    alert.Status = models.StatusAutoClosed
    alert.History = append(alert.History, models.HistoryEntry{
        State: models.StatusAutoClosed,
        Time:  time.Now(),
        Note:  "Auto-closed due to compliance rule",
    })
}
```
- Checks metadata against auto-close rules
- If match found, status changed to AUTO-CLOSED
- Skips escalation evaluation
- Proceeds directly to database save

#### Step 4: Escalation Evaluation (if not auto-closed)
```go
// Normalize source type for case-insensitive matching
normalizedSourceType := strings.ToLower(strings.TrimSpace(alert.SourceType))
rule, exists := s.engine.Config[normalizedSourceType]

if exists && rule.WindowMins > 0 {
    driverID := alert.Metadata["driverId"]
    if driverID != nil {
        // Calculate time window
        cutoff := time.Now().Add(-time.Duration(rule.WindowMins) * time.Minute)
        
        // Query recent alerts
        filter := bson.M{
            "sourceType":        alert.SourceType,
            "metadata.driverId": driverID,
            "timestamp":         bson.M{"$gte": cutoff},
        }
        
        recentCount, _ := s.repo.collection.CountDocuments(ctx, filter)
        
        // Evaluate escalation
        s.engine.EvaluateEscalation(&alert, int(recentCount)+1)
        
        if alert.Status == models.StatusEscalated {
            alert.History = append(alert.History, models.HistoryEntry{
                State: models.StatusEscalated,
                Time:  time.Now(),
                Note:  "Auto-escalated by Rule Engine",
            })
        }
    }
}
```

**Escalation Logic Breakdown:**
1. **Rule Lookup**: Find rule for alert's source type
2. **Time Window**: Calculate cutoff time (e.g., last 60 minutes)
3. **Query**: Count alerts from same driver/type within window
4. **Threshold Check**: Compare count with `escalate_if_count`
5. **Escalate**: If threshold exceeded, update status and severity
6. **History**: Add escalation entry with timestamp

#### Step 5: Database Persistence
```go
err := s.repo.Create(ctx, &alert)
if err == nil {
    s.invalidateDashboardCache(ctx)
}
return alert.AlertID, err
```
- Saves alert to MongoDB `alerts` collection
- Invalidates dashboard cache (stats changed)
- Returns generated alert ID

#### Step 6: Cache Invalidation
```go
func (s *AlertService) invalidateDashboardCache(ctx context.Context) {
    if s.cache != nil {
        s.cache.Delete(ctx, "dashboard:stats")
        s.cache.Delete(ctx, "dashboard:top_offenders")
        s.cache.Delete(ctx, "dashboard:recent_events")
    }
}
```
- Deletes cached dashboard data
- Next dashboard request will recompute stats
- Ensures real-time accuracy

---

## ⚙️ Rule Engine

### Rule Configuration Structure

**File Location:** `config/rules.json`

**Rule Schema:**
```json
{
  "sourceType": {
    "escalate_if_count": <integer>,    // Threshold for escalation
    "window_mins": <integer>,          // Time window in minutes
    "target_severity": "<string>",     // Severity after escalation
    "auto_close_if": "<string>"        // Condition for auto-close
  }
}
```

### Example Rules Configuration

```json
{
  "Overspeeding": {
    "escalate_if_count": 3,
    "window_mins": 60,
    "target_severity": "Critical"
  },
  "Negative Feedback": {
    "escalate_if_count": 2,
    "window_mins": 1440,
    "target_severity": "Warning"
  },
  "Compliance": {
    "auto_close_if": "document_valid"
  }
}
```

### Rule Loading Process

```go
func (e *Engine) LoadRules(filePath string) error {
    // 1. Read rules.json file
    file, err := os.ReadFile(filePath)
    if err != nil {
        return err
    }
    
    // 2. Parse JSON into temporary config
    tempConfig := make(map[string]RuleConfig)
    if err := json.Unmarshal(file, &tempConfig); err != nil {
        return err
    }
    
    // 3. Normalize keys to lowercase for case-insensitive matching
    for key, value := range tempConfig {
        normalizedKey := strings.ToLower(strings.TrimSpace(key))
        e.Config[normalizedKey] = value
    }
    
    return nil
}
```

**Normalization Benefits:**
- **Case-Insensitive Matching**: "Overspeeding", "overspeeding", "OVERSPEEDING" all match
- **Whitespace Tolerance**: "  Compliance  " matches "compliance"
- **Consistency**: Frontend and backend use consistent keys

### Rule Persistence

```go
func (e *Engine) SaveRules(filePath string) error {
    // Serialize config to JSON with indentation
    data, err := json.MarshalIndent(e.Config, "", "  ")
    if err != nil {
        return err
    }
    
    // Write to file with read/write permissions
    return os.WriteFile(filePath, data, 0644)
}
```

**Triggered By:**
- PUT `/api/rules/:sourceType` (update/create rule)
- DELETE `/api/rules/:sourceType` (remove rule)

**Persistence Flow:**
1. Rule updated in-memory
2. Changes written to `rules.json`
3. File persisted to disk
4. New container builds include updated rules

---

## 🔄 Auto-Close Mechanism

### Purpose
Automatically close alerts that meet compliance conditions, reducing manual intervention for non-critical events.

### Auto-Close Evaluation Logic

```go
func (e *Engine) EvaluateAutoClose(alert *models.Alert) bool {
    // 1. Normalize source type
    normalizedSourceType := strings.ToLower(strings.TrimSpace(alert.SourceType))
    
    // 2. Lookup rule for this source type
    rule, exists := e.Config[normalizedSourceType]
    if !exists || rule.AutoCloseIf == "" {
        return false // No auto-close rule configured
    }
    
    // 3. Check multiple metadata field variations
    // Variation 1: documentStatus
    if docStatus, ok := alert.Metadata["documentStatus"].(string); ok {
        if docStatus == rule.AutoCloseIf {
            return true
        }
    }
    
    // Variation 2: document_status (snake_case)
    if docStatus, ok := alert.Metadata["document_status"].(string); ok {
        if docStatus == rule.AutoCloseIf {
            return true
        }
    }
    
    // Variation 3: status (generic)
    if status, ok := alert.Metadata["status"].(string); ok {
        if status == rule.AutoCloseIf {
            return true
        }
    }
    
    return false // No match found
}
```

### Auto-Close Workflow Example

**Scenario:** Compliance document alert

**Rule Configuration:**
```json
{
  "compliance": {
    "auto_close_if": "document_valid"
  }
}
```

**Incoming Alert:**
```json
{
  "sourceType": "Compliance",
  "metadata": {
    "documentStatus": "document_valid",
    "driverId": "DRV123",
    "documentType": "License"
  }
}
```

**Processing Steps:**
1. Alert ingested with sourceType "Compliance"
2. Normalized to "compliance"
3. Rule lookup finds `auto_close_if: "document_valid"`
4. Metadata check: `documentStatus` == "document_valid" ✅
5. **Auto-Close Triggered**:
   - Status set to "AUTO-CLOSED"
   - History entry added: "Auto-closed due to compliance rule"
   - Escalation evaluation skipped
6. Alert saved to database

**Result:**
- Alert closed automatically
- No manual intervention required
- Reduces alert fatigue
- History preserved for audit trail

### Auto-Close vs. Escalation Priority

**Critical: Auto-close is evaluated BEFORE escalation**

```go
if s.engine.EvaluateAutoClose(&alert) {
    // Auto-closed → Skip escalation
    alert.Status = models.StatusAutoClosed
} else {
    // Not auto-closed → Proceed with escalation check
    s.engine.EvaluateEscalation(&alert, recentCount)
}
```

**Why This Order?**
- Compliant alerts don't need escalation
- Saves database queries (no need to check recent alerts)
- Faster processing for compliant events
- Reduces noise in escalated alerts

---

## 📈 Escalation Logic

### Purpose
Automatically escalate alerts when a driver exhibits repeated violations within a time window, allowing proactive intervention.

### Escalation Evaluation Function

```go
func (e *Engine) EvaluateEscalation(alert *models.Alert, recentCount int) {
    // 1. Normalize source type for case-insensitive lookup
    normalizedSourceType := strings.ToLower(strings.TrimSpace(alert.SourceType))
    
    // 2. Find rule for this alert type
    rule, exists := e.Config[normalizedSourceType]
    if !exists || rule.EscalateIfCount == 0 {
        return // No escalation rule configured
    }
    
    // 3. Compare recent count with threshold
    if recentCount >= rule.EscalateIfCount {
        alert.Status = models.StatusEscalated
        alert.Severity = rule.TargetSeverity
    }
}
```

### Escalation Workflow Example

**Scenario:** Overspeeding violations

**Rule Configuration:**
```json
{
  "overspeeding": {
    "escalate_if_count": 3,
    "window_mins": 60,
    "target_severity": "Critical"
  }
}
```

**Timeline of Events:**

| Time | Event | Count | Action |
|------|-------|-------|--------|
| 10:00 AM | Overspeeding alert (DRV123) | 1 | Status: OPEN |
| 10:15 AM | Overspeeding alert (DRV123) | 2 | Status: OPEN |
| 10:30 AM | Overspeeding alert (DRV123) | 3 | **Status: ESCALATED** (Threshold reached) |
| 10:45 AM | Overspeeding alert (DRV123) | 4 | Status: ESCALATED (Already escalated) |
| 11:05 AM | Overspeeding alert (DRV123) | 2 | Status: OPEN (10:00 alert expired from window) |

**Detailed Processing (10:30 AM Alert):**

1. **Alert Received:**
   ```json
   {
     "driverId": "DRV123",
     "sourceType": "Overspeeding",
     "severity": "High",
     "metadata": {
       "speed": 120,
       "driverId": "DRV123"
     }
   }
   ```

2. **Rule Lookup:**
   - Normalized sourceType: "overspeeding"
   - Rule found: `escalate_if_count=3, window_mins=60`

3. **Time Window Calculation:**
   ```go
   cutoff := time.Now().Add(-time.Duration(60) * time.Minute)
   // cutoff = 09:30 AM
   ```

4. **Recent Alerts Query:**
   ```javascript
   db.alerts.find({
     "sourceType": "Overspeeding",
     "metadata.driverId": "DRV123",
     "timestamp": { "$gte": ISODate("2026-02-22T09:30:00Z") }
   }).count()
   // Returns: 2 (alerts at 10:00 AM and 10:15 AM)
   ```

5. **Count Calculation:**
   ```go
   recentCount = 2      // Existing alerts
   currentCount = 3     // Including current alert
   ```

6. **Threshold Check:**
   ```go
   if currentCount >= 3 {  // 3 >= 3 ✅
       alert.Status = "ESCALATED"
       alert.Severity = "Critical"
   }
   ```

7. **History Update:**
   ```go
   alert.History = append(alert.History, models.HistoryEntry{
       State: models.StatusEscalated,
       Time:  time.Now(),
       Note:  "Auto-escalated by Rule Engine",
   })
   ```

8. **Final Alert State:**
   ```json
   {
     "alertId": "ALT-xyz789",
     "driverId": "DRV123",
     "sourceType": "Overspeeding",
     "severity": "Critical",        // Updated from "High"
     "status": "ESCALATED",          // Updated from "OPEN"
     "timestamp": "2026-02-22T10:30:00Z",
     "history": [
       {
         "state": "OPEN",
         "time": "2026-02-22T10:30:00Z",
         "note": "Alert generated by Overspeeding module"
       },
       {
         "state": "ESCALATED",
         "time": "2026-02-22T10:30:05Z",
         "note": "Auto-escalated by Rule Engine"
       }
     ]
   }
   ```

### Multiple Source Types

Each source type has independent escalation tracking:

**Configuration:**
```json
{
  "overspeeding": {
    "escalate_if_count": 3,
    "window_mins": 60,
    "target_severity": "Critical"
  },
  "negative feedback": {
    "escalate_if_count": 2,
    "window_mins": 1440,
    "target_severity": "Warning"
  }
}
```

**Scenario:**
- Driver DRV123 has 2 overspeeding alerts (10:00 AM, 10:15 AM)
- Driver DRV123 has 2 negative feedback alerts (09:00 AM, 11:00 AM)
- New overspeeding alert at 10:30 AM

**Result:**
- Overspeeding: 3 alerts in 60 mins → **ESCALATED** ✅
- Negative Feedback: 2 alerts in 1440 mins → **ESCALATED** ✅
- Each type tracked separately

### Escalation Benefits

1. **Proactive Intervention**: Identify problematic patterns before they become serious
2. **Automatic Prioritization**: Critical issues flagged immediately
3. **Pattern Detection**: Frequency-based analysis reveals habitual violations
4. **Configurable Thresholds**: Different rules for different violation types
5. **Historical Context**: Recent count includes time-windowed analysis

---

## 📊 Dashboard & Caching

### Caching Strategy

**Why Caching?**
- Dashboard aggregations are computationally expensive
- Stats don't change on every request
- Reduce MongoDB query load
- Improve response times (10x faster with cache hit)

### Cache Implementation

**Technology:** Redis (Upstash with TLS)

**Cache Structure:**
```go
type Cache struct {
    client *redis.Client
}

func NewCache(addr, password string, useTLS bool) (*Cache, error) {
    options := &redis.Options{
        Addr:     addr,
        Password: password,
        DB:       0,
    }
    
    if useTLS {
        options.TLSConfig = &tls.Config{
            MinVersion: tls.VersionTLS12,
        }
    }
    
    client := redis.NewClient(options)
    
    // Test connection
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    if err := client.Ping(ctx).Err(); err != nil {
        return nil, err
    }
    
    return &Cache{client: client}, nil
}
```

### Cache Operations

#### Set with TTL
```go
func (c *Cache) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
    return c.client.Set(ctx, key, value, ttl).Err()
}
```

#### Get
```go
func (c *Cache) Get(ctx context.Context, key string) (string, error) {
    return c.client.Get(ctx, key).Result()
}
```

#### Delete (Cache Invalidation)
```go
func (c *Cache) Delete(ctx context.Context, key string) error {
    return c.client.Del(ctx, key).Err()
}
```

### Dashboard Stats Caching

**Endpoint:** `GET /api/dashboard/stats`

**Cache Flow:**
```go
func (s *Service) GetDashboardStats(ctx context.Context) (map[string]int64, error) {
    cacheKey := "dashboard:stats"
    
    // 1. Try cache first
    if s.cache != nil {
        if val, err := s.cache.Get(ctx, cacheKey); err == nil {
            var stats map[string]int64
            if err := json.Unmarshal([]byte(val), &stats); err == nil {
                return stats, nil // Cache hit 🎯
            }
        }
    }
    
    // 2. Cache miss - query MongoDB
    stats, err := s.repo.GetStats(ctx)
    if err != nil {
        return nil, err
    }
    
    // 3. Store in cache with TTL
    if s.cache != nil {
        if data, err := json.Marshal(stats); err == nil {
            s.cache.Set(ctx, cacheKey, data, 5*time.Minute)
        }
    }
    
    return stats, nil
}
```

**MongoDB Aggregation (Cache Miss):**
```go
func (r *Repository) GetStats(ctx context.Context) (map[string]int64, error) {
    pipeline := mongo.Pipeline{
        {{Key: "$group", Value: bson.D{
            {Key: "_id", Value: "$status"},
            {Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
        }}},
    }
    
    cursor, err := r.collection.Aggregate(ctx, pipeline)
    if err != nil {
        return nil, err
    }
    defer cursor.Close(ctx)
    
    stats := map[string]int64{
        "total":      0,
        "open":       0,
        "escalated":  0,
        "autoClosed": 0,
        "resolved":   0,
    }
    
    for cursor.Next(ctx) {
        var result struct {
            ID    string `bson:"_id"`
            Count int64  `bson:"count"`
        }
        if err := cursor.Decode(&result); err == nil {
            stats["total"] += result.Count
            
            switch result.ID {
            case "OPEN":
                stats["open"] = result.Count
            case "ESCALATED":
                stats["escalated"] = result.Count
            case "AUTO-CLOSED":
                stats["autoClosed"] = result.Count
            case "RESOLVED":
                stats["resolved"] = result.Count
            }
        }
    }
    
    return stats, nil
}
```

### Cache Invalidation Strategy

**When to Invalidate:**
1. **Alert Creation**: New alert changes stats
2. **Alert Resolution**: Status change affects stats
3. **Alert Update**: Any alert modification

**Invalidation Function:**
```go
func (s *AlertService) invalidateDashboardCache(ctx context.Context) {
    if s.cache != nil {
        s.cache.Delete(ctx, "dashboard:stats")
        s.cache.Delete(ctx, "dashboard:top_offenders")
        s.cache.Delete(ctx, "dashboard:recent_events")
    }
}
```

**Called From:**
- `IngestAlert()` - After saving new alert
- `ResolveAlert()` - After status update

### Cache TTL Configuration

| Cache Key | TTL | Reason |
|-----------|-----|--------|
| `dashboard:stats` | 5 minutes | Stats change frequently with new alerts |
| `dashboard:top_offenders` | 10 minutes | Offender rankings change slowly |
| `dashboard:recent_events` | 2 minutes | Recent events need near real-time accuracy |

### Performance Impact

**Without Cache:**
- MongoDB aggregation: ~150-300ms
- Network latency: ~50ms
- **Total: ~200-350ms**

**With Cache:**
- Redis lookup: ~5-10ms
- Network latency: ~20ms
- **Total: ~25-30ms**

**Improvement: 10x faster** ⚡

---

## 🗄️ Database Schema

### MongoDB Collections

#### 1. **users** Collection

**Purpose:** Store user authentication credentials

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,        // Unique index
  password: String,     // Bcrypt hashed
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
```

**Constraints:**
- Email must be unique (enforced at DB level)
- Password must be bcrypt hashed
- Minimum password length: 8 characters (validated at API level)

**Sample Document:**
```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7g8h9i0j1"),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "createdAt": ISODate("2026-02-20T10:00:00Z"),
  "updatedAt": ISODate("2026-02-20T10:00:00Z")
}
```

---

#### 2. **alerts** Collection

**Purpose:** Store all alert records with history

**Schema:**
```javascript
{
  _id: ObjectId,
  alertId: String,                    // Unique identifier: ALT-{UUID[0:8]}
  driverId: String,                   // Optional
  sourceType: String,                 // Alert category
  severity: String,                   // High, Critical, Warning, etc.
  status: String,                     // OPEN, ESCALATED, AUTO-CLOSED, RESOLVED
  timestamp: ISODate,                 // Alert creation time
  metadata: Object,                   // Flexible key-value data
  history: [                          // State change audit trail
    {
      state: String,                  // Status at this point
      time: ISODate,                  // When change occurred
      note: String                    // Description of change
    }
  ]
}
```

**Indexes:**
```javascript
// Query optimization for escalation checks
db.alerts.createIndex({ 
  sourceType: 1, 
  "metadata.driverId": 1, 
  timestamp: -1 
})

// Query optimization for alert lookup
db.alerts.createIndex({ alertId: 1 }, { unique: true })

// Query optimization for dashboard
db.alerts.createIndex({ status: 1 })
db.alerts.createIndex({ timestamp: -1 })
```

**Sample Document:**
```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7g8h9i0j2"),
  "alertId": "ALT-a1b2c3d4",
  "driverId": "DRV123",
  "sourceType": "Overspeeding",
  "severity": "Critical",
  "status": "ESCALATED",
  "timestamp": ISODate("2026-02-22T10:30:00Z"),
  "metadata": {
    "speed": 120,
    "speedLimit": 80,
    "location": "Highway 1",
    "driverId": "DRV123",
    "vehicleId": "VEH456"
  },
  "history": [
    {
      "state": "OPEN",
      "time": ISODate("2026-02-22T10:30:00Z"),
      "note": "Alert generated by Overspeeding module"
    },
    {
      "state": "ESCALATED",
      "time": ISODate("2026-02-22T10:30:05Z"),
      "note": "Auto-escalated by Rule Engine"
    }
  ]
}
```

**Status Values:**
- `OPEN`: Newly created alert
- `ESCALATED`: Threshold exceeded, severity increased
- `AUTO-CLOSED`: Automatically closed by rule engine
- `RESOLVED`: Manually resolved by user

**Metadata Flexibility:**
- No fixed schema for metadata
- Allows different fields per source type
- Rule engine checks multiple field variations
- Examples:
  - Overspeeding: `speed`, `speedLimit`, `location`
  - Compliance: `documentStatus`, `documentType`, `expiryDate`
  - Negative Feedback: `rating`, `comment`, `customerId`

---

### MongoDB Queries Used

#### Alert Ingestion Queries

**1. Count Recent Alerts (Escalation Check):**
```javascript
db.alerts.countDocuments({
  "sourceType": "Overspeeding",
  "metadata.driverId": "DRV123",
  "timestamp": { "$gte": ISODate("2026-02-22T09:30:00Z") }
})
```

**2. Insert New Alert:**
```javascript
db.alerts.insertOne({
  "alertId": "ALT-a1b2c3d4",
  "driverId": "DRV123",
  "sourceType": "Overspeeding",
  "severity": "High",
  "status": "OPEN",
  "timestamp": ISODate("2026-02-22T10:30:00Z"),
  "metadata": { /* ... */ },
  "history": [ /* ... */ ]
})
```

#### Dashboard Queries

**3. Get Alert Statistics:**
```javascript
db.alerts.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
])
```

**4. Get Top Offenders:**
```javascript
db.alerts.aggregate([
  {
    $match: { 
      driverId: { $exists: true, $ne: "" } 
    }
  },
  {
    $group: {
      _id: "$driverId",
      count: { $sum: 1 },
      maxSeverity: { $max: "$severity" }
    }
  },
  {
    $sort: { count: -1 }
  },
  {
    $limit: 5
  }
])
```

**5. Get Recent Events:**
```javascript
db.alerts.find({})
  .sort({ timestamp: -1 })
  .limit(10)
  .project({
    alertId: 1,
    sourceType: 1,
    status: 1,
    timestamp: 1,
    severity: 1,
    history: 1
  })
```

#### Alert Management Queries

**6. Get Alert by ID:**
```javascript
db.alerts.findOne({ alertId: "ALT-a1b2c3d4" })
```

**7. Update Alert Status:**
```javascript
db.alerts.updateOne(
  { alertId: "ALT-a1b2c3d4" },
  {
    $set: { status: "RESOLVED" },
    $push: {
      history: {
        state: "RESOLVED",
        time: ISODate("2026-02-22T11:00:00Z"),
        note: "Manually resolved by user"
      }
    }
  }
)
```

**8. Get All Alerts:**
```javascript
db.alerts.find({})
  .sort({ timestamp: -1 })
```

---

### Redis Cache Structure

**Key Patterns:**
```
dashboard:stats              → JSON: { "total": 1250, "open": 45, ... }
dashboard:top_offenders      → JSON: [ { "driverId": "DRV123", "count": 25 }, ... ]
dashboard:recent_events      → JSON: [ { "alertId": "ALT-xyz", ... }, ... ]
```

**Cache Values (JSON):**
```json
// dashboard:stats
{
  "total": 1250,
  "open": 45,
  "escalated": 12,
  "autoClosed": 890,
  "resolved": 303
}

// dashboard:top_offenders
[
  {
    "driverId": "DRV123",
    "count": 25,
    "severity": "Critical"
  },
  {
    "driverId": "DRV456",
    "count": 18,
    "severity": "High"
  }
]

// dashboard:recent_events
[
  {
    "alertId": "ALT-a1b2c3d4",
    "sourceType": "Overspeeding",
    "status": "ESCALATED",
    "timestamp": "2026-02-22T10:30:00Z",
    "history": [ /* ... */ ]
  }
]
```

---

## ⚙️ Configuration

### Environment Variables

**Location:** `.env` file (not checked into Git)

**Template:** `.env.example`

**Required Variables:**

```bash
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/AlertEscalationResolutionSystem?retryWrites=true&w=majority

# Upstash Redis Connection
REDIS_ADDR=your-redis-instance.upstash.io:6379
REDIS_PASSWORD=your_redis_password_here
REDIS_USE_TLS=true

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_min_32_chars

# Server Configuration (optional)
PORT=8080                     # Default port for local development
GIN_MODE=release              # release|debug (production uses release)
```

### Configuration Files

#### 1. **config/rules.json**

**Purpose:** Define rule engine behavior

**Structure:**
```json
{
  "sourceType1": {
    "escalate_if_count": 3,
    "window_mins": 60,
    "target_severity": "Critical"
  },
  "sourceType2": {
    "auto_close_if": "condition_value"
  }
}
```

**Editing Rules:**
- **Via API**: Use `PUT /api/rules/:sourceType` endpoint
- **Manually**: Edit file and rebuild Docker image
- **Runtime**: Changes via API persist to file

**Rule Parameters:**
- `escalate_if_count`: Number of alerts to trigger escalation
- `window_mins`: Time window for counting alerts
- `target_severity`: Severity level after escalation
- `auto_close_if`: Metadata value to trigger auto-close

#### 2. **docker-compose.yml**

**Purpose:** Local development environment setup

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    env_file:
      - .env
    environment:
      - GIN_MODE=debug
    volumes:
      - ./config:/app/config
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### 3. **Dockerfile**

**Purpose:** Production containerization

```dockerfile
# Build stage
FROM golang:alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o api ./cmd/api/main.go

# Production stage
FROM alpine:latest
WORKDIR /app
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/api .
COPY --from=builder /app/config ./config

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser && \
    chown -R appuser:appuser /app
USER appuser

ENV PORT=8080
EXPOSE 8080
CMD ["./api"]
```

**Multi-stage Benefits:**
- **Smaller Image**: 91MB (vs 200MB+ with full Go image)
- **Security**: Non-root user execution
- **Performance**: Compiled binary, no runtime compilation
- **Dependencies**: Only runtime dependencies (ca-certificates)

---

## 🚀 Deployment

### Cloud Run Deployment

**Platform:** Google Cloud Run (Serverless)
**Region:** asia-south1
**Backend URL:** https://alert-escalation-resolution-system-backend-387860847580.asia-south1.run.app

#### Prerequisites
```bash
# Install Google Cloud SDK
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project aers-488210
```

#### Build and Push Image
```bash
# Build Docker image
cd backend
docker build -t priyobrotokarmakar/alert-escalation-resolution-system-backend:latest .

# Push to Docker Hub
docker push priyobrotokarmakar/alert-escalation-resolution-system-backend:latest
```

#### Deploy to Cloud Run
```bash
gcloud run deploy alert-escalation-resolution-system-backend \
  --image priyobrotokarmakar/alert-escalation-resolution-system-backend:latest \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database,REDIS_ADDR=instance.upstash.io:6379,REDIS_PASSWORD=password,REDIS_USE_TLS=true,JWT_SECRET=your_secret_key"
```

**Cloud Run Features:**
- ✅ Auto-scaling (0 to N instances)
- ✅ HTTPS enabled by default
- ✅ Health checks automatic
- ✅ Rolling deployments
- ✅ Free tier: 2M requests/month
- ✅ Pay per use (no idle costs)

#### Cloud Run Environment

**Container Settings:**
- **CPU**: 1 vCPU
- **Memory**: 512 MB
- **Max Instances**: 20
- **Concurrency**: 80 requests per instance
- **Timeout**: 300 seconds
- **Health Check**: TCP port 8080

**Startup Probe:**
```yaml
startupProbe:
  timeoutSeconds: 240
  periodSeconds: 240
  failureThreshold: 1
  tcpSocket:
    port: 8080
```

### Local Development Deployment

#### Using Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

#### Native Go Development
```bash
# Install dependencies
go mod download

# Run with hot reload (using Air)
air

# Or run directly
go run cmd/api/main.go

# Build binary
go build -o api ./cmd/api/main.go
./api
```

**Development URLs:**
- API: http://localhost:8080
- Health Check: http://localhost:8080/api/health

### CI/CD Pipeline (Optional)

**Using GitHub Actions:**

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker Image
        run: |
          docker build -t gcr.io/${{ secrets.GCP_PROJECT }}/backend:latest .
      
      - name: Push to GCR
        run: |
          echo ${{ secrets.GCP_SA_KEY }} | docker login -u _json_key --password-stdin https://gcr.io
          docker push gcr.io/${{ secrets.GCP_PROJECT }}/backend:latest
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy backend \
            --image gcr.io/${{ secrets.GCP_PROJECT }}/backend:latest \
            --region asia-south1 \
            --platform managed
```

---

## 🔧 Development Guide

### Prerequisites

**Required:**
- Go 1.22 or higher
- Docker & Docker Compose
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Git

**Optional:**
- Air (hot reload for Go)
- Postman/Insomnia (API testing)

### Setup Instructions

#### 1. Clone Repository
```bash
git clone https://github.com/PriyobrotoKarmakar/AERS-Alert-Escalation-Resolution-System.git
cd AERS-Alert-Escalation-Resolution-System/backend
```

#### 2. Install Dependencies
```bash
go mod download
```

#### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

#### 4. Create Rules Configuration
```bash
# config/rules.json already exists
# Modify as needed for your use case
```

#### 5. Run Locally
```bash
# Option 1: Using Docker Compose
docker-compose up

# Option 2: Native Go
go run cmd/api/main.go

# Option 3: Hot Reload (requires Air)
air
```

### Project Commands

```bash
# Run tests
go test ./...

# Run specific test
go test ./internal/alerts -v

# Format code
go fmt ./...

# Vet code (static analysis)
go vet ./...

# Build binary
go build -o api ./cmd/api/main.go

# Run binary
./api

# Clean build artifacts
go clean

# Update dependencies
go get -u ./...
go mod tidy
```

### Adding New Features

#### 1. Add New API Endpoint

**Step 1:** Define handler in appropriate module
```go
// internal/alerts/handler.go
func (h *Handler) HandleNewEndpoint(c *gin.Context) {
    // Implementation
    c.JSON(200, gin.H{"message": "Success"})
}
```

**Step 2:** Register route
```go
// internal/alerts/handler.go
func (h *Handler) RegisterRoutes(r *gin.Engine) {
    api := r.Group("/api/alerts")
    {
        api.GET("/new-endpoint", h.HandleNewEndpoint)
    }
}
```

**Step 3:** Test endpoint
```bash
curl http://localhost:8080/api/alerts/new-endpoint
```

#### 2. Add New Rule Type

**Step 1:** Update rule configuration
```json
{
  "newSourceType": {
    "escalate_if_count": 3,
    "window_mins": 60,
    "target_severity": "High",
    "auto_close_if": "condition_value"
  }
}
```

**Step 2:** Rules automatically loaded on startup

**Step 3:** Test with alert ingestion
```bash
curl -X POST http://localhost:8080/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "newSourceType",
    "severity": "Medium",
    "metadata": {}
  }'
```

### Debugging

**Enable Debug Mode:**
```bash
export GIN_MODE=debug
go run cmd/api/main.go
```

**View Detailed Logs:**
```bash
# Startup logs show:
# - Rule loading
# - MongoDB connection
# - Redis connection
# - JWT validation
# - Route registration
```

**Common Issues:**

1. **MongoDB Connection Failed:**
   - Check MONGODB_URI format
   - Verify network access (whitelist IP)
   - Test connection: `mongosh "mongodb+srv://..."`

2. **Redis Connection Failed:**
   - Verify REDIS_ADDR and REDIS_PASSWORD
   - Check TLS setting (Upstash requires TLS)
   - Test with redis-cli

3. **JWT Token Invalid:**
   - Ensure JWT_SECRET is set
   - Verify token hasn't expired
   - Check Authorization header format

4. **Rule Not Applied:**
   - Verify rules.json syntax
   - Check source type case matching
   - Review logs for rule loading errors

### Code Structure Best Practices

**Handler Layer:**
- Input validation using Gin binding
- HTTP status codes and responses
- Error handling and logging
- Thin layer - delegate to service

**Service Layer:**
- Business logic implementation
- Rule engine orchestration
- Cache operations
- Call multiple repositories if needed

**Repository Layer:**
- MongoDB CRUD operations
- Query optimization
- Error handling
- No business logic

**Model Layer:**
- Data structure definitions
- JSON/BSON tags
- Constants for status values
- No logic

### Testing Guidelines

**Unit Tests:**
```go
// internal/rules/engine_test.go
func TestEvaluateAutoClose(t *testing.T) {
    engine := NewEngine()
    engine.Config["compliance"] = RuleConfig{
        AutoCloseIf: "document_valid",
    }
    
    alert := &models.Alert{
        SourceType: "Compliance",
        Metadata: map[string]interface{}{
            "documentStatus": "document_valid",
        },
    }
    
    result := engine.EvaluateAutoClose(alert)
    if !result {
        t.Error("Expected auto-close to trigger")
    }
}
```

**Integration Tests:**
```go
// internal/alerts/service_test.go
func TestAlertIngestion(t *testing.T) {
    // Setup test database
    // Create service with test repo
    // Ingest test alert
    // Verify alert saved correctly
    // Verify rule evaluation
}
```

---

## 📝 API Testing Examples

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Ingest Alert:**
```bash
curl -X POST http://localhost:8080/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": "DRV123",
    "sourceType": "Overspeeding",
    "severity": "High",
    "metadata": {
      "speed": 120,
      "speedLimit": 80,
      "driverId": "DRV123"
    }
  }'
```

**Get Dashboard Stats (Authenticated):**
```bash
curl http://localhost:8080/api/dashboard/stats \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## 🤝 Contributing

**Development Workflow:**
1. Create feature branch
2. Implement changes
3. Write tests
4. Run tests and linting
5. Commit with descriptive message
6. Push and create pull request

**Code Style:**
- Follow Go conventions
- Use gofmt for formatting
- Add comments for exported functions
- Keep functions small and focused

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👤 Author

**Priyobroto Karmakar**
- GitHub: [@PriyobrotoKarmakar](https://github.com/PriyobrotoKarmakar)
- Email: karmakarpriyobroto@gmail.com

---

## 🙏 Acknowledgments

- MoveInSync for fleet management inspiration
- Go community for excellent frameworks
- MongoDB & Redis for reliable data storage
- Google Cloud Run for serverless infrastructure

---

**Last Updated:** February 22, 2026
**Version:** 1.0.0
