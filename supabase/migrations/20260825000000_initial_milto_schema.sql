create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  created_by_id uuid references auth.users(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_entities_type_idx on public.app_entities(entity_type);
create index if not exists app_entities_owner_idx on public.app_entities(created_by_id);
create index if not exists app_entities_data_idx on public.app_entities using gin(data);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists app_entities_set_updated_at on public.app_entities;
create trigger app_entities_set_updated_at
before update on public.app_entities
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, data)
  values (
    new.id,
    new.email,
    jsonb_build_object('full_name', coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.app_entities enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.app_entities from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, email, data) on table public.profiles to authenticated;
grant update (email, data) on table public.profiles to authenticated;
grant select on table public.app_entities to anon;
grant select, insert, update, delete on table public.app_entities to authenticated;

create policy "Profiles are readable by owner or admin"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select private.is_admin()));

create policy "Users create their own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

create policy "Users update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Admins update profiles"
on public.profiles for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Public catalog is readable"
on public.app_entities for select to anon, authenticated
using (entity_type in ('Product', 'Branch', 'CoffeeOrigin', 'Event', 'Promotion'));

create policy "Users read their own records"
on public.app_entities for select to authenticated
using (
  created_by_id = (select auth.uid())
  or data ->> 'user_id' = (select auth.uid())::text
  or (select private.is_admin())
);

create policy "Users create their own records"
on public.app_entities for insert to authenticated
with check (
  (entity_type in ('Order', 'LoyaltyAccount', 'Notification', 'PushSubscription')
    and created_by_id = (select auth.uid()))
  or (select private.is_admin())
);

create policy "Users update their own records"
on public.app_entities for update to authenticated
using (created_by_id = (select auth.uid()) or (select private.is_admin()))
with check (created_by_id = (select auth.uid()) or (select private.is_admin()));

create policy "Users delete their own records"
on public.app_entities for delete to authenticated
using (created_by_id = (select auth.uid()) or (select private.is_admin()));

create or replace function public.set_event_registration_count(entity_id uuid, new_count integer)
returns public.app_entities
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed public.app_entities;
begin
  update public.app_entities
  set data = jsonb_set(data, '{registered_count}', to_jsonb(greatest(new_count, 0)), true)
  where id = entity_id and entity_type = 'Event'
  returning * into changed;
  return changed;
end;
$$;

revoke all on function public.set_event_registration_count(uuid, integer) from public;
grant execute on function public.set_event_registration_count(uuid, integer) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update set public = excluded.public;

create policy "Public assets are readable"
on storage.objects for select to anon, authenticated
using (bucket_id = 'assets');

create policy "Authenticated users upload assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'assets'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin()))
);

create policy "Owners update assets"
on storage.objects for update to authenticated
using (
  bucket_id = 'assets'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin()))
)
with check (
  bucket_id = 'assets'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin()))
);

create policy "Owners delete assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'assets'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin()))
);

alter publication supabase_realtime add table public.app_entities;
