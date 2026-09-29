"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { GithubMark } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/magnetic";

/**
 * ContactFinale — the contact's actions, in the SPEC tab order (bar H15):
 * Copy email → mailto → GitHub. The magnetic Copy pill is INK (not aqua: the
 * resolved bracket is the viewport's one aqua mark); COPIED stays literal
 * and is announced politely, only when the clipboard write resolves (no
 * success claim on a rejected promise, bar H13). Magnetism is pointer-only
 * and off under reduced motion / Pause (Magnetic). No glow, no ripple.
 * The résumé is not linked until a real file exists (bar H14).
 */
export function ContactFinale({ email, github }: { email: string; github: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mt-tier-block">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-tier-group">
        <Magnetic strength={0.25}>
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy email address ${email}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-fg px-5 type-body text-bg transition-colors duration-(--dur-micro) hover:bg-accent-bright"
          >
            <Mail className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>{copied ? "Copied" : email}</span>
          </button>
        </Magnetic>
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
