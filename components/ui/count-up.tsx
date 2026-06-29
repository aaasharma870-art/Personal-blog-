"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";

/**
 * CountUp — animates the numeric part of a metric from 0 to its real value when
 * scrolled into view. Preserves any prefix/suffix (e.g. "3,000+", "25%"). The
 * final value is always the real one (honest); reduced motion and no-JS render
 * it statically. NOTE: the regex MUST be computed inside the effect — a fresh
 * match array in the deps array would restart the animation every frame.
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
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
