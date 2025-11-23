'use client'

import {ClassName} from '@/app/types'
import {cn} from '@/lib/utils'
import QRCode, {type Options} from 'qrcode-svg'
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react'

interface QrViewerProps {
  url?: string | null
  id?: string
  grp?: string
  className?: ClassName
  size?: number // QR code size in pixels (default: 300)
  padding?: number // Padding around QR code (default: 4)
}

export const QrViewer = ({
  url,
  id,
  grp,
  className,
  size = 300,
  padding = 4,
}: QrViewerProps) => {
  // Parse URL to extract id and grp if URL is provided
  const parsedParams = useMemo(() => {
    if (url) {
      try {
        const urlObj = new URL(url)
        const params = new URLSearchParams(urlObj.search)
        return {
          id: params.get('id') || id || '',
          grp: params.get('grp') || grp || 'no-group',
        }
      } catch {
        return {id: id || '', grp: grp || 'no-group'}
      }
    }
    return {id: id || '', grp: grp || 'no-group'}
  }, [url, id, grp])

  const qrData = useMemo(() => {
    if (url) return url
    // Fallback to constructing URL if only id/grp provided
    return `https://scan-ts.vercel.app/?id=${encodeURIComponent(parsedParams.id)}&grp=${encodeURIComponent(parsedParams.grp)}`
  }, [url, parsedParams])

  const options = useMemo(
    () =>
      ({
        content: qrData,
        padding,
        width: size,
        height: size,
        color: '#12121a',
        background: '#ffffff',
        ecl: 'M' as const,
      }) satisfies Options,
    [qrData, size, padding],
  )

  const [svgString, setSvgString] = useState<string>('')
  const ref = useRef<HTMLDivElement>(null)

  const generateQRCode = useCallback(() => {
    if (!parsedParams.id) {
      setSvgString('')
      return
    }
    try {
      const code = new QRCode(options)
      const svg = code.svg()
      setSvgString(svg)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      setSvgString('')
    }
  }, [options, parsedParams.id])

  useEffectEvent(() => {
    generateQRCode()
  })

  useEffect(() => {
    if (ref.current && svgString) {
      ref.current.innerHTML = svgString
    } else if (ref.current && !svgString) {
      ref.current.innerHTML = ''
    }
  }, [svgString])

  if (!parsedParams.id) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <p className='text-sm text-muted-foreground'>No QR code available</p>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div className='w-fit h-auto rounded-md overflow-hidden bg-white p-2'>
        <div className='bg-white aspect-square' ref={ref} />
      </div>
    </div>
  )
}

interface QRCodeSVGProps {
  options: Options
  className?: ClassName
}

export const QRCodeSVG = ({options, className}: QRCodeSVGProps) => {
  const code = new QRCode({
    content: options.content,
    padding: 4,
    width: options.width ?? 180,
    height: options.height ?? 180,
    color: '#12121a',
    background: '#ffffff',
    ecl: 'M' as const,
  })

  const svgString = code.svg()

  return (
    <div className={cn('size-full', className)}>
      {
        <svg
          className='aspect-square'
          dangerouslySetInnerHTML={{__html: svgString}}
        />
      }
    </div>
  )
}

interface QRCodeSVGOptions {
  content: string
  width?: number
  height?: number
  color?: string
  background?: string
}

// Hook to get QR code SVG data for downloading/printing
export const useQRCodeSVG = ({options}: {options: QRCodeSVGOptions}) => {
  const code = new QRCode({
    content: options.content,
    padding: 4,
    width: options.width ?? 160,
    height: options.height ?? 160,
    color: options.color ?? '#12121a',
    background: options.background ?? '#ffffff',
    ecl: 'M' as const,
  })

  return code.svg()
}
