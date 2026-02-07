# Sports Event Manager – Frontend

Next.js 14 (App Router), Tailwind CSS, Framer Motion, Socket.IO client. Mobile-first, dark theme.

## Setup

1. **Environment**
   - Copy `.env.example` to `.env.local`
   - Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` (e.g. `http://localhost:5000/api` and `http://localhost:5000`)

2. **Install & run**
   ```bash
   npm install
   npm run dev
   ```
   App: [http://localhost:3000](http://localhost:3000)

## Pages

- **/** – Events list (Cricheroes style): event cards with banner, date range, sports count, live/total viewers
- **/[eventId]** – Event dashboard: banner, Overview / Sports / Points Table tabs; live viewers via Socket.IO
- **/[eventId]/sport/[sportId]** – Sport detail: Matches / Points Table / Playoffs tabs (IPL style)
- **/admin** – Admin home (login required)
- **/admin/login** – Admin login
- **/admin/events** – List events, create new event
- **/admin/teams** – List teams, create new team
- **/admin/matches** – Filter by event/sport, list matches

## Features

- Mobile-first layout, bottom nav (Events / Admin), sticky tabs
- Dark theme, card-based UI, smooth transitions (Framer Motion)
- Live viewers per event (Socket.IO + Redis)
- Admin: JWT auth, create events/teams; matches managed per sport
- No login required for public pages

## Build

```bash
npm run build
npm start
```
