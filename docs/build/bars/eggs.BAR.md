# BAR: Easter eggs — the shared contract (the Marauder's Map, Lumos/Nox, Dead Eye, the Snitch, the Patronus and the rest)
> A new system bar (SPEC v2 §10.3; ICONS §8). BUILD-SPEC 2026-09-28: nothing is built. Egg-specific checks also live in their host bars: Dead Eye → `rdr2-act.BAR.md` §E; the Snitch and the Time-Turner → `films-chapter.BAR.md` F25–F26; the bolt favicon → `intro.BAR.md` I34; the Patronus → `contact-resolution.BAR.md` (v3 deltas).
> **Binding:** SPEC v2 §9.4–§9.6 (aliases, quotes), §10.1 #11 (tiers), §10.2 (icon map), §10.3 (registry and rules), §13–§15. DESIGN v3 §2.1.1 (egg lettering), §6.1 `egg.*`, §8.1 (icon style), §9 (`EggHost` and the egg modules), §10 (eggs). ICONS IC-HP-05/06/09/10/12/13, IC-PC-05, IC-3I-03/08, IC-RD-02.

## 1. Intent
The worlds' best-loved details live where a curious visitor finds them and a hurried one never trips over them: say the oath and the page unfolds as a Marauder's Map of itself; whisper "Nox" and the lights go down; catch a Snitch in the credits; call Dead Eye on the graveyard. Every egg is opt-in (or a single ≤ 4 s flourish), keyboard-reachable, honest about what it shows, and costs nothing when unused.

## 2. The registry (defaults from SPEC §10.3)
| Egg | Trigger | Host | Tier | Default |
|---|---|---|---|---|
| The Marauder's Map (the page's own map; the visitor's own footprints) | palette / typed "I solemnly swear…"; the `404` body; close = "Mischief managed" | overlay dialog | EGG (+ 404) | ON |
| Lumos / Nox | Pause tooltip; palette; typed | header | EGG (alias) | ON |
| Accio `<section>` / Obliviate | palette | global | EGG (alias) | ON |
| The bolt favicon | the intro flight | tab | EGG | ON |
| The Snitch | credits at 60% in view (auto, once) | `credits` | EGG | ON |
| The Patronus | "Expecto patronum" | `contact` | EGG | ON (desktop) |
| The hidden kraken | a long look (in media) | card I→II | EGG | ON |
| Parley | palette | → `#contact` | EGG (alias) | ON |
| The quadcopter lift | Run clears 7/7 | `work` | EGG | ON |
| Aal izz well | palette | current section | EGG | ON |
| Dead Eye | palette / typed `deadeye` | `kill-list` | EGG | ON (desktop) |
| The console line | devtools | console | EGG | ON |
| The owl | inside IN-02 | intro | EGG | only if clean |

## 3. HARD pass/fail checks
| # | Check | Pass iff |
|---|---|---|
| E1 | Off the reading path | With every egg untriggered, the page (DOM, pixels at rest, tab order, headings) is identical to the build with `film.eggs.enabled = false`, except the auto Snitch's resting button in the credits and the Pause tooltip text |
| E2 | Zero cost when unused | Egg modules are lazy chunks loaded on trigger (≤ 6 KB gz each; the Map ≤ 10 KB gz); fixture K ships 0 egg bytes |
| E3 | Keyboard path | Every egg is reachable from the command palette; typed words work only when focus is not in an input, textarea or contenteditable, with a 1.5 s buffer; **no single-key shortcut exists anywhere** (WCAG 2.1.4); "Turn off easter eggs" disables typed triggers and auto-eggs for the session (storage in try/catch) |
| E4 | Aliases keep literal names | The Pause control's accessible name is "Pause motion"/"Resume motion" (label-in-name); the Nox/Lumos text lives only in the tooltip and the palette synonyms; every alias maps to a real, labelled command |
| E5 | Lumos never overrides the OS | With `prefers-reduced-motion: reduce`, "Lumos" does not start any motion; it only undoes the user's own Pause |
| E6 | The Map is real | Rooms = enabled sections, corridors = page order, each wall's microtext = that room's real title; every room is a real link (≥ 44 px, keyboard); dialog semantics (`role=dialog`, labelled, Esc and a close button, focus returns); RM opens it flat; the unfold ≤ 1 s; room labels in IM Fell (mode A); the footprints are the visitor's own visited sections (sessionStorage, try/catch), labelled YOU, never "Aryan was here" |
| E7 | The 404 | The default 404 is the Map with "You've wandered off the map." and "Mischief managed" returning to `#top`; it works with no JS (a static list of room links) |
| E8 | Auto-eggs are short and once | The Snitch dart and any auto flourish ≤ 4 s, once per session; the bolt favicon lasts only the flight |
| E9 | Singletons | No egg starts while another canvas or decoder is active (the Patronus checks the canvas registry; Dead Eye uses the existing media); ≤ 400 Patronus particles, desktop only |
| E10 | Motion safety | RM/Pause: static version or none (the Map flat, Dead Eye static, the Snitch resting, no Patronus with a palette explanation); no flash over thresholds (WCAG 2.3.1) |
| E11 | Toasts | Egg toasts use `role="status"` once or are aria-hidden; they never cover text and auto-dismiss ≤ 4 s |
| E12 | Truth | Every egg carries a site truth or is plainly play: Dead Eye marks only KILLED rows; the Map is the real structure; "Obliviate" really clears `intro-seen`, the Map trail and egg flags; the quadcopter lifts only on a real 7/7 Run; no egg shows a score, meter or claim about Aryan |
| E13 | Quotes | Egg lines (the oath, "Mischief managed", Q-PC-3 in the console, Q-RD-2 in the Dead Eye toast) render through `FilmQuote` (or, in the console, with the attribution in the same string) and appear in `LINES QUOTED` when they render on the page |
| E14 | Hard limits | No egg shows a face, figure, rider, character silhouette (H1), a logo, crest or wordmark replica (H2); the Snitch is a flat gold body with two wing strokes; the stag is our own outline in light; the bolt is 3 segments and never on the name or the logo |
| E15 | Lettering scope | Display faces appear in eggs only as registered `lettering` entries with slot `egg` (DESIGN v3 §2.1.1) |

## 4. Capture plan
- **`/lab/eggs`:** each egg triggered by palette and by typed word (where applicable) at D and M, under R and Pause, with "Turn off easter eggs" on and off; the 404 with JS on/off; fixture K.
- **Logs:** network (lazy chunks), the canvas and decoder registries, `document.activeElement` through the Map dialog, keydown handlers (to prove no single-key shortcuts), sessionStorage writes.
- **Critics:** delight without kitsch (the admissions-reader test) · a11y (keyboard, RM, WCAG 2.1.4) · honesty (truth, quotes, no metering).

## 5. Adaptability
- `film.eggs.list` is data; an egg whose `host` section is disabled is dropped with a warning; removing a world removes its eggs (fixture I: no Dead Eye); the prologue disabled (fixture H) drops the bolt favicon and the credits' HP bookend eggs.

## 6. FLAGS
F1 the typed-word buffer (1.5 s) · F2 the Map's unfold choreography (3 panels) · F3 the Snitch's dart path · F4 whether the Patronus ships on mid-range desktops (`hardwareConcurrency ≥ 8`?) · F5 which 404 alternate ships (R-5).
