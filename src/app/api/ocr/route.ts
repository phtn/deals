import {extractTextFromBuffer} from '@/lib/vision'
import {NextRequest, NextResponse} from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({error: 'No image file provided'}, {status: 400})
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text using Vision API
    const text = await extractTextFromBuffer(buffer)

    return NextResponse.json({text})
  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json({error: 'Failed to process image'}, {status: 500})
  }
}
