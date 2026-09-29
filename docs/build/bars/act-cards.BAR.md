# BAR: Act cards — derived world transitions, title cards and loading-reel interstitials
> A new signature system (SPEC §3, §8.2, §9.2–§9.4, SM-3). It covers **every** derived card: `opening`, `reel` (generic), `title` (same-world act change), and the shared contract of the long cards. **v3 update (SPEC v2):** four acts → four cards (`act-1` opening, `act-2` seam, **`act-3` tintype** (rdr2, reel-class, 0 travel), `act-4` ignite); act titles are set in each world's **lettering**; card III carries a **TIP** instead of an epigraph; card IV's epigraph is a film line (`epigraph` rendition). Choreography bars: `noise-order-seam.BAR.md` (Card I→II), **`rdr2-act.BAR.md` §A (Card II→III)**, `ignite.BAR.md` (Card III→IV). All must also pass C1–C28 here.
> **Binding:** SPEC §2, §3, §8.2, §9.2–§9.5, §12.3–§12.6. DESIGN v2 §3.3 (card geometry), §5.2 (dome suppression), §6.3 (the card rows), §6.4 (budgets), §8 (card labels), §10. `loaders.BAR.md` L1–L10.

## 1. Intent
Wherever the page changes film, it stops for one breath on a letterboxed card. The card looks like a themed loading screen (act label, reel mark, the incoming world's instrument, a progress line and the act title), but it is driven by the reader's own scroll. It never waits, never pins beyond budget, and never claims to load. The cards come from data: move a section and the right card appears in the right place.

**Principles:** SYN #10 (chapters change the sense of place) · #4 (one primitive: every card is the same grammar) · #6 (one driver: scroll passage or pinned p) · #3 (colour is attention; the card adds no UI aqua except the Card I→II seam line) · the counter-principle (native scroll).

## 2. Reference frames
| Frame | Lock | Do NOT copy |
|---|---|---|
| `research/refs/lusion/custom/d-pct-025.png` | The ground flips to near-black, the chrome stays quiet, one line of type over one object | 86 px uppercase; glow halo; the long descent |
| `research/refs/igloo/custom/journey/j202-project-click-1s.png` | The place change is carried by **ground tone**, then the text arrives as a readable column | The frost shader; click-gating; HUD corners |
| `research/refs/lusion/custom/d-morph-1350-a.png` | The frame's geometry is a pure function of scroll | Auto-scroll assist; the `+` rows |

## 3. Derivation and anatomy
**Insertion** (`lib/sections.ts`): one card before the first section of each act run.
- `kind` = `opening` for act 1; else `transitions["<prevNonHouseWorld>><actWorld>"]`; else `title` if the worlds are equal; else `reel`.
- `long` = `longCards.includes(key)` and intensity is `full`.
- The `house` world is transparent to the transition key.
- `id` = `act-<n>`.

**Anatomy (≥ 640 px):**

| Zone | Content | Type |
|---|---|---|
| Ground | The incoming world's `deep`; **the ground is the bars** (no bar elements) | — |
| Frame | 2.39:1 (602.5 × 1440 at 1440×900; 148.7 px bars, CALC): the transition choreography plus the incoming world's loader motif (`card` size) | — |
| Upper bar | Meta: `ACT III • AFTER RED DEAD REDEMPTION 2` (left), the reel mark `III / IV` (right). `opening`: `IN FOUR ACTS` | `meta` |
| Lower bar | `h2` act title in the world's lettering (Newsreader fallback); ≤ 1 line: an epigraph (`lead` or `epigraph`) **or** a TIP (Meta `TIP` + `lead`); the **progress line** (the loader's own progress element, spanning ≤ 40% of the lower bar) | lettering/`title`, `lead`/`epigraph` |
| SR | `summary` (visible `small` in RM/NJ; sr-only otherwise) | `small` |

**Variants:**

| Kind | Driver | Travel | Frame content |
|---|---|---|---|
| `opening` | Passage p (no pin) | 0 | The program: `h2` + `<ol>` of rows (act title `heading` + Meta credit; the Intermission row) joined by the LD-PC course; the needle settles on row I at p = 1 |
| `reel` (generic) | Passage p | 0 | The incoming `cardStill` fades in at p = .5 (`dur.preview`) under the incoming loader motif; progress = p |
| `title` | R1 once | 0 | The act title rises; the motif is static-complete |
| `seam` (I→II) | Pinned p | ≤ 60vh | See `noise-order-seam.BAR.md` |
| **`tintype`** (II→III, v3) | Passage p (no pin) | **0** | The warm point sinks into a low sun, the graphite trail draws, the tintype develops into MV-10; title THE FRONTIER + TIP. See `rdr2-act.BAR.md` §A |
| `ignite` (III→IV; II→III when rdr2 is disabled) | Pinned p | ≤ 60vh | See `ignite.BAR.md` |

