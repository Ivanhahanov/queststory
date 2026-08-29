"use client";

import { useEffect } from "react";

/**
 * Some Android WebView builds (installed PWA/TWA context) mis-recompute the
 * layout-viewport width after content height changes without a full page
 * navigation — e.g. collapsing/expanding a list. When that happens the page
 * suddenly measures itself against a much wider (desktop-ish) viewport, our
 * own `max-w-*` utilities kick in, and the whole app visibly shrinks into a
 * narrow centered column. Re-touching the <meta name="viewport"> tag's
 * content forces the browser to recompute it correctly — same value, just
 * reasserted — so we do that on every layout-affecting resize.
 */
export function ViewportKick() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    const original = meta?.getAttribute("content");
    if (!meta || !original) return;

    let raf = 0;
    function kick() {
      meta!.setAttribute("content", `${original} `);
      raf = requestAnimationFrame(() => meta!.setAttribute("content", original!));
    }

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(kick);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
