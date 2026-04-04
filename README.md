# Zorvyn LedgerFlow

A full-stack finance dashboard application for managing financial records (income/expense tracking) with role-based access control, interactive analytics, user management, and a modern responsive UI.

Built as a production-ready monorepo with a layered Node.js backend and a React frontend.

---

## Live Architecture

```
zorvyn-ledgerflow/
├── server/          # Backend — Node.js + Express + PostgreSQL
├── client/          # Frontend — React + Vite + Tailwind CSS
└── README.md        # This file
```

**Data Flow:**

```
Browser (React SPA)
    ↕ Axios (JWT in header)
Express API Server
    ↕ Raw SQL via pg pool
PostgreSQL Database
```

---

## Tech Stack

### Backend (server/)

| Technology | Purpose |
|-----------|---------|
| Node.js (ES Modules) | Runtime |
| Express 5 | REST API framework |
| PostgreSQL | Relational database |
| pg (node-postgres) | Database driver |
| JWT (jsonwebtoken) | Stateless authentication |
| bcrypt | Password hashing |
| Joi | Request validation |
| dotenv | Environment config |
| cors | Cross-origin support |

### Frontend (client/)

| Technology | Purpose |
|-----------|---------|
| React 19 | Component-based UI |
| Vite 8 | Build tool and dev server |
| Tailwind CSS v4 | Utility-first styling |
| React Router DOM v7 | Client-side routing |
| Axios | HTTP client with interceptors |
| Inter (Google Fonts) | Typography |

---

## Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL — either local (Docker) or cloud ([Neon](https://neon.tech) free tier)

### 1. Clone and setup the backend

```bash
cd server
npm install
```

Create `server/.env`:

**Local development:**
```
PORT=5001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=zorvyn-ledgerflow
DB_PASSWORD=your_password
DB_PORT=5433
JWT_SECRET=your_jwt_secret_key
```

**Cloud deployment (Neon):**
```
PORT=5001
DATABASE_URL=postgresql://neondb_owner:your_password@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

Create the following tables in PostgreSQL:

| Table | Column | Type | Constraints |
|-------|--------|------|-------------|
| **tbl_roles** | id | SERIAL | PRIMARY KEY |
| | name | VARCHAR(50) | UNIQUE, NOT NULL |
| **tbl_users** | id | SERIAL | PRIMARY KEY |
| | name | VARCHAR(255) | |
| | email | VARCHAR(255) | UNIQUE, NOT NULL |
| | password | VARCHAR(255) | NOT NULL (bcrypt hash) |
| | role_id | INT | FK → tbl_roles(id) |
| | is_active | BOOLEAN | DEFAULT TRUE |
| | created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| **tbl_record_categories** | id | SERIAL | PRIMARY KEY |
| | name | VARCHAR(100) | UNIQUE, NOT NULL |
| | type | VARCHAR(50) | CHECK: income / expense |
| **tbl_records** | id | SERIAL | PRIMARY KEY |
| | user_id | INT | FK → tbl_users(id) |
| | amount | NUMERIC | NOT NULL |
| | type | VARCHAR(50) | CHECK: income / expense |
| | category_id | INT | FK → tbl_record_categories(id) |
| | date | DATE | |
| | notes | TEXT | |
| | created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Seeded data:**
- Roles: `viewer` (1), `analyst` (2), `admin` (3)
- Categories: Salary, Freelance, Investment, Bonus, Other Income, Food & Dining, Transportation, Rent, Utilities, Other Expense

Refer to `server/README.md` for the full SQL creation script.

Start the server:

```bash
npm run dev
```

Server runs at `http://localhost:5001`

### 2. Setup the frontend

```bash
cd client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:5001
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Application Flow

### Authentication

1. User registers at `/register` with name, email, password, and role selection
2. User logs in at `/login` with email and password
3. Server validates credentials, checks ban status, and returns JWT token + user data
4. Token is stored in localStorage and auto-attached to all API requests
5. Protected routes check token existence and role permissions
6. Banned users receive a descriptive error message and cannot log in

### Role-Based Access Control

The system enforces RBAC at both backend (middleware) and frontend (route guards + UI) levels.

| Feature | Viewer (1) | Analyst (2) | Admin (3) |
|---------|-----------|------------|----------|
| Dashboard data scope | Own records | System-wide | System-wide |
| View records | Own only | All users | All users |
| Create records | Yes | Yes | Yes |
| Edit/Delete records | Own only | Own only | Any record |
| User list | No access | Read-only | Full management |
| Ban/Unban users | No | No | Yes |
| Change passwords | No | No | Yes |
| User growth analytics | No | No | Yes |
| Dark mode | Yes | Yes | Yes |
| Documentation page | Own role | Own role | Own role |

### Data Ownership

- **Viewer** sees and manages only their own financial records. Dashboard shows personal income, expense, and balance.
- **Analyst** can read all records across the system for analysis but can only create/edit/delete their own. Dashboard shows system-wide aggregates.
- **Admin** has unrestricted access. Can modify any record, manage any user, view system-wide analytics with user growth charts.

Ownership is enforced in the backend service layer. If a viewer or analyst tries to modify another user's record, the API returns `403 Forbidden`.

---

## API Endpoints

Base URL: `http://localhost:5001/api`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /users/register | No | Register new user |
| POST | /users/login | No | Login and receive JWT |

