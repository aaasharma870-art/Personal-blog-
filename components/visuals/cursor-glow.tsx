"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * CursorGlow — a soft aqua light that eases toward the pointer across the whole
 * site (screen blend, very low alpha so it never hurts text legibility).
 * Pointer-driven only: disabled on touch / coarse pointers and under reduced
 * motion. Position is written via transform in a rAF (no React re-render).
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;

    const loop = () => {
      raf = 0;
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) {
        raf = requestAnimationFrame(loop);
      }
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-40 h-[460px] w-[460px] opacity-0 mix-blend-screen transition-opacity duration-300 will-change-transform"
      style={{
        marginLeft: "-230px",
        marginTop: "-230px",
        background:
          "radial-gradient(circle, rgba(45,212,191,0.10), rgba(45,212,191,0.04) 35%, transparent 65%)",
      }}
    />
  );
}
