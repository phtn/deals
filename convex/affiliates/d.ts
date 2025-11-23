import {v} from 'convex/values'

export const affiliateSchema = v.object({
  uid: v.optional(v.string()),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  group: v.optional(v.string()),
  level: v.optional(v.number()),
  active: v.optional(v.boolean()),
  createdById: v.optional(v.string()),
  createdByName: v.optional(v.string()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  rewardPoints: v.optional(v.number()),
  referralCount: v.optional(v.number()),
  badges: v.optional(v.array(v.string())),
  qrCodes: v.optional(v.array(v.id('qrcodes'))),
  remarks: v.optional(v.optional(v.string())),
})
