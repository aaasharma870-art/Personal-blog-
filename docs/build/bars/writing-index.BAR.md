# BAR: Writing index on the paper plane — v3: Arthur's journal (drafts are not links)
> **v3 deltas (SPEC v2 SM-11 / DESIGN v3 §1.3.2, 2026-09-28):** Writing moves to **Act III (rdr2)** and is dressed as **a page of Arthur's journal** (RD-1 option A): the same D-4 paper tokens (`#ebe0c6`, unchanged inks), a 6 px `--w-leather` spread edge and a gutter on desktop, entries labelled Meta `ENTRY I`…`V`, a **graphite vignette** per entry on the right page (hover **and** focus, once), one `--paper-red` underline, and the h2 written by a **pencil** nib. **Retired:** the W-01…05 candlelit covers and the filmstrip preview (MEDIA-PLAN v2 drops W). The dome seam now fills with `--rd-canvas` (the previous section is `beyond`), and the exit goes to `voices` (rd deep). Everything else in this bar holds; rows that named the filmstrip or W art apply to the vignette instead. Journal-specific checks live in `rdr2-act.BAR.md` §C. Under RD-1 option B (fixture J) the section returns to HP parchment in act-4 and this bar's v2 wording applies.
> Adapted from `prep/bars/writing-index.BAR.md` for SPEC SM-11. v2 changes:
> - D-4 YES: the whole section sits on the **paper plane `#ebe0c6`** with the new inks
> - the h2 is **nib-written** (HP-05)
> - the covers are **candlelit** W-01…05 (optional)
> - the section is in Act III (the hp world)
>
> BUILD-SPEC 2026-09-28.
> **Binding:** SPEC §3 row 11, SM-11. DESIGN v2 §1.3.2 (paper plane inks, CALC), §2.3 (nib-written title), §6.3 ("Writing nib-wipe", the v1 "Writing preview" row), §7, §8, §10. MEDIA-PLAN W-01…05.

## 1. Intent
Warm parchment rises over the candle-night like a page brought under a lamp. Five honest drafts read as a quiet contents page in dark ink. On a fine pointer, one preview slides a filmstrip of candlelit covers to the hovered essay and trails the hand. Nothing about a draft pretends to open. The section title writes itself once, behind a nib: revelation, as ink.

**Principles:** SYN #5 (the strip slides) · #6 (the pointer drives the art; the chip is separate) · #3 · #8 (spectacle earned by interaction) · #10 (the one theme flip) · the counter-principle.

## 2. Benchmark frames (v1, unchanged)
| Frame | Lock | Do NOT copy |
|---|---|---|
| `research/refs/dennis/custom/C-switch-06-t0324.jpg` | One physical strip: the outgoing exits at the top and the incoming enters from below; the title nudges left and the meta right | The "View" circle; pointer cursor; occluding text; opacity dimming |
| `research/refs/dennis/frames/key_preview_enter_switch_leave.png` | The enter → switch → settled → leave grammar | Width growth from 0; covering text |
| `research/refs/obys/custom/g-05-hover-mid.png` | Colour and scale earned by interaction | Hover-gated titles; a lens around the preview |
| `research/baseline/sections/desktop-writing.png` (before) | The frame to beat | The card grid, sparkline thumbs, pulsing DRAFT pills |

## 3. Layout and state machine
- **The plane:** `SectionFrame` `tone="paper"`, `world="hp"`. The dome seam rises in `--paper` over the preceding hp canvas (the one theme flip). No candle sprites or motes in this section (one warm family: parchment).
- **The h2:**
  - FLAG-1 default: the h2 in `meta` ("WRITING") plus a `body` intro.
  - Alternative: a `chapter` h2 with an amended style budget.
  - **Nib-write (HP-05):** the real h2 text is in the DOM from first paint. Under `html.motion-ok` only, a mask reveals it behind a moving nib point (a 3 px `--paper-fg` dot) along the baseline, over 1.4 s, once, when ≥ 50% in view. No script font.
- **Rows (v1 anatomy):** Meta `01 • METHODOLOGY • DRAFT` (`--paper-muted`) → title (`title`, `--paper-fg`) → angle (`body`, `--paper-muted`); no rules between rows.
- **Preview (filmstrip mode):**
  - a fixed `pointer-events:none` node, z 10, `--radius-frame`, holding the W-art strip keyed by post id
  - the chip is Meta "Draft" in `--paper-fg` on `--paper-s2`
  - W-art is candlelit (warm), shown **at full strength** with no scrim

| State | Driver | Spec |
|---|---|---|
| E0 first paint | — | SSR final: every title, angle and DRAFT visible on parchment; the preview is not mounted |
| E1 entry | R1 once | Titles masked-rise; Meta and angle fade; **the h2 nib-writes** |
| R rest | — | Titles `--paper-fg`; Meta and angles `--paper-muted`; **0 accent marks** |
| H1 enter | pointer enters the `<ol>` | Springs set to the target (no fly-in); the strip jumps to i; opacity in on `dur.preview`; row i nudges ±`space-3`; the others turn `--paper-ghost` **by colour** |
| H2 track | pointer | The preview on `springFollow`; the chip on `springNav` |
| H3 switch | row j | The strip `y: −j × 100%` on `dur.reveal`; interruptible |
| H4 settled / H5 scroll-under / H6 leave / F focus (published only) | v1 | v1 |

