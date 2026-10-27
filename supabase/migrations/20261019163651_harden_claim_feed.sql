-- Replace the SECURITY DEFINER feed with a security-invoker view over
-- a separate, sanitized public projection. Private claim rows remain protected
-- by the existing claims RLS policies.

create table if not exists public.claim_public_summaries (
  uid text primary key references public.claims(uid) on delete cascade,
  post_id text not null references public.posts(id) on delete cascade,
  status text not null check (status in ('claimed','working','done')),
  hidden_before_done boolean not null,
  created_at timestamptz not null,
  name text,
  note text,
  media jsonb,
  delivery jsonb
);

alter table public.claim_public_summaries enable row level security;
revoke all on public.claim_public_summaries from public, anon, authenticated;
grant select on public.claim_public_summaries to anon, authenticated;
drop policy if exists "Read safe claim summaries" on public.claim_public_summaries;
create policy "Read safe claim summaries" on public.claim_public_summaries
  for select to anon, authenticated using (true);

create or replace function private.sync_claim_public_summary()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.claim_public_summaries where uid = old.uid;
    return old;
  end if;

  if new.is_deleted then
    delete from public.claim_public_summaries where uid = new.uid;
    return new;
  end if;

  insert into public.claim_public_summaries (
    uid, post_id, status, hidden_before_done, created_at,
    name, note, media, delivery
  ) values (
    new.uid,
    new.post_id,
    new.status,
    new.hidden_before_done,
    new.created_at,
    case when not new.hidden_before_done or new.status = 'done' then new.name end,
    case when not new.hidden_before_done or new.status = 'done' then new.note end,
    case when not new.hidden_before_done or new.status = 'done' then new.media end,
    case when new.status = 'done' then new.delivery end
  )
  on conflict (uid) do update set
    post_id = excluded.post_id,
    status = excluded.status,
    hidden_before_done = excluded.hidden_before_done,
    created_at = excluded.created_at,
    name = excluded.name,
    note = excluded.note,
    media = excluded.media,
    delivery = excluded.delivery;
  return new;
end;
$$;
revoke all on function private.sync_claim_public_summary() from public, anon, authenticated;

drop trigger if exists trg_sync_public_claim_summary on public.claims;
create trigger trg_sync_public_claim_summary
  after insert or update of post_id, name, note, status, hidden_before_done, media, delivery, is_deleted
  or delete on public.claims
  for each row execute function private.sync_claim_public_summary();

insert into public.claim_public_summaries (
  uid, post_id, status, hidden_before_done, created_at,
  name, note, media, delivery
)
select
  c.uid,
  c.post_id,
  c.status,
  c.hidden_before_done,
  c.created_at,
  case when not c.hidden_before_done or c.status = 'done' then c.name end,
  case when not c.hidden_before_done or c.status = 'done' then c.note end,
  case when not c.hidden_before_done or c.status = 'done' then c.media end,
  case when c.status = 'done' then c.delivery end
from public.claims c
where not c.is_deleted
on conflict (uid) do update set
  post_id = excluded.post_id,
  status = excluded.status,
  hidden_before_done = excluded.hidden_before_done,
  created_at = excluded.created_at,
  name = excluded.name,
  note = excluded.note,
  media = excluded.media,
  delivery = excluded.delivery;

drop view public.claim_feed;
create view public.claim_feed
with (security_barrier = true, security_invoker = true)
as
select uid, post_id, status, hidden_before_done, name, note, media, delivery, created_at
from public.claim_public_summaries;

revoke all on public.claim_feed from public;
grant select on public.claim_feed to anon, authenticated;
