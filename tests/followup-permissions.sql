begin;
insert into auth.users(id,aud,role) values('20000000-0000-4000-8000-000000000001','authenticated','authenticated'),('20000000-0000-4000-8000-000000000002','authenticated','authenticated');
insert into public.admin_roles(user_id,email) values('20000000-0000-4000-8000-000000000002','followup@example.invalid');
set local role anon;
do $$begin if not exists(select 1 from public.market_documents where key='covenant') then raise exception 'FAIL anonymous covenant read';end if;end$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
with created as (insert into public.posts(title,body) values('短','好') returning id) select set_config('test.short_post_id',id,true) from created;
insert into public.claims(post_id,name,note) values(current_setting('test.short_post_id'),'甲','做');
insert into public.profiles(display_name,avatar_url,cover_path) values('甲','https://example.com/avatar.jpg','20000000-0000-4000-8000-000000000001/cover/one.jpg');
do $$begin
 begin perform public.save_market_covenant('[["伪造","内容"]]'::jsonb,1);raise exception 'FAIL non-admin covenant update';exception when insufficient_privilege then null;end;
 begin update public.market_documents set sections='[]'::jsonb;raise exception 'FAIL direct document update';exception when insufficient_privilege then null;end;
 begin update public.profiles set avatar_url='javascript:alert(1)';raise exception 'FAIL unsafe image URL';exception when check_violation then null;end;
 begin update public.profiles set avatar_url='https://user:password@example.com/a.jpg';raise exception 'FAIL credential image URL';exception when check_violation then null;end;
 begin update public.profiles set avatar_path='20000000-0000-4000-8000-000000000002/avatar/a.jpg',avatar_url='';raise exception 'FAIL other profile image path';exception when check_violation then null;end;
end$$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
select public.save_market_covenant('[["友善交流","尊重每一位创作者。"]]'::jsonb,1);
do $$begin
 if not exists(select 1 from public.market_documents where key='covenant' and revision=2) then raise exception 'FAIL admin covenant update';end if;
 if not exists(select 1 from public.moderation_logs where action='covenant_updated') then raise exception 'FAIL covenant audit';end if;
 begin perform public.save_market_covenant('[["旧版本","内容"]]'::jsonb,1);raise exception 'FAIL stale revision';exception when raise_exception then if sqlerrm='FAIL stale revision' then raise;end if;end;
end$$;
reset role;
do $$begin if not exists(select 1 from private.market_document_versions where revision=1) then raise exception 'FAIL recoverable covenant history';end if;end$$;
rollback;
