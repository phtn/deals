import {defineSchema, defineTable} from 'convex/server'
import {affiliateSchema} from './affiliates/d'
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
})
