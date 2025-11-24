import {parseWithGemini} from '@/lib/vision/parse-gemini'
import {VehicleRegistration} from '@/lib/vision/parse-lto'
import {useState} from 'react'

interface UseGeminiParsingReturn {
  parseText: (text: string) => Promise<VehicleRegistration>
  loading: boolean
  error: string | null
  parsedData: VehicleRegistration | null
}

export function useGeminiParsing(): UseGeminiParsingReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<VehicleRegistration | null>(null)

  const parseText = async (text: string): Promise<VehicleRegistration> => {
    setLoading(true)
    setError(null)

    try {
      const parsed = await parseWithGemini(text)
      setParsedData(parsed)
      return parsed
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to parse text with Gemini'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    parseText,
    loading,
    error,
    parsedData,
  }
}

