-- Upgrade against the inspected 2026-10-27 schema; no historical rows are deleted.
-- Existing security migrations/schema must be present. No history is deleted.
begin;
alter table public.posts add column if not exists is_spoiler boolean not null default false;
grant select (is_spoiler), insert (is_spoiler), update (is_spoiler) on public.posts to authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  display_name text not null default '匿名旅人' check (char_length(btrim(display_name)) between 1 and 24),
  bio text not null default '' check (char_length(bio)<=180),
  avatar_path text not null default '',
  cover_path text not null default '',
  updated_at timestamptz not null default now(),
  constraint profile_avatar_owner check (avatar_path='' or avatar_path like user_id::text||'/avatar/%.webp'),
  constraint profile_cover_owner check (cover_path='' or cover_path like user_id::text||'/cover/%.webp')
);
alter table public.profiles enable row level security;
revoke all on public.profiles from public,anon,authenticated;
grant select,insert(user_id,display_name,bio,avatar_path,cover_path),update(display_name,bio,avatar_path,cover_path) on public.profiles to authenticated;
create policy "Read own private profile" on public.profiles for select to authenticated using (user_id=(select auth.uid()));
create policy "Create own private profile" on public.profiles for insert to authenticated with check (user_id=(select auth.uid()));
create policy "Update own private profile" on public.profiles for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

-- Public browsing must not reveal anonymous author IDs or spoiler bodies/media.
-- Base-table SELECT is now owner/admin only; explicit public projections below
-- are the only public read API. SECURITY DEFINER is intentional and bounded.
drop policy if exists "Read active posts" on public.posts;
drop policy if exists "Read active comments" on public.comments;
revoke all on public.posts from anon;
revoke all on public.claim_feed from anon,authenticated;
revoke all on public.claim_public_summaries from anon,authenticated;

create function private.market_post_feed()
returns table(id text,author_name text,category text,title text,body text,art text,palette text,ratio numeric,cover_image text,card_style text,status text,likes_count integer,is_deleted boolean,created_at timestamptz,is_spoiler boolean,is_mine boolean)
language sql stable security definer set search_path=''
as $$
 select p.id,p.author_name,p.category,p.title,
   case when p.is_spoiler or p.is_deleted then '' else p.body end,
   p.art,p.palette,p.ratio,
   case when p.is_spoiler or p.is_deleted then '' else p.cover_image end,
   p.card_style,p.status,p.likes_count,p.is_deleted,p.created_at,p.is_spoiler,
   coalesce(p.author_id=(select auth.uid()),false)
 from public.posts p where not p.is_deleted or p.author_id=(select auth.uid()) or private.is_admin();
$$;
revoke all on function private.market_post_feed() from public,anon,authenticated;
grant execute on function private.market_post_feed() to anon,authenticated;
create view public.post_feed with (security_invoker=true) as select * from private.market_post_feed();
revoke all on public.post_feed from public,anon,authenticated;
grant select on public.post_feed to anon,authenticated;

create function public.read_post_detail(post_key text,accept_spoiler boolean default false)
returns jsonb language plpgsql stable security definer set search_path=''
as $$ declare p public.posts;
begin
 select * into p from public.posts where id=post_key and not is_deleted;
 if not found then return null; end if;
 if p.is_spoiler and not accept_spoiler then raise exception '请先确认暴雷内容提示' using errcode='42501'; end if;
 return jsonb_build_object('body',p.body,'cover_image',p.cover_image);
end $$;
revoke all on function public.read_post_detail(text,boolean) from public,anon,authenticated;
grant execute on function public.read_post_detail(text,boolean) to anon,authenticated;

create function public.read_post_comments(post_key text,accept_spoiler boolean default false)
returns table(id text,author text,text text,media jsonb,created_at timestamptz,is_mine boolean)
language plpgsql stable security definer set search_path=''
as $$ begin
 if not exists(select 1 from public.posts p where p.id=post_key and not p.is_deleted and (not p.is_spoiler or accept_spoiler)) then raise exception '帖子不可访问或尚未确认暴雷提示' using errcode='42501'; end if;
 return query select c.id,c.author,c.text,c.media,c.created_at,coalesce(c.author_id=(select auth.uid()),false) from public.comments c where c.post_id=post_key and not c.is_deleted order by c.created_at,c.id;
end $$;
revoke all on function public.read_post_comments(text,boolean) from public,anon,authenticated;
grant execute on function public.read_post_comments(text,boolean) to anon,authenticated;

