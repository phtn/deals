import {useCallback, useEffect, useState} from 'react'

// Type definitions
interface ScreenInfo {
  width: number
  height: number
  availWidth: number
  availHeight: number
  colorDepth: number
  pixelDepth: number
  orientation: string
  pixelRatio: number
}

interface NavigatorInfo {
  userAgent: string
  language: string
  languages: readonly string[]
  platform: string
  vendor: string
  cookieEnabled: boolean
  doNotTrack: string | null
  hardwareConcurrency: number
  maxTouchPoints: number
  onLine: boolean
}

interface BrowserInfo {
  name: string
  version: string
  engine: string
}

interface OSInfo {
  name: string
  version: string
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  vendor: string
  model: string
}

interface GeolocationData {
  latitude: number
  longitude: number
  accuracy: number
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number
}

interface IPInfo {
  ip: string
  city: string
  region: string
  country: string
  timezone: string
  isp: string
}

interface CanvasFingerprint {
  hash: string
  data: string
}

interface WebGLInfo {
  vendor: string
  renderer: string
  version: string
}

interface AudioFingerprint {
  hash: string
}

interface FontList {
  available: string[]
  count: number
}

interface TimezoneInfo {
  timezone: string
  offset: number
  dst: boolean
}

interface BatteryInfo {
  charging: boolean
  level: number
  chargingTime: number
  dischargingTime: number
}

interface ConnectionInfo {
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

interface UserAgentData {
  // Basic info
  timestamp: number
  sessionId: string

  // Device & Browser
  navigator: NavigatorInfo
  browser: BrowserInfo
  os: OSInfo
  device: DeviceInfo
  screen: ScreenInfo

  // Advanced fingerprinting
  canvas: CanvasFingerprint | null
  webgl: WebGLInfo | null
  audio: AudioFingerprint | null
  fonts: FontList | null

  // Network & Location
  ip: IPInfo | null
  geolocation: GeolocationData | null
  timezone: TimezoneInfo

  // Additional
  battery: BatteryInfo | null
  connection: ConnectionInfo | null

  // Composite fingerprint
  fingerprint: string
}

interface UseAgentCaptureOptions {
  enableGeolocation?: boolean
  enableIPLookup?: boolean
  enableCanvas?: boolean
  enableWebGL?: boolean
  enableAudio?: boolean
  enableFonts?: boolean
  enableBattery?: boolean
  ipLookupService?: string
  ipApiKey?: string
}

interface UseAgentCaptureReturn {
  data: UserAgentData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// Utility functions
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const parseUserAgent = (
  ua: string,
): {browser: BrowserInfo; os: OSInfo; device: DeviceInfo} => {
  // Browser detection
  let browserName = 'Unknown'
  let browserVersion = 'Unknown'
  let engine = 'Unknown'

  if (ua.includes('Firefox/')) {
    browserName = 'Firefox'
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || 'Unknown'
    engine = 'Gecko'
  } else if (ua.includes('Edg/')) {
    browserName = 'Edge'
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || 'Unknown'
    engine = 'Blink'
  } else if (ua.includes('Chrome/')) {
    browserName = 'Chrome'
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || 'Unknown'
    engine = 'Blink'
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browserName = 'Safari'
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || 'Unknown'
    engine = 'WebKit'
  } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
    browserName = 'Opera'
    browserVersion = ua.match(/(?:Opera|OPR)\/([\d.]+)/)?.[1] || 'Unknown'
    engine = 'Blink'
  }

  // OS detection
  let osName = 'Unknown'
  let osVersion = 'Unknown'

  if (ua.includes('Windows NT')) {
    osName = 'Windows'
    const version = ua.match(/Windows NT ([\d.]+)/)?.[1]
    const versionMap: Record<string, string> = {
      '10.0': '10/11',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': '7',
    }
    osVersion = version ? versionMap[version] || version : 'Unknown'
  } else if (ua.includes('Mac OS X')) {
    osName = 'macOS'
    osVersion =
      ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown'
  } else if (ua.includes('Android')) {
    osName = 'Android'
    osVersion = ua.match(/Android ([\d.]+)/)?.[1] || 'Unknown'
  } else if (
    ua.includes('iOS') ||
    ua.includes('iPhone') ||
    ua.includes('iPad')
  ) {
    osName = 'iOS'
    osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown'
  } else if (ua.includes('Linux')) {
    osName = 'Linux'
  }

