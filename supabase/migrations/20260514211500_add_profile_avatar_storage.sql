alter table public.profiles
  add column if not exists avatar_storage_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists profile_avatars_objects_select on storage.objects;
drop policy if exists profile_avatars_objects_insert on storage.objects;
drop policy if exists profile_avatars_objects_update on storage.objects;
drop policy if exists profile_avatars_objects_delete on storage.objects;

create policy profile_avatars_objects_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

create policy profile_avatars_objects_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

create policy profile_avatars_objects_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

create policy profile_avatars_objects_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);
