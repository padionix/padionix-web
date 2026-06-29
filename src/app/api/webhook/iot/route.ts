import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { IoTWebhookPayload } from '@/lib/types'

export const dynamic = 'force-dynamic'

// ponytail: rate limit via Cloudflare WAF

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function createServiceClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function parseISO(s: string): number {
  return new Date(s).getTime()
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()

  // 1. verify device key header
  const deviceKey = request.headers.get('X-Device-Key')
  if (!deviceKey) {
    return NextResponse.json({ error: 'missing X-Device-Key header' }, { status: 401 })
  }

  const { data: device, error: devErr } = await supabase
    .from('devices')
    .select('id, is_active')
    .eq('device_key', deviceKey)
    .maybeSingle()

  if (devErr || !device) {
    return NextResponse.json({ error: 'invalid device key' }, { status: 401 })
  }
  if (!device.is_active) {
    return NextResponse.json({ error: 'device inactive' }, { status: 403 })
  }

  // 2. parse body
  let body: IoTWebhookPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  if (!body.device_key || !body.sensors) {
    return NextResponse.json({ error: 'device_key and sensors required' }, { status: 400 })
  }

  const { temperature, humidity, pressure } = body.sensors

  // 3. range validation
  if (temperature != null && (temperature < -10 || temperature > 60)) {
    return NextResponse.json({ error: 'temperature out of range' }, { status: 400 })
  }
  if (humidity != null && (humidity < 0 || humidity > 100)) {
    return NextResponse.json({ error: 'humidity out of range' }, { status: 400 })
  }
  if (pressure != null && (pressure < 800 || pressure > 1100)) {
    return NextResponse.json({ error: 'pressure out of range' }, { status: 400 })
  }

  // 4. timestamp anti-replay
  if (body.timestamp) {
    const ts = parseISO(body.timestamp)
    const now = Date.now()
    if (isNaN(ts) || Math.abs(now - ts) > 300_000) {
      return NextResponse.json({ error: 'timestamp out of sync (>5m)' }, { status: 400 })
    }
  }

  // 5. insert sensor reading
  const { error: insertErr } = await supabase.from('sensor_readings').insert({
    device_id: device.id,
    temperature,
    humidity,
    pressure,
    motion_detected: body.sensors.motion_detected ?? false,
    signal_strength: body.system?.signal_dbm ?? null,
    recorded_at: body.timestamp || new Date().toISOString(),
  })

  if (insertErr) {
    console.error('sensor insert error', insertErr)
    return NextResponse.json({ error: 'insert failed' }, { status: 500 })
  }

  // 6. handle image
  if (body.image?.base64) {
    const imgBuf = Buffer.from(body.image.base64, 'base64')
    if (imgBuf.length > 5_000_000) {
      return NextResponse.json({ error: 'image too large (>5MB)' }, { status: 400 })
    }

    const ts = Date.now()
    const path = `${device.id}/${ts}.jpg`

    const { error: uploadErr } = await supabase.storage
      .from('device-images')
      .upload(path, imgBuf, { contentType: 'image/jpeg', upsert: false })

    if (uploadErr) {
      console.error('image upload error', uploadErr)
      // ponytail: non-fatal, continue without detection
    } else {
      const { error: detErr } = await supabase.from('detections').insert({
        device_id: device.id,
        image_path: path,
        pest_type: 'unknown',
        status: 'unhandled',
        detected_at: new Date().toISOString(),
      })
      if (detErr) {
        console.error('detection insert error', detErr)
        // ponytail: non-fatal
      }
    }
  }

  return NextResponse.json({ status: 'ok' })
}
