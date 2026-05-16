create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  company_name text,
  inn text,
  phone text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan_id text not null,
  status text not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  devices_limit integer default 1,
  provider text,
  provider_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint subscriptions_status_check check (
    status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'expired')
  )
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  plan_id text not null,
  amount integer not null,
  currency text default 'RUB',
  status text not null default 'pending',
  provider text,
  provider_payment_id text,
  created_at timestamptz default now(),
  constraint payments_status_check check (
    status in ('pending', 'succeeded', 'failed', 'refunded')
  )
);

create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_id text not null,
  device_name text,
  platform text,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now()
);

create unique index if not exists user_devices_user_id_device_id_idx
  on public.user_devices (user_id, device_id);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.user_devices enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
  on public.payments
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own devices" on public.user_devices;
create policy "Users can read own devices"
  on public.user_devices
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own devices" on public.user_devices;
create policy "Users can insert own devices"
  on public.user_devices
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own devices" on public.user_devices;
create policy "Users can update own devices"
  on public.user_devices
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, company_name, inn, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'company_name',
    new.raw_user_meta_data ->> 'inn',
    new.raw_user_meta_data ->> 'phone'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.process_sandbox_checkout(
  p_plan_id text,
  p_amount integer,
  p_status text,
  p_period_days integer,
  p_devices_limit integer
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_subscription_id uuid;
  v_payment public.payments;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_status not in ('succeeded', 'failed') then
    raise exception 'Unsupported sandbox status';
  end if;

  if p_status = 'succeeded' then
    select id
    into v_subscription_id
    from public.subscriptions
    where user_id = v_user_id
    order by created_at desc
    limit 1;

    if v_subscription_id is null then
      insert into public.subscriptions (
        user_id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        devices_limit,
        provider,
        provider_subscription_id
      )
      values (
        v_user_id,
        p_plan_id,
        'active',
        now(),
        now() + make_interval(days => p_period_days),
        p_devices_limit,
        'sandbox',
        null
      )
      returning id into v_subscription_id;
    else
      update public.subscriptions
      set
        plan_id = p_plan_id,
        status = 'active',
        current_period_start = now(),
        current_period_end = now() + make_interval(days => p_period_days),
        trial_ends_at = null,
        devices_limit = p_devices_limit,
        provider = 'sandbox',
        updated_at = now()
      where id = v_subscription_id;
    end if;
  end if;

  insert into public.payments (
    user_id,
    subscription_id,
    plan_id,
    amount,
    currency,
    status,
    provider,
    provider_payment_id
  )
  values (
    v_user_id,
    v_subscription_id,
    p_plan_id,
    p_amount,
    'RUB',
    p_status,
    'sandbox',
    null
  )
  returning * into v_payment;

  return v_payment;
end;
$$;

grant execute on function public.process_sandbox_checkout(
  text,
  integer,
  text,
  integer,
  integer
) to authenticated;
