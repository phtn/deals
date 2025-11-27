import {useState} from 'react'

export interface OCRResult {
  text: string
  confidence: number
}

interface UseOCRProcessingReturn {
  extractText: (file: File) => Promise<OCRResult>
  loading: boolean
  error: string | null
}

export function useOCRProcessing(): UseOCRProcessingReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const extractText = async (file: File): Promise<OCRResult> => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

      const data: {text: string; confidence: number} = await response.json()
      return {text: data.text, confidence: data.confidence}
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to extract text from image'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    extractText,
    loading,
    error,
  }
}




