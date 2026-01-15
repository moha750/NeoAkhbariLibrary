import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getClientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }

  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf.trim()

  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return null
}

async function lookupCountry(ip: string | null) {
  const url = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : 'https://ipwho.is/'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`geo lookup failed: ${res.status}`)
  const data = await res.json()

  if (data && data.success === false) {
    const message = (data && typeof data.message === 'string') ? data.message : 'unknown'
    throw new Error(`geo lookup error: ${message}`)
  }

  const country = (data && data.country) ? String(data.country).trim() : ''
  return {
    ip: ip || (data && data.ip ? String(data.ip) : null),
    country: country || 'Unknown',
    source: 'ipwho.is',
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ip = getClientIp(req)

    const result = await lookupCountry(ip)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({
        ip: null,
        country: 'Unknown',
        source: 'edge',
        error: errMsg,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})
