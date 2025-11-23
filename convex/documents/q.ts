import {v} from 'convex/values'
import {query} from '../_generated/server'

export const getAll = query({
  handler: async ({db}) =>
    await db
      .query('documents')
      .order('desc')
      .collect(),
})

export const getById = query({
  args: {
    id: v.id('documents'),
  },
  handler: async ({db}, {id}) => await db.get(id),
})

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed'),
    ),
  },
  handler: async ({db}, {status}) =>
    await db
      .query('documents')
      .withIndex('by_status', (q) => q.eq('ocrStatus', status))
      .order('desc')
      .collect(),
})

export const getByType = query({
  args: {
    documentType: v.union(
      v.literal('check'),
      v.literal('payslip'),
      v.literal('deposit_slip'),
      v.literal('receipt'),
      v.literal('invoice'),
      v.literal('other'),
    ),
  },
  handler: async ({db}, {documentType}) =>
    await db
      .query('documents')
      .withIndex('by_type', (q) => q.eq('documentType', documentType))
      .order('desc')
      .collect(),
})

export const getByUploader = query({
  args: {
    uploadedBy: v.string(),
  },
  handler: async ({db}, {uploadedBy}) =>
    await db
      .query('documents')
      .withIndex('by_uploader', (q) => q.eq('uploadedBy', uploadedBy))
      .order('desc')
      .collect(),
})

export const getPendingOcr = query({
  handler: async ({db}) =>
    await db
      .query('documents')
      .withIndex('by_status', (q) => q.eq('ocrStatus', 'pending'))
      .order('asc')
      .collect(),
})


