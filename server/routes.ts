import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import db from "./db.js";
import { AuthRequest, authMiddleware, requireRole, signToken, setAuthCookie, clearAuthCookie } from "./auth.js";
import { runTopsisAllActive, calculateTopsisForDonation } from "./topsis.js";
import { validate, loginSchema, registerDonorSchema, registerRecipientSchema, registerAdminSchema, createDonationSchema, claimDonationSchema, reviewSchema, adminVerifySchema, emergencySchema } from "./validate.js";

export const apiRouter = Router();

// --- Activity Logger ---
function logActivity(userId: number, action: string, details?: string) {
  try {
    db.prepare("INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, ?)").run(userId, action, details || "", new Date().toISOString());
  } catch {}
}

// --- Auth ---
apiRouter.post("/auth/register/admin", validate(registerAdminSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const adminKey = process.env.ADMIN_SECRET_KEY || (process.env.NODE_ENV === "production" ? (() => { throw new Error("ADMIN_SECRET_KEY environment variable is required in production"); })() : "admin-secret-change-me");
  if (req.body.admin_key !== adminKey) {
    res.status(403).json({ message: "Kunci admin tidak valid" });
    return;
  }
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
    return;
  }
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ message: "Email sudah terdaftar" });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const result = db.prepare("INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, 'admin', 'verified')").run(name, email, hash);
  const user = db.prepare("SELECT id, name, email, role, status FROM users WHERE id = ?").get(result.lastInsertRowid) as any;
  res.json({ message: "Admin berhasil dibuat", user });
});

apiRouter.post("/auth/login", validate(loginSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Kredensial tidak valid" });
    return;
  }
  if (user.status !== "verified" && user.role !== "admin") {
    res.status(403).json({ message: "Akun Anda belum diverifikasi admin." });
    return;
  }
  let profile = null;
  if (user.role === "donor") profile = db.prepare("SELECT * FROM donor_profiles WHERE user_id = ?").get(user.id);
  if (user.role === "recipient") profile = db.prepare("SELECT * FROM recipient_profiles WHERE user_id = ?").get(user.id);

  const token = signToken(user);
  setAuthCookie(res, token);

  logActivity(user.id, "login", `User ${user.role} login`);

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, profile });
});

// --- Forgot / Reset Password ---
apiRouter.post("/auth/forgot-password", async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ message: "Email wajib diisi" }); return; }
  const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
  if (!user) { res.status(404).json({ message: "Email tidak terdaftar" }); return; }
  const resetToken = [...Array(32)].map(() => Math.random().toString(36)[2]).join("");
  const expiry = new Date(Date.now() + 3600000).toISOString();
  db.prepare("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?").run(resetToken, expiry, user.id);
  // In production, send email with reset link. For demo, return the token.
  res.json({ message: "Link reset password telah dikirim", resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken });
});

apiRouter.post("/auth/reset-password", async (req: AuthRequest, res: Response): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password) { res.status(400).json({ message: "Token dan password baru wajib diisi" }); return; }
  if (password.length < 6) { res.status(400).json({ message: "Password minimal 6 karakter" }); return; }
  const user = db.prepare("SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?").get(token, new Date().toISOString()) as any;
  if (!user) { res.status(400).json({ message: "Token tidak valid atau sudah kedaluwarsa" }); return; }
  const hash = await bcrypt.hash(password, 10);
  db.prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?").run(hash, user.id);
  res.json({ message: "Password berhasil direset. Silakan login." });
});

apiRouter.post("/auth/logout", (_req: AuthRequest, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: "Logout berhasil" });
});

apiRouter.get("/auth/me", authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare("SELECT id, name, email, role, status FROM users WHERE id = ?").get(req.user!.id) as any;
  if (!user) { clearAuthCookie(res); res.status(401).json({ message: "User tidak ditemukan" }); return; }
  let profile = null;
  if (user.role === "donor") profile = db.prepare("SELECT * FROM donor_profiles WHERE user_id = ?").get(user.id);
  if (user.role === "recipient") profile = db.prepare("SELECT * FROM recipient_profiles WHERE user_id = ?").get(user.id);
  res.json({ user, profile });
});

// --- Registration ---
apiRouter.post("/auth/register/donor", validate(registerDonorSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const { business_name, email, password, business_type, address, latitude, longitude, phone } = req.body;
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) { res.status(409).json({ message: "Email sudah terdaftar" }); return; }
  const hash = await bcrypt.hash(password, 10);
  const uResult = db.prepare("INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, 'donor', 'pending')").run(business_name, email, hash);
  const userId = uResult.lastInsertRowid as number;
  db.prepare("INSERT INTO donor_profiles (user_id, business_name, business_type, address, latitude, longitude, phone) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(userId, business_name, business_type, address, parseFloat(latitude), parseFloat(longitude), phone);
  res.json({ message: "Berhasil daftar. Menunggu verifikasi admin." });
});

