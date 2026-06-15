import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import rideRoutes from "./routes/rides.js";
import requestRoutes from "./routes/requests.js";
import metaRoutes from "./routes/meta.js";
import ratingRoutes from "./routes/ratings.js";
import profileRoutes from "./routes/profile.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
connectDB();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isProd = process.env.NODE_ENV === "production";

app.set("trust proxy", 1); // correct client IPs behind a proxy/load balancer

// Security & performance middleware.
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(isProd ? "combined" : "dev"));

// CORS — allow a comma-separated list of origins from CLIENT_URL.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Rate limiting.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// Routes.
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/meta", metaRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/profile", profileRoutes);

// Serve the built client in production.
if (isProd) {
  const clientDist = path.resolve(__dirname, "../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return notFound(req, res);
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.use("/api", notFound);
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} (${isProd ? "production" : "development"})`)
);

// Graceful shutdown.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down...`);
  server.close(() => process.exit(0));
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
