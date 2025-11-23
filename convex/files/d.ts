import {Infer, v} from 'convex/values'

export const fileType = v.union(v.literal('image'), v.literal('document'))
export type FileType = Infer<typeof fileType>

export const fileFormat = v.union(
  v.literal('image/jpeg'),
  v.literal('image/png'),
  v.literal('image/avif'),
  v.literal('image/webp'),
  v.literal('image/gif'),
  v.literal('image/heic'),
  v.literal('image/heif'),
  v.literal('image/tiff'),
  v.literal('image/svg+xml'),
  v.literal('pdf'),
  v.literal('csv'),
  v.literal('xlsx'),
)
export type FileFormat = Infer<typeof fileFormat>

export const fileSchema = v.object({
  body: v.id('_storage'),
  author: v.string(),
  format: fileFormat,
  type: fileType,
  caption: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  uploadedAt: v.optional(v.number()),
})

export type UploadType = Infer<typeof fileSchema>
