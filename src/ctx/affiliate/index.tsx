'use client'

import {useMutation} from 'convex/react'
import type {Id} from '../../../convex/_generated/dataModel'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import toast from 'react-hot-toast'
import {uuidv7} from 'uuidv7'
import {api} from '../../../convex/_generated/api'
import {useAuthCtx} from '../auth'
import {
  AffiliateFormSchema,
  type AffiliateFormValues,
  IAffiliate,
  IQrCode,
} from './schema'

type AffiliateConfigKey = 'activated' | 'generateQR'

export interface AffiliateConfig {
  id: AffiliateConfigKey
  label: string
  description: string
  value: boolean
  onCheckedChange: (checked: boolean) => void
}
interface AffiliateCtxValues {
  affiliateConfigState: Record<AffiliateConfigKey, boolean>
  affiliateConfigs: AffiliateConfig[]
  createAffiliate: (values: AffiliateFormValues) => Promise<boolean>
  qrCodeUrl: string | null
  affiliates: IAffiliate[]
  loading: boolean
  getQRCodes: (affiliate: IAffiliate) => void
  qrCodeList: IQrCode[] | undefined
}

export const AffiliateCtx = createContext<AffiliateCtxValues | null>(null)

export const AffiliateCtxProvider = ({children}: {children: ReactNode}) => {
  const {user} = useAuthCtx()
  const [loading, setLoading] = useState(false)
  const [affiliateConfigState, setAffiliateConfigState] = useState<
    Record<AffiliateConfigKey, boolean>
  >({
    activated: true,
    generateQR: true,
  })

  const [affiliates, setAffiliates] = useState<IAffiliate[]>([])

  const onAffiliateConfigChange = useCallback(
    (key: AffiliateConfigKey, checked: boolean) => {
      setAffiliateConfigState((prev) => ({
        ...prev,
        [key]: checked,
      }))
    },
    [],
  )

  const affiliateConfigs = useMemo(
    () =>
      [
        {
          id: 'activated' as const,
          label: 'Activate Account',
          description: 'Toggle to activate affiliate account on create',
          value: affiliateConfigState.activated,
          onCheckedChange: (checked: boolean) =>
            onAffiliateConfigChange('activated', Boolean(checked)),
        },
        {
          id: 'generateQR' as const,
          label: 'Generate QR',
          description: 'Automatically generate a QR code after creation',
          value: affiliateConfigState.generateQR,
          onCheckedChange: (checked: boolean) =>
            onAffiliateConfigChange('generateQR', Boolean(checked)),
        },
      ] satisfies AffiliateConfig[],
    [affiliateConfigState, onAffiliateConfigChange],
  )

  const [qrCodeUrl, setQRCodeUrl] = useState<string | null>(null)
  const [qrCodeList, setQRCodes] = useState<IQrCode[]>()

  const getQRCodes = useCallback(({qrCodes}: IAffiliate) => {
    setQRCodes(qrCodes)
    setQRCodeUrl(qrCodes?.[0]?.url ?? null)
  }, [])

  const createAffiliateMutation = useMutation(api.affiliates.m.create)
  const createQRCodeMutation = useMutation(api.qrcodes.m.create)

  const createAffiliate = useCallback(
    async (values: AffiliateFormValues) => {
      if (!user) {
        toast.error('You must be signed in to create an affiliate.')
        return false
      }

      setLoading(true)
      setQRCodeUrl(null)
      setQRCodes(undefined)

      const validation = runValidation(values)

      if (!validation.success) {
        const firstIssue = validation.error.issues[0]
        toast.error(firstIssue?.message ?? 'Please review the form fields.')
        setLoading(false)
        return false
      }

      const data = validation.data
      const timestamp = Date.now()
      const affiliateUid = uuidv7()
      const tags =
        data.tags
          ?.split(',')
          .map((tag) => tag.trim())
          .filter(Boolean) ?? []

      const qrCodeIds: Id<'qrcodes'>[] = []
      let generatedQRCode: IQrCode | undefined

      if (affiliateConfigState.generateQR) {
        try {
          const qr = await generateQR(affiliateUid, data.group ?? undefined)
          if (qr?.qrUrl && qr.ident) {
            const qrCodeData = {
              active: true,
              url: qr.qrUrl,
              uid: affiliateUid,
              grp: data.group ?? 'no-group',
              seed: '',
              ident: qr.ident,
              createdBy: user.uid,
              createdAt: timestamp,
              updatedAt: timestamp,
            }
            const qrCodeId = await createQRCodeMutation({data: qrCodeData})
            qrCodeIds.push(qrCodeId)

            generatedQRCode = {
              id: qr.id ?? undefined,
              ident: qr.ident,
              url: qr.qrUrl,
              active: true,
              createdBy: user.uid,
              createdAt: timestamp,
              updatedAt: timestamp,
            }
            setQRCodeUrl(qr.qrUrl)
            setQRCodes([generatedQRCode])
          }
        } catch (error) {
          console.error('QR generation failed', error)
          toast.error('Failed to generate QR. You can try again later.')
        }
      }

      const affiliateToPersist = {
        uid: affiliateUid,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        tags,
        group: data.group?.trim() || 'general',
        level: data.level,
        active: affiliateConfigState.activated,
        createdById: user.uid,
        createdByName: user.displayName ?? user.email ?? 'Unknown user',
        createdAt: timestamp,
        updatedAt: timestamp,
        rewardPoints: 0,
        referralCount: 0,
        badges: [] as string[],
        qrCodes: qrCodeIds,
      }

      let isSuccess = false

      try {
        const promise = createAffiliateMutation({
          data: affiliateToPersist,
        })

        await toast.promise(promise, {
          loading: 'Creating affiliate...',
          success: 'Affiliate created successfully.',
          error: (err: Error) => err.message || 'Failed to create the affiliate.',
        })

        setAffiliates((prev) => [
          ...prev,
          {
            ...affiliateToPersist,
            qrCodes: generatedQRCode ? [generatedQRCode] : [],
          } satisfies IAffiliate,
        ])
        isSuccess = true
      } catch (error) {
        console.error('Affiliate creation failed', error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create the affiliate.'
        toast.error(errorMessage)
        isSuccess = false
      } finally {
        setLoading(false)
      }
      return isSuccess
    },
    [
      affiliateConfigState.activated,
      affiliateConfigState.generateQR,
      createAffiliateMutation,
      createQRCodeMutation,
      user,
    ],
  )

  const value = useMemo(
    () => ({
      affiliateConfigState,
      affiliateConfigs,
      createAffiliate,
      qrCodeUrl,
      affiliates,
      getQRCodes,
      qrCodeList,
      loading,
    }),
    [
      affiliateConfigState,
      affiliateConfigs,
      createAffiliate,
      qrCodeUrl,
      affiliates,
      getQRCodes,
      qrCodeList,
      loading,
    ],
  )

  return <AffiliateCtx.Provider value={value}>{children}</AffiliateCtx.Provider>
}

const runValidation = (values: AffiliateFormValues) =>
  AffiliateFormSchema.safeParse(values)

export const generateQR = async (id: string, grp?: string, seed?: string) => {
  const ident = 'b-' + uuidv7() + '-d'

  const host =
    process.env.NODE_ENV === 'development'
      ? 'https://localhost:3000'
      : 'https://scan-ts.vercel.app'
  const qrUrl = `${host}/?id=${encodeURIComponent(id)}&grp=${encodeURIComponent(grp ?? 'no-group')}&seed=${encodeURIComponent(seed ?? '')}&iztp1nk=${encodeURIComponent(ident)}`

  return {
    error: null,
    qrUrl,
    ident,
    id,
  }
}

export const useAffiliateCtx = () => {
  const ctx = useContext(AffiliateCtx)
  if (!ctx) {
    throw new Error('AffiliateCtxProvider is missing')
  }
  return ctx
}
