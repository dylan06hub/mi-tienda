-- Bucket público para las imágenes de productos.
-- Ejecutar una vez en el SQL Editor de Supabase. Es idempotente.
-- La subida se hace desde el servidor con service_role, por eso no hacen
-- falta políticas de escritura; la lectura es pública vía URL.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'productos',
  'productos',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
