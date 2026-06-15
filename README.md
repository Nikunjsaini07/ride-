# SUG RideShare — Student Bike Ride Sharing

A free ride-sharing app for students of **Shobhit University, Gangoh**. Students
with bikes offer rides to/from campus, and other students request to join. No
payments — just students helping students.

Built with the **MERN** stack (MongoDB, Express, React, Node.js).

## Features

- Email + password signup/login (JWT auth, password show/hide toggle)
- Offer a ride: direction (from/to university), destination, departure time, note
- Find rides: filter by direction, destination, and date, with pagination
- **Smart route matching:** optionally include nearby stops along the same route
- **Interactive map** (OpenStreetMap + OSRM routing):
  - Roads-following route, not a straight line
  - Large modal map view with distance and estimated travel time
  - **Selectable alternative routes** when more than one exists
- Request to join → driver accepts/rejects; one pillion seat per bike
- Seat auto-fills and locks; remaining requests auto-reject when full
- "My Rides" (driver) and "My Requests" (rider) dashboards
- **Profile** with ride history (offered + taken) and a **star rating system**
- Toast notifications throughout
- Contact details shared once a request is accepted

## Project structure

```
server/   Node + Express + MongoDB API (JWT, helmet, rate limiting, compression)
client/   React (Vite) + React Router + Axios + React-Leaflet
```

## Prerequisites

- Node.js 18+
- A MongoDB database (local, or a free cluster on MongoDB Atlas)

> **Note on Atlas + restricted networks:** if `mongodb+srv://` fails with
> `querySrv ECONNREFUSED/ETIMEOUT`, your network is blocking DNS SRV lookups.
> Use the **standard** connection string instead (Atlas → Connect → "I'll use a
> driver" → there's a non-SRV option, or build it as
> `mongodb://host1:27017,host2:27017,host3:27017/db?ssl=true&replicaSet=...&authSource=admin`).

## Local setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # then edit values
npm run seed           # optional sample data (incl. a past ride to test ratings)
npm run dev            # or: npm start
```

Seeded logins:
- Driver: `aman@example.com` / `password123`
- Passenger: `rohit@example.com` / `password123`

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. API calls proxy to the backend on port 5000.

## Environment variables (`server/.env`)

| Var          | Description                                            |
| ------------ | ------------------------------------------------------ |
| `PORT`       | API port (default 5000)                                |
| `NODE_ENV`   | `development` or `production`                          |
| `MONGO_URI`  | MongoDB connection string                              |
| `JWT_SECRET` | Long random secret for signing tokens                  |
| `CLIENT_URL` | Comma-separated allowed CORS origins                   |
| `DNS_SERVERS`| Optional public DNS for `mongodb+srv://` lookups       |

## Production build & deploy

The server can serve the built client directly:

```bash
cd client && npm run build      # outputs client/dist
cd ../server
# set NODE_ENV=production and CLIENT_URL to your domain in .env
npm start
```

When `NODE_ENV=production`, Express serves `client/dist` and routes all
non-API paths to the SPA. Point your host (Render, Railway, Fly.io, a VPS, etc.)
at the `server` process and set the environment variables there.

Production hardening included:
- `helmet` security headers, `compression`, request logging (`morgan`)
- Rate limiting (global + stricter on auth routes)
- Centralized error handling with no stack traces in production
- MongoDB indexes on common queries + paginated search
- Graceful shutdown on SIGTERM/SIGINT

## API overview

| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| POST   | `/api/auth/register`         | Create account               |
| POST   | `/api/auth/login`            | Login                        |
| GET    | `/api/auth/me`               | Current user                 |
| PUT    | `/api/auth/me`               | Update profile               |
| GET    | `/api/meta`                  | Hub + destinations (w/ coords)|
| POST   | `/api/rides`                 | Offer a ride                 |
| GET    | `/api/rides/search`          | Search rides (filters + page)|
| GET    | `/api/rides/mine`            | Rides I'm driving            |
| DELETE | `/api/rides/:id`             | Cancel a ride                |
| POST   | `/api/requests`              | Request to join a ride       |
| GET    | `/api/requests/mine`         | My join requests             |
| GET    | `/api/requests/incoming`     | Requests for my rides        |
| PUT    | `/api/requests/:id/respond`  | Accept / reject a request    |
| PUT    | `/api/requests/:id/cancel`   | Cancel my request            |
| POST   | `/api/ratings`               | Rate a past ride partner     |
| GET    | `/api/ratings/user/:userId`  | Ratings received by a user   |
| GET    | `/api/profile/me`            | History, stats, ratings      |

## Notes

- Destinations and their coordinates live in `server/config/locations.js`.
- Route matching uses an `order` value per destination so adjacent stops on the
  same road can be matched when "include nearby stops" is on.
- Maps use OpenStreetMap tiles and the public OSRM routing service (no API key).
  For heavy production traffic, self-host OSRM or use a paid routing provider.
```
