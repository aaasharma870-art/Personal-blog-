# MEDIA-PLAN — Higgsfield assets for "One Line, Three Lights"

**Status: PLAN ONLY.** Nothing in this file has been generated and **0 credits are spent**. No generation runs until gate **G0** is signed by Aryan in his own words.
**Supersedes:** the D3 sculpture pack in `higgsfield/PROMPTS.md` (HF-01…09, W, SF-01, HF-07).
**Reused from PROMPTS.md unchanged:**
- the run protocol (§0)
- the model ids, parameter names and **OBSERVED 2026-09-28 preflight prices** (§2)
- the mechanical checks (§7)
- the ledger template (§8.2)
- the text-removal-from-mock technique (M-01 → plate)
- the brief's shared exclusions (§3.2, verbatim)

**Reads with:** `build/SPEC.md` (where each asset lives), `build/DESIGN.md` §7 (media rules) and §11.6 (the legal DO-NOT list), `build/bars/*.BAR.md`.
**Labels:** OBSERVED (preflights, schemas) · INFERRED · PROPOSED. **Every price must be re-preflighted** (`get_cost: true`) before each run, because prices change.

---

## 0. Budget, floor, gates

| Line | Credits |
|---|---|
| Balance at last read (OBSERVED 2026-09-28, PROMPTS §8.1) | **1,197**. Re-check with `balance` at G0 |
| **Reserve, never spent by this plan** | **≥ 250** |
| **Program cap** (sum of per-asset caps ≈ 716, plus a 34 unallocated retry buffer) | **750** |
| **Program floor: stop all spending at this balance** | **447** (= 1,197 − 750) |
| Planned spend (first-pass preflights) | **≈ 344** |
| Aryan's ceiling | "≤ ~900 total, keep ~250 reserve". The cap of 750 and floor of 447 are inside it |

**Gates.** A = Aryan approves in his own words; C = Claude runs the mechanical checks in §6 and reports; L = check L signed by Claude **and** Aryan.

| Gate | Before | Who | Approve |
|---|---|---|---|
| **G0** | Any credit | A | This plan, the cap of 750 and floor of 447. Whether W-01…05 are wanted (SPEC F-4). The Journey sequence vs stills (F-8) |
| **G1** | Any finals | A | Composition drafts: M-01 (hero at sea with placeholder type), IN-C (play screen), MV-06-C, MV-07-C |
| **G2** | Everything downstream of MV-01 | C + L + A | MV-01 passes §6 **and** a browser mockup at 1440/390 with a live Geist h1 (one throttled browser, a scratch page under `research/higgsfield/lab/`). **The most important gate.** Then hand-fit `LINE_D` |
| **G3** | IN-02 | C + L + A | IN-01 (final) and MV-01 approved; the IN-02 motion drafts reviewed |
| **G4** | JV clips | C + A | MV-05a–d approved as a matched set (a 4-up strip) |
| **G5** | MV-09 | C + A | MV-08 passes |
| **G6** | F-PC / F-3I / F-HP | C + L + A | Their world anchors (MV-01, MV-06, MV-07) are accepted |
| **G7** | W-01…05 | A | Aryan confirms the covers are still wanted |

**Hard stops (every run):**
- A run would take the balance below 447.
- A candidate shows a person, text, a trademarked design or a film-recognizable composition.
- An audio stream is present after the transcode.

---

## 1. Run protocol (PROMPTS §0, updated)
1. **Gate check** (the §0 table).
2. **Balance check.** Stop if the run would cross the floor (447).
3. **Cost preflight** (`get_cost: true`). Write the number in the ledger **before** the run.
4. **Run small batches** (`count: 2`, or one per model when comparing).
   - Every reference is the **job id** of an approved generation. No uploads.
   - **Video always runs silent:** `sound: "off"` (Kling), `generate_audio: false` (Seedance, FLUX). Transcode with `-an` regardless.
5. **Wait and collect:** `jobs_wait` → one `show_generation_by_ids`. Masters go to `research/higgsfield/masters/<id>/`, never `public/`.
6. **Inspect** with the §6 checks (sharp; ffmpeg/ffprobe with `-threads 2`), then show Aryan the candidates side by side.
7. **Log** in `research/higgsfield/LEDGER.md` (the §8 template, with a new **World** column and a **Check L** column).
8. **Cheap drafts first:**
   - stills: composition tests at `gpt_image_2_5` 2k `medium` (**1**) or `nano_banana_pro` 2k (**2**)
   - motion: `seedance_2_0` 480p `fast` (**8**) with start/end frames
   - only approved drafts get a final render

**Never in any prompt:** a film title, franchise word, character name, place name from the films, studio name, spell or catchphrase. Prompts describe **weather and light**, never the films.

---

## 2. The film-world recipe

**Full still prompt** = **[A] shared direction** + **[B] world paragraph** + **[C] asset paragraph** + **[D] shared exclusions** + **[E] film-world exclusions** (+ asset unexclusions).
**Video prompts** = the motion paragraph + a motion-exclusions line (PROMPTS §3.1 video hygiene: camera discipline, explicit negatives, 3–4 candidates, watch for baked-in UI boxes).

### [A] Shared direction (prepended to every still)
> Original cinematic artwork for a personal research journal. Natural practical light only — moonlight, bioluminescence, lantern light, small flames or low raking daylight — with deep but readable shadows and restrained contrast. Locked tripod camera, natural 35–50 mm lens feel, fine natural texture, no heavy bloom. Generous calm empty space on the left for live typography. Everything belongs to one consistent, quiet visual world. Artwork only, without any interface, lettering or typography.

### [B] World paragraphs
- **[B-HP] Candlelit night** (the prologue and Act III):
  > World: a candlelit night. Deep blue-black and warm near-black, with small warm flame-coloured points of light and an occasional cool blue-white glint. Anything magical is suggested only by light appearing out of darkness — never by objects, symbols, creatures or places.
- **[B-PC] The open sea at night** (Act I):
  > World: the open sea at night. Abyssal teal-black and moonlit slate, with sea-glass aqua bioluminescence as the only saturated colour and a single distant warm lantern light as the only warmth. The sea is empty: no vessels, coastlines, buildings or objects.
- **[B-3I] A workshop at first light** (Act II):
  > World: a workshop at first light. Green-black slate, chalk white and one pale gold beam of low morning daylight; fine dust hangs in the light. Everything is clean, honest and hand-made, and nothing is written on any surface.

