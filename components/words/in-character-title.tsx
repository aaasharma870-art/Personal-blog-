import type { ReactNode } from "react";
import { beatAttrs } from "@/lib/beats";
import type { WorldId } from "@/lib/worlds";

/* ============================================================================
   TITLE ARRIVING IN CHARACTER (spec §8.2, P3-7; plan §3.6) — OWNER: W2-WORDS.
   Server markup with the real text (`data-words="title"`); the words binder
   plays the world's arrival (words.title-<world> DEFAULT / ALT) on desktop.
   W1.0 stub: plain text in its element, no motion.
   ========================================================================== */

export type InCharacterTitleProps = {
  world: WorldId;
  as?: "h2" | "span";
  id?: string;
  className?: string;
  beat?: string;
  children: ReactNode;
};

export function InCharacterTitle({ world, as = "h2", id, className, beat, children }: InCharacterTitleProps) {
  const Tag = as;
  return (
    <Tag id={id} className={className} data-words="title" data-words-world={world} {...(beat ? beatAttrs(beat) : {})}>
      {children}
    </Tag>
  );
}