## 4. State machine (shared)
| State | Driver | What is true |
|---|---|---|
| pre | — | SSR: the static-complete composition (motif `complete`, the title shown) is the no-JS truth. Hiding happens only under `html.motion-ok` |
| entry | R2 | The previous section's tone ends at the card top. **No dome seam** on either side of a card (the card owns the place change) |
| mid | p (passage or pinned) | Motif progress = p (direct `useTransform`); captions swap by state (`dur.base`), never scrubbed |
| settled | p = 1 | Motif `complete` (the needle settle, the gauge circle, the points lit) |
| reverse | p ↓ | Everything reverses by position. `complete` flourishes (the flash, the circle) do not replay until p < .9, then p = 1 again |

## 5. Reduced motion · mobile · no-JS · Save-Data
| Condition | Behaviour |
|---|---|
| RM / Pause | **A static title card:** letterbox (≥ 640), Meta labels, act title, epigraph, the motif `complete`, the `summary` visible; 0 spacer |
| < 640 / coarse | Letterbox off; a stacked static card (Meta → title → epigraph → motif at `mini`/`card` size); 0 travel. The long cards use their static composition (D-5), with the R1 entry allowed |
| No JS | The SSR static composition; anchors work |
| Save-Data | The static composition; `cardStill` at the smallest srcset |

## 6. Keyboard · focus · ARIA
- `<section id="act-n" aria-labelledby="act-n-title">` with an `h2` (the act title). Visually the h2 sits in the lower bar.
- **0 tab stops** in `reel`, `title`, `seam`, `tintype` and `ignite`. The `opening` card has one tab stop per row (real anchors to `#act-n` and `#films`), each ≥ 44 px.
- Lettered titles: `<h2 id><span class="sr-only">The Frontier</span><svg aria-hidden="true">…</svg></h2>` (mode B) or real text in the self-hosted face (mode A).
- No `aria-live`, no `role="status"`, and never the word "loading".
- The menu and palette list cards as group headers (they are anchors).