apiRouter.post("/auth/register/recipient", validate(registerRecipientSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const { institution_name, email, password, institution_type, address, latitude, longitude, phone, resident_count, age_range, health_condition, daily_protein_need, daily_calorie_need, daily_iron_need, daily_vitamin_c_need } = req.body;
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) { res.status(409).json({ message: "Email sudah terdaftar" }); return; }
  const hash = await bcrypt.hash(password, 10);
  const uResult = db.prepare("INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, 'recipient', 'pending')").run(institution_name, email, hash);
  const userId = uResult.lastInsertRowid as number;
  db.prepare(`INSERT INTO recipient_profiles (user_id, institution_name, institution_type, address, latitude, longitude, phone, resident_count, age_range, health_condition, daily_protein_need, daily_calorie_need, daily_iron_need, daily_vitamin_c_need) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(userId, institution_name, institution_type, address, parseFloat(latitude), parseFloat(longitude), phone, parseInt(resident_count), age_range, health_condition, parseFloat(daily_protein_need), parseFloat(daily_calorie_need), parseFloat(daily_iron_need), parseFloat(daily_vitamin_c_need));
  res.json({ message: "Berhasil daftar. Menunggu verifikasi admin." });
});

// --- Profile ---
apiRouter.put("/users/:id/profile", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
  if (!user) { res.status(404).json({ message: "User tidak ditemukan" }); return; }
  const d = req.body;
  if (d.name) db.prepare("UPDATE users SET name = ? WHERE id = ?").run(d.name, userId);
  if (d.email) db.prepare("UPDATE users SET email = ? WHERE id = ?").run(d.email, userId);
  if (d.password) db.prepare("UPDATE users SET password = ? WHERE id = ?").run(await bcrypt.hash(d.password, 10), userId);

  if (user.role === "donor") {
    const p = db.prepare("SELECT * FROM donor_profiles WHERE user_id = ?").get(userId);
    if (p) {
      if (d.business_name) db.prepare("UPDATE donor_profiles SET business_name = ? WHERE user_id = ?").run(d.business_name, userId);
      if (d.business_type) db.prepare("UPDATE donor_profiles SET business_type = ? WHERE user_id = ?").run(d.business_type, userId);
      if (d.address) db.prepare("UPDATE donor_profiles SET address = ? WHERE user_id = ?").run(d.address, userId);
      if (d.latitude) db.prepare("UPDATE donor_profiles SET latitude = ? WHERE user_id = ?").run(parseFloat(d.latitude), userId);
      if (d.longitude) db.prepare("UPDATE donor_profiles SET longitude = ? WHERE user_id = ?").run(parseFloat(d.longitude), userId);
      if (d.phone) db.prepare("UPDATE donor_profiles SET phone = ? WHERE user_id = ?").run(d.phone, userId);
      if (d.logo_url !== undefined) db.prepare("UPDATE donor_profiles SET logo_url = ? WHERE user_id = ?").run(d.logo_url, userId);
    }
  } else if (user.role === "recipient") {
    const p = db.prepare("SELECT * FROM recipient_profiles WHERE user_id = ?").get(userId);
    if (p) {
      if (d.institution_name) db.prepare("UPDATE recipient_profiles SET institution_name = ? WHERE user_id = ?").run(d.institution_name, userId);
      if (d.institution_type) db.prepare("UPDATE recipient_profiles SET institution_type = ? WHERE user_id = ?").run(d.institution_type, userId);
      if (d.address) db.prepare("UPDATE recipient_profiles SET address = ? WHERE user_id = ?").run(d.address, userId);
      if (d.latitude) db.prepare("UPDATE recipient_profiles SET latitude = ? WHERE user_id = ?").run(parseFloat(d.latitude), userId);
      if (d.longitude) db.prepare("UPDATE recipient_profiles SET longitude = ? WHERE user_id = ?").run(parseFloat(d.longitude), userId);
      if (d.phone) db.prepare("UPDATE recipient_profiles SET phone = ? WHERE user_id = ?").run(d.phone, userId);
      if (d.logo_url !== undefined) db.prepare("UPDATE recipient_profiles SET document_url = ? WHERE user_id = ?").run(d.logo_url, userId);
      if (d.resident_count) db.prepare("UPDATE recipient_profiles SET resident_count = ? WHERE user_id = ?").run(parseInt(d.resident_count), userId);
      if (d.daily_protein_need) db.prepare("UPDATE recipient_profiles SET daily_protein_need = ? WHERE user_id = ?").run(parseFloat(d.daily_protein_need), userId);
      if (d.daily_calorie_need) db.prepare("UPDATE recipient_profiles SET daily_calorie_need = ? WHERE user_id = ?").run(parseFloat(d.daily_calorie_need), userId);
      if (d.daily_iron_need) db.prepare("UPDATE recipient_profiles SET daily_iron_need = ? WHERE user_id = ?").run(parseFloat(d.daily_iron_need), userId);
      if (d.daily_vitamin_c_need) db.prepare("UPDATE recipient_profiles SET daily_vitamin_c_need = ? WHERE user_id = ?").run(parseFloat(d.daily_vitamin_c_need), userId);
    }
  }
  const updated = db.prepare("SELECT id, name, email, role, status FROM users WHERE id = ?").get(userId) as any;
  let profile = null;
  if (user.role === "donor") profile = db.prepare("SELECT * FROM donor_profiles WHERE user_id = ?").get(userId);
  if (user.role === "recipient") profile = db.prepare("SELECT * FROM recipient_profiles WHERE user_id = ?").get(userId);
  res.json({ message: "Profil berhasil diperbarui", user: updated, profile });
});

// --- Public Data ---
apiRouter.get("/public/top-donors", (_req: AuthRequest, res: Response) => {
  const donors = db.prepare("SELECT * FROM donor_profiles ORDER BY total_donations DESC LIMIT 3").all() as any[];
  const result = donors.map((p: any) => {
    const reviews = db.prepare("SELECT rating FROM reviews WHERE donor_id = ?").all(p.user_id) as any[];
    const avgRating = reviews.length > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length : 0;
    return {
      id: p.user_id, business_name: p.business_name, total_donations: p.total_donations,
      type: p.business_type, logo_url: p.logo_url,
      rating: avgRating.toFixed(1), review_count: reviews.length
    };
  });
  res.json(result);
});

// --- Dashboard Stats ---
apiRouter.get("/dashboard/stats", (_req: AuthRequest, res: Response) => {
  const donors = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'donor'").get() as any).c;
  const recipients = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'recipient'").get() as any).c;
  const active = (db.prepare("SELECT COUNT(*) as c FROM donations WHERE status = 'active'").get() as any).c;
  const completed = (db.prepare("SELECT COUNT(*) as c FROM donations WHERE status = 'completed'").get() as any).c;
  res.json({ donors, recipients, active_donations: active, completed_donations: completed });
});

// --- Trend Stats ---
apiRouter.get("/dashboard/trends", (_req: AuthRequest, res: Response) => {
  // Last 7 days donation completions
  const weekly: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
    const count = (db.prepare("SELECT COUNT(*) as c FROM donations WHERE completed_at >= ? AND completed_at <= ?").get(dayStart.toISOString(), dayEnd.toISOString()) as any).c;
    weekly.push({ date: dayStart.toISOString().slice(0, 10), count });
  }
  // Top food types donated
  const foodTypes = db.prepare("SELECT food_type, COUNT(*) as c FROM donations GROUP BY food_type ORDER BY c DESC").all() as any[];
  // Total portions donated
  const totalPortions = (db.prepare("SELECT COALESCE(SUM(portion_count), 0) as t FROM donations WHERE status = 'completed'").get() as any).t;
  // Total protein distributed
  const totalProtein = (db.prepare("SELECT COALESCE(SUM(protein_per_portion * portion_count), 0) as t FROM donations WHERE status = 'completed'").get() as any).t;
  res.json({ weekly, foodTypes, totalPortions, totalProtein });
});

// --- Donations ---
apiRouter.post("/donations", authMiddleware, requireRole("donor"), validate(createDonationSchema), (req: AuthRequest, res: Response) => {
  const d = req.body;
  const result = db.prepare(`INSERT INTO donations (donor_id, food_name, food_type, portion_count, protein_per_portion, calorie_per_portion, iron_mg, vitamin_c_mg, valid_until, pickup_latitude, pickup_longitude, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(req.user!.id, d.food_name, d.food_type, parseInt(d.portion_count), parseFloat(d.protein_per_portion), parseFloat(d.calorie_per_portion), d.iron_mg ? parseFloat(d.iron_mg) : null, d.vitamin_c_mg ? parseFloat(d.vitamin_c_mg) : null, new Date(Date.now() + parseInt(d.hours_valid) * 3600000).toISOString(), parseFloat(d.pickup_latitude), parseFloat(d.pickup_longitude), d.notes, new Date().toISOString());
  const donId = result.lastInsertRowid as number;
  calculateTopsisForDonation(donId);
  // Notify all potential recipients about new donation
  const recipients = db.prepare("SELECT id FROM users WHERE role = 'recipient' AND status = 'verified'").all() as any[];
  recipients.forEach((r: any) => {
    const nId = db.prepare("INSERT INTO notifications (user_id, title, message, type, is_read, related_donation_id, created_at) VALUES (?, ?, ?, 'donation_available', 0, ?, ?)").run(r.id, "Donasi Tersedia!", `Donasi ${d.food_name} sejumlah ${d.portion_count} porsi telah dipublikasikan. Segera cek dashboard Anda!`, donId, new Date().toISOString()).lastInsertRowid;
    const n = db.prepare("SELECT * FROM notifications WHERE id = ?").get(nId) as any;
    try { (globalThis as any).notifyUser?.(r.id, n); } catch {}
  });
  logActivity(req.user!.id, "donasi_buat", `Mempublikasikan ${d.food_name} (${d.portion_count} porsi)`);
  res.json({ message: "Donasi berhasil dipublikasikan!" });
});

apiRouter.get("/donations", (req: AuthRequest, res: Response) => {
  const donorId = req.query.donor_id;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  let donations: any[];
  if (donorId) {
    donations = db.prepare("SELECT * FROM donations WHERE donor_id = ? ORDER BY id DESC LIMIT ? OFFSET ?").all(parseInt(donorId as string), limit, offset);
  } else {
    donations = db.prepare("SELECT * FROM donations ORDER BY id DESC LIMIT ? OFFSET ?").all(limit, offset);
  }
  const enriched = donations.map((d: any) => {
    let recipient_info = null;
    if (d.claimed_by) {
      const r = db.prepare("SELECT institution_name, latitude, longitude FROM recipient_profiles WHERE user_id = ?").get(d.claimed_by) as any;
      if (r) recipient_info = { name: r.institution_name, lat: r.latitude, lon: r.longitude };
    }
    return { ...d, recipient_info };
  });
  res.json(enriched);
});

apiRouter.get("/donations/transit", authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.query.user_id as string);
  const role = req.query.role as string;
  let inTransit: any[];
  if (role === "recipient") {
    inTransit = db.prepare("SELECT * FROM donations WHERE claimed_by = ? AND status = 'claimed'").all(userId);
  } else {
    inTransit = db.prepare("SELECT * FROM donations WHERE donor_id = ? AND status = 'claimed'").all(userId);
  }
  const enriched = inTransit.map((d: any) => {
    const dProf = db.prepare("SELECT business_name FROM donor_profiles WHERE user_id = ?").get(d.donor_id) as any;
    const rProf = db.prepare("SELECT institution_name, latitude, longitude FROM recipient_profiles WHERE user_id = ?").get(d.claimed_by) as any;
    return {
      ...d, donor_name: dProf?.business_name, donor_lat: d.pickup_latitude, donor_lon: d.pickup_longitude,
      recipient_name: rProf?.institution_name, recipient_lat: rProf?.latitude, recipient_lon: rProf?.longitude
    };
  });
  res.json(enriched);
});

