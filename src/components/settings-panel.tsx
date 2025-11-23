'use client'

import {Button} from '@/components/ui/button'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Sheet, SheetContent, SheetTitle} from '@/components/ui/sheet'
import {AffiliateCtx} from '@/ctx/affiliate'
import {useMobile} from '@/hooks/use-mobile'
import {Icon} from '@/lib/icons'
import {QrViewer} from '@/lib/qr-code/viewer'
import {cn} from '@/lib/utils'
import {motion} from 'motion/react'
import {
  type ComponentProps,
  createContext,
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
// import { MODELS as CHAT_MODELS, useChatSettings } from "@/ctx/chat/store";
// import { useVoiceSettings } from "@/ctx/voice/store";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useConversations } from "@/ctx/chat/conversations";

type Collapsible = 'none' | 'icon' | 'content'

interface SettingsPanelProviderProps extends ComponentProps<'div'> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type SettingsPanelContext = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  togglePanel: VoidFunction
  collapsible?: Collapsible
}

const SETTINGS_COOKIE_NAME = 'settings:state'
const SETTINGS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SETTINGS_WIDTH = '286px'
const SETTINGS_WIDTH_MOBILE = '18rem'
const SETTINGS_WIDTH_ICON = '0rem'
const SETTINGS_KEYBOARD_SHORTCUT = 'p'

const SettingsPanelContext = createContext<SettingsPanelContext | null>(null)

function useSettingsPanel() {
  const context = useContext(SettingsPanelContext)
  if (!context) {
    throw new Error(
      'useSettingsPanel must be used within a SettingsPanelProvider.',
    )
  }
  return context
}

const SettingsPanelProvider = ({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange: setOpenProp,
  style,
  className,
  ...props
}: SettingsPanelProviderProps) => {
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
      document.cookie = `${SETTINGS_COOKIE_NAME}=${openState}; path=/; max-age=${SETTINGS_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open],
  )

  const togglePanel = useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SETTINGS_KEYBOARD_SHORTCUT &&
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

  const contextValue = useMemo<SettingsPanelContext>(
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
    <SettingsPanelContext.Provider value={contextValue}>
      <div
        style={
          {
            '--settings-width': SETTINGS_WIDTH,
            '--settings-width-icon': SETTINGS_WIDTH_ICON,
            ...style,
          } as CSSProperties
        }
        className={cn('group/settings-wrapper flex w-full', className)}
        {...props}>
        {children}
      </div>
    </SettingsPanelContext.Provider>
  )
}
SettingsPanelProvider.displayName = 'SettingsPanelProvider'

interface SettingsPanelProps extends ComponentProps<'div'> {
  side?: 'left' | 'right'
}

const SettingsPanel = ({
  className,
  children,
  side = 'right',
  ...props
}: SettingsPanelProps) => {
  const {isMobile, openMobile, setOpenMobile, collapsible, state} =
    useSettingsPanel()

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
              '--settings-width': SETTINGS_WIDTH_MOBILE,
            } as CSSProperties
          }>
          <SheetTitle className='hidden'>Settings</SheetTitle>
          <div className='flex h-full w-full flex-col'>
            <SettingsPanelContent />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <ScrollArea className=''>
      <div
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-side={side}
        className={cn(
          'bg-sidebar group peer relative hidden md:block text-sidebar-foreground transition-[width] duration-200 ease-in-out',
          state === 'expanded' ? 'w-(--settings-width)' : 'w-0',
        )}>
        <div
          className={cn(
            'ml-4 relative h-svh bg-transparent transition-transform duration-400 ease-in-out',
            'w-(--settings-width) px-2 md:pr-4',
            state === 'collapsed' &&
              (side === 'right' ? 'translate-x-full' : '-translate-x-full'),
          )}>
          <SettingsPanelContent />
        </div>
      </div>
    </ScrollArea>
  )
}
SettingsPanel.displayName = 'SettingsPanel'

const QRCodeSection = () => {
  const affiliateCtx = useContext(AffiliateCtx)
  const qrCodeUrl = affiliateCtx?.qrCodeUrl

  // TEMPORARY: Static QR code for dimension tweaking
  // TODO: Remove this and use qrCodeUrl from context
  const staticQRCodeUrl =
    'https://scan-ts.vercel.app/?id=test-123&grp=test-group&seed=&iztp1nk=b-test-d'

  // Force re-render when QR code URL changes
  useEffect(() => {
    if (qrCodeUrl) {
      console.log('QR Code URL updated:', qrCodeUrl)
    }
  }, [qrCodeUrl])

  // Use static URL for now, fallback to context URL
  const displayUrl = staticQRCodeUrl || qrCodeUrl

  if (!displayUrl) {
    return null
  }

  return (
    <div
      key={displayUrl}
      className={cn(
        'py-5 relative',
        'before:absolute before:inset-x-0 before:top-0 before:h-[0.5px] before:bg-linear-to-r before:from-foreground/10 before:via-foreground/15 before:to-foreground/10',
      )}>
      <h3 className='text-xs font-medium uppercase text-muted-foreground/80 mb-4'>
        QR Code
      </h3>
      <div className='flex flex-col items-center gap-3'>
        {/* TEMPORARY: Adjust size and padding here for dimension tweaking */}
        <QrViewer url={displayUrl} className='w-full' size={230} padding={3} />
        <p className='text-xs text-muted-foreground text-center max-w-[200px]'>
          Scan this QR code to access the affiliate link
        </p>
      </div>
    </div>
  )
}

const SettingsPanelContent = () => {
  return (
    <>
      {/* Sidebar header */}
      <div
        className={cn('h-14 flex items-center justify-between relative')}
        style={
          {
            '--settings-width': SETTINGS_WIDTH,
            '--settings-width-icon': SETTINGS_WIDTH_ICON,
          } as CSSProperties
        }>
        <div className='flex items-center gap-4'>
          <h2 className='text-base font-medium tracking-tighter'>Settings</h2>
        </div>
      </div>

      {/* Sidebar content */}
      <motion.div className='-mt-px whitespace-nowrap'>
        {/* QR Code Viewer */}
        <QRCodeSection />
      </motion.div>
    </>
  )
}
SettingsPanelContent.displayName = 'SettingsPanelContent'

const SettingsPanelTrigger = () => {
  const {isMobile, state, togglePanel} = useSettingsPanel()

  const isExpanded = useMemo(() => state === 'expanded', [state])

  if (!isMobile) {
    return null
  }

  return (
    <Button
      size='sq'
      variant='ghost'
      data-sidebar='trigger'
      className={cn('text-foreground/80 hover:text-foreground')}
      onClick={togglePanel}>
      <Icon name='sidebar' className={cn('h-4', isExpanded && 'rotate-180')} />
      <span className='sr-only'>Toggle Sidebar</span>
    </Button>
  )
}
SettingsPanelTrigger.displayName = 'SettingsPanelTrigger'

export {
  SettingsPanel,
  SettingsPanelProvider,
  SettingsPanelTrigger,
  useSettingsPanel,
}
