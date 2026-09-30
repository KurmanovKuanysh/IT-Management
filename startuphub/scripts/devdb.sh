#!/usr/bin/env bash
# Локальный PostgreSQL для разработки без Docker.
# Кластер живёт в .pgdata/, слушает 127.0.0.1:5434, авторизация trust.
#
#   ./scripts/devdb.sh start|stop|status|psql|reset
#
# Если у вас уже есть свой Postgres, этот скрипт не нужен —
# достаточно поправить DATABASE_URL в .env.

set -euo pipefail

# Берём старшую установленную версию, в которой есть initdb.
# Свой путь можно передать явно: PGBIN=... ./scripts/devdb.sh start
if [ -z "${PGBIN:-}" ]; then
    PGBIN="$(ls -d "/c/Program Files/PostgreSQL"/*/bin 2>/dev/null | sort -V | while read -r d; do
        if [ -x "$d/initdb.exe" ]; then echo "$d"; fi; done | tail -1)"
fi
if [ -z "$PGBIN" ] || [ ! -x "$PGBIN/initdb.exe" ]; then
    echo "PostgreSQL с initdb не найден. Укажите PGBIN=путь/к/bin" >&2
    exit 1
fi
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA="$ROOT/.pgdata"
PORT="${DEV_DB_PORT:-5434}"
DBNAME="${DEV_DB_NAME:-startuphub}"
DBUSER="${DEV_DB_USER:-startuphub}"

export PGCLIENTENCODING=UTF8

init() {
    [ -d "$DATA" ] && return 0
    "$PGBIN/initdb.exe" -D "$DATA" -U "$DBUSER" \
        --auth-local=trust --auth-host=trust -E UTF8 --locale=C > /dev/null
}

start() {
    init
    # Дескрипторы закрываем, иначе pg_ctl держит консоль и команда «висит».
    "$PGBIN/pg_ctl.exe" -D "$DATA" \
        -o "-p $PORT -c listen_addresses=127.0.0.1" \
        -l "$DATA/server.log" start > /dev/null 2>&1 < /dev/null || true
    "$PGBIN/psql.exe" -h 127.0.0.1 -p "$PORT" -U "$DBUSER" -d postgres \
        -tAc "SELECT 1 FROM pg_database WHERE datname='$DBNAME'" | grep -q 1 \
        || "$PGBIN/createdb.exe" -h 127.0.0.1 -p "$PORT" -U "$DBUSER" -O "$DBUSER" "$DBNAME"
    echo "PostgreSQL слушает 127.0.0.1:$PORT, база $DBNAME"
}

case "${1:-start}" in
    start)  start ;;
    stop)   "$PGBIN/pg_ctl.exe" -D "$DATA" -m fast stop > /dev/null 2>&1 < /dev/null ;;
    status) "$PGBIN/pg_ctl.exe" -D "$DATA" status ;;
    psql)   shift; "$PGBIN/psql.exe" -h 127.0.0.1 -p "$PORT" -U "$DBUSER" -d "$DBNAME" "$@" ;;
    reset)
        "$PGBIN/pg_ctl.exe" -D "$DATA" -m fast stop > /dev/null 2>&1 < /dev/null || true
        rm -rf "$DATA"
        start
        ;;
    *) echo "usage: $0 start|stop|status|psql|reset" >&2; exit 2 ;;
esac
