# ICONS — the icon catalog under the Iconic Override
### Four worlds: Harry Potter · Pirates of the Caribbean · 3 Idiots · Red Dead Redemption 2 · v1, 2026-09-28

> Aryan's direction: *"you can copy what we need — it's a personal website, not commercial use."* This file turns that into a working catalog. It lists the real iconography of the four worlds that now **may** appear on the site, how we recreate each piece ourselves, where it lands, how loud it is, and how it stays crafted instead of theme-park. It also lists the few things that still stay out. Those are the five hard limits in §0.2. They exist to protect Aryan (his likeness risk, his public repo, his honesty system), not to keep the site plain.

**Status:** CATALOG v1. Nothing is built and 0 credits are spent.
**Binding order:** Aryan's newest directions (RDR2 as a fourth world; the iconic override; the five limits) override any conflicting rule in SPEC, DESIGN, MEDIA-PLAN, the bars or Kimi. Everything else in those files still holds.
**Reads with:** `SPEC.md` (structure), `DESIGN.md` v2 (tokens, type, motion), `MEDIA-PLAN.md` (Higgsfield), `bars/*.BAR.md`, Kimi Part V §1.5 and the three movie studies (`kimi/research/blog_movie-*.md` §5), and `personal-website/CLAUDE.md` §2.
**Label key:** VERIFIED (≥ 2 independent sources this session) · COMMUNITY (fan wiki or quote sites only; check in the film or game before shipping) · INFERRED (our judgement) · CALC (computed with `tools/contrast.mjs`'s formula).

---

## 0. The override, as rules

### 0.1 What changed
- **Before:** SPEC Law 4 read "films are named in words, never in their marks". Kimi's list read "evoke, don't copy". Check L asked "could a fan mistake this for a still?", and any yes meant reject.
- **Now:** the real icons are allowed and encouraged where they make the site better. That covers the castle, the Pearl, the compass with its red arrow, the Marauder's Map, the lines, the spells, Dead Eye, WANTED posters and film-evoking display fonts. **We recreate them ourselves** in SVG, CSS, canvas, Higgsfield images and outlined fan lettering. Film and game titles and quotes may appear in copy, act cards, loaders and credits.
- **Unchanged:** research honesty, CLAUDE.md §2, the accessibility and performance contracts, one world per viewport, Law 1 (light lives in media) and the DRAFT policy.

### 0.2 The five hard limits (H1–H5), the only remaining "never"
| # | Limit | Test a critic can run |
|---|---|---|
| **H1** | **No actor faces or likenesses.** No Harry, Hermione, Dumbledore, Jack Sparrow, Barbossa, Rancho, Farhan, Raju, Virus, Arthur, Dutch or John. No recognizable actor. No figure, silhouette or costume-as-person that reads as a character (the Jack tricorn-and-dreadlocks profile; Arthur's hat on a rider). | Every generated asset keeps `accept.people=false`, and every SVG is reviewed for figures. Riderless broom, riderless horse, empty camp, empty deck. |
| **H2** | **No ripped files in the public repo** (github.com/aaasharma870-art/Personal-blog-). That means no film stills, frame grabs, game screenshots or photo-mode shots, no trailers, GIFs or footage, no audio, no official posters, and no logo, wordmark, crest or UI-sprite files, including fonts or icons extracted from game data. **Logo and crest replicas count here too** (a hand-redrawn HP lightning-P wordmark, the Hogwarts crest, the POTC wordmark, the "3 Idiots" logotype, the RDR2 logo, studio marks). A replica *is* the mark, and marks are what brand-protection sweeps look for. | `git ls-files` shows no binary without a `lib/media.ts` provenance row. No personal-use font binary is tracked (§9). `kimi/research/ref-images/` is never in a build path. No film still is ever passed to Higgsfield as `image_references`. |
| **H3** | **Credits line:** "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games." | Present in `credits`, verbatim (§10). |
| **H4** | **Research honesty is untouched.** No invented facts about Aryan. The Sharpe-2.0 rule, `SYNTHETIC • ILLUSTRATIVE` labels, caveats adjacent to claims and drafts-not-links all hold, and the CLAUDE.md §2 exclusions are absolute. **Any line about why a film or game matters to Aryan is DRAFT**, written by Aryan or absent. Quotes are verbatim, verified and attributed, and never presented as Aryan's own words. | The §9.6 status system plus the new quote registry (§0.6). |
| **H5** | **Accessibility and performance contracts stay.** Reduced motion stops all motion, the Pause control works, focus parity, AA contrast, LCP ≤ 2.5 s, one decoder, one canvas, mobile stills, and content is never gated (the intro stays an overlay). | Existing bars plus the egg rules in §8. |

### 0.3 Check L2 (replaces Check L on every generated or drawn asset; Claude and Aryan both sign)
1. **Ours?** Made from a text-only prompt, or drawn or coded by us. It is never traced, and no still, screenshot or fan art was passed as a reference.
2. **No faces?** No person, face, hands or character silhouette (H1).
3. **No marks?** No legible logo, wordmark, crest, studio mark, HUD or UI replica, and no legible text at all in generated media (models garble text anyway).
4. **Subject, not the shot?** We recreate the *subject* (the castle, the Pearl, the frontier) in *our* composition, camera and time of day. We never do a frame-for-frame remake of a famous shot, which is the closest thing to a ripped still.
5. **Crafted?** Does it survive the admissions-reader test (§0.5)?

**Prompt hygiene (practical, INFERRED):** Higgsfield prompts describe the object ("a many-towered gothic castle on a crag above a black lake, lit windows") and never name the franchise ("Hogwarts", "Black Pearl", "Red Dead"). Brand names trigger model IP refusals, which waste credits, and they push models toward literal copies. Prompts also live in public provenance.

**Storage hardening (recommended, not a limit):** keep the most iconic generated plates (the castle, the Pearl, the Great Hall, the frontier) out of git. Serve them from a media bucket (Vercel Blob or R2) referenced by URL in `lib/media.ts`. The repo stays small, and any takedown hits one object, not the repo.

### 0.4 Repo hygiene (how H2 is enforced in code)
- Add `design-src/fonts-personal/` and `kimi/research/ref-images/` to `.gitignore`.
- **CI (in `npm run check`) fails when:**
  - a `.ttf`/`.otf`/`.woff`/`.woff2` is tracked without an `OFL.txt` or `LICENSE` beside it
  - a file in `public/` has no provenance row
  - a `higgsfield` asset lacks `accept.checkL2`
- The `accept` schema becomes `{ people:false, likeness:false, text:false, ripped:false, icon?: "castle"|"pearl"|…, checkL2:"claude:<date>+aryan:<date>" }`.

### 0.5 The taste law (iconic, not theme-park)
- **Three tiers.** Every icon below carries one:
  - **HERO:** a named moment. At most 1 per viewport, and it *is* that viewport's one hero motif (SPEC §10.1).
  - **TEXTURE:** supporting and quiet, within the existing caps.
  - **EGG:** hidden and opt-in, off the reading path. Never required to understand anything, and never runs by itself more than once per session.
- **An icon must carry a site truth.** The compass settles on a real bearing. The chalk circles a real caveat. Dead Eye marks the rows whose verdict really is KILLED. The Marauder's Map is the page's real structure. Pure decoration with no truth is TEXTURE at most.
- **Instrument-grade craft:** correct geometry, restrained palette and real easing. No clip-art, emoji, sparkle trails or custom cursors.
- **One world's icons per viewport.** A Pirates line never sits in an RDR2 viewport. Lines live in their own world's sections.
- **Research data never takes film styling** (fonts, colours or marks). A quote never sits where it could read as a metric's caption.
- **The admissions-reader test:** "Would a teacher who has never seen the film find this charming and well made, or childish?" Anything that fails is DECLINED even when it is allowed.
- **Generic cinema kitsch stays banned.** It isn't these worlds' iconography: "NOW SHOWING", sprockets, clapperboards, ticket stubs, marquee bulbs, popcorn (DESIGN §8 dropped list).

### 0.6 Copy status for film and game lines
- A new `lib/quotes.ts` registry replaces the banned-term lint for quotes. Each entry: `{ id, text (verbatim), work, year, speaker?, verified: "VERIFIED"|"COMMUNITY", excerpt?: true, status: "proposed" }`.
- A quote renders only through `<FilmQuote id>`, which prints the attribution. The lint fails on any string in `film.ts` or UI copy that matches a registry text but isn't rendered through it (so no unattributed quotes).
- Every quote is `proposed` until Aryan signs it off (§9.6).
- **Any sentence that ties a film to Aryan's own life is `draft`.** Examples: "like Arthur, I keep a journal"; pairing his real drone reel with the 3 Idiots quadcopter; a loyalty line beside the SOS Foundation.

---

## 1. Flip table: every former ban and its new verdict
**Legend:**
- **ALLOWED:** use it (see the catalog id)
- **ALLOWED + GUARD:** use it with the stated guard
- **DECLINED:** allowed by the override but not used, for taste
- **OUT:** hits a hard limit (H1–H5)
- **KEEP:** the old rule stays, as taste or hygiene rather than a legal rule

### 1.1 Global rules (SPEC, DESIGN, MEDIA-PLAN)
| Source | Former rule | Verdict |
|---|---|---|
| SPEC §1 Law 4 | Films named in words only: no logos, title typography, stills, props, characters, spell words, catchphrases, dialogue or house colours | **Rewritten:** props, spells, lines, character *names* and fan lettering are ALLOWED. Logos and stills are **OUT** (H2). Character *likeness* is **OUT** (H1). House colours are DECLINED |
| SPEC §5.8 | Plain besom; no castle, towers, lake, owls, wands, crests, riders; lights not candles; Check L | Real-looking broom, castle, Black Lake, candles and owl are ALLOWED (IC-HP-01…04, 17). Riders and crests stay **OUT**. Check L becomes **L2** |
| SPEC §9.4 | Film titles only in an allow-list; never in alt, class names, comments, dialogue, catchphrases, character or spell names | ALLOWED everywhere in copy, alt, code and comments. **KEEP (hygiene):** `<title>`, meta description and the OG image stay name-first with no film names or marks. That is the surface automated brand sweeps crawl, and it keeps screen one Aryan's |
| SPEC §12.5 #7 | Banned-term lint | **Replaced** by the quote registry (§0.6) plus the H2 file checks (§0.4) |
| SPEC §15 #1–#7 | No stills, logos or title type; no people; long object ban list; plain broom; no dialogue; titles allow-list; Check L | #1 stays for stills and logo files, and title type is allowed for *our* words. #2 stays (H1). #3 is flipped per §1.2–1.5. #4 is flipped (IC-HP-04). #5 becomes the registry. #6 becomes the new credits (§10). #7 becomes L2. **#8–#15 are unchanged** (honesty), with RDR2 = 2018 added to #15 |
| DESIGN §2.1 | No novelty, handwriting, "old map", "wizard" or "pirate" fonts | ALLOWED for **act titles, loaders and eggs only** (§9). Name, body, Meta and all research data stay Geist / Geist Mono / Newsreader |
| DESIGN §8 | "No decorative icons, no film icons, no emoji" | Film icons are ALLOWED as world media and eggs. **KEEP:** functional chrome icons stay lucide, and no emoji |
| DESIGN §11.5 | Kitsch list | **KEEP:** compass in chrome, "arr" copy, rope borders, chest icons, doodle/gear/chalk-texture wallpaper, sepia full pages, house-colour sections, light across the name, candle flicker as UI feedback, candles in the Pirates hero. They were taste rules, not legal ones, and they are still right |
| DESIGN §11.6 | Legal DO-NOT list | **Superseded** by §1.2–1.5 |
| MEDIA-PLAN [B] / [E] | "Magic only as light"; "the sea is empty"; long object exclusions | **Rewritten** (§11). New [E2] keeps: people, faces, hands, riders, silhouettes; legible text, logos, crests, HUD; weapons, blood, alcohol, tobacco; recreating a specific film frame or screenshot. Each asset gets explicit *unexclusions* for its icon |

### 1.2 Harry Potter (Kimi movie-hp §5 #1–10; DESIGN §11.6 row)
| Former ban | Verdict |
|---|---|
| HP logo, lightning-P lettering | **OUT** (H2: a replica is the mark) |
| House crests, Hogwarts crest | **OUT** (H2: official marks). Our own AS seal is ALLOWED (IC-HP-14) |
| Hogwarts silhouette, castle, towers | ALLOWED (IC-HP-01, prologue only) |
| Deathly Hallows symbol | ALLOWED + GUARD (IC-HP-11, a 12 px end mark) |
| Snitch | ALLOWED (IC-HP-12, egg) |
| Platform 9¾ sign | ALLOWED, not default (404 alternate, §7) |
| Scar | **OUT** as a mark on a face (H1). The lightning bolt alone is ALLOWED (IC-HP-10) |
| Round glasses, hats, scarves | DECLINED: costume shorthand for a character (H1-adjacent) and house colours |
| Wand | ALLOWED + GUARD: only its tip light is shown (IC-HP-08) |
| Owls | ALLOWED (IC-HP-17, optional) |
| Stag / doe Patronus | ALLOWED: stag as an egg (IC-HP-13) |
| Script / "wizard" fonts, "Harry P" | ALLOWED for eggs and titles via §9; never used to set the title "Harry Potter" |
| Scanning or tracing MinaLima lettering or artwork | **OUT** (H2: derived from their files) |
| Marauder's Map layout | Map *look* ALLOWED on the page's own plan (IC-HP-05). Copying the film's castle plan is DECLINED: our own plan carries truth |
| Prophet masthead | DECLINED (the Writing index is not a newspaper) |
| Letter seal | ALLOWED with our AS monogram (IC-HP-14). The Hogwarts acceptance-letter parody is DECLINED: on an admissions site it reads as begging |
| Spell names as UI copy | ALLOWED as aliases and eggs. Functional labels stay literal (IC-HP-09) |
| Warm-canvas pages | **KEEP:** only the Writing plane (D-4) is parchment |
| House-colour blocking | DECLINED (palette law; research data never takes film colours) |
| Stills, poster crops | **OUT** (H2) |
| "Inspired-by" AI images | ALLOWED under L2 (subject, not the shot) |
| Sound (Hedwig's Theme, wand whoosh) | **OUT** (H2: copyrighted recordings; DESIGN bans audio) |
| Literal candles | ALLOWED (IC-HP-03) |

### 1.3 Pirates of the Caribbean (Kimi movie-pirates §5 #1–8; DESIGN §11.6 row)
| Former ban | Verdict |
|---|---|
| Skull and crossbones / Jolly Roger | ALLOWED + GUARD: only as the Pearl's flag at thumbnail scale. As a UI icon it is DECLINED |
| The ride's talking skull and Disney ride art | **OUT** (H2: someone else's artwork, not the films) |
| Black Pearl silhouette | ALLOWED (IC-PC-01) |
| Flying Dutchman | ALLOWED, not used |
| Character likenesses, the tricorn silhouette | **OUT** (H1) |
| POTC wordmark and logo type | **OUT** (H2). The fan face "Pieces of Eight" is outline-only, for our words (§9) |
| Tracing the Mao Kun art or the compass dial from photos | **OUT** (H2: derived from stills) |
| Our own compass with the red arrow; our own ring chart | ALLOWED (IC-PC-02, IC-PC-10) |
| Stills and screenshots | **OUT** (H2) |
| "arr matey", rope borders, treasure-chest icons, parchment hero | DECLINED (pirate-speak isn't film iconography; kitsch) |
| Kraken, tentacles | ALLOWED + GUARD: a hidden shape under the storm (IC-PC-05) |
| Skeletons | ALLOWED only as the cursed-medallion reveal (IC-PC-04). Skeleton crew *figures* are DECLINED |
| Old-map fonts | ALLOWED for the chart cartouche and eggs (§9) |
| "Name-check only in credits" | Flipped (see §1.1 §9.4) |
| Restraint budget | **KEEP** (§0.5) |

### 1.4 3 Idiots (Kimi movie-3i §5; DESIGN §11.6 row)
| Former ban | Verdict |
|---|---|
| Poster art, frames, stills | **OUT** (H2) |
| Actor likenesses, caricatures, silhouettes | **OUT** (H1) |
| The "3 Idiots" wordmark and logotype; the poster face *Lipstick* (Patrick Griffin, a commercial font) | **OUT** (H2 and licence) |
| Dialogue, catchphrases, character names | ALLOWED: verified and attributed (§5.1) |
| Song lyrics | **OUT** (copyright, and "Give Me Some Sunshine" is tied to the film's suicide storyline) |
| Handwriting and comic fonts | ALLOWED for act titles, loaders and eggs (Kalam, Architects Daughter; §9) |
| Doodle wallpaper, gear-pattern backgrounds, chalkboard-texture images | DECLINED (the board is MV-06 media; chalk is code) |
| Bollywood clip art, stock illustration packs | DECLINED (someone else's asset files; kitsch) |
| The campus (IIM-B stone and colonnades) | ALLOWED + GUARD (IC-3I-09, no signage) |
| The scooter | ALLOWED (IC-3I-10, as the one amber) |
| The drone or quadcopter | ALLOWED + GUARD (IC-3I-08: sensitive context) |
| The mountain-lake finale | ALLOWED (IC-3I-10) |
| Marks, grades, rank lists | **OUT** (H4 / CLAUDE §2 sensitivity: it reads as Aryan's grades) |
| "Diagrams must be truthful" | **KEEP** (H4) |
| No overshoot on anything clickable | **KEEP** (H5) |

### 1.5 Red Dead Redemption 2 (no prior list; new)
| Item | Verdict |
|---|---|
| Arthur, Dutch, John, any gang member's face or figure, or a rider on a horse | **OUT** (H1) |
| Game screenshots, photo-mode shots, extracted UI icons or sprites, the "Redemption" logo font, the RDR2 logo | **OUT** (H2) |
| The score and songs ("That's the Way It Is", "Unshaken") | **OUT** (H2) |
| Guns, revolvers, reticles, bullets, blood, bounty-hunting *people*, robberies, alcohol and tobacco (Dead Eye refills), poker | DECLINED (the game is M-rated and the audience is admissions). Dead Eye is recreated **without** a weapon (IC-RD-02) |
| Arthur's illness and death, the sunset-ride ending, grave imagery | DECLINED (morbid; spoilers) |
| Journal portraits of gang members | **OUT** (H1). Journal sketches are landscapes, animals and objects only |
| Weapon wheel as a palette, saloon-door transitions, bullet holes, "yee-haw", revolver cursor | DECLINED (theme-park) |

---

## 2. Where Red Dead Redemption 2 lives (a proposal; the SPEC owner decides)
**Option A (recommended): Act III "The Reckoning" = `kill-list` + `beyond`.** Harry Potter becomes Act IV "The Light": `principles`, `writing`, `voices`, `contact`.
- **Why the kill-list:** Dead Eye's red X marks *are* the site's ember semantics (ember = killed). WANTED posters are exactly "hunting down my own ideas". The camp ledger *is* the section type `ledger`.
- **Why `beyond`:** CLAUDE.md §9–§12 are true facts that fit Arthur's journal:
  - cross-country miles (the trail)
  - leadership and community (the camp)
  - the Creative note: drawing and sketching, keeps a sketchbook, photography, drone videography. **Aryan's own scanned sketches** can fill the journal pages, as authentic media.
- **The day passes:** HP night prologue → Pirates night sea → 3 Idiots first light → RDR2 dusk → HP candlelit night. The page cools, brightens, then warms as it ends, one day in four worlds.
- **The Line's materials:** brass course (sea) → blueprint (workshop) → graphite pencil trail (frontier journal) → ink that kindles into light (HP).
- **Transitions:**
  - `"idiots>rdr": "deadeye"`: a short card, not long.
  - `"rdr>hp": "ignite"`: long #2 is unchanged. The campfire's embers rise and become the Line's first warm point.
  - `longCards` stays at 2 (`pirates>idiots`, `rdr>hp`).
- **Validator:** ≤ 4 film worlds and ≤ 4 major world changes (flight, seam, deadeye, ignite). Signature cap 5 is unchanged. The 3I-07 grid now ends at `systems`.
- **World tokens (proposed, INFERRED hexes, CALC ratios):**
  - `rdr` canvas / raised / deep: `#14100c` / `#1c1711` / `#090705`. On canvas: ink 16.02, stone 8.46, muted 5.48, aqua 10.17, amber 10.54, ember 6.46. All pass.
  - Decorative sepia `#c8a97e` (8.50), graphite `#968c80` (5.73).
  - Journal paper `#e9dfc9` with fg `#33281d` 10.85, muted `#5c4a38` 6.37, ghost `#6b5a47` 4.99, kill `#b42318` 4.97, accent `#115e59` 5.73.
- **Slots:** `line: "pencil"`, `emphasis: "x-mark"` (ember, KILLED rows only), `ground: "none"`, `reveal: "sketch"`, `success: "core-flash"`, `loader: "core"` (LD-RDR, IC-RD-09).
- **Names:** film credit `AFTER RED DEAD REDEMPTION 2`, years `2018`, verb **"Reckoning"** (proposed), act title **"The Reckoning"** (proposed; alternative "The Frontier").
- **Films chapter:** becomes 4 screens in act order (PC, 3I, RDR, HP), with h2 "Three films and a game" (proposed).

**Option B (minimal): Act III = `kill-list` only.** `beyond` stays in HP, and the journal items (IC-RD-01, 06, 07, 11) drop to eggs.
**Option C (lightest): RDR2 as a texture world only.** No act; only the loader, eggs and the films screen. This is weak, because it breaks "one world per viewport" wherever RDR2 icons appear.

All "Lands on" entries below assume Option A.

---

## 3. Harry Potter: the bookend (prologue + Act IV "The Light")
| ID | Icon: what it is | Recreate as | Lands on | Tier | Taste guard |
|---|---|---|---|---|---|
| **IC-HP-01** | **The castle on its crag** above the Black Lake: many towers, a few hundred lit windows | Higgsfield IN-01 rev: castle far right (x 70–92%, ≤ 18% plate width), under a break in the moonlit cloud; IN-02: the broom dives past the towers. Code-flight fallback: our own SVG silhouette (≈ 9 towers, ≤ 60 nodes) | `intro` (IN-01, IN-01m, IN-02) | HERO | Appears **once** on the page, like the aperture. Play zone x 9–46% keeps luminance ≤ 0.054. Night silhouette with window points, never a daylight postcard. Text-only prompt, no film refs |
| **IC-HP-02** | **The Black Lake**: black mirror water, moon glint, lit windows reflected | IN-02 middle third: the broom skims the lake, and the lake opens into the bioluminescent sea (continuity to Pirates; end frame = MV-01) | `intro` | TEXTURE | No squid or tentacles. Flash-safety check unchanged (IN-02 #4) |
| **IC-HP-03** | **Floating candles**: lit tapers hovering at many heights | Canvas sprites (pre-rendered PNG: cream taper, flame, halo; 3 sizes) ≤ 40, bob ± 4 px at 0.15–0.25 Hz. IN-01's flame points become candles (no holders). MV-07: candles densest along the Line. W-01…05 covers | `intro`, card →HP (ignite TA-08), `writing` covers | HERO (intro, ignite) | Law 1: glow only in canvas or media. Never over a text box. Freeze at 5 s (intro). No flicker as UI feedback. Never in the Pirates hero |
| **IC-HP-04** | **The broomstick**: real-looking, polished dark handle, flared bound-twig tail, brass bands, small footrests | Higgsfield (IN-01, IN-02) plus a matching SVG for mobile and the code flight | `intro` | HERO | **Riderless always** (H1). **No lettering** on the handle (no Nimbus/Firebolt name; generated text garbles and reads as a product mark). The same object in still, flight and SVG |
| **IC-HP-05** | **The Marauder's Map, as this page's map**: fold-out parchment, ink corridors drawing from a point, labelled rooms, walls of microtext | `MaraudersMap` derived from the manifest: rooms = enabled sections, corridors = page order, each wall = microtext of that room's real title (Kimi's "geometry built from text"). 3-panel unfold (transform only); ink draws outward from the click point. Room names in IM Fell English SC (OFL) | EGG: palette or typed "I solemnly swear that I am up to no good"; also the `404` body | EGG (+404) | Our real structure, never the film's castle plan. Every room is a real link (≥ 44 px, keyboard). Dialog semantics, Esc closes. RM opens flat. Unfold ≤ 1 s |
| **IC-HP-06** | **Walking footprints with a name banner** | SVG shoe-print pairs stepping by opacity sequence; the banner reads **YOU**. The trail = the visitor's own visited sections (sessionStorage, try/catch) | Inside IC-HP-05 and the 404 | EGG | Only the visitor's real trail; no invented "Aryan was here". Stops when idle |
| **IC-HP-07** | **Folded parchment**: the map's fold creases on the Writing plane | CSS crease gradients (≤ 3% luminance) plus the existing feTurbulence 4–6% | `writing` (paper plane, D-4) | TEXTURE | Text AA unchanged (paper tokens pass). No burnt edges or stains |
| **IC-HP-08** | **The wand-tip touch**: ink spreading from the point a wand touches | HP-05 retuned: the LD-HP cool light point touches the h2, ink spreads radially (mask), then the nib writes | `writing` h2 (once) | TEXTURE | Only the light is shown, **never the wand**. The real text is in the DOM from first paint |
| **IC-HP-09** | **Lumos / Nox** | Aliases for the waveform Pause: tooltip "Nox — pause motion" / "Lumos — resume motion", palette synonyms, typed words. On Nox, the world light in *media* dims 10% over 300 ms, then motion stops | header Pause, palette | EGG (functional alias) | The accessible name stays "Pause motion" / "Resume motion" (label-in-name). Lumos never overrides OS reduced motion; it only undoes the user's own Pause. No light across text |
| **IC-HP-10** | **The lightning bolt** | Our own 3-segment SVG bolt | EGG: the tab favicon turns into a small gold bolt while the intro flight plays, then back to `[AS]` | EGG | Never on the name, never as the logo, never near a face. Not in page UI |
| **IC-HP-11** | **Deathly Hallows**: triangle, inscribed circle, line | 3-primitive SVG, 12 px, `--hp` ink-contour, aria-hidden | End mark of each essay (future `writing/[slug]`) | TEXTURE | Never a brand mark. One per page |
| **IC-HP-12** | **The Golden Snitch** | Flat SVG (a gold body plus two blurred wing strokes); flight on random béziers, transform only | EGG in `credits`: once per session at 60% in view it darts ≤ 4 s, then rests beside "↑ Back to the opening". It is a real `<button aria-label="Catch the snitch">`. Catching it adds the row `SEEKER — you` | EGG | RM or Pause: it only rests, still catchable. Never follows the cursor or covers text. No score |
| **IC-HP-13** | **The Patronus stag** | Canvas particles (≤ 400) sampling our own stag outline, silver-blue `#b9d9f2`, about 70% light and 30% form. It forms from ribbons (HP-07), crosses the dark and dissolves into the flame (≤ 3 s) | EGG: palette "Expecto patronum" while `contact` is in view | EGG | Only when no other canvas is alive. Disabled under RM (the palette says why). Principles ribbons stay abstract |
| **IC-HP-14** | **A wax seal**: our own AS monogram, not the crest | SVG disc with an irregular rim, `--hp-oxblood` | `writing`: a 14 px seal beside each static `DRAFT` chip, so drafts read as "sealed letters" | TEXTURE | The DRAFT word stays; the seal is aria-hidden. ≤ 5 seals. No acceptance-letter parody |
| **IC-HP-15** | **Time-Turner**: an hourglass in nested rings | SVG; it turns 3 times (600 ms) on activation, then native scroll to `#top` | `credits`: the icon of "↑ Back to the opening" | TEXTURE | The link text stays literal; the icon is aria-hidden; no spin under RM · **Phase 3 override (W1, 2026-10-01; PHASE3-SPEC Appendix A):** the jump is `scrollToTarget("#top")` (Lenis on desktop, native elsewhere; PHASE3-SPEC §3.1) |
| **IC-HP-16** | **The enchanted ceiling**: a vast dark hall whose ceiling dissolves into a starry sky, candles hovering | MV-07 rev (Higgsfield): an empty hall, candles densest along the Line's curve, the architecture barely visible at the edges | card →HP (the swap at p > .8), F-HP films screen | HERO | No people, no house banners. The Line must still pass the overlay diff against `LINE_D`. Our composition, never the film's wide shot |
| **IC-HP-17** | **Owl post**: one owl crossing the moon | A tiny silhouette in IN-02 at 1–2 s, or an SVG in the code flight | `intro` (optional) | EGG | One bird, far away. Drop it if the video model deforms it (animals are a known failure) |

### 3.1 Harry Potter lines
| Line (verbatim) | Source | Slot | Status and guard |
|---|---|---|---|
| "I solemnly swear that I am up to no good." | *Prisoner of Azkaban* (2004); the map's password. VERIFIED | **Intro play screen:** one Newsreader-italic line above `[ ▶ Play ]`. Also the palette/typed trigger for the Map | proposed. **Not** in a fan font: the intro isn't an allowed font slot |
| "Mischief managed." | *Prisoner of Azkaban*. VERIFIED | The Map's close button, and the **credits' final line** (the bookend to the oath) | proposed. It replaces or follows "To be continued." (decision R-3) |
| Lumos · Nox · Accio · Obliviate · Expecto patronum | spells | Pause tooltips; palette verbs: "Accio writing" jumps to `#writing`; "Obliviate — forget this visit" clears `intro-seen`, the trail and eggs (a real function) | EGG aliases only; the functional labels stay literal |
| "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light." | Dumbledore, *Prisoner of Azkaban* (2004 film). A **film-only** line, not in the novel (HP Lexicon). VERIFIED | **Card →HP epigraph** (lower bar `lead`): the card literally turns the lights on | proposed. Attribute to the film, not the book |
| "Words are, in my not-so-humble opinion, our most inexhaustible source of magic." | Dumbledore, *Deathly Hallows – Part 2* (2011 film; also the novel). VERIFIED | `writing`: one Newsreader-italic epigraph under the h2 | proposed |
| "It does not do to dwell on dreams, Harry, and forget to live." | Dumbledore, *Philosopher's Stone* (2001 film). VERIFIED | The films chapter HP screen (new `films.<id>.line` slot) | proposed. Set apart from Aryan's DRAFT reason. It comes from the Mirror of Erised grief scene, so never beside SOS Foundation or family text |
| "It is our choices, Harry, that show what we truly are, far more than our abilities." | Dumbledore, *Chamber of Secrets* (2002 film). COMMUNITY | Optional; not assigned (in `principles` it would read as Aryan's principle) | proposed only if Aryan wants it |
| "Draco dormiens nunquam titillandus." | The Hogwarts motto. COMMUNITY | 404 alternate or console | EGG |
| *Declined:* "After all this time?" / "Always." (romance); "Yer a wizard, Harry" (meme); "The ones that love us never really leave us" (grief; family-adjacent, H4/CLAUDE §2); any curse or Voldemort line | — | — | — |

### 3.2 Harry Potter: stays out
- **OUT:**
  - the HP logo and lightning-P lettering; Hogwarts and house crests (H2)
  - any face, figure or rider, the scar on a face, round-glasses shorthand (H1)
  - MinaLima scans or traces; stills; Hedwig's Theme or any audio (H2)
- **DECLINED:** house colours and sorting quizzes; Quidditch hoops and balls; the acceptance-letter parody; the Prophet masthead; wizard-hat or sparkle cursors; setting the words "Harry Potter" in a lookalike font; the Dark Mark or Death Eater imagery.

---

## 4. Pirates of the Caribbean: the crossing (cold open + Act I)
| ID | Icon: what it is | Recreate as | Lands on | Tier | Taste guard |
|---|---|---|---|---|---|
| **IC-PC-01** | **The Black Pearl on the horizon**: black hull, black sails, stern lantern lit | MV-01 rev: a small galleon silhouette on the far horizon at x 84–92% under the moon glow. **Its stern lantern is the plate's one warm point**, the light the broom flies to and the Act IV foreshadow. MV-03: steady (drift ≤ 2 px). Optional small appearances in MV-05a (moored far off) and MV-05d (first light) | `top` (hero plate), `journey` stills, F-PC | HERO (a discovery: small; the name stays first) | ≤ 7% of plate width. Silhouette only: no crew, no legible flag, no cursed-skeleton tableau. MV-01 acceptance #1–#2 (calm band, lead zone) must still pass. **IN-02 must be regenerated against the new MV-01** (SSIM ≥ 0.95) |
| **IC-PC-02** | **Jack's compass**: an octagonal lidded case, brass, a 32-point dial, **the red arrow**, a star chart in the lid; it hunts, then points to what you want most | SVG instrument of our own construction (from public-domain compass conventions, not traced from a prop photo): brass 1.5 px octagon, tick ring, fleur-de-lis north, the arrow in **`--pir-compass-red #a8453a`** (3.15:1 on the pirates canvas, CALC). The lid opens on hover or focus to show a dot star chart. Underdamped hunt → settle (`springNeedle`) | `journey` (TA-09), `act-1` opening card (settles on row I), LD-PC, the films Pirates finale | HERO (journey) | **Never in chrome** (KEEP). The arrow is a *darker red than ember*, because ember still means killed. aria-hidden. One needle per viewport |
| **IC-PC-03** | **"Points to what you want most"**: the compass's rule | PC-09 extended: hover or focus on any waypoint link or opening-card row turns the needle toward it (the visitor's intent) | `journey`, `act-1` | TEXTURE | Only those links; no cursor-following elsewhere |
| **IC-PC-04** | **The Aztec gold medallion and the moonlight curse**: gold that shows its skeleton under moonlight | A ≤ 40 px SVG medallion (our own Aztec-style ring and skull face) in brass. When Journey step 3 becomes active, a moon-silver mask sweeps it once and it reads as the cursed skull state | `journey` step 3, "They failed out-of-sample" | TEXTURE (one-shot) | It decorates a **verbatim** fact: gold in-sample, a skeleton under the moonlight of out-of-sample. It adds no events. RM shows the moonlight state static |
| **IC-PC-05** | **The kraken**: a vast shape under the storm | MV-04 (the storm plate): a dark mass beneath the foam, visible only on a long look. A Meta chart marginal nearby in Act I: "HERE BE MONSTERS" (a map convention, not a film line) | card I→II storm frame (media only) | EGG (hidden in the plate) | No tentacles wrapping anything; no ship under attack; the Line fit is unaffected |
| **IC-PC-06** | **Treasure-map X** | A two-stroke brass X at the voyage chart's final waypoint | `journey` step 4, "Now" | TEXTURE | One X per page. Brass, not ember. It marks the real last step, **never a metric** |
| **IC-PC-07** | **Portolan chart**: rhumb lattice, soundings, a cartouche | PC-02 lattice (≤ 4%). Soundings in Meta `.tnum`. A small cartouche "THE CROSSING" in Pirata One (OFL) on the chart strip | Act I grounds, `journey` chart | TEXTURE | Waypoint *names* are data and stay Geist/Mono. Only the cartouche uses the display face |
| **IC-PC-08** | **The bioluminescent sea** (the cursed sea glow) | MV-01/03 crest; PC-13 wake brightens with velocity (media only) | `top` | HERO (the plate) | Unchanged from SPEC §6 |
| **IC-PC-09** | **The green flash** | PC-08, now named in code: a 120 ms tip flash at LD-PC completion | LD-PC complete | TEXTURE | Under WCAG 2.3.1; never loops |
| **IC-PC-10** | **The Mao Kun chart**: rings that turn until the riddle aligns | Opening-card option: four concentric SVG rings (one per act) rotate with card progress and **align at p = 1**, while the rows stay the real content | `act-1` opening card (alternative to the plain course) | TEXTURE (optional) | Our own ring grammar (counts and ticks), not the prop art. The rings never carry required information |
| **IC-PC-11** | **The harbour at night**: piers, lanterns, masts | MV-05a rev: "harbour lantern" becomes a real harbour at night (moored ships, piers) | `journey` step 1 still | TEXTURE | No people on the quay. It decorates step 1 verbatim ("Trading alongside my father") and adds nothing about family |
| **IC-PC-12** | **The Jolly Roger** | Only as the Pearl's flag, at a scale where it can't be read | inside IC-PC-01 | TEXTURE (invisible) | Never an icon, emoji or divider |

### 4.1 Pirates lines
| Line | Source | Slot | Status and guard |
|---|---|---|---|
| "Now… bring me that horizon." | Jack Sparrow, *The Curse of the Black Pearl* (2003), closing line. COMMUNITY (widely cited; check the ellipsis) | `journey`: the Meta caption at the final X (step 4 "Now"): `NOW • BRING ME THAT HORIZON.` | proposed. A quote, not a claim |
| "Not all treasure is silver and gold, mate." | Jack Sparrow, *Curse of the Black Pearl*. VERIFIED | The films chapter Pirates screen (`films.pirates.line`) | proposed. Never next to a return or Sharpe figure |
| "The code is more what you'd call 'guidelines' than actual rules." | Barbossa, *Curse of the Black Pearl*. COMMUNITY | **Console egg** (`console.info` once), with the true rider "Not in this repo: `npm run check`." | EGG. Never on the gauntlet or kill-list (it would undercut pre-registration) |
| "Parley!" | *Curse of the Black Pearl*. COMMUNITY | Palette alias → `#contact` | EGG |
| "Savvy?" | Jack Sparrow, across the films | The 404 alternate tag | EGG |
| "Davy Jones' locker" | *Dead Man's Chest* / *At World's End* | 404 alternate: "This page went to Davy Jones' locker." | EGG |
| **OUT:** "The problem is not the problem. The problem is your attitude about the problem." | **Misattributed**: never in any of the films (Busted Halo) | — | H4: we never ship a fake quote |
| *Declined:* "Why is the rum gone?" (alcohol); "Take what you can, give nothing back!" (against the site's ethic); "Dead men tell no tales" (belongs to the kill-list, which is RDR2's; also contradicts the post-mortems); "Yo ho" (a lyric and kitsch) | — | — | — |

### 4.2 Pirates: stays out
- **OUT:** Depp's or any cast likeness, the tricorn-profile silhouette (H1); the wordmark and logo; ride art; traced prop art; stills; "He's a Pirate" or any audio (H2); the misattributed "problem" quote (H4).
- **DECLINED:** pirate-speak, rope borders, plank textures, parrots, eyepatches, chests, a ship's wheel as decor, the compass in the header or menu, a parchment hero.

---

## 5. 3 Idiots: the workshop (Act II)
| ID | Icon: what it is | Recreate as | Lands on | Tier | Taste guard |
|---|---|---|---|---|---|
| **IC-3I-01** | **The ICE chalkboards**: dense boards, hurried arrows, one circled result | MV-06 dawn board (media) plus code chalk (`chalkRough`). A header line along the board's top margin, set in Kalam (OFL, self-hosted): *Pursue excellence, and success will follow.* The gates derive in chalk (SM-6) | `work` | HERO | Chalk words **only** in the top margin (one line). Any formula drawn must be the site's real one. ≤ 3 chalk marks per section still holds |
| **IC-3I-02** | **Rancho's circle around the answer** | 3I-09 (existing), now allowed to be named | chapters, gauntlet tally, card gauge end | TEXTURE | **The circle marks a caveat, never a metric** (H4) |
| **IC-3I-03** | **"Aal izz well" and the hand on heart** | Motion: `springSettle` gets a named variant `aalIzzWell`, a two-beat settle (two soft pats) on non-interactive entrances. Copy: the LD-3I stall caption (§7). Palette egg: "Aal izz well" gives the current section heading one two-beat settle plus a toast | Act II entrances, LD-3I, palette | TEXTURE + EGG | **Never on a real failure** (an error that loses data is not "all well"). No drawn hand or person. No overshoot on anything clickable (H5) |
| **IC-3I-04** | **Rancho's jugaad inventions**: the scooter-powered flour mill, the car-battery inverter, the vacuum-pump rig; salvaged, visible, labelled | The drawing register for FIG schematics: visible bolts, taped joints, parts labelled as salvaged. LD-3I's gear train uses the same register | `systems` (FIG "How this page is built"), `trading-algos`, `optuna-screener` | TEXTURE | **Every part drawn is the real system** (H4; the "machine for show" ban stays). Labels are Meta with true values |
| **IC-3I-05** | **The definition of a machine** | A one-line caption under the pipeline FIG: "A machine is anything that reduces human effort." (§5.1). **M2 finish:** now chalked on the chapter's head board (the ICE lecture hall, `machine-board.tsx`) under the lettered question "What is a machine?", captioned WHAT IS A MACHINE? • 3 IDIOTS; the FIG carries no caption | `optuna-screener` (the automated research pipeline is literally that) | TEXTURE | A quote, attributed. It sits under the figure, not beside a metric |
| **IC-3I-06** | **The space pen versus the pencil** | A caption in `systems`: our own question "Why not just use a pencil?", then a true note: the site uses no WebGL (native scroll, CSS and SVG first). A footnote adds that the famous pencil story is a myth: graphite dust is a hazard in orbit (verify wording before ship) | `systems` | TEXTURE (a wink) | On-brand honesty: the site checks its own film's legend. Our phrasing (the film's line is a paraphrase), so it isn't registered as a quote |
| **IC-3I-07** | **The made-up words test**: "FARHANITRATE", "PRERAJULISATION" | 404 alternate: `DEFINE: /<missing-path>` in chalk, then "You can't — it doesn't exist." | `404` (alt) | EGG | Spelling is COMMUNITY (The Juggernaut); check against the film before using the film's words |
| **IC-3I-08** | **The quadcopter** | A small chalk doodle at the board's bottom-right corner (**M2 finish:** moved to the open board's upper right, ≈ 14.5 % of the plate width), unlabelled, not a FIG. It lifts 8 px (Kimi's lift-off microbeat) when a gauntlet **Run** clears all 7 gates | `work` | EGG | **Sensitive context:** in the film the drone is tied to Joy Lobo's suicide. Never a window, camera feed, "Give Me Some Sunshine" or a comic flying sprite. Don't link it to Aryan's real drone reel (that pairing is DRAFT) |
| **IC-3I-09** | **The ICE campus**: stone colonnades, tall windows (IIM Bangalore) | MV-06 rev: the board's room shows stone colonnade windows behind, at dawn | `work` (media) | TEXTURE | A real institution: no signage, nothing that implies affiliation |
| **IC-3I-10** | **Pangong Tso and the yellow scooter**: the blue lake, pale mountains, one yellow scooter parked | F-3I rev (Higgsfield): the lake at first light, with the scooter as the frame's one amber | `films` 3I screen | HERO | No people. No reunion tableau. The scooter is optional |
| **IC-3I-11** | **Cyanotype blueprints** | 3I-01 panels (existing) plus the card I→II FIG. 0 | chapters, card I→II | TEXTURE | Unchanged (≤ 40% area, `#cfe8f7` never used on links) |

### 5.1 3 Idiots lines
| Line | Source | Slot | Status and guard |
|---|---|---|---|
| "Aal izz well." | Rancho (also the song's title). VERIFIED (Wikiquote) | The films chapter 3I screen line; LD-3I stall caption "Aal izz well — still loading." (real loaders only, after the 5 s freeze); palette egg | proposed. Only where things truly are fine |
| "Pursue excellence, and success will follow." | Farhan quoting Rancho; the full line ends "…pants down!" VERIFIED (Wikiquote, clip.cafe) | The chalked board header (IC-3I-01) | proposed. Registry `excerpt: true` (the joke tail is dropped, marked honestly) |
| "A machine is anything that reduces human effort." | Rancho, the definition scene. COMMUNITY (several transcripts agree) | `optuna-screener` FIG caption | proposed |
| *Declined:* "Life is a race…" (the antagonist's creed); "friend fails / comes first" (envy joke); the Hindi "kaabil bano…" original (it contains mild profanity); "Jahaanpanah tussi great ho" (needs context) | — | — | — |
| **OUT:** "Give Me Some Sunshine" and any lyric; the "chamatkar/balatkar" speech | Lyrics are copyrighted; the song is the suicide scene; the speech is a sexual-violence joke | — | H2 / H4 taste-and-safety |

### 5.2 3 Idiots: stays out
- **OUT:** Aamir Khan's or any cast likeness, caricature or silhouette (H1); the wordmark and the *Lipstick* face (commercial); stills; songs (H2); rank lists or result boards (they read as Aryan's grades, CLAUDE §2).
- **DECLINED:** Bollywood clip art, doodle or gear wallpaper, comic fonts in body text, the electrified-door prank, graduation-crowd imagery.

---

## 6. Red Dead Redemption 2: the reckoning (proposed Act III)
| ID | Icon: what it is | Recreate as | Lands on | Tier | Taste guard |
|---|---|---|---|---|---|
| **IC-RD-01** | **Arthur's journal**: a leather field journal with cream pages, graphite sketches of animals, land and places, slanted handwritten entries, pasted clippings | Code spreads: paper `#e9dfc9`, faint rules, a 12 px leather edge, corner wear via feTurbulence. Sketches are SVG graphite line art or Higgsfield "graphite pencil sketch on cream paper" (no people). **Aryan's own scanned sketches** go on the Creative spread (authentic). Headings and dates in the journal hand (§9). Entries = verbatim `content.ts` in Newsreader italic | `beyond`: the four notes (Athletics, Leadership, Community, Creative) as four spreads; a single page on mobile | HERO | **Data never in the handwriting face** (≤ 4 handwritten words per page). No portrait sketches (H1). Paper ≤ 60% of the section. It never shares a viewport with the HP parchment, and its tone differs (warm grey versus gold) |
| **IC-RD-02** | **Dead Eye**: time slows, the world drains to a sepia-red grade, red X marks lock onto targets in turn, then resolve | A ≤ 1.6 s one-shot on the first entry to `kill-list`: a sepia/desaturate grade on the section's **media layer** (never the DOM text), then **ember** two-stroke X marks lock onto each row whose verdict is **KILLED**, 80 ms apart (count derived from data). The marks then resolve into the existing ember-strike state and fade to D-6 rest. Palette "Dead Eye" replays it. Card scale: the marks lock along the Line (card →RDR) | `kill-list`, card →RDR | HERO | **No gun, reticle, gunshot, heartbeat audio or blood.** Marks land only on KILLED rows (the site's ember = killed *is* Dead Eye's red). Text AA untouched. RM, no-JS and mobile skip it. Once per session |
| **IC-RD-03** | **WANTED posters**: woodtype bills, a sketch, a reason, nail holes, a torn edge | Built in HTML and CSS, so the text is real and accessible. "WANTED" in Rye (OFL). The strategy name and the reason in Newsreader (data, verbatim). The sketch slot = the row's existing lens figure rendered in graphite mono. A `KILLED` stamp in ember (Meta, the real verdict) | `kill-list` lens figure, for the **active KILLED row only** | HERO (active row) | D-6 equal quiet at rest (a poster only for the active row). **No "$" bounty and no invented number**; any metric is verbatim. No face. One poster at a time. Below 1024 the list keeps its existing fallback |
| **IC-RD-04** | **Campfire at dusk**: a fire ring, embers rising, a violet-orange sky | Higgsfield camp plate (fire ring, a canvas tent, a wagon wheel, no people) plus an optional 8 s fire loop (one-decoder rule). Code ember sprites (≤ 24) rise at the rdr→hp handoff and become the Line's first warm point | `beyond` ground, the films RDR screen finale, the ignite start | HERO (films) / TEXTURE (beyond) | One warm family per viewport. Law 1. No figures, bottles or guns in the camp |
| **IC-RD-05** | **The frontier**: golden grassland (Heartlands and Big Valley feel), big sky, far mountains, a river, low sun | Higgsfield world anchor MV-R1 (text-only prompt), the card still and F-RDR (21:9) | card →RDR, `films` RDR screen | HERO | No HUD, minimap or UI. No signage. Subject, not a screenshot (L2 #4) |
| **IC-RD-06** | **Horses** | A riderless saddled horse grazing, far off, in the camp plate and F-RDR | `beyond`, `films` | TEXTURE | **Riderless** (H1). Reject any generated anatomy fault (legs, eyes) |
| **IC-RD-07** | **Eagle Eye tracks**: the world greys and a glowing trail shows where someone went | A dashed SVG trail plus running-shoe prints that brighten in sequence (glow in canvas sprites only), drawn once beside the **Athletics** note (cross-country) | `beyond` | TEXTURE (one-shot) | Human prints (it is Aryan's running), not animal tracks. Static under RM |
| **IC-RD-08** | **The loading screen with a TIP** (the idiom: a slow-drifting sepia plate, one hint line at the bottom) | Card →RDR lower bar: `TIP:` (Meta) plus one **verbatim** site rule, e.g. `TIP: TARGET CPCV SHARPE 1.0–1.5 — ANYTHING > 2.0 IS A RED FLAG.` (content.ts label, value and note). The plate drift is scroll-driven | card →RDR, LD-RDR `route`, 404 alternate | TEXTURE | Tips are confirmed strings only, never invented advice. Interstitials never say "loading" (SPEC §8.2). Check the exact in-game look against Aryan's own play; we recreate the idiom and never capture it |
| **IC-RD-09** | **The core**: a white outer ring (the bar) around an inner core; it turns gold when fortified | LD-RDR: ring = real progress (determinate) or a slow breathing ring (indeterminate). The inner glyph is **our own** small eye-ring, not the game's heart, lightning or eye icons. Complete = a 120 ms gold flash (tiny area) | LD-RDR everywhere the rdr world needs a real loader (lens figures, journal sketches) | TEXTURE | Honest progress only. Flash under WCAG thresholds |
| **IC-RD-10** | **Honor**: a bar tipping toward the honourable end; the "honor up" toast | A tiny Meta toast `HONOR ▲` with a sliding SVG marker, shown once after the visitor has scrolled through **every** ledger row | `kill-list` end | EGG | It measures the *visitor's* reading of the graveyard, never Aryan's character. No number, no sound |
| **IC-RD-11** | **The satchel**: what you carry | A pencil-sketch strip of Aryan's **real** kit: camera (photography), sketchbook and charcoal (drawing), drone (videography), running shoes (cross-country). Each labelled in the journal hand, ≤ 2 words | `beyond` Creative and Athletics spreads | TEXTURE | Only true objects (CLAUDE.md §9, §12). The drone is his own, kept apart from 3 Idiots |
| **IC-RD-12** | **The camp ledger**: ruled columns, a double rule under the header | CSS hairline column rules at 6% plus a double rule on the kill-list | `kill-list` | TEXTURE | Type stays Geist / Mono / Newsreader. No handwriting on data |
| **IC-RD-13** | **The graphite-sketch reveal** | The rdr `reveal` slot: things draw on as pencil hatching (SVG strokes plus a graphite turbulence filter) | `beyond` sketches, poster sketches | TEXTURE | ≤ 1.5 s draw-ons. Fully drawn under RM |

### 6.1 Red Dead Redemption 2 lines
| Line | Source | Slot | Status and guard |
|---|---|---|---|
| "We can't change what's done, we can only move on." | Arthur Morgan. COMMUNITY (Steam guide, quote sites; confirm in-game) | **Card →RDR epigraph**: post-mortems, then move on | proposed |
| "Revenge is a fool's game." | Dutch's creed, repeated by Arthur ("vengeance is a fool's game" also occurs). COMMUNITY. Attribute to the game, not a speaker | `kill-list`: the Meta line after the last row (no revenge-trading a killed idea back) | proposed. A quote, not a claim about Aryan's process |
| "Be loyal to what matters." | Arthur Morgan. COMMUNITY | The films chapter RDR screen line | proposed. **Never** in `beyond` beside the SOS Foundation (it would read as Aryan speaking about family, so it becomes DRAFT) |
| Labels: `DEAD EYE` · `EAGLE EYE` · `HONOR ▲` · `WANTED` · `TIP:` | Game mechanics and the Western genre | The palette ("Dead Eye"), the poster, the toast, the card | These are labels, not quotes |
| *Declined:* "I have a plan" and "Have some faith" (Dutch memes whose joke is that the plans fail, which undercuts pre-registration); "We're thieves in a world that don't want us no more" and "Outlaws for life" (outlaw ethos); anything about money, killing or death | — | — | — |

### 6.2 Red Dead Redemption 2: stays out
- **OUT:** Arthur's or any character's face, figure or rider (H1); screenshots, photo-mode shots, extracted UI or icons, the "Redemption" custom font, the logo, the score (H2); gang portraits in the journal (H1).
- **DECLINED:** every weapon, blood, alcohol, tobacco, poker, robberies, bounty-hunting people, the illness and ending, the weapon-wheel palette, saloon doors, bullet holes, "yee-haw", and setting "Red Dead Redemption" in Chinese Rocks (a logo replica).

---

## 7. Microcopy map by slot (all worlds)
| Slot | Text (proposed unless marked) | World | Rule |
|---|---|---|---|
| Intro name line (`#intro-title`, Meta) | `ARYAN SHARMA • A RESEARCH JOURNAL IN FOUR ACTS` (count derived) | hp | The name stays visible on the play screen (DESIGN §11.4 e) |
| Intro oath (new, Newsreader italic) | *I solemnly swear that I am up to no good.* | hp | Above `[ ▶ Play ]`. Not a fan font |
| Intro credit line (Meta) | `AFTER PIRATES OF THE CARIBBEAN • 3 IDIOTS • RED DEAD REDEMPTION 2 • HARRY POTTER` | hp | Derived and in act order. 4 fields, the Meta maximum |
| Play / Skip | `Play` / `SKIP INTRO` (unchanged) | hp | Functional labels stay literal |
| Intro real loader | "Loading the flight…" (unchanged) | hp | — |
| Journey end caption | `NOW • BRING ME THAT HORIZON.` | pirates | At the final X |
| Board header (chalk) | *Pursue excellence, and success will follow.* | idiots | Kalam, chalk, top margin only |
| Card →3I epigraph | "Treat every backtest as guilty until proven innocent." (**confirmed**, REPO) | idiots | Aryan's own line outranks film lines |
| `optuna-screener` caption | "A machine is anything that reduces human effort." — Rancho, *3 Idiots* | idiots | Under the FIG |
| `systems` caption | "Why not just use a pencil?" plus the true no-WebGL note plus the myth footnote | idiots | Our phrasing |
| LD-3I stall (> 5 s, real loads) | "Aal izz well — still loading." | idiots | Only while really loading |
| Card →RDR | Title **The Reckoning** · epigraph "We can't change what's done, we can only move on." · `TIP:` + a verbatim rule | rdr | Tips from `content.ts` / REPO only |
| `kill-list` | The poster "WANTED" · stamp `KILLED` · end line "Revenge is a fool's game." · egg `HONOR ▲` | rdr | Verdict words stay exact |
| Card →HP | Title **The Light** · epigraph "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light." | hp | Film-only line; attribute to the film |
| `writing` epigraph | "Words are, in my not-so-humble opinion, our most inexhaustible source of magic." | hp | One line |
| Films chapter | h2 "Three films and a game" · one `line` per screen (§3.1, §4.1, §5.1, §6.1) · reasons stay **DRAFT** | house | A quote is never presented as Aryan's reason |
| Pause toggle tooltip | "Nox — pause motion" / "Lumos — resume motion" | global | The accessible name is unchanged |
| Palette aliases | "I solemnly swear…" (Map) · "Mischief managed" (close) · "Accio <section>" · "Obliviate — forget this visit" · "Expecto patronum" · "Parley" (→ contact) · "Dead Eye" · "Aal izz well" | global | Synonyms plus eggs. Every alias maps to a real, labelled command |
| Copy email success | `COPIED` (unchanged) | hp | The "owl post" flavour is DECLINED (it confuses a functional status) |
| 404 (default) | The Marauder's Map of the site: "You've wandered off the map." · every room is a link · "Mischief managed" returns to `#top` | hp | Useful first: a 404 that *is* a site map |
| 404 (alternates, Aryan picks one) | 3 Idiots: `DEFINE: /<path>` "You can't — it doesn't exist." · Pirates: "This page went to Davy Jones' locker. Back to the ship — savvy?" · RDR2: a sepia plate plus `TIP:` "This trail goes nowhere. Head back to camp." (our line) · HP: the Platform 9¾ wall | — | Only one ships |
| Credits sign-off | "Mischief managed." (the bookend to the oath) | house | Decision R-3 |
| Console (devtools) | "The code is more what you'd call 'guidelines' than actual rules. — Barbossa. Not in this repo: `npm run check`." | global | Printed once |
| `<title>`, meta, OG | **Unchanged: name-first, no film names or marks** | — | KEEP (hygiene) |

---

## 8. Easter-egg registry (shared rules)
- **Triggers:**
  - Palette commands (discoverable by search).
  - Typed words, only while focus isn't in an input, textarea or contenteditable. The buffer resets after 1.5 s.
  - A palette toggle "Turn off easter eggs" (session) disables typed triggers, in the spirit of WCAG 2.1.4.
  - There are **no single-key shortcuts**.
- **A11y:** every egg has a keyboard path. Transient toasts use `role="status"` once or are aria-hidden. Nothing traps focus except the Map dialog, which follows dialog rules (Esc and a close button).
- **Motion:** RM or Pause gives a static version or none. Eggs never start a second canvas or decoder (singletons, SPEC §10.1 #6). An auto-running egg lasts ≤ 4 s and runs once per session.
- **Never on the reading path:** no egg delays, covers or replaces content, and none is needed to understand anything.
- **Registry:**

| Egg | Trigger | Where | IDs |
|---|---|---|---|
| The Marauder's Map | the oath (palette or typed); the 404 | overlay dialog | IC-HP-05/06 |
| Lumos / Nox | tooltip, palette, typed | header Pause | IC-HP-09 |
| Accio / Obliviate | palette | global | §7 |
| The bolt favicon | the intro flight plays | tab | IC-HP-10 |
| The Snitch | credits at 60% in view | `credits` | IC-HP-12 |
| The Patronus | "Expecto patronum" | `contact` | IC-HP-13 |
| The hidden kraken | a long look at the storm | card I→II | IC-PC-05 |
| Parley | palette | → `#contact` | §4.1 |
| The quadcopter lift | Run clears 7/7 gates | `work` | IC-3I-08 |
| Aal izz well | palette | the current section | IC-3I-03 |
| Dead Eye replay | palette | `kill-list` | IC-RD-02 |
| Honor ▲ | every ledger row seen | `kill-list` | IC-RD-10 |
| The console line | devtools | console | §7 |

---

## 9. Fonts: allowed faces and how they ship

> **Phase 3 override (W1, 2026-10-01; PHASE3-SPEC Appendix A):** the name is set in Pirata One (`type-name`, preloaded at ≥ 64rem) and each world has head / body / lead faces at ≥ 64rem only; research data stays Geist / Geist Mono (`[data-research]`); budgets, loading and validator rules in **FONTS.md §P3** (PHASE3-SPEC §5).
**Scope:** act titles (card lower bars), loaders (route-card lettering only; never text inside loader SVGs), eggs, the Map, the Journey cartouche, the WANTED header and journal headings.

**Never used for:** the name, body, Meta, labels, verdicts, metrics, content text or any research data. Those stay Geist / Geist Mono / Newsreader.

**Budget:**
- ≤ 1 display face per viewport, and it counts toward the ≤ 3 type styles.
- The display face is never smaller than the `title` step.
- AA contrast applies to its fill.

**Ship modes:**
- **A: self-host.** `next/font/local`, a woff2 subset to the glyphs used, `preload: false` below the fold, and the `OFL.txt` or `LICENSE` committed beside the file. The Google Fonts catalogue is all OFL or Apache 2.0 (Google Fonts licence guide), but verify each download's licence file.
- **B: outline-only.** For personal-use or desktop-only fan fonts:
  - The font binary lives in the git-ignored `design-src/fonts-personal/`.
  - `scripts/outline-lettering.mjs` (opentype.js) turns a fixed list of strings (`lib/film.ts` `lettering`) into SVG path data, committed as `lib/lettering.generated.ts`.
  - The page renders `<h2><span class="sr-only">The Reckoning</span><svg aria-hidden="true">…</svg></h2>`.
  - We ship graphics, not font software. Typodermic's free licence explicitly allows fixed website graphics, and personal-use licences generally allow the output but not redistributing the font. Read each licence file before running the script.
- **C: never.**

| Face | Maker | Licence (as reported; check the file) | Mode | World | Use |
|---|---|---|---|---|---|
| IM Fell English / English SC | Igino Marini (Google Fonts) | OFL 1.1 | A | hp | Act title "The Light"; Map room labels; 404 |
| Cinzel | Natanael Gama (Google Fonts) | OFL 1.1 | A | hp | Alternative engraved caps for "The Light" |
| Harry P | Phoenix Phonts / GemFonts (2000) | Sources conflict (personal-only versus commercial-ok), so treat it as personal-use | B | hp | ≤ 2 egg strings (e.g. the Snitch "Caught."). **Never** the words "Harry Potter" |
| Magic School One | Pixel Sagas | Reported OFL; confirm in the zip | A if OFL, else B | hp | The Map cartouche (alternative) |
| Pirata One | Rodrigo Fuenzalida & Nicolás Massi (Google Fonts) | OFL 1.1 | A | pirates | The "THE CROSSING" chart cartouche; the Pirates route loader card |
| IM Fell DW Pica / Double Pica | Igino Marini | OFL 1.1 | A | pirates | Chart marginalia ("HERE BE MONSTERS") |
| Pieces of Eight | Steve Ferrera | Freeware, personal and non-commercial (reports conflict) | B | pirates | Optional cartouche alternative; never the words "Pirates of the Caribbean" |
| Kalam | Indian Type Foundry (Google Fonts) | OFL 1.1 | A | idiots | Act title "The Workshop"; the chalk board header; the 404 alternate |
| Architects Daughter | Kimberly Geswein (Google Fonts) | OFL 1.1 | A | idiots | Alternative drafting hand for the act title |
| Cabin Sketch | Pablo Impallari (Google Fonts) | OFL 1.1 | A | idiots | Alternative chalk-texture display |
| *Lipstick* (the 3 Idiots poster face) | Patrick Griffin (Canada Type) | Commercial | **C** | — | — |
| Rye | Google Fonts | OFL 1.1 | A | rdr | "WANTED"; act title "The Reckoning" (alternative) |
| Sancreek / Smokum / Ewert | Google Fonts | OFL 1.1 | A | rdr | Poster alternates (pick one) |
| Cedarville Cursive / Dawning of a New Day / Nothing You Could Do | Kimberly Geswein (Google Fonts) | OFL 1.1 | A | rdr | Journal headings and dates (≤ 4 words) |
| Homemade Apple | Font Diner (Google Fonts) | Apache 2.0 | A | rdr | Journal alternative |
| Arthurmorgancursivehandwriting | Fan (cufonfonts) | Free for personal use | B | rdr | Journal date lines (optional) |
| Chinese Rocks | Ray Larabie / Typodermic (1999), the base of the Red Dead logos | Free desktop licence: fixed graphics are OK; **no embedding or font-file sharing** | B | rdr | Act title "The Reckoning" on the card. **Never** the words "Red Dead Redemption" |
| "Redemption" (the RDR2 custom face) | Rockstar | Proprietary | **C** | — | — |

---

## 10. Credits and the legal line (H3)
- **`WORLDS BORROWED FROM`:** "Pirates of the Caribbean (2003–2017) · 3 Idiots (2009) · Red Dead Redemption 2 (2018) · the Harry Potter films (2001–2011)". Act order, enabled worlds only, years verified before ship.
- **Legal line (`small`, verbatim first sentence):** "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games. Titles, names and quoted lines belong to their owners and appear here as personal references. Every image, drawing, map and instrument on this page was made for it." The second and third sentences are proposed. This resolves SPEC decision F-3 as "name the studios".
- **Rows kept from SM-13:** `ORIGINAL GENERATED IMAGERY` (Higgsfield, derived provenance) and `BUILT WITH AI ASSISTANCE`.
- **`TYPE`:** Geist · Geist Mono · Newsreader, plus the display faces actually shipped, with their licences.
- **Close:** the sign-off "Mischief managed." and "↑ Back to the opening" (with the Time-Turner, IC-HP-15).

---

## 11. Hand-off: what this catalog requires elsewhere
1. **SPEC:**
   - Rewrite Law 4, §5.8, §9.4, §9.6 (add the `quote` kind and `films.<id>.line`), §12.1 (`WorldId` gains `"rdr"`; `LoaderKind` gains `"core"`; `TransitionKind` gains `"deadeye"`), §12.5 (quote registry, H2 file checks, ≤ 4 worlds and changes) and §15 (per §1.1).
   - Adopt §2 Option A or B.
   - Add decisions R-1…R-6 (below) to §16.
2. **DESIGN:**
   - §2.1: fonts per §9.
   - §8: film icons as world media and eggs.
   - §1.3: the `rdr` world and paper tokens (§2, CALC-verified with `tools/contrast.mjs`).
   - §11.6: replaced by §1 here.
   - §11.5: kept.
3. **MEDIA-PLAN:**
   - Rewrite [B-HP] and [B-PC]; add [B-RDR]; replace [E] with [E2] (§1.1).
   - Revise IN-01, IN-01m, IN-02 (castle, lake, candles, broom), MV-01 (Pearl), then **regenerate IN-02 after MV-01**. Also MV-04 (kraken), MV-05a (harbour), MV-06 (colonnade), MV-07 (the enchanted ceiling) and F-3I (Pangong).
   - New: MV-R1 (frontier anchor), the camp plate, F-RDR, journal sketches (unless Aryan's own scans are used) and the optional fire loop.
   - Check L becomes L2 everywhere, and every prompt must avoid brand names.
4. **Bars:**
   - intro I30, films F20, journey J17, loaders §10, ignite G15, writing W25 and contact H26 swap their object bans for L2 plus H1/H2.
   - A new `bars/reckoning.BAR.md` covers Dead Eye, the posters and the journal.
   - A new eggs section in `scene-host` or a new `bars/eggs.BAR.md`.
5. **Decisions for Aryan:**
   - **R-1** RDR2 placement: A (kill-list + beyond), B or C.
   - **R-2** Act III title: "The Reckoning" or "The Frontier".
   - **R-3** Credits sign-off: "Mischief managed." instead of or after "To be continued."
   - **R-4** Sign off each quote in §3.1, §4.1, §5.1 and §6.1.
   - **R-5** Which eggs ship.
   - **R-6** His own sketch scans for the journal, or generated sketches.
   - Any line tying a world to his own life stays **DRAFT** until he writes it.

---

## 12. Sources consulted this session
- Kimi Part V §1.5 (`kimi/Blog-Research-Findings-and-Build-Brief_sec04.md`); `kimi/research/blog_movie-harry-potter.md` §5, `blog_movie-pirates.md` §5, `blog_movie-3-idiots.md` §5; `build/SPEC.md` §1, §5.8, §9.4, §9.6, §10, §15; `build/DESIGN.md` §2, §8, §11; `build/MEDIA-PLAN.md` §2 and §4; `personal-website/CLAUDE.md` §2, §9–§12; `lib/content.ts` (the journey steps, the Sharpe note, the REPO line).
- Fonts:
  - Red Dead fonts: [Fonts In Use](https://fontsinuse.com/uses/30563/red-dead-redemption)
  - Chinese Rocks licence: [Font Squirrel](https://www.fontsquirrel.com/fonts/chinese-rocks), [Typodermic](https://typodermicfonts.com/chinese-rocks-minor-update/)
  - Pieces of Eight: [dafont](https://www.dafont.com/pieces-of-eight.font)
  - The 3 Idiots poster face: [fontmeme](https://fontmeme.com/3-idiots-font/)
  - Harry P: [FontSpace](https://www.fontspace.com/harry-p-font-f44342)
  - Magic School: [HP Fan Zone](https://www.harrypotterfanzone.com/fonts/magic-school-font/), [Pixel Sagas licence](https://www.pixelsagas.com/?page_id=8484)
  - Arthur's handwriting font: [cufonfonts](https://www.cufonfonts.com/font/arthurmorgancursivehandwriting)
  - Google Fonts: [Sancreek](https://fonts.google.com/specimen/Sancreek), [Smokum](https://fonts.google.com/specimen/Smokum), [Google Fonts licence guide](https://font-converters.com/licensing/google-fonts-license)
- Lines:
  - 3 Idiots: [Wikiquote](https://en.wikiquote.org/wiki/3_Idiots), [clip.cafe "Pursue excellence"](https://clip.cafe/3-idiots-2009/follow-excellence-and-success-will-chase-pants-down/), [machine definition](https://www.tumblr.com/srk-queen/37338769883/professor-what-is-a-machine-rancho-a-machine), [made-up words](https://www.thejuggernaut.com/3-idiots-review-aamir-khan-india-student-suicides), [the space pen and its myth](https://vocal.media/education/did-3-idiots-lie-about-nasa-s-1-crore-space-pen-the-truth-revealed-2o12gf0lyx)
  - Harry Potter: [HP Lexicon, "turn on the light"](https://www.hp-lexicon.org/2017/04/22/quotes-mis-quotes/), [clip.cafe DH2 "Words are…"](https://clip.cafe/harry-potter-the-deathly-hallows-part-2-2011/in-not-humble-opinion-s1/), [HP Lexicon, "dwell on dreams"](https://www.hp-lexicon.org/quote/dream-dwelling/)
  - Pirates: [Pirates wiki "Not all treasure…"](https://pirates.fandom.com/wiki/Not_all_treasure_is_silver_and_gold), [Busted Halo: the misattributed "problem" quote](https://bustedhalo.com/jolt/the-problem-is-not-the-problem-the-problem-is-your-attitude-about-the-problem-jack-sparrow-pirates-of-the-caribbean/)
  - RDR2: [Red Dead wiki, Arthur Morgan](https://reddead.fandom.com/wiki/Arthur_Morgan), [Steam Arthur quotes guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3024398078)
- Mechanics:
  - Dead Eye: [RDR2.org](https://www.rdr2.org/wiki/dead-eye/), [Game Rant](https://gamerant.com/red-dead-redemption-2-how-to-use-dead-eye/)
  - Cores and rings: [GameSpot](https://www.gamespot.com/articles/red-dead-2-core-guide-how-the-health-stamina-and-d/1100-6462802/), [Screen Rant](https://screenrant.com/rdr2-core-system-stamina-health-dead-eye/)
