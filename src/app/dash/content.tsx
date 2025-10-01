"use client";

import { useOptionsPanel } from "@/components/options-panel";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface ContentProps {
  children: React.ReactNode;
  isExpanded?: boolean;
}

export const Content = ({ children }: ContentProps) => {
  const { state } = useOptionsPanel();
  const isExpanded = useMemo(() => state === "expanded", [state]);
  return (
    <div
      className={cn(
        "flex-1 [&>div>div]:h-full w-full border-x-[0.75px] border-t-[0.75px] border-foreground/[0.40] min-[1024px]:rounded-e-3xl bg-background/80",
        "overflow-hidden shadow-lg shadow-foreground/10",
        { "md:rounded-t-3xl md:mx-4": isExpanded },
      )}
    >
      {children}
    </div>
  );
};