apiRouter.get("/donations/active", (req: AuthRequest, res: Response) => {
  const recipient_id = parseInt(req.query.recipient_id as string);
  const active = db.prepare("SELECT * FROM donations WHERE status = 'active'").all() as any[];
  const enriched = active.map((d: any) => {
    const topsis = db.prepare("SELECT rank_position, ci_score FROM topsis_results WHERE donation_id = ? AND recipient_id = ?").get(d.id, recipient_id) as any;
    const dProf = db.prepare("SELECT business_name, address FROM donor_profiles WHERE user_id = ?").get(d.donor_id) as any;
    const claim = db.prepare("SELECT status FROM claims WHERE donation_id = ? AND recipient_id = ?").get(d.id, recipient_id) as any;
    return {
      ...d, rank: topsis?.rank_position || null, ci_score: topsis?.ci_score || null,
      donor_name: dProf?.business_name, donor_address: dProf?.address, my_claim_status: claim?.status || null
    };
  });
  enriched.sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999));
  res.json(enriched);
});

apiRouter.get("/donations/history", authMiddleware, requireRole("recipient"), (req: AuthRequest, res: Response) => {
  const recipient_id = req.user!.id;
  const claims = db.prepare("SELECT * FROM claims WHERE recipient_id = ? AND status = 'approved'").all(recipient_id) as any[];
  const enriched = claims.map((c: any) => {
    const d = db.prepare("SELECT * FROM donations WHERE id = ?").get(c.donation_id) as any;
    const donor = db.prepare("SELECT business_name FROM donor_profiles WHERE user_id = ?").get(d?.donor_id) as any;
    const has_reviewed = !!(db.prepare("SELECT id FROM reviews WHERE donation_id = ?").get(c.donation_id));
    return { ...c, status: d?.status, donor_id: d?.donor_id, food_name: d?.food_name, protein: d?.protein_per_portion, donor_name: donor?.business_name, completed_at: d?.completed_at, has_reviewed };
  });
  res.json(enriched);
});

