# Sports Manager

Production-ready sports event management platform (IPL/Olympics style). Manage events, sports, teams, matches, and points tables with role-based admin access.

---

## Tech Stack

| Layer    | Stack |
|----------|--------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion |
| Backend  | Node.js, Express, JWT |
| Database | **PostgreSQL only** (Neon recommended) |

**Removed:** Redis, Socket.IO, live viewers — application runs on PostgreSQL only.

---

## Features

- **Public:** Browse events, sports, matches, points tables (read-only).
- **Admin auth:** Single page with Login | Register tabs; session persisted in localStorage.
- **Super admin:** Username `admin` (system-only). Can view, edit, delete **all** events. Cannot be registered via UI.
- **Normal admins:** Register via UI; can manage only **their own** events.
- **Event workflow:** Event → Sports → Teams (added to event) → Matches → Results → Sport points table → Event combined points table.
- **Search:** Debounced search on events, sports, teams, matches (admin and public).
- **UI:** Mobile-first, clean cards, winner highlight (green + trophy), empty states, loading skeletons.

---

## Super Admin (development only)

| Field    | Value       |
|----------|-------------|
| Username | `admin`     |
| Password | `admin@123` |
| Role     | `super_admin` |

Create/update super admin: from `backend/` run:

```bash
node scripts/seedAdmin.js
```

**Never** use these credentials in production. Change password or use a separate super admin in production.

---

## Environment Variables

### Backend (`backend/.env`)

Copy from project root `.env.example` or set:

| Variable      | Required | Description |
|---------------|----------|-------------|
| `DATABASE_URL` | Yes     | PostgreSQL connection string (Neon pooler URL with `?sslmode=require`) |
| `PORT`        | No      | Server port (default `5000`) |
| `JWT_SECRET`  | Yes (prod) | Secret for JWT signing (min 32 chars in production) |
| `JWT_EXPIRES_IN` | No   | Token expiry (default `7d`) |
| `CORS_ORIGIN` | No      | Allowed frontend origin (default `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

| Variable              | Required | Description |
|-----------------------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | No       | Backend API base (default `http://localhost:5000/api`) |

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd "ssports manager"
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database (Neon PostgreSQL)

1. Create a project at [Neon](https://neon.tech) and get the connection string.
2. Use the **pooler** connection string (recommended), e.g.:
   ```
   postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
3. In `backend/.env` set:
   ```
   DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=your-dev-secret-at-least-32-characters
   ```

### 3. Create schema and seed

From project root (with `DATABASE_URL` set):

```bash
# Create tables (use Neon SQL Editor or psql with your connection string)
psql "$DATABASE_URL" -f database/schema.sql

# Run migrations if you have an existing DB (e.g. already had "admin" table)
# psql "$DATABASE_URL" -f database/migrations/002_add_admin_name.sql
# psql "$DATABASE_URL" -f database/migrations/003_add_admin_role.sql

# Seed super admin (admin / admin@123)
cd backend && node scripts/seedAdmin.js
```

### 4. Run backend and frontend

**Terminal 1 – Backend:**

```bash
cd backend
npm run dev
```

API: `http://localhost:5000/api`

**Terminal 2 – Frontend:**

```bash
cd frontend
npm run dev
```

App: `http://localhost:3000`

### 5. Login

- Open `http://localhost:3000/admin/login`
- Super admin: `admin` / `admin@123`
- Or register a new admin (Register tab) and sign in.

---

## Database Schema

- **admins** – id, username, password_hash, name, role (super_admin | admin)
- **events** – id, admin_id, name, banner_url, start_date, end_date
- **teams** – id, admin_id, name, logo_url
- **event_teams** – event_id, team_id (many-to-many)
- **sports** – id, event_id, category (men|women), name, playoff_format
- **matches** – sport_id, team1_id, team2_id, status, scores, winner_team_id
- **sport_points_table** – per-sport standings (P, W, L, Pts)
- **event_points_table** – per-event combined standings (gold, silver, bronze, total_points)

Migrations in `database/migrations/` add ownership and role; run them if your DB was created from an older schema.

---

## Deployment Notes

- **Backend:** Set `NODE_ENV=production`, `DATABASE_URL` (Neon), and a strong `JWT_SECRET`. Use a process manager (e.g. PM2) or host’s Node runtime.
- **Frontend:** Set `NEXT_PUBLIC_API_URL` to your backend API URL. Build with `npm run build`, start with `npm start` or deploy to Vercel/Netlify.
- **Database:** Prefer Neon’s connection pooler for serverless or high concurrency.
- Ensure `.env` and `.env.local` are **never** committed; use `.env.example` as a template.

---

## Screenshots

| View           | Description                    |
|----------------|--------------------------------|
| Public events  | List of events with search     |
| Event dashboard| Sports, points table           |
| Match card     | Score and winner highlight     |
| Admin dashboard| Events (all for super admin)   |

*(Add actual screenshots here when available.)*

---

## Project Structure

```
├── backend/           # Express API
│   ├── server.js
│   ├── src/
│   │   ├── config/   # db, env
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── scripts/
│       └── seedAdmin.js
├── frontend/         # Next.js app
│   ├── app/
│   │   ├── admin/    # Admin auth, events, teams, matches
│   │   └── [eventId]/# Public event & sport pages
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   └── types/
├── database/
│   ├── schema.sql
│   └── migrations/
├── .env.example
├── .gitignore
└── README.md
```

---

## License

Proprietary / MIT (as per your project).
