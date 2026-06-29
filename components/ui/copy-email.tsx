"use client";

import { useRef, useState } from "react";
import { Check, Mail } from "lucide-react";

/**
 * CopyEmail — the primary contact affordance. Clicking copies the real address
 * to the clipboard and flashes a confirmation; a secondary mailto link remains
 * for opening a mail client. No fake form (the site is static / backend-free).
 */
export function CopyEmail({ email }: { email: string }) {
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
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy email address ${email}`}
      className="glow-accent group relative inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-medium text-canvas transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-gold-bright hover:shadow-[0_0_0_1px_rgba(94,234,212,0.5),0_16px_50px_-12px_rgba(45,212,191,0.7)]"
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Mail className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? "Copied to clipboard" : email}
      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </button>
  );
}
