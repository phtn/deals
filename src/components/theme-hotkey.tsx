"use client";

import type { Keys } from "@/hooks/use-window";
import { useWindow } from "@/hooks/use-window";
import { useEffect } from "react";

export function ThemeHotkey() {
  const noop: VoidFunction = () => {};
  const { onKeyDown } = useWindow(false, noop);
  const { add, remove } = onKeyDown("i" as Keys);

  useEffect(() => {
    add();
    return () => remove();
  }, [add, remove]);

  return null;
}
