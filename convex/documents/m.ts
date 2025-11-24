import {v} from 'convex/values'
import {mutation} from '../_generated/server'
import {documentSchema} from './d'

export const create = mutation({
  args: {data: documentSchema},
  handler: async ({db}, {data}) => {
    const now = Date.now()
    return await db.insert('documents', {
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    })
  },
})

export const update = mutation({
  args: {id: v.id('documents'), data: v.any()},
  handler: async ({db}, {id, data}) => {
    const document = await db.get(id)
    if (!document) throw new Error('Document not found')
    
    return await db.patch(id, {
      ...data,
      updatedAt: Date.now(),
    })
  },
})

export const updateOcrStatus = mutation({
  args: {
    id: v.id('documents'),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    ocrResults: v.optional(
      v.object({
        text: v.optional(v.string()),
        confidence: v.optional(v.number()),
        fields: v.optional(v.any()),
        processedAt: v.optional(v.number()),
      }),
    ),
    ocrError: v.optional(v.string()),
  },
  handler: async ({db}, {id, status, ocrResults, ocrError}) => {
    const document = await db.get(id)
    if (!document) throw new Error('Document not found')
    
    return await db.patch(id, {
      ocrStatus: status,
      ocrResults: ocrResults || document.ocrResults,
      ocrError: ocrError,
      updatedAt: Date.now(),
    })
  },
})

export const removeOne = mutation({
  args: {id: v.id('documents')},
  handler: async ({db}, {id}) => {
    const document = await db.get(id)
    if (!document) throw new Error('Document not found')
    return await db.delete(id)
  },
})

export const removeMany = mutation({
  args: {ids: v.array(v.id('documents'))},
  handler: async ({db}, {ids}) => {
    const results = []
    const errors = []
    
    for (const id of ids) {
      try {
        const document = await db.get(id)
        if (!document) {
          errors.push({id, error: 'Document not found'})
          continue
        }
        await db.delete(id)
        results.push(id)
      } catch (error) {
        errors.push({id, error: error instanceof Error ? error.message : 'Unknown error'})
      }
    }
    
    return {
      deleted: results,
      errors: errors.length > 0 ? errors : undefined,
      deletedCount: results.length,
      totalRequested: ids.length,
    }
  },
})

