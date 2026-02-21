# Alert Escalation & Resolution System - Frontend

A modern, responsive React-based dashboard for managing and monitoring fleet driver alerts with intelligent escalation and auto-closure capabilities.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2.0-06B6D4?logo=tailwindcss)

---

## 🎯 Overview

This is the frontend application for the Alert Escalation & Resolution System (AERS), designed for MoveInSync Operations to monitor driver behavior, compliance issues, and negative feedback with real-time alerting and automated resolution workflows.

## ✨ Features

### 🎨 **Modern UI/UX**
- Clean, professional interface built with shadcn/ui components
- Dark mode support
- Fully responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Collapsible sidebar navigation

### 📊 **Dashboard Analytics**
- **Real-time Stats Cards**
  - Total active alerts count
  - Escalated alerts (critical attention required)
  - Auto-closed alerts (24-hour window)
  - Percentage changes and time saved metrics

- **Interactive Charts**
  - 7-day trend visualization using Recharts
  - Multiple data series (total, escalated, auto-closed)
  - Responsive chart design

- **Top Offenders List**
  - Drivers with most open alerts
  - Severity indicators
  - Quick access to driver details

- **Recent Events Timeline**
  - Alert lifecycle state changes
  - Real-time event stream
  - Color-coded status badges

### 🚨 **Alert Management**
- **Alert Investigation Page**
  - Searchable alert table (by ID, driver, source type)
  - Severity-based color coding
  - Status badges (OPEN, ESCALATED, AUTO-CLOSED, RESOLVED)
  - Click-to-view detailed modal

- **Alert Details Modal**
  - Complete alert metadata
  - State transition timeline with timestamps
  - Visual history representation
  - Manual resolution capability

- **Manual Resolution**
  - One-click resolution for OPEN/ESCALATED alerts
  - Optimistic UI updates
  - Error handling with retry

### ⚙️ **Configuration Dashboard**
- **Visual Rule Overview**
  - Card-based display of active rules
  - Threshold and time window visualization
  - Severity indicators
  - Rule type badges (Escalation/Auto-Close)

- **Rule Types Supported**
  - Overspeeding rules
  - Negative feedback rules
  - Compliance document rules

- **Raw JSON View**
  - Full configuration display
  - Syntax-highlighted JSON
  - Live data from backend

### 🔐 **Authentication**
- Modern login/signup pages
- JWT token-based authentication
- Auto-logout on 401 responses
- Secure token storage (localStorage)
- Password visibility toggle
- Form validation

### 🎨 **UI Components Library**
Leveraging shadcn/ui components:
- Cards, Badges, Buttons
- Tables with sorting
- Dialog modals
- Input fields with labels
- Tabs navigation
- Skeletons for loading states
- Tooltips
- Collapsible sidebar
- Dropdown menus
- Separators

---

## 🛠️ Tech Stack

