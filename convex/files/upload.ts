import {v} from 'convex/values'
import {mutation} from '../_generated/server'
import {fileFormat, fileType} from './d'

export const url = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const file = mutation({
  args: {
    storageId: v.id('_storage'),
    author: v.string(),
    type: fileType,
    format: fileFormat,
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('files', {
      body: args.storageId,
      author: args.author,
      format: args.format,
      type: args.type,
    })
  },
})
