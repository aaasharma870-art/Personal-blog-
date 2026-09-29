# M2-MEDIA-REPORT: Higgsfield media for Milestone 2 (Lanes A and B, cross-checked)

This report cross-checks both media lanes run on 2026-09-29 (00:14–00:45 ET). The cross-check itself spent 0 credits.

- **Authority:** MEDIA-PLAN v2, SPEC v2, ICONS (the iconic override) and M1-REPORT §4–§5.
- **Authorization:** Aryan authorized autonomous generation overnight ("use Higgsfield credits as needed"), which covers the plan's A gates for tonight. Claude ran the C (checks) and L2 (legal) gates.
- **Still owed by Aryan:** his morning review, his own L2 countersignature, and any swaps to an ALT.

## 1. Bottom line

- **Everything planned for M2 was delivered.** Every M2 asset has an accepted DEFAULT and an ALT, 18 asset lines in all. Act I also gained two replacement ALTs, for MV-02 and MV-03. Nothing on the M2 list is missing.
- **Legal checks are clean.** I re-inspected every DEFAULT and ALT, with 100–200% crops of every icon and gain sweeps. I found no person, rider, face, hand, legible text, logo, crest, flag marking or badge.
- **Every video is silent.** `ffprobe` finds no audio stream in any of the 10 M2 video files.
- **Placement is correct.** All 46 web files and the two 72-frame sequences are in `research/build/media/accepted/`. None of them is in `personal-website/public/`, and nothing was written to the repo.
- **Credits:**
  - M2 spent **321.0**: Lane A 142.25 and Lane B 178.75.
  - The program total is **525.5**.
  - The **balance is 674.5**, confirmed with the Higgsfield `balance` tool and reconciled line by line against `transactions`.
  - Tonight's floor of 150 was never approached.
- **Flags, all disclosed by the lanes and all confirmed here** (§6 lists the decisions):
  - The MV-06 ALT fails the board-evenness check.
  - JV-2 misses the end-frame SSIM check on texture and is tail-anchored instead.
  - F-3I and F-RD cannot meet the literal "calm left 45%" rule.
  - The MV-08 DEFAULT's candle trail reaches x ≈ 0.44.
  - Three assets went over their per-asset caps, 12.75 in total.

## 2. Assets: DEFAULT → ALT → status

**Status key:**
- **ACC** means accepted, with C ✓ and L2 ✓ signed by Claude on 09-29. **Aryan's A gate and L2 countersignature are pending on every row.**
- M3 copies and registers these files. Nothing is registered yet.

