# Deploy NutriShare ke Render (Gratis)

## 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/nutrishare.git
git push -u origin main
```

## 2. Deploy di Render

1. Buka [render.com](https://render.com)
2. Login dengan GitHub
3. Klik **"New +"** → **"Web Service"**
4. Pilih repo NutriShare
5. Isi:

| Field | Isi |
|-------|-----|
| Name | `nutrishare` |
| Runtime | `Node` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Plan | **Free** |

6. Klik **"Advanced"** → **"Add Environment Variable"**:

```
NODE_ENV=production
JWT_SECRET=generate-random-string-32-chars
ADMIN_SECRET_KEY=generate-random-string-32-chars
PORT=3000
ALLOWED_ORIGINS=https://nutrishare.onrender.com
```

7. Klik **"Create Web Service"**

## 3. Setup Admin

Setelah deploy, buat admin via curl atau browser console:

```bash
curl -X POST https://nutrishare.onrender.com/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@nutrishare.id","password":"admin123","admin_key":"ADMIN_SECRET_KEY"}'
```

> ⚠️ Render free tier akan **sleep** setelah 15 menit tidak dipakai.
> Request pertama setelah idle akan lambat (~30 detik).
> Untuk menghilangkan sleep, upgrade ke Starter ($7/bulan).
