import BetterSqlite3 from "better-sqlite3";
type Database = ReturnType<typeof BetterSqlite3>;
import path from "path";
import fs from "fs";
import { logger } from "./logger.js";

export type Role = "donor" | "recipient" | "admin";
export type Status = "pending" | "verified" | "rejected";

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
  status: Status;
}

export interface DonorProfile {
  id: number;
  user_id: number;
  business_name: string;
  business_type: "hotel" | "restoran" | "kafe" | "katering" | "lainnya";
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  logo_url: string;
  total_donations: number;
}

export interface RecipientProfile {
  id: number;
  user_id: number;
  institution_name: string;
  institution_type: "panti_asuhan" | "rumah_singgah" | "lembaga_sosial" | "lainnya";
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  resident_count: number;
  age_range: string;
  health_condition: string;
  daily_protein_need: number;
  daily_calorie_need: number;
  daily_iron_need: number;
  daily_vitamin_c_need: number;
  urgency_score: number;
  emergency: "none" | "pending" | "active";
  last_received_donation: string | null;
  document_url: string;
}

export interface Donation {
  id: number;
  donor_id: number;
  food_name: string;
  food_type: "makanan_berat" | "sayur" | "lauk_protein" | "snack" | "minuman" | "lainnya";
  portion_count: number;
  protein_per_portion: number;
  calorie_per_portion: number;
  iron_mg: number | null;
  vitamin_c_mg: number | null;
  valid_until: string;
  pickup_latitude: number;
  pickup_longitude: number;
  photo_url: string;
  notes: string;
  status: "active" | "claimed" | "completed" | "expired";
  claimed_by: number | null;
  claimed_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface TopsisResult {
  id: number;
  donation_id: number;
  recipient_id: number;
  rank_position: number;
  raw_c1: number;
  raw_c2: number;
  raw_c3: number;
  raw_c4: number;
  raw_c5: number;
  weight_c1: number;
  weight_c2: number;
  weight_c3: number;
  weight_c4: number;
  weight_c5: number;
  d_plus: number;
  d_minus: number;
  ci_score: number;
  calculated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "donation_available" | "claim_approved" | "verification" | "system";
  is_read: boolean;
  related_donation_id: number | null;
  created_at: string;
}

export interface Claim {
  id: number;
  donation_id: number;
  recipient_id: number;
  topsis_rank_at_claim: number;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
}

export interface Review {
  id: number;
  donation_id: number;
  donor_id: number;
  recipient_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('donor','recipient','admin')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected')),
    reset_token TEXT,
    reset_token_expiry TEXT
  );