### [D] Shared exclusions (PROMPTS §3.2, verbatim)
> Exclude text, letters, numbers, logos, charts, axes, stock tickers, dashboards, UI panels, currency symbols, financial returns, trophies, certificates, people, hands, faces, city skylines, rockets, robots, brains, infinity symbols, crypto coins, neon cyberpunk decoration, rainbow gradients, busy star fields, heavy bloom, blinding highlights, noisy film grain, tiny unstable lines, impossible intersections, and copied branded objects. Do not add borders or baked-in letterboxing.

### [E] Film-world exclusions (appended to every still and every video)
> Also exclude: any person, figure, silhouette, rider, animal or creature; ships, boats, sails, masts, flags, skulls, treasure, maps, globes, compasses or any navigation instrument; castles, towers, spires, halls, vaulted ceilings, arches, stained glass, portraits, banners, crests or shields; wands, hats, scarves, owls, round glasses or lightning-bolt shapes; candlesticks, candelabras or visible candle bodies; brooms (unless one plain broom is described above); chalk writing, formulas, symbols, arrows or marks on any surface; school buildings, lecture halls, corridors, vehicles, scooters, drones or propellers; mountain lakes; any recognizable film location, prop, costume, poster composition or title design.

**Style references:** each world has one **anchor** job id, passed as `image_references` to every later still of that world:
- Pirates: **MV-01**
- 3 Idiots: **MV-06**
- HP night (Act III): **MV-07**
- the prologue: **IN-01**

