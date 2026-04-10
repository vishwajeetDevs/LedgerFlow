# Zorvyn LedgerFlow — Server

A RESTful API backend for managing personal and organizational financial records (income/expense tracking) with role-based access control, JWT authentication, dashboard analytics, and user management.

Built as a clean, layered Node.js + Express + PostgreSQL application following separation of concerns.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js (ES Modules) | Server-side JavaScript |
| Framework | Express 5 | HTTP routing and middleware |
| Database | PostgreSQL | Relational data storage |
| DB Driver | pg (node-postgres) | Raw SQL queries via connection pool |
| Authentication | jsonwebtoken (JWT) | Stateless token-based auth |
| Password Hashing | bcrypt | Secure one-way password hashing |
| Validation | Joi | Request body schema validation |
| Environment | dotenv | Loads `.env` config at runtime |
| CORS | cors | Cross-origin request handling |
| Dev Tooling | nodemon | Auto-restart on file changes |

---

## Project Structure

```
server/
├── .env                          # Environment variables (not committed)
├── .gitignore                    # Ignores node_modules/ and .env
├── package.json                  # Dependencies and scripts
├── README.md
└── src/
    ├── index.js                  # Entry point — Express app setup, middleware, routes, server start
    ├── config/
    │   └── db.js                 # PostgreSQL connection pool (pg.Pool)
    ├── routes/
    │   ├── userRoutes.js         # Auth + User management routes
    │   ├── recordRoutes.js       # CRUD /api/records
    │   └── dashboardRoutes.js    # Dashboard analytics routes
    ├── controllers/
    │   ├── userController.js     # Handles user auth and management
    │   ├── recordController.js   # Handles record CRUD with role-based scoping
    │   └── dashboardController.js# Handles dashboard analytics
    ├── services/
    │   ├── userService.js        # User business logic (hashing, ban check, password change)
    │   ├── recordService.js      # Record business logic with ownership validation
    │   └── dashboardService.js   # Computes role-scoped income, expense, balance
    ├── models/
    │   ├── userModel.js          # SQL queries for tbl_users
    │   ├── recordModel.js        # SQL queries for tbl_records (own + system-wide)
    │   └── dashboardModel.js     # Aggregation queries (per-user + system-wide)
    ├── middlewares/
    │   ├── authMiddleware.js     # Verifies JWT token, attaches user to req
    │   ├── roleMiddleware.js     # Restricts access by role ID
    │   └── errorMiddleware.js    # 404 handler + global error handler
    ├── validations/
    │   ├── userValidation.js     # Joi schemas for register, login, update, password change
    │   └── recordValidation.js   # Joi schemas for record create/update
    └── utils/
        ├── apiResponse.js        # Standardized success/error response helpers
        ├── formatDate.js         # Formats transaction dates to DD-MM-YYYY
        └── generateToken.js      # Signs JWT tokens with user ID and role
```

### Architecture Pattern

The project follows a **layered architecture** with clear separation of concerns:

```
Request → Route → Controller → Service → Model → Database
                      ↑              ↑
                 Validation      Business Logic
```

| Layer | Responsibility |
|-------|---------------|
| **Routes** | Define API endpoints and attach middleware (auth + role guards) |
| **Controllers** | Parse request, validate input, call service, send response |
| **Services** | Business logic — hashing, ownership checks, role-based data scoping |
| **Models** | Raw SQL queries against PostgreSQL via pg pool |
| **Middlewares** | Cross-cutting concerns — JWT auth, role-based access, error handling |
| **Validations** | Joi schemas to validate request body before processing |
| **Utils** | Shared helpers — token generation, date formatting, response wrappers |

---

## Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL running on your machine
- A database named `zorvyn-ledgerflow` created in PostgreSQL

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment

Create a `.env` file in the `server/` root:

**For local development (Docker PostgreSQL):**

```
PORT=5001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=zorvyn-ledgerflow
DB_PASSWORD=your_password
DB_PORT=5433
JWT_SECRET=your_jwt_secret_key
```

**For production / Vercel deployment (Neon cloud PostgreSQL):**

```
PORT=5001
DATABASE_URL=postgresql://neondb_owner:your_password@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

> The application automatically detects `DATABASE_URL` and uses it for cloud connections with SSL. If `DATABASE_URL` is not set, it falls back to the individual `DB_*` variables for local development.

### 3. Database setup

**Option A: Local (Docker PostgreSQL)**
- Use Docker Desktop with PostgreSQL running on port 5433
- Create a database named `zorvyn-ledgerflow`
- Run the table creation SQL (see Database Schema section below)

**Option B: Cloud (Neon — recommended for deployment)**
1. Sign up at [neon.tech](https://neon.tech) (free tier available)
2. Create a new project — a database is automatically provisioned
3. Copy the connection string from the Neon dashboard
4. Set it as `DATABASE_URL` in your `.env` or Vercel environment variables
5. Run the table creation SQL in Neon's SQL Editor

### 4. Start the development server

```bash
npm run dev
```

Server runs at `http://localhost:5001` (or the PORT specified in `.env`)

