-- Run only on a disposable Supabase branch after applying the security migration.
-- The transaction rolls back all fixture rows and test updates at the end.
begin;
set local role postgres;

-- Development branches do not copy production rows, so create a disposable admin identity here.
select set_config('mimu.test_admin_id','10000000-0000-4000-8000-000000000004',true);
insert into auth.users (id,aud,role)
values ('10000000-0000-4000-8000-000000000004','authenticated','authenticated')
on conflict (id) do nothing;
insert into public.admin_roles (user_id,email)
values ('10000000-0000-4000-8000-000000000004','rls-test-admin@example.invalid')
on conflict (user_id) do nothing;

insert into public.posts (id, author_id, author_name, category, title, body, card_style)
values ('rls-test-post-20261020', '10000000-0000-4000-8000-000000000001', 'Owner', '其他', 'RLS test post', 'Temporary fixture', 'text')
on conflict (id) do nothing;
insert into public.claims (uid, post_id, creator_id, name, note, status, hidden_before_done, media)
values ('rls-test-claim-1','rls-test-post-20261020','10000000-0000-4000-8000-000000000001','Hidden creator','Private note','claimed',true,
        '{"src":"10000000-0000-4000-8000-000000000001/claims/test.webp","method":"upload","bucket":"claim-media"}'::jsonb)
on conflict (uid) do nothing;
insert into public.claims (uid, post_id, creator_id, name, note)
values ('rls-test-claim-2','rls-test-post-20261020','10000000-0000-4000-8000-000000000002','Creator 2','Fixture')
on conflict (uid) do nothing;
insert into public.claims (uid, post_id, creator_id, name, note)
values ('rls-test-claim-3','rls-test-post-20261020','10000000-0000-4000-8000-000000000003','Creator 3','Fixture')
on conflict (uid) do nothing;

-- Signed-out visitor: public post and safe hidden-claim summary, but no claim-table access.
set local role anon;
select set_config('request.jwt.claim.sub','',true), set_config('request.jwt.claims','{"role":"anon"}',true);
do $$
begin
  if not exists (select 1 from public.posts where id='rls-test-post-20261020') then raise exception 'FAIL: anon cannot read active posts'; end if;
  if not exists (select 1 from public.posts where id='rls-test-post-20261020' and card_style='text') then raise exception 'FAIL: text cover style is not available in public feed'; end if;
  if not exists (select 1 from public.claim_feed where uid='rls-test-claim-1' and name is null and note is null and media is null and delivery is null) then raise exception 'FAIL: hidden claim details leaked or summary missing'; end if;
  if not exists (select 1 from public.claim_public_summaries where uid='rls-test-claim-1' and name is null and note is null and media is null and delivery is null) then raise exception 'FAIL: safe summary table contains hidden details'; end if;
  begin
    perform 1 from public.claims;
    raise exception 'FAIL: anon directly read claims';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.claim_public_summaries (uid,post_id,status,hidden_before_done,created_at)
    values ('rls-test-forged-summary','rls-test-post-20261020','claimed',false,now());
    raise exception 'FAIL: anon wrote a public summary';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Anonymous Auth user B: cannot inspect or change user A's hidden claim or author-owned post.
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true),
       set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":true}',true);
do $$
declare changed integer;
begin
  if exists (select 1 from public.claims where uid='rls-test-claim-1') then raise exception 'FAIL: another user read private claim row'; end if;
  if not exists (select 1 from public.claim_feed where uid='rls-test-claim-1' and name is null) then raise exception 'FAIL: safe public summary unavailable'; end if;
  update public.claims set status='done' where uid='rls-test-claim-1'; get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'FAIL: another user changed a claim'; end if;
  update public.posts set is_deleted=true where id='rls-test-post-20261020'; get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'FAIL: another user changed a post'; end if;
  begin
    insert into public.admin_roles(user_id) values ('10000000-0000-4000-8000-000000000002');
    raise exception 'FAIL: ordinary user wrote an admin role';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Anonymous Auth owner A: can read and update their own claim.
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true),
       set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":true}',true);
do $$
declare changed integer;
begin
  if not exists (select 1 from public.claims where uid='rls-test-claim-1' and note='Private note') then raise exception 'FAIL: creator cannot read own claim'; end if;
  update public.claims set status='working' where uid='rls-test-claim-1'; get diagnostics changed = row_count;
  if changed <> 1 then raise exception 'FAIL: creator cannot update own claim'; end if;
end $$;

-- Admin: can soft-delete and restore; both actions must create audit records.
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('mimu.test_admin_id'),true),
       set_config('request.jwt.claims',json_build_object('sub',current_setting('mimu.test_admin_id'),'role','authenticated','is_anonymous',false)::text,true);
do $$
declare changed integer;
begin
  update public.claims set is_deleted=true where uid='rls-test-claim-1'; get diagnostics changed = row_count;
  if changed <> 1 then raise exception 'FAIL: admin cannot soft-delete claim'; end if;
  if not exists (select 1 from public.moderation_logs where extra='claims:rls-test-claim-1' and action='claim_soft_delete') then raise exception 'FAIL: claim deletion was not audited'; end if;
  update public.claims set is_deleted=false where uid='rls-test-claim-1'; get diagnostics changed = row_count;
  if changed <> 1 then raise exception 'FAIL: admin cannot restore claim'; end if;
  if not exists (select 1 from public.moderation_logs where extra='claims:rls-test-claim-1' and action='claim_restore') then raise exception 'FAIL: claim restoration was not audited'; end if;
  begin
    insert into public.claims (post_id, name, note) values ('rls-test-post-20261020','Fourth','Should fail');
    raise exception 'FAIL: fourth active claim was accepted';
  exception when others then
    if sqlerrm <> '当前接单席位已满（最多 3 人接单）' then raise; end if;
  end;
end $$;

rollback;
