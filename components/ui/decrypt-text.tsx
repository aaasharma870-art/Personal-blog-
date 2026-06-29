"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·#%>";

/**
 * DecryptText — a one-shot "terminal decrypt" that resolves scrambled glyphs
 * into the final string on mount. Used sparingly (a single mono eyebrow) for a
 * quiet quant-terminal flourish. Accessible name stays correct via aria-label;
 * reduced motion / no-JS render the plain text.
 */
export function DecryptText({
  text,
  className,
  duration = 850,
}: {
  text: string;
  className?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    // initial state already renders the plain text; skip animating when reduced.
    if (reduce || started.current) return;
    started.current = true;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const revealed = Math.floor(t * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " " || i < revealed) out += ch;
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, text, duration]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
