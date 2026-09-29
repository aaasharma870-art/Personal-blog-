# BAR: The Lens Index — "The reckoning" (Act II climax)
> **v3 deltas (SPEC v2 SM-8 / SM-17, 2026-09-28):** the ledger stays in Act II (idiots) and **equally quiet at rest (D-6)**. The only addition is the **opt-in Dead Eye egg** (RDR2; `rdr2-act.BAR.md` §E, `eggs.BAR.md`): user-invoked by palette or the typed word `deadeye`, ≤ 3 s, ember X's only on KILLED rows' recorded reasons, text colours never change, no weapon or sound. ICONS' auto-run Dead Eye, WANTED-poster lens figures and Honor toast are **not** adopted (SPEC §10.2.3). H29–H30 are new.
> Adapted from `prep/bars/lens-index.BAR.md` for SPEC SM-8. The structure is unchanged. v2 adds the idiots world ground, the grid-to-open-air ending, and the ledger's role as the Act II "all is lost" beat before the intermission. BUILD-SPEC 2026-09-28.
> **Binding:** SPEC §3 row 8, §7 SM-8, §10 (3I-07; HP-10 dropped). DESIGN v2 §1.2 (O-3: the lens group = one mark), §1.3.1 (idiots canvas), §1.4 (grid ≤ 6% → 0), §5.1 use ③, §6.3 (the v1 Lens Index row), §10.

## 1. Intent
Every program Aryan tested sits at the same quiet weight on the workshop board. Whichever row crosses the reading line is framed by the bracket and takes its verdict colour, so a killed idea is read with the same dignity as a survivor. The drafting grid that ran through Act II thins row by row and is gone by the last row: the page leaves the workshop into open air, and the intermission follows.

**Principles:** SYN #3 · #4 · #5 · #7 · the counter-principle.

## 2. Benchmark frames (v1, unchanged)
| Frame | Lock | Do NOT copy |
|---|---|---|
| `research/refs/obys/custom/v-00-settled.png` | One reading line across the width at the lens centre; the other rows present but ghosted; only the lensed figure in colour | 11 px; opacity ghosts; filled brackets; the rotating list; the live clock; the virtual wheel |
| `research/refs/obys/custom/v-06-step-c.png` | Text first, image follows; the colour hands over gradually | Rotating the list (scroll hijack) |
| `research/refs/obys/custom/g-05-hover-mid.png` | The lens opens by a clip from the centre | A 4th type style; hover-only titles |

## 3. State machine (v1)
- **Geometry (≥ 1024):** `No.` col 1 · title + detail cols 2–7 · the lens lane cols 8–9 · Meta verdict • status cols 10–12. The lens is one element whose y target is the active row's layout offset (discrete; `springFollow`).
- **Active-row priority:** focus > pointer > centre line (IO `-50% 0px -50% 0px`).
- **States:**
  - **Idle/entry:** all ghost; the caveat is `--fg-muted`; the bracket is ghost and closed under motion-ok.
  - **Open:** on the first activation, on `easeClip`/`dur.hero`, with the stroke going ghost → accent.
  - **Mid:** text first on `dur.micro`, then the lens y on `springFollow`, and the figure crossfades on `dur.preview` only if the MediaId changes.
  - **Settled.**
  - **Hover release.**
  - **Focus lock.**
  - **Idle/exit.**
