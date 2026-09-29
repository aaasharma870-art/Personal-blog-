"use client";

import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useFinePointer, useMediaQuery, useReducedMotion } from "@/lib/flags";
import { dur, ease, springFollow } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { GithubMark } from "@/components/ui/icons";

/**
 * ContactFinale — the contact's actions, in the SPEC tab order (bar H15):
 * Copy email → mailto → GitHub. The résumé is not linked until a real file
 * exists (bar H14).
 *
 * THE COPY PILL (bar P1/P2, C, H11–H13): an INK pill (never aqua: the
 * resolved bracket is the viewport's one aqua mark).
 *   - Magnetic on a fine pointer at ≥ 1024 px only: the shell follows the
 *     cursor ≤ 15 px, the label further (≤ 25 px), on springFollow (no
 *     overshoot). Off under reduced motion / Pause, on touch, below 1024
 *     (transform none).
 *   - Hover: a gold-ink fill rises from the bottom and exits through the
 *     top on leave (transform only; contrast 9+ : 1 either way).
 *   - Copy: `writeText(email)` → ONLY on resolve: the label swaps to
 *     "Copied" (a mask, dur.base; the pill keeps its width: both labels
 *     share one grid cell, CLS 0), a polite live region announces it, and
 *     `onCopied()` asks the plate for its single flare. On reject: nothing
 *     claims success.
 */
export function ContactFinale({
  email,
  github,
  onCopied,
}: {
  email: string;
  github: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return;
    }
    setCopied(true);
    onCopied?.();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mt-tier-block">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-tier-group">
        <CopyPill email={email} copied={copied} onCopy={copy} />
        <span aria-live="polite" className="sr-only">
          {copied ? "Email address copied to clipboard" : ""}
        </span>
        <a
          href={`mailto:${email}`}
          className="inline-flex min-h-11 items-center type-body text-fg underline decoration-(--fg-ghost) decoration-1 underline-offset-4 transition-colors hover:decoration-current"
        >
          Open in your mail app
        </a>
        <a
          href={github}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-h-11 items-center gap-2 type-body text-fg-muted transition-colors hover:text-fg"
        >
          <GithubMark className="size-4" />
          GitHub
          <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>
      <p className="mt-tier-group type-meta text-fg-muted">
        Résumé<span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
        <span className="sr-only">, </span>coming soon
      </p>
    </div>
  );
}

const SHELL_MAX = 15;
const LABEL_MAX = 25;
const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

type Fill = "rest" | "in" | "out";

function CopyPill({ email, copied, onCopy }: { email: string; copied: boolean; onCopy: () => void }) {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const wide = useMediaQuery("(min-width: 64rem)");
  const magnetic = !reduced && fine && wide;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, springFollow);
  const sy = useSpring(my, springFollow);
  const lx = useTransform(sx, (v) => (v / SHELL_MAX) * LABEL_MAX);
  const ly = useTransform(sy, (v) => (v / SHELL_MAX) * LABEL_MAX * 0.6);

  const [fill, setFill] = useState<Fill>("rest");

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!magnetic || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(clamp((e.clientX - (r.left + r.width / 2)) * 0.3, SHELL_MAX));
    my.set(clamp((e.clientY - (r.top + r.height / 2)) * 0.3, SHELL_MAX));
  };
  const onEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "mouse") setFill("in");
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    setFill((f) => (f === "in" ? "out" : f));
  };

  const still = { x: 0, y: 0 };
  return (
    <motion.button
      type="button"
      onClick={onCopy}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      aria-label={`Copy email address ${email}`}
      className="relative inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-pill bg-fg px-5 type-body text-bg"
      style={magnetic ? { x: sx, y: sy } : still}
      data-copied={copied ? "" : undefined}
    >
      {/* the fill: rises from below on enter, exits through the top on leave */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 bg-(--w-ink-contour) ease-out motion-off:transition-none",
          fill === "in" && "translate-y-0 transition-transform duration-(--dur-base)",
          fill === "out" && "-translate-y-full transition-transform duration-(--dur-base)",
          fill === "rest" && "translate-y-full",
        )}
        onTransitionEnd={() => setFill((f) => (f === "out" ? "rest" : f))}
      />
      <motion.span className="relative inline-flex items-center gap-2" style={magnetic ? { x: lx, y: ly } : still}>
        <Mail className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        {/* both labels share one cell: the pill never changes width */}
        <span className="grid overflow-hidden">
          <motion.span
            className="col-start-1 row-start-1"
            initial={false}
            animate={{ y: copied ? "-110%" : "0%" }}
            transition={{ duration: reduced ? 0 : dur.base, ease }}
          >
            {email}
          </motion.span>
          <motion.span
            aria-hidden="true"
            className="col-start-1 row-start-1"
            initial={false}
            animate={{ y: copied ? "0%" : "110%" }}
            transition={{ duration: reduced ? 0 : dur.base, ease }}
          >
            Copied
          </motion.span>
        </span>
      </motion.span>
    </motion.button>
  );
}
