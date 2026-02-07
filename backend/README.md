# Sports Event Manager – Backend API

Node.js + Express API with JWT (admin), Socket.IO (live viewers), Redis, PostgreSQL.

## Setup

1. **Environment**
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`

2. **Database**
   - Create PostgreSQL database
   - Run `../database/schema.sql`

3. **Install & run**
   ```bash
   npm install
   npm run dev
   ```
   API: `http://localhost:5000/api`

## API Base: `/api`

### Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/events` | List events (with live/total viewers, sports count) |
| GET | `/events/:eventId` | Get event by id |
| GET | `/events/:eventId/dashboard` | Event dashboard (sports, points table) |
| GET | `/sports/event/:eventId` | List sports in event (?category=men\|women) |
| GET | `/sports/:sportId` | Get sport by id |
| GET | `/matches/sport/:sportId` | List matches (?status=upcoming\|live\|completed) |
| GET | `/matches/sport/:sportId/playoffs` | Playoff matches |
| GET | `/matches/:matchId` | Get match by id |
| GET | `/teams` | (Admin only) List teams owned by current admin (?search=...) |
| GET | `/teams/event/:eventId` | Teams in event |
| GET | `/teams/:teamId` | Get team by id |
| GET | `/points/sport/:sportId` | Sport points table (IPL style) |
| GET | `/points/event/:eventId` | Event points table (Olympics style) |

### Admin (Bearer JWT required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/admin/login` | Body: `{ username, password }` → `{ token, admin }` |
| POST | `/admin/create` | Create admin (body: username, password) |
| POST | `/events` | Create event |
| PATCH | `/events/:eventId` | Update event |
| DELETE | `/events/:eventId` | Delete event |
| POST | `/sports` | Create sport (event_id, category, name, playoff_format) |
| PATCH | `/sports/:sportId` | Update sport |
| DELETE | `/sports/:sportId` | Delete sport |
| POST | `/sports/:sportId/playoffs/generate` | Auto-generate playoff matches |
| POST | `/matches` | Create match |
| PATCH | `/matches/:matchId` | Update match (status, scores, winner, live_stream_url) |
| DELETE | `/matches/:matchId` | Delete match |
| POST | `/teams` | Create team |
| PATCH | `/teams/:teamId` | Update team |
| DELETE | `/teams/:teamId` | Delete team |
| POST | `/teams/event/:eventId/team/:teamId` | Add team to event |
| DELETE | `/teams/event/:eventId/team/:teamId` | Remove team from event |
| PUT | `/points/sport/:sportId/team/:teamId` | Update sport points row (admin-only) |



