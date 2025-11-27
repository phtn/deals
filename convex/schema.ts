import {defineSchema, defineTable} from 'convex/server'
import {affiliateSchema} from './affiliates/d'
import {documentSchema} from './documents/d'
import {fileSchema} from './files/d'
import {qrCodeSchema} from './qrcodes/d'

export default defineSchema({
  qrcodes: defineTable(qrCodeSchema).index('by_uid', ['uid']),
  affiliates: defineTable(affiliateSchema)
    .index('by_uid', ['uid'])
    .index('by_email', ['email'])
    .searchIndex('search_name', {
      searchField: 'name',
      filterFields: ['name'],
    }),
  documents: defineTable(documentSchema)
    .index('by_status', ['ocrStatus'])
    .index('by_type', ['documentType'])
    .index('by_uploader', ['uploadedBy']),
  files: defineTable(fileSchema).index('by_body', ['body']),
})
