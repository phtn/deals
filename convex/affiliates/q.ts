import {v} from 'convex/values'
import {query} from '../_generated/server'

export const getAll = query({
  handler: async ({db}) => await db.query('affiliates').collect(),
})

export const getByUID = query({
  args: {
    uid: v.string(),
  },
  handler: async ({db}, {uid}) =>
    await db
      .query('affiliates')
      .withIndex('by_uid', (q) => q.eq('uid', uid))
      .unique(),
})

export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async ({db}, {email}) =>
    await db
      .query('affiliates')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique(),
})
