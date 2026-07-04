import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, Role } from "./db.js";
import db from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? (() => { throw new Error("JWT_SECRET environment variable is required in production"); })() : "dev-secret-change-in-production");
const COOKIE_NAME = "nutrishare_token";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
    name: string;
    status: string;
  };
}

export function signToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, status: user.status },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ message: "Belum login" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name, status: decoded.status };
    next();
  } catch {
    res.status(401).json({ message: "Sesi tidak valid" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Belum login" });
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({ message: "Tidak punya akses" });
      return;
    }
    next();
  };
}
