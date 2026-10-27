-- Minimal structural fixture based on the read-only 2026-10-27 schema audit.
-- Not a production bootstrap or a copy of production user data.
create role anon; create role authenticated;
create schema auth;create schema storage;
create table auth.users(id uuid primary key,aud text,role text);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth,storage to anon,authenticated;
grant execute on function auth.uid() to anon,authenticated;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,metadata jsonb,created_at timestamptz default now());
alter table storage.objects enable row level security;
grant select,insert,delete on storage.objects to authenticated;grant select on storage.objects to anon;
create function storage.foldername(text) returns text[] language sql immutable as $$select (string_to_array($1,'/'))[1:array_length(string_to_array($1,'/'),1)-1]$$;
create function storage.extension(text) returns text language sql immutable as $$select reverse(split_part(reverse($1),'.',1))$$;
create table public.admin_roles(user_id uuid primary key references auth.users(id),email text,created_at timestamptz default now());
create table public.posts(id text primary key default gen_random_uuid()::text,author_id uuid default auth.uid(),author_name text default '匿名旅人',category text default '主题美化',title text,body text,art text default 'chat',palette text default 'pink',ratio numeric default .82,cover_image text default '',status text default 'open' check(status in ('open','claimed','working','done')),likes_count integer default 0,is_deleted boolean not null default false,moderation jsonb,created_at timestamptz default now());
create table public.claims(uid text primary key default gen_random_uuid()::text,post_id text references public.posts(id),creator_id uuid default auth.uid(),name text,note text,status text default 'claimed' check(status in ('claimed','working','done')),hidden_before_done boolean not null default true,media jsonb,delivery jsonb,created_at timestamptz default now(),unique(post_id,creator_id));
create table public.comments(id text primary key default gen_random_uuid()::text,post_id text references public.posts(id),author_id uuid default auth.uid(),author text default '匿名旅人',text text default '',media jsonb,created_at timestamptz default now());
create table public.likes(post_id text references public.posts(id),user_id uuid default auth.uid(),created_at timestamptz default now(),primary key(post_id,user_id));
create table public.favorites(post_id text references public.posts(id),user_id uuid default auth.uid(),created_at timestamptz default now(),primary key(post_id,user_id));
create table public.reports(id text primary key default gen_random_uuid()::text,post_id text references public.posts(id),reporter_id uuid default auth.uid(),reason text,note text default '',resolved boolean default false,created_at timestamptz default now());
create table public.moderation_logs(id bigserial primary key,action text,title text,post_id text,extra text,admin_id uuid default auth.uid(),created_at timestamptz default now());
create function public.is_admin() returns boolean language sql as $$select false$$;
create function public.check_max_claims() returns trigger language plpgsql as $$begin return new;end$$;
create function public.sync_post_status() returns trigger language plpgsql as $$begin return new;end$$;
create function public.rls_auto_enable() returns event_trigger language plpgsql as $$begin end$$;
