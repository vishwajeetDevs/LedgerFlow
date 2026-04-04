# Zorvyn LedgerFlow — Client

A modern React frontend for a finance dashboard system with role-based access control, interactive analytics, and complete transaction management.

Built with React 19, Vite, Tailwind CSS v4, and Axios — designed as a professional SaaS-style application.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 19 | Component-based UI |
| Build Tool | Vite 8 | Fast dev server and production bundling |
| Styling | Tailwind CSS v4 | Utility-first CSS framework |
| Routing | React Router DOM v7 | Client-side routing with nested layouts |
| HTTP Client | Axios | API communication with interceptors |
| Font | Inter (Google Fonts) | Clean, modern typography |

---

## Project Structure

```
client/
├── .env                          # Environment variables (API base URL)
├── .gitignore
├── index.html                    # HTML entry point
├── package.json
├── vite.config.js                # Vite + React + Tailwind plugin config
└── src/
    ├── main.jsx                  # React entry — renders App inside AuthProvider
    ├── App.jsx                   # Root component — routing and layout
    ├── index.css                 # Tailwind imports + custom animations
    ├── api/
    │   ├── axios.js              # Axios instance with baseURL and auth interceptor
    │   ├── dashboardApi.js       # Dashboard summary and category API calls
    │   ├── recordApi.js          # Record CRUD API calls
    │   └── userApi.js            # User management API calls
    ├── components/
    │   ├── ConfirmModal.jsx      # Reusable confirmation dialog (ban, delete)
    │   ├── DatePicker.jsx        # Custom date picker with month/year selection
    │   ├── Modal.jsx             # Reusable animated modal wrapper
    │   ├── Navbar.jsx            # Top navigation bar with role-based links
    │   ├── Pagination.jsx        # Reusable pagination with arrow buttons
    │   ├── Toast.jsx             # Toast notification system (success/error/info)
    │   └── Tooltip.jsx           # Hover tooltip component
    ├── context/
    │   └── AuthContext.jsx       # Auth state — token, user, login/logout
    ├── layouts/
    │   └── MainLayout.jsx        # App shell — Navbar + content area
    ├── pages/
    │   ├── Login.jsx             # Login form with password toggle
    │   ├── Register.jsx          # Registration form with role selection
    │   ├── Dashboard.jsx         # Analytics dashboard with charts and summaries
    │   ├── Records.jsx           # Transaction list with CRUD modals, filters, sort
    │   ├── CreateRecord.jsx      # Standalone create record page (viewer flow)
    │   ├── EditRecord.jsx        # Standalone edit record page (viewer flow)
    │   ├── Users.jsx             # User management table (admin/analyst)
    │   └── Unauthorized.jsx      # 403 error page
    ├── routes/
    │   └── ProtectedRoute.jsx    # Auth guard with role-based access control
    └── utils/
        └── categories.js         # Category ID-to-name mapping and helpers
```

### Architecture

```
App.jsx
├── AuthProvider (context)
├── ToastContainer (global notifications)
├── BrowserRouter
│   ├── /login        → Login
│   ├── /register     → Register
│   ├── /unauthorized → Unauthorized
│   └── / (ProtectedRoute + MainLayout)
│       ├── /dashboard        → Dashboard
│       ├── /records          → Records (Transactions)
│       ├── /records/create   → CreateRecord
│       ├── /records/edit/:id → EditRecord
│       └── /users            → Users
```

---

## Setup

### Prerequisites

- Node.js (v18+)
- Backend server running (see `server/README.md`)

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Configure environment

Create a `.env` file in the `client/` root:

```
VITE_API_URL=http://localhost:5001
```

This should match the PORT in your server's `.env` file.

### 3. Start the development server

```bash
npm run dev
```

App runs at `http://localhost:5173`

### 4. Build for production

```bash
npm run build
```

Output is generated in the `dist/` folder.

---

## Features

### Authentication

- **Login** — Email/password form with show/hide toggle, toast error messages
- **Register** — Name, email, password, role selection (Viewer/Analyst/Admin)
- **JWT token** stored in localStorage, auto-attached to all API requests via Axios interceptor
- **Protected routes** — Unauthenticated users redirected to `/login`
- **Logged-in redirect** — Login/Register pages redirect to `/dashboard` if already authenticated
- **Banned user handling** — Descriptive toast message on login attempt

### Dashboard

- **Role-scoped data** — Viewer sees personal data; Analyst/Admin sees system-wide aggregates
- **Summary cards** — Gross Revenue / Total Income, Total Outflow / Total Expense, Net Position / Net Balance (labels adapt to role)
- **Category breakdown** — Income and expense by category with colored progress bars
- **Overview panel** — Expense ratio and savings rate with visual indicators
- **Latest transactions** — Recent 6 records with "View all" link to Transactions page
- **User growth chart** (Admin only) — Interactive SVG line chart with hover tooltips, scroll-to-zoom (2-6 months), draw-in animation
- **User stats** (Admin only) — Total users, role breakdown, active/inactive counts

### Transactions (Records)

- **Full CRUD** — Create, edit, delete via animated modals (admin) or separate pages (viewer)
- **Role-based visibility** — Viewer sees own records; Analyst/Admin sees all with "User" column
- **Ownership enforcement** — Edit/Delete buttons only appear on records the user can modify
- **Search** — Real-time search across notes, category, and user name
- **Filters** — Type (income/expense), category, date range via custom DatePicker
- **Sorting** — Newest first, Oldest first, Amount high-to-low, Amount low-to-high
- **Pagination** — 10 per page with circular arrow buttons and 3-page sliding window
- **Inline validation** — Toast errors for missing amount, category, or date before API call
- **In-place updates** — Edited records stay in position without re-fetching or reordering

