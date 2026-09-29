# MEDIA-PLAN — Higgsfield assets for "One Line, Four Lights" (v2)

**Status: PLAN v2 (2026-09-28), partly executed.** v1 is kept verbatim at `build/MEDIA-PLAN.v1.md`. The media lane has run Step 1 under Aryan's iconic override (`build/media/LOG.md`, `LEDGER.md`): **accepted** MV-01 (hero sea with the Black Pearl), MV-02, IN-01 (castle, candles, broom), IN-01m; **in flight** IN-02 (route A draft) and MV-03. Balance **1,086.5** at 18:45 ET → **113.5 spent** (the LEDGER logs 43 for runs 1–3; the rest is Step 2, to be logged by the media lane).
**What v2 changes:**
1. **The iconic override (SPEC A-6):** assets may now depict the worlds' iconic *subjects* (the castle, floating candles, a real-looking broom, the Black Pearl, a harbour, stone colonnades, the lake and the yellow scooter, the frontier, riderless horses, the camp and its fire), recreated in our own compositions. The v1 [E] film-world exclusions are replaced by **[E2]** (§2) and **check L2** (§6).
2. **RDR2 is a fourth world:** a new [B-RD] paragraph and five assets (MV-10, MV-10m, MV-11, MV-11L, F-RD) plus two composition drafts.
3. **Budget (A-9):** the program cap is **950 including what is spent**; floor **250**; the reserve stays ≥ 250 (≥ ~200 required).
4. **W-01…05 are dropped** (Writing is the rdr2 journal with code vignettes, SPEC SM-11).
5. Sheets for assets not yet generated are re-written for their icons (MV-04 kraken, MV-05a harbour, MV-06 colonnades, MV-07 enchanted hall, MV-08 floating candle, F-PC the Pearl, F-3I lake and scooter).