| Asset | Lands in (SPEC) | DEFAULT file (job) | ALT file (job) | Status | Notes |
|---|---|---|---|---|---|
| **MV-04** storm edit of MV-01 | SM-5 Card I→II (the "noise" half) | `storm.webp` (350f546b) | `storm-alt.webp` (a0060b78) | ACC | The horizon matches MV-01 within 0.3%. There is no ship, lantern or lightning. The kraken reads as a swell. **The line check used MV-01's crest as a stand-in; re-run it against `LINE_D` once `lib/line.ts` lands.** The ALT's centreline is marginal (p90 5.75%) and it is 26% brighter. |
| **MV-05a** harbour | SM-4 Journey step 01 | `voyage-a.webp` (6ce86233) | `voyage-a-alt.webp` (8af307c9) | ACC | The quays are empty at 2.5× gain (checked on both). The ALT's horizon is +1.2%, which is marginal. |
| **MV-05b** fog | SM-4 step 02 | `voyage-b.webp` (57a84723) | `voyage-b-alt.webp` (c864d744) | ACC | The first pair (2e78c7e5, a03c0090) was not fog; one regeneration fixed it. |
| **MV-05c** squall | SM-4 step 03 | `voyage-c.webp` (bcb620aa) | `voyage-c-alt.webp` (3c50b647) | ACC | No vessel and no lightning. |
| **MV-05d** first light | SM-4 step 04 | `voyage-d.webp` (f73d3e86, with the distant ship) | `voyage-d-alt.webp` (fe8963a1, no ship) | ACC | The ship is a silhouette with no crew, flag or lettering (100% crop). Choosing between them answers plan Q6. |
| (MV-05 set) | — | — | — | note | The set's horizon sits at 0.419–0.431, not the planned 0.55. It matches within ±1% and agrees with the MV-01 hero. |
| **JV-1…3** voyage sequence | SM-4 desktop scroll sequence | `voyage-seq/000–071.webp`, 1280×720, 1.47 MB (clips ab5526ac / 169d76b5 / ee674bcf) | `voyage-seq-alt/000–071.webp`, 1.61 MB (bf8f2262 / 64a0052d / 8c75dd34) | ACC with flag | **JV-2 end-frame SSIM is 0.910 (DEFAULT) and 0.899 (ALT) against the 0.93 limit**, and the JV-3 DEFAULT scores 0.929. The difference is surface texture only (≤ 1 px shift), and the build tail-anchors those frames (disclosed). No beat frame shows a luminance spike (largest step 5.6/255). The ALT has a neon-aqua overshoot at frames 55–66. |
| **MV-06** dawn chalkboard | SM-6 gauntlet board | `board-dawn.webp` (4686928b) | `board-dawn-alt.webp` (1935fc6f) | DEFAULT ACC · **ALT fails check 1** | Board interior, left 60%, re-measured: DEFAULT p95 0.013 and SD 5.0 ✓; ALT SD 12.5 against the limit of 6 ✗, caused by its diagonal beam. The ALT is the stronger "morning" read. No ghost text in either at 6× gain. |
| **MV-02 alt2** hero mobile | Hero (mobile) | `hero-sea-mobile.webp` (10b81664, M1, unchanged) | `hero-sea-mobile-alt2.webp` (37eb75b2) | ALT ACC | Proposed replacement for the registered M1.5 ALT `hero-sea-mobile-alt.webp`, which is a reject (84001a3b). M3 decides whether to swap it in. |
| **MV-03 alt2** hero loop | Hero (desktop loop) | `hero-sea-loop.mp4/.webm/-poster.webp` (764ca916, M1, unchanged) | `hero-sea-loop-alt2.mp4` / `.webm` / `-poster.webp` (f5130107) | ALT ACC | Proposed replacement for the registered M1.5 ALT, the rejected minimax ebb7db32. On the web MP4, its loop join scores 0.975 against the M1 DEFAULT's 0.952 by the same method. |
| **MV-10** golden-hour frontier | SM-15 Beyond band; SM-14 Card II→III | `frontier-dusk.webp` (32281e86) | `frontier-dusk-alt.webp` (c249b137) | ACC | Left 45% × y 25–75% p95: 0.0059 / 0.0073, against a limit of 0.054 ✓. The horse is clean at 200%. The size of 268 KB is within the 300 KB limit. |
| **MV-10m** frontier mobile 4:5 | SM-15 (mobile) | `frontier-dusk-mobile.webp` (8f6f4c4f) | `frontier-dusk-mobile-alt.webp` (76920a65) | ACC | The first pair was rejected (a two-headed horse; a horse cut off by the frame edge). Both horses are clean at 200%. MEDIA-PLAN gives no filename for this asset; Lane B's name is used here. |
| **MV-11** campfire | SM-16 Voices; the ignite source | `campfire.webp` (a2e95902) | `campfire-alt.webp` (dc902346) | ACC | Left 55%: p95 0.0038 / 0.0030 and SD 3.75 / 3.30 ✓. The ALT's fire centroid at x 0.735 is marginal. |
| **MV-11L** campfire loop | SM-16 (desktop) | `campfire-loop.mp4` / `.webm` / `-poster.webp` (d4086e11) | `campfire-loop-alt.*` (8d687e50) | ACC | Web join 0.970 / 0.973. Silent. The ALT's glow of 16.6% (limit 15) and its 3/s reversals on a very dark mean are borderline; the DEFAULT passes everything. |
| **MV-07** enchanted hall of lights | SM-10 Card III→IV settled state | `lights-line.webp` (5155788f) | `lights-line-alt.webp` (c9c70e36, nano_banana_pro) | ACC | Left 40% p95 0.024 / 0.020 ✓. There are no people, tables, banners or crests. **The ridge check was run against the provisional line; re-run `tools/laneB_ridge.py` once `lib/line.ts` lands.** The `LINE_D` guide image (plan Q5) was never uploaded. |
| **MV-08** last light | SM-12 contact poster | `last-light.webp` (b31ef3f6) | `last-light-alt.webp` (47e9a970) | ACC with flag | **The DEFAULT's trail runs left to x ≈ 0.44**, but its darkness still passes (left 65%: p95 0.0016, SD 2.72). The ALT keeps its trail right of 62%, but its nearest candle sits 4.8% from the flame, inside the calm zone of ±8% ✗. MV-09 exists only for the DEFAULT. |
| **MV-09** last-light loop | SM-12 | `last-light-loop.mp4` / `.webm` / `-poster.webp` (154f82ce) | `last-light-loop-alt.*` (634151ff) | ACC | The flame breathes 3.8% / 1.6% with no flicker; the ~10 Hz flicker take (b1fed92b) was rejected. Web join 0.975 / 0.977. |
| **F-PC** Pirates screen 21:9 | SM-9 films chapter (still `enabled:false`) | `films-pirates.webp` (8c581de2) | `films-pirates-alt.webp` (f86e2553) | ACC | No flag, crew or hull lettering (100% crop). Left 45% SD 7.74 / 7.34 ✓. |
| **F-3I** 3 Idiots screen | SM-9 | `films-idiots.webp` (a4ec7e96) | `films-idiots-alt.webp` (8b981679) | ACC with flag | The scooters carry no legible badge or plate (100% crop) and have a generic classic-scooter shape. **Left 45% global SD is 41.6 / 49.8 because of the pale sky over the lake, far over the rule of ≤ 8**; local texture passes. The DEFAULT's scooter sits at x 0.79, not the planned 0.72. |
| **F-RD** RDR2 screen | SM-9 | `films-rdr2.webp` (7a6da513) | `films-rdr2-alt.webp` (f66a8f31) | ACC with flag | **Deviation:** it was regenerated without the MV-10 reference, because that reference copied MV-10's composition. **Left 45% SD is 23.7 / 19.0 (the dusk sky).** The horses are riderless, with four legs and one head; the ALT was confirmed on its master. |
| **F-HP** Harry Potter screen | SM-9 | `films-hp.webp` (0b8c414a) | `films-hp-alt.webp` (0fcde977) | ACC | The ink is branching organic lines, not letters or a map. The DEFAULT shows a soft castle through a window (IC-HP-01, allowed). Left 45% SD 4.74 ✓ / 8.19 (ALT marginal). |

