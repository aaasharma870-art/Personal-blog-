"use client";

import { useEffect } from "react";
import type { Variant } from "@/lib/variants";
import "@/assets/p3/hp/hp-toys.css";

/* ============================================================================
   WAND CURSOR — the page's one light cursor, Harry Potter acts only
   (PHASE3-SPEC §9.2 #4, IDEAS §0 "Light cursor (K6): the HP wand"; P3-8 #6).
   OWNER: W3-HP. LAZY (DP-13): loaded by hp-desktop.tsx only on DESKTOP_FINE
   with motion on, after ladder step 2; Pause or reduced motion unmounts it
   at once (cursor restored, bloom removed, no listener left).

   ZONES: #principles and #contact (the whole sections), and inside #act-4
   only the hall's media layer (`[data-wand-zone]`, the ignite frames) while
   it is showing.
   - THE CURSOR: `cursor: url(wand) 3 3` on non-interactive areas
     (assets/p3/hp/hp-toys.css; links and controls keep their own cursor).
     The image is our own drawing, an inline SVG data URI (never public/):
     a plain tapered stick with a grip, its tip at the hotspot (3, 3), a
     bone outline so it reads on the dark hall and on the parchment.
   - THE BLOOM: one 96 px Lumos bloom (a pre-rendered radial image: Law 1,
     never DOM glow) follows the tip by transform. It lives BELOW the text,
     inside each zone's media / art layer (`[data-wand-art]` in the Map's
     parchment, the ALT's night sky and the contact's hall ceiling; the hall
     plate layer itself in #act-4), so it only ever lights media and art,
     never across text (IC-HP-09); a layer that text sits on asks for a
     softer light (`data-wand-art="<opacity>"`). rAF only while the pointer
     moves; it fades after 1 s still.
       DEFAULT "tip-bloom"      the bloom sits on the tip.
       ALT     "trailing-light" the bloom trails the tip on a soft follow
                                (it catches up in ≈ ¼ s: the rAF runs on
                                only while it is still travelling).
   ========================================================================== */

const BLOOM = 96;
const IDLE_MS = 1000;
/** ALT: the share of the gap the trailing light closes per frame. */
const FOLLOW = 0.2;

const uri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** The wand, drawn along the diagonal from its tip at (3, 3): a tapered
 *  shaft and a darker grip with a rounded end (our own plain drawing; no
 *  film prop). `s` = the image size in px (32 at 1×, 64 at 2×). */
function wandSvg(s: number): string {
  const d = Math.SQRT1_2;
  const at = (t: number, w: number, side: 1 | -1) => {
    const x = 3 + t * d + side * w * d;
    const y = 3 + t * d - side * w * d;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };
  const shaft = `M${at(0, 0.55, 1)} L${at(25, 1.35, 1)} L${at(25, 1.35, -1)} L${at(0, 0.55, -1)} Z`;
  const grip = `M${at(24, 2.05, 1)} L${at(36.2, 2.2, 1)} L${at(36.2, 2.2, -1)} L${at(24, 2.05, -1)} Z`;
  const end = 3 + 36.2 * d;
  return uri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 32 32">` +
      `<g stroke="#efe6d2" stroke-width="0.9" stroke-linejoin="round">` +
      `<path d="${shaft}" fill="#5a4030"/>` +
      `<path d="${grip}" fill="#2f2119"/>` +
      `<circle cx="${end.toFixed(2)}" cy="${end.toFixed(2)}" r="2.2" fill="#2f2119"/>` +
      `</g><circle cx="3" cy="3" r="1.1" fill="#eaf6ff"/></svg>`,
  );
}

/** The cursor value: crisp at 2× where `image-set` is understood. */
function cursorValue(): string {
  const one = wandSvg(32);
  const two = wandSvg(64);
  const tries = [
    `image-set(url("${one}") 1x, url("${two}") 2x) 3 3, auto`,
    `-webkit-image-set(url("${one}") 1x, url("${two}") 2x) 3 3, auto`,
  ];
  return tries.find((v) => CSS.supports("cursor", v)) ?? `url("${one}") 3 3, auto`;
}

/** The Lumos bloom: the cool wand-tip light (--w-lumos core), fading out. */
const BLOOM_SRC = uri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${BLOOM}" height="${BLOOM}" viewBox="0 0 96 96">` +
    `<defs><radialGradient id="b"><stop offset="0" stop-color="#eaf6ff" stop-opacity="0.62"/>` +
    `<stop offset="0.22" stop-color="#d4e8ff" stop-opacity="0.34"/>` +
    `<stop offset="0.55" stop-color="#a9c8ee" stop-opacity="0.1"/>` +
    `<stop offset="1" stop-color="#a9c8ee" stop-opacity="0"/></radialGradient></defs>` +
    `<circle cx="48" cy="48" r="48" fill="url(#b)"/></svg>`,
);