apiRouter.get("/donations/:id", (req: AuthRequest, res: Response) => {
  const d = db.prepare("SELECT * FROM donations WHERE id = ?").get(parseInt(req.params.id)) as any;
  if (!d) { res.status(404).json({ message: "Donasi tidak ditemukan" }); return; }
  const prof = db.prepare("SELECT business_name FROM donor_profiles WHERE user_id = ?").get(d.donor_id) as any;
  res.json({ ...d, donor_name: prof?.business_name });
});

apiRouter.post("/donations/:id/claim", authMiddleware, requireRole("recipient"), validate(claimDonationSchema), (req: AuthRequest, res: Response) => {
  const dId = parseInt(req.params.id);
  const recId = req.user!.id;
  const t = db.prepare("SELECT rank_position FROM topsis_results WHERE donation_id = ? AND recipient_id = ?").get(dId, recId) as any;
  const rank = t ? t.rank_position : 99;
  db.prepare("INSERT INTO claims (donation_id, recipient_id, topsis_rank_at_claim, status, created_at) VALUES (?, ?, ?, 'pending', ?)")
    .run(dId, recId, rank, new Date().toISOString());
  // Notify admin about new claim
  const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all() as any[];
  const don = db.prepare("SELECT food_name FROM donations WHERE id = ?").get(dId) as any;
  admins.forEach((a: any) => {
    const nId = db.prepare("INSERT INTO notifications (user_id, title, message, type, is_read, related_donation_id, created_at) VALUES (?, ?, ?, 'system', 0, ?, ?)").run(a.id, "Klaim Baru!", `Donasi ${don?.food_name || '#'+dId} diklaim oleh penerima. Segera review.`, dId, new Date().toISOString()).lastInsertRowid;
    try { const n = db.prepare("SELECT * FROM notifications WHERE id = ?").get(nId); (globalThis as any).notifyUser?.(a.id, n); } catch {}
  });
  logActivity(recId, "klaim_buat", `Mengklaim donasi #${dId}`);
  res.json({ message: "Klaim berhasil diajukan, menunggu persetujuan admin." });
});