## 3. What this cross-check verified (0 credits)

1. **Location.**
   - `accepted/` holds all 46 M2 web files, listed in §7, plus `voyage-seq/` and `voyage-seq-alt/` (72 frames each, 000–071).
   - `personal-website/public/` contains **no** M2 file. Its only media changes since M1 are the M1.5 alternates, committed in a3e6516.
   - `git status` shows no untracked files in `public/`, and nothing was written to the repo.
2. **Legal (checks A, B, C and L2 ②③④).** I viewed every DEFAULT and ALT at 1280 px, plus close crops:
   - the MV-05a quays at 100% and 2.5× gain, and the MV-05d ship
   - the horses in MV-10, MV-10m and F-RD at 200%
   - the F-PC ships at 100% and 2.2× gain
   - the F-3I scooters and F-HP ink at 100%
   - MV-06 at 6× gain for ghost text
   - the loops at frames 0/64/128/192, and the sequences at frames 0/12/24/36/47/60/66/71

   Nothing failed. Real iconography recreated by us (the harbour, the ship, colonnades, the lake and scooter, horses, the campfire, candles, a castle glimpse) is allowed under ICONS. None of it reads as a remake of a specific film frame.
3. **Silent video.** `ffprobe -select_streams a` returns nothing for all 10 M2 video files.
   - The MP4s are H.264 High, yuv420p, 24 fps, 8.04 s, 1920×1080, with moov before mdat (faststart).
   - The WebMs are VP9 1920×1080.
