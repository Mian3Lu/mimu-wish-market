begin;
alter table public.profiles add column avatar_url text not null default '';
alter table public.profiles add column cover_url text not null default '';
alter table public.profiles drop constraint profile_avatar_owner;
alter table public.profiles drop constraint profile_cover_owner;
alter table public.profiles add constraint profile_avatar_owner check(avatar_path='' or avatar_path ~ ('^'||user_id::text||'/avatar/[^/]+\.(webp|jpg|png)$'));
alter table public.profiles add constraint profile_cover_owner check(cover_path='' or cover_path ~ ('^'||user_id::text||'/cover/[^/]+\.(webp|jpg|png)$'));
alter table public.profiles add constraint profile_avatar_url_valid check(avatar_url='' or (avatar_url ~ '^https://[^/@[:space:]]+(/[^[:space:]]*)?$' and char_length(avatar_url)<=2000 and avatar_path=''));
alter table public.profiles add constraint profile_cover_url_valid check(cover_url='' or (cover_url ~ '^https://[^/@[:space:]]+(/[^[:space:]]*)?$' and char_length(cover_url)<=2000 and cover_path=''));
grant insert(avatar_url,cover_url),update(avatar_url,cover_url) on public.profiles to authenticated;
update storage.buckets set allowed_mime_types=array['image/webp','image/jpeg','image/png'] where id='profile-media';
alter table public.posts drop constraint post_write_lengths;
alter table public.posts add constraint post_write_lengths check(char_length(btrim(title)) between 1 and 65 and char_length(btrim(body)) between 1 and 1800 and char_length(author_name) between 1 and 24 and char_length(category) between 1 and 16) not valid;

create table public.market_documents(
 key text primary key check(key='covenant'),sections jsonb not null,
 revision integer not null default 1,updated_at timestamptz not null default now()
);
alter table public.market_documents enable row level security;
revoke all on public.market_documents from public,anon,authenticated;
grant select on public.market_documents to anon,authenticated;
create policy "Read market covenant" on public.market_documents for select to anon,authenticated using(true);
insert into public.market_documents(key,sections) values('covenant',$covenant$[["友善相遇", "尊重不同的审美、表达与边界，不骚扰、不歧视、不公开他人隐私。"], ["尊重原创", "注明必要的来源与授权，遵守作者和外部资源库的使用规则，不传播盗版或侵权资源。"], ["认真许愿", "选择合适的分区，标题简明，描述需求与范围；避免重复刷帖、广告及无关内容。"], ["接单与沟通", "创作者按自己的节奏独立更新进度，变更计划及时交流；许愿者不恶意催单，不把自愿创作视为强制承诺。"], ["暴雷与 NSFW 提示", "可能包含 nsfw 或其他需要预警的内容，请主动标记暴雷。公开标题不得包含需隐藏的细节；标记不免除内容规则，不允许违法或侵害他人权益的内容。"], ["资源与完成", "完成后在原帖提供资源位置和必要说明，本站不提供独立作品上传与展示。"], ["举报与处理", "遇到违规内容可在原帖举报，由管理员按规则处理。管理操作需经服务端授权并保留审计；有误处理可联系管理员核查恢复。"]]$covenant$::jsonb);
create table private.market_document_versions(
 id bigint generated always as identity primary key,document_key text not null,
 revision integer not null,sections jsonb not null,admin_id uuid not null,
 changed_at timestamptz not null default now()
);
revoke all on private.market_document_versions from public,anon,authenticated;
create function private.save_market_covenant(new_sections jsonb,expected_revision integer)
returns integer language plpgsql security definer set search_path=''
as $$ declare current_revision integer;row_section jsonb;new_revision integer;
begin
 if (select auth.uid()) is null or not private.is_admin() then raise exception '只有管理员可以编辑市集公约' using errcode='42501';end if;
 if jsonb_typeof(new_sections)<>'array' then raise exception '公约内容格式不正确';end if;
 if jsonb_array_length(new_sections) not between 1 and 12 or octet_length(new_sections::text)>24000 then raise exception '公约长度不合适';end if;
 for row_section in select value from jsonb_array_elements(new_sections) loop
  if jsonb_typeof(row_section)<>'array' then raise exception '公约段落格式不正确';end if;
  if jsonb_array_length(row_section)<>2 or jsonb_typeof(row_section->0)<>'string' or jsonb_typeof(row_section->1)<>'string' then raise exception '公约段落格式不正确';end if;
  if char_length(btrim(row_section->>0)) not between 1 and 64 or char_length(btrim(row_section->>1)) not between 1 and 1500 then raise exception '请检查标题与内容长度';end if;
 end loop;
 select revision into current_revision from public.market_documents where key='covenant' for update;
 if current_revision is distinct from expected_revision then raise exception '公约已被更新，请重新打开后编辑';end if;
 insert into private.market_document_versions(document_key,revision,sections,admin_id)
 select key,revision,sections,(select auth.uid()) from public.market_documents where key='covenant';
 update public.market_documents set sections=new_sections,revision=revision+1,updated_at=now() where key='covenant' returning revision into new_revision;
 insert into public.moderation_logs(action,title,extra,admin_id) values('covenant_updated','市集公约','revision:'||new_revision,(select auth.uid()));
 return new_revision;
end $$;
revoke all on function private.save_market_covenant(jsonb,integer) from public,anon,authenticated;
grant execute on function private.save_market_covenant(jsonb,integer) to authenticated;
create function public.save_market_covenant(new_sections jsonb,expected_revision integer)
returns integer language sql volatile security invoker set search_path=''
as $$select private.save_market_covenant(new_sections,expected_revision)$$;
revoke all on function public.save_market_covenant(jsonb,integer) from public,anon,authenticated;
grant execute on function public.save_market_covenant(jsonb,integer) to authenticated;
commit;
