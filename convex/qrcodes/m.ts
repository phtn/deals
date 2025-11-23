import {mutation} from '../_generated/server'
import {qrCodeSchema} from './d'

export const create = mutation({
  args: {data: qrCodeSchema},
  handler: async ({db}, {data}) => await db.insert('qrcodes', data),
})