4. **Sizes and dimensions** (sharp and ffprobe; all within MEDIA-PLAN limits):

| Group | Dimensions | Size range |
|---|---|---|
| 16:9 stills (MV-04, MV-05a–d, MV-06, MV-10, MV-11, MV-07, MV-08) | 2560×1440 | 57–340 KB |
| MV-10m, MV-02 alt2 | 1280×1600 | 196–252 KB |
| Film screens | 2520×1080 (21:9; cropped to 2.39:1 in code) | 206–286 KB |
| Loops, MP4 | 1920×1080 | 0.31–0.66 MB |
| Loops, WebM | 1920×1080 | 0.05–0.35 MB |
| Posters | 1920×1080 | 29–100 KB |
| Voyage sequences | 1280×720 | 1.47 / 1.61 MB, max frame 46 KB |

   - All video is under the 4 MB limit.
   - MEDIA-PLAN's MV-11L band of 2–4 MB was undershot: 0.54 MB is well below it.
   - The last-light WebM (46 KB) shows mild macroblocking in the halo at 5× gain only. Re-encoding at a lower CRF is optional and costs no credits.

5. **Numbers re-measured independently.** Linear p95 and sRGB-luma SD, from my own sharp script:

| Asset | Zone | DEFAULT | ALT | Pass? |
|---|---|---|---|---|
| MV-10 | left 45% × y 25–75%, p95 | 0.0059 | 0.0073 | ✓ |
| MV-11 | left 55%, p95 / SD | 0.0038 / 3.75 | 0.0030 / 3.30 | ✓ |
| MV-08 | left 65%, p95 / SD | 0.0016 / 2.72 | 0.0019 / 1.43 | ✓ |
| MV-08 | top 15% plain | ✓ | ✓ | ✓ |
| MV-07 | left 40%, p95 | 0.024 | 0.020 | ✓ |
| MV-06 | board interior, left 60%, SD | 5.0 | 12.5 | DEFAULT ✓, ALT ✗ |
| F-PC | left 45%, SD | 7.74 | 7.34 | ✓ |
| F-HP | left 45%, SD | 4.74 | 8.19 | DEFAULT ✓, ALT marginal |
| F-3I | left 45%, SD | 41.6 | 49.8 | ✗ (disclosed) |
| F-RD | left 45%, SD | 23.7 | 19.0 | ✗ (disclosed) |

   - Every value agrees with the lanes' own figures.
   - Loop joins on the web MP4s (last frame against first, 960×540) are all ≥ 0.97.
6. **Ledger reconciliation.**
   - Both lane ledgers were merged into `LEDGER.md` in time order, 63 rows with a cumulative column, followed by per-asset and totals sections.
   - `transactions` shows 63 spends on 09-29 totalling exactly 321.0. The ledger rows and the billing agree one for one.
   - **Correction:** Lane A's summary says "29 generations (21 + 8)". Its ledger and the billing show **26** (19 images, 7 videos). The credit total is correct.

## 4. Credits and balance

| Line | Credits |
|---|---|
| Subscription grant (2026-09-28 16:55 ET) | 1,200 |
| Step 1 stills (M1) | 43 |
| Step 2 motion (M1) | 161.5 |
| M1 fix round | 0 |
| **M2 Lane A** (MV-04 14 · MV-05 42.5 · JV 52.5 · MV-06 16.5 · MV-03 alt2 14 · MV-02 alt2 2.75) | **142.25** of the 330 lane cap |
| **M2 Lane B** (MV-10 13 · MV-10m 10.25 · MV-11 10.5 · MV-11L 28 · MV-07 13 · MV-08 17 · MV-09 42 · F-PC 9 · F-3I 9 · F-RD 18 · F-HP 9) | **178.75** of the 330 lane cap |
| **M2 total** | **321.0** (63 generations) |
| **Program total** | **525.5** |
| **Balance (Higgsfield `balance`, 2026-09-29)** | **674.5** |

