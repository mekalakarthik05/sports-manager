# Sports Event Manager – Complete Folder Structure

## Root
```
ssports manager/
├── frontend/              # Next.js app (mobile-first, PWA-capable)
├── backend/               # Node.js + Express API
├── database/              # PostgreSQL schema & migrations
├── STRUCTURE.md           # This file
└── README.md              # Setup instructions (to be added)
```

---

## Frontend (Next.js)
```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing – events list (Cricheroes style)
│   ├── globals.css
│   ├── [eventId]/                  # Event dashboard
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── [eventId]/sport/[sportId]/  # Sport details (IPL style: Matches, Points, Playoffs)
│   │   └── page.tsx
│   └── admin/                      # Admin (mobile-friendly)
│       ├── layout.tsx
│       ├── page.tsx
│       ├── login/
│       ├── events/
│       ├── teams/
│       └── matches/
├── components/
│   ├── ui/                  # Buttons, cards, tabs, inputs
│   ├── events/              # Event cards, event banner
│   ├── sports/              # Sport tabs, points table (card view)
│   ├── matches/             # Match cards, result display
│   ├── points/              # Olympics table, IPL points table
│   ├── layout/              # Bottom nav, sticky tabs, skeleton
│   └── admin/               # Admin forms, tables
├── lib/
│   ├── api.ts               # API client (fetch wrapper)
│   ├── socket.ts            # Socket.IO client
│   └── utils.ts
├── hooks/
│   ├── useSocket.ts
│   ├── useLiveViewers.ts
│   └── useSwipe.ts
├── contexts/
│   ├── SocketContext.tsx
│   └── AuthContext.tsx      # Admin auth only
├── types/
│   └── index.ts             # Shared types
├── styles/
│   └── (Tailwind + overrides)
├── public/
│   ├── icons/               # PWA icons
│   └── manifest.json        # PWA manifest
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

## Backend (Node.js + Express)
```
backend/
├── src/
│   ├── config/
│   │   ├── db.js            # PostgreSQL pool
│   │   ├── redis.js         # Redis client
│   │   └── env.js           # Env validation
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── eventController.js
│   │   ├── sportController.js
│   │   ├── matchController.js
│   │   ├── teamController.js
│   │   ├── pointsController.js
│   │   └── viewerController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT admin auth
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/              # DB query helpers (optional layer)
│   │   ├── admin.js
│   │   ├── event.js
│   │   ├── sport.js
│   │   ├── match.js
│   │   ├── team.js
│   │   ├── sportPoints.js
│   │   └── eventPoints.js
│   ├── routes/
│   │   ├── index.js         # Route aggregator
│   │   ├── adminRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── sportRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── pointsRoutes.js
│   │   └── viewerRoutes.js
│   ├── services/
│   │   ├── adminService.js
│   │   ├── eventService.js
│   │   ├── sportService.js
│   │   ├── matchService.js
│   │   ├── teamService.js
│   │   ├── pointsService.js    # Sport + event points logic
│   │   ├── playoffService.js   # Auto-generate playoff matches
│   │   └── viewerService.js    # Redis live/total viewers
│   ├── socket/
│   │   ├── index.js         # Socket.IO server setup
│   │   └── viewers.js       # Live viewers join/leave, Redis sync
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   └── jwt.js
│   └── app.js               # Express app
├── server.js                # Entry point
├── package.json
├── .env.example
└── ecosystem.config.js      # PM2 (optional)
```

---

## Database
```
database/
├── schema.sql               # Full PostgreSQL schema (UUIDs, FKs, indexes)
└── migrations/              # Optional future migrations
    └── .gitkeep
```

---

## Summary
- **Frontend**: Next.js App Router, Tailwind, Framer Motion, Socket.IO client, mobile-first.
- **Backend**: Express, JWT (admin only), Socket.IO + Redis for live viewers, service-based.
- **Database**: PostgreSQL with UUID PKs, strong FKs, cascading deletes, read-optimized indexes.
