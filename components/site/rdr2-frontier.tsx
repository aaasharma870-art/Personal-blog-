import { beyond, site } from "@/lib/content";
import { copyText, copyVisible, hrefOfId } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { Meta } from "@/components/site/world-kit";

/* ============================================================================
   RDR2 FRONTIER — Beyond's world objects (SPEC v2 SM-15; rdr2 STUDY R-4, R-5;
   ICONS IC-RD-03, RD-03). SERVER components: pure SVG + CSS, 0 runtime JS.
     - TrailMap: map paper with build-time contours and a dashed graphite
       trail; a brown fog lifts along the trail as the section scrolls past
       (CSS view() timeline in the world-skins block). ILLUSTRATIVE: no text,
       no place names, no numbers, no route on it (H4) — its caption sits
       beside it on the rd canvas, and without that caption it doesn't ship.
     - Handbill: WANTED, for questions about quantitative research — a
       handbill of CONFIRMED content.ts facts only. Never "dead or alive", a
       crimes list, a bounty or a drawn face; the REWARD is Aryan's to write
       (DRAFT: a visible slot in dev, absent in production).
   ========================================================================== */

const f = (n: number) => n.toFixed(1);

/** One contour ring: a wobbly closed curve (deterministic, so SSR = client). */
function ring(cx: number, cy: number, rx: number, ry: number, seed: number, wob: number): string {
  const N = 40;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const w = 1 + wob * (Math.sin(3 * t + seed) * 0.6 + Math.sin(5 * t + seed * 1.7) * 0.4);
    pts.push(`${i ? "L" : "M"}${f(cx + rx * w * Math.cos(t))} ${f(cy + ry * w * Math.sin(t))}`);
  }
  return `${pts.join("")}Z`;
}

/* Two hills and a creek (viewBox 400 × 300); computed once at module load. */
const CONTOURS = [
  ...Array.from({ length: 5 }, (_, k) => ring(262, 118, 34 * (k + 1), 22 * (k + 1), 1 + k * 0.3, 0.07)),
  ...Array.from({ length: 3 }, (_, k) => ring(86, 226, 26 * (k + 1), 16 * (k + 1), 2.5 + k * 0.4, 0.08)),
].join(" ");
const CREEK = "M-4 150 C40 142 70 170 112 160 C150 150 170 196 214 206 C258 216 300 250 404 262";
const TRAIL = "M22 278 C60 250 70 214 112 204 C150 195 164 160 196 140 C226 121 250 88 292 70 C320 58 350 52 382 30";

/**
 * TrailMap (RD-03) — ≤ 30 % of the section, desktop only (the caller hides
 * it below lg). aria-hidden: it carries no information; it decorates the
 * Athletics note beside it (RD-P3 "drawn only where you've been").
 */
export function TrailMap({ className }: { className?: string }) {
  const caption = copyText("beyond.map.caption");
  if (!copyVisible(caption)) return null; // the honesty label is mandatory
  return (
    <figure className={cn("w-full", className)} data-motif="trail-map">
      <div aria-hidden="true" className="trail-map relative aspect-[4/3] overflow-hidden rounded-[6px]">
        <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" focusable="false" preserveAspectRatio="xMidYMid slice">
          <path d={CONTOURS} fill="none" className="stroke-(--trail-map-contour)" strokeWidth={1.2} />
          <path d={CREEK} fill="none" className="stroke-(--trail-map-water)" strokeWidth={3} strokeLinecap="round" />
          <path
            d={TRAIL}
            fill="none"
            className="stroke-(--paper-pencil)"
            strokeWidth={1.6}
            strokeDasharray="6 5"
            strokeLinecap="round"
          />
        </svg>
        {/* the fog: lifts left → right as you read (CSS only; none under RM) */}
        <div className="trail-fog absolute inset-0" />
      </div>
      <figcaption className="mt-tier-pair">
        <Meta fields={[caption.text]} />
      </figcaption>
    </figure>
  );
}

/* — The handbill (IC-RD-03 re-hosted in Beyond; RD-3 default ON) ———————— */

/** Confirmed Beyond facts, verbatim (content.ts item heads). Community stays
 *  off the handbill on purpose (a WANTED bill is no place for service or
 *  family legacy). */
function knownFor(): string[] {
  const heads = (kicker: string, n?: number) =>
    (beyond.find((b) => b.kicker === kicker)?.items ?? []).slice(0, n).map((i) => i.head);
  return [...heads("Athletics", 2), ...heads("Activities & Leadership", 1), ...heads("Creative")];
}

export function Handbill({ className }: { className?: string }) {
  const sub = copyText("beyond.handbill.sub");
  const reward = copyText("beyond.handbill.reward");
  const contactHref = hrefOfId("contact");
  const devDraftSlot = process.env.NODE_ENV !== "production" && !copyVisible(reward);
  const facts = knownFor();
  return (
    <aside
      aria-labelledby="handbill-title"
      className={cn("handbill relative w-full max-w-[22rem] px-8 pb-8 pt-10", className)}
      data-motif="handbill"
    >
      {/* two nail holes (decorative) */}
      <span aria-hidden="true" className="absolute left-4 top-4 size-1.5 rounded-full bg-(--handbill-graphite)" />
      <span aria-hidden="true" className="absolute right-4 top-4 size-1.5 rounded-full bg-(--handbill-graphite)" />

      <h3 id="handbill-title" className="handbill-rule py-2 text-center type-title text-fg">
        WANTED
      </h3>
      {copyVisible(sub) ? <p className="mt-tier-pair text-center type-small text-fg-muted">{sub.text}</p> : null}
      <p className="mt-tier-group text-center type-title text-fg">{site.name}</p>

      <dl className="mt-tier-group space-y-tier-group border-t border-rule pt-tier-group">
        <div>
          <dt className="type-meta text-fg-muted">Known for</dt>
          <dd>
            <ul className="mt-tier-pair space-y-1 type-small text-fg">
              {facts.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="type-meta text-fg-muted">Last seen</dt>
          <dd className="mt-1 type-small text-fg">{site.location}</dd>
        </div>
        {copyVisible(reward) ? (
          <div>
            <dt className="type-meta text-fg-muted">Reward</dt>
            <dd className="mt-1 type-small text-fg">{reward.text}</dd>
          </div>
        ) : devDraftSlot ? (
          // dev / preview only: the empty slot Aryan is asked to write (or leave empty)
          <div data-draft="beyond.handbill.reward">
            <dt className="type-meta text-fg-muted">Reward</dt>
            <dd className="mt-1 type-meta text-fg-muted">[Draft — Aryan]</dd>
          </div>
        ) : null}
      </dl>

      {contactHref ? (
        <a
          href={contactHref}
          className="mt-tier-group inline-flex min-h-11 items-center type-small text-accent underline decoration-1 underline-offset-4"
        >
          Reply by email →
        </a>
      ) : null}
    </aside>
  );
}
