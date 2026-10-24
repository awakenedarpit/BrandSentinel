-- Additive workspace foundation for BrandSentinel AI. Review before applying.
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.company_memberships (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);
create index if not exists company_memberships_user_idx on public.company_memberships(user_id);
alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;

-- Avoid recursive RLS policies by keeping the membership lookup in a narrowly scoped helper.
create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.company_memberships m
    where m.company_id = target_company_id and m.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_company_member(uuid) from public;
grant execute on function public.is_company_member(uuid) to authenticated;

drop policy if exists "Members can view their companies" on public.companies;
create policy "Members can view their companies" on public.companies for select to authenticated
using (public.is_company_member(id));
drop policy if exists "Members can view memberships in their companies" on public.company_memberships;
create policy "Members can view memberships in their companies" on public.company_memberships for select to authenticated
using (user_id = (select auth.uid()) or public.is_company_member(company_id));

create or replace function public.create_company_workspace(company_name text)
returns table(id uuid, name text)
language plpgsql security definer set search_path = ''
as $$
declare new_company_id uuid; safe_name text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  safe_name := trim(company_name);
  if safe_name is null or length(safe_name) < 2 or length(safe_name) > 120 then
    raise exception 'Company name must be between 2 and 120 characters';
  end if;
  insert into public.companies(name, created_by) values (safe_name, auth.uid()) returning companies.id into new_company_id;
  insert into public.company_memberships(company_id, user_id, role) values (new_company_id, auth.uid(), 'owner');
  return query select c.id, c.name from public.companies c where c.id = new_company_id;
end;
$$;
revoke all on function public.create_company_workspace(text) from public;
grant execute on function public.create_company_workspace(text) to authenticated;

-- This migration provides Auth + workspace onboarding foundations only.
-- Before production use, tenant IDs and authorization must also be enforced in all
-- brand/document/rule/report tables and in server API/RAG endpoints. Do not deploy
-- with company data until those checks and cross-tenant tests are complete.
