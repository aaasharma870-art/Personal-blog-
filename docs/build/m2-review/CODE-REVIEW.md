# M2 code review (code-review skill, medium, 729becb..HEAD, report-only) — 2026-09-29

**Finding (plausible, mobile + hero ALT only):** `components/sections/hero/hero-stage.tsx:772` — the ALT "spyglass" framing scales the portrait still to 1.18× and relies on the bracket's clip to crop it. While the bracket's opening animation runs, the clip is off (only a left-to-right fade applies), so for that moment the zoomed image overhangs its box (~6% above, ~12% below) onto the space under the CTA and the section padding; the section's overflow only trims at the section edges. Ends when the animation finishes and the clip returns. Not yet seen in a browser. Fix: keep an overflow-hidden (or `clip-path: inset(0)`) wrapper on the still's own box during the opening, so the zoom is always cropped to it.

**Verified OK by reading:** observers watch unclipped/untransformed wrappers (film frames, chalkboard frame, new plate bands); RM/Pause → final state in the new plate bands, the chalkboard answer and the spyglass zoom; deterministic SSR (hydration); head-plate variant fallbacks (`headPlateOf`/`platePick`); film-quote attribution kept in the lettered film lines.

Scope note: a single pass over ~4,300 added lines / 64 files; loaders and parts of the act-card frames were skimmed.
