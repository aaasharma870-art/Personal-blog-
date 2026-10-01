"use client";

import { Fragment } from "react";
import { copyText, copyVisible } from "@/lib/sections";
import { HUNT_ROWS, HUNT_WORLDS } from "@/components/eggs/hunt-rows";
import { HUNT_IDS } from "@/components/eggs/hunt-store";

/* ============================================================================
   THE HUNT rows (lazy; PHASE3-SPEC §9.4) — OWNER: W2-HUNT.
   Twelve credits rows in the roll's own grid (the role in Meta at left, the
   name at right), in page order. The role sits in its world's face
   (`font-world-head` under `data-world`: the film faces at ≥ 64rem once
   loaded, the house type elsewhere). Copy `egg.hunt.credit.*` is
   "<role> — you" (proposed, unsigned).
   ========================================================================== */

const ROW =
  "grid grid-cols-1 gap-1 border-t border-rule py-tier-group sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-8";

export default function HuntCreditsRows() {
  return (
    <>
      {HUNT_WORLDS.map((world) => (
        <Fragment key={world}>
          {HUNT_IDS.filter((h) => HUNT_ROWS[h].world === world).map((h) => {
            const c = copyText(HUNT_ROWS[h].credit);
            if (!copyVisible(c)) return null;
            const cut = c.text.lastIndexOf(" — ");
            const role = cut > 0 ? c.text.slice(0, cut) : c.text;
            const name = cut > 0 ? c.text.slice(cut + 3) : "";
            return (
              <div key={h} className={ROW} data-credits-row={`hunt-${h}`}>
                <dt className="text-fg-muted sm:pt-0.5 sm:text-right">
                  <span data-world={world} className="font-world-head text-[1.125rem] leading-tight">
                    {role}
                  </span>
                </dt>
                <dd className="type-body text-fg">{name}</dd>
              </div>
            );
          })}
        </Fragment>
      ))}
    </>
  );
}
