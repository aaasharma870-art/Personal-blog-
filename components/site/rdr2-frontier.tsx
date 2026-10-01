import { beyond, site } from "@/lib/content";
import { copyText, copyVisible, hrefOfId } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { beatAttrs } from "@/lib/beats";
import { Meta } from "@/components/site/world-kit";

/* ============================================================================
   RDR2 FRONTIER — Beyond's world objects (SPEC v2 SM-15; rdr2 STUDY R-4, R-5;
   ICONS IC-RD-03, RD-03). SERVER components: pure SVG + CSS, 0 runtime JS.
     - TrailMap: a wide frontier map (neatline, hachured range, pines, a
       river through a lake, a dashed graphite trail to a tent, a compass
       rose); a brown fog lifts along it as the section scrolls past (CSS
       view() timeline in the world-skins block). ILLUSTRATIVE: no text, no
       place names, no numbers, no real route (H4) — its caption sits under
       it on the rd canvas, and without that caption it doesn't ship.
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

/* A FRONTIER MAP, not a topo box (ART-DIRECTOR #15: the old 4:3 beige box
   with two contour hills read as an empty form beside a blank two thirds).
   The grammar of the game's own paper map, drawn by us, NO text: a double
   neatline, a hachured range along the top, pines, a river through a lake,
   a dashed graphite trail to a tent, a compass rose. viewBox 800 × 260
   (≈ 3:1, the full width of the note's right column); computed once. */
const W = 800;
const H = 260;

/** The range: [x, height] peaks on a base line that falls gently to the right. */
const PEAKS: readonly (readonly [number, number])[] = [
  [388, 30], [428, 46], [468, 38], [516, 60], [566, 48], [612, 70], [660, 44], [706, 56], [752, 36],
];
const baseAt = (x: number) => 104 + (x - 360) * 0.03;
/** Each peak: its paper-filled face (so a nearer peak hides the one behind),
 *  its two flanks, and hachures on its shaded (right) flank running down
 *  the slope. Drawn tallest (farthest) first. */
const RANGE = [...PEAKS]
  .sort((a, b) => b[1] - a[1])
  .map(([x, h]) => {
    const b = baseAt(x);
    const w = h * 0.95;
    const n = Math.max(3, Math.round(h / 9));
    const hachures = Array.from({ length: n }, (_, k) => {
      const t = (k + 1) / (n + 1);
      const sx = x + w * t;
      const sy = b - h + h * t;
      const len = Math.min(7 + h * 0.12 * (1 - t), b - sy);
      return `M${f(sx)} ${f(sy)} L${f(sx - len * 0.35)} ${f(sy + len)}`;
    }).join(" ");
    return {
      key: x,
      face: `M${f(x - w)} ${f(b + 4)} L${f(x - w)} ${f(b)} L${f(x)} ${f(b - h)} L${f(x + w)} ${f(b)} L${f(x + w)} ${f(b + 4)} Z`,
      flanks: `M${f(x - w)} ${f(b)} L${f(x)} ${f(b - h)} L${f(x + w)} ${f(b)}`,
      hachures,
    };
  });
/** Foothill bumps under the range. */
const FOOTHILLS = [352, 404, 452, 500, 548, 596, 648, 700].map((x, k) => {
  const y = baseAt(x) + 14 + (k % 2) * 5;
  return `M${f(x - 18)} ${f(y)} Q${f(x)} ${f(y - 9)} ${f(x + 18)} ${f(y)}`;
}).join(" ");
/** A small hill on the left, in faint contours (the old map's one survivor). */
const CONTOURS = Array.from({ length: 3 }, (_, k) => ring(206, 70, 30 * (k + 1), 13 * (k + 1), 1.2 + k * 0.4, 0.07)).join(" ");
const RIVER = "M14 118 C70 112 110 138 150 150 C190 162 214 176 262 184 M352 196 C400 206 440 204 484 214 C540 228 600 236 660 230 C712 225 750 238 790 244";
const LAKE = "M262 184 C276 170 330 166 352 178 C366 186 362 200 340 206 C312 214 268 208 260 198 C256 192 258 188 262 184 Z";
/** Pines: [x, base y, size]. */
const PINES: readonly (readonly [number, number, number])[] = [
  [92, 206, 1], [110, 218, 1.2], [128, 204, 0.9], [74, 222, 1.1], [146, 222, 1],
  [430, 168, 1], [450, 178, 1.2], [468, 166, 0.9], [612, 176, 1.1], [632, 188, 1], [652, 172, 0.9], [740, 198, 1.1], [758, 186, 0.9],
];
const PINE_PATH = PINES.map(([x, y, s]) => {
  const h = 16 * s;
  const w = 6 * s;
  return `M${f(x)} ${f(y - h)} L${f(x - w)} ${f(y - h * 0.35)} L${f(x - w * 0.45)} ${f(y - h * 0.35)} L${f(x - w * 1.2)} ${f(y)} L${f(x + w * 1.2)} ${f(y)} L${f(x + w * 0.45)} ${f(y - h * 0.35)} L${f(x + w)} ${f(y - h * 0.35)} Z M${f(x)} ${f(y)} L${f(x)} ${f(y + 3 * s)}`;
}).join(" ");
/** The run: a dashed graphite trail from the bottom-left, past the lake, up
 *  into the foothills to a tent. */
