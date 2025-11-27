'use server'

import {ParsedDataByDocumentType} from '@/app/x/ocr/types'
import {createClient} from '@/lib/gemini'
import {DocType} from '../../../convex/documents/d'
import {instructions} from '../gemini/instructions'

/**
 * Parses raw text using Gemini API to extract structured vehicle registration data
 * @param rawText - The raw text to parse (typically from OCR)
 * @returns A promise that resolves to a VehicleRegistration object
 */
export async function parseWithGemini(rawText: string, documentType: DocType) {
  const client = await createClient()

  const systemInstruction = instructions[documentType]
  type ParsedData = ParsedDataByDocumentType[typeof documentType]

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: rawText,
    config: {
      systemInstruction,
    },
  })

  const responseText = response.text?.trim() || ''

  if (!responseText) {
    throw new Error('Gemini API returned empty response')
  }

  // Try to extract JSON from the response
  // Handle cases where response might be wrapped in markdown code blocks
  let jsonText = responseText
  const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
  if (jsonMatch) {
    jsonText = jsonMatch[1]
  } else {
    // Try to find JSON object in the response
    const jsonObjectMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonObjectMatch) {
      jsonText = jsonObjectMatch[0]
    }
  }

  try {
    const parsed = JSON.parse(jsonText) as ParsedData
    return parsed
  } catch (error) {
    // If JSON parsing fails, log error and return empty object
    console.error('Failed to parse Gemini response as JSON:', error)
    console.error('Response text:', responseText)
    return {} as ParsedData
  }
}
