import {z} from 'zod'

export const QrCodeSchema = z.object({
  id: z.string().optional(),
  ident: z.string().optional(),
  url: z.string().url(),
  active: z.boolean(),
  createdBy: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
})
export type IQrCode = z.infer<typeof QrCodeSchema>

export const AffiliateSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  tags: z.array(z.string()),
  group: z.string(),
  level: z.number(),
  active: z.boolean(),
  createdById: z.string(),
  createdByName: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  rewardPoints: z.number(),
  referralCount: z.number(),
  badges: z.array(z.string()),
  qrCodes: z.array(QrCodeSchema).optional(),
})

export type IAffiliate = z.infer<typeof AffiliateSchema>

export const AffiliateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  tags: z.string().optional(),
  group: z.string().optional(),
  level: z.number().int().min(1, 'Minimum level is 1'),
})
export type AffiliateFormValues = z.infer<typeof AffiliateFormSchema>