apiRouter.post("/donations/:id/arrived", authMiddleware, requireRole("donor"), (req: AuthRequest, res: Response) => {
  const dId = parseInt(req.params.id);
  db.prepare("UPDATE donations SET arrived_at = ? WHERE id = ? AND status = 'claimed' AND donor_id = ?").run(new Date().toISOString(), dId, req.user!.id);
  res.json({ message: "Kedatangan dikonfirmasi" });
});

apiRouter.post("/donations/:id/complete", authMiddleware, requireRole("donor"), (req: AuthRequest, res: Response) => {
  const dId = parseInt(req.params.id);
  const don = db.prepare("SELECT * FROM donations WHERE id = ? AND status = 'claimed' AND donor_id = ?").get(dId, req.user!.id) as any;
  if (don) {
    db.prepare("UPDATE donations SET status = 'completed', completed_at = ? WHERE id = ?").run(new Date().toISOString(), dId);
    db.prepare("UPDATE recipient_profiles SET last_received_donation = ? WHERE user_id = ?").run(new Date().toISOString(), don.claimed_by);
    db.prepare("UPDATE donor_profiles SET total_donations = total_donations + 1 WHERE user_id = ?").run(don.donor_id);
  }
  logActivity(req.user!.id, "donasi_selesai", `Donasi #${dId} selesai`);
  res.json({ message: "Konfirmasi serah terima berhasil" });
});

// --- Recipient ---
apiRouter.get("/recipient/akg", (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.query.user_id as string);
  const profile = db.prepare("SELECT * FROM recipient_profiles WHERE user_id = ?").get(userId) as any;
  if (!profile) { res.status(404).json({ message: "Profil tidak ditemukan" }); return; }
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const todayDons = db.prepare("SELECT * FROM donations WHERE claimed_by = ? AND status = 'completed' AND completed_at >= ? AND completed_at <= ?").all(userId, todayStart.toISOString(), todayEnd.toISOString()) as any[];
  const totals = { protein: 0, calories: 0, iron: 0, vitamin_c: 0 };
  const donationDetails: any[] = [];
  todayDons.forEach((d: any) => {
    const prot = d.protein_per_portion * d.portion_count;
    const cal = d.calorie_per_portion * d.portion_count;
    const fe = (d.iron_mg || 0) * d.portion_count;
    const vitc = (d.vitamin_c_mg || 0) * d.portion_count;
    totals.protein += prot; totals.calories += cal; totals.iron += fe; totals.vitamin_c += vitc;
    donationDetails.push({ id: d.id, food_name: d.food_name, portion_count: d.portion_count, protein_total: prot, calorie_total: cal, iron_total: fe, vitamin_c_total: vitc, completed_at: d.completed_at });
  });
  const needs = { protein: profile.daily_protein_need, calories: profile.daily_calorie_need, iron: profile.daily_iron_need, vitamin_c: profile.daily_vitamin_c_need };
  const pct = {
    protein: Math.min(100, Math.round((totals.protein / needs.protein) * 100)),
    calories: Math.min(100, Math.round((totals.calories / needs.calories) * 100)),
    iron: Math.min(100, Math.round((totals.iron / needs.iron) * 100)),
    vitamin_c: Math.min(100, Math.round((totals.vitamin_c / needs.vitamin_c) * 100))
  };
  const overall = Math.round((pct.protein + pct.calories + pct.iron + pct.vitamin_c) / 4);
  res.json({ date: todayStart.toISOString().slice(0, 10), daily_needs: needs, today_intake: totals, percentages: pct, overall_percentage: overall, donations_today: donationDetails });
});