### **Core**
- **[React 19.2.0](https://react.dev/)** - UI library with latest features
- **[Vite 7.3.1](https://vite.dev/)** - Lightning-fast build tool
- **[React Router DOM 7.13.0](https://reactrouter.com/)** - Client-side routing

### **Styling**
- **[Tailwind CSS 4.2.0](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality component library
- **[Lucide React](https://lucide.dev/)** - Beautiful icon set
- **[class-variance-authority](https://cva.style/)** - Component variants
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Merge Tailwind classes

### **Data Visualization**
- **[Recharts 2.15.4](https://recharts.org/)** - Composable charting library

### **HTTP Client**
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client with interceptors

### **State Management**
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management (alertStore)

---

## 📁 Project Structure

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── api/                 # API service layer
│   │   ├── axios.js        # Axios instance with interceptors
│   │   ├── alerts.js       # Alert endpoints
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── configuration.js # Rules configuration endpoints
│   │   └── dashboard.js    # Dashboard statistics endpoints
│   │
│   ├── assets/             # Images, fonts, etc.
│   │
│   ├── components/
│   │   ├── layout/         # Layout components
│   │   │   ├── app-sidebar.jsx      # Collapsible sidebar navigation
│   │   │   └── DashboardLayout.jsx  # Main dashboard wrapper
│   │   │
│   │   └── ui/             # shadcn/ui components
│   │       ├── badge.jsx
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── chart.jsx
│   │       ├── dialog.jsx
│   │       ├── dropdown-menu.jsx
│   │       ├── input.jsx
│   │       ├── label.jsx
│   │       ├── separator.jsx
│   │       ├── sheet.jsx
│   │       ├── sidebar.jsx
│   │       ├── skeleton.jsx
│   │       ├── table.jsx
│   │       ├── tabs.jsx
│   │       └── tooltip.jsx
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── use-mobile.js   # Mobile detection hook
│   │
│   ├── lib/                # Utility functions
│   │   └── utils.js        # Class name utilities
│   │
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main dashboard with stats & charts
│   │   ├── Alerts.jsx      # Alert investigation & management
│   │   ├── Configuration.jsx # Rule engine configuration
│   │   ├── Login.jsx       # User login page
│   │   └── Signup.jsx      # User registration page
│   │
│   ├── store/              # State management
│   │   └── alertStore.js   # Alert state with Zustand
│   │
│   ├── App.jsx             # Main app component with routing
│   ├── App.css             # Global styles
│   ├── main.jsx            # Application entry point
│   └── index.css           # Tailwind directives
│
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── API_ENDPOINTS.md        # Complete API documentation
├── components.json         # shadcn/ui configuration
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── jsconfig.json           # JavaScript configuration
├── package.json            # Dependencies and scripts
├── README.md               # This file
└── vite.config.js          # Vite configuration
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18.x or higher
- npm 9.x or higher
- Backend API running (see API_ENDPOINTS.md)

### **Installation**

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/PriyobrotoKarmakar/AERS-Alert-Escalation-Resolution-System.git
   cd AERS-Alert-Escalation-Resolution-System/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` to configure your backend API URL:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   ```
   http://localhost:5173
   ```

### **Build for Production**

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

### **Preview Production Build**

```bash
npm run preview
```

---

## 📡 API Integration

The frontend communicates with the backend through RESTful APIs. All API calls are centralized in the `src/api/` directory.

### **Base Configuration**
- **Base URL**: Configured via `VITE_API_URL` environment variable
- **Default**: `http://localhost:8080/api`
- **Authentication**: JWT Bearer token (auto-injected via Axios interceptor)

### **API Endpoints Expected**

For complete API documentation, see **[API_ENDPOINTS.md](./API_ENDPOINTS.md)**

#### **Authentication** (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

#### **Dashboard** (`/api/dashboard`)
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/trends?days=7` - Alert trends over time
- `GET /api/dashboard/top-offenders?limit=5` - Top drivers with alerts
- `GET /api/dashboard/recent-events?limit=10` - Recent alert events

#### **Alerts** (`/api/alerts`)
- `GET /api/alerts` - Fetch all alerts
- `GET /api/alerts/:alertId` - Get alert details with history
- `PATCH /api/alerts/:alertId/resolve` - Manually resolve an alert
- `POST /api/alerts` - Create/ingest new alert

#### **Configuration** (`/api/config`)
- `GET /api/config/rules` - Get all rules configuration
- `GET /api/config/rules/:ruleName` - Get specific rule
- `PUT /api/config/rules/:ruleId` - Update a rule
- `POST /api/config/rules/reload` - Reload rules from config

### **Request/Response Format**

#### **Authentication Example**
```javascript
// Request
POST /api/auth/login
{
  "email": "admin@moveinsync.com",
  "password": "password123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "admin@moveinsync.com",
    "name": "Admin User"
  }
}
```

#### **Dashboard Stats Example**
```javascript
// Request
GET /api/dashboard/stats

// Response
{
  "totalActive": 24,
  "escalated": 7,
  "autoClosed24h": 142,
  "changePercent": 4,
  "timeSaved": "4.5"
}
```

#### **Alert Details Example**
```javascript
// Request
GET /api/alerts/ALT-9921

// Response
{
  "id": "ALT-9921",
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

### **Error Handling**

The frontend handles errors gracefully:

- **401 Unauthorized**: Automatically logs out and redirects to login
- **Network Errors**: Shows error message with retry button
- **Validation Errors**: Displays field-specific error messages
- **Generic Errors**: User-friendly error messages with technical details logged to console

All API errors follow this structure:
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## 🎨 Design System

### **Color Palette**
- **Primary**: Zinc/Slate shades for modern, professional look
- **Success**: Green for auto-closed and positive actions
- **Danger**: Red for escalated alerts and critical items
- **Warning**: Amber for warnings and feedback alerts
- **Info**: Blue for informational content

### **Typography**
- Default system fonts for optimal performance
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### **Spacing**
- Consistent spacing scale using Tailwind's spacing system
- Responsive padding and margins

### **Components**
All components follow shadcn/ui design principles with custom theming for the alert system context.

---

## 🔒 Security Features

- **JWT Token Management**: Secure storage and automatic injection
- **Automatic Logout**: On token expiration or 401 responses
- **HTTPS Ready**: Production builds support HTTPS
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Token-based authentication prevents CSRF
- **Input Sanitization**: All user inputs are validated

---

## 📱 Responsive Design

The application is fully responsive and tested on:
- **Desktop**: 1920px, 1440px, 1366px, 1024px
- **Tablet**: 768px, 834px
- **Mobile**: 375px, 414px, 390px

### **Breakpoints** (Tailwind defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🧪 Testing the Frontend

### **With Mock Backend**
You can test the frontend even before the backend is ready:

1. The frontend will show error states with retry buttons
2. You can inspect network requests in browser DevTools
3. All API calls are logged to the console

### **With Real Backend**
1. Ensure backend is running on the configured URL
2. Start the frontend dev server
3. Login with valid credentials
4. All data should load from the backend automatically

### **Development Tools**
- **React DevTools**: Inspect component tree and props
- **Network Tab**: Monitor API calls and responses
- **Console**: Check for errors and API logs

---

## 🐛 Troubleshooting

### **Port Already in Use**
If port 5173 is busy, Vite will automatically try another port. Check the terminal output for the actual port.

### **API Connection Errors**
1. Check if backend is running
2. Verify `VITE_API_URL` in `.env`
3. Check browser console for CORS errors
4. Ensure backend allows the frontend origin

### **Build Errors**
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Clear Vite cache:
   ```bash
   rm -rf .vite
   ```

### **Recharts Errors**
If you see module resolution errors with Recharts:
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

---

## 🔄 State Management

### **Zustand Store** (`alertStore`)
Simple, lightweight state management for alerts:

```javascript
import useAlertStore from '@/store/alertStore'

// In component
const { alerts, fetchAlerts, resolveAlert } = useAlertStore()
```

**Store Actions**:
- `fetchAlerts()`: Fetch all alerts from API
- `resolveAlert(alertId)`: Manually resolve an alert

---

## 📦 Available Scripts

```json
{
  "dev": "vite",              // Start development server
  "build": "vite build",      // Build for production
  "preview": "vite preview",  // Preview production build
  "lint": "eslint ."          // Run ESLint
}
```

---

## 🤝 Contributing

### **Code Style**
- Follow ESLint rules configured in `eslint.config.js`
- Use Prettier for formatting (if configured)
- Follow React best practices and hooks rules

### **Component Guidelines**
1. Use functional components with hooks
2. Keep components small and focused
3. Extract reusable logic into custom hooks
4. Use TypeScript JSDoc for better IDE support

### **Git Workflow**
1. Create feature branch from `main`
2. Make changes and commit with clear messages
3. Push and create pull request
4. Wait for review and approval

---

## 📝 License

[Add your license here]

---

## 👥 Authors

**Priyobroto Karmakar**
- GitHub: [@PriyobrotoKarmakar](https://github.com/PriyobrotoKarmakar)

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for the beautiful charts
- [Lucide](https://lucide.dev/) for the icon set

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check [API_ENDPOINTS.md](./API_ENDPOINTS.md) for API documentation
- Review the code comments for implementation details

---

**Last Updated**: February 21, 2026