**Supersedes:** the D3 sculpture pack in `higgsfield/PROMPTS.md` (HF-01…09, W, SF-01, HF-07).
**Reused from PROMPTS.md unchanged:** the run protocol (§0), model ids and parameter names, the mechanical checks (§7), the ledger template (§8.2), the text-removal-from-mock technique (M-01 → plate), the shared exclusions (§3.2, verbatim).
**Reads with:** `build/SPEC.md` v2 (where each asset lives; §10.2 icon map), `build/DESIGN.md` v3 §7 (media rules, check L2) and §11.6 (hard limits), `build/ICONS.md` (icon guards), `build/rdr2/STUDY.md` §9, `build/bars/*.BAR.md`, and the live `build/media/LOG.md` / `LEDGER.md` (the media lane's source of truth for spend).
**Labels:** OBSERVED (preflights, schemas, runs) · INFERRED · PROPOSED. **Every price must be re-preflighted** (`get_cost: true`) before each run, because prices change.

---

## 0. Budget, floor, gates

| Line | Credits |
|---|---|
| Balance at program start (OBSERVED: subscription reset 2026-09-28 16:55 ET; v1's "1,197" is superseded) | **1,200** |
| Spent at 18:45 ET (OBSERVED: balance 1,086.5) | **113.5** (LEDGER-logged 43 + Step 2 in flight) |
| **Program cap, including everything already spent** (A-9) | **950** = per-asset caps ≈ **741** + an unallocated buffer ≈ **209** |
| **Program floor: stop all spending at this balance** | **250** (= 1,200 − 950) |
| **Reserve, never spent by this plan** | **≥ 250** (the directive asks ≥ ~200) |
| Planned total (first-pass preflights, incl. spent) | **≈ 364** |
| RDR2 share (plan / cap) | ≈ 39.5 / 74 (MV-10 + comp, MV-10m, MV-11 + comp, MV-11L, F-RD) |

- **The buffer** (≈ 209) is spent only (a) on Aryan's request (S7), or (b) on regenerations forced by an upstream change (e.g. an MV-01 revision forces IN-02, MV-03 and MV-04 re-runs), each logged with its cause.
- **The LEDGER header** ("43 / 750 cap · floor 447") is the media lane's file: it should be updated at its next write to "cap 950 · floor 250" once Aryan countersigns RD-6.

**Gates.** A = Aryan approves in his own words; C = Claude runs the §6 checks and reports; L2 = check L2 signed by Claude **and** Aryan.

| Gate | Before | Who | Approve | Status (2026-09-28) |
|---|---|---|---|---|
| **G0** | Any credit | A | This plan: **the cap of 950 and floor of 250 (RD-6)**, the RDR2 set, the Journey sequence vs stills (F-8), the iconic override applied to media | v1 G0 per A-3; **v2 line pending Aryan** |
| **G1** | Any finals | A | Composition drafts: M-01, IN-C, MV-06-C, MV-07-C, **MV-10-C, MV-11-C** | M-01, IN-C: C ✓, A pending |
| **G2** | Everything downstream of MV-01 | C + L2 + A | MV-01 passes §6 **and** the browser mock at 1440/390 with a live Geist h1. **The most important gate.** Then hand-fit `LINE_D` | C ✓ (mock ✓), A pending |
| **G3** | IN-02 finals | C + L2 + A | IN-01 (final) and MV-01 approved; the IN-02 motion drafts reviewed | IN-01 C ✓; drafts in flight |
| **G4** | JV clips | C + A | MV-05a–d approved as a matched set (a 4-up strip) | — |
| **G5** | MV-09 | C + A | MV-08 passes | — |
| **G6** | F-PC / F-3I / F-RD / F-HP | C + L2 + A | Their world anchors (MV-01, MV-06, MV-10, MV-07) are accepted | — |
| **G8** (new) | MV-11L and F-RD | C + L2 + A | MV-10 and MV-11 accepted (horse anatomy, no rider, fire flash-safe) | — |

**Hard stops (every run):**
- A run would take the balance below **250**.
- A candidate shows a person, face, hand, rider or character silhouette (H1); legible text, a logo, crest, wordmark or HUD/UI replica; or a remake of a specific film frame or game screenshot (L2 ③④).
- An audio stream is present after the transcode.
- A film still, screenshot or fan art would be passed as an `image_reference` (H2).

---

## 1. Run protocol (PROMPTS §0, updated)
1. **Gate check** (the §0 table).
2. **Balance check.** Stop if the run would cross the floor (**250**).
3. **Cost preflight** (`get_cost: true`). Write the number in the ledger **before** the run.
4. **Run small batches** (`count: 2`, or one per model when comparing).
   - Every reference is the **job id** of an approved generation of ours. No uploads except the declared `LINE_D` guide (MV-07). **Never** a film still, screenshot, poster or fan art.
   - **Video always runs silent:** `sound: "off"` (Kling), `generate_audio: false` (Seedance, FLUX). Transcode with `-an` regardless.
5. **Wait and collect:** `jobs_wait` → one `show_generation_by_ids`. Masters go to `research/build/media/masters/<id>/`, never `public/`.
6. **Inspect** with the §6 checks (sharp; ffmpeg/ffprobe with `-threads 2`; one browser at a time via `research/browser.js`), then show Aryan the candidates side by side (`media/contact-sheet.html`).
7. **Log** in `research/build/media/LEDGER.md` (the §8 template: World and Check L2 columns).
8. **Cheap drafts first:**
   - stills: composition tests at `gpt_image_2_5` 2k `medium` (**1**) or `nano_banana_pro` 2k (**2**)
   - motion: `seedance_2_0` 480p `fast` (**8**) or the `seedance_2_5` draft route, with start/end frames
   - only approved drafts get a final render

**Prompt hygiene (kept, for a new reason).** The override changes *what* we depict, not how we prompt. Prompts describe the subject in plain visual terms ("a many-towered gothic castle on a crag above a black lake, lit windows"; "a small three-masted ship with black sails"; "a yellow scooter parked by a high blue mountain lake") and **never** name a film, franchise, character, studio or in-world place ("Hogwarts", "Black Pearl", "Pangong", "Red Dead", "Arthur"). Brand names trigger model IP refusals (wasted credits), push models toward literal copies of film frames, and every prompt lives in public provenance. Painters in the public domain may be named for light (Bierstadt, Turner, Rembrandt).

---

## 2. The world recipe

**Full still prompt** = **[A] shared direction** + **[B] world paragraph** + **[C] asset paragraph** + **[D] shared exclusions** + **[E2] hard-limit exclusions** + the asset's explicit **unexclusions** (the icons it is allowed to show).
**Video prompts** = the motion paragraph + a motion-exclusions line (camera discipline, explicit negatives, 3–4 candidates, watch for baked-in UI boxes).

### [A] Shared direction (prepended to every still; unchanged, OBSERVED in use)
> Original cinematic artwork for a personal research journal. Natural practical light only — moonlight, bioluminescence, lantern light, small flames, starlight or low raking daylight — with deep but readable shadows and restrained contrast. Locked tripod camera, natural 35–50 mm lens feel, fine natural texture, no heavy bloom. Generous calm empty space on the left for live typography. Everything belongs to one consistent, quiet visual world. Artwork only, without any interface, lettering or typography.

### [B] World paragraphs (v2: the iconic subjects are named visually)
- **[B-HP] A candlelit night of old magic** (the prologue and Act IV; OBSERVED in IN-C/IN-01):
  > World: a candlelit night of old magic. Deep blue-black and warm near-black, with small warm flame-coloured points of light and an occasional cool blue-white glint. Magic is felt through light appearing out of darkness: candles floating in the air, lit windows of a far-off castle, starlight on still black water.
- **[B-PC] The open sea at night** (Act I; OBSERVED in MV-01/MV-02):
  > World: the open sea at night. Abyssal teal-black and moonlit slate, with sea-glass aqua bioluminescence as the only saturated colour and a single distant warm lantern light as the only warmth. The sea is empty except for one tiny, distant three-masted sailing ship with black sails, seen only as a silhouette on the far horizon.
- **[B-3I] A workshop at first light** (Act II):
  > World: an old stone college workshop at first light. Green-black slate, chalk white, warm sandstone and one pale gold beam of low morning daylight through tall arched colonnade windows; fine dust hangs in the light. Everything is clean, honest and hand-made, and nothing is written on any surface.
- **[B-RD] The open frontier, golden hour into dusk** (Act III; STUDY §9):
  > World: the open frontier from golden hour into dusk. A warm low sun, long raking shadows and dust hanging in the air over tall dry grass, scattered oaks and a slow river; distant blue mountains. Luminist nineteenth-century landscape-painting light, in the manner of Albert Bierstadt: a hazy, light-filled distance behind a darker, quiet foreground. Earthy umber, bone, sage and dusk-gold, with at most one deep oxblood. Wild, calm and unpopulated.

### [D] Shared exclusions (PROMPTS §3.2, verbatim)
> Exclude text, letters, numbers, logos, charts, axes, stock tickers, dashboards, UI panels, currency symbols, financial returns, trophies, certificates, people, hands, faces, city skylines, rockets, robots, brains, infinity symbols, crypto coins, neon cyberpunk decoration, rainbow gradients, busy star fields, heavy bloom, blinding highlights, noisy film grain, tiny unstable lines, impossible intersections, and copied branded objects. Do not add borders or baked-in letterboxing.

### [E2] Hard-limit exclusions (appended to every still and every video; replaces v1 [E])
> Also exclude: any person, rider, crew, figure, face, hand or human silhouette, and any costume or hat that suggests a character; any legible lettering, logo, brand name, crest, shield, banner, emblem, flag marking or interface; weapons, guns, blood, alcohol, bottles and tobacco; maps, charts, compasses, instruments, diagrams, journals, books, letters or posters (these are drawn in code); lens flares; and any recreation of a specific famous film frame or video-game screenshot.

Each sheet then lists its **unexclusions** (e.g. "Unexclusion: the one riderless broom and the floating candles described here are allowed.").

**Style references:** each world has one **anchor** job id, passed as `image_references` to every later still of that world:
- Pirates: **MV-01** (`548e5fc0`, accepted)
- the prologue: **IN-01** (`3edb46de`, accepted)
- 3 Idiots: **MV-06**
- RDR2: **MV-10**
- HP Act IV: **MV-07**

Across worlds, **no** reference is passed (worlds must differ), except where registration requires it (MV-01 as IN-02's end frame).

---

## 3. Models and prices (OBSERVED preflights and billing 2026-09-28; per output)
| Model | Use | Price |
|---|---|---|
| `gpt_image_2_5` | Composition drafts, finals, 21:9 film stills | 16:9 2k medium **1** · 2k high **2.75** (16:9 / 4:5 / 9:16, billed) · 2k xhigh **4.5** · 4k xhigh **7** (billed) · 21:9: preflight (INFERRED ≈ 16:9). Outputs are exact aspect (OBSERVED) |
| `nano_banana_pro` | Matched edits and recompositions from a reference | 2k **2** · 4k **4** (billed). Jobs may report `nano_banana_2`. Outputs are **not** exact aspect (5504×3072, 1856×2304, 1536×2752: OBSERVED) |
| `kling3_0` | Pinned start/end loops and flights, `sound:"off"` | pro 8 s **14** · 10 s 17.5 · 6 s / 5 s: preflight (INFERRED ≈ 1.75/s) · `4k` 8 s **48** |
| `minimax_h3` | Alternative pinned loop | 2K 8 s **16** |
| `seedance_2_0` | Cheap motion drafts with start/end, `generate_audio:false` | 480p `fast` **8** |
| `seedance_2_5` | Draft → finalize route | draft 480p **24** (the IN-02 route-A draft used it); finalize: preflight via `draft_job_id` |

**Unverified (check at the first delivery):** Kling `pro` output resolution; 21:9 pricing.

---

## 4. Asset sheets

Every sheet lists: **ID · purpose and section · model/settings · refs · full prompt ([A]+[B] are implied where marked; [C] is written out) · acceptance (common A–M in §6, plus the asset checks) · credits plan/cap · code alternative**.

---

### PROLOGUE (HP night) — iconic: the castle, the Black Lake, floating candles, the broom

#### IN-C — Play-screen composition drafts (never shipped) · **DONE**
- **Result (OBSERVED, LOG run 1):** winner `43692ae9` (hand-carved racing broom pointing up-left toward the Play zone; darker castle with lit windows; Play zone p95 0.0062). Runner-up `e3b7a1e1`. Spent **2** (cap 4). Reference-only.
- **Prompt:** `media/prompts/IN-C.full.txt` = [A] + [B-HP] + the IN-C [C] + [D] + the v1-era HP exclusions with the unexclusion "the one riderless broomstick and the floating candles".

#### IN-01 — Play-screen plate, desktop 16:9 (`intro-play.webp`) · **ACCEPTED** (`3edb46de`)
- **Purpose:** SPEC §5.2: drawn into the intro canvas behind the oath, Play and Skip; the **start frame of IN-02**; the prologue style anchor.
- **Result (OBSERVED, LOG run 2):** `gpt_image_2_5` 16:9 4k xhigh, ref IN-C winner, **7** (+ the `nano_banana_pro` alternate `23581665`, 4). Spent **11** (cap 25). Delivered `accepted/intro-play.webp` 2560×1440, 199 KB; master 3840×2160.
- **Subject:** a candlelit night across a wide, still, black lake from a low vantage near the water; **a vast gothic castle silhouette with many slender towers on a rocky cliff at right** (IC-HP-01), its windows glowing and reflected as short streaks in the lake (IC-HP-02); **≈ 22 floating ivory candles** with no holders (IC-HP-03); **a real-looking riderless racing broom** (hand-carved dark handle pointing up-left, bound birch tail tied with cord; IC-HP-04) centred ≈ (0.77, 0.51). The full prompt is `media/prompts/IN-01.full.txt`.
- **Acceptance (v2, adapted to the override):**
  1. Play zone (x 9–46%, y 28–64%) p95 ≤ 0.054 → **0.0060** ✓.
  2. The broom is riderless, real-looking, with **no lettering or marks** (full-res check) ✓.
  3. 15–40 warm floating points → ≈ 22 candles + lit windows, none in the Play zone ✓.
  4. Castle, lake and candles are **wanted** (v1 check 4 retired).
  5. Top 12% quiet; corner tone → **FLAG**: one out-of-focus candle touches the top band (clears SKIP INTRO in the mock); the night is bluer than v1's `#06080d`. **Resolved in DESIGN v3:** `--color-intro-night` retuned to `#020e1c`.
  6. **Check L2:** Claude ✓ 2026-09-28; **Aryan pending**.
- **Code alternative (0 credits):** the CSS night ground + ≤ 40 code candle sprites + the SVG broom and an SVG castle silhouette (≈ 9 towers, ≤ 60 nodes).

#### IN-01m — Play-screen plate, mobile portrait (`intro-play-mobile.webp`) · **ACCEPTED** (`57484139`)
- **Result (OBSERVED, LOG run 3):** `gpt_image_2_5` 9:16 2k high, ref IN-01 (+ two `nano_banana_pro` rejects/alternates). Spent **6.75** (plan 4, cap 8). The broom is centred at ≈ 31% height and is the same object as IN-01; the castle sits upper-middle; the lower half p95 **0.0048**; 1520×2688 → delivered 1290×2281, 132 KB. Prompt `media/prompts/IN-01m.full.txt`.
- **Check L2:** Claude ✓; **Aryan pending**.

#### IN-02 — The broom flight, desktop (`intro-flight.mp4` / `.webm`) · **IN FLIGHT** (route-A draft `239feb1b`)
- **Purpose:** SPEC §5.3. The time-driven chase from the play screen to the hero. **Start frame = IN-01 (the castle and lake), end frame = the accepted MV-01 (with the Pearl)**, so the landing registers on the live hero. Any MV-01 revision forces a regeneration (buffer rule, §0).
- **Route A (one continuous shot):** drafts on `seedance_2_5` (draft 480p, **24**) or `seedance_2_0` fast (**8**) with start/end frames; finals on `kling3_0` pro 6 s × 2 (≈ **21**, preflight), re-run at `4k` if pro < 1080p, or `minimax_h3` 2K. Plan ≈ **58**.
- **Route B** (only if A can't hold the broom or the camera): IN-K1 keyframe (`nano_banana_pro` 16:9 4k, refs [IN-01, MV-01]) + IN-02a (IN-01 → K1) + IN-02b (K1 → MV-01), joined on the identical K1 frame (an invisible hard cut). Adds ≈ 40.
- **Cap (both routes):** **140**.
- **Motion paragraph (v2; OBSERVED as `media/prompts/IN-02.routeA.full.txt`):**
  > One smooth continuous shot, six seconds, cinematic and graceful. From the first frame, the riderless wooden racing broomstick hovering above the black lake lifts and tips forward, and the camera swoops in to follow close behind and slightly above it. The broom flies toward the lit gothic castle on its cliff and weaves between its tall towers and spires with their warm amber windows, while the floating lit candles slide past at different depths. Then the broom dives down into a deck of soft grey moonlit cloud below; the camera follows it through the cloud gradually and smoothly, never a white flash, and bursts out beneath it above a dark open ocean at night. The broom skims low along a long glowing sea-glass aqua bioluminescent wave crest, from the middle of the frame toward the right, then rises and shrinks away toward the tiny black-sailed three-masted ship on the far horizon and its single warm stern lantern, until the broom is gone. The camera eases to a stop and settles exactly on the final frame: the empty night ocean with the aqua wave crest, the low fog, the tiny distant ship and its warm lantern, and no broom.
- **Motion exclusions (v2):**
  > No rider, person, hands, face, animal or creature at any moment (an owl crossing the moon is allowed only if it renders cleanly; otherwise exclude it); no text, letters, logos, interface boxes or tracking squares; no lens-flare bursts, white flashes, strobing or sudden exposure changes; no cuts; no audio.
- **Acceptance (beyond common A–M):**
  1. **Registration** (C): the last frame vs MV-01 at 960×540, SSIM ≥ **0.95**; the first frame vs IN-01, SSIM ≥ **0.95**.
  2. **The broom is gone** ≥ 0.4 s before the end (12 fps review) (C + A).
  3. **No rider, no figure** in any frame (a 4 fps review, plus A watching 3× in real time). **The castle keeps its silhouette** through the tower pass (no melting spires; frame review at 4 fps).
  4. **Flash safety** (C): per-frame mean relative luminance (ffmpeg `signalstats`), ≤ 3 changes of ≥ 10% over ≥ 25% of the frame per 1 s window (whole-frame and 4 × 4 tiles); no red flashes. The cloud passage is the risk.
  5. **Smoothness** (C): consecutive-frame SSIM ≥ 0.6 everywhere except inside the cloud passage (logged).
  6. **Silent**, then `-an`. **Delivery:** 1920×1080 H.264 CRF ≈ 26 plus WebM, ≤ **4 MB**, 6.0 ± 0.2 s.
  7. **Check L2** on 8 evenly spaced frames (A + Claude): our composition (not a remake of any film flight shot), no marks, no faces.
- **Trail bake** (code, 0 credits): step the approved video at 12 fps and hand-mark the broom-tip position → `lib/intro-trail.json` `{t, x, y}` in 0–1 plate coordinates. In the last 1.2 s, every point is ≥ 24 px from the h1 rect at 1440×900 and 1024×768.
- **Code alternative:** the **code flight** (SPEC §5.4): the SVG broom + canvas trail over IN-01, then a dome exit. 0 credits; always shipped as the fallback.

---

### ACT I — PIRATES (sea)

#### M-01 — Hero composition mock at sea (never shipped) · **DONE**
- **Result (OBSERVED, LOG run 1):** winner `4f98076c` (one folded crest curl, xp98 0.961; **a black-sailed three-master ≈ 3% wide with its stern lantern at x 0.893**; calm band p95 0.0092). Runner-up `ab82cd87` (the crest ran off the right edge). Spent **5.5** (cap 11). Reference-only; never in `public/` or `lib/media.ts`.
- **Prompt:** `media/prompts/M-01.full.txt` (the v1 mock prompt with the lantern replaced by "a tiny, distant three-masted sailing ship with black sails … one small warm lantern glowing at its stern").

#### MV-01 — Hero sea plate (`hero-sea.webp`): the Act I anchor · **ACCEPTED** (`548e5fc0`)
- **Purpose:** the hero poster and aperture media (SPEC §6); **IN-02's end frame**; MV-03's start and end; MV-04's edit source; the Pirates style anchor; the source `LINE_D` is fitted to.
- **Result (OBSERVED, LOG run 2):** Route A (text removal from the M-01 winner), `gpt_image_2_5` 16:9 4k xhigh, **7** (+ the rejected `nano_banana_pro` `00c4c97b`: purple cast, loud moon, not 16:9, 4). Spent **11** (cap 25). Delivered `accepted/hero-sea.webp` 2560×1440 q88, 235 KB; master 3840×2160. Prompt `media/prompts/MV-01.routeA.full.txt`.
- **Icons in the plate (IC-PC-01, IC-PC-08):** the bioluminescent crest; **the Black Pearl** as a tiny black-sailed silhouette on the horizon (no crew, no legible flag); **its stern lantern** is the plate's one warm pixel at (0.893, 0.419).
- **Acceptance (v2):** calm band p95 **0.0113**, aqua 0.0046% ✓ · lead zone **0.0024** ✓ · name zone 0.0079 ✓ · crest aqua from x **0.485**, bright body 0.60–0.96; **FLAG** glints reach the right edge (the focalBox bracket stops at 0.96) · lantern one blob 0.001% ✓ · top 12% quiet; corners: **FLAG** (moon-glow TR; a levels match in code) · 390 grayscale ✓ · velocity noise ✓ · **G2 browser mock ✓ (C), A pending** · **check L2: Claude ✓, Aryan pending**. focal (0.70, 0.50); focalBox ≈ x 0.49–0.96, y 0.46–0.60; horizon y 0.426.
- **After G2 (code):** hand-fit `LINE_D` to the crest silhouette; store the overlay diff as `masters/MV-01/line-fit.png`. Then IN-02 finals, MV-03, MV-04 and MV-05 proceed.

#### MV-02 — Hero mobile 4:5 (`hero-sea-mobile.webp`) · **ACCEPTED** (`10b81664`)
- **Result (OBSERVED, LOG run 3):** `gpt_image_2_5` 4:5 2k high, ref MV-01, **2.75** (+ two `nano_banana_pro` rejects: the crest ran off the edges). Spent **6.75** (plan 4, cap 8). The crest sits inside the frame (xp02 0.268 / xp98 0.939); the tiny ship and lantern are kept; same grade as MV-01; reads at 390 × 488 and in grayscale. Delivered 1280×1600 q84, 215 KB. Prompt `media/prompts/MV-02.full.txt`. **Check L2:** Claude ✓, Aryan pending.

#### MV-03 — Hero loop 8 s (`hero-sea-loop.mp4`) · **IN FLIGHT**
- **Model (all silent, start = end = MV-01, 16:9, 8 s):** D1 `kling3_0` pro `sound "off"` (**14**) and D2 `minimax_h3` 2K (**16**). If D1 wins below 1080p, re-run at `mode "4k"` (48). Plan **30**, cap **80**.
- **Motion paragraph (v2; OBSERVED as `media/prompts/MV-03.full.txt`):**
  > Animate the supplied night seascape with extremely restrained, continuous motion while preserving the exact composition. Camera locked on a tripod: zero orbit, dolly, pan, zoom, shake or focus pull, no zoom in or zoom out. The glowing sea-glass aqua wave crest rolls slowly forward in place and returns to its original shape; small glints travel along its right-hand edge and fade back; the low fog drifts gently from right to left. The tiny black-sailed three-masted ship stays in place on the far horizon, and its single warm stern lantern flickers very softly. The dark calm band, the empty left half of the frame and the top of the frame stay perfectly still. One uninterrupted shot with the same state at the first and last frame. No cuts, bursts, sparkles, particles, added objects, additional ships or boats, people, text, interface boxes, whole-frame flicker, exposure change or audio.
- **Acceptance:** first and last frame SSIM vs MV-01 ≥ 0.95, the join ≥ 0.97 · x < 50% static (mean |Δ| ≤ 2/255), the top 12% static · exposure varies ≤ 2% · **the ship drifts ≤ 2 px and its lantern blob luminance varies ≤ 5%** (the SPEC's "steady") · silent; ≤ 4 MB 1080p · 3 joins watched in real time (A).
- **Code alternative:** the poster only (the loop is enhancement).

#### MV-04 — Storm edit of MV-01 (`storm.webp`): Card I→II, the "noise" half
- **Model:** `nano_banana_pro` 16:9 4k ×2 (**8**) + `gpt_image_2_5` 16:9 4k `xhigh` (**7**), all `image_references:[<MV-01>]`. Plan **15**, cap **29**.
- **Prompt:** "Edit the supplied image into its stormy companion frame. Keep the exact camera, crop, horizon line and framing, with no zoom and no reframing." + [A] + [B-PC] +
  > The same sea in a night squall: rain veils slant across the frame, the overcast is heavier and lower, and the long glowing crest is broken into scattered churning aqua foam that still follows the same overall folded curve across the right half. The distant ship and its warm lantern are gone. Deep beneath the churning foam on the right, a vast dark rounded mass lies just under the surface, barely darker than the water and visible only on a long look, with no limbs or tentacles breaking the surface. The left 35 percent is darker and quieter than the right, with rain but no bright detail. No other change in viewpoint.
  
  + [D] + [E2]. **Unexclusion:** the one vast dark submerged shape described here (IC-PC-05, the hidden kraken egg).
- **Acceptance:**
  1. **Overlay diff vs MV-01** (C): horizon within ±1% of height; the foam's aqua-mask centreline within ±4% of height of `LINE_D` across x 46–94%.
  2. It reads as the same place turned stormy (a 2 Hz flicker test, A).
  3. No lantern or ship pixel (C).
  4. **The kraken stays hidden:** at 390 px and in grayscale it is not noticed at a glance; at 100% it reads as a shape, not a creature with eyes, tentacles or teeth (A). If it reads as a monster, drop the unexclusion and re-run (buffer rule).
  5. No lightning flash and no bright whole-frame spikes.
  6. **Check L2** (our storm, no ship-under-attack tableau).
- **Code alternative:** MV-01 through a code "storm grade" (desaturate, darken, a baked rain-streak PNG at 12%); no kraken.

#### MV-05a–d — Journey sea states, 16:9 (`voyage-a…d.webp`), a matched set
- **Purpose:** SPEC SM-4: the four step beats (desktop sequence keyframes and the mobile/RM carousel stills). The set shares its horizon (55% of height), camera height and lens.
- **Model:** `gpt_image_2_5` 16:9 2k `high`, `count 2` each, `image_references:[<MV-01>]` → 4 × 5.5 = **22** (cap 44).
- **Shared line** (every paragraph):
  > Same sea, lens and camera height as the reference, horizon at 55 percent of the frame height, subject centred.
- **[C] per still (v2):**
  - **a · harbour at night** (step 01, Origin; IC-PC-11):
    > A small old stone harbour at night seen from the water: wooden piers, two or three moored wooden sailing ships with furled sails at rest, a few warm lanterns on the quay whose long wavering reflections cross the still black water; faint mist. Nobody on the quay or the decks.
  
    **Unexclusion:** the harbour, piers, moored ships and lanterns described here. It decorates step 1 verbatim and adds nothing about family.
  - **b · fog** (step 02, Early work):
    > Dense sea fog over slow dark swells; a pale, diffuse moon glow high in the fog; visibility fading to grey in every direction. No vessels, piers or land.
  - **c · squall** (step 03, The break):
    > A squall wall of dark rain crossing the sea, wind-torn whitecaps and spray, heavy slate clouds pressing low, and a single faint aqua glint in the breaking foam. No vessels.
  - **d · first light** (step 04, Now):
    > First light over a flat calm sea, a pale gold line along the horizon, a faint aqua bioluminescent line curving away across the dark water in the foreground, and, optionally, one small three-masted ship with black sails far out on the horizon heading into the light.
  
    **Unexclusion (optional):** the one distant black-sailed ship (IC-PC-01's second appearance; drop it if it competes with the first-light line).
- **Acceptance:**
  - A 4-up strip (A): the same horizon ±1% (C), the same camera height, and the order reads harbour → fog → storm → first light.
  - Each still readable at 480 px wide.
  - **Check L2** on a and d (our harbour and ship, no crew, no remake of a film's port shot).
- **Code alternative:** legacy journey stills via fallbacks. The world read is weaker.

#### JV-1…3 — Journey sequence clips (→ `voyage-seq/000–071.webp`)
- **Purpose:** the desktop scroll-indexed sequence (SPEC SM-4, PC-12). The frames pass exactly through MV-05a/b/c/d.
- **Pairs:** JV-1 a → b · JV-2 b → c · JV-3 c → d. Each is 16:9, 5 s, silent.
- **Model:**
  - drafts `seedance_2_0` `fast` 480p ×3 (**24**)
  - finals `kling3_0` pro 5 s ×3 (preflight; ≈ 9 each → ≈ **27**)
  - one retake allowance (≈ 15)
  - Plan **66**, cap **110** (Route: finals only for the approved draft motions).
- **Motion paragraph (per pair, with the weather words swapped):**
  > Locked camera, perfectly steady, over the same sea and horizon. The weather transforms continuously from the first frame to the last frame: [JV-1: the harbour and its lantern reflections recede and dissolve as fog rolls in across the water and a pale moon glow appears high in the fog] [JV-2: the fog is torn away by rising wind as a dark squall wall arrives with rain, whitecaps and spray] [JV-3: the squall passes, the rain thins and the sea flattens as first light rises along the horizon and a faint aqua glow appears in the foreground water]. One continuous shot; no cuts, people, new vessels, objects, text, flashes, lightning or audio (the moored ships of the harbour may fade out with the fog in JV-1).
- **Build (code):** extract 24 frames per clip with `ffmpeg -threads 2 -vf fps=24/5`, then **replace frame 0 / 24 / 48 / 71 with the approved stills** (exact beats). Encode WebP 1280 w q ≈ 60, ≤ 3 MB total.
- **Acceptance:**
  - Each clip's first and last frames vs its stills: SSIM ≥ 0.93.
  - No lightning or flash (the §6 flash check).
  - Horizon drift ≤ 1%.
  - A real-time scrub test in `/lab` (A).
  - Silent.
- **Code alternative:** the `stills` variant (the 4 stills crossfading on beats), 0 credits (SPEC F-8).

---

### ACT II — 3 IDIOTS (the workshop at first light) — iconic: the colonnades, the board, the lake and the scooter

#### MV-06-C / MV-06 — The dawn chalkboard under the colonnades (`board-dawn.webp`): the Act II anchor
- **Purpose:** SPEC SM-6: the gauntlet's board. Chalk diagrams, the board-top line and the quadcopter doodle are code SVG/HTML drawn over its dark left 60%.
- **Model:** a composition draft `gpt_image_2_5` 16:9 2k `medium` (**1**) → final `gpt_image_2_5` 16:9 2k `xhigh` ×2 (**9**). Plan **10**, cap **19**.
- **[C] (v2):**
  > A large wiped slate-green chalkboard seen at a slight angle, filling most of the frame, mounted on an old warm sandstone wall. Behind and above its right edge, a tall arched stone colonnade window lets in a low beam of early-morning daylight that crosses the board diagonally; fine chalk dust hangs in the beam. Faint cloudy traces of erased chalk drift across the board, with no legible marks, letters, numbers, shapes or drawings. The left 60 percent of the board is even, dark and calm; the lit area stays in the right third. A narrow wooden chalk ledge runs along the bottom edge with two short pieces of white chalk. No people, desks, signage, plaques or crests.
  
  Prompt = [A] + [B-3I] + [C] + [D] + [E2]. **Unexclusion:** the stone colonnade window (IC-3I-09; a real institution's look, with no signage and nothing that implies affiliation).
- **Acceptance:**
  1. **Left 60%:** 95th-percentile luminance ≤ 0.09 and SD ≤ 6/255, so the chalk strokes read (C).
  2. **No legible marks** at 100% zoom (A + Claude).
  3. **Check L2:** our composition (not the film's classroom shot), no signage.
  4. It reads as *morning* (A).
- **Code alternative:** a CSS board (`--idi-canvas` plus a 4% grid) with a code beam in media only.

#### (none) Chapter covers
Chapter covers are **code schematics** in the jugaad register (SPEC SM-7), at 0 credits.

---

### ACT III — RED DEAD REDEMPTION 2 (golden hour → campfire) — iconic: the frontier, a riderless horse, the camp and its fire (new)
**[E2] unexclusions for the whole world ([E-RD], STUDY §9):** riderless horses at rest or grazing (small, mid-distance, never galloping, no branded tack), one campfire in a stone ring, canvas tents, a split-rail fence, a dirt trail. **Still excluded:** people, riders, hands, faces, hats, guns, bottles, branded tack, lettered wagons, trains, towns, signs, posters, paper, books and any text. Prompts cite Bierstadt for light and never name the game.

#### MV-10-C / MV-10 — The golden-hour frontier (`frontier-dusk.webp`): the Act III anchor
- **Purpose:** SPEC SM-15 (Beyond's opening band) and SM-14 (the image Card II→III develops into: declared reuse ③); LD-RD's plate; the rdr2 style anchor.
- **Model:** composition drafts `gpt_image_2_5` 16:9 2k `medium` ×2 (**2**) → finals `gpt_image_2_5` 16:9 2k `high` ×2 (**5.5**). Plan **9.5** (incl. comps; v1 STUDY plan 7.5), cap **16**.
- **[C]:**
  > A wide grassland valley at golden hour. The low sun sits just above a far ridge at about 78 percent of the width, and the distance is hazy and full of light, with distant blue mountains. A slow river catches the light mid-frame. The left 45 percent is dark foreground grass and the shadowed edge of a scattered oak, calm and even, where live lettering will sit. One small riderless saddled horse grazes quietly in the mid-distance at about 70 percent of the width. Long raking shadows; dust in the air.
  
  Prompt = [A] + [B-RD] + [C] + [D] + [E2] + [E-RD]. **Unexclusion:** the one riderless horse.
- **Acceptance:**
  1. **Dark foreground:** left 45% × y 25–75% p95 ≤ **0.054** (ink ≥ 7:1 without a scrim) (C).
  2. **Horse anatomy** at a 200% crop: 4 legs, no fused limbs, one head; **no rider, no human trace, no tack logo** (A + Claude).
  3. The sun blob sits at x 74–82% with no lens flare; no signage, fence lettering or HUD (C + A).
  4. **Check L2:** our composition, not a game vista screenshot (A + Claude, independently).
  5. Delivery: 2560×1440 WebP ≤ 300 KB; never the LCP (below the fold).
- **Code alternative:** a CSS golden-hour gradient ground (media layer) with the code low-sun sprite. Beyond still works.

#### MV-10m — Frontier mobile 4:5
- **Model:** `nano_banana_pro` 2k from MV-10, ×2 → **4** (cap 6).
- **Prompt:** "Recompose the supplied image into a portrait 4:5 frame; the same light, land and colour." + [A] + [B-RD] + "The sun upper-right; the horse small at right of centre; the lower half dark foreground grass, calm, for live text above it." + [D] + [E2] + [E-RD].
- **Acceptance:** the same family (A); the horse passes check 2; readable at 390 px.

#### MV-11-C / MV-11 — The campfire at night (`campfire.webp`)
- **Purpose:** SPEC SM-16 (Voices); the ignite's source (in code, SM-10); MV-11L's start and end.
- **Model:** draft `gpt_image_2_5` 16:9 2k `medium` (**1**) → finals `gpt_image_2_5` 16:9 2k `high` ×2 (**5.5**), ref MV-10. Plan **6.5**, cap **13**.
- **[C]:**
  > A night clearing at the edge of a quiet camp. One small campfire burns in a ring of stones at about 78 percent of the width and 62 percent of the height; its warm light falls off quickly into darkness. Behind it, two canvas tents are barely rim-lit. A few faint embers drift upward. The left 55 percent is near-black and even, with no detail. The top 15 percent is plain night sky.
  
  Prompt = [A] + [B-RD] + [C] + [D] + [E2] + [E-RD]. **Unexclusion:** the campfire, stones and two tents.
- **Acceptance:** left 55% p95 ≤ **0.054** and SD ≤ 4/255 (C) · fire at x 74–82%, y 56–68% (C) · no figure, bottle, gun, pot with lettering or wagon text at 100% (A + Claude) · **check L2**.
- **Code alternative:** the R-6 code campfire (3 flame sprites) on `--rd-deep`.

#### MV-11L — Campfire loop 8 s (`campfire-loop.mp4`)
- **Model:** `kling3_0` pro 8 s, first = last = MV-11, `sound:"off"` → **14** (cap **28**). Desktop only.
- **Motion paragraph:**
  > Camera completely locked. Only the flames move gently and a few embers drift slowly upward; the glow varies by no more than about fifteen percent, never flickering faster than twice a second. The tents, the stones and everything else stay perfectly still. The same first and last frame. No smoke bursts, sparks toward the camera, people, text or audio.
- **Acceptance:** HF-03 join checks (first/last SSIM ≥ 0.95; join ≥ 0.97) · left 55% static (≤ 1/255) · **flash safety** (`ffmpeg -threads 2 … signalstats`: per-frame luminance Δ; flicker ≤ 2 Hz; the fire region < 25% of a 10° field) · silent, `-an` · 2–4 MB 1080p · calmer than MV-03 (A).
- **Code alternative:** the MV-11 poster (the loop is enhancement).

---

### ACT IV — HARRY POTTER (the candlelit night) — iconic: floating candles, the enchanted hall

#### MV-07-C / MV-07 — The enchanted hall of lights (`lights-line.webp`): the Act IV anchor
- **Purpose:** SPEC SM-10: the settled state of Card III→IV (IC-HP-16) and the HP Act IV style anchor.
- **Model:** draft `gpt_image_2_5` 16:9 2k `medium` ×2 (**2**) → final `gpt_image_2_5` 16:9 4k `xhigh` (**7**) + `nano_banana_pro` 16:9 4k with the draft as ref (**4**). Plan **14** (v1 12), cap **32** (v1 26; the hall plus the Line fit is harder).
- **[C] (v2):**
  > A vast, dark, empty old stone hall at night whose high ceiling dissolves into a deep starry night sky, as if there were no roof at all. Hundreds of slim ivory candles float motionless in mid-air at many depths, with small steady flames and no holders or strings, and together they form one long, flowing, gently folded ribbon of light that crosses the frame from the lower left toward the right, densest along that single curve and thinning away from it. Near candles are soft and out of focus; far ones are tiny sharp points. The stone walls and tall windows are only barely visible at the far edges in the darkness. The camera is level. The left 40 percent is sparse and dark with only a few large, soft points; the top 12 percent is quiet night sky. No people, tables, banners, crests or house colours.
  
  Prompt = [A] + [B-HP] + [C] + [D] + [E2]. **Unexclusion:** the floating candles and the barely visible hall.
  
  After G2, add: "The ribbon's path follows the supplied line drawing" with `image_references:[<a code render of LINE_D as a thin grey line on black, 16:9>]` (the plan's **one upload**; no text; flagged for Aryan at G0).
- **Acceptance:**
  1. **Overlay vs `LINE_D`** (C): the density ridge within ±6% of height across x 20–95%.
  2. **Check L2, high attention:** our composition, not the film's wide shot of the hall; no banners, crests, tables or people (A + Claude, independently).
  3. **Left 40%:** p95 ≤ 0.10, so captions sit in the letterbox bars.
  4. Warm only: no aqua or cool cast beyond ≤ 1 glint (C: hue histogram).
- **Code alternative:** the ignition canvas's final frame rendered to a PNG at build time.

#### MV-08 — Last light (`last-light.webp`)
- **Purpose:** SPEC SM-12: the contact poster, and MV-09's start and end.
- **Model:** `gpt_image_2_5` 16:9 2k `xhigh` ×2, `image_references:[<MV-07>]` → **9** (cap 18).
- **[C] (v2):**
  > Darkness. One slim ivory candle floats alone at about 85 percent of the width and half the height, its small steady flame burning calmly with a soft warm halo that falls off quickly. A trail of six to ten dimmer, smaller floating candles curves away from it toward the left and ends before 60 percent of the width, each fainter than the last. The left 65 percent is even near-black with no detail; the top 15 percent is plain; the area within about 8 percent around the flame is calm so a small monogram and a thin frame can sit over it. No holder, table or surface.
  
  Prompt = [A] + [B-HP] + [C] + [D] + [E2]. **Unexclusion:** the floating candles.
- **Acceptance:** left 65% SD ≤ 3/255 and p95 ≤ 0.054 · top 15% plain · flame at x 82–88%, y 40–60%, with a calm ±8% surround · lower energy than MV-07 (A) · check L2.
- **Code alternative:** a code candle sprite plus trail points on `--hp-deep` (a static canvas render → PNG).

#### MV-09 — Last-light loop 8 s (`last-light-loop.mp4`)
- **Model (start = end = MV-08, 16:9, 8 s, silent):** `kling3_0` pro `sound "off"` (**14**) + `minimax_h3` 2K (**16**). Plan **30**, cap **60**.
- **Motion paragraph:**
  > Preserve the reference image exactly. Camera completely locked — no zoom, pan or focus shift. Only the flame's soft glow breathes very slowly — slightly brighter and back — by no more than about fifteen percent, in one calm cycle, never flickering, guttering or flashing. The candles, the trail of points and everything else stay perfectly still and dark. The same first and last frame. No new lights, smoke, sparks, particles, text, interface boxes or audio.
- **Acceptance:** HF-03 checks 1, 2, 4, 6 and 7 · left 65% and top 15% static (≤ 1/255) · flame-region luminance peak-to-trough ≤ 15%, no flash frames · calmer than MV-03 (A).
- **Code alternative:** the poster only.

#### W-01…05 — Candlelit writing covers · **DROPPED in v2**
Writing is the rdr2 journal; its right-page vignettes are code (SPEC SM-11, 0 credits). Aryan's own sketches may replace them as `authentic` media (RD-7). The v1 sheet is preserved in `MEDIA-PLAN.v1.md` for RD-1 option B.

---

### INTERMISSION — the films chapter stills (21:9, one per work; four)

**All four:** `gpt_image_2_5` **21:9** 2k `xhigh` ×2 (preflight; INFERRED ≈ 4.5 each → **9**), each referencing its own world anchor (F-RD may run at 2k `high`, ≈ 5.5). Plan **27 + 5.5**, cap **54 + 11**. Cropped in code to 2.39:1. Captions sit in the letterbox bars; each keeps its left 45% calmer for the finale motif.

#### F-PC — Pirates screen (`films-pirates.webp`), ref MV-01 (IC-PC-01)
> The black-sailed three-masted ship at anchor in still black water at night, seen from water level at a respectful distance, sails furled on black masts, its single stern lantern lit and reflected in long ripples; low sea fog drifts across the frame; a faint line of sea-glass aqua bioluminescence curves away from the hull into the darkness toward the left. Nobody on deck, no flag marking, no lettering on the hull. The left 45 percent is calm dark water and fog.

Prompt = [A] + [B-PC] + above + [D] + [E2]. **Unexclusion:** the one ship at anchor.

#### F-3I — 3 Idiots screen (`films-idiots.webp`), ref MV-06 (IC-3I-10)
> A high, still, deep-blue mountain lake at first light, pale bare mountains beyond, the water perfectly calm; on the pebbled shore at about 72 percent of the width, one small yellow motor scooter is parked, alone, catching the first sun: the only warm colour in the frame. The left 45 percent is calm water and pale sky.

Prompt = [A] + [B-3I] (light only) + above + [D] + [E2]. **Unexclusion:** the one yellow scooter (no brand badges or plates). No people, no reunion tableau.

#### F-RD — RDR2 screen (`films-rdr2.webp`), ref MV-10 (IC-RD-05/06)
> A long ridge line at dusk in afterglow, the sky fading from gold to deep blue; on the ridge at the right third, one riderless saddled horse stands at rest, small, as a dark silhouette against the light. The left 45 percent is calm dark foreground and sky.

Prompt = [A] + [B-RD] + above + [D] + [E2] + [E-RD]. **Unexclusion:** the one riderless horse. (Preflight 21:9.)

#### F-HP — Harry Potter screen (`films-hp.webp`), ref MV-07 (IC-HP-03)
> An unwritten sheet of heavy cream paper lies on a dark wooden desk in darkness. From one point near its centre, a fine line of dark ink has begun to spread outward on its own in delicate branching contours — flowing organic lines only: not letters, not a map, not a plan, not footprints. Several slim ivory candles float above the desk at varied depths with small steady flames, softly out of focus; a single cool blue-white glint catches the wet ink. No pen, quill, book, envelope, seal or person. The paper sits in the right half; the left half is dark.

Prompt = [A] + [B-HP] + above + [D] + [E2]. **Unexclusion:** the floating candles.

**Acceptance (all four):**
- The left 45% is calm (SD ≤ 8/255).
- It reads as its world at thumbnail size (A).
- **Check L2, high attention:** F-PC our anchorage, no crew or flag; F-3I no people, the scooter unbranded; F-RD horse anatomy and no rider; F-HP ink lines ≠ a map or letters.
- No two screens look alike, and none repeats its section's plate composition (the Pearl is larger here than in MV-01; the frontier is dusk here, golden hour in MV-10).

**Code alternative:** a declared reuse of MV-05d / MV-06 / MV-10 / MV-07 crops (DESIGN §7 exception ②), at 0 credits.

---

## 5. Generation order and parallelism with the code build

The **code build never waits for media**: every section renders from `resolveMedia` fallbacks or code alternatives until an asset is `accepted`. The media stages below run **in parallel with** SPEC §17 build phases 1–4. Status as of 2026-09-28 18:45 ET in the last column.

| Stage | Runs | Depends on | Parallel within stage | Code work unblocked meanwhile | Status |
|---|---|---|---|---|---|
| **S0** | G0 sign-off; balance check | — | — | Phase 1 foundation | v2 line (RD-6) pending |
| **S1** | Composition drafts: **M-01**, **IN-C**, **MV-06-C**, **MV-07-C**, **MV-10-C**, **MV-11-C** | G0 | All in one batch (independent worlds) | `/lab`: the code flight, Card I→II, Card II→III tintype, Card III→IV code embers | M-01, IN-C done |
| **S2** | Anchors: **MV-01** (→ G2 mock → `LINE_D`), **IN-01**, **MV-06**, **MV-07**, **MV-10** | G1 | IN-01, MV-06, MV-07, MV-10 in parallel; MV-01 alone | Hero on fallback; ledger; chapters and schematics (0 media) | MV-01, IN-01 accepted (A pending) |
| **S3** | **MV-02**, **MV-04**, **MV-05a–d** (ref MV-01); **IN-01m** (ref IN-01); **MV-08** (ref MV-07); **MV-10m**, **MV-11** (ref MV-10) | S2 anchors | One or two `generate_image_batch` calls | `LINE_D` into the cards; the Journey column (stills); Beyond and Voices on stills | MV-02, IN-01m accepted |
| **S4** | **MV-03** drafts → final; **IN-02** motion drafts | MV-01, IN-01 (G3) | MV-03 and the IN-02 drafts in parallel | The intro controller (code flight first); hero integration | **in flight** |
| **S5** | **IN-02** finals → trail bake; **JV-1…3**; **MV-09**; **MV-11L** (G8) | S4 drafts; MV-05 set (G4); MV-08 (G5); MV-11 | In parallel (different jobs) | The Journey sequence; the intro video; contact; Voices loop | — |
| **S6** | **F-PC / F-3I / F-RD / F-HP** (G6) | the world anchors | All in one batch | The films chapter | — |
| **S7** | Re-dos from the buffer (≈ 209) only on Aryan's request or for a forced upstream regeneration | — | — | Hardening, fixtures A–L | — |

---

## 6. Acceptance checks

### 6.1 Common checklist A–M (applies to every asset; any FAIL = reject)
| # | Check | How |
|---|---|---|
| A | No text, letters, numbers, logos or pseudo-glyphs | 100% zoom sweep (A + Claude) |
| B | No people, figures, silhouettes, **riders**, hands, faces or costume-as-person shapes (H1); animals only where unexcluded (horses, the owl) and anatomically clean | Sweep; video at 4 fps |
| C | **No marks and no remake (v2):** no logo, crest, wordmark, flag marking, HUD/UI replica; not a frame-for-frame remake of a film shot or a game screenshot (L2 ③④). The icon is allowed; the copy is not | Sweep against ICONS §1 and the sheet's unexclusions |
| D | Composition zones per sheet | sharp crops + thresholds (C) |
| E | Contrast zones where live text overlaps (95th-percentile luminance) | sharp (C) |
| F | Background tone within ±4/channel of the world ground, or flag a levels match | Corner patches (C) |
| G | Family resemblance within the world (anchor side by side) | A |
| H | Temporal stability (video): join SSIM, static regions, exposure breathing | ffmpeg (C) |
| I | Silent: `ffprobe` shows no audio stream; transcode with `-an` | C |
| J | Delivery: dimensions, codec, size budget | ffprobe/sharp (C) |
| K | Honesty: not evidence; no encoded counts; no numbers; never depicts Aryan | A |
| **L2** | **Check L2 (v2; replaces check L):** ① ours (text-only prompt, no film refs) · ② no faces · ③ no marks · ④ the subject, not the shot · ⑤ crafted (the admissions-reader test) | Claude **and** Aryan, independently; logged with dates |
| M | Provenance logged (model, credits, date, job id, gate, check L2 signers) | LEDGER |

### 6.2 Mechanical recipes (PROMPTS §7, plus new)
| Check | Recipe | Pass |
|---|---|---|
| Zone luminance | sharp crop → linear relative luminance → 95th percentile (`media/tools/check.mjs`) | Per sheet (0.054 / 0.09 / 0.10 / 0.146) |
| Aqua in the calm band | HSV mask, hue 165–180°, saturation > 0.3 | < 0.05% of pixels |
| Ghost text | `media/tools/ghost.cjs`: 9× shadow gain | No letterforms |
| **Line overlay** (MV-01 / MV-04 / MV-07) | Rasterize `LINE_D` at plate size; compare with the aqua-mask centreline or luminance ridge per column | ≤ ±4% height (MV-04) · ±6% (MV-07); MV-01 is the source |
| **Registration** (IN-02) | `ffmpeg -threads 2 -sseof -0.04 -i in02.mp4 -frames:v 1 last.png`, scale both to 960×540, then `ssim` against MV-01 | ≥ 0.95 |
| **Broom exit** (IN-02) | Extract the final 0.4 s at 12 fps; A review, plus a diff vs MV-01 ≤ 3/255 mean | No broom |
| **Flash safety** (all video; MV-11L fire) | `signalstats` YAVG per frame → linear; also per 4 × 4 tile; count opposing ≥ 10% changes per 1 s window over ≥ 25% of area (`media/tools/vcheck.py`) | ≤ 3 per s (target 0); no saturated-red transitions; fire flicker ≤ 2 Hz |
| Loop join | frame 0 and last vs the still; `-stream_loop 3` for viewing | ≥ 0.95 / ≥ 0.97 |
| Static regions | `tblend=difference`, crop, `signalstats` | ≤ 2/255 (MV-03), ≤ 1/255 (MV-09, MV-11L left 55%) |
| **Horse anatomy** (MV-10, MV-10m, F-RD) | 200% crop review, 2 reviewers | 4 legs, one head, no fusions, no rider |
| Sequence beats (JV) | SSIM of clip ends vs stills | ≥ 0.93 |
| **Trail bake** (IN-02) | JSON points, last 1.2 s, vs the h1 rect at 1440×900 and 1024×768 | ≥ 24 px away |
| Silent | `ffprobe -select_streams a` | empty |

---

## 7. Made in code, not in Higgsfield (0 credits)
- **Brand and type:** all text; the bracket and `[AS]` SVGs; the AS monogram; **the outlined world lettering** (Chinese Rocks outlines; self-hosted OFL faces).
- **The Line:** `LINE_D` and its **four** materials (brass, blueprint, graphite, ink-light); FIG. 0 with **computed** dimensions.
- **Loaders:** Jack's compass (LD-PC), the LD-3I gear train and rack, **the LD-RD tintype plate, graphite trail and campfire sprites**, the LD-HP ink and candle points (sprites pre-rendered at build time).
- **Pirates icons:** Jack's compass with the red arrow and lid star chart; the cartouche; the Aztec medallion; the brass X; the optional rings.
- **3 Idiots icons:** the gate chalk diagram, Rancho's circles, the jugaad schematics, the quadcopter doodle, the space-pen caption.
- **RDR2 icons:** the tintype treatment and develop mask (R-2), the graphite strokes and hachures (R-1), the trail map and its fog (R-5), the running-shoe prints, the satchel strip, the handbill (R-4), the journal spread and its five vignettes, the Dead Eye mode (R-3), the campfire sprites (R-6).
- **HP icons:** the SVG broom and castle silhouette (code flight), the candle sprites, the ember → candle ignition, the Marauder's Map egg, the Snitch, the Patronus particles, the Time-Turner, the Hallows glyph, the bolt favicon.
- **Journey and act cards:** the Journey course, waypoints and compass; the opening card course.
- **The IceCut mask:** a Perlin ragged PNG, baked with a fixed seed.
- **Grounds:** the letterbox (the ground is the bars), the rhumb lattice, the graph grid.
- **Derived media:** `-mono.webp` variants (sharp); the grain PNG for VelocityNoise; the tintype treatment of Aryan's own photos (CSS on `authentic` files).
- **Evidence:** every real chart or figure (the `dataviz` skill). Never generated.

---

## 8. Ledger and budget summary

**Ledger template** (the live file is `research/build/media/LEDGER.md`; one row per job; rejected rows stay):
```
| # | Date/time ET | Gate | World | Asset | Stage/batch | Model | Params (ar/res/quality/mode/dur/audio) | Refs (job ids) | Count | Preflight | Charged | Balance after | Job id(s) | Verdict | Failed check / reason | Check L2 (Claude/Aryan, date) | Approved by |
```
**Running totals:** `Spent: ___ / 950 cap · Balance: ___ (floor 250) · Reserve ≥250 intact: yes/no · Buffer used: ___ / ≈ 209`

| Asset | World | Plan | Cap | Stage | Status (18:45 ET) |
|---|---|---|---|---|---|
| IN-C comps | prologue | 2 | 4 | S1 | spent 2 · winner `43692ae9` |
| IN-01 | prologue | 11 | 25 | S2 | spent 11 · **accepted** `3edb46de` |
| IN-01m | prologue | 6.75 | 8 | S3 | spent 6.75 · **accepted** `57484139` |
| IN-02 (Routes A + B) | prologue | 58 | 140 | S4–S5 | draft in flight |
| M-01 | pirates | 5.5 | 11 | S1 | spent 5.5 · winner `4f98076c` |
| MV-01 | pirates | 11 | 25 | S2 | spent 11 · **accepted** `548e5fc0` |
| MV-02 | pirates | 6.75 | 8 | S3 | spent 6.75 · **accepted** `10b81664` |
| MV-03 | pirates | 30 | 80 | S4 | in flight |
| MV-04 | pirates | 15 | 29 | S3 | — |
| MV-05a–d | pirates | 22 | 44 | S3 | — |
| JV-1…3 | pirates | 66 | 110 | S5 | — |
| MV-06 (+ comp) | idiots | 10 | 19 | S1–S2 | — |
| **MV-10 (+ comps)** | **rdr2** | **9.5** | **16** | S1–S2 | — |
| **MV-10m** | **rdr2** | **4** | **6** | S3 | — |
| **MV-11 (+ comp)** | **rdr2** | **6.5** | **13** | S1–S3 | — |
| **MV-11L** | **rdr2** | **14** | **28** | S5 | — |
| MV-07 (+ comps) | hp | 14 | 32 | S1–S2 | — |
| MV-08 | hp | 9 | 18 | S3 | — |
| MV-09 | hp | 30 | 60 | S5 | — |
| F-PC / F-3I / F-HP | intermission | 27 | 54 | S6 | — |
| **F-RD** | intermission | **5.5** | **11** | S6 | — |
| ~~W-01…05~~ | — | 0 | 0 | — | dropped (v2) |
| **Total** | | **≈ 364** | **≈ 741** | | + a buffer of ≈ 209 = **950 cap**; floor 250 |

**M2 registration (integrator, 2026-09-29).** Every row above from MV-04 to F-HP is now **accepted and registered** in `lib/media.ts` (files in `public/media/films/`), each DEFAULT with its ALT (`<id>-alt`), job ids from `media/LEDGER-laneA.md` / `LEDGER-laneB.md`: MV-04 `350f546b`, MV-05a–d `6ce86233 · 57a84723 · bcb620aa · f73d3e86`, JV (`voyage-seq/`, 72 frames; JV-1…3 `ab5526ac · 169d76b5 · ee674bcf`), MV-06 `4686928b`, MV-10 `32281e86`, MV-10m `8f6f4c4f`, MV-11 `a2e95902`, MV-11L `d4086e11`, MV-07 `5155788f`, MV-08 `b31ef3f6`, MV-09 `154f82ce`, F-PC `8c581de2`, F-3I `a4ec7e96`, F-RD `7a6da513`, F-HP `0b8c414a`; loop posters as `MV-11L-poster` / `MV-09-poster`. Exceptions: **MV-06-alt is `received`** (fails board evenness; the alt variant plays the DEFAULT until Aryan accepts it) and **MV-01-alt is `received`** (a reject; the hero plays MV-01 under both variants). MV-02-alt / MV-03-alt now point at the alt2 files (`37eb75b2`, `f5130107`); the rejected M1.5 alt files left `public/`. The **eight iconic plates** (M2-R lane, `media/LEDGER-m2iconic.md`, 140 credits) are registered **accepted** too: `iconic-{pearl,ice,drone,camp,wanted,deadeye,hall,express}` + `-alt`, with provisional anchors (`marks` / `rects`: `mastTop`, `boardRect` + `ledgeL/R`, `fire`, `posterRect`, `lineStart`) for the builders to re-measure. The Check L2 countersignature (Aryan) is pending on every one.

**Manifest provenance** (from the ledger into `lib/media.ts`):
- `provenance: { source:"higgsfield", model, credits, date, jobId }`
- `accept: { people:false, likeness:false, text:false, ripped:false, icon?, checkL2:"claude:<date>+aryan:<date>" }`
- status goes `received → accepted` at the gate, then `integrated` at build
- M-01, IN-C and the other comps are **never** entered; masters never enter `public/`

**Questions for Aryan at G0 (v2):**
1. Is the new cap (950 including the 113.5 already spent) with a floor of 250 acceptable (RD-6)?
2. Countersign check L2 for the four accepted assets (MV-01, MV-02, IN-01, IN-01m) and the G2 mock.
3. The RDR2 set (MV-10, MV-10m, MV-11, MV-11L, F-RD): approve, and approve riderless horses in generated media?
4. The Journey sequence (≈ 66) vs four stills (F-8)?
5. May Claude make the plan's one local upload (the `LINE_D` guide image for MV-07)?
6. The hidden kraken in MV-04 and the optional distant Pearl in MV-05d: keep?
7. Serve the most iconic plates from a media bucket instead of the public repo (storage hardening)?