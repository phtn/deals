import type {ParsedData, ParsedDataByDocumentType} from '@/app/x/ocr/types'
import {parseWithGemini} from '@/lib/vision/parse-gemini'
import {useState} from 'react'
import {DocType} from '../../convex/documents/d'

interface UseGeminiParsingReturn<T> {
  parseText: (text: string) => Promise<T>
  loading: boolean
  error: string | null
  parsedData: T | null
}

interface UseGeminiParsingOptions {
  documentType: DocType
}

export function useGeminiParsing({documentType}: UseGeminiParsingOptions) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)

  const parseText = async (
    text: string,
  ): Promise<ParsedDataByDocumentType[typeof documentType]> => {
    setLoading(true)
    setError(null)

    try {
      const parsed = await parseWithGemini(text, documentType)
      setParsedData(parsed)
      return parsed
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to parse text with Gemini'
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
  } as UseGeminiParsingReturn<ParsedData>
}
