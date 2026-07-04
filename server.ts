import "dotenv/config";
import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";

import { initDb } from "./server/db.js";
import { apiRouter } from "./server/routes.js";
import uploadRouter from "./server/upload.js";
import { runTopsisAllActive } from "./server/topsis.js";
import { logger } from "./server/logger.js";

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.JWT_SECRET) { logger.error("JWT_SECRET is required in production"); process.exit(1); }
    if (!process.env.ADMIN_SECRET_KEY) { logger.error("ADMIN_SECRET_KEY is required in production"); process.exit(1); }
  }

  initDb();
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5173"];

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https:", "w:"],
        fontSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        ...(process.env.NODE_ENV === "production" && { upgradeInsecureRequests: [] }),
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== "production") callback(null, true);
      else callback(new Error("CORS not allowed"));
    },
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));

  const handler = (_req: any, res: any) => res.status(429).json({ message: "Terlalu banyak permintaan, silakan coba lagi nanti." });
  const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, handler });
  const uploadLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, handler });
  const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, handler });

  // Per-user login rate limiting (5 attempts per email per minute)
  const loginAttempts = new Map<string, { count: number; resetAt: number }>();
  app.use("/api/auth/login", (req: any, res: any, next: any) => {
    const email = req.body?.email;
    if (!email) return next();
    const now = Date.now();
    const key = `login:${email}`;
    const entry = loginAttempts.get(key);
    if (entry && entry.resetAt > now) {
      if (entry.count >= 5) {
        return res.status(429).json({ message: "Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit." });
      }
      entry.count++;
    } else {
      loginAttempts.set(key, { count: 1, resetAt: now + 60000 });
    }
    // Cleanup old entries
    if (loginAttempts.size > 10000) {
      const cutoff = now - 120000;
      for (const [k, v] of loginAttempts) { if (v.resetAt < cutoff) loginAttempts.delete(k); }
    }
    next();
  }, loginLimiter);
  app.use("/api/upload", uploadLimiter);
  app.use("/api", generalLimiter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
  app.use("/api", uploadRouter);
  app.use("/api", apiRouter);

  // SSE endpoint for real-time notifications
  const sseClients = new Map<number, Set<any>>();
  app.get("/api/notifications/subscribe", (req, res) => {
    const userId = parseInt(req.query.user_id as string);
    if (!userId) { res.status(400).json({ message: "user_id required" }); return; }
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write("data: connected\n\n");
    if (!sseClients.has(userId)) sseClients.set(userId, new Set());
    sseClients.get(userId)!.add(res);
    const ping = setInterval(() => res.write(":ping\n\n"), 30000);
    req.on("close", () => {
      clearInterval(ping);
      sseClients.get(userId)?.delete(res);
    });
  });

  // Helper to push notifications to connected SSE clients
  (global as any).notifyUser = (userId: number, data: any) => {
    sseClients.get(userId)?.forEach(res => res.write(`data: ${JSON.stringify(data)}\n\n`));
  };

  runTopsisAllActive();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ message: "Endpoint tidak ditemukan" });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error("Server error", { message: err.message, stack: err.stack });
    res.status(500).json({ message: "Terjadi kesalahan server" });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on http://localhost:${PORT}`, { port: PORT, env: process.env.NODE_ENV || "development" });
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received — shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
