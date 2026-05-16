create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_current_user_admin() to authenticated;

create or replace function public.get_admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_now timestamptz := now();
begin
  if not public.is_current_user_admin() then
    raise exception 'Admin access required';
  end if;

  return jsonb_build_object(
    'total_users', (
      select count(*)
      from public.profiles
    ),
    'new_users_7d', (
      select count(*)
      from public.profiles
      where created_at >= v_now - interval '7 days'
    ),
    'new_users_30d', (
      select count(*)
      from public.profiles
      where created_at >= v_now - interval '30 days'
    ),
    'active_subscriptions', (
      select count(*)
      from public.subscriptions
      where status = 'active'
        and current_period_end > v_now
    ),
    'trialing_subscriptions', (
      select count(*)
      from public.subscriptions
      where status = 'trialing'
        and trial_ends_at > v_now
    ),
    'expired_subscriptions', (
      select count(*)
      from public.subscriptions
      where status in ('expired', 'canceled')
        or (
          status = 'active'
          and current_period_end <= v_now
        )
        or (
          status = 'trialing'
          and trial_ends_at <= v_now
        )
    ),
    'total_payments', (
      select count(*)
      from public.payments
    ),
    'successful_payments', (
      select count(*)
      from public.payments
      where status = 'succeeded'
    ),
    'revenue_total', (
      select coalesce(sum(amount), 0)
      from public.payments
      where status = 'succeeded'
    ),
    'revenue_30d', (
      select coalesce(sum(amount), 0)
      from public.payments
      where status = 'succeeded'
        and created_at >= v_now - interval '30 days'
    ),
    'registered_devices', (
      select count(*)
      from public.user_devices
    ),
    'recent_users', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', id,
          'email', email,
          'company_name', company_name,
          'role', role,
          'created_at', created_at
        )
        order by created_at desc
      )
      from (
        select id, email, company_name, role, created_at
        from public.profiles
        order by created_at desc
        limit 10
      ) recent_profiles
    ), '[]'::jsonb),
    'recent_payments', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'email', pr.email,
          'plan_id', p.plan_id,
          'amount', p.amount,
          'currency', p.currency,
          'status', p.status,
          'created_at', p.created_at
        )
        order by p.created_at desc
      )
      from (
        select *
        from public.payments
        order by created_at desc
        limit 10
      ) p
      left join public.profiles pr on pr.id = p.user_id
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.get_admin_dashboard_stats() to authenticated;
