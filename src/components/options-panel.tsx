'use client'

import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {ScrollArea} from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Sheet, SheetContent, SheetTitle} from '@/components/ui/sheet'
import {SliderControl} from '@/components/ui/slider-control'
import {useMobile} from '@/hooks/use-mobile'
import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {motion} from 'motion/react'
import {
  type ComponentProps,
  createContext,
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'
import TextAnimate from './cult/text-animate'

type Collapsible = 'none' | 'icon' | 'content'

interface OptionsPanelProviderProps extends ComponentProps<'div'> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type OptionsPanelContext = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  togglePanel: VoidFunction
  collapsible?: Collapsible
}

const OPTIONS_COOKIE_NAME = 'settings:state'
const OPTIONS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const OPTIONS_WIDTH = '286px'
const OPTIONS_WIDTH_MOBILE = '18rem'
const OPTIONS_WIDTH_ICON = '0rem'
const OPTIONS_KEYBOARD_SHORTCUT = 'p'

const OptionsPanelContext = createContext<OptionsPanelContext | null>(null)

function useOptionsPanel() {
  const context = useContext(OptionsPanelContext)
  if (!context) {
    throw new Error(
      'useOptionsPanel must be used within a OptionsPanelProvider.',
    )
  }
  return context
}

const OptionsPanelProvider = ({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  style,
  className,
  ...props
}: OptionsPanelProviderProps) => {
  const isMobile = useMobile()
  const [openMobile, setOpenMobile] = useState(false)

  const [_open, _setOpen] = useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }
      document.cookie = `${OPTIONS_COOKIE_NAME}=${openState}; path=/; max-age=${OPTIONS_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open],
  )

  const togglePanel = useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === OPTIONS_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        togglePanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePanel])

  const state = open ? 'expanded' : 'collapsed'

  const contextValue = useMemo<OptionsPanelContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      togglePanel,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, togglePanel],
  )

  return (
    <OptionsPanelContext.Provider value={contextValue}>
      <div
        style={
          {
            '--settings-width': OPTIONS_WIDTH,
            '--settings-width-icon': OPTIONS_WIDTH_ICON,
            ...style,
          } as CSSProperties
        }
        className={cn('group/settings-wrapper flex w-full', className)}
        {...props}>
        {children}
      </div>
    </OptionsPanelContext.Provider>
  )
}
OptionsPanelProvider.displayName = 'OptionsPanelProvider'

interface OptionsPanelProps extends ComponentProps<'div'> {
  side?: 'left' | 'right'
}

const OptionsPanel = ({
  className,
  children,
  side = 'right',
  ...props
}: OptionsPanelProps) => {
  const {
    isMobile,
    openMobile,
    setOpenMobile,
    open,
    togglePanel,
    collapsible,
    state,
  } = useOptionsPanel()

  if (collapsible === 'none') {
    return (
      <div
        className={cn(
          'flex h-full w-(--settings-width) flex-col bg-fade text-sidebar-foreground',
          className,
        )}
        {...props}>
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          className={cn('w-72 px-4 py-0 bg-fade [&>button]:hidden', {})}
          style={
            {
              '--settings-width': OPTIONS_WIDTH_MOBILE,
            } as CSSProperties
          }>
          <SheetTitle className='hidden'>Settings</SheetTitle>
          <div className='flex h-full w-full flex-col'>
            <OptionsPanelContent />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <ScrollArea className=''>
      {!open && (
        <Button
          size='sm'
          variant='ghost'
          className='absolute rounded-full size-8 top-4 right-8 z-100 animate-enter'
          onClick={togglePanel}>
          <Icon name='chevron-right' className='size-4 rotate-180' />
        </Button>
      )}
      <div
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-side={side}
        className={cn(
          'bg-fade group peer hidden md:block text-sidebar-foreground transition-[width] duration-200 ease-in-out',
          state === 'expanded' ? 'w-(--settings-width)' : 'w-0',
        )}>
        <div
          className={cn(
            'relative h-svh bg-transparent transition-transform duration-400 ease-in-out',
            'w-(--settings-width) px-2 md:pr-4',
            state === 'collapsed' &&
              (side === 'right' ? 'translate-x-full' : '-translate-x-full'),
          )}>
          <OptionsPanelContent />
        </div>
      </div>
    </ScrollArea>
  )
}
OptionsPanel.displayName = 'OptionsPanel'

const OptionsPanelContent = () => {
  const id = useId()
  const {togglePanel} = useOptionsPanel()

  return (
    <>
      {/* Sidebar header */}
      <div
        className={cn(
          'h-16 flex items-center justify-between relative',
          'before:absolute before:inset-x-0 before:top-0 before:h-[0.5px] before:bg-gradient-to-r before:from-foreground/5 before:via-foreground/10 before:to-foreground/15',
        )}
        style={
          {
            '--settings-width': OPTIONS_WIDTH,
            '--settings-width-icon': OPTIONS_WIDTH_ICON,
          } as CSSProperties
        }>
        <div className='flex items-center gap-4'>
          <h2 className='text-base font-medium tracking-tighter'>
            Preferences
          </h2>
          <Icon name='arrow-right' className='size-5' />
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='rounded-full'
            onClick={togglePanel}>
            <Icon name='chevron-right' aria-hidden='true' />
          </Button>
        </div>
      </div>

      {/* Sidebar content */}
      <motion.div className='-mt-px whitespace-nowrap'>
        {/* Conversations list */}
        <div
          className={cn(
            'py-5 relative transition-all duration-300 ease-in-out',
            'before:absolute before:inset-x-0 before:top-0 before:h-[0.5px] before:bg-gradient-to-r before:from-foreground/10 before:via-foreground/15 before:to-foreground/10',
          )}>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-xs font-medium uppercase text-muted-foreground/80'>
              Conversations
            </h3>
            <Button size='sm' variant='ghost'>
              New
            </Button>
          </div>

          <div className='space-y-1 w-80 block'></div>
        </div>

        {/* Assistant settings */}
        <div
          className={cn(
            'py-5 relative transition-all duration-300 ease-in-out',
            'before:absolute before:inset-x-0 before:top-0 before:h-[0.5px] before:bg-gradient-to-r before:from-foreground/10 before:via-foreground/15 before:to-foreground/10',
          )}>
          <h3 className='text-xs font-medium uppercase text-muted-foreground/80 mb-2'>
            Assistant
          </h3>
          <div className='space-y-3'>
            {/* Model */}
            <div className='flex h-12 items-center justify-between gap-2'>
              <TextAnimate
                role='label'
                id={`${id}-model`}
                className='font-normal'>
                Model
              </TextAnimate>
              <Select value={'Cheska'} onValueChange={() => console.log('')}>
                <SelectTrigger
                  id={`${id}-model`}
                  className='bg-muted w-auto max-w-full h-8 py-1 px-2 gap-1 [&_svg]:-me-1 border-none'>
                  <SelectValue placeholder='Select model' />
                </SelectTrigger>
                <SelectContent
                  className='[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2'
                  align='end'>
                  {['Cheska', 'Merin'].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Web search */}
            <div className='flex h-12 items-center justify-between gap-2'>
              <TextAnimate
                type='whipIn'
                id={`${id}-web-search`}
                className='font-normal'>
                Web search
              </TextAnimate>
              <div className='flex items-center gap-2'>
                <Checkbox id={`${id}-web-search`} checked={true} />
              </div>
            </div>

            {/* Speech */}
            <div className='flex h-12 items-center justify-between gap-2'>
              <TextAnimate id={`${id}-speech`} className='font-normal'>
                Speech
              </TextAnimate>
              <div className='flex items-center gap-2'>
                <Checkbox id={`${id}-speech`} checked={true} />
              </div>
            </div>

            {/* Voice */}
            <div className='flex h-12 items-center justify-between gap-2'>
              <TextAnimate id={`${id}-voice`} className='font-normal'>
                Voice
              </TextAnimate>
              <Select value={'Merin'} onValueChange={() => console.log('')}>
                <SelectTrigger
                  id={`${id}-voice`}
                  className='bg-muted w-auto max-w-full h-8 py-1 px-2 gap-1 [&_svg]:-me-1 border-none'>
                  <SelectValue placeholder='Select voice' />
                </SelectTrigger>
                <SelectContent
                  className='[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2'
                  align='end'>
                  <SelectItem value='ellie'>Ellie</SelectItem>
                  <SelectItem value='sakura'>Sakura</SelectItem>
                  <SelectItem value='moody'>Moody</SelectItem>
                  <SelectItem value='kendall'>Kendall</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Configurations (placeholders for future use) */}
        <div
          className={cn(
            'py-5 relative',
            'before:absolute before:inset-x-0 before:top-0 before:h-[0.5px] before:bg-gradient-to-r before:from-foreground/10 before:via-foreground/15 before:to-foreground/10',
          )}>
          <h3 className='text-xs font-medium uppercase text-muted-foreground/80 mb-4'>
            Configurations
          </h3>
          <div className='space-y-3'>
            <SliderControl
              minValue={0}
              maxValue={2}
              initialValue={[1.25]}
              defaultValue={[1]}
              step={0.01}
              label='Temperature'
            />
            <SliderControl
              className='[&_input]:w-14'
              minValue={1}
              maxValue={16383}
              initialValue={[2048]}
              defaultValue={[2048]}
              step={1}
              label='Maximum length'
            />
            <SliderControl
              minValue={0}
              maxValue={1}
              initialValue={[0.5]}
              defaultValue={[0]}
              step={0.01}
              label='Top P'
            />
          </div>
        </div>
      </motion.div>
    </>
  )
}
OptionsPanelContent.displayName = 'OptionsPanelContent'

const OptionsPanelTrigger = () => {
  const {isMobile} = useOptionsPanel()

  if (!isMobile) {
    return null
  }

  return (
    <Button variant='ghost' className='gap-x-0'>
      <Icon
        name='chevron-right'
        className='text-muted-foreground rotate-180 sm:text-muted-foreground/70 size-5'
        aria-hidden='true'
      />
      <span className='max-sm:sr-only tracking-tighter'>Settings</span>
    </Button>
  )
}
OptionsPanelTrigger.displayName = 'OptionsPanelTrigger'

export {
  OptionsPanel,
  OptionsPanelProvider,
  OptionsPanelTrigger,
  useOptionsPanel,
}
