# BAR: Intermission "Three films and a game" + the closing credits
> A new signature moment and credits bar (SPEC SM-9, SM-13, §9.4, §9.6; FC-01, FC-02, CR-01). BUILD-SPEC 2026-09-28. **v3 update (SPEC v2):** four screens (Pirates, 3 Idiots, **Red Dead Redemption 2**, Harry Potter) in act order, each with one attributed line from its work; the HP screen's warm point now hands off to **Card II→III (the tintype)**; the credits add `LINES QUOTED`, the verbatim **fan-tribute line (H3)**, the Snitch egg, the Time-Turner and the last line **"Mischief managed."**
> **Binding:** SPEC v2 §2 (why the intermission), SM-9, SM-13, §9.4 (naming and quoting), §9.6 (copy statuses, the quote registry, the DRAFT policy), §10.2–§10.3 (icons, eggs), §15. DESIGN v3 §2.3 (work titles, quote captions), §8 (labels), §8.1 (icon style), §11.5–§11.6. MEDIA-PLAN v2 F-PC, F-3I, F-RD, F-HP. `loaders.BAR.md` (the HP finale reuses LD-HP `complete`; the RDR finale reuses LD-RD `complete`).

## 1. Intent
Mid-page, after the graveyard, the house lights come up for an intermission. Aryan names the three films and the game this page is lit by, shows each world in one still (the Pearl at anchor, the lake and the yellow scooter, a dusk ridge with a riderless horse, floating candles over inked paper), quotes one line from each with its attribution, and says in plain facts what the page borrowed. His own reasons appear only in his own words, once he writes them; until then each screen ships "silent", which is still honest and still complete. The last screen leaves one warm point on the Line, which sinks into the next card's low sun. At the very end, the credits roll by native scroll, say who made what and what was quoted, carry the fan-tribute line, and close on "Mischief managed."

**Principles:** SYN #1 (one object per screen) · #3 (colour is attention; the films' warmth stays inside the stills) · #5 (continuity: the HP finale hands off to the ignite) · honesty as design.

## 2. Reference
| Source | Lock | Do NOT copy |
|---|---|---|
| `concepts/screening-room.md` §6–§7 (the Triple Feature; end credits) | One screen per film, a title and a note; a native-scroll credits roll with role/name rows; "silent reel" when the note is a draft | Time-driven 8 s clips in a sticky stage; ghostwritten lesson titles; "GRADED AFTER" |
| `concepts/three-crafts.md` §7 | Derived "Seen here in" links; the three-column legend as the settled/mobile state | The lumos traverse; the compass rose hunting at titles in chrome |

## 3. Structure and state machine
- `<section id="films" aria-labelledby="films-title">` (`world: house`, tone `deep`). Meta `INTERMISSION`, then `h2#films-title` "Three films and a game" (`title`, proposed; words derived from `worksInUse`), then one `lead` (proposed).
- **Four `<article>` screens in act order** (derived from `film.acts` × `worlds`). Each has:
  - a `MediaFrame` 2.39:1 still (F-PC, F-3I, F-RD or F-HP; 3:2 crop below 640)
  - Meta `ACT <n> • <VERB> • <years>`
  - `h3` = the work title (Newsreader `title`, roman, as written; never a display face)
  - **the line** (v3): one `FilmQuote` in the `caption` rendition (a second Meta block, attribution inline): Q-PC-2 · Q-3I-1 · Q-RD-1 · Q-HP-4
  - `borrowed` (`body`, proposed site fact)
  - **Seen here in:** Meta label plus ≤ 3 section links, plus the act link (derived)
  - `reason`: rendered **only** if `status === "confirmed"`, as a `body` paragraph. In dev and preview, a draft renders with a visible `DRAFT` Meta chip
  - one code **finale** SVG overlay (aria-hidden)

