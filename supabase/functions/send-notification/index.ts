import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// ponytail: empty-payload push (wake-up signal); full payload encryption if notification bodies needed without extra fetch

interface AlertRow {
  id: string
  user_id: string
  device_id: string | null
  type: string
  severity: string
  title: string
  message: string
}

interface PushSubscription {
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
}

// ---------- VAPID helpers ----------

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(s: string): Uint8Array {
  return Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
}

function utf8Enc(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}

async function signVapidJwt(
  origin: string,
  subject: string,
  privateKeyB64: string,
  publicKeyB64: string,
): Promise<string> {
  // VAPID keys: private=raw32, public=raw65 (0x04||x||y)
  const d = b64urlDecode(privateKeyB64)
  const pub = b64urlDecode(publicKeyB64)
  // Use subarray views to avoid Uint8Array<ArrayBufferLike> slice type issues
  const x = new Uint8Array(pub.buffer, pub.byteOffset + 1, 32)
  const y = new Uint8Array(pub.buffer, pub.byteOffset + 33, 32)

  const key = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      d: b64urlEncode(d),
      x: b64urlEncode(x),
      y: b64urlEncode(y),
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign'],
  )

  const header = b64urlEncode(utf8Enc(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const payload = b64urlEncode(utf8Enc(JSON.stringify({
    aud: origin,
    exp: Math.floor(Date.now() / 1000) + 86400,
    sub: subject,
  })))
  const signingInput = header + '.' + payload
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, utf8Enc(signingInput) as BufferSource)
  const sigBytes = new Uint8Array(sig)
  return signingInput + '.' + b64urlEncode(sigBytes)
}

async function sendPush(
  sub: PushSubscription,
  vapidJwt: string,
  publicKeyB64: string,
): Promise<{ ok: boolean; gone: boolean }> {
  // Send empty-body push with VAPID auth
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + vapidJwt,
      'Crypto-Key': 'p256ecdsa=' + publicKeyB64,
      TTL: '86400',
      'Content-Length': '0',
    },
  })

  if (res.status === 410) return { ok: false, gone: true }
  return { ok: res.ok, gone: false }
}

// ---------- main ----------

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // parse optional filters
  let alertIds: string[] | undefined
  let filterUserId: string | undefined
  let filterDeviceId: string | undefined

  try {
    const body = await req.json()
    if (Array.isArray(body.alert_ids)) alertIds = body.alert_ids
    if (body.user_id) filterUserId = body.user_id
    if (body.device_id) filterDeviceId = body.device_id
  } catch {
    // empty/invalid body -> fetch all unsent
  }

  // VAPID config
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') || ''
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || ''
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@padionix.com'

  const vapidConfigured = !!(vapidPublicKey && vapidPrivateKey)

  // Build query
  let query = supabase.from('alerts').select('*').eq('is_sent', false)

  if (alertIds && alertIds.length > 0) query = query.in('id', alertIds)
  if (filterUserId) query = query.eq('user_id', filterUserId)
  if (filterDeviceId) query = query.eq('device_id', filterDeviceId)

  // ponytail: single-batch 50; paginate if >50
  query = query.limit(50)

  const { data: alerts, error } = await query

  if (error) {
    console.error('query error', error)
    return new Response(JSON.stringify({ error: 'db query failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!alerts || alerts.length === 0) {
    return new Response(JSON.stringify({ status: 'ok', sent: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Group alerts by user
  const userIds = [...new Set(alerts.map((a: AlertRow) => a.user_id))]

  // Prefetch alert_settings + push_subscriptions
  const { data: settingsRows } = await supabase
    .from('alert_settings')
    .select('user_id, push_enabled')
    .in('user_id', userIds)

  const pushEnabled = new Set(
    (settingsRows || [])
      .filter((s: { user_id: string; push_enabled: boolean }) => s.push_enabled)
      .map((s) => s.user_id),
  )

  const { data: subsRows } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', userIds)

  const userSubs: Record<string, PushSubscription[]> = {}
  for (const sub of subsRows || []) {
    if (!userSubs[sub.user_id]) userSubs[sub.user_id] = []
    userSubs[sub.user_id].push(sub)
  }

  // Pre-sign VAPID JWT once if configured
  let vapidJwt: string | undefined
  if (vapidConfigured) {
    try {
      // Origin from the first subscription endpoint
      subsLoop: for (const subs of Object.values(userSubs)) {
        for (const sub of subs) {
          try {
            const url = new URL(sub.endpoint)
            vapidJwt = await signVapidJwt(url.origin, vapidSubject, vapidPrivateKey, vapidPublicKey)
            break subsLoop
          } catch { /* try next endpoint */ }
        }
      }
    } catch (e) {
      console.error('VAPID JWT signing failed', e)
    }
  }

  // Collect stale subs to delete
  const subsToDelete: PushSubscription[] = []

  let sentCount = 0

  for (const alert of alerts as AlertRow[]) {
    try {
      if (!pushEnabled.has(alert.user_id)) {
        sentCount++
        continue
      }

      const subscriptions = userSubs[alert.user_id] || []

      if (vapidJwt && subscriptions.length > 0) {
        const results = await Promise.allSettled(
          subscriptions.map((sub) => sendPush(sub, vapidJwt, vapidPublicKey)),
        )

        for (let i = 0; i < results.length; i++) {
          const r = results[i]
          if (r.status === 'fulfilled' && r.value.gone) {
            subsToDelete.push(subscriptions[i])
          } else if (r.status === 'rejected') {
            console.error('push error for alert', alert.id, 'sub', subscriptions[i].endpoint.slice(0, 40), r.reason)
          }
        }
      } else {
        console.log(
          '[send-notification] alert ' + alert.id + ' for user ' + alert.user_id +
          ' — ' + (vapidConfigured ? 'no subscriptions' : 'VAPID not configured') + ', skipping push',
        )
      }

      sentCount++
    } catch (err) {
      console.error('error processing alert ' + alert.id, err)
    }
  }

  // Cleanup stale subscriptions (410 Gone)
  if (subsToDelete.length > 0) {
    const endpoints = subsToDelete.map((s) => s.endpoint)
    const { error: delErr } = await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', endpoints)

    if (delErr) console.error('stale sub cleanup error', delErr)
  }

  // Mark alerts as sent
  const ids = alerts.map((a: AlertRow) => a.id)
  const { error: updErr } = await supabase
    .from('alerts')
    .update({ is_sent: true })
    .in('id', ids)

  if (updErr) console.error('update error', updErr)

  return new Response(JSON.stringify({ status: 'ok', sent: sentCount }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