## 4. Reduced motion · 390 · no JS · Save-Data (v1, plus the paper)
- **RM:** inline mode; no nib animation (the text is present); instant mono → colour.
- **390:** one column; art inline at 3:2; tap does nothing; no preview node.
- **No JS:** inline, with the text and DRAFTs.
- **Save-Data:** inline, mono, the smallest srcset.
- **Art missing:** no empty rectangle; the type-only index (the default if W is not approved, F-4).

## 5. Keyboard · focus · ARIA (v1)
- `<section id="writing">` → `h2` → `<ol role="list">`.
- **Draft rows have 0 focusables.** The preview and chip are `aria-hidden`.
- A published row gets one `<a>`; its focus ring uses `--paper-accent` `#115e59` (5.78:1, ≥ 3 ✔).

## 6. HARD pass/fail checks
| # | Pass iff |
|---|---|
| W1 | SSR truth: all `writing.length` titles, angles and tags are byte-equal to `content.ts`, plus one DRAFT per draft row, with no `opacity:0`/blur |
| W2 | Drafts are not links: 0 focusables in draft rows; the Tab walk has 0 stops in `#writing ol`; clicks change nothing |
| W3 | DRAFT is visible at rest in each row's Meta at ≥ 4.5:1 on `--paper` (`--paper-muted` 6.79) |
| W4 | Ghost by colour: non-active rows have opacity 1 and colour = `--paper-ghost` (5.04 on `#ebe0c6`) |
| W5 | The preview and chip intersect no text rect |
| W6 | Slide, not fade (v1 thresholds) |
| W7 | No fly-in |
| W8 | The layers separate (the chip leads) |
| W9 | Interruptible, with no stuck state |
| W10 | Gap stability |
| W11 | Scroll under the pointer re-hit-tests |
| W12 | **Accent law on paper:** at rest, 0 `--paper-accent` marks and **0 `#2dd4bf`** in `#writing` (aqua is never used on paper); ember and amber = 0 in every state |
| W13 | ≤ 3 styles per viewport; min ≥ 13 px; the `h3` is Newsreader at the `title` clamp; Meta is Geist Mono |
| W14 | CLS = 0; the height at DCL = after hydration + 2 s |
| W15 | 390 and 320: no overflow; no preview node; the art has a reserved ratio |
| W16 | RM: the first frame is final; hover frames identical; 0 animations |
| W17 | Idle is static |
| W18 | Save-Data: no strip; 0 colour requests |
| W19 | Media honesty: `data-post-id` matches; no duplicate MediaIds; `alt=""`; covers show no chart, numbers, people, text, flags, letters, seals or characters |
| W20 | Every strip image is decoded before the first hover |
| **W21** (v2) | **The paper AA table** (computed from the tokens): fg 11.69, muted 6.79, ghost 5.04, accent 5.78, kill 5.01, exception 5.43, all ≥ 4.5; surface-1 and surface-2 pass likewise (DESIGN §1.3.2) |
| **W22** (v2) | **Nib-write fidelity:** the h2 text node is present and unmasked in the SSR and no-JS frames; the mask completes within 1.4 s + 100 ms; under RM 0 masks run. The nib is a 3 px dot, not a quill or pen graphic |
| **W23** (v3) | **One warm family:** 0 canvas, 0 flame, fire or sun sprites, 0 candles in `#writing`; the paper is the warm family |
| **W24** (v3) | The dome seam into `#writing` fills with the previous section's `--bg` (`--rd-canvas` after `beyond`; `--hp-canvas` under option B), and the paper rises beneath it; the reverse holds at the exit |
| **W25** (v3) | Legal and honesty: the vignettes are code (no generated sketches near the Drawing claim; Aryan's own sketches only as `authentic`); no portraits or figures in any vignette (H1); no journal scans or game fonts (H2); "The kill-list" vignette's X is graphite, never ember |

## 7. Capture plan (v1)
- **Contexts:** A 1440 fine (A1–A12), B 1024, C 390/320, D RM, E NJ, F SD, G fixtures.
- **Plus:** the nib-write sequence at 0/350/700/1050/1400 ms (W22), and the seam frames (W24).

## 8. Adaptability (v1, plus v2)
- Data only (`writing[]`, art by stable post id); the v1 fixture matrix, **plus** tones `paper` × worlds `hp`/`idiots` (moving Writing to Act II keeps paper; `--paper-*` inks are world-independent) and `W none` (the type-only index).
- The `index` route loader: see `loaders.BAR.md` L15.

## 9. Honesty (v1)
- Verbatim text; no invented bodies, dates or read counts.
- Drafts never look like links; the status sits with the claim.
- "The kill-list" essay gets no ember.
- The covers are decorative, labelled `higgsfield`, and never experiences. (v3: the covers are retired; the journal vignettes are code, and only Aryan's own sketches may be `authentic` art.)