### User Management

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /users | Yes | 2, 3 | List all users |
| PUT | /users/:id | Yes | 3 | Update user profile |
| PATCH | /users/:id/password | Yes | 3 | Change user password |
| DELETE | /users/:id | Yes | 3 | Ban user (soft delete) |

### Financial Records

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /records | Yes | All | Get records (scope by role) |
| GET | /records/filter | Yes | All | Filter records by params |
| POST | /records | Yes | All | Create record |
| PUT | /records/:id | Yes | All | Update record (ownership enforced) |
| DELETE | /records/:id | Yes | All | Delete record (ownership enforced) |

### Dashboard Analytics

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /dashboard/summary | Yes | All | Income, expense, balance (scope by role) |
| GET | /dashboard/category-summary | Yes | All | Category-wise totals (scope by role) |

---

## Frontend Features

### Pages

- **Login** -- Email/password with show/hide toggle, toast errors, banned user handling
- **Register** -- Full form with role selection, redirects to login on success
- **Dashboard** -- Role-scoped analytics with summary cards, category breakdowns, latest transactions, user growth chart (admin), user stats (admin)
- **Transactions** -- Paginated table with search, filters (type, category, date range), sorting (date, amount), CRUD via modals, role-based action visibility
- **Users** -- Paginated table with search, filters (role, status), edit modal, change password modal, ban/unban with icon buttons and tooltips
- **Documentation** -- Role-specific permissions guide with colored cards
- **Unauthorized** -- 403 error page with go-back button

### Reusable Components

- **Modal** -- Animated open/close with backdrop click
- **ConfirmModal** -- Confirmation dialog for destructive actions
- **Toast** -- Top-center notification system (success/error/info)
- **DatePicker** -- Custom calendar with day/month/year views, portal-rendered, dark mode support
- **Pagination** -- Circular buttons with hover effects
- **Tooltip** -- Dark hover tooltip with arrow indicator

### UI/UX

- **Dark mode** -- System-preference aware, toggle in navbar, persisted in localStorage
- **Animations** -- Page entrance animations, staggered card reveals, chart draw-in effects, modal open/close transitions
- **Responsive** -- Mobile hamburger menu, responsive grids
- **Inter font** -- Clean typography via Google Fonts
- **Custom favicon** -- Used as logo throughout the app

---

## Backend Architecture

```
Request --> Route --> Controller --> Service --> Model --> Database
                         |               |
                    Validation       Business Logic
                    (Joi)            (hashing, ownership, scoping)
```

| Layer | Responsibility |
|-------|---------------|
| Routes | Define endpoints, attach auth + role middleware |
| Controllers | Parse request, validate, call service, send response |
| Services | Business logic -- hashing, ownership checks, role-based data scoping |
| Models | Raw SQL queries via pg pool |
| Middlewares | JWT auth, role guards, error handling |
| Validations | Joi schemas for request body validation |

---

## Database Schema

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| tbl_roles | Role definitions | id, name (viewer/analyst/admin) |
| tbl_users | User accounts | id, name, email, password, role_id, is_active, created_at |
| tbl_record_categories | Pre-seeded categories (10) | id, name, type (income/expense) |
| tbl_records | Financial transactions | id, user_id, amount, type, category_id, date, notes, created_at |

---

## Assumptions

- Each user belongs to exactly one role (viewer, analyst, or admin)
- Records are scoped by ownership at the service layer, not the database layer
- Dashboard aggregation for analyst/admin queries all records system-wide
- Categories are pre-seeded (IDs 1-10) and not user-configurable
- JWT tokens expire after 24 hours with no server-side session
- Banned users cannot log in but their data is preserved (soft delete)
- Transaction dates are displayed in DD-MM-YYYY format; created_at kept as ISO for accurate sorting
- The frontend maps category IDs to names client-side via a static mapping file
- No ORM is used -- all database operations are raw SQL for full control

## Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| **Monorepo structure** | Simple to develop and deploy together, but no shared code between client/server |
| **Raw SQL over ORM** | Full control and performance, but manual query writing and no auto-migrations |
| **JWT stateless auth** | No server-side session storage, but tokens can't be revoked until expiry |
| **Client-side filtering/sorting** | Instant UI response, but loads all records into memory |
| **Tailwind CSS v4** | Rapid UI development with utility classes, but verbose className strings |
| **Custom components over libraries** | Zero dependencies for DatePicker/Toast/Modal, but more code to maintain |
| **Portal-rendered dropdowns** | Avoids overflow clipping, but requires manual positioning |
| **localStorage for auth** | Simple persistence, but vulnerable to XSS (mitigated by no inline scripts) |
| **Pre-seeded categories** | Simplifies integration, but limits user customization |
| **Soft delete for banning** | Preserves user data and allows unbanning, but requires is_active checks on login |
| **SVG charts without library** | Zero dependencies and full control, but limited to simple visualizations |
| **Dark mode via CSS custom variant** | Native Tailwind support, but requires dark: prefix on many classes |

---

## Documentation

- **Server README**: See `server/README.md` for detailed API documentation, response formats, status codes, and authentication flow
- **Client README**: See `client/README.md` for component architecture, feature details, animations, and frontend-specific tradeoffs
