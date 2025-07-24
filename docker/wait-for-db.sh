#!/usr/bin/env bash
set -e

host="${POSTGRES_HOST:-db}"
port="${POSTGRES_PORT:-5432}"

echo "Waiting for postgres at $host:$port..."
until nc -z "$host" "$port"; do
  sleep 1
done
echo "Postgres is up."

exec "$@"