-- Summary query contains no nickname/note/media/delivery: fetch full details only
-- in a confirmed detail visit. Own raw rows remain accessible via existing RLS.
create function private.market_claim_feed()
returns table(uid text,post_id text,status text,hidden_before_done boolean,name text,note text,media jsonb,delivery jsonb,created_at timestamptz)
language sql stable security definer set search_path=''
as $$ select c.uid,c.post_id,c.status,c.hidden_before_done,null::text,null::text,null::jsonb,null::jsonb,c.created_at
 from public.claims c join public.posts p on p.id=c.post_id where not c.is_deleted and not p.is_deleted $$;
revoke all on function private.market_claim_feed() from public,anon,authenticated;
grant execute on function private.market_claim_feed() to anon,authenticated;
create or replace view public.claim_feed with (security_invoker=true) as select * from private.market_claim_feed();
revoke all on public.claim_feed from public,anon,authenticated;
grant select on public.claim_feed to anon,authenticated;

create function public.read_post_claims(post_key text,accept_spoiler boolean default false)
returns table(uid text,post_id text,status text,hidden_before_done boolean,name text,note text,media jsonb,delivery jsonb,created_at timestamptz,is_mine boolean)
language plpgsql stable security definer set search_path=''
as $$ begin
 if not exists(select 1 from public.posts p where p.id=post_key and not p.is_deleted and (not p.is_spoiler or accept_spoiler)) then raise exception '帖子不可访问或尚未确认暴雷提示' using errcode='42501'; end if;
 return query select c.uid,c.post_id,c.status,c.hidden_before_done,
 case when not c.hidden_before_done or c.status='done' or c.creator_id=(select auth.uid()) or private.is_admin() then c.name end,
 case when not c.hidden_before_done or c.status='done' or c.creator_id=(select auth.uid()) or private.is_admin() then c.note end,
 case when not c.hidden_before_done or c.status='done' or c.creator_id=(select auth.uid()) or private.is_admin() then c.media end,
 case when not c.hidden_before_done or c.status='done' or c.creator_id=(select auth.uid()) or private.is_admin() then c.delivery end,
 c.created_at,coalesce(c.creator_id=(select auth.uid()),false)
 from public.claims c where c.post_id=post_key and not c.is_deleted order by c.created_at,c.uid;
end $$;
revoke all on function public.read_post_claims(text,boolean) from public,anon,authenticated;
grant execute on function public.read_post_claims(text,boolean) to anon,authenticated;

-- Let an owner withdraw and later reclaim, retaining the withdrawn history.
alter table public.claims drop constraint if exists claims_post_id_creator_id_key;
create unique index claims_active_creator_unique on public.claims(post_id,creator_id) where not is_deleted;
alter table public.posts add constraint post_write_lengths check (char_length(btrim(title)) between 2 and 65 and char_length(btrim(body)) between 1 and 1800 and char_length(author_name) between 1 and 24 and char_length(category) between 1 and 16) not valid;
alter table public.comments add constraint comment_write_length check(char_length(text)<=500 and char_length(author)<=24) not valid;
alter table public.claims add constraint claim_write_lengths check(char_length(name) between 1 and 24 and char_length(note) between 1 and 850) not valid;
alter table public.claims add constraint claim_done_location check(status<>'done' or char_length(btrim(coalesce(delivery->>'location',''))) between 1 and 260) not valid;
create index posts_owner_created on public.posts(author_id,created_at desc);
create index comments_owner_created on public.comments(author_id,created_at desc);
create index favorites_owner_created on public.favorites(user_id,created_at desc);
create index likes_owner_created on public.likes(user_id,created_at desc);

-- No user may restore a moderation removal or change protected ownership fields.
-- Column grants from the prior migration already protect ids/created_at/status.
create function private.guard_content_restore() returns trigger
language plpgsql security definer set search_path=''
as $$ begin
 if old.is_deleted and not private.is_admin() then raise exception '已删除记录只能由管理员核查恢复' using errcode='42501'; end if;
 return new;
end $$;
revoke all on function private.guard_content_restore() from public,anon,authenticated;
create trigger guard_post_restore before update on public.posts for each row execute function private.guard_content_restore();
create trigger guard_claim_restore before update on public.claims for each row execute function private.guard_content_restore();
create trigger guard_comment_restore before update on public.comments for each row execute function private.guard_content_restore();