apiRouter.post("/recipient/emergency", validate(emergencySchema), (req: AuthRequest, res: Response) => {
  const userId = req.body.user_id;
  if (!userId) { res.status(400).json({ message: "user_id required" }); return; }
  const rp = db.prepare("SELECT * FROM recipient_profiles WHERE user_id = ?").get(userId) as any;
  if (!rp) { res.status(404).json({ message: "Profil penerima tidak ditemukan" }); return; }
  if (rp.emergency === "active") { res.status(400).json({ message: "Status darurat sedang aktif, hubungi admin untuk menonaktifkan" }); return; }
  const next = rp.emergency === "none" ? "pending" : "none";
  db.prepare("UPDATE recipient_profiles SET emergency = ? WHERE user_id = ?").run(next, userId);
  const msg = next === "pending" ? "Permintaan darurat dikirim ke admin" : "Permintaan darurat dibatalkan";
  res.json({ emergency: next, message: msg });
});

// --- TOPSIS ---
apiRouter.get("/topsis/:donation_id", (req: AuthRequest, res: Response) => {
  const did = parseInt(req.params.donation_id);
  const results = db.prepare("SELECT * FROM topsis_results WHERE donation_id = ? ORDER BY rank_position ASC").all(did) as any[];
  const enriched = results.map((r: any) => {
    const prof = db.prepare("SELECT institution_name FROM recipient_profiles WHERE user_id = ?").get(r.recipient_id) as any;
    return { ...r, institution_name: prof?.institution_name };
  });
  res.json({ results: enriched });
});

// --- Reviews ---
apiRouter.post("/reviews", authMiddleware, validate(reviewSchema), (req: AuthRequest, res: Response) => {
  const r = req.body;
  db.prepare("INSERT INTO reviews (donation_id, donor_id, recipient_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(r.donation_id, r.donor_id, r.recipient_id, r.rating, r.comment, new Date().toISOString());
  const donorObj = db.prepare("SELECT id FROM users WHERE id = ?").get(r.donor_id) as any;
  if (donorObj) {
    db.prepare("INSERT INTO notifications (user_id, title, message, type, is_read, related_donation_id, created_at) VALUES (?, ?, ?, 'system', 0, ?, ?)")
      .run(r.donor_id, "Ulasan Baru!", `Penerima donasi telah memberikan ulasan bintang ${r.rating} untuk donasi Anda.`, r.donation_id, new Date().toISOString());
  }
  logActivity(req.user!.id, "ulasan_buat", `Ulasan untuk donasi #${r.donation_id}`);
  res.json({ message: "Ulasan berhasil dikirim" });
});

apiRouter.get("/donors/:id/reviews", (req: AuthRequest, res: Response) => {
  const donorId = parseInt(req.params.id);
  const reviews = db.prepare("SELECT * FROM reviews WHERE donor_id = ? ORDER BY id DESC").all(donorId) as any[];
  const enriched = reviews.map((r: any) => {
    const rec = db.prepare("SELECT institution_name FROM recipient_profiles WHERE user_id = ?").get(r.recipient_id) as any;
    return { ...r, recipient_name: rec?.institution_name };
  });
  res.json(enriched);
});

// --- Notifications ---
apiRouter.get("/notifications", (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.query.user_id as string);
  const notes = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC").all(userId);
  res.json(notes);
});

apiRouter.post("/notifications/:id/read", authMiddleware, (req: AuthRequest, res: Response) => {
  const nId = parseInt(req.params.id);
  db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(nId, req.user!.id);
  res.json({ success: true });
});

// --- Map ---
apiRouter.get("/map/data", (_req: AuthRequest, res: Response) => {
  const donors = db.prepare("SELECT dp.* FROM donor_profiles dp JOIN users u ON u.id = dp.user_id WHERE u.status = 'verified'").all();
  const recipients = db.prepare("SELECT rp.* FROM recipient_profiles rp JOIN users u ON u.id = rp.user_id WHERE u.status = 'verified'").all();
  const activeDonations = db.prepare("SELECT * FROM donations WHERE status = 'active'").all();
  res.json({ donors, recipients, activeDonations });
});

// --- Admin Routes ---
apiRouter.post("/admin/topsis/run", authMiddleware, requireRole("admin"), (_req: AuthRequest, res: Response) => {
  runTopsisAllActive();
  res.json({ message: "TOPSIS kalkulasi ulang selesai." });
});