---

## Database Schema

### tbl_roles

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(50) | UNIQUE, NOT NULL |

Seeded values: `viewer` (1), `analyst` (2), `admin` (3)

### tbl_users

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(255) | — |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL (stored as bcrypt hash) |
| role_id | INT | FK → tbl_roles(id) |
| is_active | BOOLEAN | DEFAULT TRUE (false = banned) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### tbl_record_categories

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| type | VARCHAR(50) | CHECK: 'income' or 'expense' |

| ID | Name | Type |
|----|------|------|
| 1 | Salary | income |
| 2 | Freelance | income |
| 3 | Investment | income |
| 4 | Bonus | income |
| 5 | Other Income | income |
| 6 | Food & Dining | expense |
| 7 | Transportation | expense |
| 8 | Rent | expense |
| 9 | Utilities | expense |
| 10 | Other Expense | expense |

### tbl_records

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| user_id | INT | FK → tbl_users(id) |
| amount | NUMERIC | NOT NULL |
| type | VARCHAR(50) | CHECK: 'income' or 'expense' |
| category_id | INT | FK → tbl_record_categories(id) |
| date | DATE | — |
| notes | TEXT | — |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## API Endpoints

All authenticated endpoints require the header: `Authorization: Bearer <token>`

### Authentication — `/api/users`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/users/register | Register a new user | No |
| POST | /api/users/login | Login and receive JWT token | No |

**Register request:**
```json
{
  "name": "Vishwajeet Singh",
  "email": "justvishu2003@gmail.com",
  "password": "password123",
  "role_id": 3
}
```

**Login request:**
```json
{
  "email": "justvishu2003@gmail.com",
  "password": "password123"
}
```

**Login response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "Vishwajeet Singh",
    "email": "justvishu2003@gmail.com",
    "role_id": 3,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

Banned users receive: `401 — "Your account has been banned. Please contact the administrator."`

### User Management — `/api/users` (Admin/Analyst)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /api/users | List all users (excludes passwords) | Yes | Analyst, Admin |
| PUT | /api/users/:id | Update user (name, email, role, status) | Yes | Admin |
| PATCH | /api/users/:id/password | Change a user's password | Yes | Admin |
| DELETE | /api/users/:id | Ban user (soft delete: sets is_active=false) | Yes | Admin |

**Update user request:**
```json
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "role_id": 2,
  "is_active": true
}
```

**Change password request:**
```json
{
  "newPassword": "newSecurePassword"
}
```

### Records — `/api/records`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | /api/records | Create a financial record | Yes | All |
| GET | /api/records | Get records (scope depends on role) | Yes | All |
| GET | /api/records/filter | Filter records by query params | Yes | All |
| PUT | /api/records/:id | Update a record (ownership enforced) | Yes | All |
| DELETE | /api/records/:id | Delete a record (ownership enforced) | Yes | All |

**Data scoping by role:**
- **Viewer** — GET returns only own records
- **Analyst** — GET returns all records across all users (with user_name)
- **Admin** — GET returns all records across all users (with user_name)

**Ownership enforcement:**
- **Viewer/Analyst** — Can only update/delete their own records (returns 403 if not owner)
- **Admin** — Can update/delete any record without ownership restriction

**Create record request:**
```json
{
  "amount": 50000,
  "type": "income",
  "category_id": 1,
  "date": "2026-04-03",
  "notes": "Monthly salary credited"
}
```

**Filter query params:** `?category_id=1&type=income&startDate=2026-01-01&endDate=2026-04-03`

**Validation rules (Joi):**
- `amount` — required, must be a number
- `type` — required, must be `"income"` or `"expense"`
- `category_id` — required, must be an integer matching tbl_record_categories
- `date` — required, valid date
- `notes` — optional, can be empty or null

### Dashboard — `/api/dashboard`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /api/dashboard/summary | Income, expense, and balance summary | Yes | All |
| GET | /api/dashboard/category-summary | Category-wise income/expense totals | Yes | All |

**Data scoping by role:**
- **Viewer** — Returns summary for own records only
- **Analyst/Admin** — Returns system-wide summary across all users

**Summary response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard summary fetched successfully",
  "data": {
    "totalIncome": 2956852,
    "totalExpense": 468433,
    "balance": 2488419
  }
}
```

**Category summary response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category summary fetched successfully",
  "data": [
    { "categoryId": 1, "categoryName": "Salary", "type": "income", "total": 1984080 },
    { "categoryId": 6, "categoryName": "Food & Dining", "type": "expense", "total": 57020 }
  ]
}
```

---

## Response Format

