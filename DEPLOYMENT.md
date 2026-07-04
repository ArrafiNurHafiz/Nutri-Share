# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `NODE_ENV=production`
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `ADMIN_SECRET_KEY` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (e.g., `https://yourdomain.com,https://www.yourdomain.com`)
- `PORT` - Server port (default: 3000)

Optional:
- `LOG_LEVEL` - Logging level: debug, info, warn, error (default: info in production)
- `DB_PATH` - Custom database path (default: `data/nutrishare.db`)

### 2. Build the Application

```bash
npm install
npm run build
```

This creates:
- `dist/` - Frontend build (Vite)
- `dist/server.cjs` - Backend bundle (esbuild)

### 3. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### 4. Start the Application

```bash
pm2 start ecosystem.config.cjs --env production
```

### 5. Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

This ensures the application restarts automatically on server reboot.

### 6. Configure Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/nutrishare`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/nutrishare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 8. Firewall Configuration

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 9. Database Backup

Create a backup script `/usr/local/bin/backup-nutrishare.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/nutrishare"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
sqlite3 /path/to/nutrishare/data/nutrishare.db ".backup '$BACKUP_DIR/nutrishare_$DATE.db'"

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /path/to/nutrishare/public/uploads/

# Keep only last 7 days
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make it executable and add to cron:
```bash
sudo chmod +x /usr/local/bin/backup-nutrishare.sh
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-nutrishare.sh
```

### 10. Monitoring

Check application status:
```bash
pm2 status
pm2 logs nutrishare
pm2 monit
```

Check Nginx status:
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Performance Optimizations

### Image Compression
Images are already compressed to WebP format (85% size reduction).

### Bundle Analysis
- Total JS: 804 KB (255 KB gzipped)
- Total CSS: 54 KB (14 KB gzipped)
- Total Images: ~770 KB (WebP)
- Code splitting: All routes lazy loaded

### Database Optimization
- WAL mode enabled
- Busy timeout: 5000ms
- Synchronous: NORMAL
- Foreign keys: ON

## Security Features

- JWT authentication with HTTP-only cookies
- CORS whitelist
- Helmet security headers
- Content Security Policy
- Rate limiting (login: 5/min, upload: 10/min, general: 100/15min)
- bcrypt password hashing (cost factor 10)
- Input validation with Zod
- SQL injection prevention (parameterized queries)

## Troubleshooting

### Application won't start
```bash
pm2 logs nutrishare --err
```

### Database locked
Check for long-running queries or increase `busy_timeout` in `server/db.ts`.

### High memory usage
```bash
pm2 show nutrishare
```
Adjust `max_memory_restart` in `ecosystem.config.cjs`.

### CORS errors
Verify `ALLOWED_ORIGINS` in `.env` includes your domain.

### SSL certificate expires
```bash
sudo certbot renew
```

## Rollback Procedure

If deployment fails:
```bash
pm2 stop nutrishare
# Restore previous build
pm2 start nutrishare
```

## Support

For issues, check:
1. PM2 logs: `pm2 logs nutrishare`
2. Nginx logs: `/var/log/nginx/error.log`
3. Application logs: `logs/` directory