- **Hue map:** SURVIVED → `--accent` · KILLED → `--kill` (the existing ember strike, active only) · EXCEPTION → `--exception` · flagship → `status` in `--fg-muted`.
- **v2 grid:** the Act II graph grid (`--w-grid` at ≤ 6%) is masked by a vertical gradient whose opacity maps row index → 0 at the last row, computed from the row count (not pixels). It is a static CSS mask, not animated.
- **v2 figures:** the lens figures are the **schematic mono/colour pairs** (code renders of each flagship's schematic). Survivor and killed rows fall back to their parent program's schematic; with nothing accepted, the lens is not rendered (v1 rule).

## 4. Reduced motion · touch/mobile · no-JS · Save-Data (v1)
- **RM / Pause / `?skip`:** open lens; instant activation.
- **< 1024:** no lens; a Meta line → title → detail; `--rule` hairlines; the centre-line row active; ≥ 44 px.
- **No JS:** the idle state, fully legible.
- **Save-Data:** the colour variant only, lazy.

## 5. Keyboard · focus · ARIA (v1)
- `<section aria-labelledby>` → `<h2>` → `<ol>` → `<li>` → `<h3><button aria-current>`, with the links as separate tab stops.
- Roving tabindex with ↑/↓/Home/End; no listbox; no `aria-live`; the meaning is in the word.
- The focus ring is never clipped.

## 6. HARD pass/fail checks (v1 H1–H25 unchanged in substance, restated; v2 additions)
| # | Pass iff |
|---|---|
| H1 | Every row's `No.`, title, verdict word and detail are opacity 1 at DOMContentLoaded; the no-JS frame is legible |
| H2 | The row count = the `include` sum (default 2+3+5 = 10), in order; `No.` is contiguous; no repeats |
| H3 | Every frame shows every verdict word |
| H4 | Exactly one `aria-current` when a row is on the centre line; 0 when idle |
| H5 | The active row = the `<li>` at viewport y = 450 (1440×900) or 422 (390×844) |
| H6 | Settled: the bracket and figure centres are within ±2 px of the active title's first line centre |
| H7 | The `No.`, title and verdict baselines align within ±1 px |
| H8 | At rest, the aqua elements (header included) = the active bracket + the active SURVIVED word only (one lens group); ≤ 1 at 390; hover and focus exempt |
| H9 | Amber = 1 iff the active row is EXCEPTION; ember ≤ 1 (the active KILLED only) |
| H10 | ≤ 1 bracket pair in any 10vh sweep frame, including the fixture with the ledger right after the hero |
| H11 | Every ledger text ≥ 4.5:1 on `--idi-canvas` in every state (ghost 5.36, stone 8.27, ember 6.32, amber 10.31, aqua 9.95: DESIGN §1.3.1) |
| H12 | No overflow at 320, 390, 1024 or 1440 |
| H13 | Figure rect ∩ text rects = ∅ |
| H14 | 0 layout shift in the ledger |
| H15 | +90 ms after a row change: the incoming verdict colour is ≥ 50% of the way to its hue; exactly one lens |
| H16 | ≤ 1000 ms after a fling: H6 holds, `getAnimations()` is empty, and there are 0 rAF over 1 s |
| H17 | RM: the +0 and +900 ms frames are identical after a change; the lens is open at first paint; `aria-current` moves |
| H18 | The title and detail rects are unchanged by a row change (the numbers never move) |
| H19 | Hover activates; wheeling with a resting pointer returns to the centre-line row |
| H20 | Tab reaches one row button; the keys move focus and current; 4-sided rings; links are separate stops |
| H21 | The settled text is identical with and without the pointer |
| H22 | Steady-state viewports have ≤ 3 styles ({title, meta, small}) |
| H23 | Save-Data: 0 `-mono` requests; lazy |
| H24 | Touch targets ≥ 44 × 44 at 390 |
| H25 | 0 raw hex, rgba or px in `components/sections/ledger`; 0 console errors |
| **H26** (v2) | The grid opacity at the first row ≤ 6%, and **0 at the last row**, monotonic non-increasing (sampled per row). The `systems` section starts ≤ 6% |
| **H27** (v2) | **No world emphasis** in the ledger: 0 chalk marks, 0 ribbons, 0 stamps, 0 canvas, 0 light sprites (the graveyard's power is austerity) |
| **H28** (v2) | Law 1: 0 glow, light pool or radial paint around the bracket (HP-10 is dropped) |
| **H29** (v3) | **Rest is untouched by the egg:** with no Dead Eye trigger, 0 Dead Eye frames on any visit, and the at-rest frames are pixel-identical with and without the egg chunk loaded; no RDR2 icon (poster, X, sepia grade, honor toast) appears in `#kill-list` at rest |
| **H30** (v3) | **Dead Eye truth:** during a run, the ember X count = the KILLED row count and each X sits on its row's recorded reason; SURVIVED and EXCEPTION rows are never marked; after the run (or Esc) the ledger returns to its exact prior state, including the active row and `playbackRate` 1 |
| **H29** (v2) | The header act label reads `ACT II • THE WORKSHOP` while the ledger is active; the next section is `films` (default) with the label `INTERMISSION` |
| **H30** (v2) | The lens figures are code schematics (`provenance.source: "code"`); 0 generated per-strategy covers |

## 7. Capture plan (v1)
`/lab#kill-list`, then `/`:
- sets D, M, RM, NJ and SD, with rows 01–10
- mid transitions at +0/90/190/350/900 ms
- fling, hover and keyboard runs, and the sweep
- **plus** the grid samples (H26)

## 8. Adaptability (v1, plus v2)
- The rows come from `include` against `content.ts`; EXCEPTION comes from a `caveat` field. The required runs are kept.
- **v2:** moving the ledger to act 3 (fixture) keeps it austere (H27) on `--hp-canvas`. The contrast table passes (ghost 5.64, ember 6.65, amber 10.86). The grid ends at the new last Act II section, derived.

## 9. Honesty (v1, unchanged)
- `content.ts` only: 3 survivors, never "2 survived".
- The Volatility Breakout caveat sits in the same `<li>` at ≥ `small`, never dimmer than `--fg-muted`.
- The evidence numbers are static.
- Only real links. No invented family, gate or year fields (O-1).
