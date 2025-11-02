import {Prism} from '@/components/bits/prism'
export const GuidingLight = () => {
  return (
    <div className='absolute pointer-events-none opacity-20 bottom-0 size-full overflow-hidden'>
      <Prism
        animationType='3drotate'
        timeScale={0.15}
        height={12.0}
        baseWidth={2}
        scale={2.48}
        hueShift={0.02}
        colorFrequency={0.07}
        noise={0.05}
        glow={1}
      />

      <div className='top-0 left-0 size-full absolute bg-background/0 backdrop-blur-xl' />
    </div>
  )
}
