import {useCallback, useRef, useState} from 'react'
import {useSFX} from './use-sfx'

interface UseSequenceReturn {
  sequence: number[]
  currentStep: number
  message: string
  handleClick: (num: number) => VoidFunction
  isCorrect: boolean
}

const generateShuffledSequence = (): number[] => {
  const numbers: number[] = [1, 2, 3, 4]
  return [...numbers].sort(() => Math.random() - 0.5)
}

export const useSequence = (): UseSequenceReturn => {
  const [sequence, setSequence] = useState<number[]>(() => generateShuffledSequence())
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [message, setMessage] = useState<string>('Sequence Challenge')
  const [isCorrect, setIsCorrect] = useState<boolean>(false)

  // Use refs to always have access to current values inside callbacks
  const currentStepRef = useRef<number>(currentStep)
  const isResettingRef = useRef<boolean>(false)

  // Keep ref in sync with state
  currentStepRef.current = currentStep

  const {sfxDarbuka: darbuka} = useSFX({interrupt: true})

  const generateSequence = useCallback((): void => {
    setSequence(generateShuffledSequence())
    setCurrentStep(1)
    currentStepRef.current = 1
    setIsCorrect(false)
    setMessage('Sequence Challenge')
    isResettingRef.current = false
  }, [])

  const handleClick = useCallback(
    (num: number) => () => {
      // Prevent clicks during reset
      if (isResettingRef.current) return

      darbuka({playbackRate: num})

      const step = currentStepRef.current

      if (num === step) {
        if (step === 4) {
          setMessage('OK')
          setIsCorrect(true)
        } else {
          const nextStep = step + 1
          currentStepRef.current = nextStep
          setCurrentStep(nextStep)
          setMessage(`Next: ${nextStep}`)
        }
      } else {
        // Prevent multiple resets from queuing
        if (isResettingRef.current) return
        isResettingRef.current = true

        setMessage('Reloading ...')
        darbuka({playbackRate: 1.75})
        setTimeout(() => {
          generateSequence()
        }, 500)
      }
    },
    [darbuka, generateSequence],
  )

  return {
    message,
    sequence,
    isCorrect,
    currentStep,
    handleClick,
  }
}
