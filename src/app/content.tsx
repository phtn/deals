'use client'

import TextAnimate from '@/components/cult/text-animate'
import {GuidingLight} from '@/components/stage/guiding-light'
import {Button, ButtonProps} from '@/components/ui/button'
import {useAuthCtx} from '@/ctx/auth'
import {useSequence} from '@/hooks/use-sequence'
import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {LiquidMetal} from '@paper-design/shaders-react'
import {AnimatePresence, motion, Transition, Variant} from 'motion/react'
import Link from 'next/link'
import {ReactNode} from 'react'

export const Content = () => {
  // const router = useRouter();
  // const [state, setState] = useState<string>("Initializing ...");

  const {sequence, currentStep, isCorrect, handleClick, message} = useSequence()

  // useEffect(() => {
  //   let serverTimer: NodeJS.Timeout | undefined;
  //   let appTimer: NodeJS.Timeout | undefined;
  //   if (typeof window !== "undefined") {
  //     onSuccess("re-up secure server online.");

  //     serverTimer = setTimeout(() => {
  //       setState("Redirecting ...");
  //     }, 8000);
  //     appTimer = setTimeout(() => {
  //       // router.push("/alpha");
  //     }, 5000);
  //   }

  //   return () => {
  //     clearTimeout(serverTimer);
  //     clearTimeout(appTimer);
  //   };
  // }, [router]);
  //
  const transition: Transition = {
    duration: 0.8,
    delay: 0.5,
    ease: [0, 0.71, 0.2, 1.01],
  }

  const initial: Variant = {
    opacity: 0,
    scale: 0.5,
    x: 0,
    y: 0,
  }

  const {signInWithGoogle, loading} = useAuthCtx()

  return (
    <div className='flex items-start justify-center'>
      <GuidingLight />
      <AnimatePresence mode='wait'>
        <motion.div
          key='main'
          initial={{opacity: 0, scale: 0}}
          animate={{opacity: 1, scale: 1}}
          transition={transition}
          className='absolute flex items-center w-screen h-[40rem] md:size-[50rem] justify-center'>
          <div className='space-y-10 shadow-lg bg-gradient-to-br from-neutral-50/60 via-neutral-50 to-neutral-50/40 dark:from-neutral-400 dark:via-neutral-300 dark:to-neutral-200 backdrop-blur-lg size-[28rem] rounded-[4.5rem] flex flex-col items-center justify-center'>
            <div className='h-12 border-b border-neutral-300 w-full flex items-center justify-between px-8'>
              <div className='flex items-center space-x-4'>
                <TextAnimate
                  delay={0.8}
                  type='whipInUp'
                  className='h-12 font-semibold font-figtree tracking-tighter text-2xl dark:text-white'>
                  BestDeal
                </TextAnimate>
                <span className='font-light tracking-wider h-10 uppercase dark:text-neutral-700'></span>
              </div>
              <span className='text-sm tracking-tight h-9 text-emerald-500 dark:text-emerald-800'>
                {message === 'OK' && (
                  <Icon name='checkmark-circle' className='size-5' />
                )}
              </span>
            </div>

            <div className='relative space-y-16 md:space-y-8 w-60 h-56'>
              <AnimatePresence>
                {isCorrect && (
                  <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 1.2}}
                    className='w-full flex items-center justify-center h-64'>
                    <div className='h-40 flex flex-col items-center'>
                      <Button
                        size='lg'
                        variant='dark'
                        onClick={signInWithGoogle}
                        rightIcon={loading ? 'spinners-ring' : 'google'}>
                        <span className='px-5'>Sign in with Google</span>
                      </Button>
                      <div className='h-20 flex items-center justify-center w-full whitespace-nowrap space-x-2 px-2'>
                        <Icon
                          name='lock'
                          className='size-3 opacity-60 dark:opacity-100 dark:text-neutral-600'
                        />
                        <span className='font-mono text-xs opacity-60 dark:opacity-100 dark:text-neutral-700'>
                          Last login: {new Date().toLocaleString()}
                        </span>
                      </div>

                      <div className='w-full flex items-center justify-end h-10'>
                        <Link
                          target='_blank'
                          rel='noopener noreferrer'
                          href='https://github.com/phtn/deals.git'
                          className='flex items-center p-1.5 rounded-md bg-neutral-400/20 hover:bg-neutral-400/30 hover:underline underline-offset-4 decoration-dashed space-x-2 font-mono text-xs dark:text-neutral-600'>
                          <Icon name='github' className='size-3.5' />
                          <span>v1.6</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className='flex items-center justify-between'>
                <AnimatePresence>
                  {sequence.slice(0, 2).map(
                    (target, index) =>
                      !isCorrect && (
                        <motion.div
                          initial={initial}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            x: -50,
                            y: index === 0 ? -50 : 50,
                          }}
                          transition={{duration: 0.6, delay: target * 0.2}}
                          exit={{
                            opacity: 0,
                            scale: 0,
                            x: 30,
                            animationDuration: 0.6,
                          }}
                          key={target}
                          className={cn(
                            'absolute top-1/4 left-1/4 flex items-center justify-center rounded-full border border-neutral-600 overflow-visible bg-orange-200/20 backdrop-blur-2xl size-25 aspect-square',
                            {
                              'bg-emerald-400':
                                target === currentStep - 1 ||
                                target < currentStep ||
                                message === 'OK',
                            },
                          )}>
                          <SilverButton
                            key={+target}
                            onClick={handleClick(target)}
                            speed={1 / target}>
                            {target}
                          </SilverButton>
                        </motion.div>
                      ),
                  )}
                </AnimatePresence>
              </div>
              <div className='flex items-center justify-between'>
                <AnimatePresence>
                  {sequence.slice(2, 4).map(
                    (target, index) =>
                      !isCorrect && (
                        <motion.div
                          initial={initial}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            x: 50,
                            y: index === 0 ? -50 : 50,
                          }}
                          transition={{duration: 0.6, delay: target * 0.2}}
                          exit={{
                            scale: 0,
                            opacity: 0,
                            x: -20,
                            animationDuration: 0.6,
                          }}
                          key={target}
                          className={cn(
                            'absolute top-1/4 left-1/4 flex items-center justify-center rounded-full border border-neutral-400/80 overflow-visible bg-orange-200/20 backdrop-blur-2xl size-25 aspect-square',
                            {
                              'bg-emerald-400':
                                target === currentStep - 1 ||
                                target < currentStep ||
                                message === 'OK',
                            },
                          )}>
                          <SilverButton
                            key={target}
                            onClick={handleClick(target)}
                            speed={1 / target}>
                            {target}
                          </SilverButton>
                        </motion.div>
                      ),
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface SilverButtonProps extends ButtonProps {
  speed?: number
}

const SilverButton = ({
  id,
  speed = 1,
  children,
  onClick,
}: SilverButtonProps) => {
  return (
    <Button
      id={`${id}`}
      size='sq'
      onClick={onClick}
      variant='ghost'
      className='rounded-full overflow-visible size-24 aspect-square border-none'>
      <div className='size-22 bg-neutral-900 rounded-full'>
        <LiquidMetal
          speed={speed}
          colorBack='rgba(100, 100, 100, 0)'
          colorTint='#BBBBBB'
          softness={0.6}
          repetition={1}
          shiftRed={0.1}
          shiftBlue={0.1}
          distortion={0.01}
          contour={1}
          scale={1}
          rotation={0}
          shape='circle'
          frame={69000}
          style={{
            backgroundColor: 'transparent',
            height: '64px',
            width: '64px',
          }}
        />
      </div>

      <span className='text-4xl text-white drop-shadow-xs drop-shadow-neutral-950 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
        {children as ReactNode}
      </span>
    </Button>
  )
}
