begin;
insert into auth.users(id,aud,role) values
('10000000-0000-4000-8000-000000000001','authenticated','authenticated'),
('10000000-0000-4000-8000-000000000002','authenticated','authenticated'),
('10000000-0000-4000-8000-000000000003','authenticated','authenticated'),
('10000000-0000-4000-8000-000000000004','authenticated','authenticated');
insert into public.admin_roles(user_id,email) values('10000000-0000-4000-8000-000000000004','fixture@example.invalid');
insert into public.posts(id,author_id,title,body,is_spoiler,cover_image) values
('spoiler-fixture','10000000-0000-4000-8000-000000000001','公开标题','HIDDEN-BODY',true,'https://example.invalid/hidden.webp'),
('normal-fixture','10000000-0000-4000-8000-000000000001','正常标题','PUBLIC-BODY',false,'');
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$begin
 if not exists(select 1 from public.post_feed where id='spoiler-fixture' and body='' and cover_image='' and not is_mine) then raise exception 'FAIL spoiler feed';end if;
 if (select public.read_post_detail('normal-fixture',false)->>'body')<>'PUBLIC-BODY' then raise exception 'FAIL public detail';end if;
 begin perform public.read_post_detail('spoiler-fixture',false);raise exception 'FAIL spoiler without consent';exception when insufficient_privilege then null;end;
 begin perform public.read_post_comments('spoiler-fixture',false);raise exception 'FAIL comments without consent';exception when insufficient_privilege then null;end;
 begin perform public.read_post_claims('spoiler-fixture',false);raise exception 'FAIL claims without consent';exception when insufficient_privilege then null;end;
 begin perform * from public.posts;raise exception 'FAIL raw posts exposed';exception when insufficient_privilege then null;end;
 begin perform * from public.profiles;raise exception 'FAIL profiles exposed';exception when insufficient_privilege then null;end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.profiles(display_name,bio) values('Owner','private bio');
select public.reserve_media_upload();
reset role;
insert into storage.objects(bucket_id,name) values('profile-media','10000000-0000-4000-8000-000000000001/avatar/test.webp');
set local role authenticated;
insert into public.favorites(post_id) values('spoiler-fixture');
insert into public.likes(post_id) values('normal-fixture');
insert into public.comments(post_id,text) values('spoiler-fixture','HIDDEN-COMMENT');
insert into public.claims(post_id,name,note) values('normal-fixture','Hidden Creator','PRIVATE-CLAIM');
do $$begin
 if not exists(select 1 from public.post_feed where id='spoiler-fixture' and is_mine) then raise exception 'FAIL owner ID mapping';end if;
 begin insert into public.favorites(post_id) values('spoiler-fixture');raise exception 'FAIL duplicate favorite';exception when unique_violation then null;end;
 begin insert into public.likes(post_id) values('normal-fixture');raise exception 'FAIL duplicate like';exception when unique_violation then null;end;
 begin update public.posts set author_id='10000000-0000-4000-8000-000000000002' where id='normal-fixture';raise exception 'FAIL reassign owner';exception when insufficient_privilege then null;end;
 begin update public.posts set likes_count=9000 where id='normal-fixture';raise exception 'FAIL fake like count';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$declare n integer;begin
 if exists(select body from public.posts) then raise exception 'FAIL raw anonymous owner IDs and spoiler body';end if;
 if jsonb_array_length(public.my_market_history()->'claims')<>0 or jsonb_array_length(public.my_market_history()->'comments')<>0 then raise exception 'FAIL history crossed identities';end if;
 begin perform public.moderate_market_item('posts','normal-fixture',true,'forged');raise exception 'FAIL non-admin moderation';exception when insufficient_privilege then null;end;
 if exists(select 1 from public.profiles) then raise exception 'FAIL cross-user profile read';end if;
 if exists(select 1 from storage.objects where bucket_id='profile-media') then raise exception 'FAIL profile media cross-user read';end if;
 begin insert into storage.objects(bucket_id,name) values('profile-media','10000000-0000-4000-8000-000000000001/avatar/forged.webp');raise exception 'FAIL media impersonation';exception when insufficient_privilege then null;end;
 if exists(select 1 from public.favorites) then raise exception 'FAIL cross-user favorite read';end if;
 if exists(select 1 from public.likes) then raise exception 'FAIL cross-user like read';end if;
 if exists(select 1 from public.comments) then raise exception 'FAIL cross-user raw comment read';end if;
 if exists(select 1 from public.claims) then raise exception 'FAIL hidden claim read';end if;
 if exists(select 1 from public.read_post_claims('normal-fixture',false) where name is not null or note is not null) then raise exception 'FAIL hidden claim projection';end if;
 update public.profiles set bio='forged';get diagnostics n=row_count;if n<>0 then raise exception 'FAIL profile overwrite';end if;
 update public.posts set title='forged' where id='normal-fixture';get diagnostics n=row_count;if n<>0 then raise exception 'FAIL cross-user post edit';end if;
 update public.claims set status='done';get diagnostics n=row_count;if n<>0 then raise exception 'FAIL cross-user claim edit';end if;
 if (select public.read_post_detail('spoiler-fixture',true)->>'body')<>'HIDDEN-BODY' then raise exception 'FAIL confirmed detail';end if;
 if not exists(select 1 from public.read_post_comments('spoiler-fixture',true) where text='HIDDEN-COMMENT' and not is_mine) then raise exception 'FAIL confirmed comment';end if;
 begin insert into public.profiles(user_id,display_name) values('10000000-0000-4000-8000-000000000001','forged');raise exception 'FAIL profile impersonation';exception when insufficient_privilege then null;end;
end $$;
insert into public.claims(post_id,name,note) values('normal-fixture','Creator 2','second');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
insert into public.claims(post_id,name,note) values('normal-fixture','Creator 3','third');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
do $$begin
 begin insert into public.claims(post_id,name,note) values('normal-fixture','Fourth','fourth');raise exception 'FAIL fourth claim';exception when raise_exception then if sqlerrm='FAIL fourth claim' then raise;end if;end;
end $$;
select public.moderate_market_item('posts','normal-fixture',true,'test removal reason');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$begin
 begin update public.posts set is_deleted=false where id='normal-fixture';raise exception 'FAIL owner restored moderated post';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
select public.moderate_market_item('posts','normal-fixture',false,'test restore reason');
do $$begin
 if not exists(select 1 from public.moderation_logs where action='post_restore' and extra like '%test restore reason%') then raise exception 'FAIL restore audit';end if;
 if not exists(select 1 from public.moderation_logs where action='post_soft_delete') then raise exception 'FAIL removal audit';end if;
end $$;
-- A withdrawn creator can reclaim without deleting their historical record.
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
update public.claims set is_deleted=true where post_id='normal-fixture';
insert into public.claims(post_id,name,note) values('normal-fixture','Creator 2 again','reclaimed');
rollback;
