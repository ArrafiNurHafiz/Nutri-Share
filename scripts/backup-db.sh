#!/usr/bin/env bash
# ============================================
#  NUTRI-SHARE — Database Backup Script
#  Usage: ./scripts/backup-db.sh
#  Cron: 0 3 * * * /path/to/scripts/backup-db.sh
# ============================================

set -e

DIR="$(cd "$(dirname "$0")/../data" && pwd)"
BACKUP_DIR="$DIR/backup"

# Buat folder backup
mkdir -p "$BACKUP_DIR"

# Hapus WAL lock dengan checkpoint
sqlite3 "$DIR/nutrishare.db" "PRAGMA wal_checkpoint(TRUNCATE);" 2>/dev/null || true

# Backup file
DATE=$(date +%Y%m%d_%H%M%S)
cp "$DIR/nutrishare.db" "$BACKUP_DIR/nutrishare-$DATE.db"

# Hapus backup lebih dari 30 hari
find "$BACKUP_DIR" -name "nutrishare-*.db" -mtime +30 -delete

echo "✅ Database backup: $BACKUP_DIR/nutrishare-$DATE.db"
echo "   Size: $(du -h "$BACKUP_DIR/nutrishare-$DATE.db" | cut -f1)"
