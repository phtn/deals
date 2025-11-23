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

export async function extractTextFromBuffer(
  imageBuffer: Buffer,
): Promise<string> {
  const client = getVisionClient()
  const [result]: [IAnnotateImageResponse] =
    await client.textDetection(imageBuffer)
  const detections = result.textAnnotations

  if (!detections || detections.length === 0) {
    return ''
  }

  return detections[0].description ?? ''
}
