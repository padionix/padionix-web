-- Fix: Re-deploy handle_new_user trigger with proper fallbacks
-- The deployed version is missing coalesce/split_part → full_name stays null → signup fails
-- Safe to re-run (CREATE OR REPLACE)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role, avatar_url, subscription)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    ),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'role', ''),
      'farmer'
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    'free'
  );

  insert into public.alert_settings (user_id) values (new.id);

  insert into public.subscriptions (user_id, tier, status, current_period_start)
  values (new.id, 'free', 'active', now());

  return new;
exception
  when others then
    raise log 'handle_new_user trigger error: %', sqlerrm;
    return new;
end;
$$;

-- Ensure trigger exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

select 'Auth trigger fixed — run this in Supabase SQL Editor' as result;
