import {v} from 'convex/values'
import {mutation} from '../_generated/server'
import {affiliateSchema} from './d'

export const create = mutation({
  args: {data: affiliateSchema},
  handler: async ({db}, {data}) => await db.insert('affiliates', data),
})

export const update = mutation({
  args: {id: v.id('affiliates'), data: affiliateSchema},
  handler: async ({db}, {id, data}) => {
    const affiliate = await db.get(id)
    if (!affiliate) throw new Error('Affiliate not found')
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
