import {v} from 'convex/values'

export const qrCodeSchema = v.object({
  active: v.boolean(),
  url: v.string(),
  uid: v.string(),
  grp: v.string(),
  seed: v.string(),
  ident: v.string(),
  createdBy: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
