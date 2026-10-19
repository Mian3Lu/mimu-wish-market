-- Security baseline for the existing mimu-wish-market schema.
-- Existing user data is retained; comments and claims gain recoverable removal flags.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_roles r where r.user_id = (select auth.uid()));
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

alter table public.claims add column if not exists is_deleted boolean not null default false;
alter table public.comments add column if not exists is_deleted boolean not null default false;
alter table public.posts add column if not exists card_style text not null default 'art';
alter table public.posts drop constraint if exists posts_card_style_check;
alter table public.posts add constraint posts_card_style_check check (card_style in ('art','text','image'));
alter table public.claims alter column is_deleted set default false;
alter table public.comments alter column is_deleted set default false;

-- Hide creator details behind a deliberately narrow feed projection.
create or replace view public.claim_feed with (security_barrier = true) as
select c.uid, c.post_id,
  case when (not c.hidden_before_done or c.status = 'done' or c.creator_id = (select auth.uid()) or private.is_admin()) then c.creator_id end as creator_id,
  (c.creator_id = (select auth.uid())) as is_mine,
  case when (not c.hidden_before_done or c.status = 'done' or c.creator_id = (select auth.uid()) or private.is_admin()) then c.name end as name,
  case when (not c.hidden_before_done or c.status = 'done' or c.creator_id = (select auth.uid()) or private.is_admin()) then c.note end as note,
  c.status, c.hidden_before_done,
  case when (not c.hidden_before_done or c.status = 'done' or c.creator_id = (select auth.uid()) or private.is_admin()) then c.media end as media,
  case when (c.status = 'done' or c.creator_id = (select auth.uid()) or private.is_admin()) then c.delivery end as delivery,
  c.created_at
from public.claims c where not c.is_deleted;
revoke all on public.claim_feed from public;
grant select on public.claim_feed to anon, authenticated;

create or replace function private.can_read_claim_media(object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.claims c
    where not c.is_deleted and c.media ->> 'src' = object_name
      and (c.creator_id = (select auth.uid()) or not c.hidden_before_done or c.status = 'done' or private.is_admin()));
