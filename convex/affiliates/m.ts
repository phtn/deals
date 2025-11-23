import {v} from 'convex/values'
import {mutation} from '../_generated/server'
import {affiliateSchema} from './d'

export const create = mutation({
  args: {data: affiliateSchema},
  handler: async ({db}, {data}) => {
    // Check if email already exists
    if (data.email) {
      const existing = await db
        .query('affiliates')
        .withIndex('by_email', (q) => q.eq('email', data.email))
        .first()
      if (existing) {
        throw new Error('Email address already exists')
      }
    }
    return await db.insert('affiliates', data)
  },
})

export const update = mutation({
  args: {id: v.id('affiliates'), data: affiliateSchema},
  handler: async ({db}, {id, data}) => {
    const affiliate = await db.get(id)
    if (!affiliate) throw new Error('Affiliate not found')
    
    // Check if email already exists (but allow same email for the same affiliate)
    if (data.email && data.email !== affiliate.email) {
      const existing = await db
        .query('affiliates')
        .withIndex('by_email', (q) => q.eq('email', data.email))
        .first()
      if (existing) {
        throw new Error('Email address already exists')
      }
    }
    
    return await db.patch(affiliate._id, data)
  },
})

export const removeOne = mutation({
  args: {uid: v.string()},
  handler: async ({db}, {uid}) => {
    const affiliate = await db
      .query('affiliates')
      .withIndex('by_uid', (q) => q.eq('uid', uid))
      .unique()
    if (!affiliate) throw new Error('Affiliate not found')
    return await db.patch(affiliate._id, {active: false})
  },
})
