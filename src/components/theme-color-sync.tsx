"use client";

import { useEffect } from "react";

export function ThemeColorSync({ color }: { color: string }) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const previous = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", color);
    return () => {
      if (previous) meta?.setAttribute("content", previous);
    };
  }, [color]);

  return null;
}
