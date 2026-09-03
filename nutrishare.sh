#!/usr/bin/env bash
set -euo pipefail

# NutriShare Runner — start/stop/test/view
# Usage: ./nutrishare.sh [command]

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PID_FILE="${TMPDIR:-/tmp}/nutrishare-backend.pid"
FRONTEND_PID_FILE="${TMPDIR:-/tmp}/nutrishare-frontend.pid"
BACKEND_PORT=3000
FRONTEND_PORT=5173

# ── helpers ──────────────────────────────────────────────────────
info()  { printf "\033[1;34m ▶\033[0m %s\n" "$*"; }
ok()    { printf "\033[1;32m ✓\033[0m %s\n" "$*"; }
err()   { printf "\033[1;31m ✗\033[0m %s\n" "$*" >&2; }

cleanup_pid() {
  local file=$1 name=$2 port=$3
  if [[ -f "$file" ]]; then
    pid=$(cat "$file")
    if kill "$pid" 2>/dev/null; then
      ok "$name (PID $pid) dihentikan"
    else
      info "$name sudah tidak berjalan"
    fi
    rm -f "$file"
  fi
  # fallback: cari proses yang masih terlanjur jalan di port
  local existing
  existing=$(lsof -ti "tcp:$port" 2>/dev/null || true)
  if [[ -n "$existing" ]]; then
    kill "$existing" 2>/dev/null || true
    ok "Proses lama di port $port dibersihkan"
  fi
}

# ── commands ─────────────────────────────────────────────────────
start_backend() {
  info "Menjalankan backend di http://localhost:$BACKEND_PORT ..."
  cd "$APP_DIR"
  .venv/bin/uvicorn backend.main:app --reload --port "$BACKEND_PORT" &
  echo $! > "$BACKEND_PID_FILE"
  ok "Backend berjalan (PID $(cat "$BACKEND_PID_FILE"))"
}

start_frontend() {
  info "Menjalankan frontend di http://localhost:$FRONTEND_PORT ..."
  cd "$APP_DIR/frontend"
  npm run dev &
  echo $! > "$FRONTEND_PID_FILE"
  ok "Frontend berjalan (PID $(cat "$FRONTEND_PID_FILE"))"
}

cmd_start() {
  start_backend
  start_frontend
  echo ""
  info "Akses:"
  printf "   Frontend  → \033[1mhttp://localhost:%d\033[0m\n" "$FRONTEND_PORT"
  printf "   Backend   → \033[1mhttp://localhost:%d\033[0m\n" "$BACKEND_PORT"
  printf "   Docs API  → \033[1mhttp://localhost:%d/docs\033[0m\n" "$BACKEND_PORT"
  echo ""
  info "Jalankan './nutrishare.sh stop' untuk menghentikan semua"
}

cmd_stop() {
  echo ""
  cleanup_pid "$FRONTEND_PID_FILE" "Frontend" "$FRONTEND_PORT"
  cleanup_pid "$BACKEND_PID_FILE" "Backend" "$BACKEND_PORT"
  echo ""
  ok "Semua proses dihentikan"
}

cmd_restart() {
  cmd_stop
  sleep 1
  cmd_start
}

cmd_status() {
  local any=0
  echo ""
  for trio in "$BACKEND_PID_FILE:Backend:$BACKEND_PORT" "$FRONTEND_PID_FILE:Frontend:$FRONTEND_PORT"; do
    IFS=':' read -r file name port <<< "$trio"
    if [[ -f "$file" ]]; then
      pid=$(cat "$file")
      if kill -0 "$pid" 2>/dev/null; then
        ok "$name berjalan (PID $pid) → http://localhost:$port"
        any=1
      else
        err "$name tidak berjalan (PID $pid sudah mati)"
        rm -f "$file"
      fi
    else
      err "$name tidak berjalan"
    fi
  done
  echo ""
  [[ $any -eq 1 ]]
}

cmd_test() {
  info "Menjalankan backend tests ..."
  cd "$APP_DIR"
  .venv/bin/pytest backend/tests/ -x -q "${@:2}"
}

cmd_menu() {
  echo ""
  printf "\033[1mNutriShare — Menu\033[0m\n"
  echo ""
  echo "  1) Start (backend + frontend)"
  echo "  2) Stop"
  echo "  3) Restart"
  echo "  4) Status"
  echo "  5) Test"
  echo "  q) Keluar"
  echo ""
  read -rp "Pilihan [1-5/q]: " choice
  echo ""
  case "$choice" in
    1) cmd_start   ;;
    2) cmd_stop    ;;
    3) cmd_restart ;;
    4) cmd_status  ;;
    5) cmd_test    ;;
    q|Q) exit 0    ;;
    *) err "Pilihan tidak valid"; cmd_menu ;;
  esac
}

# ── main ─────────────────────────────────────────────────────────
case "${1:-}" in
  start|--start)    cmd_start  ;;
  stop|--stop)      cmd_stop   ;;
  restart|--restart) cmd_restart ;;
  status|--status)  cmd_status ;;
  test|--test)      cmd_test "$@" ;;
  menu|--menu|"")   cmd_menu   ;;
  *)
    echo "Penggunaan: ./nutrishare.sh [start|stop|restart|status|test|menu]"
    exit 1
    ;;
esac
