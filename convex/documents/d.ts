import {v} from 'convex/values'

export const documentType = v.union(
  v.literal('check'),
  v.literal('payslip'),
  v.literal('deposit_slip'),
  v.literal('receipt'),
  v.literal('invoice'),
  v.literal('other'),
  v.literal('cr'),
)

export const ocrStatus = v.union(
  v.literal('pending'),
  v.literal('processing'),
  v.literal('completed'),
  v.literal('failed'),
)

export const documentSchema = v.object({
  documentType: documentType,
  fileUrl: v.string(), // URL or storage ID for the document file
  fileName: v.optional(v.string()),
  fileSize: v.optional(v.number()),
  mimeType: v.optional(v.string()),
  ocrStatus: ocrStatus,
  ocrResults: v.optional(
    v.object({
      text: v.optional(v.string()), // Raw extracted text
      confidence: v.optional(v.number()), // OCR confidence score
      fields: v.optional(v.any()), // Structured extracted fields (flexible)
      processedAt: v.optional(v.number()),
    }),
  ),
  ocrError: v.optional(v.string()), // Error message if OCR failed
  uploadedBy: v.optional(v.string()), // User ID who uploaded
  uploadedByName: v.optional(v.string()),
  metadata: v.optional(
    v.object({
      amount: v.optional(v.number()),
      date: v.optional(v.string()),
      payee: v.optional(v.string()),
      payer: v.optional(v.string()),
      accountNumber: v.optional(v.string()),
      checkNumber: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  ),
  tags: v.optional(v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
})
