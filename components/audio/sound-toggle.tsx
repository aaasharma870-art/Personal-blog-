"use client";

/* ============================================================================
   SOUND TOGGLE (spec §10.4, P3-9) — OWNER: W2-SOUND.
   Pre-mounted in the header's right cluster, between the hunt chip and
   Pause. Server markup, shown only under DESKTOP_FINE by the full media
   query (app/p3/sound.css `.sound-toggle`, never `lg:`), so SSR is the same
   for every visitor and there is no layout shift.
   - A speaker <button aria-pressed>: SSR and hydration render the muted
     state; the real state arrives one render later (lib/audio/store.ts).
   - The first press creates the AudioContext inside the click, loads the
     engine and plays one soft click. Hover / focus prefetch the engine
     chunk (JS only).
   - Under OS reduced motion or Pause: aria-disabled, with the note "Sound
     follows motion: resume motion to hear it" (tooltip + description).
   - While on, it lazily mounts the bed follower (`follow`, default true;
     the sound lab turns it off to audition beds by hand).
   ========================================================================== */

import { useId, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { copyText, copyVisible } from "@/lib/sections";
import { preloadSound, setSoundOn, useSound } from "@/lib/audio/store";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { cn } from "@/lib/utils";

const BedFollower = dynamic(() => import("./bed-follower"), { ssr: false });

const NAME = copyText("sound.name");
const ON = copyText("sound.on");
const OFF = copyText("sound.off");
const NOTE = copyText("sound.disabled");

/** true after hydration (server + hydration render = false). */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function SoundToggle({ follow = true, className }: { follow?: boolean; className?: string } = {}) {
  const mounted = useMounted();
  // Unique per instance: the lab renders a second toggle beside the header's.
  const noteId = useId();
  const { on, available } = useSound();
  const { reduced } = useMotionPreference();
  // Disabled only once the client knows (SSR = enabled, muted).
  const disabled = mounted && !available;
  const noted = disabled && reduced && copyVisible(NOTE);
  const tip = noted ? NOTE : on ? ON : OFF;

  return (
    <span className={cn("sound-toggle group/sound relative", className)}>
      <button
        type="button"
        data-sound-toggle={on ? "on" : "off"}
        aria-pressed={on}
        aria-disabled={disabled || undefined}
        aria-describedby={noted ? noteId : undefined}
        onPointerEnter={available ? preloadSound : undefined}
        onFocus={available ? preloadSound : undefined}
        onClick={() => {
          if (!disabled) void setSoundOn(!on);
        }}
        className={cn(
          "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control px-2",
          "text-fg-muted transition-colors duration-(--dur-micro) hover:text-fg focus-visible:text-fg",
          "aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:text-fg-muted",
        )}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="sound-toggle__icon size-5">
          <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
          <g className="sound-toggle__waves" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
            <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
            <path d="M18 7a7 7 0 0 1 0 10" />
          </g>
          <g className="sound-toggle__mute" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
            <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
          </g>
        </svg>
        <span className="sr-only">{copyVisible(NAME) ? NAME.text : "Sound"}</span>
      </button>
      {mounted && copyVisible(tip) ? (
        <span
          id={noted ? noteId : undefined}
          aria-hidden={noted ? undefined : true}
          className="pointer-events-none absolute right-0 top-full mt-1 whitespace-nowrap rounded-control px-3 py-1.5 type-meta text-fg-muted opacity-0 transition-opacity duration-(--dur-micro) surface-2 group-focus-within/sound:opacity-100 group-hover/sound:opacity-100"
        >
          {tip.text}
        </span>
      ) : null}
      {follow && on ? <BedFollower /> : null}
    </span>
  );
}
