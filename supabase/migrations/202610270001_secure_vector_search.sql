-- Lock vector retrieval to one authenticated account and brand profile.
-- Apply only after verifying this is the Supabase project used by BrandSentinel.
create or replace function public.match_document_chunks (
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count int default 5,
  filter_brand_id uuid default null,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  document_id text,
  brand_profile_id uuid,
  chunk_index int,
  page_number int,
  content text,
  similarity float,
  metadata jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if filter_user_id is null or filter_brand_id is null then
    raise exception 'Account and brand scope are required';
  end if;

  if coalesce(auth.role(), '') <> 'service_role'
     and auth.uid() is distinct from filter_user_id then
    raise exception 'Not authorized to search this account';
  end if;

  if not exists (
    select 1
    from public.brand_profiles bp
    where bp.id = filter_brand_id
      and bp.user_id = filter_user_id
  ) then
    raise exception 'Brand profile not found for this account';
  end if;

  return query
  select
    dc.id,
    dc.document_id,
    dc.brand_profile_id,
    dc.chunk_index,
    dc.page_number,
    dc.content,
    (1 - (dc.embedding <=> query_embedding))::float as similarity,
    dc.metadata
  from public.document_chunks dc
  where dc.brand_profile_id = filter_brand_id
    and dc.user_id = filter_user_id
    and (1 - (dc.embedding <=> query_embedding)) >= greatest(0, least(1, match_threshold))
  order by dc.embedding <=> query_embedding
  limit greatest(1, least(10, match_count));
end;
$$;

revoke all on function public.match_document_chunks(vector, float, int, uuid, uuid) from public;
revoke all on function public.match_document_chunks(vector, float, int, uuid, uuid) from anon;
grant execute on function public.match_document_chunks(vector, float, int, uuid, uuid) to authenticated;
grant execute on function public.match_document_chunks(vector, float, int, uuid, uuid) to service_role;
