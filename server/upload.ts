import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "./auth.js";

const uploadRouter = Router();
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = file.originalname.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
    cb(null, `${Date.now()}-${safe}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("File tidak valid. Gunakan JPEG/PNG/WEBP max 5MB."));
      return;
    }
    cb(null, true);
  },
});

uploadRouter.post("/upload", authMiddleware, upload.single("photo"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "File tidak valid. Gunakan JPEG/PNG/WEBP max 5MB." });
    return;
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default uploadRouter;
