import { useCallback, useEffect, useState } from "react";
import { useSFX } from "./use-sfx";

interface UseSequenceReturn {
  sequence: number[];
  currentStep: number;
  message: string;
  handleClick: (num: number) => VoidFunction;
  isCorrect: boolean;
}

export const useSequence = (): UseSequenceReturn => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [message, setMessage] = useState<string>("Sequential Order Challenge");
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const { sfxDarbuka: darbuka } = useSFX({ interrupt: true });

  const generateSequence = (): void => {
    const numbers: number[] = [1, 2, 3, 4];
    const shuffled: number[] = numbers.sort(() => Math.random() - 0.5);
    setSequence(shuffled);
    setCurrentStep(1);
    setIsCorrect(false);
    setMessage("Sequence Challenge");
  };

  useEffect(() => {
    generateSequence();
  }, []);

  const handleClick = useCallback(
    (num: number) => () => {
      darbuka({ playbackRate: num });
      if (num === currentStep) {
        if (currentStep === 4) {
          setMessage("OK");
          setIsCorrect(true);
        } else {
          setCurrentStep(currentStep + 1);
          setMessage(`Next: ${currentStep + 1}`);
        }
      } else {
        setMessage("Reloading ...");
        darbuka({ playbackRate: 1.75 });
        setTimeout(() => {
          generateSequence();
        }, 500);
      }
    },
    [currentStep, darbuka],
  );

  return {
    message,
    sequence,
    isCorrect,
    currentStep,
    handleClick,
  };
};