All API responses follow a standardized structure.

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Records fetched successfully",
  "data": [ ... ]
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "\"amount\" is required"
}
```

---

## Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (user or record created) |
| 400 | Bad Request | Joi validation failed (missing/invalid fields) |
| 401 | Unauthorized | No token, expired/invalid token, wrong credentials, or banned account |
| 403 | Forbidden | Valid token but user lacks permission (wrong role or not record owner) |
| 404 | Not Found | Record/user doesn't exist, or route doesn't match |
| 409 | Conflict | Email already registered |
| 500 | Internal Server Error | Unhandled exception (DB error, etc.) |

---

## Authentication Flow

1. **Register** — `POST /api/users/register` with name, email, password, role_id. Password is hashed with bcrypt (10 salt rounds) before storing.
2. **Login** — `POST /api/users/login` verifies credentials, checks if user is banned, and returns a JWT token with user details.
3. **Access protected routes** — include `Authorization: Bearer <token>` header. The `authMiddleware` decodes the token and attaches `{ id, role }` to `req.user`.
4. **Role-based access** — `roleMiddleware.allowRoles(1, 2, 3)` restricts endpoints to specific role IDs.
5. **Ownership validation** — For record updates/deletes, the service layer verifies the requesting user owns the record (unless admin).

**JWT payload structure:**
```json
{
  "id": 1,
  "role": 3,
  "iat": 1775214307,
  "exp": 1775300707
}
```

Token expires in **24 hours** (`1d`).

---

## Roles & Permissions

| Feature | Viewer (1) | Analyst (2) | Admin (3) |
|---------|-----------|------------|----------|
| Dashboard summary | Own data | System-wide | System-wide |
| Category breakdown | Own data | System-wide | System-wide |
| View records | Own only | All users | All users |
| Create records | Yes (own) | No (read-only) | No (read-only) |
| Edit/Delete records | Own only | No | Any record (edit/delete only) |
| View user list | No | Read-only | Full access |
| Edit users | No | No | Yes |
| Ban/Unban users | No | No | Yes |
| Change user passwords | No | No | Yes |
| Delete users | No | No | Yes |

> **Note:** During registration, all three roles (Viewer, Analyst, Admin) are available for selection. This is temporarily enabled for testing and demonstration purposes. In the final production version, only the Viewer role will be available during signup. Admin and Analyst roles will be assigned by an Admin.
>
> **Record creation is restricted to Viewer role only.** Viewers are the end users who create and manage their own financial records. Admins and Analysts have read-only access to records — they can view, track, and analyze reports but cannot create new records.

**Viewer** — An individual user who manages their own financial records. Can create, view, update, and delete their own entries. Dashboard shows personal income, expense, and balance. Cannot see any other user's data.

**Analyst** — A data reader with broad visibility. Can read all records across the system for analysis and filtering. Can still create and manage their own records. Dashboard shows system-wide aggregates. Can view the user list (read-only) but cannot modify users.

**Admin** — Full system-level control. Can read, create, update, and delete any record from any user. Full user management including editing profiles, banning/unbanning accounts, and changing passwords. Dashboard shows system-wide analytics with user growth charts.

---

## Assumptions

- Records are scoped by ownership. Viewers and analysts can only modify their own records. Admins can modify any record.
- Dashboard data is scoped by role. Viewers see personal data; analysts and admins see system-wide aggregates.
- Passwords are never returned in API responses. They are hashed with bcrypt before storage.
- The `category_id` must reference an existing entry in `tbl_record_categories`. Categories are pre-seeded (IDs 1-10).
- Transaction dates are returned in **DD-MM-YYYY** format. `created_at` timestamps are returned as raw ISO strings for accurate sorting.
- Banned users (is_active = false) cannot log in. They receive a descriptive error message.
- No ORM is used — all database operations use raw SQL via the `pg` driver for full control over queries.

## Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| **Raw SQL over ORM** | More control and performance, but requires manual query writing and no auto-migrations |
| **Layered architecture** | Clean separation of concerns and testability, but adds more files for simple operations |
| **JWT (stateless auth)** | No server-side session storage needed, but tokens can't be revoked until they expire |
| **bcrypt for hashing** | Industry-standard security, but slightly slower than alternatives (by design — prevents brute force) |
| **Joi validation in controllers** | Keeps validation close to the request handling, but could be extracted to middleware for reuse |
| **Pre-seeded categories** | Simplifies frontend integration, but limits flexibility for user-defined categories |
| **Role-based data scoping in service layer** | Clean separation from routes, but requires passing role through controller to service |
| **Soft delete for banning** | Preserves user data and allows unbanning, but requires is_active checks on login |
| **Ownership check in service layer** | Enforced at business logic level (not middleware), keeping routes clean but adding service complexity |
| **Transaction dates in DD-MM-YYYY** | Human-readable format, but ISO (YYYY-MM-DD) is better for sorting — mitigated by keeping created_at as ISO |
