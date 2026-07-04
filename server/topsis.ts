import db from "./db.js";

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371;
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export function calculateTopsisForDonation(donationId: number) {
  const donation = db.prepare("SELECT * FROM donations WHERE id = ? AND status = 'active'").get(donationId) as any;
  if (!donation) return;

  const validRecipients = db.prepare(
    "SELECT rp.* FROM recipient_profiles rp JOIN users u ON u.id = rp.user_id WHERE u.status = 'verified'"
  ).all() as any[];

  if (validRecipients.length === 0) return;

  // Guard: single recipient
  if (validRecipients.length === 1) {
    const single = validRecipients[0];
    db.prepare("DELETE FROM topsis_results WHERE donation_id = ?").run(donationId);
    db.prepare(`INSERT INTO topsis_results (donation_id, recipient_id, rank_position, raw_c1, raw_c2, raw_c3, raw_c4, raw_c5, weight_c1, weight_c2, weight_c3, weight_c4, weight_c5, d_plus, d_minus, ci_score, calculated_at) VALUES (?, ?, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ?)`)
      .run(donationId, single.user_id, new Date().toISOString());
    return;
  }

  const m = validRecipients.length;
  const n = 5;

  const totalProtein = donation.protein_per_portion * donation.portion_count;
  const matrix = validRecipients.map((rp: any) => {
    const c1 = rp.daily_protein_need > 0
      ? Math.min(100, (totalProtein / rp.daily_protein_need) * 100) : 0;
    const c2 = rp.emergency === "active" ? rp.urgency_score * 1000 : rp.urgency_score;
    const diffHours = Math.max((new Date(donation.valid_until).getTime() - Date.now()) / 3600000, 0.1);
    const c3 = diffHours;
    const c4 = getDistanceFromLatLonInKm(donation.pickup_latitude, donation.pickup_longitude, rp.latitude, rp.longitude);
    let c5 = 30;
    if (rp.last_received_donation) {
      c5 = Math.max((Date.now() - new Date(rp.last_received_donation).getTime()) / 86400000, 0);
    }
    return { rp, row: [c1, c2, c3, c4, c5] };
  });

  const isBenefit = [true, true, true, false, true];

  let sumSq = [0,0,0,0,0];
  matrix.forEach(item => {
    for (let j=0; j<n; j++) sumSq[j] += item.row[j] * item.row[j];
  });

  const normMatrix = matrix.map(item =>
    item.row.map((val, j) => sumSq[j] === 0 ? 0 : val / Math.sqrt(sumSq[j]))
  );

  let entropy = [0,0,0,0,0];
  let pSum = [0,0,0,0,0];
  normMatrix.forEach(row => {
    for (let j=0; j<n; j++) pSum[j] += row[j];
  });

  const pMatrix = normMatrix.map(row =>
    row.map((val, j) => pSum[j] === 0 ? 0 : val / pSum[j])
  );

  const k = -1 / Math.log(m);
  pMatrix.forEach(row => {
    for (let j=0; j<n; j++) {
      if (row[j] > 0) entropy[j] += row[j] * Math.log(row[j]);
    }
  });

  const E_j = entropy.map(e => k * e);
  const d_j = E_j.map(e => Math.max(0, 1 - e));
  const sum_d_j = d_j.reduce((a,b)=>a+b, 0);
  const w_j = d_j.map(d_val => sum_d_j === 0 ? (1/n) : d_val / sum_d_j);

  const vMatrix = normMatrix.map(row =>
    row.map((val, j) => val * w_j[j])
  );

  let A_plus = [0,0,0,0,0];
  let A_minus = [0,0,0,0,0];
  for (let j=0; j<n; j++) {
    const colValues = vMatrix.map(row => row[j]);
    if (isBenefit[j]) {
      A_plus[j] = Math.max(...colValues);
      A_minus[j] = Math.min(...colValues);
    } else {
      A_plus[j] = Math.min(...colValues);
      A_minus[j] = Math.max(...colValues);
    }
  }

  const scores = matrix.map((item, idx) => {
    const v_row = vMatrix[idx];
    let d_plus_sq = 0, d_minus_sq = 0;
    for (let j=0; j<n; j++) {
      d_plus_sq += Math.pow(v_row[j] - A_plus[j], 2);
      d_minus_sq += Math.pow(v_row[j] - A_minus[j], 2);
    }
    const d_plus = Math.sqrt(d_plus_sq);
    const d_minus = Math.sqrt(d_minus_sq);
    const ci_score = (d_plus + d_minus) === 0 ? 0 : d_minus / (d_plus + d_minus);
    return { recipient_id: item.rp.user_id, raw: item.row, d_plus, d_minus, ci_score };
  });

  scores.sort((a,b) => b.ci_score - a.ci_score);

  db.prepare("DELETE FROM topsis_results WHERE donation_id = ?").run(donationId);

  const insertStmt = db.prepare(`INSERT INTO topsis_results (donation_id, recipient_id, rank_position, raw_c1, raw_c2, raw_c3, raw_c4, raw_c5, weight_c1, weight_c2, weight_c3, weight_c4, weight_c5, d_plus, d_minus, ci_score, calculated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const notifInsert = db.prepare("INSERT INTO notifications (user_id, title, message, type, is_read, related_donation_id, created_at) VALUES (?, ?, ?, 'donation_available', 0, ?, ?)");

  scores.forEach((s, idx) => {
    insertStmt.run(donationId, s.recipient_id, idx + 1, s.raw[0], s.raw[1], s.raw[2], s.raw[3], s.raw[4], w_j[0], w_j[1], w_j[2], w_j[3], w_j[4], s.d_plus, s.d_minus, s.ci_score, new Date().toISOString());

    if (idx === 0) {
      notifInsert.run(s.recipient_id, "Donasi Prioritas!", "Anda adalah prioritas utama untuk donasi: " + donation.food_name, donationId, new Date().toISOString());
    }
  });
}

export function runTopsisAllActive() {
  const activeDonations = db.prepare("SELECT id FROM donations WHERE status = 'active'").all() as any[];
  activeDonations.forEach((d: any) => calculateTopsisForDonation(d.id));
}