  CREATE TABLE IF NOT EXISTS donor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL CHECK(business_type IN ('hotel','restoran','kafe','katering','lainnya')),
    address TEXT NOT NULL DEFAULT '',
    latitude REAL NOT NULL DEFAULT 0,
    longitude REAL NOT NULL DEFAULT 0,
    phone TEXT NOT NULL DEFAULT '',
    logo_url TEXT NOT NULL DEFAULT '',
    total_donations INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS recipient_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    institution_type TEXT NOT NULL CHECK(institution_type IN ('panti_asuhan','rumah_singgah','lembaga_sosial','lainnya')),
    address TEXT NOT NULL DEFAULT '',
    latitude REAL NOT NULL DEFAULT 0,
    longitude REAL NOT NULL DEFAULT 0,
    phone TEXT NOT NULL DEFAULT '',
    resident_count INTEGER NOT NULL DEFAULT 0,
    age_range TEXT NOT NULL DEFAULT '',
    health_condition TEXT NOT NULL DEFAULT '',
    daily_protein_need REAL NOT NULL DEFAULT 0,
    daily_calorie_need REAL NOT NULL DEFAULT 0,
    daily_iron_need REAL NOT NULL DEFAULT 0,
    daily_vitamin_c_need REAL NOT NULL DEFAULT 0,
    urgency_score INTEGER NOT NULL DEFAULT 1,
    emergency TEXT NOT NULL DEFAULT 'none' CHECK(emergency IN ('none','pending','active')),
    last_received_donation TEXT,
    document_url TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL REFERENCES users(id),
    food_name TEXT NOT NULL,
    food_type TEXT NOT NULL CHECK(food_type IN ('makanan_berat','sayur','lauk_protein','snack','minuman','lainnya')),
    portion_count INTEGER NOT NULL,
    protein_per_portion REAL NOT NULL DEFAULT 0,
    calorie_per_portion REAL NOT NULL DEFAULT 0,
    iron_mg REAL,
    vitamin_c_mg REAL,
    valid_until TEXT NOT NULL,
    pickup_latitude REAL NOT NULL,
    pickup_longitude REAL NOT NULL,
    photo_url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','claimed','completed','expired')),
    claimed_by INTEGER,
    claimed_at TEXT,
    arrived_at TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS topsis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donation_id INTEGER NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    rank_position INTEGER NOT NULL,
    raw_c1 REAL NOT NULL DEFAULT 0,
    raw_c2 REAL NOT NULL DEFAULT 0,
    raw_c3 REAL NOT NULL DEFAULT 0,
    raw_c4 REAL NOT NULL DEFAULT 0,
    raw_c5 REAL NOT NULL DEFAULT 0,
    weight_c1 REAL NOT NULL DEFAULT 0,
    weight_c2 REAL NOT NULL DEFAULT 0,
    weight_c3 REAL NOT NULL DEFAULT 0,
    weight_c4 REAL NOT NULL DEFAULT 0,
    weight_c5 REAL NOT NULL DEFAULT 0,
    d_plus REAL NOT NULL DEFAULT 0,
    d_minus REAL NOT NULL DEFAULT 0,
    ci_score REAL NOT NULL DEFAULT 0,
    calculated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('donation_available','claim_approved','verification','system')),
    is_read INTEGER NOT NULL DEFAULT 0,
    related_donation_id INTEGER,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donation_id INTEGER NOT NULL REFERENCES donations(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    topsis_rank_at_claim INTEGER NOT NULL DEFAULT 99,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
    admin_note TEXT,
    created_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewed_by INTEGER
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donation_id INTEGER NOT NULL REFERENCES donations(id),
    donor_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
`;

let db: Database;

export function initDb(dbPath?: string): Database {
  if (db) db.close();
  const resolved = dbPath || process.env.DB_PATH || path.join(process.cwd(), "data", "nutrishare.db");
  if (process.env.DB_PATH) logger.info(`Using DB_PATH: ${resolved}`);
  db = new BetterSqlite3(resolved);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.pragma("synchronous = NORMAL");
  db.exec(SCHEMA);
  // Add reset token columns if they don't exist (migration)
  try { db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT"); } catch {}
  try { db.exec("ALTER TABLE users ADD COLUMN reset_token_expiry TEXT"); } catch {}
  // Activity logs table
  try { db.exec("CREATE TABLE IF NOT EXISTS activity_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, action TEXT NOT NULL, details TEXT, created_at TEXT NOT NULL)"); } catch {}
  return db;
}

export function getDb(): Database {
  return db;
}

export function resetDb(): void {
  db.exec(`
    DELETE FROM reviews;
    DELETE FROM notifications;
    DELETE FROM claims;
    DELETE FROM topsis_results;
    DELETE FROM donations;
    DELETE FROM recipient_profiles;
    DELETE FROM donor_profiles;
    DELETE FROM users;
  `);
}

export function closeDb(): void {
  if (db) db.close();
}

// Default: init with file-based DB (called by server.ts)
// For tests, call initDb(":memory:") before importing routes

// Proxy for backward compatibility — lets `db.prepare()` work even if initDb() is called later
const dbProxy = new Proxy({} as any, {
  get: (_, prop) => {
    if (!db) throw new Error("Database not initialized. Call initDb() first.");
    return (db as any)[prop];
  },
});

export default dbProxy;