-- Private profile images are not exposed through public author avatars.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('profile-media','profile-media',false,2097152,array['image/webp'])
on conflict(id) do nothing;
create policy "Read own profile images" on storage.objects for select to authenticated
using(bucket_id='profile-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Upload own profile images" on storage.objects for insert to authenticated
with check(bucket_id='profile-media' and (storage.foldername(name))[1]=(select auth.uid())::text
 and (storage.foldername(name))[2] in ('avatar','cover') and storage.extension(name)='webp');
create policy "Delete own profile images" on storage.objects for delete to authenticated
using(bucket_id='profile-media' and (storage.foldername(name))[1]=(select auth.uid())::text);

-- Transactional rolling quota (serializes per Auth identity). This is independent
-- of local clocks/buttons and also covers repeated uploads and empty profiles.
create table private.write_budgets(user_id uuid not null,kind text not null,window_start timestamptz not null default now(),count integer not null default 0,primary key(user_id,kind));
revoke all on private.write_budgets from public,anon,authenticated;
create function private.limit_market_writes() returns trigger
language plpgsql security definer set search_path=''
as $$ declare used integer; cap integer;
begin
 if (select auth.uid()) is null then return new; end if;
 if tg_table_schema='storage' then
   if new.bucket_id not in ('profile-media','wish-media','claim-media') then return new; end if;
 end if;
 cap:=case when tg_table_name='objects' then 12 when tg_table_name='posts' then 6 else 30 end;
 insert into private.write_budgets as b(user_id,kind,count) values((select auth.uid()),tg_table_name,1)
 on conflict(user_id,kind) do update set count=case when b.window_start<now()-interval '10 minutes' then 1 else b.count+1 end,
 window_start=case when b.window_start<now()-interval '10 minutes' then now() else b.window_start end returning count into used;
 if used>cap then raise exception '操作太频繁，请稍后再试' using errcode='P0001'; end if;
 return new;
end $$;
revoke all on function private.limit_market_writes() from public,anon,authenticated;
create trigger limit_post_writes before insert on public.posts for each row execute function private.limit_market_writes();
create trigger limit_comment_writes before insert on public.comments for each row execute function private.limit_market_writes();
create trigger limit_claim_writes before insert on public.claims for each row execute function private.limit_market_writes();
create trigger limit_profile_uploads before insert on storage.objects for each row execute function private.limit_market_writes();

-- Unused legacy function is not an exposed API; keep its body for rollback.
alter function public.check_max_claims() set search_path='';
revoke all on function public.check_max_claims() from public,anon,authenticated;
-- Only the validated Edge endpoint uploads objects. Existing object read policies remain.
drop policy if exists "Upload own profile images" on storage.objects;
drop policy if exists "Authenticated users upload own public media" on storage.objects;
drop policy if exists "Creator can upload private claim media" on storage.objects;
create function public.reserve_media_upload() returns void
language plpgsql security definer set search_path=''
as $$ declare used integer;begin
 if (select auth.uid()) is null then raise exception '请先登录' using errcode='42501';end if;
 insert into private.write_budgets as b(user_id,kind,count) values((select auth.uid()),'validated-upload',1)
 on conflict(user_id,kind) do update set count=case when b.window_start<now()-interval '10 minutes' then 1 else b.count+1 end,
 window_start=case when b.window_start<now()-interval '10 minutes' then now() else b.window_start end returning count into used;
 if used>12 then raise exception '图片上传太频繁，请稍后再试';end if;
end $$;
revoke all on function public.reserve_media_upload() from public,anon,authenticated;
grant execute on function public.reserve_media_upload() to authenticated;
create function public.my_market_history() returns jsonb
language sql stable security definer set search_path=''
as $$ select jsonb_build_object(
 'claims',coalesce((select jsonb_agg(jsonb_build_object('uid',c.uid,'post_id',c.post_id,'title',p.title,'category',p.category,'is_spoiler',p.is_spoiler,'post_deleted',p.is_deleted,'is_deleted',c.is_deleted,'status',c.status,'created_at',c.created_at,'delivery',c.delivery) order by c.created_at desc,c.uid) from public.claims c join public.posts p on p.id=c.post_id where c.creator_id=(select auth.uid())),'[]'::jsonb),
 'comments',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'post_id',c.post_id,'title',p.title,'category',p.category,'is_spoiler',p.is_spoiler,'post_deleted',p.is_deleted,'is_deleted',c.is_deleted,'text',c.text,'created_at',c.created_at) order by c.created_at desc,c.id) from public.comments c join public.posts p on p.id=c.post_id where c.author_id=(select auth.uid())),'[]'::jsonb)
 ) $$;
