# PRD NUTRI-SHARE — Notifikasi & Gamification

---

## 9.1 Notifikasi Real-Time (SSE)

### Arsitektur

```
Browser ──EventSource──► FastAPI ──asyncio.Queue──► SSEManager
                           │
                           └── Database: notifications table
```

### Event Types

| Tipe                 | Trigger               | Dikirim ke               | Pesan                                                   |
| -------------------- | --------------------- | ------------------------ | ------------------------------------------------------- |
| `donation_available` | Donasi dipublikasi    | Semua penerima verified  | "Donasi {food} sejumlah {n} porsi telah dipublikasikan" |
| `claim_approved`     | Admin approve klaim   | Donor + penerima terkait | "Donasi {food} telah disetujui"                         |
| `verification`       | Admin verifikasi user | User terkait             | "Akun Anda telah diverifikasi"                          |
| `system`             | Klaim baru, emergency | Semua admin              | "Donasi {food} diklaim oleh {institution}"              |

### SSE Implementation

**Endpoint:** `GET /api/notifications/subscribe?user_id=N`

**Response Type:** `text/event-stream`

**Flow:**

```
1. Koneksi → "data: connected\n\n"
2. Event → "data: {json}\n\n"
3. Keepalive (30s) → ":ping\n\n"
4. Disconnect → cleanup queue
```

**Fallback:** Polling `GET /api/notifications?user_id=N` setiap 30 detik

### Notifikasi di Frontend

```typescript
// DonorDashboard / RecipientDashboard
useEffect(() => {
  const es = new EventSource(`/api/notifications/subscribe?user_id=${user.id}`);
  es.onmessage = (e) => {
    if (e.data === "connected") return;
    const data = JSON.parse(e.data);
    setNotifications((prev) => [data, ...prev]);
    toast.success(data.title);
  };
  return () => es.close();
}, [user.id]);
```

## 9.2 Gamification

### Badge System

| Badge            | Icon | Threshold          | Deskripsi                            |
| ---------------- | ---- | ------------------ | ------------------------------------ |
| Donator Pemula   | 🌱   | ≥ 1 donasi         | "Donasi pertama Anda!"               |
| Donator Aktif    | ⭐   | ≥ 5 donasi         | "5 donasi telah disalurkan"          |
| Pahlawan Pangan  | 🏆   | ≥ 10 donasi        | "10 donasi — dampak luar biasa!"     |
| Legenda Donasi   | 👑   | ≥ 20 donasi        | "20+ donasi, sungguh menginspirasi!" |
| Favorit Penerima | ❤️   | ≥ 5 ulasan positif | "5+ ulasan positif dari penerima"    |

### Top Donors Leaderboard

**Endpoint:** `GET /api/public/top-donors`

**SQL:** `SELECT * FROM donor_profiles ORDER BY total_donations DESC LIMIT 3`

**Enrichment:** average rating dari `reviews` table per donor

**Tampilan:**

- Rank #1 → gradient emas + 🏆
- Rank #2 → gradient perak + 🥈
- Rank #3 → gradient perunggu + 🥉
- Logo bisnis, nama, jumlah donasi, rating bintang

### AKG Daily Nutrition (Non-Gamifikasi tapi Related)

**Endpoint:** `GET /api/recipient/akg?user_id=N`

Menampilkan persentase pemenuhan gizi harian:

- Protein (gram)
- Kalori (kkal)
- Zat Besi (mg)
- Vitamin C (mg)

Ditampilkan di RecipientDashboard dalam radar chart + progress bars.