  // Device detection
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  let deviceVendor = 'Unknown'
  let deviceModel = 'Unknown'

  if (ua.includes('Mobile') || ua.includes('Android')) {
    deviceType = 'mobile'
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    deviceType = 'tablet'
  }

  if (ua.includes('iPhone')) {
    deviceVendor = 'Apple'
    deviceModel = 'iPhone'
  } else if (ua.includes('iPad')) {
    deviceVendor = 'Apple'
    deviceModel = 'iPad'
  } else if (ua.includes('Samsung')) {
    deviceVendor = 'Samsung'
    deviceModel = ua.match(/Samsung[^;)]+/)?.[0] || 'Unknown'
  }

  return {
    browser: {name: browserName, version: browserVersion, engine},
    os: {name: osName, version: osVersion},
    device: {type: deviceType, vendor: deviceVendor, model: deviceModel},
  }
}

const getScreenInfo = (): ScreenInfo => {
  return {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth,
    orientation: window.screen.orientation?.type || 'unknown',
    pixelRatio: window.devicePixelRatio,
  }
}

const getNavigatorInfo = (): NavigatorInfo => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    vendor: navigator.vendor,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    onLine: navigator.onLine,
  }
}

const getCanvasFingerprint = (): CanvasFingerprint => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return {hash: 'unavailable', data: ''}
  }

  canvas.width = 200
  canvas.height = 50

  ctx.textBaseline = 'top'
  ctx.font = '14px "Arial"'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#f60'
  ctx.fillRect(125, 1, 62, 20)
  ctx.fillStyle = '#069'
  ctx.fillText('Canvas Fingerprint', 2, 15)
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
  ctx.fillText('Canvas Fingerprint', 4, 17)

  const dataURL = canvas.toDataURL()
  const hash = hashString(dataURL)

  return {hash, data: dataURL.substring(0, 100)}
}

const getWebGLInfo = (): WebGLInfo | null => {
  const canvas = document.createElement('canvas')
  const gl =
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

  if (!gl || !(gl instanceof WebGLRenderingContext)) {
    return null
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')

  return {
    vendor: debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR),
    renderer: debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER),
    version: gl.getParameter(gl.VERSION),
  }
}

const getAudioFingerprint = (): AudioFingerprint => {
  try {
    const audioContext = new (window.AudioContext ||
      (window as Window & {webkitAudioContext?: typeof AudioContext})
        .webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const analyser = audioContext.createAnalyser()
    const gainNode = audioContext.createGain()
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)

    gainNode.gain.value = 0
    oscillator.connect(analyser)
    analyser.connect(scriptProcessor)
    scriptProcessor.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(0)
    const data = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(data)

    oscillator.stop()
    audioContext.close()

    const hash = hashString(data.toString())
    return {hash}
  } catch {
    return {hash: 'unavailable'}
  }
}

const getAvailableFonts = (): FontList => {
  const baseFonts = ['monospace', 'sans-serif', 'serif']
  const testFonts = [
    'Arial',
    'Verdana',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Palatino',
    'Garamond',
    'Bookman',
    'Comic Sans MS',
    'Trebuchet MS',
    'Impact',
    'Helvetica',
    'Tahoma',
    'Geneva',
    'Lucida',
  ]

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return {available: [], count: 0}

  const testString = 'mmmmmmmmmmlli'
  const testSize = '72px'

  const baselines: Record<string, number> = {}
  baseFonts.forEach((baseFont) => {
    ctx.font = `${testSize} ${baseFont}`
    baselines[baseFont] = ctx.measureText(testString).width
  })

  const available = testFonts.filter((font) => {
    return baseFonts.some((baseFont) => {
      ctx.font = `${testSize} ${font}, ${baseFont}`
      const width = ctx.measureText(testString).width
      return width !== baselines[baseFont]
    })
  })

  return {available, count: available.length}
}

const getTimezoneInfo = (): TimezoneInfo => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const offset = -new Date().getTimezoneOffset()

  const jan = new Date(new Date().getFullYear(), 0, 1)
  const jul = new Date(new Date().getFullYear(), 6, 1)
  const dst =
    Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()) !==
    new Date().getTimezoneOffset()

  return {timezone, offset, dst}
}

