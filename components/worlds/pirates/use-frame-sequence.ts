"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================================
   useFrameSequence — fetch + decode an image sequence (the Journey's JV:
   72 × 1280 webp frames, ≈ 1.5 MB) for a scroll- or state-driven canvas
   (SPEC v2 SM-4; journey-voyage.BAR J10/J11).
   - Nothing is requested until `enabled` (the host turns it on only for the
     desktop voyage — ≥ 1024, fine pointer, motion on, no Save-Data — once the
     section is within one viewport). 0 requests otherwise.
   - ≤ 6 in flight; every frame is `decode()`d before it counts, so
     `decoded / total` is REAL progress (the LD-PC mini loader shows it).
   - `ready` only when every frame decoded; a failed frame leaves the host on
     its stills (never a hole in the scrub).
   - The decoded <img> objects live in a ref (`frames.current[i]`), not in
     state: drawing never re-renders React.
   Keyed by the url list, so a variant switch (JV → JV-alt) starts clean.
   ========================================================================== */

export type FrameSequence = {
  /** Decoded frames by index (null until decoded / on failure). */
  frames: { readonly current: readonly (HTMLImageElement | null)[] };
  decoded: number;
  total: number;
  ready: boolean;
  failed: boolean;
};

const CONCURRENCY = 6;

export function useFrameSequence(urls: readonly string[], enabled: boolean): FrameSequence {
  const key = urls.length ? `${urls[0]}#${urls.length}` : "";
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  // progress is keyed by the url list, so a new list reads as 0 without a
  // synchronous reset inside the effect
  const [progress, setProgress] = useState<{ key: string; done: number; failed: number }>({
    key: "",
    done: 0,
    failed: 0,
  });

  useEffect(() => {
    if (!enabled || !key) return;
    let cancelled = false;
    const list: (HTMLImageElement | null)[] = new Array<HTMLImageElement | null>(urls.length).fill(null);
    frames.current = list;
    let next = 0;
    let inflight = 0;
    let done = 0;
    let failed = 0;

    const pump = () => {
      while (!cancelled && inflight < CONCURRENCY && next < urls.length) {
        const i = next++;
        const src = urls[i];
        if (!src) continue;
        inflight++;
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        img
          .decode()
          .then(() => {
            if (!cancelled) list[i] = img;
          })
          .catch(() => {
            failed++;
          })
          .finally(() => {
            inflight--;
            done++;
            if (cancelled) return;
            setProgress({ key, done, failed });
            pump();
          });
      }
    };
    pump();
    return () => {
      cancelled = true;
    };
    // `urls` is represented by `key` (its first url + length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);

  const mine = progress.key === key;
  const decoded = mine ? progress.done - progress.failed : 0;
  const failed = mine && progress.failed > 0;
  return {
    frames,
    decoded,
    total: urls.length,
    ready: mine && !failed && urls.length > 0 && progress.done === urls.length,
    failed,
  };
}
