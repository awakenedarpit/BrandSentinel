-- Account isolation for BrandSentinel data. Additive and safe to re-run.
-- Apply only to the Supabase project configured for BrandSentinel.
create index if not exists brand_profiles_user_id_idx on public.brand_profiles(user_id);
create index if not exists brand_rules_user_brand_idx on public.brand_rules(user_id, brand_profile_id);
create index if not exists audit_reports_user_created_idx on public.audit_reports(user_id, created_at desc);
create index if not exists knowledge_documents_user_created_idx on public.knowledge_documents(user_id, created_at desc);
create index if not exists document_chunks_user_brand_idx on public.document_chunks(user_id, brand_profile_id);

alter table public.brand_profiles enable row level security;
alter table public.brand_rules enable row level security;
alter table public.audit_reports enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.document_chunks enable row level security;

drop policy if exists "Users manage own brand profiles" on public.brand_profiles;
create policy "Users manage own brand profiles" on public.brand_profiles for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own brand rules" on public.brand_rules;
create policy "Users manage own brand rules" on public.brand_rules for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own audit reports" on public.audit_reports;
create policy "Users manage own audit reports" on public.audit_reports for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own knowledge documents" on public.knowledge_documents;
create policy "Users manage own knowledge documents" on public.knowledge_documents for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own document chunks" on public.document_chunks;
create policy "Users manage own document chunks" on public.document_chunks for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Legacy rows with NULL user_id remain stored but are not visible to authenticated users.
-- Server-side service-role queries must also validate the bearer token and filter user_id.
