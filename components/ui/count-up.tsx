"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * CountUp — animates the numeric part of a metric from 0 to its real value when
 * scrolled into view, then plays a one-shot "settle" (a subtle scale pop + a
 * brief aqua digit flash that decays back to the resting color). Preserves any
 * prefix/suffix (e.g. "3,000+", "25%"). The final value is always the real one
 * (honest); reduced motion and no-JS render it statically with no settle. Scope
 * to NEUTRAL magnitude counts only (trades/trials/files/months) — never
 * Sharpe/PSR/PF (those render statically per the honesty ethos).
 * NOTE: the regex MUST be computed inside the effect — a fresh match array in
 * the deps array would restart the animation every frame.
 */
export function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  // once:false so the count REPLAYS — resets to 0 when it leaves view and counts
  // up again when it returns (matches the site-wide reveal-replay behaviour).
  const inView = useInView(ref, { once: false, amount: 0.6 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    // prefix (non-digit) · number (comma/decimal) · suffix — computed here so the
    // effect deps stay stable (no per-render array identity churn).
    const match = value.match(/^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/);
    // Guard keeps setState out of the effect body — it only runs inside animate's
    // async onUpdate. When the element re-enters view, animate restarts from 0, so
    // the count visibly replays without a synchronous reset.
    if (!match || reduce || !inView) return;
    const [, prefix, numRaw, suffix] = match;
    const target = parseFloat(numRaw.replace(/,/g, ""));
    const decimals = (numRaw.split(".")[1] ?? "").length;
    const hasComma = numRaw.includes(",");
    const controls = animate(0, target, {
      duration: 1.1,
      ease,
      onUpdate: (v) => {
        let s = decimals ? v.toFixed(decimals) : Math.round(v).toString();
        if (hasComma) s = Number(s).toLocaleString("en-US");
        setDisplay(`${prefix}${s}${suffix}`);
      },
      onComplete: () => {
        // One-shot settle: transform (scale) + a brief aqua→rest color flash.
        // Fires once per entry; the displayed value is already the real number.
        const el = ref.current;
        if (!el) return;
        const rest = getComputedStyle(el).color;
        animate(el, { scale: [1, 1.03, 1] }, { duration: 0.18, ease });
        animate(
          el,
          { color: ["#2dd4bf", rest] },
          {
            duration: 0.42,
            ease,
            onComplete: () => el.style.removeProperty("color"),
          },
        );
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {display}
    </span>
  );
}