### User Management

- **User table** — Name, email, role badge, active/inactive status
- **Search** — Filter by name or email in real-time
- **Filters** — By role (Viewer/Analyst/Admin) and status (Active/Inactive)
- **Edit modal** — Change name, email, role, status
- **Change password** — Key icon button opens modal with show/hide toggle
- **Ban/Unban** — Icon buttons with confirm modal for ban, instant action for unban
- **Pagination** — Same reusable component as Transactions
- **Role restrictions** — Analyst sees read-only table; Admin sees full action icons with tooltips

---

## Reusable Components

| Component | Props | Description |
|-----------|-------|-------------|
| `Modal` | `open`, `onClose`, `maxWidth`, `children` | Animated modal with open/close transitions and backdrop click |
| `ConfirmModal` | `open`, `title`, `message`, `confirmLabel`, `confirmColor`, `onConfirm`, `onCancel` | Confirmation dialog built on Modal |
| `Toast` | Global `toast.success()`, `toast.error()`, `toast.info()` | Top-center notification system with auto-dismiss |
| `DatePicker` | `value`, `onChange`, `placeholder` | Custom calendar with day/month/year views, portal-rendered |
| `Pagination` | `currentPage`, `totalPages`, `onPageChange` | Circular buttons with hover effects and sliding window |
| `Tooltip` | `text`, `children` | Dark tooltip on hover with arrow indicator |

---

## Role-Based UI

| Feature | Viewer (1) | Analyst (2) | Admin (3) |
|---------|-----------|------------|----------|
| Dashboard labels | Personal (Total Income) | System-wide (Gross Revenue) | System-wide (Gross Revenue) |
| Dashboard data | Own records | All users | All users |
| User growth chart | Hidden | Hidden | Visible |
| Navbar links | Dashboard, Transactions | Dashboard, Transactions, Users | Dashboard, Transactions, Users |
| Transactions table | Own records only | All records (read-only) | All records (full actions) |
| Create transaction | Yes (modal) | Yes (modal) | Yes (modal) |
| Edit/Delete actions | Own records only | Hidden | Any record (via modal) |
| Users page | No access | Read-only table | Full management (edit, ban, password) |

---

## API Integration

All API calls go through `src/api/axios.js` which:
- Sets `baseURL` from `VITE_API_URL` environment variable
- Auto-attaches `Authorization: Bearer <token>` header from localStorage
- Returns `response.data` (the standardized API response)

| File | Endpoints |
|------|----------|
| `dashboardApi.js` | `GET /dashboard/summary`, `GET /dashboard/category-summary` |
| `recordApi.js` | `GET /records`, `POST /records`, `PUT /records/:id`, `DELETE /records/:id`, `GET /records/filter` |
| `userApi.js` | `GET /users`, `PUT /users/:id`, `PATCH /users/:id/password`, `DELETE /users/:id` |

---

## Animations

Custom CSS animations defined in `index.css`:

| Animation | Usage | Duration |
|-----------|-------|----------|
| `animate-fade-in-up` | Page sections, cards (staggered) | 0.4s |
| `animate-fade-in` | Tooltips, toasts, overlays | 0.3s |
| `animate-modal-content` | Modal open (scale + slide) | 0.25s |
| `animate-modal-content-out` | Modal close (scale + slide) | 0.2s |
| `chart-line` | SVG line draw-in | 0.5s |
| `chart-area` | SVG area fade-in | 0.3s |
| `chart-dot` | Chart dot pop-in (staggered) | 0.15s |

Stagger delays (`stagger-1` through `stagger-5`) create cascading entrance effects.

---

## Assumptions

- The backend API is running and accessible at the URL specified in `.env`
- JWT tokens are stored in localStorage and persist across browser sessions until logout or expiry
- Category IDs (1-10) are pre-seeded in the backend and mapped to names on the frontend via `utils/categories.js`
- Transaction dates from the API arrive in DD-MM-YYYY format and are converted to YYYY-MM-DD for date inputs
- `created_at` timestamps are kept as raw ISO strings for accurate sorting by creation time
- The DatePicker component uses a portal to avoid overflow clipping issues inside modals and tables
- Role-based UI rendering is done client-side based on the `role` field stored in AuthContext; backend still enforces access on every API call

## Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| **Tailwind CSS v4** | Utility-first approach enables rapid UI development, but creates verbose className strings |
| **Client-side filtering and sorting** | Instant response without API calls, but loads all records into memory upfront |
| **localStorage for auth** | Simple persistence across sessions, but vulnerable to XSS (mitigated by no inline scripts) |
| **Custom DatePicker over native** | Consistent cross-browser UI with month/year selection, but adds component complexity |
| **Portal-rendered dropdowns** | Avoids overflow clipping in modals/tables, but requires manual positioning logic |
| **Toast over inline errors** | Cleaner forms without error divs, but notifications can be missed if user isn't looking at top of screen |
| **Modals for CRUD (admin)** | Keeps user on the same page, but modals can feel cramped on small screens |
| **Separate pages for CRUD (viewer)** | Full-screen form for better focus, but navigates away from the records list |
| **SVG chart without library** | Zero dependencies and full control, but limited to simple line/area charts |
| **Inter font via Google Fonts CDN** | No build step needed, but requires internet connection for first load |
