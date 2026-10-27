-- Keep privileged implementation in the unexposed private schema. Public API
-- wrappers run as the caller; bounded private functions retain explicit grants.
begin;
alter function public.read_post_detail(text,boolean) set schema private;
alter function public.read_post_comments(text,boolean) set schema private;
alter function public.read_post_claims(text,boolean) set schema private;
alter function public.my_market_history() set schema private;
alter function public.reserve_media_upload() set schema private;
create function public.read_post_detail(post_key text,accept_spoiler boolean default false)
returns jsonb language sql stable security invoker set search_path=''
as $$select private.read_post_detail(post_key,accept_spoiler)$$;
create function public.read_post_comments(post_key text,accept_spoiler boolean default false)
returns table(id text,author text,text text,media jsonb,created_at timestamptz,is_mine boolean)
language sql stable security invoker set search_path=''
as $$select * from private.read_post_comments(post_key,accept_spoiler)$$;
create function public.read_post_claims(post_key text,accept_spoiler boolean default false)
returns table(uid text,post_id text,status text,hidden_before_done boolean,name text,note text,media jsonb,delivery jsonb,created_at timestamptz,is_mine boolean)
language sql stable security invoker set search_path=''
as $$select * from private.read_post_claims(post_key,accept_spoiler)$$;
create function public.my_market_history() returns jsonb
language sql stable security invoker set search_path=''
as $$select private.my_market_history()$$;
create function public.reserve_media_upload() returns void
language sql volatile security invoker set search_path=''
as $$select private.reserve_media_upload()$$;
revoke all on function public.read_post_detail(text,boolean),public.read_post_comments(text,boolean),public.read_post_claims(text,boolean),public.my_market_history(),public.reserve_media_upload() from public,anon,authenticated;
grant execute on function public.read_post_detail(text,boolean),public.read_post_comments(text,boolean),public.read_post_claims(text,boolean) to anon,authenticated;
grant execute on function public.my_market_history(),public.reserve_media_upload() to authenticated;
commit;