- **Against MEDIA-PLAN v2 (cap 950, floor 250; Aryan has not yet signed RD-6):** 525.5 of 950 spent, leaving 424.5 above the floor.
- **Against the legacy LEDGER header (cap 750, floor 447):** 227.5 of headroom remains.
- **Per-asset overruns: 12.75**, drawn from the ≈ 209 buffer:
  - MV-02: 9.5 against a cap of 8.
  - MV-10m: 10.25 against a cap of 6.
  - F-RD: 18 against a cap of 11.

  The plan's caps assumed one final per asset, and tonight's DEFAULT + ALT rule roughly doubles that.
- **Plan deviations:**
  - MV-05 was rendered at 4k high rather than 2k, because 2k does not come out at exact 16:9 for Kling.
  - MV-04 used two gpt xhigh runs rather than nano_banana_pro ×2 plus one gpt.
  - JV skipped the Seedance drafts and went straight to Kling finals.
  - MV-10m used gpt_image_2_5 rather than nano_banana_pro.
  - MV-09 used a second Kling take rather than minimax.
  - F-RD was regenerated without its reference.

## 5. Missing or pending (with code fallbacks)

Nothing on the M2 generation list is missing. Every item that is still open has a code fallback that ships today:

| Item | State | Code fallback (0 credits, per MEDIA-PLAN) |
|---|---|---|
| Aryan's A gates and L2 countersignatures (all M2 rows, plus the M1 list in M1-REPORT §5) | Pending | — |
| Real-time checks (Aryan): the JV scrub in `/lab`; 3 loop joins each for MV-03 alt2, MV-11L and MV-09; the MV-04 2 Hz flicker test; the kraken "not noticed at a glance" test | Pending | — |
| An acceptable **MV-01 ALT** | **None exists.** The registered M1.5 `hero-sea-alt.webp` is a reject, and it was not regenerated on purpose: IN-02, MV-03, MV-04, MV-05 and `LINE_D` are all registered to MV-01 | Ship the DEFAULT only; the hero has no swap |
| Registered M1.5 ALTs for MV-02 and MV-03, both rejects | The replacements `*-alt2.*` are staged in `accepted/` | M3 swaps them in or drops the alt |
| M1.5 ALTs for IN-01, IN-01m and IN-02 (`accepted/alt/`, already in `public/`) | Not re-reviewed in this cross-check (outside M2 scope) | The DEFAULTs |
| `LINE_D` line checks for MV-04 and MV-07 | Waiting on `lib/line.ts` | — |
| The MV-07 `LINE_D` guide upload (plan Q5) | Not done; the curve was described in words | — |
| M3 registration of every M2 file in `lib/media.ts` / `public/` | Not started (by design) | Until registered, each section renders its code fallback: |
| · MV-04 | | MV-01 through a code "storm grade" (no kraken); the current M1 state |
| · MV-05a–d | | the legacy journey stills |
| · JV sequence | | the `stills` variant: the 4 stills crossfading on beats (F-8) |
| · MV-06 | | a CSS board (`--idi-canvas` + a 4% grid) with a code beam |
| · MV-10 and MV-10m | | a CSS golden-hour gradient plus the code low-sun sprite |
| · MV-11 | | the R-6 code campfire on `--rd-deep` |
| · MV-11L and MV-09 | | the poster only |
| · MV-07 | | the ignition canvas's final frame as a PNG |
| · MV-08 | | the code InkCandle and trail points (the current M1 stand-in) |
| · F-PC, F-3I, F-RD, F-HP | | declared reuse crops of MV-05d, MV-06, MV-10 and MV-07; the films chapter itself is still `enabled:false` (SM-9) |
| W-01…05 writing covers | Dropped in MEDIA-PLAN v2 | Code vignettes (SM-11) |

## 6. Decisions for Aryan (morning)

