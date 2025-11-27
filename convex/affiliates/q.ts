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

export const getMetrics = query({
  handler: async ({db}) => {
    const affiliates = await db.query('affiliates').collect()
    
    const total = affiliates.length
    const active = affiliates.filter((a) => a.active === true).length
    const totalRewardPoints = affiliates.reduce(
      (sum, a) => sum + (a.rewardPoints ?? 0),
      0,
    )
    const totalReferrals = affiliates.reduce(
      (sum, a) => sum + (a.referralCount ?? 0),
      0,
    )
    const averageLevel =
      affiliates.length > 0
        ? affiliates.reduce((sum, a) => sum + (a.level ?? 0), 0) /
          affiliates.length
        : 0
    
    // Calculate recent activity (affiliates created in last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recent = affiliates.filter(
      (a) => (a.createdAt ?? 0) >= thirtyDaysAgo,
    ).length
    
    return {
      total,
      active,
      inactive: total - active,
      totalRewardPoints,
      totalReferrals,
      averageLevel: Math.round(averageLevel * 10) / 10,
      recent,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    }
  },
})
