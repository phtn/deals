import {useCallback, useState} from 'react'
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

  const {sfxDarbuka: darbuka} = useSFX({interrupt: true})

  const generateSequence = (): void => {
    setSequence(generateShuffledSequence())
    setCurrentStep(1)
    setIsCorrect(false)
    setMessage('Sequence Challenge')
  }

  const handleClick = useCallback(
    (num: number) => () => {
      darbuka({playbackRate: num})
      if (num === currentStep) {
        if (currentStep === 4) {
          setMessage('OK')
          setIsCorrect(true)
        } else {
          setCurrentStep(currentStep + 1)
          setMessage(`Next: ${currentStep + 1}`)
        }
      } else {
        setMessage('Reloading ...')
        darbuka({playbackRate: 1.75})
        setTimeout(() => {
          generateSequence()
        }, 500)
      }
    },
    [currentStep, darbuka],
  )

  return {
    message,
    sequence,
    isCorrect,
    currentStep,
    handleClick,
  }
}
