"use client";

import { useEffect, useRef } from "react";
import { pickCodec } from "@/lib/codec";
import { acquireDecoder, releaseDecoder } from "@/lib/decoder-lock";
import { getMedia, isMediaId, type MediaId } from "@/lib/media";

/* ============================================================================
   STAGE VIDEO (spec §3.2, §6.3) — OWNER: B1-STAGE (W1), W2-PLATES (W2).
   The stage's ONE <video> element (created once, imperatively, and moved
   into the host of the shot that plays: one decoder, one element):
   - DecoderLock priority 1 (`wait: true`): above own sections and inline
     plates (0), below a card's star loop (2) and the intro (10). A refused
     or preempted claim leaves the poster showing and retries when granted.
   - `video.src` is set directly from pickCodec() (lib/codec.ts, the one
     encode rule for every host); the first decoded frame
     (requestVideoFrameCallback, `playing` as the fallback) fades the video
     in over the poster (600 ms, opacity only).
   - It plays only while the stage says so (`play`): the shot is settled
     (mix ≤ .02 or ≥ .98, so 0 decoders run during any crossfade), visible,
     motion is on, the tab is visible and no `own` section is within one
     viewport. On `play: false` it PAUSES at once (the paused frame is the
     outgoing still), releases the lock, and unloads after 1.5 s unless it
     resumes first. A new host or loop unloads at once.
   - Reduced motion / Pause / phones: the stage never asks it to play, so 0
     video bytes are requested.
   ========================================================================== */

export type StageVideoProps = {
  /** The element the video lives in (the playing shot's camera group). */
  host: HTMLElement | null;
  /** The loop to play over the shot's plate (lib/loops.ts `loopFor`). */
  loop: MediaId | null;
  /** The plate's focal point (the video's object-position = the poster's). */
  focal?: readonly [number, number];
  /** Play now (see the header). */
  play: boolean;
};

const UNLOAD_MS = 1500;
const FADE_MS = 600;

type Run = {
  el: HTMLVideoElement;
  id: symbol;
  src: string | null;
  loop: MediaId | null;
  held: boolean;
  wantPlay: boolean;
  unloadTimer: number | null;
  frameCb: number | null;
};

function makeVideo(): HTMLVideoElement {
  const v = document.createElement("video");
  v.muted = true;
  v.defaultMuted = true;
  v.loop = true;
  v.playsInline = true;
  v.preload = "none";
  v.disablePictureInPicture = true;
  v.setAttribute("aria-hidden", "true");
  v.setAttribute("tabindex", "-1");
  v.className = "stage-video";
  v.dataset.stageVideo = "";
  v.style.opacity = "0";
  return v;
}

function unload(r: Run): void {
  if (r.unloadTimer !== null) {
    window.clearTimeout(r.unloadTimer);
    r.unloadTimer = null;
  }
  const v = r.el;
  v.pause();
  v.style.transition = "none";
  v.style.opacity = "0";
  if (r.src !== null) {
    v.removeAttribute("src");
    v.load(); // frees the decoder
    r.src = null;
  }
  if (r.held) {
    r.held = false;
    releaseDecoder(r.id);
  }
}

function fadeIn(r: Run): void {
  const v = r.el;
  const show = () => {
    r.frameCb = null;
    if (!r.wantPlay) return;
    v.style.transition = `opacity ${FADE_MS}ms linear`;
    v.style.opacity = "1";
  };
  if (v.style.opacity === "1") return;
  if (typeof v.requestVideoFrameCallback === "function") {
    r.frameCb = v.requestVideoFrameCallback(show);
  } else {
    v.addEventListener("playing", show, { once: true });
  }
}

export function StageVideo({ host, loop, focal, play }: StageVideoProps): null {
  const run = useRef<Run | null>(null);

  // one element for the stage's life
  useEffect(() => {
    const r: Run = {
      el: makeVideo(),
      id: Symbol("stage-video"),
      src: null,
      loop: null,
      held: false,
      wantPlay: false,
      unloadTimer: null,
      frameCb: null,
    };
    run.current = r;
    return () => {
      r.wantPlay = false;
      unload(r);
      r.el.remove();
      run.current = null;
    };
  }, []);

  useEffect(() => {
    const r = run.current;
    if (!r) return;
    const v = r.el;

    // a different host or loop: unload, then move
    if (v.parentElement !== host || r.loop !== loop) {
      unload(r);
      r.loop = loop;
      if (host) host.appendChild(v);
      else v.remove();
    }
    if (focal) v.style.objectPosition = `${focal[0] * 100}% ${focal[1] * 100}%`;

    r.wantPlay = Boolean(play && host && loop && isMediaId(loop));
    if (!r.wantPlay || !loop) {
      // pause at once (the paused frame is the outgoing still) and let go
      v.pause();
      // let go of the lock, and of the queue if the claim was waiting
      r.held = false;
      releaseDecoder(r.id);
      if (r.src !== null && r.unloadTimer === null) {
        r.unloadTimer = window.setTimeout(() => {
          r.unloadTimer = null;
          if (!r.wantPlay) unload(r);
        }, UNLOAD_MS);
      }
      return;
    }

    if (r.unloadTimer !== null) {
      window.clearTimeout(r.unloadTimer);
      r.unloadTimer = null;
    }
    const asset = getMedia(loop);
    let cancelled = false;

    const start = () => {
      if (cancelled || !r.wantPlay) return;
      const go = (src: string) => {
        if (cancelled || !r.wantPlay) return;
        if (r.src !== src) {
          v.style.transition = "none";
          v.style.opacity = "0";
          v.preload = "auto";
          v.src = src;
          r.src = src;
        }
        fadeIn(r);
        v.play().catch(() => {
          // autoplay refused or the file failed: the poster stays
          if (!cancelled) unload(r);
        });
      };
      pickCodec({ src: asset.src, webm: asset.webm, width: asset.width, height: asset.height })
        .then((pick) => go(pick.src))
        .catch(() => go(asset.src));
    };

    r.held = acquireDecoder(r.id, {
      priority: 1,
      wait: true,
      label: "stage",
      onRevoke: () => {
        // a higher claim took the decoder: stop now, stay queued
        r.held = false;
        v.pause();
        v.style.transition = "none";
        v.style.opacity = "0";
      },
      onGrant: () => {
        r.held = true;
        if (r.wantPlay) start();
        else {
          r.held = false;
          releaseDecoder(r.id);
        }
      },
    });
    if (r.held) start();

    return () => {
      cancelled = true;
      if (r.frameCb !== null && typeof v.cancelVideoFrameCallback === "function") {
        v.cancelVideoFrameCallback(r.frameCb);
        r.frameCb = null;
      }
    };
  }, [host, loop, play, focal]);

  // the tab hidden: pause (resume when the stage asks again)
  useEffect(() => {
    const onVis = () => {
      const r = run.current;
      if (!r) return;
      if (document.visibilityState === "hidden") r.el.pause();
      else if (r.wantPlay && r.held && r.src) r.el.play().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return null;
}