revoke all on function public.my_market_history() from public,anon,authenticated;
grant execute on function public.my_market_history() to authenticated;

create or replace function private.audit_moderation_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare action_name text; post_key text; item_key text; label text;
begin
  if tg_table_name='posts' then
    if old.is_deleted is not distinct from new.is_deleted then return new; end if;
    post_key:=new.id; item_key:=new.id; label:=new.title;
    action_name:=case when new.is_deleted then 'post_soft_delete' else 'post_restore' end;
  elsif tg_table_name='claims' then
    if old.is_deleted is not distinct from new.is_deleted then return new; end if;
    post_key:=new.post_id; item_key:=new.uid; label:='creator claim';
    action_name:=case when new.is_deleted then 'claim_soft_delete' else 'claim_restore' end;
  elsif tg_table_name='comments' then
    if old.is_deleted is not distinct from new.is_deleted then return new; end if;
    post_key:=new.post_id; item_key:=new.id; label:='comment';
    action_name:=case when new.is_deleted then 'comment_soft_delete' else 'comment_restore' end;
  elsif tg_table_name='reports' then
    if old.resolved is not distinct from new.resolved then return new; end if;
    post_key:=new.post_id; item_key:=new.id; label:=new.reason;
    action_name:=case when new.resolved then 'report_resolved' else 'report_reopened' end;
  else return new;
  end if;
  if not private.is_admin() then return new; end if;
  insert into public.moderation_logs(action,title,post_id,extra,admin_id)
  values(action_name,label,post_key,tg_table_name||':'||item_key||case when nullif(current_setting('mimu.moderation_reason',true),'') is not null then ' · '||left(current_setting('mimu.moderation_reason',true),500) else '' end,(select auth.uid()));
  return new;
end $$;

-- Authorized moderation is atomic and writes the existing audit trigger plus reason.
create function public.moderate_market_item(item_kind text,item_key text,removed boolean,reason text default '') returns void
language plpgsql security invoker set search_path=''
as $$ begin
 if not private.is_admin() then raise exception '需要管理员身份' using errcode='42501';end if;
 perform set_config('mimu.moderation_reason',left(reason,500),true);
 if item_kind='posts' then update public.posts set is_deleted=removed where id=item_key;
 elsif item_kind='claims' then update public.claims set is_deleted=removed where uid=item_key;
 elsif item_kind='comments' then update public.comments set is_deleted=removed where id=item_key;
 else raise exception '不支持的管理对象';end if;
 if not found then raise exception '记录不存在';end if;
 -- The server trigger writes the audit record. A second explicit record is avoided.
end $$;
revoke all on function public.moderate_market_item(text,text,boolean,text) from public,anon,authenticated;
grant execute on function public.moderate_market_item(text,text,boolean,text) to authenticated;
-- Prevent a visible forged claim from granting access to another creator's
-- private object. Media paths are always bound to the immutable creator id.
create function private.validate_attached_media() returns trigger
language plpgsql security invoker set search_path=''
as $$ declare owner_key text;expected_bucket text;expected_folder text;begin
 if new.media is null then return new;end if;
 if tg_table_name='claims' then owner_key:=new.creator_id::text;expected_bucket:='claim-media';expected_folder:='claims';
 else owner_key:=new.author_id::text;expected_bucket:='wish-media';expected_folder:='comments';end if;
 if new.media->>'method'='upload' then
   if new.media->>'bucket' is distinct from expected_bucket or not starts_with(coalesce(new.media->>'src',''),owner_key||'/'||expected_folder||'/') then raise exception '图片不属于当前内容作者' using errcode='42501';end if;
 elsif new.media->>'method'='url' then
   if coalesce(new.media->>'src','') !~ '^https://[^[:space:]]+$' or char_length(new.media->>'src')>2000 then raise exception '图片链接必须为 HTTPS';end if;
 else raise exception '图片来源不正确';end if;
 return new;
end $$;
revoke all on function private.validate_attached_media() from public,anon,authenticated;
create trigger validate_claim_media before insert or update of media on public.claims for each row execute function private.validate_attached_media();
create trigger validate_comment_media before insert or update of media on public.comments for each row execute function private.validate_attached_media();
create or replace function private.can_read_claim_media(object_name text)
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.claims c join public.posts p on p.id=c.post_id where not c.is_deleted and c.media->>'src'=object_name
 and split_part(object_name,'/',1)=c.creator_id::text
 and (c.creator_id=(select auth.uid()) or private.is_admin() or (not p.is_deleted and (not c.hidden_before_done or c.status='done')))) $$;
commit;
