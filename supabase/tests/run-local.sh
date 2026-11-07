#!/usr/bin/env bash
set -euo pipefail

for programa in initdb pg_ctl psql python3; do
  command -v "$programa" >/dev/null || { echo "Falta $programa en PATH." >&2; exit 1; }
done

proyecto="$(cd "$(dirname "$0")/../.." && pwd)"
cluster="$(mktemp -d "${TMPDIR:-/tmp}/mi-tienda-tests.XXXXXX")"
datos="$cluster/data"
mkdir "$cluster/socket"
limpiar() {
  if [[ -f "$datos/postmaster.pid" ]]; then
    pg_ctl -D "$datos" -m fast stop >/dev/null 2>&1 || true
  fi
  rm -rf -- "$cluster"
}
trap limpiar EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# Impide que una configuración de libpq heredada apunte a otra base.
unset PGSERVICE PGSERVICEFILE PGHOSTADDR PGOPTIONS PGPASSWORD
export PGHOST="$cluster/socket" PGPORT=5432 PGDATABASE=postgres PGUSER="$(id -un)"
initdb -D "$datos" -A trust --no-locale -E UTF8 >/dev/null
pg_ctl -D "$datos" -l "$cluster/server.log" \
  -o "-k $PGHOST -p $PGPORT -c listen_addresses=''" start >/dev/null || {
  cat "$cluster/server.log"
  exit 1
}

psql -X -v ON_ERROR_STOP=1 -q <<'SQL'
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
SQL

for archivo in schema sections checkout productos reservas consultas; do
  psql -X -v ON_ERROR_STOP=1 -q -f "$proyecto/supabase/$archivo.sql"
done
for archivo in productos reservas consultas; do
  psql -X -v ON_ERROR_STOP=1 -q -f "$proyecto/supabase/tests/$archivo.sql"
done
python3 "$proyecto/supabase/tests/reservas-concurrencia.py"
echo "OK: transacciones, reservas, pagos, cancelaciones y permisos en una base temporal aislada."
