-- Ejecutar después de reservas.sql en Supabase.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('liberar-reservas-tienda', '* * * * *',
  'select public.liberar_reservas_vencidas();');
