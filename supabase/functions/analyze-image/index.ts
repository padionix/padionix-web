import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// ponytail: single-model; multi-model ensemble if accuracy matters

const HF_TOKEN = Deno.env.get('HUGGINGFACE_API_KEY') || ''
const HF_MODEL = Deno.env.get('HF_PEST_MODEL') || 'google/vit-base-patch16-224'
const HF_TIMEOUT_MS = 30_000

// model-label (lower_snake_case) -> pest_library.name_id + pest_type
const PEST_MAP: Record<string, { name_id: string; type: string }> = {
  normal:             { name_id: 'Normal / Sehat',        type: 'normal' },
  bacterial_blight:   { name_id: 'Hawar Daun Bakteri',    type: 'penyakit' },
  rice_blast:         { name_id: 'Blas',                   type: 'penyakit' },
  planthopper:        { name_id: 'Wereng Batang Coklat',   type: 'hama' },
  stem_borer:         { name_id: 'Penggerek Batang',      type: 'hama' },
  tungro:             { name_id: 'Tungro',                 type: 'penyakit' },
  brown_spot:         { name_id: 'Noda Coklat',            type: 'penyakit' },
  leaf_blight:        { name_id: 'Kresek / Hawar Daun',   type: 'penyakit' },
  blast:              { name_id: 'Blas',                   type: 'penyakit' },
  brown_planthopper:  { name_id: 'Wereng Batang Coklat',   type: 'hama' },
  whitefly:           { name_id: 'Kutu Kebul',             type: 'hama' },
  leafhopper:         { name_id: 'Wereng Daun',           type: 'hama' },
  sheath_blight:      { name_id: 'Hawar Pelepah',          type: 'penyakit' },
  false_smut:         { name_id: 'False Smut',            type: 'penyakit' },
}

function calcSeverity(confidence: number, pestType: string): string | null {
  if (pestType === 'normal') return null
  if (confidence >= 0.85) return 'critical'
  if (confidence >= 0.70) return 'high'
  if (confidence >= 0.50) return 'medium'
  return 'low'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Accept multipart form with 'image' field
    const contentType = req.headers.get('content-type') || ''
    let imgBytes: Uint8Array
    let imageType = 'image/jpeg'

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const imageFile = formData.get('image')
      if (!imageFile || !(imageFile instanceof File)) {
        return new Response(JSON.stringify({ error: 'missing image field' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      imgBytes = new Uint8Array(await imageFile.bytes())
      imageType = imageFile.type || 'image/jpeg'
    } else {
      // fallback: accept JSON with image data (e.g. { image_data: "<base64>" })
      try {
        const body = await req.json()
        if (body.image_data) {
          imgBytes = Uint8Array.from(atob(body.image_data), (c) => c.charCodeAt(0))
        } else {
          return new Response(JSON.stringify({ error: 'expected multipart form with image field or JSON with image_data' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      } catch {
        return new Response(JSON.stringify({ error: 'invalid request' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Preprocess - resize to 224x224
    let inferenceBytes: Uint8Array
    try {
      const bitmap = await createImageBitmap(new Blob([imgBytes as BlobPart], { type: imageType }))
      const canvas = new OffscreenCanvas(224, 224)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- canvas type mismatch across runtimes
      const ctx: any = canvas.getContext('2d')
      ctx.drawImage(bitmap, 0, 0, 224, 224)
      const resized = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 })
      inferenceBytes = new Uint8Array(await resized.bytes())
      bitmap.close()
    } catch {
      inferenceBytes = imgBytes // fallback: send original
    }

    // Call HuggingFace Inference API with raw image bytes
    const ac = new AbortController()
    const timeoutId = setTimeout(() => ac.abort(), HF_TIMEOUT_MS)

    let pestName: string | null = null
    let pestType = 'unknown'
    let confidence: number | null = null
    let severity: string | null = null
    const bboxData: unknown = null
    let aiRawResult: unknown

    try {
      const hfRes = await fetch(
        'https://api-inference.huggingface.co/models/' + HF_MODEL,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + HF_TOKEN,
            'Content-Type': 'application/octet-stream',
          },
          body: inferenceBytes as BodyInit,
          signal: ac.signal,
        },
      )
      clearTimeout(timeoutId)

      if (!hfRes.ok) {
        console.error('HF API error', hfRes.status, await hfRes.text())
        aiRawResult = { error: 'HF API ' + hfRes.status, retryable: true }
      } else {
        aiRawResult = await hfRes.json()
        // image-classification returns [{label,score},...] or [[{label,score}]]
        const raw = Array.isArray(aiRawResult) ? aiRawResult : []
        const predictions = Array.isArray(raw[0]) ? raw[0] : raw
        const top = predictions[0] as { label?: string; score?: number } | undefined

        if (top?.label != null && top.score != null) {
          const label = top.label.toLowerCase().replace(/[\s_-]+/g, '_')
          const mapped = PEST_MAP[label]
          if (mapped) {
            pestName = mapped.name_id
            pestType = mapped.type
          } else {
            pestName = top.label
            pestType = 'unknown'
          }
          confidence = top.score
          severity = calcSeverity(top.score, pestType)
        }
      }
    } catch (err) {
      clearTimeout(timeoutId)
      if ((err as Error)?.name === 'AbortError') {
        console.error('HF API timeout after', HF_TIMEOUT_MS, 'ms')
        aiRawResult = { error: 'HF API timeout', retryable: true }
      } else {
        console.error('HF API fetch error', err)
        aiRawResult = { error: String(err), retryable: true }
      }
    }

    const detection = {
      pest_name: pestName,
      pest_type: pestType,
      confidence,
      severity,
      bbox_data: bboxData,
    }

    return new Response(
      JSON.stringify({ status: 'ok', detection, ai_raw_result: aiRawResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('analyze-image error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
