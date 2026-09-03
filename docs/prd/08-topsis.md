# PRD NUTRI-SHARE — TOPSIS Algorithm Detail

---

## 8.1 Konsep

TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) adalah metode pengambilan keputusan multi-kriteria yang memilih alternatif berdasarkan jarak terdekat dari solusi ideal positif dan jarak terjauh dari solusi ideal negatif.

**Hybrid Entropy-TOPSIS** = Shannon Entropy untuk bobot objektif + TOPSIS untuk perankingan.

## 8.2 Lima Kriteria

| Kode | Nama              | Tipe          | Rumus                                                     |
| ---- | ----------------- | ------------- | --------------------------------------------------------- |
| C1   | Densitas Protein  | Benefit (max) | `min(100, (totalProtein / dailyProteinNeed) * 100)`       |
| C2   | Urgensi Kesehatan | Benefit (max) | `emergency == "active" ? urgency * 1000 : urgency`        |
| C3   | Kelayakan Pangan  | Benefit (max) | `max((validUntil - now) / 3600000, 0.1)`                  |
| C4   | Jangkauan Lokasi  | Cost (min)    | `haversine(pickup_lat, pickup_lon, recip_lat, recip_lon)` |
| C5   | Riwayat Bantuan   | Benefit (max) | `max((now - lastReceived) / 86400000, 0)` atau 30         |

**Benefit:** semakin besar nilai semakin baik
**Cost:** semakin kecil nilai semakin baik

## 8.3 Algoritma

### Step 1: Decision Matrix

```
X = [m × n] matrix
  m = jumlah penerima verified
  n = 5 (kriteria)
  X[i][j] = nilai kriteria j untuk penerima i
```

### Step 2: Normalisasi

```
R[i][j] = X[i][j] / sqrt(SUM(X[k][j]^2))
```

### Step 3: Entropy Weighting

```
P[i][j] = R[i][j] / SUM(R[k][j])                          # proporsi
E[j] = -1/ln(m) * SUM(P[i][j] * ln(P[i][j]))              # entropy
d[j] = max(0, 1 - E[j])                                    # divergence
w[j] = d[j] / SUM(d)                                       # bobot
```

### Step 4: Weighted Matrix

```
V[i][j] = R[i][j] * w[j]
```

### Step 5: Ideal Solutions

```
A+[j] = max(V[:][j]) jika benefit, min(V[:][j]) jika cost
A-[j] = min(V[:][j]) jika benefit, max(V[:][j]) jika cost
```

### Step 6: Euclidean Distance

```
D+[i] = sqrt(SUM((V[i][j] - A+[j])^2))
D-[i] = sqrt(SUM((V[i][j] - A-[j])^2))
```

### Step 7: Closeness Coefficient

```
CI[i] = D-[i] / (D+[i] + D-[i])
```

**CI = 1** → solusi ideal (terbaik)
**CI = 0** → solusi tidak ideal (terburuk)

### Step 8: Ranking

```
Rank 1 = CI tertinggi → prioritas klaim
Rank N = CI terendah
```

## 8.4 Trigger Points

| Kejadian                  | Aksi                                  | Biaya Komputasi           |
| ------------------------- | ------------------------------------- | ------------------------- |
| Donasi baru dibuat        | `calculate_topsis_for_donation(id)`   | ~2ms per 50 recipient     |
| Admin verifikasi penerima | `run_topsis_all_active()`             | ~20ms per 10 donasi aktif |
| Admin toggle emergency    | `run_topsis_all_active()`             | ~20ms per 10 donasi aktif |
| Admin klik "Run TOPSIS"   | `run_topsis_all_active()`             | ~20ms                     |
| Server startup            | `run_topsis_all_active()` di lifespan | ~20ms                     |
