"use client";

import useSound from "use-sound";

export type HookOptions<T = unknown> = T & {
  id?: string;
  volume?: number;
  playbackRate?: number;
  interrupt?: boolean;
  soundEnabled?: boolean;
  sprite?: number[];
  onload?: VoidFunction;
};
/**
 * @name useSFX
 * @returns PlayFunction
 *
 * @example
 * ```typescript
 * // declare hook
 * const {switchOn, switchOff, toggle} = useSFX()
 *
 * // usage
 * const onToggle = useCallback(() => {
 *  toggle()
 * }, [toggle])
 * ```
 * @dependency use-sound by Josh Comeau
 * @link https://github.com/joshwcomeau/use-sound
 */

export const useSFX = ({
  playbackRate = 0.5,
  volume = 0.35,
  interrupt = true,
  soundEnabled = true,
}: HookOptions) => {
  const opts = {
    volume,
    interrupt,
    playbackRate,
    soundEnabled,
  };

  // const [sfxPopOn] = useSound('/sfx/pop-up-on.mp3', opts)
  // const [sfxPopOff] = useSound('/sfx/pop-up-off.mp3', opts)
  // const [sfxPopDown] = useSound('/sfx/pop-down.mp3', opts)
  // const [sfxToggle] = useSound('/sfx/toggle.mp3', opts)
  // const [sfxTick] = useSound('/sfx/tick.mp3', opts)
  // const [sfxStep] = useSound('/sfx/step.mp3', opts)
  // const [sfxTech] = useSound('/sfx/tech.wav', opts)
  // const [sfxDisable] = useSound('/sfx/disable.mp3', {
  //   sprite: { dis: [0, 200] },
  //   playbackRate: 0.3,
  // })
  // const [sfxEnable] = useSound('/sfx/enable.mp3', opts)
  // const [sfxDiamond] = useSound('/sfx/diamond.mp3', opts)
  // const [sfxNumbers] = useSound('/sfx/numbers.mp3', {
  //   sprite: { dis: [0, 120] },
  //   volume: 0.2,
  //   playbackRate: 0.8,
  // })

  const [sfxDarbuka] = useSound("/sfx/darbuka.wav", opts);

  return {
    // sfxStep,
    // sfxTick,
    // sfxTech,
    // sfxPopOn,
    // sfxToggle,
    // sfxPopOff,
    // sfxEnable,
    // sfxDiamond,
    // sfxNumbers,
    // sfxDisable,
    // sfxPopDown,
    sfxDarbuka,
  };
};