const TRAIL = "M30 246 C80 236 120 240 170 232 C220 224 238 222 262 222 C300 222 340 226 372 214 C404 202 420 186 452 190 C486 194 500 170 528 150";
const TENT = { x: 540, y: 146 };
const TENT_PATH = `M${TENT.x - 10} ${TENT.y} L${TENT.x} ${TENT.y - 14} L${TENT.x + 10} ${TENT.y} Z M${TENT.x} ${TENT.y - 14} L${TENT.x - 2} ${TENT.y}`;
/** The compass rose (no letters): a long N–S diamond, a short E–W one. */
const ROSE = { x: 62, y: 58 };
const ROSE_PATH =
  `M${ROSE.x} ${ROSE.y - 30} L${ROSE.x + 5} ${ROSE.y} L${ROSE.x} ${ROSE.y + 30} L${ROSE.x - 5} ${ROSE.y} Z` +
  ` M${ROSE.x - 20} ${ROSE.y} L${ROSE.x} ${ROSE.y + 4} L${ROSE.x + 20} ${ROSE.y} L${ROSE.x} ${ROSE.y - 4} Z`;

/**
 * TrailMap (RD-03) — a wide frontier map strip under the Athletics facts,
 * desktop only (the caller hides it below lg). aria-hidden: it carries no
 * information; it decorates the Athletics note (RD-P3 "drawn only where
 * you've been"). ILLUSTRATIVE (its Meta label stays under it): no text,
 * no place names, no numbers, no real route.
 */
export function TrailMap({ className }: { className?: string }) {
  const caption = copyText("beyond.map.caption");
  if (!copyVisible(caption)) return null; // the honesty label is mandatory
  return (
    <figure className={cn("w-full", className)} data-motif="trail-map" {...beatAttrs("B41", { weight: 2 })}>
      <div aria-hidden="true" className="trail-map relative aspect-[800/260] overflow-hidden rounded-[4px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" focusable="false" preserveAspectRatio="xMidYMid slice">
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* the neatline: a double rule, like a printed sheet */}
            <rect x={8} y={8} width={W - 16} height={H - 16} className="stroke-(--handbill-graphite)" strokeWidth={1.4} />
            <rect x={13} y={13} width={W - 26} height={H - 26} className="stroke-(--paper-pencil)" strokeWidth={0.6} />
            <path d={CONTOURS} className="stroke-(--trail-map-contour)" strokeWidth={1.1} />
            <path d={RIVER} className="stroke-(--trail-map-water)" strokeWidth={3.2} />
            <path d={LAKE} className="fill-(--trail-map-water) stroke-(--trail-map-water)" fillOpacity={0.4} strokeWidth={1.6} />
            <path d={FOOTHILLS} className="stroke-(--paper-pencil)" strokeOpacity={0.7} strokeWidth={1} />
            {RANGE.map((pk) => (
              <g key={pk.key}>
                <path d={pk.face} className="fill-(--trail-map)" />
                <path d={pk.hachures} className="stroke-(--paper-pencil)" strokeWidth={0.9} />
                <path d={pk.flanks} className="stroke-(--handbill-graphite)" strokeWidth={1.4} />
              </g>
            ))}
            <path d={PINE_PATH} className="stroke-(--paper-pencil)" strokeWidth={1} />
            <path d={TRAIL} className="stroke-(--handbill-graphite)" strokeWidth={1.8} strokeDasharray="7 6" />
            <path d={TENT_PATH} className="stroke-(--handbill-graphite)" strokeWidth={1.4} />
            <circle cx={ROSE.x} cy={ROSE.y} r={20} className="stroke-(--paper-pencil)" strokeWidth={0.8} />
            <path d={ROSE_PATH} className="fill-(--paper-pencil) stroke-(--handbill-graphite)" fillOpacity={0.35} strokeWidth={1} />
          </g>
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