Across worlds, **no** reference is passed (worlds must differ), except where registration requires it (MV-01 as IN-02's end frame).

---

## 3. Models and prices (OBSERVED preflights 2026-09-28, PROMPTS §2; per output)
| Model | Use | Price |
|---|---|---|
| `gpt_image_2_5` | Composition drafts, finals, 21:9 film stills | 16:9 2k medium **1** · 2k high **2.75** · 2k xhigh **4.5** · 4k xhigh **7** · 3:2 2k high **2.75** · 21:9: preflight (INFERRED ≈ 16:9) |
| `nano_banana_pro` | Matched edits and recompositions from a reference | 2k **2** · 4k **4** |
| `kling3_0` | Pinned start/end loops and flights, `sound:"off"` | pro 8 s **14** · 10 s 17.5 · 6 s / 5 s: preflight (INFERRED ≈ 1.75/s) · `4k` 8 s **48** |
| `minimax_h3` | Alternative pinned loop | 2K 8 s **16** |
| `seedance_2_0` | Cheap motion drafts with start/end, `generate_audio:false` | 480p `fast` **8** |
| `seedance_2_5` | Draft → finalize route, `mode:"omni_reference"` | draft 480p **24**; finalize: preflight via `draft_job_id` |

**Unverified (check at the first delivery):**
- Kling `pro` output resolution
- whether 9:16 is accepted by `nano_banana_pro` and `gpt_image_2_5` (the fallback is 4:5 plus a canvas ground extension)
- 21:9 pricing

---

## 4. Asset sheets

Every sheet lists: **ID · purpose and section · model/settings · refs · full prompt ([A]+[B] are implied where marked; [C] is written out) · acceptance (common A–M in §6, plus the asset checks) · credits plan/cap · code alternative**.

---

### PROLOGUE (HP night)

#### IN-C — Play-screen composition drafts (never shipped)
- **Purpose:** decide the play-screen composition cheaply before the final.
- **Model:** `gpt_image_2_5` 16:9 2k `medium`, `count 2` → **2** (cap 4).
- **Prompt:** [A] + [B-HP] + the IN-01 [C] below + [D] + [E].
- **Acceptance:** the broom placement, a calm left zone, a readable cloud sea, check L (A + Claude).

#### IN-01 — Play-screen plate, desktop 16:9 (`intro-play.webp`)
- **Purpose:**
  - SPEC §5.2: drawn into the intro canvas behind the text and Play control
  - the **start frame of IN-02**
  - the prologue style anchor
- **Model:** `gpt_image_2_5` 16:9 4k `xhigh` (**7**) + `nano_banana_pro` 16:9 4k (**4**), both with `image_references:[<IN-C winner>]`. Plan **11**, cap **25**.
- **[C] asset paragraph:**
  > A night sky high above a slowly moving sea of moonlit cloud tops, seen from just above the clouds. The upper sky is deep blue-black with a few faint stars and a soft moon glow hidden behind thin haze at the upper right. Twenty to thirty small warm points of flame-light drift at many different depths above the clouds — near ones larger and softly out of focus, far ones tiny — with no candles, holders or wax visible, only small flames and their soft glow. At about 64 percent of the width and 50 percent of the height a single plain broom hovers horizontally in the air, angled slightly right and away from the viewer: a straight, slightly uneven natural ash-wood handle and a bound bundle of dry birch twigs tied with simple cord, with no markings, no metal fittings, no footrests and no rider. A faint cool blue-white rim light catches the top of the handle. The left 45 percent of the frame is calm, dark, even sky with only two or three very distant points of light, especially between 28 and 64 percent of the height, where live lettering and a play control will sit. The top 12 percent is quiet. The cloud tops fill the lower third, softly moonlit, fading to darkness at the bottom edge. Unexclusion: the one plain broom described here is allowed.
- **Acceptance (beyond common A–M):**
  1. **Play-zone luminance** (x 9–46%, y 28–64%): 95th-percentile relative luminance ≤ **0.054**, so ink ≥ 7:1 and stone ≥ 4.5:1 without a scrim (C).
  2. The broom centroid is at (64 ± 4%, 50 ± 5%). It is a **plain besom**: no streamlined racing shape, no lettering, no metal bands or stirrups (A + Claude).
  3. 15–40 visible warm points; **no candle bodies, no holders**; the lights read as scattered points, not an overhead ceiling (A).
  4. No castle-like shapes in the cloud silhouettes (A, at 100% and 25% zoom).
  5. The top 12% is quiet; corner tone within ±4/channel of `#06080d`, or flag a levels match in code (C).
- **Code alternative (0 credits):** a CSS night ground plus a canvas of ≤ 40 code motes plus the original SVG besom silhouette (the mobile flight asset). The intro still works.

#### IN-01m — Play-screen plate, mobile portrait (`intro-play-mobile.webp`)
- **Purpose:** the mobile and low-power intro still (SPEC §5.4).
- **Model:** `nano_banana_pro` **9:16** 2k (verify the aspect; else 4:5), `count 2`, `image_references:[<IN-01>]` → **4** (cap 8).
- **Prompt:** "Recompose the supplied image into a tall portrait frame; keep the same broom, lights, sky and cloud sea." + [A] + [B-HP] +
  > Place the plain riderless broom in the upper-middle of the frame at about 30 percent of the height, centred. Keep the floating warm points around and above it. The lower half above the cloud tops is calm, dark, even sky for a play control; the cloud tops occupy only the bottom 12 percent. Keep the top 8 percent plain. Unexclusion: the one plain broom is allowed.
  
  + [D] + [E].
- **Acceptance:** the lower-half luminance 95th percentile ≤ 0.054; the broom is the same object as IN-01 (A); check L.
- **Code alternative:** a considered crop of IN-01 (0 credits).

#### IN-02 — The broom flight, desktop (`intro-flight.mp4` / `.webm`)
- **Purpose:** SPEC §5.3. The time-driven chase from the play screen to the hero. **Start frame = IN-01, end frame = MV-01**, so the landing registers on the live hero.
- **Route A (one continuous shot):**
  - **Drafts** (motion feasibility, after G3): `seedance_2_0` `mode "fast"` 480p, `start_image:<IN-01>`, `end_image:<MV-01>`, `duration 6` (or the nearest allowed), `generate_audio:false`, 2 runs → **16**; plus `kling3_0` `mode "pro"` `duration 6` `sound "off"` start/end, 1 run → ≈ **10.5** (preflight).
  - **Finals:** `kling3_0` pro 6 s × 2 candidates → ≈ **21** (preflight). If pro output is below 1920×1080, re-run the winner at `mode "4k"` (preflight; 8 s = 48, so ≈ 36 for 6 s). Alternatively `minimax_h3` 2K 6 s (preflight ≈ 12).
  - Plan ≈ **58**.
- **Route B (only if Route A can't hold the broom or the camera path):**
  - **IN-K1** keyframe still: `nano_banana_pro` 16:9 4k, refs `[IN-01, MV-01]` → **4** (×2 = 8).
  - Then **IN-02a** (IN-01 → IN-K1, 3 s) and **IN-02b** (IN-K1 → MV-01, 3–4 s) on `kling3_0` pro (≈ 5.25 + 7 each, ×2 candidates), joined **on the shared K1 frame**, which is a hard cut on an identical frame, so it is invisible and has no flash.
  - Route B adds ≈ 40.
- **Cap for IN-02 (both routes):** **140**.
- **Motion paragraph:**
  > Camera follows the broom in one smooth continuous move. From the first frame, the plain riderless broom tips forward and glides away from the camera; the camera follows close behind and slightly above it. They pass between the small floating flame-lights, which slide past at different depths, then dip into the cloud tops and descend through soft grey moonlit cloud — gradually, never a white flash — and emerge beneath the clouds above a dark open ocean at night. The broom skims low along a long glowing sea-glass aqua wave crest from the middle of the frame toward the right, then rises and shrinks away toward a tiny warm light on the far horizon until it is gone. The camera eases to a stop and settles exactly on the last frame: the empty night ocean with the aqua wave crest and the distant warm light, and no broom. Calm, graceful, six seconds, one continuous shot.
- **Motion exclusions:**
  > No rider, person, hands, animal or creature; no buildings, castle, towers, ship, sails, land or coastline; no text, letters, interface boxes or tracking squares; no lens-flare bursts, flashes, strobing, or sudden exposure changes; no cuts; no audio.
- **Acceptance (beyond common A–M):**
  1. **Registration** (C): the last frame vs MV-01 at 960×540, SSIM ≥ **0.95**; the first frame vs IN-01, SSIM ≥ **0.95**.
  2. **The broom is gone** ≥ 0.4 s before the end: no broom pixels in the final 0.4 s (frame review at 12 fps) (C + A).
  3. **No rider, no figure** in any frame (a review at 4 fps, plus A watching 3× in real time).
  4. **Flash safety** (C): per-frame mean relative luminance (ffmpeg `signalstats` YAVG → linear), with no more than 3 changes of ≥ 10% of max luminance over ≥ 25% of the frame in any 1 s window (WCAG 2.3.1 general flash, measured conservatively on whole-frame and 4 × 4 tile means). Also no red flashes.
  5. **Smoothness** (C): consecutive-frame SSIM ≥ 0.6 everywhere except inside the cloud passage (logged).
  6. **Silent**, then `-an` (C). **Delivery:** 1920×1080 H.264 CRF ≈ 26 plus WebM, ≤ **4 MB**, 6.0 ± 0.2 s.
  7. **Check L** on 8 evenly spaced frames: no frame could be mistaken for a still from the film (A + Claude).
- **Trail bake** (code, 0 credits): step the approved video at 12 fps and hand-mark the broom-tip position → `lib/intro-trail.json` `{t, x, y}` in 0–1 plate coordinates. Validation: in the last 1.2 s, every point is ≥ 24 px from the h1 rect at 1440×900 and 1024×768 (computed against `object-fit: cover` + focal).
- **Code alternative:** the **code flight** (SPEC §5.4) on desktop too: the SVG besom + canvas trail over IN-01, then a dome exit onto the page. It needs 0 credits and is always shipped as the fallback.

---

### ACT I — PIRATES (sea)

#### M-01 — Hero composition mock at sea (never shipped)
- **Purpose:** decide the hero in pixels (the Viktor method): the huge name in front of the wave's calm tail, plus the lead, the CTA and a quiet header. Status `reference-only`; never in `public/` or `lib/media.ts`.
- **Model:** `gpt_image_2_5` 16:9 2k `high`, `count 2`, no refs → **5.5** (cap 11).
- **Prompt** (adapted: typography is intentional here, so [A]'s "without typography" is dropped):
  > A high-fidelity desktop website hero screenshot, 16:9, for the personal research journal of a high-school quantitative researcher. The whole frame is a night seascape used as the page background. A black open ocean at night under low overcast, the horizon at about 40 percent of the height. One long bioluminescent wave crest glows a restrained sea-glass aqua (#2dd4bf) across the right half, from about 46 to 94 percent of the width, brightest on its right edges; its tail to the left dissolves into dark water and fog by about 38 percent of the width, and that tail is dark with no aqua. One tiny warm lantern light sits on the far horizon at about 88 percent of the width. The left 35 percent is smooth near-black. Placeholder typography in a clean neo-grotesk like Geist, regular weight, tight letter-spacing, near-white #e6edf3: "Aryan" on one line and "Sharma" on the next, very large (capitals about 12 percent of the frame height), left-aligned at about 9 percent from the left edge, spanning about 28 to 64 percent of the height; the end of "Sharma" overlaps the dark fog of the wave's tail, with the letters in front of the sea. Below, a two-line lead in small grey-blue #9db0bd text, about 35 percent of the width wide: "I build quantitative systems, understand markets, and want the technical and business training to scale that." Under it, one small text link "View the quant portfolio ↓". In the top 8 percent only: a small "AS" monogram at top left; at top right the word "Work", a tiny flat wave-line icon, and the word "Menu". The name is the largest, brightest element. No boats, people, cards, boxes, pills, charts, numbers, glow orbs, gradients or borders.
- **Acceptance:** the name reads first; the overlap sits on the dark tail, not on aqua; the lead zone sits on empty dark; no Slop V2; check L.

#### MV-01 — Hero sea plate (`hero-sea.webp`): the Act I anchor
- **Purpose:**
  - SPEC §6: the hero poster and aperture media
  - **IN-02's end frame**
  - MV-03's start and end
  - MV-04's edit source
  - the Pirates style anchor
  - the source `LINE_D` is fitted to
- **Route A (text removal from M-01):** `gpt_image_2_5` 16:9 4k `xhigh` (**7**) + `nano_banana_pro` 16:9 4k (**4**), both `image_references:[<M-01 winner>]`. **Route B** (fresh, the mock as layout ref): `gpt_image_2_5` 4k xhigh ×2 (**14**). Plan **11**, cap **25**.
- **Route A prompt:** an edit lead ("Edit the supplied image. Keep it exactly as it is — the same sea, wave, light, horizon, camera and colours, with no zoom in or out and no reframing. Remove every piece of typography and interface… where letters covered the fog and dark water, continue them exactly as they would look without text. Deliver a clean 4K plate with no text at all.") + [A] + [B-PC] + the [C] below + [D] + [E].
- **[C] asset paragraph (Route B, and the composition to preserve in A):**
  > A black open ocean at night under a low, heavy overcast, seen from just above the water with the horizon at about 40 percent of the frame height. One long bioluminescent wave crest folds across the right half of the frame: its body glows a restrained sea-glass aqua from about 46 to 94 percent of the width, brightest toward its right and upper-right edges, following one asymmetric folded curve like a single drawn line; its tail to the left dissolves into dark water and low drifting fog by about 38 percent of the width. Between about 36 and 52 percent of the width and 28 to 66 percent of the height lies a calm band — dark water and fog with no aqua, no reflections and no fine detail — where large live lettering will overlap. On the far horizon at about 88 percent of the width, one tiny steady warm light like a distant lantern is the only warm point in the frame. A faint moon glow sits behind the overcast at the upper right. The left 35 percent is smooth, even, near-black water and sky; the top 12 percent is plain; the bottom fades into dark water. Broad forms that survive being seen small and under a fine grain overlay.
- **Acceptance (beyond common):** the PROMPTS HF-01 checks, adapted:
  1. **Calm band** x 36–52% × y 28–66%: 95th-percentile luminance ≤ **0.146** (ink ≥ 4.5:1), with **0 aqua pixels** (hue 165–180°, saturation > 0.3; noise < 0.05%).
  2. **Lead zone** x 9–45% × y 66–80%: ≤ **0.054**.
  3. **Crest bounding box** (aqua mask): left body edge 44–50%, right ≤ 95%, tail aqua ≤ 40%. Record `focal` (≈ 0.70, 0.50) and `focalBox`.
  4. The **lantern** is one warm blob, area < 0.05% of the frame, at x 86–90%, on the horizon.
  5. The top 12% is quiet; corner tone ±4/channel of `#050b0d`, or flag a levels match.
  6. **One clear silhouette** of the crest at 390 px wide and in grayscale.
  7. **Velocity-noise survival:** the crest still reads with a ≤ 10% grain and ≤ 2 px chroma offset.
  8. **Browser mockup at 1440/390** (G2, A).
  9. **Check L:** no ship, no hull silhouette in the fog, no "cursed sea" tableau.
- **After G2 (code):** hand-fit `LINE_D` to the crest silhouette. Store the overlay diff (the path stroke over the plate) as `masters/MV-01/line-fit.png`.
- **Code alternative:** the legacy `hero-volsurface.webp` via `resolveMedia` (it breaks the world read), or a code gradient sea with the Line drawn in aqua at 40% (a placeholder only).

#### MV-02 — Hero mobile 4:5 (`hero-sea-mobile.webp`)
- **Model:** `nano_banana_pro` 4:5 2k ×2, ref MV-01 → **4** (cap 8). The 0-credit alternative is a considered crop of MV-01.
- **Prompt:** "Recompose the supplied image into a portrait 4:5 frame; the same sea, crest, light and colour." + [A] + [B-PC] +
  > Place the glowing crest across the middle of the frame, fully inside it, with its brightest part right of centre; keep the tiny warm horizon light; keep the top 8 percent plain and fade the bottom 22 percent into dark water. No additional objects.
  
  + [D] + [E].
- **Acceptance:** the same crest family (A); all edges inside the frame; readable at 390 × 488 and in grayscale; no text is placed over it (the CTA sits above it in HTML).

#### MV-03 — Hero loop 8 s (`hero-sea-loop.mp4`)
- **Model (all silent, start = end = MV-01, 16:9, 8 s):** D1 `kling3_0` pro `sound "off"` (**14**) and D2 `minimax_h3` 2K (**16**). If D1 wins below 1080p, re-run at `mode "4k"` (48). Plan **30**, cap **80**.
- **Motion paragraph:**
  > Animate the supplied seascape with extremely restrained, continuous motion while preserving the exact composition. Camera locked on a tripod: zero orbit, dolly, pan, zoom, shake or focus pull — no zoom in or zoom out. The glowing aqua wave crest rolls slowly forward in place and returns to its original shape; small glints travel along its right-hand edge and fade back; the low fog drifts gently from right to left. The dark calm band, the empty left half of the frame and the top of the frame stay perfectly still. The tiny warm horizon light stays steady. One uninterrupted shot with the same state at the first and last frame. No cuts, bursts, particles, added objects, vessels, text, interface boxes, flicker, exposure change or audio.
- **Acceptance:** the PROMPTS HF-03 checks:
  - first and last frame SSIM vs MV-01 ≥ 0.95; the join ≥ 0.97
  - x < 50% static (mean |Δ| ≤ 2/255); the top 12% static
  - exposure varies ≤ 2%; the lantern is steady (its blob luminance varies ≤ 5%)
  - silent; ≤ 4 MB 1080p
  - 3 joins watched in real time (A)
- **Code alternative:** the poster only (the loop is enhancement).

#### MV-04 — Storm edit of MV-01 (`storm.webp`): Card I→II, the "noise" half
- **Model:** `nano_banana_pro` 16:9 4k ×2 (**8**) + `gpt_image_2_5` 16:9 4k `xhigh` (**7**), all `image_references:[<MV-01>]`. Plan **15**, cap **29**.
- **Prompt:** "Edit the supplied image into its stormy companion frame. Keep the exact camera, crop, horizon line and framing, with no zoom and no reframing." + [A] + [B-PC] +
  > The same sea in a night squall: rain veils slant across the frame, the overcast is heavier and lower, and the long glowing crest is broken into scattered churning aqua foam that still follows the same overall folded curve across the right half. The distant warm light is gone. The left 35 percent is darker and quieter than the right, with rain but no bright detail. No other change in viewpoint.
  
  + [D] + [E].
- **Acceptance:**
  1. **Overlay diff vs MV-01** (C): horizon within ±1% of height; the foam's aqua-mask centreline within ±4% of height of `LINE_D` across x 46–94%.
  2. It reads as the same place turned stormy (a 2 Hz flicker test, A).
  3. No lantern pixel (C).
  4. No lightning flash and no bright whole-frame spikes (it is a still, so this is about composition).
  5. Check L (no ship in the storm).
- **Code alternative:** MV-01 through a code "storm grade" (desaturate, darken, a baked rain-streak PNG at 12%): weaker, but it works.

#### MV-05a–d — Journey sea states, 16:9 (`voyage-a…d.webp`), a matched set
- **Purpose:** SPEC SM-4: the four step beats (desktop sequence keyframes and the mobile/RM carousel stills). The set shares its horizon (55% of height), camera height and lens.
- **Model:** `gpt_image_2_5` 16:9 2k `high`, `count 2` each, `image_references:[<MV-01>]` → 4 × 5.5 = **22** (cap 44). (16:9, not 3:2, because the video models accept only 16:9/9:16/1:1 for JV.)
- **Shared line** (every paragraph):
  > Same sea, lens and camera height as the reference, horizon at 55 percent of the frame height, subject centred, no vessels, piers, buildings or land.
- **[C] per still:**
  - **a · harbour lantern calm** (step 01, Origin):
    > A sheltered, perfectly calm inlet at night; still black water holds long wavering reflections of two warm lights that stand on an unseen shore beyond the left edge of the frame; faint mist on the water.
  - **b · fog** (step 02, Early work):
    > Dense sea fog over slow dark swells; a pale, diffuse moon glow high in the fog; visibility fading to grey in every direction.
  - **c · squall** (step 03, The break):
    > A squall wall of dark rain crossing the sea, wind-torn whitecaps and spray, heavy slate clouds pressing low, and a single faint aqua glint in the breaking foam.
  - **d · first light** (step 04, Now):
    > First light over a flat calm sea, a pale gold line along the horizon, and a faint aqua bioluminescent line curving away across the dark water in the foreground.
- **Acceptance:**
  - A 4-up strip (A): the same horizon ±1% (C), the same camera height, and the order reads calm → fog → storm → first light.
  - Each still readable at 480 px wide.
  - Check L on c (no ship-in-storm tableau).
- **Code alternative:** legacy journey stills (`still-terminal`, `still-blueprint`, `still-rays-img`, `still-network`) via fallbacks. The world read is weaker.

#### JV-1…3 — Journey sequence clips (→ `voyage-seq/000–071.webp`)
- **Purpose:** the desktop scroll-indexed sequence (SPEC SM-4, PC-12). The frames pass exactly through MV-05a/b/c/d.
- **Pairs:** JV-1 a → b · JV-2 b → c · JV-3 c → d. Each is 16:9, 5 s, silent.
- **Model:**
  - drafts `seedance_2_0` `fast` 480p ×3 (**24**)
  - finals `kling3_0` pro 5 s ×3 (preflight; ≈ 9 each → ≈ **27**)
  - one retake allowance (≈ 15)
  - Plan **66**, cap **110** (Route: finals only for the approved draft motions).
- **Motion paragraph (per pair, with the weather words swapped):**
  > Locked camera, perfectly steady, over the same sea and horizon. The weather transforms continuously from the first frame to the last frame: [JV-1: the reflections of the warm lights dissolve as fog rolls in across the water and a pale moon glow appears high in the fog] [JV-2: the fog is torn away by rising wind as a dark squall wall arrives with rain, whitecaps and spray] [JV-3: the squall passes, the rain thins and the sea flattens as first light rises along the horizon and a faint aqua glow appears in the foreground water]. One continuous shot; no cuts, vessels, objects, text, flashes, lightning or audio.
- **Build (code):** extract 24 frames per clip with `ffmpeg -threads 2 -vf fps=24/5`, then **replace frame 0 / 24 / 48 / 71 with the approved stills** (exact beats). Encode WebP 1280 w q ≈ 60, ≤ 3 MB total.
- **Acceptance:**
  - Each clip's first and last frames vs its stills: SSIM ≥ 0.93.
  - No lightning or flash (the §6 flash check).
  - Horizon drift ≤ 1%.
  - A real-time scrub test in `/lab` (A).
  - Silent.
- **Code alternative:** the `stills` variant (the 4 stills crossfading on beats), 0 credits (SPEC F-8).

---

### ACT II — 3 IDIOTS (the workshop at first light)

#### MV-06-C / MV-06 — The dawn chalkboard (`board-dawn.webp`): the Act II anchor
- **Purpose:** SPEC SM-6: the gauntlet's board. Chalk diagrams (code SVG) are drawn over its dark left 60%.
- **Model:** a composition draft `gpt_image_2_5` 16:9 2k `medium` (**1**) → final `gpt_image_2_5` 16:9 2k `xhigh` ×2 (**9**). Plan **10**, cap **19**.
- **[C]:**
  > A large wiped slate-green chalkboard seen at a slight angle, filling the frame. Faint cloudy traces of erased chalk drift across it, with no legible marks, letters, numbers, shapes or drawings. A low beam of early-morning daylight enters from the upper right and crosses the board diagonally; fine chalk dust hangs in the beam. The left 60 percent of the board is even, dark and calm; the lit area stays in the right third. A narrow wooden chalk ledge runs along the bottom edge with two short pieces of white chalk. No window frame, room, furniture, wall or building is visible — only the board and the light.
  
  Prompt = [A] + [B-3I] + [C] + [D] + [E].
- **Acceptance:**
  1. **Left 60%:** 95th-percentile luminance ≤ 0.09 and standard deviation ≤ 6/255, so the chalk strokes read and the board is even (C).
  2. **No legible marks** at 100% zoom (A + Claude).
  3. **Check L:** not a lecture-hall shot (no room context), no campus.
  4. It reads as *morning*: warm light, not night (A).
- **Code alternative:** a CSS board (`--idi-canvas` plus a 4% grid) with a code "beam" as a rotated linear gradient in media only (a world-media layer). It works.

#### (none) Chapter covers
Chapter covers are **code schematics** (SPEC SM-7), at 0 credits. There are no per-strategy generated covers (PROMPTS §6).

---

### ACT III — HARRY POTTER (the candlelit night)

#### MV-07-C / MV-07 — Lights along the Line (`lights-line.webp`): the Act III anchor
- **Purpose:** SPEC SM-10: the settled state of Card II→III and the HP Act III style anchor.
- **Model:** draft `gpt_image_2_5` 16:9 2k `medium` (**1**) → final `gpt_image_2_5` 16:9 4k `xhigh` (**7**) + `nano_banana_pro` 16:9 4k with the draft as ref (**4**). Plan **12**, cap **26**.
- **[C]:**
  > Deep darkness. Several hundred small warm points of flame-light hang motionless at many different depths, and together they form one long, flowing, gently folded ribbon of light that crosses the frame from the lower left toward the right — densest along that single curve and thinning away from it, with a few scattered stragglers. Near points are larger soft discs of bokeh; far points are tiny and sharp. The camera is level, looking straight ahead, not upward. There are no candles, holders, wax, strings, walls, ceiling, floor, tables, windows or architecture of any kind — only the points of light and a faint warm haze in the darkness. The left 40 percent is sparse and dark with only a few large, soft, out-of-focus points; the top 12 percent is quiet.
  
  Prompt = [A] + [B-HP] + [C] + [D] + [E].
  
  After G2, add: "The ribbon's path follows the supplied line drawing" with `image_references:[<a code render of LINE_D as a thin grey line on black, 16:9>]`. That is a local reference file, which is the plan's **one upload**, and it contains no text. PROMPTS §0 said "no uploads needed"; this upload is flagged for Aryan at G0.
- **Acceptance:**
  1. **Overlay vs `LINE_D`** (C): the density ridge (a Gaussian-blurred luminance maximum per column) is within ±6% of height of the Line across x 20–95%.
  2. **Check L, high risk:** it must **not** read as a floating-candle ceiling or hall: a level camera, a ribbon (not a canopy), no candle bodies (A + Claude, independently).
  3. **Left 40%:** 95th-percentile ≤ 0.10, so captions sit in the letterbox bars, not over the frame.
  4. Warm only: no aqua or cool cast beyond ≤ 1 glint (C: the hue histogram).
- **Code alternative:** the TA-08 ignition canvas's final frame rendered to a PNG at build time (the code still is the card's end state). It works.

#### MV-08 — Last light (`last-light.webp`)
- **Purpose:** SPEC SM-12: the contact poster, and MV-09's start and end.
- **Model:** `gpt_image_2_5` 16:9 2k `xhigh` ×2, `image_references:[<MV-07>]` → **9** (cap 18).
- **[C]:**
  > Darkness. One small, steady flame at about 85 percent of the width and half the height burns calmly, with a soft warm halo that falls off quickly. A trail of six to ten dimmer, out-of-focus warm points curves away from it toward the left and ends before 60 percent of the width, each fainter than the last. The left 65 percent is even near-black with no detail; the top 15 percent is plain; the area within about 8 percent around the flame is calm so a small monogram and a thin frame can sit over it. No candle, holder, lantern body, wick stand or surface is visible — only the flame and the fading points.
  
  Prompt = [A] + [B-HP] + [C] + [D] + [E].
- **Acceptance:** the PROMPTS HF-08 checks:
  - left 65%: SD ≤ 3/255 and 95th percentile ≤ 0.054
  - top 15% plain
  - flame at x 82–88%, y 40–60%, with a calm ±8% surround
  - lower energy than MV-07 (A)
  - check L
- **Code alternative:** a code flame sprite plus trail points on `--hp-deep` (a static canvas render → PNG).

#### MV-09 — Last-light loop 8 s (`last-light-loop.mp4`)
- **Model (start = end = MV-08, 16:9, 8 s, silent):** `kling3_0` pro `sound "off"` (**14**) + `minimax_h3` 2K (**16**). Plan **30**, cap **60**.
- **Motion paragraph:**
  > Preserve the reference image exactly. Camera completely locked — no zoom, pan or focus shift. Only the flame's soft glow breathes very slowly — slightly brighter and back — by no more than about fifteen percent, in one calm cycle, never flickering, guttering or flashing. The trail of points and everything else stay perfectly still and dark. The same first and last frame. No new lights, smoke, sparks, particles, text, interface boxes or audio.
- **Acceptance:**
  - HF-03 checks 1, 2, 4, 6 and 7
  - left 65% and top 15% static (≤ 1/255)
  - flame-region luminance peak-to-trough ≤ 15%, and no flash frames
  - calmer than MV-03 (A)
- **Code alternative:** the poster only.

#### W-01…05 — Candlelit writing covers (optional, G7; `writing-*.webp`)
- **Purpose:** SPEC SM-11: the writing-index filmstrip on the parchment plane. One per post, keyed by stable post id.
- **Model:** `gpt_image_2_5` 3:2 2k `high`, `count 2`, `image_references:[<MV-07>]` → 5 × 5.5 = **27.5** (cap 55). One `generate_image_batch` after G7.
- **Series lines (every paragraph):**
  > A still life on a dark wooden desk lit by a single small flame out of frame at the upper right, warm and quiet, on or beside a sheet of warm cream paper close to #ebe0c6. Match the rest of this series: tabletop line at about 62 percent of the frame height, camera slightly elevated, subject centred within the middle 60 percent, generous quiet margins.
- **[C] per post** (the brief's metaphors, re-lit; subjects unchanged from PROMPTS W, and the sculpture world removed):
  - **W-01 "How I try not to fool myself":** "A single clear optical prism on the paper; several faint broad bands of warm light meet it and one carefully defined pale band emerges on the other side. No labels, spectrum rainbow, equations or eye imagery."
  - **W-02 "The kill-list":** "A small orderly row of plain graphite test blocks on the paper; one deliberately set-aside, incomplete block in the foreground shows a clean break along one edge, lit with a faint ember-red glint. A study of revision, not destruction: no shattering, debris, skulls or warning symbols; do not imply any precise count."
  - **W-03 "From Pine Script to a real pipeline":** "One continuous strip of dark card begins as a loose loop on the left and passes into a small, neat stack of squared blocks on the right, one coherent object with a fine pale edge. No code, screens, arrows or words."
  - **W-04 "What wrestling and cross country taught me about trading":** "Three gently curved grooves pressed into a warm ivory clay tile, their spacing becoming more regular across the tile; one groove edge catches the light. No athletes, bodies, medals, finish lines, uniforms, track markings or text."
  - **W-05 "Mandarin and global markets":** "Two sheets of milky translucent paper overlap at slightly different angles above the cream sheet; their faint geometric textures create a new ordered pattern only where they overlap. No flags, globe, map, calligraphy, invented characters, currency or cultural objects."
  
  Prompt = [A] + [B-HP] + the series lines + [C] + [D] + [E].
- **Acceptance:**
  - the PROMPTS W checks: family resemblance, a consistent horizon in a 5-up strip, no text or pseudo-characters (W-05 is the highest risk), no bodies (W-04)
  - readable at 480 px
  - check L (no letters or seals, so no "acceptance letter" read)
- **Code alternative:** the type-only index (the inline mode with no art). That is the D3 default.

---

### INTERMISSION — the films chapter stills (21:9, one per film)

**All three:** `gpt_image_2_5` **21:9** 2k `xhigh` ×2 (preflight; INFERRED ≈ 4.5 each → **9**), each referencing its own world anchor. Plan **27**, cap **54**. They are cropped in code to 2.39:1. Captions sit in the letterbox bars, so the frames carry no text zones, but each keeps its left 45% calmer for the finale motif.

#### F-PC — Pirates screen (`films-pirates.webp`), ref MV-01
> A single warm lantern hangs from a weathered wooden post standing in still black water at night, at about 70 percent of the width, its reflection broken into long ripples by a slow swell. Low sea fog drifts across the frame. A faint line of sea-glass aqua bioluminescence curves away from the post into the darkness toward the left. Nothing else: no boat, pier, rope, coastline or building. The left 45 percent is calm dark water and fog.

Prompt = [A] + [B-PC] + above + [D] + [E].

#### F-3I — 3 Idiots screen (`films-idiots.webp`), ref MV-06
> A wiped slate-green chalkboard at first light, seen straight on from just above its ledge; a low beam of morning light crosses it from the right with chalk dust drifting in the beam. On the wooden chalk ledge, an orderly row of small brass gears, a few springs and a coiled leather belt are laid out neatly like an exploded parts view, catching the light. The board is blank — no writing, marks, numbers or drawings — and its left half is even and dark.

Prompt = [A] + [B-3I] + above + [D] + [E]. Parts must not assemble into a drone, rotor or vehicle.

#### F-HP — Harry Potter screen (`films-hp.webp`), ref MV-07
> An unwritten sheet of heavy cream paper lies on a dark wooden desk in darkness. From one point near its centre, a fine line of dark ink has begun to spread outward on its own in delicate branching contours — flowing organic lines only: not letters, not a map, not a plan, not footprints. Small warm points of flame-light hang above the desk at varied depths, softly out of focus; a single cool blue-white glint catches the wet ink. No pen, quill, candle, book, envelope, seal or person. The paper sits in the right half; the left half is dark.

Prompt = [A] + [B-HP] + above + [D] + [E].

**Acceptance (all three):**
- The left 45% is calm (SD ≤ 8/255).
- It reads as its world at thumbnail size (A).
- **Check L, high attention:**
  - F-HP: ink lines ≠ a map/plan; no letters
  - F-3I: gears ≠ a drone/vehicle
  - F-PC: the post ≠ a pier/ship
- No two screens look alike.

**Code alternative:** a declared reuse of MV-05d / MV-06 / MV-07 crops (DESIGN §7 exception ②), at 0 credits.

---

## 5. Generation order and parallelism with the code build

The **code build never waits for media**: every section renders from `resolveMedia` fallbacks or code alternatives until an asset is `accepted`. The media stages below run **in parallel with** SPEC §17 build phases 1–4.

| Stage | Runs | Depends on | Parallel within stage | Code work unblocked meanwhile |
|---|---|---|---|---|
| **S0** | G0 sign-off; balance check | — | — | Phase 1 foundation (film.ts, derivations, validator, tokens, head script, WorldLoader, ActCard static) |
| **S1** | Composition drafts: **M-01**, **IN-C**, **MV-06-C**, **MV-07-C** (≈ 9.5 cr) | G0 | **All four in one batch** (independent worlds) | `/lab` prototypes: the code flight, Card II→III with code sprites, Card I→II with legacy stills |
| **S2** | Anchors: **MV-01** (→ G2 browser mock → `LINE_D`), **IN-01**, **MV-06**, **MV-07** | G1 | IN-01, MV-06 and MV-07 **in parallel**; MV-01 alone (the most important gate) | Hero section on legacy/fallback; ledger; chapters and schematics (0 media) |
| **S3** | **MV-02**, **MV-04**, **MV-05a–d** (ref MV-01); **IN-01m** (ref IN-01); **MV-08** (ref MV-07) | S2 anchors | All in one or two `generate_image_batch` calls | `LINE_D` into Cards I→II and II→III; the Journey sticky column (stills) |
| **S4** | **MV-03** drafts → final; **IN-02** motion drafts (seedance 480p) | MV-01, IN-01 (G3) | MV-03 and the IN-02 drafts in parallel (different start frames) | The intro controller with the code flight; hero integration |
| **S5** | **IN-02** finals (Route A, or B if needed) → trail bake; **JV-1…3** drafts → finals; **MV-09** | S4 drafts; MV-05 set (G4); MV-08 (G5) | JV, MV-09 and the IN-02 finals in parallel (different jobs), with the decoder budget irrelevant at generation time | The Journey sequence; the intro video path; contact |
| **S6** | **F-PC / F-3I / F-HP** (G6); **W-01…05** (G7, optional) | the world anchors | All in one batch | The films chapter; writing filmstrip |
| **S7** | Re-dos from the buffer (34) only on Aryan's request | — | — | Hardening, fixtures A–H |

---

## 6. Acceptance checks

### 6.1 Common checklist A–M (applies to every asset; any FAIL = reject)
| # | Check | How |
|---|---|---|
| A | No text, letters, numbers, logos or pseudo-glyphs | 100% zoom sweep (A + Claude) |
| B | No people, figures, silhouettes, riders, hands, faces or creatures | Sweep; video at 4 fps |
| C | No film-recognizable prop, place or tableau (DESIGN §11.6) | Sweep against the per-world list |
| D | Composition zones per sheet | sharp crops + thresholds (C) |
| E | Contrast zones where live text overlaps (95th-percentile luminance) | sharp (C) |
| F | Background tone within ±4/channel of the world ground, or flag a levels match | Corner patches (C) |
| G | Family resemblance within the world (anchor side by side) | A |
| H | Temporal stability (video): join SSIM, static regions, exposure breathing | ffmpeg (C) |
| I | Silent: `ffprobe` shows no audio stream; transcode with `-an` | C |
| J | Delivery: dimensions, codec, size budget | ffprobe/sharp (C) |
| K | Honesty: not evidence; no encoded counts; no numbers | A |
| **L** | **"Could a fan mistake this for a still from the film?"** Yes or maybe → reject | Claude **and** Aryan, independently; logged with a date |
| M | Provenance logged (model, credits, date, job id, gate, check L signer) | LEDGER |

### 6.2 Mechanical recipes (PROMPTS §7, plus new)
| Check | Recipe | Pass |
|---|---|---|
| Zone luminance | sharp crop → linear relative luminance → 95th percentile | Per sheet (0.054 / 0.09 / 0.10 / 0.146) |
| Aqua in the calm band | HSV mask, hue 165–180°, saturation > 0.3 | < 0.05% of pixels |
| **Line overlay** (MV-01 / MV-04 / MV-07) | Rasterize `LINE_D` at plate size; compare with the aqua-mask centreline or luminance ridge per column | ≤ ±4% height (MV-04) · ±6% (MV-07); MV-01 is the source |
| **Registration** (IN-02) | `ffmpeg -sseof -0.04 -i in02.mp4 -frames:v 1 last.png`, scale both to 960×540, then `ssim` against MV-01 | ≥ 0.95 |
| **Broom exit** (IN-02) | Extract the final 0.4 s at 12 fps; A review, plus a diff vs MV-01 ≤ 3/255 mean | No broom |
| **Flash safety** (all video) | `signalstats` YAVG per frame → linear; also per 4 × 4 tile; count opposing ≥ 10% changes per 1 s window over ≥ 25% of area | ≤ 3 per s (target 0); no saturated-red transitions |
| Loop join | frame 0 and last vs the still; `-stream_loop 3` for viewing | ≥ 0.95 / ≥ 0.97 |
| Static regions | `tblend=difference`, crop, `signalstats` | ≤ 2/255 (MV-03), ≤ 1/255 (MV-09) |
| Sequence beats (JV) | SSIM of clip ends vs stills | ≥ 0.93 |
| **Trail bake** (IN-02) | JSON points, last 1.2 s, vs the h1 rect at 1440×900 and 1024×768 | ≥ 24 px away |
| Silent | `ffprobe -select_streams a` | empty |

---

## 7. Made in code, not in Higgsfield (0 credits)
- **Brand and type:** all text; the bracket and `[AS]` SVGs; the AS monogram.
- **The Line:** `LINE_D` and its three materials; FIG. 0 with **computed** dimensions.
- **Loaders:** the LD-PC instrument, the LD-3I gear train and rack, the LD-HP ink and light points (sprites pre-rendered in code at build time).
- **Journey and act cards:** the Journey course line, waypoints and instrument; the opening card course.
- **The IceCut mask:** a Perlin ragged PNG, baked with a fixed seed.
- **Schematics:** the chapter schematics, the systems figure "How this page is built", the gauntlet chalk diagram, and all chalk circles (the `chalkRough` filter).
- **Canvas and sprites:** the TA-08 ignition sprites; the intro motes and trail sprites; **the mobile/fallback code flight** (the SVG besom).
- **Grounds:** the letterbox (the ground is the bars), the rhumb lattice, the graph grid.
- **Derived media:** `-mono.webp` variants (sharp); the grain PNG for VelocityNoise.
- **Evidence:** every real chart or figure (the `dataviz` skill). Never generated.

---

## 8. Ledger and budget summary

**Ledger template** (copy to `research/higgsfield/LEDGER.md` at the first spend; one row per job; rejected rows stay):
```
| # | Date/time ET | Gate | World | Asset | Stage/batch | Model | Params (ar/res/quality/mode/dur/audio) | Refs (job ids) | Count | Preflight | Charged | Balance after | Job id(s) | Verdict | Failed check / reason | Check L (Claude/Aryan, date) | Approved by |
```
**Running totals:** `Spent: ___ / 750 cap · Balance: ___ (floor 447) · Reserve ≥250 intact: yes/no · Buffer used: ___ / 34`

| Asset | World | Plan | Cap | Stage |
|---|---|---|---|---|
| IN-C comps | prologue | 2 | 4 | S1 |
| IN-01 | prologue | 11 | 25 | S2 |
| IN-01m | prologue | 4 | 8 | S3 |
| IN-02 (Routes A + B) | prologue | 58 | 140 | S4–S5 |
| M-01 | pirates | 5.5 | 11 | S1 |
| MV-01 | pirates | 11 | 25 | S2 |
| MV-02 | pirates | 4 | 8 | S3 |
| MV-03 | pirates | 30 | 80 | S4 |
| MV-04 | pirates | 15 | 29 | S3 |
| MV-05a–d | pirates | 22 | 44 | S3 |
| JV-1…3 | pirates | 66 | 110 | S5 |
| MV-06 (+ comp) | idiots | 10 | 19 | S1–S2 |
| MV-07 (+ comp) | hp | 12 | 26 | S1–S2 |
| MV-08 | hp | 9 | 18 | S3 |
| MV-09 | hp | 30 | 60 | S5 |
| F-PC / F-3I / F-HP | intermission | 27 | 54 | S6 |
| W-01…05 (optional) | hp | 27.5 | 55 | S6 |
| **Total** | | **≈ 344** | **≈ 716** | + a buffer of 34 = **750 cap** |

**Manifest provenance** (from the ledger into `lib/media.ts`):
- `provenance: { source:"higgsfield", model, credits, date }`
- `accept: { people:false, text:false, filmLegal:true, checkL:"aryan:<date>" }`
- status goes `received → accepted` at the gate, then `integrated` at build
- M-01, IN-C and the other comps are **never** entered

**Questions for Aryan at G0:**
1. Are the cap (750) and floor (447) acceptable?
2. The Journey sequence (≈ 66) vs four stills?
3. Are the W covers wanted?
4. May Claude make the plan's one local upload (the `LINE_D` guide image for MV-07)?
5. May Claude download masters and run the checks locally (sharp, ffmpeg `-threads 2`)?
6. Do you confirm the broom description (a plain besom, riderless)?
