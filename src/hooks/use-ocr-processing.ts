import {useState} from 'react'

interface UseOCRProcessingReturn {
  extractText: (file: File) => Promise<string>
  loading: boolean
  error: string | null
}

export function useOCRProcessing(): UseOCRProcessingReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const extractText = async (file: File): Promise<string> => {
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

      const data: {text: string} = await response.json()
      return data.text
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