## 7. HARD pass/fail checks
| # | Check | Pass iff |
|---|---|---|
| C1 | Derived insertion | Default manifest: exactly **4** cards (`act-1` opening, `act-2` seam, `act-3` tintype, `act-4` ignite), in that order, before `about`, `work`, `beyond` and `principles` |
| C2 | Transparent house | `films` (house) sits between `kill-list` and `beyond`, yet `act-3.kind === "tintype"` (key `idiots>rdr2`). **Fixture I** (rdr2 removed): 3 cards and `act-3.kind === "ignite"` (key `idiots>hp`), exactly v1 |
| C3 | Fixture B (`systems` → act-4) | Cards unchanged in count; `systems` renders after the ignite card with an hp world; the header label for `systems` = `ACT IV • THE LIGHT` |
| C4 | Fixture C (acts HP → RDR2 → 3I → Pirates) | 4 cards; kinds `opening`, `reel`, `reel`, `reel` (no authored pairs) and 3 validator warnings; numerals re-derive to I–IV in the new order |
| C5 | Fixture D (`film.enabled=false`) | 0 cards; no `#act-*` anchors; the menu is ungrouped |
| C6 | Fixture G (intensity `grade`) | The long cards render as static title cards with 0 travel |
| C7 | Letterbox geometry | At 1440×900 the frame height = 602.5 ± 1 px and the bars are 148.7 ± 1 px. At 1024×768 the frame = 428 ± 1 px. Below 640, no letterbox |
| C8 | Type | ≤ 3 styles in every card viewport ({meta, lettering or title, lead or epigraph}; the opening card: {title, heading, meta}, **no display face**); ≥ 13 px; ≤ 1 display face per card |
| C9 | Naming (v3) | The work title in a card's upper bar is exactly the incoming work's, in the Meta credit, in house type (opening: every enabled act's). The `h2` is the act title (the page's own words), never a work title; no work title is set in a display face |
| C10 | Aqua | 0 DOM aqua marks in any card at rest. The only exception is Card I→II's seam line for .1 < p < .9 |
| C11 | Never "loading" | The text content of every card, lower-cased, does not contain "loading", "%", "please wait"; 0 `role=status` in cards |
| C12 | Progress honesty | The motif progress = p ± 0.01 at p ∈ {0, .25, .5, .75, 1}, with p computed from the card's geometry (passage, or pinned range) |
| C13 | Native scroll | No `overflow:hidden` on html/body; no scroll-snap. A 300 px wheel moves `scrollY` by 300 ± 2. A 3 s park changes nothing |
| C14 | Travel budget | `reel`, `title`, **`tintype`** and `opening`: section height − content height = 0 (no spacer). Long cards (seam, ignite): ≤ 0.60 × innerHeight, only at ≥ 1024 and `(pointer:fine)`; else 0. Page total ≤ 150vh (desktop) and 0 (< 640) |
| C15 | No dome next to cards | 0 `Seam` elements adjacent to any card |
| C16 | Reverse fidelity | p = .5 reached from above vs from below: pixel diff ≤ 0.5% of the frame |
| C17 | Static composition | RM, NJ and M frames: the motif is `complete`, the title and epigraph are visible, the `summary` is visible, and there are 0 video or canvas requests |
| C18 | Contrast | All card text ≥ 4.5:1 on the world `deep` (DESIGN §1.3.1: ink ≥ 16.76, stone ≥ 8.85, muted ≥ 5.73) |
| C19 | CLS | 0 layout shift from any card, including after hydration |
| C20 | Opening card rows | Each row is an `<a href="#act-n">` (plus `#films`), ≥ 44 px. Hovering **and** focusing draws that act's Line vignette. The static state is shown under RM |
| C21 | Opening course | p = 1: the needle is at row I's bearing ± 1°; one moon flash ≤ 0.1% of the viewport; none under RM |
| C22 | Generic reel still | The `reel` shows the incoming world's `cardStill` (a declared reuse); with the asset missing, the motif alone renders on `deep` (no empty rectangle) |
| C23 | Heading order | Each card is an `h2`; the next section's heading is also an `h2` (no skipped levels); one `h1` on the page |
| C24 | Removal | Fixture E (`films` disabled) and F (`journey` disabled): the cards still derive correctly, with 0 console errors and no orphan anchors |
| **C25** (v3) | Lettering scope and fallback | Only card `h2`s (and the Journey cartouche) use display faces; fixture L (lettering missing) renders every act title in Newsreader with 0 layout shift; outlined SVGs ≤ 3 KB; no TTF/OTF of a personal-use face is tracked |
| **C26** (v3) | TIP honesty | Card III's TIP is a `confirmed` `content.ts` string (tip #2) or a registered `proposed` edit; it is never a film/game line and never inside `role="status"`; the word "loading" never appears |
| **C27** (v3) | Card IV epigraph | The Q-HP-3 excerpt renders through `FilmQuote` (`epigraph`, attribution in the credits' `LINES QUOTED`), fits one line at 1440 and 1024, and is marked as an excerpt (leading ellipsis) |
| **C28** (v3) | Four-act derivations | Reel marks are `n / 4`; the opening card lists I, II, Intermission, III, IV; the header labels are `ACT III • THE FRONTIER` and `ACT IV • THE LIGHT` |

## 8. Capture plan
- **Routes:** `/lab/cards?fixture=A|B|C|D|E|F|G`, then `/`.
- **Per card and width** (D, T, M), at p ∈ {0, .25, .5, .75, 1} via exact `scrollTo`, plus reverse-mid, RM, NJ and SD.
- **Logs:** DOM (cards, kinds, ids), text scan (C11), styles (C8, C10), geometry (C7, C14), CLS.
- **Critics:** fidelity (a quiet cinema breath, not a theme park) · craft (DESIGN §11.5) · honesty and a11y.

## 9. Honesty and legal
- Cards name works in Meta, in house type. Act titles are `proposed` copy (production needs sign-off); their lettering is our own outline or an OFL face (SPEC §9.7), never a logo replica.
- Card I→II's epigraph is `confirmed` REPO copy; Card II→III's TIP is Aryan's own rule; Card III→IV's epigraph is an attributed film line (`proposed`).
- There are no loglines unless Aryan writes them (`draft` → never in production).
- `cardStill` media are generated, decorative and check-L2-signed (no people, riders or marks).
