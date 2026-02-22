# AERS - Alert Escalation & Resolution System

> **Intelligent Fleet Alert Management with Automated Escalation & Resolution**

[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://aers-alert-escalation-resolution-sy.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Running-blue)](https://alert-escalation-resolution-system-backend-387860847580.asia-south1.run.app)
[![Tech Stack](https://img.shields.io/badge/Stack-Go%20%7C%20React%20%7C%20MongoDB-orange)]()

## 📋 Overview
<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/cdfbb9e9-0406-4786-b617-0b15228e48c9" />


AERS is a production-ready alert escalation and resolution system designed for fleet monitoring operations. It automatically processes incoming alerts from multiple sources (overspeeding, negative feedback, compliance violations), applies intelligent rule-based escalation, implements auto-closing for compliant behaviors, and provides real-time dashboards for operations teams.

**🎯 Problem Statement:** MoveInSync Intelligent Alert Escalation Case Study  
**👨‍💻 Author:** Priyobroto Karmakar  
**🔗 GitHub:** [PriyobrotoKarmakar/AERS-Alert-Escalation-Resolution-System](https://github.com/PriyobrotoKarmakar/AERS-Alert-Escalation-Resolution-System)

---

## 🚀 Live Deployments

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | [aers-alert-escalation-resolution-sy.vercel.app](https://aers-alert-escalation-resolution-sy.vercel.app) | ✅ Live |
| **Backend API** | [alert-escalation-resolution-system-backend...run.app](https://alert-escalation-resolution-system-backend-387860847580.asia-south1.run.app) | ✅ Live |

---

## ✨ Key Features

- ✅ **Real-time Alert Ingestion** with unique ID generation (`ALT-{UUID}`)
- ✅ **Rule-based Escalation** - Automated severity upgrades based on frequency patterns
- ✅ **Auto-Close Mechanism** - Intelligent closure for compliant document uploads
- ✅ **Manual Resolution** - Operations team can manually resolve critical alerts
- ✅ **Driver Drill-Down** - Complete alert history and timeline per driver
- ✅ **Dashboard Analytics** - Live statistics, trends, top offenders, recent events
- ✅ **Rule Configuration** - Dynamic threshold management via UI
- ✅ **JWT Authentication** - Secure token-based access control
- ✅ **Redis Caching** - Optimized performance for dashboard queries
- ✅ **Historical Tracking** - Complete audit trail of all state transitions

---

## 🏗️ Architecture

<!-- 
TODO: Add system architecture diagram here showing:
- Client (React SPA) → API Gateway → Backend (Gin) → Database (MongoDB + Redis)
- Include: Alert Worker, Rule Engine, Dashboard Service
-->

### Tech Stack

**Backend:**
- **Go 1.22+** with Gin web framework
- **MongoDB Atlas** (primary data store)
- **Upstash Redis** (caching layer with TLS)
- **JWT** authentication (golang-jwt/jwt/v5)
- **Bcrypt** password hashing
- **Docker** multi-stage builds
- **Google Cloud Run** (deployment)

**Frontend:**
- **React 19.2** with functional components & hooks
- **Vite 7.3** (build tool with HMR)
- **TailwindCSS 4.2** (utility-first styling)
- **Axios 1.13** (HTTP client with interceptors)
- **Recharts 2.15** (data visualization)
- **Shadcn/ui + Radix UI** (component library)
- **Vercel** (deployment platform)

---

## 📡 API Documentation

**Base URL:** `https://alert-escalation-resolution-system-backend-387860847580.asia-south1.run.app`

### Authentication Endpoints

#### 1. **POST** `/api/auth/signup`
**Register a new user account**

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "User created successfully"
}
```

**Backend Handling:**
1. Validates input format (Gin binding)
2. Checks email uniqueness (MongoDB unique index)
3. Hashes password (bcrypt with cost factor 10)
4. Creates user document in `users` collection
5. Generates JWT token (24-hour expiry)
6. Returns token for immediate authentication

---

#### 2. **POST** `/api/auth/login`
**Authenticate existing user**

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Login successful"
}
```

**Backend Handling:**
1. Fetches user by email from MongoDB
2. Compares password hash (bcrypt.CompareHashAndPassword)
3. Generates fresh JWT token on success
4. Returns token with email claim

---

#### 3. **GET** `/api/auth/me` 🔒
**Get current user information**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Backend Handling:**
1. JWT middleware extracts and verifies token
2. Decodes email from token claims
3. Fetches user data from MongoDB
4. Returns user profile (password excluded)

---

#### 4. **POST** `/api/auth/refresh` 🔒
**Refresh JWT token for extended session**

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Token refreshed successfully"
}
```

**Backend Handling:**
1. Verifies existing token validity
2. Generates new token with extended expiry
3. Old token remains valid until expiry

---

### Alert Management Endpoints

#### 5. **POST** `/api/alerts`
**Ingest new alert into the system**

**Request:**
```json
{
  "driverId": "DRV123",
  "sourceType": "overspeeding",
  "timestamp": "2024-02-20T10:30:00Z",
  "severity": "Medium",
  "metadata": {
    "speed": 85,
    "location": "Highway 101"
  }
}
```

**Response (201):**
```json
{
  "alertId": "ALT-a1b2c3d4",
  "status": "success"
}
```

**Backend Handling:**
1. Generates unique alert ID (`ALT-{UUID[0:8]}`)
2. Sets initial status to `OPEN`
3. Adds creation history entry with timestamp
4. **Auto-Close Evaluation:**
   - Checks if `sourceType` has `auto_close_if` rule
   - Evaluates metadata against condition (e.g., `document_uploaded == true`)
   - If matched: Sets status to `AUTO-CLOSED`, adds history entry
5. **Escalation Evaluation:**
   - Queries recent alerts for same driver + source type
   - Counts alerts within time window (e.g., 60 minutes)
   - If count exceeds threshold (e.g., ≥3): Upgrades severity to `Critical`, sets status to `ESCALATED`
   - Adds escalation history entry with reason
6. Saves alert to MongoDB `alerts` collection
7. Invalidates Redis dashboard cache
8. Returns alert ID

<!-- 
TODO: Add alert processing workflow diagram here showing:
- Ingestion → Auto-Close Check → Escalation Check → Save → Cache Invalidation
-->

---

#### 6. **GET** `/api/alerts`
**Retrieve all alerts**

**Response (200):**
```json
[
  {
    "alertId": "ALT-a1b2c3d4",
    "driverId": "DRV123",
    "sourceType": "overspeeding",
    "status": "ESCALATED",
    "severity": "Critical",
    "timestamp": "2024-02-20T10:30:00Z",
    "metadata": { /* ... */ },
    "history": [
      {
        "state": "CREATED",
        "timestamp": "2024-02-20T10:30:00Z",
        "reason": "Alert received"
      },
      {
        "state": "ESCALATED",
        "timestamp": "2024-02-20T10:30:05Z",
        "reason": "3+ overspeeding alerts in 60 mins"
      }
    ]
  }
]
```

**Backend Handling:**
1. Queries all documents from `alerts` collection
2. Sorts by timestamp (descending)
3. Returns complete alert list with history

---

#### 7. **GET** `/api/alerts/:alertId`
**Retrieve specific alert by ID**

**Example:** `GET /api/alerts/ALT-a1b2c3d4`

**Response (200):** Single alert object (same structure as above)

**Backend Handling:**
1. Extracts `alertId` from URL parameter
2. Queries MongoDB by `alertId` field
3. Returns alert document or 404 if not found

---

#### 8. **PATCH** `/api/alerts/:alertId/resolve` 🔒
**Manually resolve an alert (operations team)**

**Example:** `PATCH /api/alerts/ALT-a1b2c3d4/resolve`

**Response (200):**
```json
{
  "id": "ALT-a1b2c3d4",
  "status": "RESOLVED",
  "message": "Alert resolved successfully"
}
```

**Backend Handling:**
1. Verifies JWT token (operations team member)
2. Updates alert status to `RESOLVED` in MongoDB
3. Adds history entry: `{ state: "RESOLVED", timestamp: now(), reason: "Manually resolved" }`
4. Invalidates Redis cache keys: `dashboard:stats`, `dashboard:recent_events`
5. Returns confirmation

---

### Dashboard Analytics Endpoints

#### 9. **GET** `/api/dashboard/stats` 🔒
**Get aggregated alert statistics**

**Response (200):**
```json
{
  "total": 1250,
  "open": 450,
  "escalated": 85,
  "autoClosed": 412,
  "resolved": 303
}
```

**Backend Handling (with Redis Caching):**
1. Checks Redis cache key: `dashboard:stats` (TTL: 5 minutes)
2. **Cache Hit:** Deserializes JSON and returns immediately
3. **Cache Miss:**
   - Executes MongoDB aggregation pipeline:
     ```javascript
     db.alerts.aggregate([
       { $group: { 
         _id: "$status", 
         count: { $sum: 1 } 
       }},
       { $group: {
         _id: null,
         total: { $sum: "$count" },
         statuses: { $push: { k: "$_id", v: "$count" } }
       }}
     ])
     ```
   - Transforms aggregation result to stats object
   - Stores in Redis with 5-minute expiry
   - Returns stats
4. Cache is invalidated on: New alert ingestion, Alert resolution

---

#### 10. **GET** `/api/dashboard/top-offenders` 🔒
**Get drivers with most alerts**

**Query Params:** `?limit=5` (default: 5)

**Response (200):**
```json
[
  {
    "driverId": "DRV123",
    "name": "John Smith",
    "count": 18,
    "escalatedCount": 5,
    "lastAlertTime": "2024-02-20T14:30:00Z"
  }
]
```

**Backend Handling:**
1. Checks Redis cache: `dashboard:top_offenders` (TTL: 10 minutes)
2. **Cache Miss:**
   - Executes MongoDB aggregation:
     ```javascript
     db.alerts.aggregate([
       { $match: { status: { $in: ["OPEN", "ESCALATED"] } }},
       { $group: {
         _id: "$driverId",
         count: { $sum: 1 },
         escalatedCount: { $sum: { $cond: [{ $eq: ["$status", "ESCALATED"] }, 1, 0] }},
         lastAlert: { $max: "$timestamp" }
       }},
       { $sort: { count: -1 }},
       { $limit: 5 }
     ])
     ```
   - Caches result in Redis
3. Returns top offenders list

---

#### 11. **GET** `/api/dashboard/recent-events` 🔒
**Get recent alert events with history**

**Query Params:** `?limit=10` (default: 10)

**Response (200):**
```json
[
  {
    "alertId": "ALT-xyz789",
    "driverId": "DRV123",
    "event": "ESCALATED",
    "timestamp": "2024-02-20T15:45:00Z",
    "metadata": { /* ... */ }
  }
]
```

**Backend Handling:**
1. Checks Redis cache: `dashboard:recent_events` (TTL: 2 minutes)
2. **Cache Miss:**
   - Queries latest alerts from MongoDB
   - Unwinds history array to create timeline
   - Sorts by timestamp (descending)
   - Limits results
   - Caches in Redis
3. Returns recent events

---

### Rule Management Endpoints

#### 12. **GET** `/api/rules` 🔒
**Get all configured rules**

**Response (200):**
```json
{
  "overspeeding": {
    "escalate_if_count": 3,
    "window_mins": 60,
    "target_severity": "Critical"
  },
  "negativefeedback": {
    "escalate_if_count": 2,
    "window_mins": 120,
    "target_severity": "High"
  },
  "compliance": {
    "auto_close_if": {
      "document_uploaded": true
    }
  }
}
```

**Backend Handling:**
1. Loads rules from in-memory configuration (initialized from `config/rules.json`)
2. Normalizes all keys to lowercase
3. Returns complete rule set

---

#### 13. **PUT** `/api/rules/:sourceType` 🔒
**Update or create a rule**

**Example:** `PUT /api/rules/overspeeding`

**Request:**
```json
{
  "escalate_if_count": 5,
  "window_mins": 120,
  "target_severity": "Critical"
}
```

**Response (200):**
```json
{
  "message": "Rule for 'overspeeding' updated successfully"
}
```

**Backend Handling:**
1. Normalizes `sourceType` to lowercase
2. Updates in-memory configuration map
3. Persists changes to `config/rules.json` file (durability)
4. All subsequent alert processing uses updated rules
5. No restart required (hot-reload)

---

#### 14. **DELETE** `/api/rules/:sourceType` 🔒
**Delete a rule**

**Example:** `DELETE /api/rules/overspeeding`

**Backend Handling:**
1. Removes rule from in-memory configuration
2. Updates `config/rules.json` file
3. Affected alerts will skip escalation checks

---

### System Health Endpoint

#### 15. **GET** `/api/health`
**Health check endpoint (public)**

**Response (200):**
```json
{
  "status": "AERS System Operational",
  "database": "Connected",
  "redis": "Connected",
  "uptime": "5h32m15s"
}
```

**Backend Handling:**
1. Pings MongoDB (checks connection)
2. Pings Redis (checks cache availability)
3. Calculates uptime since server start
4. Returns system status
5. Used by Cloud Run health checks

---

## 🔐 Security Features

- **Password Hashing:** Bcrypt with cost factor 10 (automatic salt generation)
- **JWT Tokens:** 24-hour expiry, signed with secret key
- **Email Uniqueness:** MongoDB unique index prevents duplicates
- **Protected Routes:** Middleware verifies token on all 🔒 endpoints
- **Auto-Logout:** Frontend intercepts 401 responses and redirects to login
- **CORS Protection:** Configured for production domain only

---

## 🚀 Quick Start

### Prerequisites
- **Go 1.22+** (backend)
- **Node.js 18+** (frontend)
- **MongoDB** (local or Atlas)
- **Redis** (optional, for caching)
- **Docker** (optional, for containerization)

### Local Development

**Backend:**
```bash
cd backend
go mod download
export MONGO_URI="mongodb://localhost:27017"
export JWT_SECRET="your-secret-key"
go run cmd/api/main.go
```

**Frontend:**
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8080/api" > .env
npm run dev
```

### Docker Deployment

```bash
docker-compose up --build
```

**Services:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- MongoDB: `localhost:27017`

### CI/CD - Automated Docker Builds

**GitHub Actions** automatically builds and pushes Docker images to Docker Hub on every push:

**Setup Required Secrets:**
```bash
DOCKER_USERNAME   → Your Docker Hub username
DOCKER_TOKEN      → Docker Hub access token
VITE_API_URL      → Backend API URL
```

**Images Produced:**
```bash
# Pull latest images
docker pull <your-username>/aers-backend:latest
docker pull <your-username>/aers-frontend:latest

# Pull specific branch
docker pull <your-username>/aers-backend:feat-containerization
```

📖 **Complete Setup Guide:** See [.github/DOCKER_SETUP.md](.github/DOCKER_SETUP.md) for detailed instructions.

**Workflow Triggers:**
- ✅ Push to `main` → Tagged as `latest`
- ✅ Push to `feat/**` → Tagged with branch name
- ✅ Pull Requests → Build only (no push)

---

## 📂 Project Structure

```
alert-system/
├── backend/              # Go backend service
│   ├── cmd/api/          # Application entry point
│   ├── internal/         # Private modules
│   │   ├── alerts/       # Alert processing logic
│   │   ├── auth/         # Authentication & JWT
│   │   ├── dashboard/    # Analytics & caching
│   │   └── rules/        # Rule engine
│   ├── pkg/              # Shared packages
│   │   ├── cache/        # Redis operations
│   │   └── db/           # MongoDB connection
│   └── config/           # Configuration files
│
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── api/          # Axios API layer
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   └── hooks/        # Custom React hooks
│   └── public/           # Static assets
│
├── deploy/               # Deployment configurations
│   ├── k8s/              # Kubernetes manifests
│   └── pipeline/         # CI/CD pipelines
│
├── docker-compose.yml    # Local development setup
└── README.md             # This file
```

---

## 📚 Detailed Documentation

For in-depth technical documentation, please refer to:

- **[Backend Documentation](backend/README.md)** (2000+ lines)
  - Detailed API workflows
  - Database schema design
  - Rule engine algorithms
  - Caching strategies
  - Deployment guide

- **[Frontend Documentation](frontend/README.md)** (1150+ lines)
  - Component architecture
  - State management patterns
  - API integration details
  - Error handling strategies
  - Performance optimizations

---

## 🎯 Problem Statement Mapping

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Multiple alert sources | Dynamic `sourceType` field with rule mapping | ✅ |
| Auto-escalation | Frequency-based rule engine with time windows | ✅ |
| Auto-close mechanism | Metadata condition evaluation on ingestion | ✅ |
| Manual resolution | PATCH endpoint with JWT authentication | ✅ |
| State history tracking | Embedded history array with timestamps | ✅ |
| Real-time dashboard | Cached aggregation queries with Redis | ✅ |
| Driver drill-down | Frontend dialog with timeline visualization | ✅ |
| Rule configuration | Dynamic PUT/DELETE endpoints with persistence | ✅ |

---

## 📄 License

This project is created for educational purposes as part of the MoveInSync case study.

---

## 👨‍💻 Author

**Priyobroto Karmakar**  
GitHub: [@PriyobrotoKarmakar](https://github.com/PriyobrotoKarmakar)

---

## 🌟 Acknowledgments

Special thanks to MoveInSync for the interesting case study problem statement.
