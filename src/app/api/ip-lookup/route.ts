import {NextRequest, NextResponse} from 'next/server'

interface IPApiResponse {
  ip: string
  city: string
  region: string
  country_name: string
  country: string
  timezone: string
  org: string
  isp: string
  error?: boolean
  reason?: string
}

interface IPInfoResponse {
  ip: string
  city: string
  region: string
  country: string
  timezone: string
  isp: string
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<IPInfoResponse | {error: string}>> {
  try {
    // Get the API key from environment variable
    const apiKey = process.env.IPAPI_API_KEY

    if (!apiKey) {
      console.warn('IPAPI_API_KEY not found in environment variables')
    }

    // Get client IP from request headers (for logging/verification)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown'

    console.log('IP lookup request from:', clientIp)

    // Construct the ipapi.co URL with or without API key
    const url = apiKey
      ? `https://ipapi.co/json/?key=${apiKey}`
      : 'https://ipapi.co/json/'

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Next.js IP Lookup Service',
      },
      // Cache for 5 minutes
      next: {revalidate: 300},
    })

    if (!response.ok) {
      throw new Error(`ipapi.co responded with status: ${response.status}`)
    }

    const data: IPApiResponse = await response.json()

    // Check for API error response
    if (data.error) {
      throw new Error(data.reason || 'IP lookup failed')
    }

    // Transform the response to match our interface
    const ipInfo: IPInfoResponse = {
      ip: data.ip || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country_name || data.country || 'Unknown',
      timezone: data.timezone || 'Unknown',
      isp: data.org || data.isp || 'Unknown',
    }

    return NextResponse.json(ipInfo, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('IP lookup error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch IP information',
      },
      {status: 500},
    )
  }
}

// Optional: POST method if you want to lookup specific IPs
export async function POST(
  request: NextRequest,
): Promise<NextResponse<IPInfoResponse | {error: string}>> {
  try {
    const apiKey = process.env.IPAPI_API_KEY
    const body = (await request.json()) as {ip?: string}
    const targetIp = body.ip

    if (!targetIp) {
      return NextResponse.json({error: 'IP address is required'}, {status: 400})
    }

    // Validate IP format (basic check)
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(targetIp)) {
      return NextResponse.json(
        {error: 'Invalid IP address format'},
        {status: 400},
      )
    }

    const url = apiKey
      ? `https://ipapi.co/${targetIp}/json/?key=${apiKey}`
      : `https://ipapi.co/${targetIp}/json/`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Next.js IP Lookup Service',
      },
    })

    if (!response.ok) {
      throw new Error(`ipapi.co responded with status: ${response.status}`)
    }

    const data: IPApiResponse = await response.json()

    if (data.error) {
      throw new Error(data.reason || 'IP lookup failed')
    }

    const ipInfo: IPInfoResponse = {
      ip: data.ip || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country_name || data.country || 'Unknown',
      timezone: data.timezone || 'Unknown',
      isp: data.org || data.isp || 'Unknown',
    }

    return NextResponse.json(ipInfo)
  } catch (error) {
    console.error('IP lookup error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch IP information',
      },
      {status: 500},
    )
  }
}