export default function WandCursor({ variant }: { variant: Variant }) {
  useEffect(() => {
    const principles = document.querySelector<HTMLElement>('[data-world-section="principles"]');
    const contact = document.querySelector<HTMLElement>('[data-world-section="contact"]');
    const act4 = document.getElementById("act-4");
    const zones = [principles, contact, act4].filter((z): z is HTMLElement => z !== null);
    if (!zones.length) return;
    const alt = variant === "alt";

    const cursor = cursorValue();
    for (const z of zones) z.style.setProperty("--wand-cursor", cursor);

    const bloom = document.createElement("img");
    bloom.src = BLOOM_SRC;
    bloom.alt = "";
    bloom.width = BLOOM;
    bloom.height = BLOOM;
    bloom.setAttribute("aria-hidden", "true");
    bloom.setAttribute("data-wand-bloom-sprite", "");
    bloom.style.cssText =
      "position:absolute;left:0;top:0;pointer-events:none;opacity:0;will-change:transform;transition:opacity 400ms ease-out";

    let zone: HTMLElement | null = null;
    let host: HTMLElement | null = null;
    let px = 0;
    let py = 0;
    let bx = Number.NaN;
    let by = Number.NaN;
    let raf = 0;
    let idle = 0;
    let still = false;

    /** The art layer the bloom belongs to under the pointer, or null. */
    const hostFor = (z: HTMLElement | null): HTMLElement | null => {
      if (!z) return null;
      if (z !== act4) return z.querySelector<HTMLElement>("[data-wand-art]");
      // #act-4: the hall's media layer, only where it is under the pointer and showing
      for (const el of z.querySelectorAll<HTMLElement>("[data-wand-zone]")) {
        const r = el.getBoundingClientRect();
        if (px < r.left || px > r.right || py < r.top || py > r.bottom) continue;
        if (Number.parseFloat(el.style.opacity || "1") > 0.5) return el;
      }
      return null;
    };
    const setIn = (on: boolean) => {
      if (!act4) return;
      if (on) {
        if (!act4.hasAttribute("data-wand-in")) act4.setAttribute("data-wand-in", "");
      } else if (act4.hasAttribute("data-wand-in")) act4.removeAttribute("data-wand-in");
    };
    const hide = () => {
      bloom.style.opacity = "0";
    };
    const place = () => {
      bloom.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0)`;
    };
    const rest = () => {
      // 1 s still: the light fades
      still = true;
      hide();
    };

    const tick = () => {
      raf = 0;
      const h = hostFor(zone);
      if (zone === act4) setIn(h !== null);
      if (!h) {
        hide();
        return;
      }
      if (h !== host) {
        h.appendChild(bloom);
        host = h;
        bx = Number.NaN;
      }
      const r = h.getBoundingClientRect();
      const sx = h.offsetWidth ? r.width / h.offsetWidth : 1;
      const sy = h.offsetHeight ? r.height / h.offsetHeight : 1;
      const tx = (px - r.left) / (sx || 1) - BLOOM / 2;
      const ty = (py - r.top) / (sy || 1) - BLOOM / 2;
      if (!alt || Number.isNaN(bx)) {
        bx = tx;
        by = ty;
      } else {
        bx += (tx - bx) * FOLLOW;
        by += (ty - by) * FOLLOW;
        // the trailing light is still travelling: one more frame
        if (Math.abs(tx - bx) + Math.abs(ty - by) > 0.6) raf = requestAnimationFrame(tick);
      }
      place();
      // a host may ask for a softer light (`data-wand-art="0.6"`: over text-bearing art)
      const level = Number.parseFloat(h.dataset.wandArt ?? "");
      const o = Number.isFinite(level) ? String(level) : "1";
      if (!still && bloom.style.opacity !== o) bloom.style.opacity = o;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      zone = e.currentTarget as HTMLElement;
      still = false;
      window.clearTimeout(idle);
      idle = window.setTimeout(rest, IDLE_MS);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.currentTarget !== zone) return;
      zone = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      setIn(false);
      hide();
    };

    for (const z of zones) {
      z.addEventListener("pointermove", onMove, { passive: true });
      z.addEventListener("pointerleave", onLeave, { passive: true });
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(idle);
      for (const z of zones) {
        z.removeEventListener("pointermove", onMove);
        z.removeEventListener("pointerleave", onLeave);
        z.style.removeProperty("--wand-cursor");
      }
      setIn(false);
      bloom.remove();
    };
  }, [variant]);
  return null;
}
