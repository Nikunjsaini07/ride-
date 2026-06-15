# Deploying SUG RideShare

Architecture for deployment:
- **Backend (Express + MongoDB)** → Render (web service)
- **Frontend (React/Vite)** → Vercel (static site)
- **Database** → MongoDB Atlas (you already use this)

The maps/routing run in the browser (Valhalla/OSRM), so no extra setup there.

---

## 0. Push the code to GitHub

```bash
cd F:\kiro
git init
git add .
git commit -m "SUG RideShare"
git branch -M main
git remote add origin https://github.com/<you>/sug-rideshare.git
git push -u origin main
```

> `.env` files are gitignored — your secrets will NOT be pushed. You'll set them
> in Render/Vercel dashboards instead.

---

## 1. MongoDB Atlas (allow cloud access)

1. In Atlas → **Network Access** → Add IP Address → **Allow from anywhere**
   (`0.0.0.0/0`). Render's IPs are dynamic, so this is the simplest option.
2. Keep your connection string handy (the standard `mongodb://...` one already
   in `server/.env`).

---

## 2. Backend on Render

1. Go to https://render.com → **New** → **Web Service** → connect your repo.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free is fine to start.
3. **Environment Variables** (Add from the dashboard):
   | Key          | Value                                             |
   | ------------ | ------------------------------------------------- |
   | `NODE_ENV`   | `production`                                      |
   | `MONGO_URI`  | your Atlas connection string                      |
   | `JWT_SECRET` | a long random string                              |
   | `CLIENT_URL` | your Vercel URL (add after step 3, e.g. https://sug-rideshare.vercel.app) |
   > Do NOT set `PORT` — Render provides it automatically and the app reads it.
4. Click **Create Web Service**. After it deploys you'll get a URL like
   `https://sug-rideshare-api.onrender.com`.
5. Test it: open `https://<your-render-url>/api/health` → should show `{"status":"ok"}`.

> Free Render services sleep after inactivity; the first request after idle
> takes ~30s to wake. Fine for a student project.

---

## 3. Frontend on Vercel

1. Go to https://vercel.com → **Add New** → **Project** → import your repo.
2. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
3. **Environment Variables:**
   | Key            | Value                                          |
   | -------------- | ---------------------------------------------- |
   | `VITE_API_URL` | `https://<your-render-url>/api`                |
4. Click **Deploy**. You'll get a URL like `https://sug-rideshare.vercel.app`.

---

## 4. Connect the two

1. Copy your Vercel URL.
2. In Render → your service → Environment → set `CLIENT_URL` to that Vercel URL
   (comma-separate if you have multiple, e.g. preview + prod). Save → it redeploys.
3. Done. Open the Vercel URL and use the app.

---

## 5. Seed production data (optional)

To add the sample users/rides to your Atlas DB once:

```bash
# locally, with server/.env pointing at your Atlas MONGO_URI
cd server
npm run seed
```

---

## Troubleshooting

- **CORS error in browser:** `CLIENT_URL` on Render must exactly match your
  Vercel domain (no trailing slash).
- **API calls 404 / go to Vercel:** `VITE_API_URL` wasn't set at build time —
  set it in Vercel env vars and redeploy.
- **Mongo connection fails on Render:** check Atlas Network Access allows
  `0.0.0.0/0` and the `MONGO_URI` is the standard (non-SRV) string.
- **Routes/maps don't load:** Valhalla/OSRM are public demo servers; if one is
  rate-limited, the app falls back automatically. For heavy traffic, self-host.