| State | Driver | Spec |
|---|---|---|
| pre | SSR | All text final; stills (posters); finales in their **final** state for no-JS |
| entry (per screen) | R1, once, ≥ 50% in view | The frame clip `inset(8% round var(--radius-frame))` → `inset(0)` on `easeClip`/`dur.hero` |
| finale | state, once, after entry | **Pirates:** Jack's compass 120 px, the red arrow hunts then settles on `bearingOf(nextAct)` (`springNeedle`), with a brass course line drawn to the frame edge (`easeDraw`). **3 Idiots:** a blueprint draw-on of the 7 gates from `gauntlet[]` (strokes only; `dur.draw.long`), then one chalk circle on the last gate (`dur.draw.short`). **RDR2 (v3):** LD-RD `complete`: a graphite trail across hachures to a campfire point that kindles (≤ 12 sprites). **HP:** LD-HP `complete`: the ink Line draws while a cool light travels it (1.4 s), ending with **one warm point at the Line's start** (the handoff to Card II→III's low sun) |
| settled | — | Static; no loops; 0 travel |

**Credits (`<footer id="credits">`, house, deep):**
- Rows are derived and factual (SPEC SM-13): role (Meta, left) and name (`body`, right), centred, with `--rule` row hairlines. v3 rows: `WORLDS BORROWED FROM` (four works, act order), **`LINES QUOTED`** (derived from the quotes that render), `ORIGINAL GENERATED IMAGERY`, `BUILT WITH AI ASSISTANCE`, `TYPE` (house faces + the shipped display faces with licences).
- Then **the H3 line** (`small`, verbatim): "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games." and the two proposed sentences; `footerLine` (verbatim); "To be continued." (proposed); ↑ Back to the opening (`#top`, with the Time-Turner icon); and **the last line "Mischief managed."** followed by the 12 px Hallows end mark.
- **The Snitch egg** (IC-HP-12): once per session at 60% in view it darts ≤ 4 s, then rests beside ↑ Back to the opening as a real `<button aria-label="Catch the snitch">`; catching it adds the row `SEEKER — you`.
- Native scroll; R1 rises only.

## 4. Reduced motion · mobile · no-JS · Save-Data
- **RM / Pause / NJ:** stills plus finales in their final state; 0 animation; 0 canvas.
- **< 640:** letterbox off (3:2 crops); stacked articles; the finales static and final; links full-width rows ≥ 44 px.
- **Save-Data:** the smallest stills; finales static.
- **Credits:** identical everywhere (text).

## 5. Keyboard · focus · ARIA
- Heading order h2 → h3 × 4. Tab stops: only the "Seen here in" links (each ≥ 44 px, a real anchor), ↑ Back to the opening and (in the credits) the Snitch button.
- Stills `alt=""`; finales `aria-hidden`. The 3 Idiots finale's meaning is carried by a visually-hidden `<ol>` of `gauntlet[].title` in the article (a text equivalent).
- The credits are a `<footer>` landmark with a `<dl>` of role/name pairs.

## 6. HARD pass/fail checks
| # | Check | Pass iff |
|---|---|---|
| F1 | Placement | `films` renders between `kill-list` and the `act-3` card (the tintype); it is ≥ 40% and ≤ 60% down the default page height at 1440 |
| F2 | Order and derivation | The article order equals the act order. Disabling a film's act removes its screen, its credit row and its prologue and opening mentions (fixture) |
| F3 | Naming and quoting (v3) | Work titles render in house type only (the `h3` in Newsreader, Meta credits); 0 in a display face; 0 in `<title>`/meta/OG. Every line renders through `FilmQuote` with its attribution; the line is a Meta caption, never beside a metric; the quote lint is green |
| F4 | DRAFT gate (prod) | A production build with any `reason.status === "draft"` renders **no** reason text for that film; the validator exits non-zero only if a draft *would* render; the screen still shows title, verb, borrowed and links (a silent reel) |
| F5 | DRAFT visibility (dev) | Dev and preview: each draft reason shows a visible `DRAFT` chip and the prompt text in brackets. **0 sample sentences** (the text starts with `[DRAFT —`) |
| F6 | Proposed gate | A production build with `copySignedOff=false` fails while any proposed string (h2, lead, borrowed, credits) would render |
| F7 | No ghostwriting | Draft fields contain only prompts. There are no quotations, aphorisms or first-person claims (reviewed by critic 3) |
| F8 | Seen-here-in truth | Every link target's `worldOf` equals the film's world; ≤ 3 section links plus 1 act link; every href resolves |
| F9 | Pirates finale is derived | The needle's final bearing = `bearingOf(index(nextAct))` ± 1°. Reordering acts changes it |
| F10 | 3 Idiots finale is true | The drawn gate count = `gauntlet.length`; the visually-hidden list equals `gauntlet[].title` in order; exactly one chalk circle |
| F11 | HP handoff | The final HP screen state contains exactly one warm point at `LINE_D` length 0; Card II→III starts with that point and sinks it into the low sun (G-check in `rdr2-act.BAR.md` A3). With the rdr2 act disabled, the ignite card takes it as point 0 (v1) |
| F12 | One world per viewport | At 1440×900, the centre-line screen is the only screen with > 50% of its still in the viewport |
| F13 | No time-driven media | 0 `<video>` in the section; 0 sticky stage; section height = content height |
| F14 | Law 1 | The finales use no DOM glow (the HP light is a sprite `<img>`); aqua marks = 0 at rest |
| F15 | Type | ≤ 3 styles per viewport ({meta, title, body}; the quote line is Meta; the lead only in the intro viewport, which has no body) |
| F16 | Contrast | All text ≥ 4.5:1 on `--color-deep` |
| F17 | Credits honesty | `ORIGINAL GENERATED IMAGERY` lists the models found in the `lib/media.ts` provenance of *accepted* Higgsfield assets (derived, no literals). The AI-assistance row is present. **The H3 string is present byte-for-byte.** `LINES QUOTED` lists exactly the registry entries that render on the page (work, year, speaker), incl. every `attribution: "credits"` quote |
| F18 | "Graded" ban | 0 occurrences of "grade", "graded" or "grades" in the credits and films text |
| F19 | Years | The years match `WorldSpec.film.years`, and the ledger records the verification date before production |
| F20 | Legal (v3: hard limits + L2) | F-PC, F-3I, F-RD and F-HP **check L2** signed (Claude and Aryan). **H1:** no crew on the Pearl, no people at the lake, no rider on the horse, no person at the desk. **H2:** no flag marking or hull lettering, no scooter badge or plate, no tack logo, no letters or map in the ink. Each is our composition, not a remake of a film or game frame |
| F21 | Credits as footer | Exactly one `contentinfo` landmark; ↑ Back to the opening goes to `#top` (it does not re-arm the intro) |
| F22 | CLS / reflow | 0 layout shift; no overflow at 320, 390, 1024 or 1440 |
| **F23** (v3) | Quotes are not reasons | The line and the reason never share a block; the line never reads as Aryan's words (it carries its speaker and work); Q-HP-4 and Q-RD-1 never sit within one viewport of SOS Foundation or family content (H4) |
| **F24** (v3) | The bookend | The credits' last text node is "Mischief managed." (unless R-3 decides otherwise) and appears only when the prologue is enabled (fixture H drops it); the Hallows end mark is aria-hidden and appears once on the page |
| **F25** (v3) | The Snitch | Auto-dart ≤ 4 s, once per session, transform only; under RM/Pause it only rests; it never covers text or follows the cursor; it is catchable by keyboard; catching it adds exactly one `SEEKER — you` row and no score |
| **F26** (v3) | Time-Turner | The link text stays literal; the icon is aria-hidden; it turns 3× in 600 ms on activation (none under RM); the link goes to `#top` and does not re-arm the intro |

## 7. Capture plan
- **`/lab/films`:** fixtures default, one-work-disabled (incl. fixture I: no rdr2 → "Three films"), all-reasons-confirmed and all-drafts. Built in both **dev and a production build** (F4–F6).
- **Frames:** each screen at pre, entry, finale-mid and settled, at D, T, M, RM and NJ. Credits at D and M.
- **Logs:** text scan (F3, F18), the validator's output, link resolution.
- **Critics:** personal, not a fan page (fidelity) · kitsch/legal · honesty (drafts, credits).

## 8. Adaptability
- Everything is derived from `film.acts`, `film.worlds` and `sections.ts` (`seenHereIn`, `bearingOf`). The component contains 0 film literals (grep).
- Adding a work adds a screen automatically (that is how RDR2 entered). The validator caps worlds at **4** (SPEC v2 §12.5).

## 9. Honesty and legal
- The reasons are Aryan's or absent. The borrowed lines state facts about this page only.
- The works are named openly, their lines are quoted verbatim with attribution, and the credits disclose the generated imagery, the AI assistance, the quoted lines and the fan-tribute non-affiliation.
- The stills are **our own recreations** of each world's icons (the Pearl, the scooter at the lake, the frontier, the floating candles), never stills, screenshots or logos (H2), with no person, rider or face (H1).