const getBatteryInfo = async (): Promise<BatteryInfo | null> => {
  try {
    interface BatteryManager {
      charging: boolean
      level: number
      chargingTime: number
      dischargingTime: number
    }

    interface NavigatorWithBattery extends Navigator {
      getBattery?: () => Promise<BatteryManager>
    }

    const nav = navigator as NavigatorWithBattery

    if (!nav.getBattery) {
      return null
    }

    const battery = await nav.getBattery()
    return {
      charging: battery.charging,
      level: battery.level,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    }
  } catch {
    return null
  }
}

const getConnectionInfo = (): ConnectionInfo | null => {
  interface NetworkInformation {
    effectiveType: string
    downlink: number
    rtt: number
    saveData: boolean
  }

  interface NavigatorWithConnection extends Navigator {
    connection?: NetworkInformation
  }

  const nav = navigator as NavigatorWithConnection
  const connection = nav.connection

  if (!connection) {
    return null
  }

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  }
}

const getGeolocation = (): Promise<GeolocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        reject(error)
      },
      {timeout: 10000, maximumAge: 0},
    )
  })
}

const getIPInfo = async (service?: string): Promise<IPInfo> => {
  // Use custom service or default to Next.js API route
  const url = service || '/api/ip-lookup'

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Check for error in response
    if (data.error) {
      throw new Error(data.error)
    }

    return {
      ip: data.ip || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country || 'Unknown',
      timezone: data.timezone || 'Unknown',
      isp: data.isp || 'Unknown',
    }
  } catch (err) {
    console.warn('IP lookup failed:', err)
    return {
      ip: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      timezone: 'Unknown',
      isp: 'Unknown',
    }
  }
}

const hashString = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

const generateFingerprint = (data: Partial<UserAgentData>): string => {
  const components = [
    data.navigator?.userAgent,
    data.screen?.width,
    data.screen?.height,
    data.screen?.colorDepth,
    data.canvas?.hash,
    data.webgl?.renderer,
    data.audio?.hash,
    data.fonts?.count,
    data.timezone?.timezone,
    data.navigator?.hardwareConcurrency,
  ]

  const combined = components.filter(Boolean).join('|')
  return hashString(combined)
}

// Main Hook
export const useAgentCapture = (
  options: UseAgentCaptureOptions = {},
): UseAgentCaptureReturn => {
  const [data, setData] = useState<UserAgentData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const {
    enableGeolocation = false,
    enableIPLookup = false,
    enableCanvas = true,
    enableWebGL = true,
    enableAudio = true,
    enableFonts = true,
    enableBattery = true,
    ipLookupService,
  } = options

  const captureData = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const navigatorInfo = getNavigatorInfo()
      const {browser, os, device} = parseUserAgent(navigatorInfo.userAgent)
      const screen = getScreenInfo()
      const timezone = getTimezoneInfo()

      const partialData: Partial<UserAgentData> = {
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        navigator: navigatorInfo,
        browser,
        os,
        device,
        screen,
        timezone,
        canvas: enableCanvas ? getCanvasFingerprint() : null,
        webgl: enableWebGL ? getWebGLInfo() : null,
        audio: enableAudio ? getAudioFingerprint() : null,
        fonts: enableFonts ? getAvailableFonts() : null,
        connection: getConnectionInfo(),
        battery: null,
        geolocation: null,
        ip: null,
      }

      // Async operations
      const promises: Promise<void>[] = []

      if (enableBattery) {
        promises.push(
          getBatteryInfo().then((battery) => {
            partialData.battery = battery
          }),
        )
      }

      if (enableGeolocation) {
        promises.push(
          getGeolocation()
            .then((geo) => {
              partialData.geolocation = geo
            })
            .catch(() => {
              // Silently fail geolocation
            }),
        )
      }

      if (enableIPLookup) {
        promises.push(
          getIPInfo(ipLookupService)
            .then((ip) => {
              partialData.ip = ip
            })
            .catch(() => {
              // Silently fail IP lookup
            }),
        )
      }

      await Promise.all(promises)

      const fingerprint = generateFingerprint(partialData)
      const completeData = {...partialData, fingerprint} as UserAgentData

      setData(completeData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [
    enableGeolocation,
    enableIPLookup,
    enableCanvas,
    enableWebGL,
    enableAudio,
    enableFonts,
    enableBattery,
    ipLookupService,
  ])

  useEffect(() => {
    captureData()
  }, [captureData])

  const refresh = useCallback(async (): Promise<void> => {
    await captureData()
  }, [captureData])

  return {data, loading, error, refresh}
}