apiRouter.get("/admin/users", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const donors = db.prepare("SELECT u.id, u.name, u.email, u.role, u.status, dp.business_name, dp.business_type, dp.address, dp.latitude, dp.longitude, dp.phone, dp.logo_url, dp.total_donations FROM users u LEFT JOIN donor_profiles dp ON dp.user_id = u.id WHERE u.role = 'donor'").all() as any[];
  const recipients = db.prepare("SELECT u.id, u.name, u.email, u.role, u.status, rp.institution_name, rp.institution_type, rp.address, rp.latitude, rp.longitude, rp.phone, rp.resident_count, rp.age_range, rp.health_condition, rp.daily_protein_need, rp.daily_calorie_need, rp.daily_iron_need, rp.daily_vitamin_c_need, rp.urgency_score, rp.emergency, rp.last_received_donation, rp.document_url FROM users u LEFT JOIN recipient_profiles rp ON rp.user_id = u.id WHERE u.role = 'recipient'").all() as any[];
  const safeDonors = donors.map((d: any) => { const { password, ...rest } = d; return rest; });
  const safeRecipients = recipients.map((r: any) => { const { password, ...rest } = r; return rest; });
  res.json({ donors: safeDonors, recipients: safeRecipients });
});

apiRouter.post("/admin/users/:id/verify", authMiddleware, requireRole("admin"), validate(adminVerifySchema), (req: AuthRequest, res: Response) => {
  const uId = parseInt(req.params.id);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(uId) as any;
  if (!user) { res.status(404).json({ message: "User tidak ditemukan" }); return; }
  db.prepare("UPDATE users SET status = 'verified' WHERE id = ?").run(uId);
  if (req.body.urgency_score && user.role === "recipient") {
    db.prepare("UPDATE recipient_profiles SET urgency_score = ? WHERE user_id = ?").run(parseInt(req.body.urgency_score), uId);
  }
  if (user.role === "recipient") runTopsisAllActive();
  logActivity(req.user!.id, "user_verifikasi", `User ${uId} diverifikasi`);
  res.json({ message: "User diverifikasi" });
});

apiRouter.get("/admin/claims", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const claims = db.prepare(`SELECT c.*, d.food_name, rp.institution_name FROM claims c LEFT JOIN donations d ON d.id = c.donation_id LEFT JOIN recipient_profiles rp ON rp.user_id = c.recipient_id ORDER BY c.id DESC`).all();
  res.json(claims);
});

apiRouter.post("/admin/claims/:id/approve", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const cId = parseInt(req.params.id);
  const claim = db.prepare("SELECT * FROM claims WHERE id = ?").get(cId) as any;
  if (!claim) { res.status(404).json({ message: "Klaim tidak ditemukan" }); return; }
  db.prepare("UPDATE claims SET status = 'approved', reviewed_at = ?, reviewed_by = ? WHERE id = ?").run(new Date().toISOString(), req.user!.id, cId);
  db.prepare("UPDATE donations SET status = 'claimed', claimed_by = ?, claimed_at = ? WHERE id = ?").run(claim.recipient_id, new Date().toISOString(), claim.donation_id);
  // Notify donor and recipient
  const don = db.prepare("SELECT food_name, donor_id FROM donations WHERE id = ?").get(claim.donation_id) as any;
  [claim.recipient_id, don?.donor_id].forEach((uid: number) => {
    const nId = db.prepare("INSERT INTO notifications (user_id, title, message, type, is_read, related_donation_id, created_at) VALUES (?, ?, ?, 'claim_approved', 0, ?, ?)").run(uid, "Klaim Disetujui!", `Donasi ${don?.food_name || '#'+claim.donation_id} telah disetujui. Cek status terbaru di dashboard.`, claim.donation_id, new Date().toISOString()).lastInsertRowid;
    try { const n = db.prepare("SELECT * FROM notifications WHERE id = ?").get(nId); (globalThis as any).notifyUser?.(uid, n); } catch {}
  });
  logActivity(req.user!.id, "klaim_setujui", `Klaim #${cId} disetujui`);
  res.json({ message: "Klaim disetujui" });
});

apiRouter.post("/admin/users/:id/emergency", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const uId = parseInt(req.params.id);
  const rp = db.prepare("SELECT * FROM recipient_profiles WHERE user_id = ?").get(uId) as any;
  if (!rp) { res.status(404).json({ message: "Profil penerima tidak ditemukan" }); return; }
  const next = rp.emergency === "pending" ? "active" : rp.emergency === "active" ? "none" : "pending";
  db.prepare("UPDATE recipient_profiles SET emergency = ? WHERE user_id = ?").run(next, uId);
  runTopsisAllActive();
  res.json({ emergency: next });
});

