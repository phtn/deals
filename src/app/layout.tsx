import {ProvidersCtxProvider} from '@/ctx/providers'
import type {Metadata} from 'next'
import {
  Bakbak_One as BakbakOne,
  Figtree,
  Geist,
  Geist_Mono as GeistMono,
  Major_Mono_Display as MajorMonoDisplay,
  Space_Grotesk as SpaceGrotesk,
} from 'next/font/google'
import {type ReactNode} from 'react'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const space = SpaceGrotesk({
  variable: '--font-space',
  subsets: ['latin'],
})

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
})

const major = MajorMonoDisplay({
  variable: '--font-major',
  weight: ['400'],
  subsets: ['latin'],
})

const bone = BakbakOne({
  variable: '--font-bone',
  weight: ['400'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'BestDeal Admin',
  description: 'Made by re-up.ph',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${space.variable} ${figtree.variable} ${geistSans.variable} ${geistMono.variable} ${major.variable} ${bone.variable} antialiased`}>
        <ProvidersCtxProvider>{children}</ProvidersCtxProvider>
      </body>
    </html>
  )
}
