import { Dither } from "@/components/bits/dither";

export const DitherComponent = () => {
  return (
    <div className="relative size-full">
      <Dither
        waveColor={[3.95, 2.05, 0.95]}
        disableAnimation={false}
        enableMouseInteraction={true}
        mouseRadius={0.033}
        colorNum={9.67}
        waveAmplitude={0.33}
        waveFrequency={3.33}
        waveSpeed={0.033}
      />
    </div>
  );
};