1. **MV-06:** keep the DEFAULT, which passes. Take the ALT only if you accept its beam unevenness (SD 12.5 against a limit of 6) in exchange for the stronger morning light; the chalk overlays would read less evenly.
2. **JV:** accept the tail-anchored JV-2 (texture-only SSIM miss), or spend about 17.5 credits for a new JV-2 pair. Scrub both sequences in `/lab`.
   - **Swapping any MV-05 still to its ALT breaks the sequence at that beat.** Fixing it means a rebuild with `tools/laneA/build_seq.py` plus about 17.5 credits for each affected clip.
3. **MV-05d:** keep the distant ship (DEFAULT) or take the empty sea (ALT). This is plan Q6.
4. **MV-08 / MV-09:** accept the DEFAULT's trail reaching x 0.44, or switch MV-08 to its ALT. Switching costs about 28 credits, because MV-09 must be regenerated on the new still.
5. **F-3I / F-RD:** their bright skies cannot meet "left 45% SD ≤ 8". Decide whether the captions get a darker left scrim in code, or relax the rule for these two screens.
6. **MV-02 / MV-03:** approve swapping the rejected M1.5 ALTs for the new `*-alt2.*` files.
7. **Budget:** sign RD-6 (cap 950, floor 250) and note the 12.75 of per-asset overruns caused by the ALT rule.
8. **L2 countersignatures** for every M2 DEFAULT and ALT, plus the M1 list.

## 7. Files

**Accepted web files** in `research/build/media/accepted/`: 46 files, plus `voyage-seq/` and `voyage-seq-alt/` with 72 frames each.

| Asset | DEFAULT | ALT |
|---|---|---|
| MV-04 | `storm.webp` | `storm-alt.webp` |
| MV-05a | `voyage-a.webp` | `voyage-a-alt.webp` |
| MV-05b | `voyage-b.webp` | `voyage-b-alt.webp` |
| MV-05c | `voyage-c.webp` | `voyage-c-alt.webp` |
| MV-05d | `voyage-d.webp` | `voyage-d-alt.webp` |
| MV-06 | `board-dawn.webp` | `board-dawn-alt.webp` |
| MV-02 | (M1 file) | `hero-sea-mobile-alt2.webp` |
| MV-03 | (M1 files) | `hero-sea-loop-alt2.mp4`, `.webm`, `-poster.webp` |
| MV-10 | `frontier-dusk.webp` | `frontier-dusk-alt.webp` |
| MV-10m | `frontier-dusk-mobile.webp` | `frontier-dusk-mobile-alt.webp` |
| MV-11 | `campfire.webp` | `campfire-alt.webp` |
| MV-11L | `campfire-loop.mp4`, `.webm`, `-poster.webp` | `campfire-loop-alt.mp4`, `.webm`, `-poster.webp` |
| MV-07 | `lights-line.webp` | `lights-line-alt.webp` |
| MV-08 | `last-light.webp` | `last-light-alt.webp` |
| MV-09 | `last-light-loop.mp4`, `.webm`, `-poster.webp` | `last-light-loop-alt.mp4`, `.webm`, `-poster.webp` |
| F-PC | `films-pirates.webp` | `films-pirates-alt.webp` |
| F-3I | `films-idiots.webp` | `films-idiots-alt.webp` |
| F-RD | `films-rdr2.webp` | `films-rdr2-alt.webp` |
| F-HP | `films-hp.webp` | `films-hp-alt.webp` |

Poster naming follows `lib/media.ts` (`-poster.webp`).

**Other files** in `research/build/media/`:
- `LEDGER.md`: the new section "M2 media lanes", with 63 merged rows, per-asset spend and totals.
- `LEDGER-laneA.md`, `LEDGER-laneB.md`: unchanged.
- `LOG.md`: a new section, "M2 cross-check".
- `contact-sheet.html`: a new section between the `M2 CROSS-CHECK` markers.
- `crops/crosscheck/`: 36 review composites (DEFAULT/ALT pairs, icon crops, loop frames, sequence grids).
- `masters/<ID>/`: the full-size originals.