apiRouter.delete("/admin/users/:id", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const uId = parseInt(req.params.id);
  const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(uId) as any;
  if (!user) { res.status(404).json({ message: "User tidak ditemukan" }); return; }
  if (user.role === "admin") { res.status(400).json({ message: "Tidak bisa menghapus admin" }); return; }

  try {
    db.transaction(() => {
      // Delete all claims linked to this user's donations OR this user as recipient
      const userDonationIds = (db.prepare("SELECT id FROM donations WHERE donor_id = ?").all(uId) as any[]).map((d: any) => d.id);
      userDonationIds.forEach((did: number) => {
        db.prepare("DELETE FROM claims WHERE donation_id = ?").run(did);
        db.prepare("DELETE FROM topsis_results WHERE donation_id = ?").run(did);
        db.prepare("DELETE FROM reviews WHERE donation_id = ?").run(did);
        db.prepare("DELETE FROM notifications WHERE related_donation_id = ?").run(did);
      });
      // Also delete claims where user is recipient
      db.prepare("DELETE FROM claims WHERE recipient_id = ?").run(uId);
      // Delete topsis where user is recipient
      db.prepare("DELETE FROM topsis_results WHERE recipient_id = ?").run(uId);
      db.prepare("DELETE FROM reviews WHERE donor_id = ? OR recipient_id = ?").run(uId, uId);
      db.prepare("DELETE FROM notifications WHERE user_id = ?").run(uId);
      db.prepare("DELETE FROM donations WHERE donor_id = ? OR claimed_by = ?").run(uId, uId);
      db.prepare("DELETE FROM donor_profiles WHERE user_id = ?").run(uId);
      db.prepare("DELETE FROM recipient_profiles WHERE user_id = ?").run(uId);
      db.prepare("DELETE FROM activity_logs WHERE user_id = ?").run(uId);
      db.prepare("DELETE FROM users WHERE id = ?").run(uId);
    })();
  } catch (err: any) {
    res.status(500).json({ message: `Gagal menghapus user: ${err.message}` });
    return;
  }

  res.json({ message: `User ${user.role} berhasil dihapus` });
});

// --- Global Search ---
apiRouter.get("/admin/search", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string || "").trim();
  if (!q || q.length < 2) { res.json({ donors: [], recipients: [], donations: [], claims: [] }); return; }
  const like = `%${q}%`;
  const donors = db.prepare("SELECT u.id, u.name, u.email, u.status, dp.business_name, dp.business_type FROM users u LEFT JOIN donor_profiles dp ON dp.user_id = u.id WHERE u.role = 'donor' AND (dp.business_name LIKE ? OR u.email LIKE ? OR u.name LIKE ?)").all(like, like, like);
  const recipients = db.prepare("SELECT u.id, u.name, u.email, u.status, rp.institution_name, rp.institution_type FROM users u LEFT JOIN recipient_profiles rp ON rp.user_id = u.id WHERE u.role = 'recipient' AND (rp.institution_name LIKE ? OR u.email LIKE ? OR u.name LIKE ?)").all(like, like, like);
  const donations = db.prepare("SELECT d.*, dp.business_name as donor_name FROM donations d LEFT JOIN donor_profiles dp ON dp.user_id = d.donor_id WHERE d.food_name LIKE ? OR dp.business_name LIKE ?").all(like, like);
  const claims = db.prepare("SELECT c.*, d.food_name, rp.institution_name FROM claims c LEFT JOIN donations d ON d.id = c.donation_id LEFT JOIN recipient_profiles rp ON rp.user_id = c.recipient_id WHERE d.food_name LIKE ? OR rp.institution_name LIKE ?").all(like, like);
  res.json({ donors, recipients, donations, claims });
});

// --- Activity Logs ---
// --- Badges / Gamification ---
apiRouter.get("/donors/:id/badges", (req: AuthRequest, res: Response) => {
  const donorId = parseInt(req.params.id);
  const total = (db.prepare("SELECT total_donations FROM donor_profiles WHERE user_id = ?").get(donorId) as any)?.total_donations || 0;
  const reviews = db.prepare("SELECT COUNT(*) as c FROM reviews WHERE donor_id = ?").get(donorId) as any;
  const badges: { name: string; icon: string; desc: string }[] = [];
  if (total >= 1) badges.push({ name: "Donator Pemula", icon: "🌱", desc: "Donasi pertama Anda!" });
  if (total >= 5) badges.push({ name: "Donator Aktif", icon: "⭐", desc: "5 donasi telah disalurkan" });
  if (total >= 10) badges.push({ name: "Pahlawan Pangan", icon: "🏆", desc: "10 donasi — dampak luar biasa!" });
  if (total >= 20) badges.push({ name: "Legenda Donasi", icon: "👑", desc: "20+ donasi, sungguh menginspirasi!" });
  if (reviews.c >= 5) badges.push({ name: "Favorit Penerima", icon: "❤️", desc: "5+ ulasan positif dari penerima" });
  res.json(badges);
});

apiRouter.get("/activity-logs", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { user } = req;
  let logs;
  if (user!.role === "admin") {
    logs = db.prepare("SELECT al.*, u.name as user_name, u.role as user_role FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id ORDER BY al.id DESC LIMIT 50").all();
  } else {
    logs = db.prepare("SELECT * FROM activity_logs WHERE user_id = ? ORDER BY id DESC LIMIT 20").all(user!.id);
  }
  res.json(logs);
});
