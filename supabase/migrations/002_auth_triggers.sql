-- Padionix: Auto-create profile on user signup
-- Handles both email registration and OAuth (Google)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, full_name, phone, role, avatar_url, subscription)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'phone',
    coalesce(
      new.raw_user_meta_data ->> 'role',
      'farmer'
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    'free'
  );

  -- Default alert settings
  insert into public.alert_settings (user_id) values (new.id);

  -- Default subscription
  insert into public.subscriptions (user_id, tier, status, current_period_start)
  values (new.id, 'free', 'active', now());

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Handle user deletion: profile cascades via FK
-- Trigger on auth.users delete is optional; FK cascade on profiles(id) handles it

select 'Auth triggers created — profiles auto-generated on signup' as result;
