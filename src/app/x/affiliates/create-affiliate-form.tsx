'use client'

import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {ModernInput} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {useAffiliateCtx} from '@/ctx/affiliate'
import type {AffiliateFormValues} from '@/ctx/affiliate/schema'
import {useForm} from '@tanstack/react-form'
import {useCallback} from 'react'

const defaultValues: AffiliateFormValues = {
  name: '',
  email: '',
  phone: '',
  tags: '',
  group: '',
  level: 1,
}

export const CreateAffiliateForm = () => {
  const {createAffiliate, affiliateConfigs, loading, qrCodeUrl} =
    useAffiliateCtx()

  const form = useForm({
    defaultValues,
    onSubmit: async ({value, formApi}) => {
      const success = await createAffiliate({
        ...value,
        level: Number.isNaN(value.level) ? 1 : value.level,
      })

      if (success) {
        formApi.reset()
      }
    },
  })

  const renderFieldMessage = useCallback((message?: string) => {
    if (!message) return null
    return <p className='text-sm text-destructive mt-1'>{message}</p>
  }, [])

  return (
    <div className='grid gap-6 rounded-lg border border-ash bg-ash/40 dark:bg-background/40 dark:backdrop-blur-2xl dark:border-terminal/80 p-4 md:p-8 shadow-xs h-[96lvh] md:h-full overflow-y-scroll'>
      <div>
        <h2 className='text-xl font-semibold tracking-tight'>
          Create Affiliate
        </h2>
        <p className='text-sm text-muted-foreground'>
          Capture affiliate basics and optionally auto-generate a QR code.
        </p>
      </div>

      <form
        className='grid gap-8'
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}>
        <div className=' h-full grid grid-cols-1 gap-4 md:gap-8 md:grid-cols-2'>
          <form.Field
            name='name'
            validators={{
              onChange: ({value}) =>
                value.trim().length > 0 ? undefined : 'Name is required',
            }}>
            {(field) => (
              <div className='grid gap-2'>
                <Label htmlFor={field.name}>Full name</Label>
                <ModernInput
                  id={field.name}
                  placeholder='Diane Dee'
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
                {renderFieldMessage(field.state.meta.errors?.[0])}
              </div>
            )}
          </form.Field>

          <form.Field
            name='email'
            validators={{
              onChange: ({value}) =>
                /\S+@\S+\.\S+/.test(value) ? undefined : 'Valid email required',
            }}>
            {(field) => (
              <div className='grid gap-2'>
                <Label htmlFor={field.name}>Email</Label>
                <ModernInput
                  id={field.name}
                  type='email'
                  placeholder='diane@deals.com'
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
                {renderFieldMessage(field.state.meta.errors?.[0])}
              </div>
            )}
          </form.Field>

          <form.Field
            name='phone'
            validators={{
              onChange: ({value}) =>
                value.trim().length > 0 ? undefined : 'Phone number required',
            }}>
            {(field) => (
              <div className='grid gap-2'>
                <Label htmlFor={field.name}>Phone</Label>
                <ModernInput
                  id={field.name}
                  placeholder='+63 966 143 4469'
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
                {renderFieldMessage(field.state.meta.errors?.[0])}
              </div>
            )}
          </form.Field>

          <form.Field name='group'>
            {(field) => (
              <div className='grid gap-2'>
                <Label htmlFor={field.name}>Group</Label>
                <ModernInput
                  id={field.name}
                  placeholder='Marketing, Sales, Operations'
                  value={field.state.value ?? ''}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className='grid grid-cols-1 gap-4 md:gap-8 md:grid-cols-2'>
          <form.Field name='tags'>
            {(field) => (
              <div className='grid gap-2'>
                <Label htmlFor={field.name}>Tags</Label>
                <ModernInput
                  id={field.name}
                  placeholder='partner, admin, developer'
                  value={field.state.value ?? ''}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
                <p className='text-xs text-muted-foreground px-2'>
                  Separate tags with commas.
                </p>
              </div>
            )}
          </form.Field>

          <form.Field
            name='level'
            validators={{
              onChange: ({value}) =>
                Number.isInteger(value) && value >= 1
                  ? undefined
                  : 'Level must be at least 1',
            }}>
            {(field) => (
              <div className='grid gap-2'>
                <Label htmlFor={field.name}>Level</Label>
                <ModernInput
                  id={field.name}
                  type='number'
                  min={1}
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(Number(event.target.value))
                  }
                  onBlur={field.handleBlur}
                />
                <p className='text-xs text-muted-foreground px-2'>
                  1 - Viewer <Dot /> 2 - Editor <Dot /> 3 - Moderator <Dot /> 4
                  - Admin <Dot /> 5 - Godlike
                </p>
                {renderFieldMessage(field.state.meta.errors?.[0])}
              </div>
            )}
          </form.Field>
        </div>

        <div className='grid gap-3 rounded-xl bg-background/80 border border-dashed border-origin dark:border-zinc-700 p-4 md:grid-cols-2'>
          {affiliateConfigs.map((config) => (
            <label
              key={config.id}
              htmlFor={config.id}
              className='flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-3 transition hover:border-primary/40 hover:bg-primary/5'>
              <Checkbox
                id={config.id}
                checked={config.value}
                onCheckedChange={(checked) =>
                  config.onCheckedChange(Boolean(checked))
                }
              />
              <span className='flex flex-col gap-1'>
                <span className='text-sm font-medium leading-none'>
                  {config.label}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {config.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className='flex items-center justify-end gap-3'>
          <Button
            variant='default'
            disabled={loading}
            className='min-w-36'
            onClick={() => void form.handleSubmit()}>
            {loading ? 'Creating...' : 'Create Affiliate'}
          </Button>
        </div>
      </form>

      {qrCodeUrl ? (
        <div className='rounded-lg border border-zinc-200/50 bg-zinc-50 p-4 dark:border-zinc-700/70 dark:bg-zinc-900/50'>
          <p className='text-sm font-medium'>Generated QR code</p>
          <p className='text-xs text-muted-foreground'>
            Share this link or open it in a new tab to view the generated QR
            code.
          </p>
          <a
            href={qrCodeUrl}
            target='_blank'
            rel='noreferrer'
            className='mt-2 inline-flex text-sm text-primary underline-offset-4 hover:underline'>
            Open QR code
          </a>
        </div>
      ) : null}
    </div>
  )
}

const Dot = () => {
  return <span className='px-1'>&middot;</span>
}
