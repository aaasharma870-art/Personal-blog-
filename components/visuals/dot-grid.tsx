"use client";

import { useEffect, useRef } from "react";

/**
 * DotGrid — a quiet quant "graph-paper" lattice rendered to a single canvas.
 * Dots shift from cool graphite toward aqua within a small radius of the cursor.
 * Reimplemented by hand (no GSAP), inspired by React Bits "DotGrid" (reactbits.dev).
 *
 * Performance: the RAF loop runs ONLY while the pointer is actively moving over
 * the hero; when idle it settles to a static frame and stops. It also pauses
 * entirely when the hero scrolls offscreen (IntersectionObserver) or the tab is
 * hidden. Under prefers-reduced-motion it draws a static lattice and never loops.
 */
export function DotGrid({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const GAP = 30;
    const DOT = 2.4;
    const PROX = 130;
    const IDLE_MS = 700; // stop the loop this long after the last pointer move
    const base = [110, 124, 134]; // cool graphite
    const aqua = [45, 212, 191]; // accent #2dd4bf

    let dots: { x: number; y: number }[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let onScreen = true;
    let lastActive = 0;
    const pointer = { x: -9999, y: -9999 };

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(1, Math.floor((w + GAP) / GAP));
      const rows = Math.max(1, Math.floor((h + GAP) / GAP));
      const startX = (w - (cols - 1) * GAP) / 2;
      const startY = (h - (rows - 1) * GAP) / 2;
      dots = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: startX + c * GAP, y: startY + r * GAP });
        }
      }
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
      ctx.globalAlpha = 0.14;
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, DOT / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const dist = Math.hypot(d.x - pointer.x, d.y - pointer.y);
        const t = dist < PROX ? 1 - dist / PROX : 0;
        if (t > 0) {
          ctx.fillStyle = `rgb(${Math.round(base[0] + (aqua[0] - base[0]) * t)},${Math.round(base[1] + (aqua[1] - base[1]) * t)},${Math.round(base[2] + (aqua[2] - base[2]) * t)})`;
          ctx.globalAlpha = 0.14 + 0.5 * t;
          ctx.beginPath();
          ctx.arc(d.x, d.y, (DOT / 2) * (1 + 0.5 * t), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
          ctx.globalAlpha = 0.14;
          ctx.beginPath();
          ctx.arc(d.x, d.y, DOT / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      raf = 0;
      drawFrame();
      // Keep animating only while the pointer is still recently active.
      if (now - lastActive < IDLE_MS && onScreen && !document.hidden) {
        raf = requestAnimationFrame(loop);
      } else {
        drawStatic(); // settle
      }
    };

    const kick = () => {
      if (!raf && onScreen && !document.hidden && !reduce) {
        raf = requestAnimationFrame(loop);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      const rect = wrap.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      lastActive = performance.now();
      kick();
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else {
        drawStatic();
      }
    };

    build();
    drawStatic();

    const ro = new ResizeObserver(() => {
      build();
      drawStatic();
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (!onScreen) {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(wrap);

    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={className}
      style={{
        maskImage:
          "radial-gradient(ellipse 80% 75% at 50% 42%, black 50%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 75% at 50% 42%, black 50%, transparent 100%)",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