$$;
revoke all on function private.can_read_claim_media(text) from public;
grant execute on function private.can_read_claim_media(text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('claim-media','claim-media',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
update storage.buckets set file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'] where id='wish-media';

drop policy if exists "Authenticated users can upload wish-media" on storage.objects;
drop policy if exists "Public can view wish-media" on storage.objects;
drop policy if exists "Creator can upload private claim media" on storage.objects;
drop policy if exists "Allowed viewers can read private claim media" on storage.objects;
drop policy if exists "Creator or admin can delete private claim media" on storage.objects;
create policy "Public can view wish-media" on storage.objects for select to anon,authenticated using (bucket_id='wish-media');
create policy "Authenticated users upload own public media" on storage.objects for insert to authenticated
with check (bucket_id='wish-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Creator can upload private claim media" on storage.objects for insert to authenticated
with check (bucket_id='claim-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Allowed viewers can read private claim media" on storage.objects for select to anon,authenticated
using (bucket_id='claim-media' and private.can_read_claim_media(name));
create policy "Creator or admin can delete private claim media" on storage.objects for delete to authenticated
using (bucket_id='claim-media' and ((storage.foldername(name))[1]=(select auth.uid())::text or private.is_admin()));

-- Remove all broad privileges, including TRUNCATE, then restore only app operations.
do $$
declare t text;
begin
  foreach t in array array['admin_roles','posts','claims','comments','likes','favorites','reports','moderation_logs'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from anon,authenticated',t);
  end loop;
end $$;

grant select on public.admin_roles to authenticated;
grant select (id,author_id,author_name,category,title,body,art,palette,ratio,cover_image,card_style,status,likes_count,is_deleted,created_at) on public.posts to anon,authenticated;
grant insert (author_name,category,title,body,art,palette,ratio,cover_image,card_style) on public.posts to authenticated;
grant update (author_name,category,title,body,art,palette,ratio,cover_image,card_style,is_deleted) on public.posts to authenticated;
grant select,insert (post_id,name,note,status,hidden_before_done,media,delivery),update (name,note,status,hidden_before_done,media,delivery,is_deleted) on public.claims to authenticated;
grant select,insert (post_id,author,text,media),update (is_deleted) on public.comments to authenticated;
grant select,insert (post_id),delete on public.likes to authenticated;
grant select,insert (post_id),delete on public.favorites to authenticated;
grant select,insert (post_id,reason,note),update (resolved) on public.reports to authenticated;
grant select on public.moderation_logs to authenticated;

-- Replace only the legacy policies inspected on the current project.
drop policy if exists "Anyone can check own admin role" on public.admin_roles;
drop policy if exists "Anyone can read claims" on public.claims;
drop policy if exists "Creator or admin can delete claim" on public.claims;
drop policy if exists "Creator or admin can update claim" on public.claims;
drop policy if exists "Users can insert own claim" on public.claims;
drop policy if exists "Anyone can read comments" on public.comments;
drop policy if exists "Author or admin can delete comments" on public.comments;
drop policy if exists "Users can create comments" on public.comments;
drop policy if exists "Users manage own favorites" on public.favorites;
drop policy if exists "Anyone can read likes" on public.likes;
drop policy if exists "Users manage own likes" on public.likes;
drop policy if exists "Admin can read and write logs" on public.moderation_logs;
drop policy if exists "Admin can delete posts" on public.posts;
drop policy if exists "Authenticated users can create posts" on public.posts;
drop policy if exists "Author or admin can update posts" on public.posts;
drop policy if exists "Public read active posts or admin read all" on public.posts;
drop policy if exists "Admin can update reports" on public.reports;
drop policy if exists "Users can submit reports" on public.reports;
drop policy if exists "Users read own reports or admin read all" on public.reports;

create policy "Read own admin role" on public.admin_roles for select to authenticated using (user_id=(select auth.uid()));
create policy "Read active posts" on public.posts for select to anon,authenticated using (not is_deleted);
create policy "Read own or admin removed posts" on public.posts for select to authenticated using (author_id=(select auth.uid()) or private.is_admin());
create policy "Create own posts" on public.posts for insert to authenticated with check ((select auth.uid()) is not null and author_id=(select auth.uid()));
create policy "Update own posts" on public.posts for update to authenticated using (author_id=(select auth.uid())) with check (author_id=(select auth.uid()));
create policy "Admin update posts" on public.posts for update to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "Read own or admin claims" on public.claims for select to authenticated using (creator_id=(select auth.uid()) or private.is_admin());
create policy "Create own claims" on public.claims for insert to authenticated with check ((select auth.uid()) is not null and creator_id=(select auth.uid()));
create policy "Update own claims" on public.claims for update to authenticated using (creator_id=(select auth.uid())) with check (creator_id=(select auth.uid()));
create policy "Admin update claims" on public.claims for update to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "Read active comments" on public.comments for select to anon,authenticated using (not is_deleted);
create policy "Read own or admin removed comments" on public.comments for select to authenticated using (author_id=(select auth.uid()) or private.is_admin());
create policy "Create own comments" on public.comments for insert to authenticated with check ((select auth.uid()) is not null and author_id=(select auth.uid()));
create policy "Update own comments" on public.comments for update to authenticated using (author_id=(select auth.uid())) with check (author_id=(select auth.uid()));
create policy "Admin update comments" on public.comments for update to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "Read own likes" on public.likes for select to authenticated using (user_id=(select auth.uid()));
create policy "Add own likes" on public.likes for insert to authenticated with check ((select auth.uid()) is not null and user_id=(select auth.uid()));
create policy "Remove own likes" on public.likes for delete to authenticated using (user_id=(select auth.uid()));
create policy "Read own favorites" on public.favorites for select to authenticated using (user_id=(select auth.uid()));
create policy "Add own favorites" on public.favorites for insert to authenticated with check ((select auth.uid()) is not null and user_id=(select auth.uid()));
create policy "Remove own favorites" on public.favorites for delete to authenticated using (user_id=(select auth.uid()));

create policy "Read own reports" on public.reports for select to authenticated using (reporter_id=(select auth.uid()));
create policy "Admin read reports" on public.reports for select to authenticated using (private.is_admin());
create policy "Submit own reports" on public.reports for insert to authenticated with check ((select auth.uid()) is not null and reporter_id=(select auth.uid()));
create policy "Admin resolve reports" on public.reports for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admin read logs" on public.moderation_logs for select to authenticated using (private.is_admin());

-- Serialize claims by locking the post row, then enforce three active claims and one per creator.
create or replace function private.check_max_claims()
returns trigger language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if new.is_deleted then return new; end if;
  perform 1 from public.posts p where p.id=new.post_id and not p.is_deleted for update;
  if not found then raise exception '愿望不存在或已删除'; end if;
  select count(*)::integer into n from public.claims c
    where c.post_id=new.post_id and not c.is_deleted and c.uid<>new.uid;
  if n>=3 then raise exception '当前接单席位已满（最多 3 人接单）'; end if;
  return new;
end $$;
revoke all on function private.check_max_claims() from public,anon,authenticated;
drop trigger if exists trg_check_max_claims on public.claims;
create trigger trg_check_max_claims before insert or update of post_id,is_deleted
on public.claims for each row execute function private.check_max_claims();
create unique index if not exists claims_one_active_per_creator
on public.claims(post_id,creator_id) where not is_deleted;

create or replace function private.sync_post_status()
returns trigger language plpgsql security definer set search_path = '' as $$
declare pid text; s text;
begin
  pid:=case when tg_op='DELETE' then old.post_id else new.post_id end;
  select case when bool_or(c.status='done') then 'done'
    when bool_or(c.status='working') then 'working'
    when count(*)>0 then 'claimed' else 'open' end into s
  from public.claims c where c.post_id=pid and not c.is_deleted;
  update public.posts set status=coalesce(s,'open') where id=pid;
  if tg_op='DELETE' then return old; end if;
  return new;
end $$;
revoke all on function private.sync_post_status() from public,anon,authenticated;
drop trigger if exists trg_sync_post_status on public.claims;
create trigger trg_sync_post_status after insert or update of status,is_deleted or delete
on public.claims for each row execute function private.sync_post_status();

create or replace function private.sync_post_likes_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='INSERT' then
    update public.posts set likes_count=likes_count+1 where id=new.post_id;
    return new;
  end if;
  update public.posts set likes_count=greatest(0,likes_count-1) where id=old.post_id;
  return old;
end $$;
revoke all on function private.sync_post_likes_count() from public,anon,authenticated;
drop trigger if exists trg_sync_post_likes_count on public.likes;
create trigger trg_sync_post_likes_count after insert or delete on public.likes
for each row execute function private.sync_post_likes_count();

-- Record soft deletion, restoration and report resolution in an append-only admin log.
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
  values(action_name,label,post_key,tg_table_name||':'||item_key,(select auth.uid()));
  return new;
end $$;
revoke all on function private.audit_moderation_change() from public,anon,authenticated;
drop trigger if exists trg_audit_post_moderation on public.posts;
create trigger trg_audit_post_moderation after update of is_deleted on public.posts
for each row execute function private.audit_moderation_change();
drop trigger if exists trg_audit_claim_moderation on public.claims;
create trigger trg_audit_claim_moderation after update of is_deleted on public.claims
for each row execute function private.audit_moderation_change();
drop trigger if exists trg_audit_comment_moderation on public.comments;
create trigger trg_audit_comment_moderation after update of is_deleted on public.comments
for each row execute function private.audit_moderation_change();
drop trigger if exists trg_audit_report_moderation on public.reports;
create trigger trg_audit_report_moderation after update of resolved on public.reports
for each row execute function private.audit_moderation_change();

revoke all on function public.is_admin() from public,anon,authenticated;
revoke all on function public.check_max_claims() from public,anon,authenticated;
revoke all on function public.sync_post_status() from public,anon,authenticated;
revoke all on function public.rls_auto_enable() from public,anon,authenticated;
alter function public.is_admin() set search_path = '';
alter function public.sync_post_status() set search_path = '';
