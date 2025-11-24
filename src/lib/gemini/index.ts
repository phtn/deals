'use server'
import {GoogleGenAI} from '@google/genai'
import {env} from '@/env'

let ai: GoogleGenAI | null = null
export const createClient = async () => {
  const apiKey = env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables')
  }
  if (!ai) {
    ai = new GoogleGenAI({apiKey})
  }
  return ai
}
