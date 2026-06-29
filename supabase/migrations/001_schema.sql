-- Padionix: Rebuild schema from scratch
-- Drops ALL old tables first, then creates fresh
-- Safe: no production data yet
-- ============================================================

-- Drop everything that exists (order respects FK)
drop table if exists public.subscriptions cascade;
drop table if exists public.alert_settings cascade;
drop table if exists public.alerts cascade;
drop table if exists public.detections cascade;
drop table if exists public.sensor_readings cascade;
drop table if exists public.devices cascade;
drop table if exists public.pest_library cascade;
drop table if exists public.profiles cascade;
drop table if exists public.image_captures cascade;
drop table if exists public.recommendations cascade;

-- 0. Extensions
create extension if not exists "pgcrypto";

-- 1. Helper fn
create or replace function public.update_timestamp()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- 2. Tables
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  phone       text,
  role        text not null default 'farmer' check (role in ('farmer','group','dinas','admin')),
  group_name  text,
  address     text,
  avatar_url  text,
  subscription text not null default 'free' check (subscription in ('free','pro','enterprise')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.devices (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  description   text,
  device_key    text not null unique,
  latitude      double precision,
  longitude     double precision,
  location_name text,
  status        text not null default 'offline' check (status in ('online','offline','error')),
  battery_pct   smallint check (battery_pct between 0 and 100),
  last_seen     timestamptz,
  is_active     boolean not null default true,
  firmware_ver  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.sensor_readings (
  id              bigint generated always as identity primary key,
  device_id       uuid not null references public.devices(id) on delete cascade,
  temperature     double precision,
  humidity        double precision,
  pressure        double precision,
  motion_detected boolean not null default false,
  signal_strength smallint check (signal_strength between -120 and 0),
  recorded_at     timestamptz not null default now()
);

create table public.detections (
  id             uuid primary key default gen_random_uuid(),
  device_id      uuid not null references public.devices(id) on delete cascade,
  image_path     text not null,
  pest_name      text,
  pest_type      text not null default 'unknown' check (pest_type in ('hama','penyakit','normal','unknown')),
  confidence     real check (confidence between 0 and 1),
  severity       text check (severity in ('low','medium','high','critical')),
  bbox_data      jsonb,
  ai_raw_result  jsonb,
  status         text not null default 'unhandled' check (status in ('unhandled','in_progress','resolved','false_positive')),
  handler_note   text,
  handled_at     timestamptz,
  handled_by     uuid references public.profiles(id),
  detected_at    timestamptz not null default now()
);

create table public.alerts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  device_id    uuid references public.devices(id) on delete set null,
  detection_id uuid references public.detections(id) on delete set null,
  type         text not null check (type in ('pest_detected','high_temperature','high_humidity','device_offline','low_battery')),
  severity     text not null check (severity in ('info','warning','critical')),
  title        text not null,
  message      text not null,
  is_read      boolean not null default false,
  is_sent      boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.alert_settings (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  pest_detected     boolean not null default true,
  high_temperature  boolean not null default true,
  high_humidity     boolean not null default true,
  device_offline    boolean not null default true,
  low_battery       boolean not null default true,
  email_enabled     boolean not null default false,
  push_enabled      boolean not null default true,
  quiet_hours_start time,
  quiet_hours_end   time,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(user_id)
);

create table public.pest_library (
  id          uuid primary key default gen_random_uuid(),
  name_id     text not null unique,
  name_en     text,
  type        text not null check (type in ('hama','penyakit','normal','unknown')),
  description text,
  symptoms    text[] default '{}',
  treatment   text[] default '{}',
  prevention  text[] default '{}',
  image_url   text
);

create table public.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  tier            text not null check (tier in ('free','pro','enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz not null default now(),
  current_period_end   timestamptz,
  status          text not null default 'active' check (status in ('active','past_due','canceled','incomplete')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 3. Triggers
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.update_timestamp();
create trigger trg_devices_updated_at before update on public.devices
  for each row execute function public.update_timestamp();
create trigger trg_alert_settings_updated_at before update on public.alert_settings
  for each row execute function public.update_timestamp();
create trigger trg_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.update_timestamp();

-- 4. Indexes
create index if not exists idx_sensor_device_time on public.sensor_readings(device_id, recorded_at desc);
create index if not exists idx_devices_user_id on public.devices(user_id);
create index if not exists idx_detections_device_id on public.detections(device_id);
create index if not exists idx_alerts_user_id on public.alerts(user_id, created_at desc);
create index if not exists idx_alerts_device_id on public.alerts(device_id);
create index if not exists idx_alerts_is_sent on public.alerts(is_sent) where is_sent = false;

-- 5. Trigger fns (auto-update device on reading + alert on detection)
create or replace function public.update_device_on_reading()
returns trigger language plpgsql as $$
begin
  update public.devices set last_seen = new.recorded_at, status = 'online', updated_at = now()
  where id = new.device_id;
  return new;
end;
$$;
create trigger trg_update_device_on_reading after insert on public.sensor_readings
  for each row execute function public.update_device_on_reading();

create or replace function public.create_detection_alert()
returns trigger language plpgsql as $$
declare v_user_id uuid; v_device_name text;
begin
  select d.user_id, d.name into v_user_id, v_device_name from public.devices d where d.id = new.device_id;
  if v_user_id is null then return new; end if;
  insert into public.alerts (user_id, device_id, detection_id, type, severity, title, message)
  values (v_user_id, new.device_id, new.id, 'pest_detected',
    case when new.severity = 'critical' then 'critical' when new.severity = 'high' then 'warning' else 'info' end,
    case when new.pest_type = 'normal' then 'Tanaman Sehat' else 'Hama/Penyakit Terdeteksi' end,
    case when new.pest_type = 'normal' then format('Tanaman di %s sehat.', v_device_name)
         else format('Deteksi %s pada %s (%s%%)', coalesce(new.pest_name, new.pest_type), v_device_name, round((new.confidence * 100)::numeric)) end);
  return new;
end;
$$;
create trigger trg_create_detection_alert after insert on public.detections
  for each row execute function public.create_detection_alert();

-- 6. RLS
alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.detections enable row level security;
alter table public.alerts enable row level security;
alter table public.alert_settings enable row level security;
alter table public.pest_library enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can view own profile" on public.profiles for select using (id = auth.uid());
create policy "Users can insert own profile" on public.profiles for insert with check (id = auth.uid());
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins can read all profiles" on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can read own devices" on public.devices for select using (user_id = auth.uid());
create policy "Users can insert own devices" on public.devices for insert with check (user_id = auth.uid());
create policy "Users can update own devices" on public.devices for update using (user_id = auth.uid());
create policy "Users can delete own devices" on public.devices for delete using (user_id = auth.uid());

create policy "Users can read readings" on public.sensor_readings for select
  using (exists (select 1 from public.devices where id = sensor_readings.device_id and user_id = auth.uid()));
create policy "Service role can insert readings" on public.sensor_readings for insert with check (true);

create policy "Users can read detections" on public.detections for select
  using (exists (select 1 from public.devices where id = detections.device_id and user_id = auth.uid()));
create policy "Service role can insert detections" on public.detections for insert with check (true);
create policy "Users can update detections" on public.detections for update
  using (exists (select 1 from public.devices where id = detections.device_id and user_id = auth.uid()));

create policy "Users can read own alerts" on public.alerts for select using (user_id = auth.uid());
create policy "Users can update own alerts" on public.alerts for update using (user_id = auth.uid());

create policy "Users can read own alert settings" on public.alert_settings for select using (user_id = auth.uid());
create policy "Users can update own alert settings" on public.alert_settings for update using (user_id = auth.uid());

create policy "Anyone can read pest library" on public.pest_library for select using (true);
create policy "Admins can manage pest library" on public.pest_library for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update pest library" on public.pest_library for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can read own subscription" on public.subscriptions for select using (user_id = auth.uid());
create policy "Admins can read all subscriptions" on public.subscriptions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 7. Aggregation RPC
create or replace function public.get_readings_aggregated(
  p_device_id uuid, p_from timestamptz, p_to timestamptz,
  p_interval text, p_limit int default 100, p_offset int default 0
) returns table(bucket timestamptz, avg_temp float, avg_humidity float, avg_pressure float)
language plpgsql as $$
begin
  return query execute format(
    'SELECT date_trunc(%L, recorded_at) AS bucket,
            AVG(temperature)::float, AVG(humidity)::float, AVG(pressure)::float
     FROM sensor_readings
     WHERE device_id = %L AND recorded_at >= %L AND recorded_at < %L
     GROUP BY bucket ORDER BY bucket LIMIT %L OFFSET %L',
    p_interval, p_device_id, p_from, p_to, p_limit, p_offset
  );
end;
$$;

-- 8. Storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('device-images', 'device-images', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "Users can read own device images" on storage.objects for select
  using (bucket_id = 'device-images' and auth.role() = 'authenticated');
create policy "Users can upload device images" on storage.objects for insert
  with check (bucket_id = 'device-images' and auth.role() = 'authenticated');

-- 9. Seed: pest library
insert into public.pest_library (name_id, name_en, type, description, symptoms, treatment, prevention) values
('Hawar Daun Bakteri', 'Bacterial Leaf Blight (BLB)', 'penyakit', 'Penyakit bakteri Xanthomonas oryzae.',
  array['Daun menguning dan mengering','Lesi basah hijau keabu-abuan'],
  array['Varietas tahan','Bakterisida tembaga','Pemupukan berimbang'],
  array['Benih bersertifikat','Sanitasi','Rotasi tanaman'])
on conflict (name_id) do nothing;
insert into public.pest_library (name_id, name_en, type, description, symptoms, treatment, prevention) values
('Blas', 'Blast Disease', 'penyakit', 'Penyakit jamur Pyricularia oryzae.',
  array['Bercak coklat belah ketupat','Pusat abu-abu pada bercak'],
  array['Fungisida trisyclozole','Varietas tahan','Pemupukan kalium'],
  array['Hindari kepadatan tanam','Pengairan teratur','Destruksi tanaman'])
on conflict (name_id) do nothing;
insert into public.pest_library (name_id, name_en, type, description, symptoms, treatment, prevention) values
('Wereng Batang Coklat', 'Brown Planthopper', 'hama', 'Hama Nilaparvata lugens.',
  array['Tanaman menguning dan mengering','Populasi wereng di pangkal batang'],
  array['Insektisida imidacloprid','Varietas tahan','Musuh alami laba-laba'],
  array['Tanam serentak','Pergiliran varietas','Pengamatan mingguan'])
on conflict (name_id) do nothing;
insert into public.pest_library (name_id, name_en, type, description, symptoms, treatment, prevention) values
('Penggerek Batang', 'Stem Borer', 'hama', 'Larva ngengat Scirpophaga spp.',
  array['Sundep (tunas mati)','Beluk (malai hampa)'],
  array['Insektisida karbofuran','Penyemprotan vegetatif','Trichogramma'],
  array['Tanam serentak','Sanitasi tunggul','Perangkap feromon'])
on conflict (name_id) do nothing;
insert into public.pest_library (name_id, name_en, type, description, symptoms, treatment, prevention) values
('Tungro', 'Tungro Virus', 'penyakit', 'Virus ditularkan wereng hijau Nephotettix virescens.',
  array['Daun kuning-oranye','Kerdil','Malai hampa'],
  array['Cabut & musnahkan','Kontrol vektor wereng','Varietas tahan'],
  array['Tanam serentak','Pergiliran musim','Pembersihan gulma'])
on conflict (name_id) do nothing;
insert into public.pest_library (name_id, name_en, type, description, symptoms, treatment, prevention) values
('Noda Coklat', 'Brown Spot', 'penyakit', 'Jamur Bipolaris oryzae, tanah defisiensi kalium.',
  array['Bercak coklat oval halo kuning','Bercak hitam gabah'],
  array['Fungisida mankozeb','Pemupukan kalium'],
  array['Pemupukan berimbang','Benih sehat','Drainase baik'])
on conflict (name_id) do nothing;
insert into public.pest_library (name_id, name_en, type, description, symptoms, treatment, prevention) values
('Kresek / Hawar Daun', 'Leaf Blight', 'penyakit', 'Bakteri Xanthomonas oryzae.',
  array['Daun layu siraman air panas','Hijau keabu-abuan'],
  array['Cabut tanaman berat','Bakterisida tembaga','Pemupukan kalium'],
  array['Benih tahan','Hindari genangan','Sanitasi lahan'])
on conflict (name_id) do nothing;
insert into public.pest_library (name_id, name_en, type, description, symptoms, treatment, prevention) values
('Normal / Sehat', 'Normal / Healthy', 'normal', 'Tanaman padi sehat tanpa gejala.',
  array['Daun hijau segar','Pertumbuhan seragam','Malai penuh'],
  array['Tidak perlu tindakan'],
  array['Pemupukan berimbang','Pengairan teratur','Pantau rutin'])
on conflict (name_id) do nothing;

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique(user_id, endpoint)
);
alter table public.push_subscriptions enable row level security;
create policy "Users can manage own push subscriptions" on public.push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);

select 'Schema complete — Padionix ready!' as result;
