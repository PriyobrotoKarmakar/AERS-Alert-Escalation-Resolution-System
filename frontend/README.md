# Alert Escalation & Resolution System - Frontend Documentation

## 📋 Table of Contents

- [Overview](#-overview)
- [Technology Stack](#-technology-stack)
- [Architecture & Design](#-architecture--design)
- [Key Functionalities](#-key-functionalities)
- [API Integration](#-api-integration)
- [Component Detailed Breakdown](#-component-detailed-breakdown)
- [Authentication & Security](#-authentication--security)
- [State Management Patterns](#-state-management-patterns)
- [Error Handling Strategy](#-error-handling-strategy)
- [Performance Optimizations](#-performance-optimizations)
- [Development Guide](#-development-guide)
- [Problem Statement Mapping](#-problem-statement-mapping)

---

## 🎯 Overview

### What is AERS Frontend?

The **Alert Escalation & Resolution System (AERS) Frontend** is a production-ready React 19 Single Page Application (SPA) that provides operations teams at MoveInSync with a comprehensive dashboard for monitoring, investigating, and resolving driver alerts in real-time.

### Live Deployment

- **Production URL**: https://aers-alert-escalation-resolution-sy.vercel.app
- **Backend API**: https://alert-escalation-resolution-system-backend-387860847580.asia-south1.run.app/api
- **Hosting**: Vercel Edge Network (Global CDN)
- **Build Time**: ~45 seconds
- **Bundle Size**: ~170KB gzipped

### Core Purpose

This frontend addresses the **MoveInSync Intelligent Alert Escalation Case Study** requirements by providing:

1. ✅ **Centralized Alert Management** - Unified view of all alerts from multiple sources
2. ✅ **Real-Time Dashboard** - Live statistics, trends, and visualizations
3. ✅ **Driver Drill-Down** - Complete alert history and state transitions per driver
4. ✅ **Manual Resolution** - Operations team can resolve critical alerts
5. ✅ **Rule Configuration** - Visual interface for escalation threshold management
6. ✅ **Auto-Close Transparency** - Clear visibility into automated resolutions
7. ✅ **Secure Authentication** - JWT-based access control
8. ✅ **Error Resilience** - Comprehensive error handling with retry mechanisms

---

## 🛠️ Technology Stack

### Core Technologies

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **React** | 19.2.0 | UI library | Latest concurrent features, hooks, automatic batching |
| **Vite** | 7.3.1 | Build tool | Lightning-fast HMR, optimized production builds |
| **React Router** | 7.13.0 | Routing | Client-side navigation, protected routes |
| **Axios** | 1.13.5 | HTTP client | Interceptors, request/response transformation |
| **TailwindCSS** | 4.2.0 | Styling | Utility-first, responsive design, small bundle |
| **Recharts** | 2.15.4 | Charts | Composable, responsive data visualization |
| **Lucide React** | 0.575.0 | Icons | Beautiful, consistent icon library |
| **Radix UI** | Latest | Primitives | Accessible, unstyled component primitives |
| **Sonner** | 2.0.7 | Toasts | Beautiful toast notifications |

### UI Component Library

**Shadcn/ui + Radix UI Combination:**

- **Button**: Multiple variants (default, destructive, outline, ghost)
- **Card**: Container with header, content, footer sections
- **Dialog**: Modal dialogs with backdrop
- **Table**: Sortable, responsive tables
- **Input**: Form inputs with validation states
- **Badge**: Status indicators with color variants
- **Skeleton**: Loading placeholders
- **Tabs**: Tabbed navigation
- **Dropdown Menu**: Context menus with keyboard navigation
- **Scroll Area**: Custom scrollbars
- **Sidebar**: Collapsible navigation sidebar

### State Management

**React Hooks (No External Library):**

- `useState` - Component-local state
- `useEffect` - Side effects (API calls, subscriptions)
- `useNavigate` - Programmatic navigation
- `useLocation` - Current route information

**Why No Redux/Zustand?**
1. Simple state requirements (mostly API-driven)
2. Shallow component hierarchy (no prop drilling)
3. Better performance (isolated re-renders)
4. Smaller bundle size
5. Easier debugging and maintenance

### Build & Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **npm** | 9+ | Package manager |
| **ESLint** | Latest | Code linting |
| **PostCSS** | Latest | CSS processing |
| **Autoprefixer** | Latest | CSS vendor prefixes |

---

## 🏗️ Architecture & Design

### Application Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                React Application (SPA)                       │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  React Router (BrowserRouter)                        │  │ │
│  │  │  • /login (Public)                                   │  │ │
│  │  │  • /signup (Public)                                  │  │ │
│  │  │  • / (Protected) → Dashboard Layout                  │  │ │
│  │  │    ├─ /dashboard                                     │  │ │
│  │  │    ├─ /alerts                                        │  │ │
│  │  │    └─ /configuration                                 │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Component Tree                                      │  │ │
│  │  │  • Functional Components with Hooks                  │  │ │
│  │  │  • useState for local state                          │  │ │
│  │  │  • useEffect for side effects                        │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  API Service Layer (src/api/)                        │  │ │
│  │  │  • axios.js (Base configuration)                     │  │ │
│  │  │  • auth.js (Authentication)                          │  │ │
│  │  │  • dashboard.js (Dashboard data)                     │  │ │
│  │  │  • alerts.js (Alert operations)                      │  │ │
│  │  │  • configuration.js (Rule management)                 │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│                                ↓                                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │            HTTP Layer (Axios with Interceptors)              │ │
│  │                                                              │ │
│  │  Request Interceptor:                                        │ │
│  │  • Read JWT token from localStorage                          │ │
│  │  • Inject Authorization: Bearer {token}                      │ │
│  │  • Add Content-Type: application/json                        │ │
│  │                                                              │ │
│  │  Response Interceptor:                                       │ │
│  │  • Check for 401 Unauthorized                                │ │
│  │  • Auto-logout and redirect to /login                        │ │
│  │  • Extract error messages                                    │ │
│  │  • Display toast notifications                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ↓ HTTPS
┌──────────────────────────────────────────────────────────────────┐
│                      Backend API (Go)                             │
│  Cloud Run: alert-escalation-resolution-system-backend           │
│                                                                   │
│  Endpoints:                                                       │
│  • POST /api/auth/login                                           │
│  • GET /api/dashboard/stats                                       │
│  • GET /api/alerts                                                │
│  • PATCH /api/alerts/{id}/resolve                                 │
│  • GET /api/config/rules                                          │
│  • PUT /api/config/rules/{id}                                     │
└──────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
<App>
├─ <BrowserRouter>
│  ├─ <Routes>
│  │  ├─ Route: /login
│  │  │  └─ <Login />
│  │  │     ├─ Card (Login form)
│  │  │     ├─ Input (Email)
│  │  │     ├─ Input (Password with toggle)
│  │  │     └─ Button (Submit)
│  │  │
│  │  ├─ Route: /signup
│  │  │  └─ <Signup />
│  │  │     ├─ Card (Registration form)
│  │  │     ├─ Input (Name)
│  │  │     ├─ Input (Email)
│  │  │     ├─ Input (Password)
│  │  │     └─ Button (Submit)
│  │  │
│  │  └─ Route: / (Protected)
│  │     └─ <ProtectedRoute>
│  │        └─ <DashboardLayout>
│  │           ├─ <SidebarProvider>
│  │           │  └─ <AppSidebar>
│  │           │     ├─ Home Link → /dashboard
│  │           │     ├─ Alerts Link → /alerts
│  │           │     └─ Configuration Link → /configuration
│  │           │
│  │           ├─ Header
│  │           │  ├─ SidebarTrigger (Toggle button)
│  │           │  ├─ Page Title (Dynamic)
│  │           │  ├─ Bell Icon (Notifications)
│  │           │  └─ <DropdownMenu>
│  │           │     ├─ User Name
│  │           │     ├─ User Email
│  │           │     └─ Logout Button
│  │           │
│  │           └─ <Outlet> (Nested Routes)
│  │              │
│  │              ├─ Route: /dashboard
│  │              │  └─ <Dashboard />
│  │              │     ├─ Stats Cards (3)
│  │              │     │  ├─ Total Active
│  │              │     │  ├─ Escalated (Red)
│  │              │     │  └─ Auto-Closed 24h (Green)
│  │              │     │
│  │              │     ├─ Content Grid
│  │              │     │  ├─ Trend Chart (4 columns)
│  │              │     │  │  └─ <ResponsiveContainer>
│  │              │     │  │     └─ <LineChart>
│  │              │     │  │        ├─ <Line> Total (Slate)
│  │              │     │  │        ├─ <Line> Escalated (Red)
│  │              │     │  │        └─ <Line> Auto-Closed (Green)
│  │              │     │  │
│  │              │     │  └─ Top Offenders Table (3 columns)
│  │              │     │     └─ Clickable rows
│  │              │     │
│  │              │     ├─ Recent Events Table
│  │              │     │  └─ Alert lifecycle events
│  │              │     │
│  │              │     └─ <Dialog> Driver Details
│  │              │        ├─ Summary Cards (4)
│  │              │        ├─ <ScrollArea>
│  │              │        │  └─ Timeline (All alerts & history)
│  │              │        └─ Close Button
│  │              │
│  │              ├─ Route: /alerts
│  │              │  └─ <Alerts />
│  │              │     ├─ Search Bar
│  │              │     │  └─ <Input> with Search icon
│  │              │     │
│  │              │     ├─ Alerts Table
│  │              │     │  ├─ Headers (6 columns)
│  │              │     │  └─ Clickable rows
│  │              │     │
│  │              │     └─ <Dialog> Alert Details
│  │              │        ├─ Header (Alert ID + Status)
│  │              │        ├─ Metadata Grid (4 fields)
│  │              │        ├─ Timeline
│  │              │        │  └─ State transitions
│  │              │        └─ Footer
│  │              │           └─ Resolve Button (conditional)
│  │              │
│  │              └─ Route: /configuration
│  │                 └─ <Configuration />
│  │                    ├─ <Tabs>
│  │                    │  ├─ Tab: Visual Overview
│  │                    │  │  └─ Rule Cards Grid
│  │                    │  │     ├─ Overspeeding Card
│  │                    │  │     │  ├─ Edit Button
│  │                    │  │     │  ├─ Threshold
│  │                    │  │     │  ├─ Time Window
│  │                    │  │     │  └─ Severity Badge
│  │                    │  │     │
│  │                    │  │     ├─ Negative Feedback Card
│  │                    │  │     └─ Compliance Card
│  │                    │  │
│  │                    │  └─ Tab: Raw JSON
│  │                    │     └─ Code Block (Syntax highlighted)
│  │                    │
│  │                    └─ <Dialog> Edit Rule
│  │                       ├─ Form (Dynamic fields)
│  │                       ├─ Cancel Button
│  │                       └─ Save Button
│  │
│  └─ <Toaster /> (Global toast notifications)
└─</App>
```

### Data Flow Pattern

```
User Action → Event Handler → API Call → Response → State Update → Re-render
     ↓             ↓              ↓          ↓           ↓            ↓
  Click       onClick()      axios.get()  .then()   setState()   Virtual DOM
  Button      function                                            → Real DOM
```

**Example: Fetch Dashboard Stats**

```javascript
// 1. Component Mount
useEffect(() => {
  fetchDashboardData()
}, [])

// 2. API Call
const fetchDashboardData = async () => {
  setLoading(true)
  try {
    const response = await getDashboardStats()  // Axios call
    setStats(response.data)  // Update state
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}

// 3. Re-render with new data
return (
  <Card>
    {loading ? <Skeleton /> : <p>{stats.totalActive}</p>}
  </Card>
)
```

---

## ⚡ Key Functionalities

### 1. Real-Time Dashboard Analytics

**📍 Location:** `src/pages/Dashboard.jsx` (423 lines)

**🎯 Purpose:** Provide operations team with live statistics, trend visualization, top offenders, and recent events in a single unified view.

#### Features Implemented

1. **Live Statistics Cards** (3 cards displaying real-time counts)
2. **7-Day Trend Chart** (Interactive Recharts line graph)
3. **Top 5 Offenders Table** (Drivers with most open alerts)
4. **Recent Events Stream** (Latest alert lifecycle changes)
5. **Driver Drill-Down Dialog** (Complete history for selected driver)

#### State Variables

```javascript
// Dashboard.jsx - State Management (10 variables)
const [stats, setStats] = useState({
  totalActive: 0,
  escalated: 0,
  autoClosed24h: 0,
  changePercent: 0
})
const [chartData, setChartData] = useState([])
const [topDrivers, setTopDrivers] = useState([])
const [recentEvents, setRecentEvents] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

// Driver dialog state
const [selectedDriver, setSelectedDriver] = useState(null)
const [driverAlerts, setDriverAlerts] = useState([])
const [driverHistory, setDriverHistory] = useState([])
const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false)
const [loadingDriverAlerts, setLoadingDriverAlerts] = useState(false)
```

#### API Integration

**Parallel Data Fetching:**

```javascript
const fetchDashboardData = async () => {
  setLoading(true)
  setError(null)

  try {
    // Fetch 4 endpoints in parallel using Promise.all
    // Time complexity: O(1) - slowest request
    // Without Promise.all: O(N) - sum of all requests
    const [statsRes, trendsRes, driversRes, eventsRes] = await Promise.all([
      getDashboardStats(),        // GET /api/dashboard/stats
      getAlertTrends(7),          // GET /api/dashboard/trends?days=7
      getTopOffenders(5),         // GET /api/dashboard/top-offenders?limit=5
      getRecentEvents(5)          // GET /api/dashboard/recent-events?limit=5
    ])

    // Extract and validate data with defensive programming
    setStats(statsRes?.data || { totalActive: 0, escalated: 0, autoClosed24h: 0 })
    setChartData(Array.isArray(trendsRes?.data) ? trendsRes.data : [])
    setTopDrivers(Array.isArray(driversRes?.data) ? driversRes.data : [])
    setRecentEvents(Array.isArray(eventsRes?.data) ? eventsRes.data : [])
  } catch (err) {
    console.error("Dashboard fetch error:", err)
    setError(err.message || "Failed to load dashboard data")
    toast.error("Failed to load dashboard data. Please try again.")
  } finally {
    setLoading(false)
  }
}
```

#### API Requests & Responses

**1. Dashboard Statistics**

```javascript
// Request
GET /api/dashboard/stats
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}

// Response (200 OK)
{
  "data": {
    "totalActive": 45,
    "escalated": 12,
    "autoClosed24h": 230,
    "changePercent": 5.2
  }
}

// How it's used in the component:
<Card>
  <CardHeader>
    <CardTitle>Total Active Alerts</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-4xl font-bold">{stats.totalActive}</p>
    {stats.changePercent > 0 && (
      <p className="text-sm text-green-600">
        ↑ {stats.changePercent}% from yesterday
      </p>
    )}
  </CardContent>
</Card>
```

**2. Alert Trends**

```javascript
// Request
GET /api/dashboard/trends?days=7

// Response (200 OK)
{
  "data": [
    { "name": "Feb 15", "total": 120, "escalated": 15, "autoClosed": 80 },
    { "name": "Feb 16", "total": 135, "escalated": 18, "autoClosed": 90 },
    { "name": "Feb 17", "total": 125, "escalated": 12, "autoClosed": 95 },
    { "name": "Feb 18", "total": 140, "escalated": 20, "autoClosed": 85 },
    { "name": "Feb 19", "total": 130, "escalated": 16, "autoClosed": 92 },
    { "name": "Feb 20", "total": 145, "escalated": 22, "autoClosed": 88 },
    { "name": "Feb 21", "total": 150, "escalated": 25, "autoClosed": 90 }
  ]
}

// How it's rendered:
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line 
      type="monotone" 
      dataKey="total" 
      stroke="#64748b" 
      strokeWidth={2}
      name="Total Alerts" 
    />
    <Line 
      type="monotone" 
      dataKey="escalated" 
      stroke="#ef4444" 
      strokeWidth={2}
      name="Escalated" 
    />
    <Line 
      type="monotone" 
      dataKey="autoClosed" 
      stroke="#22c55e" 
      strokeWidth={2}
      name="Auto-Closed" 
    />
  </LineChart>
</ResponsiveContainer>
```

**3. Top Offenders**

```javascript
// Request
GET /api/dashboard/top-offenders?limit=5

// Response (200 OK)
{
  "data": [
    {
      "id": "DRV-1042",
      "name": "Rajesh Kumar",
      "openAlerts": 15,
      "severity": "Critical"
    },
    {
      "id": "DRV-2087",
      "name": "Amit Singh",
      "openAlerts": 12,
      "severity": "High"
    },
    {
      "id": "DRV-3156",
      "name": "Priya Sharma",
      "openAlerts": 10,
      "severity": "High"
    }
  ]
}

// Rendered as clickable table rows:
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Driver</TableHead>
      <TableHead>Open Alerts</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {topDrivers.map((driver) => (
      <TableRow 
        key={driver.id}
        onClick={() => handleDriverClick(driver)}
        className="cursor-pointer hover:bg-slate-50"
      >
        <TableCell>
          <div>
            <p className="font-medium">{driver.name}</p>
            <p className="text-xs text-slate-500">{driver.id}</p>
          </div>
        </TableCell>
        <TableCell>
          <Badge className={getSeverityColor(driver.severity)}>
            {driver.openAlerts}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Driver Drill-Down Implementation

**Trigger:** Click on driver row in Top Offenders table

**Process:**
1. Fetch all alerts from backend
2. Filter alerts by driverId
3. Extract and merge all history entries from all driver alerts
4. Sort history chronologically
5. Display in modal dialog

```javascript
const handleDriverClick = async (driver) => {
  const driverId = driver?.id || driver?.driverId
  setSelectedDriver(driver)
  setIsDriverDialogOpen(true)
  setLoadingDriverAlerts(true)

  try {
    // Step 1: Fetch ALL alerts
    const response = await getAlerts()  // GET /api/alerts
    const allAlerts = Array.isArray(response?.data) ? response.data : []

    // Step 2: Client-side filter by driverId
    const filteredAlerts = allAlerts.filter(
      (alert) => alert?.metadata?.driverId === driverId
    )

    // Step 3: Calculate summary statistics
    const escalatedCount = filteredAlerts.filter(a => a.status === "ESCALATED").length
    const resolvedCount = filteredAlerts.filter(a => a.status === "RESOLVED").length
    const autoClosedCount = filteredAlerts.filter(a => a.status === "AUTO-CLOSED").length

    // Step 4: Extract ALL history entries from ALL alerts
    const allHistoryEntries = []
    filteredAlerts.forEach((alert) => {
      if (alert.history && Array.isArray(alert.history)) {
        alert.history.forEach((historyEntry) => {
          allHistoryEntries.push({
            ...historyEntry,
            alertId: alert.alertId,
            sourceType: alert.sourceType,
            severity: alert.severity,
            metadata: alert.metadata
          })
        })
      }
    })

    // Step 5: Sort by timestamp (newest first)
    allHistoryEntries.sort((a, b) => {
      const timeA = new Date(a.time || 0).getTime()
      const timeB = new Date(b.time || 0).getTime()
      return timeB - timeA
    })

    setDriverAlerts(filteredAlerts)
    setDriverHistory(allHistoryEntries)
  } catch (err) {
    console.error("Failed to fetch driver alerts:", err)
    toast.error("Failed to load driver data")
    setDriverAlerts([])
    setDriverHistory([])
  } finally {
    setLoadingDriverAlerts(false)
  }
}
```

**Driver Dialog UI:**

```jsx
<Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
  <DialogContent className="max-w-3xl max-h-[80vh]">
    <DialogHeader>
      <DialogTitle>
        Driver Details: {selectedDriver?.name || selectedDriver?.driverId}
      </DialogTitle>
    </DialogHeader>

    {loadingDriverAlerts ? (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ) : (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{driverAlerts.length}</p>
              <p className="text-sm text-slate-500">Total Alerts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-red-600">
                {driverAlerts.filter(a => a.status === "ESCALATED").length}
              </p>
              <p className="text-sm text-slate-500">Escalated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-blue-600">
                {driverAlerts.filter(a => a.status === "RESOLVED").length}
              </p>
              <p className="text-sm text-slate-500">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-600">
                {driverAlerts.filter(a => a.status === "AUTO-CLOSED").length}
              </p>
              <p className="text-sm text-slate-500">Auto-Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Alert History Timeline</h3>
          <ScrollArea className="h-[45vh] pr-4">
            {driverHistory.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No history available for this driver
              </p>
            ) : (
              <div className="space-y-4">
                {driverHistory.map((entry, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                      {index < driverHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{entry.alertId}</Badge>
                        {getStatusBadge(entry.state)}
                        <Badge variant="secondary">{entry.sourceType}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {new Date(entry.time).toLocaleString()}
                      </p>
                      <p className="text-sm mt-1">{entry.note}</p>
                      {entry.metadata?.speed && (
                        <p className="text-xs text-slate-500 mt-1">
                          Speed: {entry.metadata.speed} km/h
                        </p>
                      )}
                      {entry.metadata?.rating && (
                        <p className="text-xs text-slate-500 mt-1">
                          Rating: {entry.metadata.rating}/5
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>
```

---

### 2. Alert Investigation & Manual Resolution

**📍 Location:** `src/pages/Alerts.jsx` (361 lines)

**🎯 Purpose:** Provide operations team with searchable alert table, detailed investigation dialog, and manual resolution capability for critical alerts.

#### Features Implemented

1. **Searchable Alert Table** (Filter by ID, driver, source type)
2. **Alert Details Dialog** (Complete metadata and history)
3. **State Transition Timeline** (Visual representation)
4. **Manual Resolution Button** (For OPEN/ESCALATED alerts)
5. **Optimistic UI Updates** (Instant feedback)

#### State Variables

```javascript
// Alerts.jsx - State Management (7 variables)
const [alerts, setAlerts] = useState([])
const [searchTerm, setSearchTerm] = useState("")
const [selectedAlert, setSelectedAlert] = useState(null)
const [isDialogOpen, setIsDialogOpen] = useState(false)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
const [resolving, setResolving] = useState(false)
```

#### API Integration

**Fetch All Alerts:**

```javascript
const fetchAlerts = async () => {
  setLoading(true)
  setError(null)

  try {
    const response = await getAlerts()  // GET /api/alerts
    const alertsData = Array.isArray(response?.data) ? response.data : []

    // Sort by timestamp (newest first)
    const sortedAlerts = alertsData.sort((a, b) => {
      const timeA = new Date(a?.timestamp || 0).getTime()
      const timeB = new Date(b?.timestamp || 0).getTime()
      return timeB - timeA
    })

    setAlerts(sortedAlerts)
  } catch (err) {
    const errorMessage = err.message || "Failed to fetch alerts"
    setError(errorMessage)
    toast.error(errorMessage)
    console.error("Alert fetch error:", err)
  } finally {
    setLoading(false)
  }
}

// Call on component mount
useEffect(() => {
  fetchAlerts()
}, [])
```

**Request & Response:**

```javascript
// Request
GET /api/alerts
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}

// Response (200 OK)
{
  "data": [
    {
      "id": "673ebbc58d44b7d3dcb1fc98",
      "alertId": "ALT-a1b2c3d4",
      "driverId": "DRV-1042",
      "sourceType": "Overspeeding",
      "severity": "Critical",
      "status": "ESCALATED",
      "timestamp": "2026-02-22T10:30:00Z",
      "metadata": {
        "speed": 120,
        "speedLimit": 80,
        "location": "Highway 1",
        "driverId": "DRV-1042",
        "vehicleId": "KA-01-MH-4421"
      },
      "history": [
        {
          "state": "OPEN",
          "time": "2026-02-22T10:30:00Z",
          "note": "Alert generated by Overspeeding module"
        },
        {
          "state": "ESCALATED",
          "time": "2026-02-22T10:30:05Z",
          "note": "Auto-escalated by Rule Engine after 3 violations in 60 mins"
        }
      ]
    }
  ]
}
```

**Search/Filter Implementation:**

```javascript
// Client-side filtering (O(N) time complexity)
const filteredAlerts = Array.isArray(alerts)
  ? alerts.filter((alert) => {
      const searchLower = searchTerm.toLowerCase()
      const alertId = (alert?.id || alert?.alertId || "").toLowerCase()
      const driverId = (alert?.metadata?.driverId || "").toLowerCase()
      const sourceType = (alert?.sourceType || "").toLowerCase()

      return (
        alertId.includes(searchLower) ||
        driverId.includes(searchLower) ||
        sourceType.includes(searchLower)
      )
    })
  : []

---

### 3. Rule Engine Configuration
**File:** src/pages/Configuration.jsx (332 lines)

**Features:**
- Visual rule cards (Overspeeding, Negative Feedback, Compliance)
- Edit modal with dynamic form fields
- Raw JSON view of complete configuration
- Real-time rule updates

**API Calls:**
```javascript
await getRulesConfig()  // GET /api/config/rules

await updateRule('overspeeding', {
  escalate_if_count: 5,
  window_mins: 120,
  target_severity: 'Critical'
})  // PUT /api/config/rules/overspeeding
```

---

### 4. User Authentication
**Files:** src/pages/Login.jsx, src/pages/Signup.jsx, src/components/ProtectedRoute.jsx

**Features:**
- JWT token authentication
- Auto-logout on 401 response
- Token stored in localStorage
- Protected route guards

**API Calls:**
```javascript
// Login
const response = await login({ email, password })  // POST /api/auth/login
localStorage.setItem('token', response.data.token)

// Verify token
await getCurrentUser()  // GET /api/auth/me
```

---

## API Integration Layer

### Axios Configuration (src/api/axios.js)

**Base Setup:**
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true
})
```

**Request Interceptor:**
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = \"Bearer \\"
  }
  return config
})
```

**Response Interceptor:**
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error(\"Session expired. Please login again.\")
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## Request/Response Flows

### Dashboard Flow
1. Component mounts → useEffect triggers
2. Call 4 API endpoints in parallel with Promise.all
3. Extract response.data from each
4. Validate data structure (Array.isArray checks)
5. Apply default values for null/undefined
6. Update state with setState
7. Component re-renders with new data
8. On error: Set error state, display toast, show retry button

### Alert Resolution Flow
1. User clicks \"Resolve\" button in alert detail dialog
2. Set resolving state (disable button to prevent double-clicks)
3. Optimistic update: Update local state immediately
4. Call PATCH /api/alerts/{alertId}/resolve
5. On success: Show success toast, keep optimistic update
6. On error: Revert state, show error toast with retry option
7. Finally: Clear resolving state

### Configuration Edit Flow
1. User clicks \"Edit\" button on rule card
2. Pre-fill form with current rule values
3. User modifies fields
4. Click \"Save\" → Call PUT /api/config/rules/{ruleId}
5. On success: Refetch rules, close modal, show success toast
6. On error: Show error toast, keep modal open for retry

---

## Component Deep-Dive

### Dashboard.jsx - Detailed Breakdown

**State Variables (10 total):**
```javascript
const [stats, setStats] = useState({ totalActive: 0, escalated: 0, autoClosed24h: 0 })
const [chartData, setChartData] = useState([])
const [topDrivers, setTopDrivers] = useState([])
const [recentEvents, setRecentEvents] = useState([])
const [selectedDriver, setSelectedDriver] = useState(null)
const [driverAlerts, setDriverAlerts] = useState([])
const [driverHistory, setDriverHistory] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false)
```

**Driver Drill-Down Implementation:**
```javascript
const handleDriverClick = async (driver) => {
  const driverId = driver?.id || driver?.driverId
  setSelectedDriver(driver)
  setIsDriverDialogOpen(true)
  
  // Fetch all alerts
  const response = await getAlerts()
  const allAlerts = response?.data || []
  
  // Filter by driverId
  const filteredAlerts = allAlerts.filter(
    alert => alert?.metadata?.driverId === driverId
  )
  
  // Extract and merge all history entries
  const allHistory = []
  filteredAlerts.forEach(alert => {
    alert.history?.forEach(entry => {
      allHistory.push({
        ...entry,
        alertId: alert.alertId,
        sourceType: alert.sourceType
      })
    })
  })
  
  // Sort by timestamp
  allHistory.sort((a, b) => new Date(b.time) - new Date(a.time))
  
  setDriverAlerts(filteredAlerts)
  setDriverHistory(allHistory)
}
```

---

## Problem Statement Mapping

### MoveInSync Requirements → Frontend Implementation

**1. Centralized Alert Management:**
- ✅ Alerts page displays all alerts from multiple sources
- ✅ Unified structure: Alert ID, Source Type, Driver ID, Severity, Status, Timestamp
- ✅ Search/filter functionality across all fields

**2. Dashboard View:**
- ✅ Real-time statistics (Total Active, Escalated, Auto-Closed 24h)
- ✅ 7-day trend chart with Recharts
- ✅ Top offenders table with clickable rows
- ✅ Recent events stream showing state transitions

**3. Auto-Close Transparency:**
- ✅ Dedicated column for auto-closed alerts
- ✅ History timeline shows auto-close reason
- ✅ Dashboard displays 24h auto-close count

**4. Alert Drill-Down:**
- ✅ Click driver in top offenders → Opens detailed dialog
- ✅ Shows all alerts for that driver
- ✅ Complete state transition timeline
- ✅ Metadata display (speed, rating, comments)

**5. Manual Resolution:**
- ✅ Resolve button in alert detail dialog
- ✅ Only visible for OPEN/ESCALATED alerts
- ✅ Optimistic UI updates
- ✅ Success/error toast notifications

**6. Configuration Management:**
- ✅ Visual rule cards with thresholds
- ✅ Edit modal for dynamic updates
- ✅ Raw JSON view for developers
- ✅ Separate cards for Overspeeding, Feedback, Compliance rules

**7. Authentication:**
- ✅ JWT token-based authentication
- ✅ Protected routes with token verification
- ✅ Auto-logout on session expiry
- ✅ Login/Signup pages with validation

**8. Error Handling:**
- ✅ Response interceptor for global 401 handling
- ✅ Component-level try-catch blocks
- ✅ Toast notifications for user feedback
- ✅ Retry buttons on error states

---

## Complete API Catalog

### Authentication APIs
- POST /api/auth/login - User login
- POST /api/auth/signup - User registration
- GET /api/auth/me - Get current user
- POST /api/auth/logout - User logout

### Dashboard APIs
- GET /api/dashboard/stats - Live statistics
- GET /api/dashboard/trends?days=7 - Trend data
- GET /api/dashboard/top-offenders?limit=5 - Top drivers
- GET /api/dashboard/recent-events?limit=10 - Recent events

### Alert APIs
- GET /api/alerts - All alerts
- GET /api/alerts/{alertId} - Alert details
- PATCH /api/alerts/{alertId}/resolve - Manual resolution
- POST /api/alerts - Create alert (ingestion)

### Configuration APIs
- GET /api/config/rules - All rules
- PUT /api/config/rules/{ruleId} - Update rule
- GET /api/config/rules/{ruleName} - Single rule
- POST /api/config/rules/reload - Reload from file

---

## Technology Stack Details

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.0 | UI library with hooks |
| React Router | 7.13.0 | Client-side routing |
| Axios | 1.13.5 | HTTP client |
| TailwindCSS | 4.2.0 | Styling framework |
| Recharts | 2.15.4 | Data visualization |
| Lucide React | 0.575.0 | Icon library |
| Radix UI | Latest | Component primitives |
| Sonner | 2.0.7 | Toast notifications |
| Vite | 7.3.1 | Build tool |

---

## Development Setup

Install dependencies:
```bash
npm install
```

Configure environment:
```bash
echo \"VITE_API_URL=http://localhost:8080/api\" > .env
```

Start dev server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

---

**Author:** Priyobroto Karmakar  
**GitHub:** https://github.com/PriyobrotoKarmakar  
**Live Demo:** https://aers-alert-escalation-resolution-sy.vercel.app
