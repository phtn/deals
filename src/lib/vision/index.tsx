import {ImageAnnotatorClient, protos} from '@google-cloud/vision'
import * as dotenv from 'dotenv'
dotenv.config()

type IAnnotateImageResponse =
  protos.google.cloud.vision.v1.IAnnotateImageResponse

let client: ImageAnnotatorClient | null = null

export function getVisionClient(): ImageAnnotatorClient {
  if (!client) {
    client = new ImageAnnotatorClient({
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(
          /\\n/g,
          '\n',
        ),
      },
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    })
  }

  return client
}

export interface OCRResult {
  text: string
  confidence: number
}

export async function extractTextFromBuffer(
  imageBuffer: Buffer,
): Promise<OCRResult> {
  const client = getVisionClient()
  const [result]: [IAnnotateImageResponse] =
    await client.textDetection(imageBuffer)
  const detections = result.textAnnotations

  if (!detections || detections.length === 0) {
    return {text: '', confidence: 0}
  }

  const fullText = detections[0].description ?? ''
  
  // Calculate confidence score
  // Prefer the full text block confidence (index 0), otherwise calculate average
  const confidences = detections
    .map((detection) => detection.confidence)
    .filter((conf): conf is number => conf !== undefined && conf !== null)
  
  let confidence = 0.5 // Default fallback
  if (confidences.length > 0) {
    // Use the full text block confidence if available, otherwise average all confidences
    if (detections[0].confidence !== undefined && detections[0].confidence !== null) {
      confidence = detections[0].confidence
    } else {
      confidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
    }
  }

  return {
    text: fullText,
    confidence,
  }
}
