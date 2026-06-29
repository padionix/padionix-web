-- Padionix Demo Seed Data
-- Run in Supabase Dashboard SQL Editor after 001_init.sql + 002_fixes.sql

-- 1. Helper function to bypass RLS
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
  v_device1_id uuid;
  v_device2_id uuid;
  v_pest_normal_id uuid;
  v_pest_wereng_id uuid;
BEGIN
  -- Get admin user (first user in auth.users)
  SELECT id INTO v_admin_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'No auth.users found. Create a user first via Supabase Auth UI.';
  END IF;

  -- Upsert profile as admin
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (v_admin_id, 'Admin Padionix', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  -- Get or create pest library entries
  INSERT INTO public.pest_library (name_id, name_en, type, description, treatment)
  VALUES
    ('Normal / Sehat', 'Normal / Healthy', 'normal', 'Tanaman dalam kondisi sehat', '{}'),
    ('Wereng Batang Coklat', 'Brown Planthopper', 'hama', 'Hama wereng yang menyerang batang padi', ARRAY['Semprot insektisida berbahan aktif buprofezin', 'Gunakan varietas tahan wereng', 'Atur jarak tanam tidak terlalu rapat']),
    ('Blas', 'Rice Blast', 'penyakit', 'Penyakit jamur Pyricularia oryzae', ARRAY['Semprot fungisida berbahan aktif tricyclazole', 'Hindari pemupukan nitrogen berlebihan', 'Gunakan varietas tahan blas'])
  ON CONFLICT (name_id) DO NOTHING;

  SELECT id INTO v_pest_normal_id FROM pest_library WHERE name_id = 'Normal / Sehat';
  SELECT id INTO v_pest_wereng_id FROM pest_library WHERE name_id = 'Wereng Batang Coklat';

  -- Devices
  INSERT INTO public.devices (user_id, name, description, device_key, latitude, longitude, location_name, firmware_ver, is_active, status)
  VALUES
    (v_admin_id, 'Sensor Sawah A', 'Sensor utama di sektor A', 'PDX-SRGN-001-A1B2C3D4', -7.250445, 112.768845, 'Desa Sumberagung, Kec. Sragen', 'v2.1.0', true, 'online'),
    (v_admin_id, 'Sensor Sawah B', 'Sensor sektor B dekat irigasi', 'PDX-SRGN-002-E5F6G7H8', -7.251200, 112.770100, 'Desa Sumberagung, Kec. Sragen', 'v2.1.0', true, 'online')
  ON CONFLICT (device_key) DO NOTHING
  RETURNING id INTO v_device1_id;

  SELECT id INTO v_device1_id FROM devices WHERE device_key = 'PDX-SRGN-001-A1B2C3D4';
  SELECT id INTO v_device2_id FROM devices WHERE device_key = 'PDX-SRGN-002-E5F6G7H8';

  -- Sensor readings (last 24 hours, every 30 min for device 1)
  FOR i IN 0..47 LOOP
    INSERT INTO public.sensor_readings (device_id, temperature, humidity, pressure, motion_detected, signal_strength, recorded_at)
    VALUES
      (v_device1_id,
       28.5 + random() * 3.0,
       60.0 + random() * 15.0,
       1008.0 + random() * 5.0,
       random() > 0.8,
       -65 + floor(random() * 20)::smallint,
       now() - (i * interval '30 minutes') + (random() * interval '10 seconds'));
  END LOOP;

  -- Sensor readings (last 6 hours, every 30 min for device 2)
  FOR i IN 0..11 LOOP
    INSERT INTO public.sensor_readings (device_id, temperature, humidity, pressure, motion_detected, signal_strength, recorded_at)
    VALUES
      (v_device2_id,
       26.0 + random() * 2.5,
       68.0 + random() * 10.0,
       1010.0 + random() * 3.0,
       random() > 0.9,
       -70 + floor(random() * 15)::smallint,
       now() - (i * interval '30 minutes') + (random() * interval '10 seconds'));
  END LOOP;

  -- Detection: hama detected
  INSERT INTO public.detections (device_id, image_path, pest_name, pest_type, confidence, severity, status, detected_at)
  VALUES (v_device1_id, 'demo/wereng-sample.jpg', 'Wereng Batang Coklat', 'hama', 0.92, 'high', 'unhandled', now() - interval '1 hour');

  -- Detection: normal
  INSERT INTO public.detections (device_id, image_path, pest_name, pest_type, confidence, severity, status, detected_at)
  VALUES (v_device2_id, 'demo/normal-sample.jpg', 'Normal / Sehat', 'normal', 0.98, null, 'resolved', now() - interval '2 hours');

  -- Alerts for the detection
  INSERT INTO public.alerts (user_id, device_id, detection_id, type, severity, title, message)
  VALUES (v_admin_id, v_device1_id,
    (SELECT id FROM detections WHERE pest_name = 'Wereng Batang Coklat' LIMIT 1),
    'pest_detected', 'critical',
    'Hama Terdeteksi!', 'Wereng Batang Coklat terdeteksi di Sensor Sawah A dengan confidence 92%');

  -- Alert settings for user
  INSERT INTO public.alert_settings (user_id)
  VALUES (v_admin_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- 2. Execute seed
SELECT public.seed_demo_data();

-- 3. Cleanup (optional)
-- DROP FUNCTION IF EXISTS public.seed_demo_data;
