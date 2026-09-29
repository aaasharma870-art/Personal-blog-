# Higgsfield credit LEDGER

**Running totals:** Spent this program **204.5 / 750** cap · Step-1 cap **180** (43 used) · Step-2 cap **220** (161.5 used, 58.5 unused) · Balance **995.5** (floor 447) · Reserve ≥ 250 intact: **yes** · Buffer used: **0 / 34**

- The balance was **1,200** at 18:15 ET on 2026-09-28. A subscription reset at 16:55 ET granted 1,200; MEDIA-PLAN's "1,197" is superseded.
- Prices were preflighted with `get_cost` before every run and billed **per output**, confirmed by `transactions`:
  - `gpt_image_2_5` 16:9 2k medium: **1**
  - `gpt_image_2_5` 2k high (16:9 / 4:5 / 9:16): **2.75**
  - `gpt_image_2_5` 16:9 4k xhigh: **7**
  - `nano_banana_pro` 4k: **4**
  - `nano_banana_pro` 2k (4:5 / 9:16): **2**

| # | Date/time ET | Gate | World | Asset | Stage/batch | Model | Params (ar/res/quality) | Refs (job ids) | Count | Preflight | Charged | Balance after | Job id(s) | Verdict | Failed check / reason | Check L (Claude/Aryan, date) | Approved by |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-09-28 18:16 | G1 | pirates | M-01 | S1 / batch 1 | gpt_image_2_5 | 16:9 / 2k / high | — | 1 | 2.75 | 2.75 | — | ab82cd87-cb38-4586-aa45-48e5bf003f2c | runner-up | crest runs off right edge (xp98 0.994) | Claude ✓ 09-28 / Aryan — | — |
| 2 | 2026-09-28 18:16 | G1 | pirates | M-01 | S1 / batch 1 | gpt_image_2_5 | 16:9 / 2k / high | — | 1 | 2.75 | 2.75 | — | 4f98076c-8d13-457d-8ed5-ce335786ba94 | **winner (ref-only)** | crest body starts at 0.546 (the MV-01 edit shifted it to 0.485) | Claude ✓ 09-28 / Aryan — | Claude (A pending) |
| 3 | 2026-09-28 18:16 | G1 | prologue | IN-C | S1 / batch 1 | gpt_image_2_5 | 16:9 / 2k / medium | — | 1 | 1 | 1 | — | e3b7a1e1-8f0a-4a66-8847-2efca5e0c4fb | runner-up | candles in top 12% | Claude ✓ 09-28 / Aryan — | — |
| 4 | 2026-09-28 18:16 | G1 | prologue | IN-C | S1 / batch 1 | gpt_image_2_5 | 16:9 / 2k / medium | — | 1 | 1 | 1 | 1,192.5 | 43692ae9-2fa5-49cf-b7cb-acdcc22022a6 | **winner** | 1 candle in Play zone + top 12% (fixed in IN-01 prompt) | Claude ✓ 09-28 / Aryan — | Claude (A pending) |
| 5 | 2026-09-28 18:20 | G2 | pirates | MV-01 | S2 / batch 2 | gpt_image_2_5 | 16:9 / 4k / xhigh | 4f98076c | 1 | 7 | 7 | — | 548e5fc0-1d27-4024-bbf4-98e85e018e0e | **ACCEPTED** → hero-sea.webp | flags: right-edge glints (xp98 0.973); corner levels | Claude ✓ 09-28 / Aryan — | Claude C ✓, G2 mock ✓ (A pending) |
| 6 | 2026-09-28 18:20 | G2 | pirates | MV-01 | S2 / batch 2 | nano_banana_pro | 16:9 / 4k | 4f98076c | 1 | 4 | 4 | — | 00c4c97b-4281-4691-ac3c-d398980a9d02 | reject | purple cast; loud moon (top12 p95 0.090); 5504×3072 | Claude ✓ 09-28 | — |
| 7 | 2026-09-28 18:20 | G3-pre | prologue | IN-01 | S2 / batch 2 | gpt_image_2_5 | 16:9 / 4k / xhigh | 43692ae9 | 1 | 7 | 7 | — | 3edb46de-7312-414f-bbac-9f0a1bbd12ed | **ACCEPTED** → intro-play.webp | flags: candle touches top band; ground bluer than #06080d | Claude ✓ 09-28 / Aryan — | Claude C ✓ (A pending) |
| 8 | 2026-09-28 18:20 | G3-pre | prologue | IN-01 | S2 / batch 2 | nano_banana_pro | 16:9 / 4k | 43692ae9 | 1 | 4 | 4 | 1,170.5 | 23581665-f640-4588-9b77-071588d8dd0a | alternate | purple-navy drift; 5504×3072 | Claude ✓ 09-28 | — |
| 9 | 2026-09-28 18:25 | S3 | pirates | MV-02 | S3 / batch 3 | nano_banana_pro | 4:5 / 2k | 548e5fc0 | 1 | 2 | 2 | — | 1a1197f7-24f7-4e31-be1d-7c189b9977d8 | reject | crest off both edges | Claude ✓ 09-28 | — |
| 10 | 2026-09-28 18:25 | S3 | pirates | MV-02 | S3 / batch 3 | nano_banana_pro | 4:5 / 2k | 548e5fc0 | 1 | 2 | 2 | — | 84001a3b-5c99-4416-8625-15c3597d8a75 | reject (alt) | crest off right edge; aqua in bottom 22% | Claude ✓ 09-28 | — |
| 11 | 2026-09-28 18:25 | S3 | pirates | MV-02 | S3 / batch 3 | gpt_image_2_5 | 4:5 / 2k / high | 548e5fc0 | 1 | 2.75 | 2.75 | — | 10b81664-5614-4298-9601-17ae26c50073 | **ACCEPTED** → hero-sea-mobile.webp | — | Claude ✓ 09-28 / Aryan — | Claude C ✓ (A pending) |
| 12 | 2026-09-28 18:25 | S3 | prologue | IN-01m | S3 / batch 3 | nano_banana_pro | 9:16 / 2k | 3edb46de | 1 | 2 | 2 | — | f3535bf1-01fb-455c-92f6-b2ac2668bf79 | reject | broom at 48% not 32%; busy lower half | Claude ✓ 09-28 | — |
| 13 | 2026-09-28 18:25 | S3 | prologue | IN-01m | S3 / batch 3 | nano_banana_pro | 9:16 / 2k | 3edb46de | 1 | 2 | 2 | — | 89b7ca3f-afff-4008-9116-78d5e4c022bd | alternate | broom at 48% | Claude ✓ 09-28 | — |
| 14 | 2026-09-28 18:25 | S3 | prologue | IN-01m | S3 / batch 3 | gpt_image_2_5 | 9:16 / 2k / high | 3edb46de | 1 | 2.75 | 2.75 | **1,157** | 57484139-4999-4e06-90fe-1e09186cca34 | **ACCEPTED** → intro-play-mobile.webp | — | Claude ✓ 09-28 / Aryan — | Claude C ✓ (A pending) |
| 15 | 2026-09-28 18:35 | G3 (downstream) | prologue→pirates | IN-02 | S2-motion / run 4 | kling3_0 | 16:9 / pro / 6 s / sound off | start 3edb46de → end 548e5fc0 | 1 | 10.5 | 10.5 | — | c3f279c6-108a-4f75-ae70-a864a57fe5a6 | **ACCEPTED** → intro-flight.mp4/.webm (tail-anchored) | flags: pale bone-white handle 0.5–3.3 s; fog passage, not a cloud-deck dive; exits up, not into the lantern | Claude ✓ 09-28 / Aryan — | Claude C ✓ (A pending, G3) |
| 16 | 2026-09-28 18:35 | G3 (downstream) | prologue→pirates | IN-02 | S2-motion / run 4 | minimax_h3 | 16:9 / 2K / 6 s | start 3edb46de → end 548e5fc0 | 1 | 12 | 12 | — | 9a1104f4-8372-4c70-b06a-75874ecf0938 | reject | broom reads as a blob from behind; 6.58 s; audio stream | Claude ✓ 09-28 | — |
| 17 | 2026-09-28 18:35 | G3 (downstream) | prologue→pirates | IN-02 | S2-motion / run 4 | seedance_2_5 | 16:9 / omni_reference draft 480p / 6 s / audio false | start 3edb46de → end 548e5fc0 | 1 | 18 | 18 | — | 239feb1b-83e1-4bf8-8bf0-5e04baf5885e | reject (not finalized) | start/end not pinned: registration 0.814 / 0.859 | Claude ✓ 09-28 | — |
| 18 | 2026-09-28 18:36 | G2 (downstream) | pirates | MV-03 | S2-motion / run 4 | kling3_0 | 16:9 / pro / 8 s / sound off | start = end = 548e5fc0 | 1 | 14 | 14 | — | 764ca916-286d-41a4-b06f-81f36fd06c92 | **ACCEPTED** → hero-sea-loop.mp4/.webm | flag: wrap step ≈2 frames (A real-time check); lantern flickers softly per the director | Claude ✓ 09-28 / Aryan — | Claude C ✓ (A pending) |
| 19 | 2026-09-28 18:36 | G2 (downstream) | pirates | MV-03 | S2-motion / run 4 | minimax_h3 | 16:9 / 2K / 8 s | start = end = 548e5fc0 | 1 | 16 | 16 | 1,086.5 | ebb7db32-d4e5-42ce-a933-dc1452d9f909 | reject | crest exits right; sparkle; lantern flare; exposure range 47.7% | Claude ✓ 09-28 | — |
| 20 | 2026-09-28 18:44 | G3 (downstream) | prologue→pirates | IN-02 | S2-motion / run 5 (v2) | kling3_0 | 16:9 / pro / 6 s / sound off | 3edb46de → 548e5fc0 | 1 | 10.5 | 10.5 | — | 79a0632a-d947-4a02-b380-11d79398c29a | reject | never reaches the sea; last SSIM 0.948 | Claude ✓ 09-28 | — |
| 21 | 2026-09-28 18:44 | G3 (downstream) | prologue→pirates | IN-02 | S2-motion / run 5 (v2) | kling3_0 | 16:9 / pro / 6 s / sound off | 3edb46de → 548e5fc0 | 1 | 10.5 | 10.5 | — | 394c7e09-9014-4787-9d73-88e80df27a95 | reject | no chase; the broom becomes a splash along the crest | Claude ✓ 09-28 | — |
| 22 | 2026-09-28 18:44 | G3 (downstream) | prologue→pirates | IN-02 | S2-motion / run 5 (v2) | minimax_h3 | 16:9 / 2K / 6 s | 3edb46de → 548e5fc0 | 1 | 12 | 12 | 1,053.5 | ec98cc36-941d-4dda-b25a-535a3440d685 | reject | corkscrew handle; blob; giant wave; teal wash | Claude ✓ 09-28 | — |
| 23 | 2026-09-28 18:51 | G3 (downstream) | prologue | IN-K1 | S2-motion / run 6 | gpt_image_2_5 | 16:9 / 2k / high | 3edb46de | 1 | 2.75 | 2.75 | — | 241d51e4-b153-4278-a5a8-759714cc4d2b | runner-up (ref-only) | 2688×1520, not exact 16:9 | Claude ✓ 09-28 | — |
| 24 | 2026-09-28 18:51 | G3 (downstream) | prologue | IN-K1 | S2-motion / run 6 | gpt_image_2_5 | 16:9 / 2k / high | 3edb46de | 1 | 2.75 | 2.75 | 1,048 | 41bd3174-a4bd-4a87-ab97-0982cc100977 | used as K1 (ref-only) | 2688×1520; handle angled up, not down | Claude ✓ 09-28 | — |
| 25 | 2026-09-28 18:52 | G3 (downstream) | prologue | IN-02a | S2-motion / run 7 (Route B) | kling3_0 | 16:9 / pro / 3 s / sound off | 3edb46de → 41bd3174 | 1 | 5.25 | 5.25 | — | e166199c-f3f3-4202-b7df-a163b1314f5b | used in composites B1/B2 | — | Claude ✓ 09-28 | — |
| 26 | 2026-09-28 18:52 | G3 (downstream) | prologue | IN-02a | S2-motion / run 7 (Route B) | kling3_0 | 16:9 / pro / 3 s / sound off | 3edb46de → 41bd3174 | 1 | 5.25 | 5.25 | — | a8ce2a8d-0464-43e8-a9b9-2628f67b7e4c | reject | last vs K1 0.916 | Claude ✓ 09-28 | — |
| 27 | 2026-09-28 18:52 | G3 (downstream) | prologue→pirates | IN-02b | S2-motion / run 7 (Route B) | kling3_0 | 16:9 / pro / 3 s / sound off | 41bd3174 → 548e5fc0 | 1 | 5.25 | 5.25 | — | cf11b307-a956-4adc-87fe-3ba478d056de | alternate 2 (in composite B1) | a dissolve, not a dive; 1912×1080; mid-flight hover at the K1 join | Claude ✓ 09-28 | — |
| 28 | 2026-09-28 18:52 | G3 (downstream) | prologue→pirates | IN-02b | S2-motion / run 7 (Route B) | kling3_0 | 16:9 / pro / 3 s / sound off | 41bd3174 → 548e5fc0 | 1 | 5.25 | 5.25 | 1,027 | 243370c4-adfa-4243-9f6c-9e4d83a51edb | reject | broom lost in the cloud; crest splash; 1912×1080 | Claude ✓ 09-28 | — |
| 29 | 2026-09-28 19:00 | G3 (downstream) | prologue→pirates | IN-02 | S2-motion / run 8 (v3) | kling3_0 | 16:9 / pro / 6 s / sound off | 3edb46de → 548e5fc0 | 1 | 10.5 | 10.5 | — | 9503416d-4ef3-4612-82be-479db735895a | **alternate 1** (web-alt encodes) | dark handle and a real cloud dive, but the broom plunges into the crest with a spray | Claude ✓ 09-28 / Aryan — | — |
| 30 | 2026-09-28 19:00 | G3 (downstream) | prologue→pirates | IN-02 | S2-motion / run 8 (v3) | kling3_0 | 16:9 / pro / 6 s / sound off | 3edb46de → 548e5fc0 | 1 | 10.5 | 10.5 | 1,006 | 06f7b8ad-cf6e-400f-948a-7bdd0071a7eb | reject | broom lost behind the towers; camera hits a wall (SSIM 0.355) | Claude ✓ 09-28 | — |
| 31 | 2026-09-28 19:05 | G3 (downstream) | prologue→pirates | IN-02 | S2-motion / run 9 (v4) | kling3_0 | 16:9 / pro / 6 s / sound off | 3edb46de → 548e5fc0 | 1 | 10.5 | 10.5 | **995.5** | 7115583c-60ae-4f9a-ab6e-fb89851e7003 | runner-up | best cloud dive, but no pass between the towers; pale handle in close-up; small spray at the crest | Claude ✓ 09-28 | — |

## Per-asset spend vs MEDIA-PLAN caps
| Asset | Plan | Cap | Spent | Status |
|---|---|---|---|---|
| M-01 | 5.5 | 11 | 5.5 | winner 4f98076c (reference-only) |
| IN-C | 2 | 4 | 2 | winner 43692ae9 (reference-only) |
| MV-01 | 11 | 25 | 11 | accepted 548e5fc0 |
| IN-01 | 11 | 25 | 11 | accepted 3edb46de |
| MV-02 | 4 | 8 | 6.75 | accepted 10b81664 |
| IN-01m | 4 | 8 | 6.75 | accepted 57484139 |
| **Step-1 total** | **37.5** | **81** | **43** | 0 regenerations needed |
| IN-02 (+ IN-K1) | ≈58 (A) + ≈40 (B) | 140 | 131.5 | accepted c3f279c6 (tail-anchored); alternate 9503416d |
| MV-03 | 30 | 80 | 30 | accepted 764ca916 |
| **Step-2 total** | **≈128** | **220 (step cap)** | **161.5** | 15 video generations (IN-02 ×13, MV-03 ×2) + 2 keyframes; Seedance 2.0 skipped (the fast mode is gone; 480p = 18) |
| **Program** | — | **750** | **204.5** | balance 995.5 |

**Step-2 prices (OBSERVED 2026-09-28 18:35 ET, `get_cost`, confirmed by `transactions`):**
- `kling3_0` pro, sound off: 3 s **5.25**, 6 s **10.5**, 8 s **14**; std 6 s **9**
- `minimax_h3` 2K: 6 s **12**, 8 s **16**
- `seedance_2_5` draft 480p 6 s: **18**
- `seedance_2_0` 480p 6 s: **18**. It is std-only now; there is no `fast` mode
- `gpt_image_2_5` 2k high: **2.75**

**Step-2 resume check (2026-09-28 19:20 ET, 0 credits):**
- `balance` returned **995.5**.
- `transactions`: the newest spend is Kling 10.5 at 23:05:40 UTC (19:05 ET, run 9). Nothing has been billed since.
- `show_generations` (video): all 15 Step-2 jobs are `completed`, and every one is already downloaded to `masters/`. There were no pending jobs to collect.
- The existing winners were re-judged and kept: IN-02 `c3f279c6` (tail-anchored) and MV-03 `764ca916`. No new generation was needed, so this pass spent **0** credits.
- Step-2 total stays **161.5 / 220**, leaving **58.5** unused. The program total stays **204.5 / 750**.

### M1 fix round · 2026-09-29 · 0 cr
No Higgsfield runs. IN-01-empty and IN-01m-empty were made locally (OpenCV inpaint of IN-01 / IN-01m; see LOG.md). Program total stays **204.5**; balance **995.5** (last confirmed 09-28 19:20 ET).

---

## M2 media lanes (Lane A + Lane B) · 2026-09-29 00:14–00:45 ET · 321 cr

The M2 cross-check merged `LEDGER-laneA.md` (26 rows) and `LEDGER-laneB.md` (37 rows) into this file on 2026-09-29. The lane files remain the source for their own rows.

- **Row order:** this table orders both lanes by submit time and adds a cumulative M2 spend. Lanes A and B ran in parallel on one account, so per-row "balance after" values are not meaningful here.
- **Authorization:** Aryan's overnight instruction ("use Higgsfield credits as needed") covered the A gates. Claude ran the C and L2 gates. **Aryan's L2 countersignature is pending on every row.**
- **Approved-by column:** Lane A rows show "—" because that lane's ledger has no approved-by column; its gate decisions are in `LOG.md` under "M2 Lane A".

| # | Lane · row | Date/time ET | Gate | World | Asset | Batch | Model | Params | Refs (job ids) | Count | Preflight | Charged | M2 cumulative | Job id | Verdict | Failed check / reason | Check L2 (Claude/Aryan, date) | Approved by |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| M2-1 | A · A1-1 | 2026-09-29 00:14 | S3 (A→overnight auth) | pirates | MV-04 | A1 | gpt_image_2_5 | 16:9 / 4k / xhigh | 548e5fc0 | 1 | 7 | 7 | 7 | 350f546b-fb55-4549-820c-3e052999cfc4 | **DEFAULT** → storm.webp | horizon Δ −0.28%; crest centreline vs MV-01 median 1.7% / p90 4.5% of height; 0 warm px; kraken reads as a swell | Claude ✓ 09-29 / Aryan — | — |
| M2-2 | A · A1-2 | 2026-09-29 00:14 | S3 | pirates | MV-04 | A1 | gpt_image_2_5 | 16:9 / 4k / xhigh | 548e5fc0 | 1 | 7 | 7 | 14 | a0060b78-f625-4ea9-a38d-768ff6653ad1 | **ALT** → storm-alt.webp | horizon Δ 0; centreline median 3.0% / p90 5.75% (marginal); 26% brighter mean than MV-01 | Claude ✓ 09-29 / Aryan — | — |
| M2-3 | A · A1-3 | 2026-09-29 00:14 | S3 | pirates | MV-05a | A1 | gpt_image_2_5 | 16:9 / 4k / high | 548e5fc0 | 1 | 4.25 | 4.25 | 18.25 | 6ce86233-1be6-4d6a-b6b3-535932a1609a | **DEFAULT** → voyage-a.webp | horizon 0.431 (set ±1%); no people/marks at 2.5× gain | Claude ✓ 09-29 / Aryan — | — |
| M2-4 | A · A1-4 | 2026-09-29 00:14 | S3 | pirates | MV-05a | A1 | gpt_image_2_5 | 16:9 / 4k / high | 548e5fc0 | 1 | 4.25 | 4.25 | 22.5 | 8af307c9-a43d-4d71-8f54-3653a0b2c373 | **ALT** → voyage-a-alt.webp | horizon 0.437 (+1.2% vs set mean, marginal) | Claude ✓ 09-29 / Aryan — | — |
| M2-5 | A · A1-5 | 2026-09-29 00:14 | S3 | pirates | MV-05b | A1 | gpt_image_2_5 | 16:9 / 4k / high | 548e5fc0 | 1 | 4.25 | 4.25 | 26.75 | 2e78c7e5-7ac2-4301-90e3-3c8f5bd63c0a | reject | not fog: a clear moonlit sea that copies MV-01's crest | Claude ✓ 09-29 | — |
| M2-6 | A · A1-6 | 2026-09-29 00:14 | S3 | pirates | MV-05b | A1 | gpt_image_2_5 | 16:9 / 4k / high | 548e5fc0 | 1 | 4.25 | 4.25 | 31 | a03c0090-d9da-43bc-b1ec-709a07ab5c75 | reject | not fog (crisp moon, MV-01 crest) | Claude ✓ 09-29 | — |
| M2-7 | A · A1-7 | 2026-09-29 00:14 | S3 | pirates | MV-05c | A1 | gpt_image_2_5 | 16:9 / 4k / high | 548e5fc0 | 1 | 4.25 | 4.25 | 35.25 | bcb620aa-274b-4c74-bcff-a7b02686c467 | **DEFAULT** → voyage-c.webp | horizon 0.425; squall wall, one aqua glint, no vessel, no lightning | Claude ✓ 09-29 / Aryan — | — |
| M2-8 | A · A1-8 | 2026-09-29 00:14 | S3 | pirates | MV-05c | A1 | gpt_image_2_5 | 16:9 / 4k / high | 548e5fc0 | 1 | 4.25 | 4.25 | 39.5 | 3c50b647-5060-442c-a40a-a13e37e3fbb4 | **ALT** → voyage-c-alt.webp | horizon 0.428 | Claude ✓ 09-29 / Aryan — | — |
| M2-9 | A · A1-9 | 2026-09-29 00:14 | S3 | pirates | MV-05d | A1 | gpt_image_2_5 | 16:9 / 4k / high | 548e5fc0 | 1 | 4.25 | 4.25 | 43.75 | f73d3e86-05ea-424c-a04d-53544952cbe1 | **DEFAULT** → voyage-d.webp (with the distant ship) | horizon 0.419; ship tiny, no crew/flag | Claude ✓ 09-29 / Aryan — | — |
| M2-10 | A · A1-10 | 2026-09-29 00:14 | S3 | pirates | MV-05d | A1 | gpt_image_2_5 | 16:9 / 4k / high | 548e5fc0 | 1 | 4.25 | 4.25 | 48 | fe8963a1-c8bc-49f9-9bf6-9862de6a673f | **ALT** → voyage-d-alt.webp (no ship; answers Q6) | horizon 0.420 | Claude ✓ 09-29 / Aryan — | — |
| M2-11 | A · A1-11 | 2026-09-29 00:14 | G1 (overnight auth) | idiots | MV-06-C | A1 | gpt_image_2_5 | 16:9 / 2k / medium | — | 1 | 1 | 1 | 49 | 1d9b3761-1f73-4f6e-b39a-87ea26f76f90 | runner-up (ref-only) | gothic tracery window; brighter board | Claude ✓ 09-29 | — |
| M2-12 | A · A1-12 | 2026-09-29 00:14 | G1 | idiots | MV-06-C | A1 | gpt_image_2_5 | 16:9 / 2k / medium | — | 1 | 1 | 1 | 50 | c7cce70e-16eb-40f0-a3ee-85ef5515c1f5 | **winner (ref-only)** | left-60% p95 0.064; beam too wide | Claude ✓ 09-29 | — |
| M2-13 | B · B1 | 2026-09-29 00:15 | G1 (C; A covered by overnight authorization) | rdr2 | MV-10-C | B1 comps | gpt_image_2_5 | 16:9 / 2k / medium | — | 1 | 1 | 1 | 51 | d7063162-955a-45ed-b65c-ff1c0a74591a | **comp winner** (ref for MV-10 final) | left45×y25–75 p95 0.094 (>0.054); the model added a camp (tent, fire, fence) from the [E-RD] allowance list | Claude ✓ 09-29 | Claude |
| M2-14 | B · B2 | 2026-09-29 00:15 | G1 | rdr2 | MV-10-C | B1 comps | gpt_image_2_5 | 16:9 / 2k / medium | — | 1 | 1 | 1 | 52 | a7b0615b-cb34-4bb7-bc73-3b433892d4fc | comp runner-up | left45 p95 0.264; camp added | Claude ✓ 09-29 | — |
| M2-15 | B · B3 | 2026-09-29 00:15 | G1 | rdr2 | MV-11-C | B1 comps | gpt_image_2_5 | 16:9 / 2k / medium | — | 1 | 1 | 1 | 53 | 73c227d5-071d-4bef-bab0-21e76b5c8141 | comp (dusk, not night) | sunset glow top-right; left55 p95 0.031 but SD 15.5; hard vertical dark band | Claude ✓ 09-29 | — |
| M2-16 | B · B4 | 2026-09-29 00:15 | G1 | rdr2 | MV-11-C | B1 comps | gpt_image_2_5 | 16:9 / 2k / medium | — | 1 | 1 | 1 | 54 | 976e5bcd-d1ff-4083-a995-718500b1a805 | comp (dusk, not night) | sunset band; left55 p95 0.086 | Claude ✓ 09-29 | — |
| M2-17 | B · B5 | 2026-09-29 00:15 | G1 | hp | MV-07-C | B1 comps | gpt_image_2_5 | 16:9 / 2k / medium | — | 1 | 1 | 1 | 55 | 23a45d5f-cd76-4e92-9dde-c66fb0f5a521 | comp runner-up | ridge vs LINE_D 13/15 bands within ±6%; castle seen through the right window | Claude ✓ 09-29 | — |
| M2-18 | B · B6 | 2026-09-29 00:15 | G1 | hp | MV-07-C | B1 comps | gpt_image_2_5 | 16:9 / 2k / medium | — | 1 | 1 | 1 | 56 | 5e3e493f-dd99-4498-939d-eed88a15b5a4 | **comp winner** (ref for MV-07 finals) | ridge 14/15 bands within ±6% (max 0.064); peak rides ≈0.05 high at x 0.78–0.83 | Claude ✓ 09-29 | Claude |
| M2-19 | B · B7 | 2026-09-29 00:16 | G6 (C+L2) | intermission/pirates | F-PC | B1 | gpt_image_2_5 | 21:9 / 2k / xhigh | 548e5fc0 (MV-01) | 1 | 4.5 | 4.5 | 60.5 | 8c581de2-0d87-4c9d-80b6-2593bc3793bc | see LOG (lane B) | — | Claude ✓ 09-29 / Aryan — | — |
| M2-20 | B · B8 | 2026-09-29 00:16 | G6 (C+L2) | intermission/pirates | F-PC | B1 | gpt_image_2_5 | 21:9 / 2k / xhigh | 548e5fc0 (MV-01) | 1 | 4.5 | 4.5 | 65 | f86e2553-5b2b-4ffc-bbab-27a01e83c8e1 | see LOG (lane B) | — | Claude ✓ 09-29 / Aryan — | — |
| M2-21 | A · A2-1 | 2026-09-29 00:20 | S3 | pirates | MV-05b | A2 (regen 1) | gpt_image_2_5 | 16:9 / 4k / high | 548e5fc0 | 1 | 4.25 | 4.25 | 69.25 | 57a84723-17e6-4bb8-8314-543e3cd92acd | **DEFAULT** → voyage-b.webp | real fog; soft horizon ≈0.45; mean lum 0.032 | Claude ✓ 09-29 / Aryan — | — |
| M2-22 | A · A2-2 | 2026-09-29 00:20 | S3 | pirates | MV-05b | A2 (regen 1) | gpt_image_2_5 | 16:9 / 4k / high | 548e5fc0 | 1 | 4.25 | 4.25 | 73.5 | c864d744-01d9-4120-a647-86039426caa7 | **ALT** → voyage-b-alt.webp | fog; brighter moon glow (mean 0.041) | Claude ✓ 09-29 / Aryan — | — |
| M2-23 | A · A2-3 | 2026-09-29 00:20 | S2 | idiots | MV-06 | A2 | gpt_image_2_5 | 16:9 / 2k / xhigh | c7cce70e | 1 | 4.5 | 4.5 | 78 | 1aaf48c1-07bd-4cb9-8880-f0d7c48bdc31 | backup (not shipped) | left-60% SD 13.8/255 (beam spill x 0.45–0.6) | Claude ✓ 09-29 | — |
| M2-24 | A · A2-4 | 2026-09-29 00:20 | S2 | idiots | MV-06 | A2 | gpt_image_2_5 | 16:9 / 2k / xhigh | c7cce70e | 1 | 4.5 | 4.5 | 82.5 | 1935fc6f-82b8-47ee-8ac7-a191d371f116 | **ALT** → board-dawn-alt.webp | FLAG left-60% global SD 12.4/255 (> 6) from the diagonal beam; p95 0.038 ✓, local SD 2.8 ✓; the stronger "morning" read | Claude ✓ 09-29 / Aryan — | — |
| M2-25 | B · B9 | 2026-09-29 00:20 | G1→S2 (C) | rdr2 | MV-10 | B2 finals | gpt_image_2_5 | 16:9 / 2k / high | d7063162 (comp) | 1 | 2.75 | 2.75 | 85.25 | e0987388-58c6-4f4a-89bd-f502cd395dec | superseded → ref for the MV-10 edit | camp removed ✓, but left45×y25–75 p95 0.091 (> 0.054): lit valley at x 0.30–0.45 × y 0.25–0.45 | Claude ✓ 09-29 | — |
| M2-26 | B · B10 | 2026-09-29 00:20 | G1→S2 (C) | rdr2 | MV-10 | B2 finals | gpt_image_2_5 | 16:9 / 2k / high | d7063162 (comp) | 1 | 2.75 | 2.75 | 88 | f925b48c-d09b-49a0-8674-fafcc30a15c8 | reject | left45 p95 0.081; sun at x 0.825 (> 0.82) | Claude ✓ 09-29 | — |
| M2-27 | B · B11 | 2026-09-29 00:20 | S2 (C + L2) | hp | MV-07 | B2 finals | gpt_image_2_5 | 16:9 / 4k / xhigh | 5e3e493f (comp) | 1 | 7 | 7 | 95 | 5155788f-adb3-410a-bd57-b462456ba723 | **DEFAULT** → lights-line.webp | — (flame-density ridge vs provisional LINE_D: 14/15 bands within ±6%, centroid 15/15) | Claude ✓ 09-29 / Aryan — | Claude (overnight authorization) |
| M2-28 | B · B12 | 2026-09-29 00:20 | S2 (C + L2) | hp | MV-07 | B2 finals | nano_banana_pro | 16:9 / 4k (5504×3072) | 5e3e493f (comp) | 1 | 4 | 4 | 99 | c9c70e36-728b-437d-b670-9ce6078c0c36 | **ALT** → lights-line-alt.webp | ridge 13/15 (max 0.08), centroid 15/15; bluer windows (cool-saturated 1.0%) | Claude ✓ 09-29 / Aryan — | — |
| M2-29 | A · A3-1 | 2026-09-29 00:21 | G4 (overnight auth) | pirates | JV-3 | A3 | kling3_0 | 16:9 / pro / 5 s / sound off | start bcb620aa → end f73d3e86 | 1 | 8.75 | 8.75 | 107.75 | ee674bcf-b6c0-49ce-a444-0951f4ce0555 | **DEFAULT** (seq frames 48–71) | first/last SSIM 0.984 / 0.929 (@960); 0 px shift; min step 0.95; no flash; lum monotone | Claude ✓ 09-29 / Aryan — | — |
| M2-30 | A · A3-2 | 2026-09-29 00:21 | G4 | pirates | JV-3 | A3 | kling3_0 | 16:9 / pro / 5 s / sound off | start bcb620aa → end f73d3e86 | 1 | 8.75 | 8.75 | 116.5 | 8c75dd34-e51a-45d2-a145-d7bd1a2b65ea | **ALT** (alt sequence) | 0.983 / 0.931; mid-clip overshoot (neon aqua, lum 0.074 vs end 0.046); early orange sun spot | Claude ✓ 09-29 / Aryan — | — |
| M2-31 | B · B13 | 2026-09-29 00:22 | S2 (C + L2) | rdr2 | MV-10 | B2b edit (regen 1) | gpt_image_2_5 | 16:9 / 2k / high | e0987388 | 1 | 2.75 | 2.75 | 119.25 | c249b137-3f83-4bc7-9f0f-33ce136af6ce | **ALT** → frontier-dusk-alt.webp | left45 p95 0.008 ✓ (the sub-band x .30–.45 × y .25–.45 is still 0.106) | Claude ✓ 09-29 / Aryan — | — |
| M2-32 | B · B14 | 2026-09-29 00:22 | S2 (C + L2) | rdr2 | MV-10 | B2b edit (regen 1) | gpt_image_2_5 | 16:9 / 2k / high | e0987388 | 1 | 2.75 | 2.75 | 122 | 32281e86-6f1d-4db7-8bb5-73eb276e6618 | **DEFAULT** → frontier-dusk.webp (the rdr2 anchor) | — | Claude ✓ 09-29 / Aryan — | Claude (overnight authorization) |
| M2-33 | A · A4-1 | 2026-09-29 00:23 | S2 | idiots | MV-06 | A4 (regen 1) | gpt_image_2_5 | 16:9 / 2k / high | 1935fc6f | 1 | 2.75 | 2.75 | 124.75 | 2eef6eaa-cd6d-43b8-a6f3-8a9f002405bd | backup (not shipped) | SD 6.49 (marginal), p95 0.016 | Claude ✓ 09-29 | — |
| M2-34 | A · A4-2 | 2026-09-29 00:23 | S2 | idiots | MV-06 | A4 (regen 1) | gpt_image_2_5 | 16:9 / 2k / high | 1935fc6f | 1 | 2.75 | 2.75 | 127.5 | 4686928b-b125-419b-aa30-af1b607c5b0e | **DEFAULT** → board-dawn.webp | left-60% p95 0.0135, SD 5.69 ✓, local SD 2.2; beam confined right of 65% | Claude ✓ 09-29 / Aryan — | — |
| M2-35 | B · B15 | 2026-09-29 00:25 | S3 (C + L2) | rdr2 | MV-11 | B3 | gpt_image_2_5 | 16:9 / 4k / high | 32281e86 (MV-10) | 1 | 4.25 | 4.25 | 131.75 | dc902346-fc12-4423-82be-9af37e12f247 | **ALT** → campfire-alt.webp | fire centroid x 0.735 (range 0.74–0.82, marginal) | Claude ✓ 09-29 / Aryan — | — |
| M2-36 | B · B16 | 2026-09-29 00:25 | S3 (C + L2) | rdr2 | MV-11 | B3 | gpt_image_2_5 | 16:9 / 4k / high | 32281e86 (MV-10) | 1 | 4.25 | 4.25 | 136 | a2e95902-b79b-4402-9057-6a74d51e4233 | **DEFAULT** → campfire.webp; MV-11L start/end | — | Claude ✓ 09-29 / Aryan — | Claude (overnight authorization) |
| M2-37 | B · B17 | 2026-09-29 00:25 | S3 (C) | rdr2 | MV-10m | B3 | gpt_image_2_5 | 4:5 / 2k / high | 32281e86 (MV-10) | 1 | 2.75 | 2.75 | 138.75 | ba8aace2-dfe9-4f6c-a14e-df609f077ea7 | reject | **horse anatomy: a second head at the rump (200% crop)** | Claude ✓ 09-29 | — |
| M2-38 | B · B18 | 2026-09-29 00:25 | S3 (C) | rdr2 | MV-10m | B3 | nano_banana_pro | 4:5 / 2k (1856×2304) | 32281e86 (MV-10) | 1 | 2 | 2 | 140.75 | 2405f92e-060b-4f08-a0ca-7d7411b18dfa | reject | horse cut by the right frame edge; no sun; lower half p95 0.085 | Claude ✓ 09-29 | — |
| M2-39 | B · B19 | 2026-09-29 00:25 | G5 (C + L2) | hp | MV-08 | B3 | gpt_image_2_5 | 16:9 / 4k / high | 5155788f (MV-07) | 1 | 4.25 | 4.25 | 145 | b31ef3f6-2456-48eb-b0f2-e546c474a149 | **DEFAULT** → last-light.webp; MV-09 start/end | flag: the trail runs to x 0.44 (tiny points; left-65% SD 2.91 ✓) | Claude ✓ 09-29 / Aryan — | Claude (overnight authorization) |
| M2-40 | B · B20 | 2026-09-29 00:25 | G5 (C + L2) | hp | MV-08 | B3 | gpt_image_2_5 | 16:9 / 4k / high | 5155788f (MV-07) | 1 | 4.25 | 4.25 | 149.25 | aeb5240c-9fac-453c-b575-cf4bee39c530 | runner-up (was the ALT until B36) | flame x 0.813 (range 0.82–0.88) and the nearest trail candle 7% from it (calm ±8%): marginal | Claude ✓ 09-29 / Aryan — | — |
| M2-41 | B · B21 | 2026-09-29 00:25 | G6 (C + L2) | intermission/rdr2 | F-RD | B3 | gpt_image_2_5 | 21:9 / 2k / xhigh | 32281e86 (MV-10) | 1 | 4.5 | 4.5 | 153.75 | 61713f38-dc5f-4cf1-991c-9fd44548bba3 | reject | repeats the MV-10 composition (valley, river, oak, low sun): fails "none repeats its section plate"; left45 global SD 20.2 | Claude ✓ 09-29 | — |
| M2-42 | B · B22 | 2026-09-29 00:25 | G6 (C + L2) | intermission/rdr2 | F-RD | B3 | gpt_image_2_5 | 21:9 / 2k / xhigh | 32281e86 (MV-10) | 1 | 4.5 | 4.5 | 158.25 | f64a9ccd-8550-4aa3-8b35-61a23547b824 | reject | same as B21 (left45 global SD 24.8) | Claude ✓ 09-29 | — |
| M2-43 | B · B23 | 2026-09-29 00:25 | G6 (C + L2) | intermission/hp | F-HP | B3 | gpt_image_2_5 | 21:9 / 2k / xhigh | 5155788f (MV-07) | 1 | 4.5 | 4.5 | 162.75 | 0fcde977-b391-42af-bb48-bb35043d1fe6 | **ALT** → films-hp-alt.webp | left45 global SD 8.46 (> 8, marginal; local SD 1.85 ✓) | Claude ✓ 09-29 / Aryan — | — |
| M2-44 | B · B24 | 2026-09-29 00:25 | G6 (C + L2) | intermission/hp | F-HP | B3 | gpt_image_2_5 | 21:9 / 2k / xhigh | 5155788f (MV-07) | 1 | 4.5 | 4.5 | 167.25 | 0b8c414a-1f0f-4e70-b694-a22b320482f4 | **DEFAULT** → films-hp.webp | — (a soft castle silhouette through the far window: IC-HP-01, allowed) | Claude ✓ 09-29 / Aryan — | Claude (overnight authorization) |
| M2-45 | A · A5-1 | 2026-09-29 00:27 | G4 (overnight auth) | pirates | JV-1 | A5 | kling3_0 | 16:9 / pro / 5 s / sound off | start 6ce86233 → end 57a84723 | 1 | 8.75 | 8.75 | 176 | ab5526ac-c3ea-4ed4-9e99-2266da0b0333 | **DEFAULT** (seq frames 0–24) | 0.981 / 0.958; ≤1 px shift; min step 0.963; no flash; mist dissolves the harbour; no people in quay sweep | Claude ✓ 09-29 / Aryan — | — |
| M2-46 | A · A5-2 | 2026-09-29 00:27 | G4 | pirates | JV-1 | A5 | kling3_0 | 16:9 / pro / 5 s / sound off | start 6ce86233 → end 57a84723 | 1 | 8.75 | 8.75 | 184.75 | bf8f2262-d610-4a77-8722-8be6050da54b | **ALT** (alt sequence) | 0.981 / 0.970; billowing smoke-like fog banks | Claude ✓ 09-29 / Aryan — | — |
| M2-47 | A · A5-3 | 2026-09-29 00:27 | G4 | pirates | JV-2 | A5 | kling3_0 | 16:9 / pro / 5 s / sound off | start 57a84723 → end bcb620aa | 1 | 8.75 | 8.75 | 193.5 | 64a0052d-37af-4ddf-aac6-53d33255ea4c | **ALT** (alt sequence) | 0.989 / **0.899** (< 0.93: texture, 0–1 px shift) → tail-anchored in the build; the moon slides right ≈0.3 of the width | Claude ✓ 09-29 / Aryan — | — |
| M2-48 | A · A5-4 | 2026-09-29 00:27 | G4 | pirates | JV-2 | A5 | kling3_0 | 16:9 / pro / 5 s / sound off | start 57a84723 → end bcb620aa | 1 | 8.75 | 8.75 | 202.25 | 169d76b5-d55a-4556-b841-6d004bf0967e | **DEFAULT** (seq frames 24–47) | 0.989 / **0.910** (< 0.93: texture, ≤1 px shift) → tail-anchored; the moon's reflection becomes the aqua crest (bright mid-clip) | Claude ✓ 09-29 / Aryan — | — |
| M2-49 | B · B25 | 2026-09-29 00:28 | S3 (C + L2) | rdr2 | MV-10m | B4 (regen 1) | gpt_image_2_5 | 4:5 / 2k / high | 32281e86 (MV-10) | 1 | 2.75 | 2.75 | 205 | 8f6f4c4f-a360-46a7-9836-e44f3200df50 | **DEFAULT** → frontier-dusk-mobile.webp | — | Claude ✓ 09-29 / Aryan — | Claude (overnight authorization) |
| M2-50 | B · B26 | 2026-09-29 00:28 | S3 (C + L2) | rdr2 | MV-10m | B4 (regen 1) | gpt_image_2_5 | 4:5 / 2k / high | 32281e86 (MV-10) | 1 | 2.75 | 2.75 | 207.75 | 76920a65-e7d1-468a-9bdf-850f8cbec21c | **ALT** → frontier-dusk-mobile-alt.webp | — | Claude ✓ 09-29 / Aryan — | — |
| M2-51 | B · B27 | 2026-09-29 00:30 | G6 (C + L2) | intermission/rdr2 | F-RD | B5 (regen 1, text-only) | gpt_image_2_5 | 21:9 / 2k / xhigh | — (the MV-10 ref pulled its composition) | 1 | 4.5 | 4.5 | 212.25 | 7a6da513-4572-4785-b826-77b068747f54 | **DEFAULT** → films-rdr2.webp | left45 global SD 23.7 (dusk sky over a dark ridge; local SD 2.07 ✓) | Claude ✓ 09-29 / Aryan — | Claude (overnight authorization) |
| M2-52 | B · B28 | 2026-09-29 00:30 | G6 (C + L2) | intermission/rdr2 | F-RD | B5 (regen 1, text-only) | gpt_image_2_5 | 21:9 / 2k / xhigh | — | 1 | 4.5 | 4.5 | 216.75 | f66a8f31-ade5-46f9-9baa-034678a0b386 | **ALT** → films-rdr2-alt.webp | left45 global SD 19.2 (local 2.82 ✓) | Claude ✓ 09-29 / Aryan — | — |
| M2-53 | B · B29 | 2026-09-29 00:30 | G6 (C + L2) | intermission/idiots | F-3I | B5 | gpt_image_2_5 | 21:9 / 2k / xhigh | 4686928b (MV-06, the lane A default) | 1 | 4.5 | 4.5 | 221.25 | a4ec7e96-84d8-4d8a-a6b9-b71c6547e72f | **DEFAULT** → films-idiots.webp | scooter at x ≈ 0.79 (plan 0.72); left45 global SD 41.9 (pale sky over the lake; local 4.51 ✓) | Claude ✓ 09-29 / Aryan — | Claude (overnight authorization) |
| M2-54 | B · B30 | 2026-09-29 00:30 | G6 (C + L2) | intermission/idiots | F-3I | B5 (text-only A/B) | gpt_image_2_5 | 21:9 / 2k / xhigh | — | 1 | 4.5 | 4.5 | 225.75 | 8b981679-0da7-4154-ac7e-3f274bb00a6c | **ALT** → films-idiots-alt.webp | the sun disc and its reflection compete with the scooter as the warm point; left45 local SD 5.8 ✓ | Claude ✓ 09-29 / Aryan — | — |
| M2-55 | B · B31 | 2026-09-29 00:30 | G8 (C + L2) | rdr2 | MV-11L | B6 video | kling3_0 | 16:9 / pro / 8 s / sound off | start = end = a2e95902 (MV-11) | 1 | 14 | 14 | 239.75 | d4086e11-bb78-451d-ae83-438b841f3a4c | **DEFAULT** → campfire-loop.mp4/.webm | — | Claude ✓ 09-29 / Aryan — | Claude (overnight authorization) |
| M2-56 | B · B32 | 2026-09-29 00:30 | G8 (C + L2) | rdr2 | MV-11L | B6 video | kling3_0 | 16:9 / pro / 8 s / sound off | start = end = a2e95902 | 1 | 14 | 14 | 253.75 | 8d687e50-6273-4711-a462-d03cc7ab5531 | **ALT** → campfire-loop-alt.mp4/.webm | ground glow 16.6% (> 15); the broad fire-lit zone reverses > 5% up to 3×/s on a mean luminance of 0.0098 | Claude ✓ 09-29 / Aryan — | — |
| M2-57 | B · B33 | 2026-09-29 00:30 | G5→S5 (C + L2) | hp | MV-09 | B6 video | kling3_0 | 16:9 / pro / 8 s / sound off | start = end = b31ef3f6 (MV-08) | 1 | 14 | 14 | 267.75 | b1fed92b-d954-4e0c-8737-42449b360e9f | reject | the flame flickers at ≈10.5 Hz (flame-zone peak-to-trough 45%); the sheet says "never flickering" | Claude ✓ 09-29 | — |
| M2-58 | B · B34 | 2026-09-29 00:30 | G5→S5 (C + L2) | hp | MV-09 | B6 video | kling3_0 | 16:9 / pro / 8 s / sound off | start = end = b31ef3f6 | 1 | 14 | 14 | 281.75 | 634151ff-7928-49c4-b113-03c2a9fcce4d | **ALT** → last-light-loop-alt.mp4/.webm (was the default until B35) | nearly still: flame-zone breathing ≈1.6% (within ≤ 15%) | Claude ✓ 09-29 / Aryan — | — |
| M2-59 | A · A6-1 | 2026-09-29 00:39 | G2 downstream (overnight auth) | pirates | MV-03 (alt) | A6 (extra run: the only runner-up, minimax ebb7db32, was a reject) | kling3_0 | 16:9 / pro / 8 s / sound off | start = end 548e5fc0 | 1 | 14 | 14 | 295.75 | f5130107-5bde-46a1-84b4-094c1b72fc4c | **ALT** → hero-sea-loop-alt2.mp4/.webm/-poster.webp (proposed replacement for the M1.5 alt, which is the rejected minimax ebb7db32) | first/last 0.987 / 0.986, join **0.995** (default 0.991); left half ≤ 0.41/255; lantern peak ±2.3%; calmer (crest amplitude ≈57% of the default) | Claude ✓ 09-29 / Aryan — | — |
| M2-60 | A · A6-2 | 2026-09-29 00:39 | S3 (overnight auth) | pirates | MV-02 (alt) | A6 (extra run: nano runner-ups were rejects) | gpt_image_2_5 | 4:5 / 2k / high | 548e5fc0 | 1 | 2.75 | 2.75 | 298.5 | 37eb75b2-d3b1-48c5-97df-787555f63abd | **ALT** → hero-sea-mobile-alt2.webp (proposed replacement for the M1.5 alt, the rejected nbp 84001a3b) | crest xp02 0.306 / xp98 0.924; top 8% p95 0.0070; bottom 22% p95 0.0023; ship clean at 2.5× | Claude ✓ 09-29 / Aryan — | — |
| M2-61 | B · B35 | 2026-09-29 00:39 | G5→S5 (C + L2) | hp | MV-09 | B7 video (the alt run: B33 failed, so no runner-up existed yet) | kling3_0 | 16:9 / pro / 8 s / sound off | start = end = b31ef3f6 | 1 | 14 | 14 | 312.5 | 154f82ce-aa27-4328-abb8-b2e43bc44911 | **DEFAULT** → last-light-loop.mp4/.webm | — (flame breathes 3.8%, no flicker; prompt added "the flame itself keeps its shape") | Claude ✓ 09-29 / Aryan — | Claude (overnight authorization) |
| M2-62 | B · B36 | 2026-09-29 00:42 | G5 (C + L2) | hp | MV-08 | B8 (regen 1: trail confined right of 62%) | gpt_image_2_5 | 16:9 / 4k / high | 5155788f (MV-07) | 1 | 4.25 | 4.25 | 316.75 | 47e9a970-dde7-41aa-b082-8055ca573fc3 | **ALT** → last-light-alt.webp | trail 0.63–0.80 ✓ and nothing left of 62% ✓, but the nearest trail candle is 4.8% from the flame (calm ±8% ✗) and the flame blob sits at y 0.396 (range 0.40–0.60, marginal); MV-09 exists only for the default | Claude ✓ 09-29 / Aryan — | — |
| M2-63 | B · B37 | 2026-09-29 00:42 | G5 (C + L2) | hp | MV-08 | B8 (regen 1) | gpt_image_2_5 | 16:9 / 4k / high | 5155788f (MV-07) | 1 | 4.25 | 4.25 | 321 | f5eaa21b-f82e-4d92-8227-dd714127530d | reject | flame blob at y 0.364 (< 0.40); a trail candle at x 0.61 (left of 62%); nearest trail candle 7.3% from the flame | Claude ✓ 09-29 | — |

### M2 per-asset spend (both lanes) vs MEDIA-PLAN v2 plan / cap
| Asset | Lane | Plan | Cap | M2 spent | Program total on asset | vs cap | DEFAULT (job) | ALT (job) |
|---|---|---|---|---|---|---|---|---|
| MV-04 storm | A | 15 | 29 | 14 | 14 | ok | 350f546b | a0060b78 |
| MV-05a–d voyage set | A | 22 | 44 | 42.5 | 42.5 | ok (4k high, not 2k) | 6ce86233 · 57a84723 · bcb620aa · f73d3e86 | 8af307c9 · c864d744 · 3c50b647 · fe8963a1 |
| JV-1…3 sequence | A | 66 | 110 | 52.5 | 52.5 | ok | ab5526ac · 169d76b5 · ee674bcf | bf8f2262 · 64a0052d · 8c75dd34 |
| MV-06 (+ comp) | A | 10 | 19 | 16.5 | 16.5 | ok | 4686928b | 1935fc6f |
| MV-03 alt2 | A | (MV-03 30) | 80 | 14 | 44 | ok | 764ca916 (M1, unchanged) | f5130107 |
| MV-02 alt2 | A | (MV-02 6.75) | 8 | 2.75 | 9.5 | **+1.5 over** | 10b81664 (M1, unchanged) | 37eb75b2 |
| MV-10 (+ comps) | B | 9.5 | 16 | 13 | 13 | ok | 32281e86 | c249b137 |
| MV-10m | B | 4 | 6 | 10.25 | 10.25 | **+4.25 over** | 8f6f4c4f | 76920a65 |
| MV-11 (+ comps) | B | 6.5 | 13 | 10.5 | 10.5 | ok | a2e95902 | dc902346 |
| MV-11L | B | 14 | 28 | 28 | 28 | at cap | d4086e11 | 8d687e50 |
| MV-07 (+ comps) | B | 14 | 32 | 13 | 13 | ok | 5155788f | c9c70e36 |
| MV-08 | B | 9 | 18 | 17 | 17 | ok | b31ef3f6 | 47e9a970 |
| MV-09 | B | 30 | 60 | 42 | 42 | ok | 154f82ce | 634151ff |
| F-PC | B | 9 | 18 | 9 | 9 | ok | 8c581de2 | f86e2553 |
| F-3I | B | 9 | 18 | 9 | 9 | ok | a4ec7e96 | 8b981679 |
| F-RD | B | 5.5 | 11 | 18 | 18 | **+7 over** | 7a6da513 | f66a8f31 |
| F-HP | B | 9 | 18 | 9 | 9 | ok | 0b8c414a | 0fcde977 |
| **M2 total** | A + B | **≈ 232.5** (+ alts) | **≈ 440** (+ alts) | **321** | | **12.75 over per-asset caps** | | |

The MEDIA-PLAN caps assumed one final per asset. The overnight DEFAULT + ALT rule roughly doubles the finals, which accounts for the three overruns.

### Totals (M2 cross-check, 2026-09-29, reconciled against Higgsfield `balance` and `transactions`)
- **`balance`: 674.5 credits** on the `plus` plan.
- **2026-09-29 spends (`transactions`):**
  - 63 spend rows between 04:14:48 and 04:42:54 UTC, totalling **321.0**.
  - That is Lane A **142.25** (26 rows) plus Lane B **178.75** (37 rows).
  - Nothing was billed after 04:42:54 UTC, and there are no refunds.
- **2026-09-28 spends after the 1,200 grant** (20:55 UTC): 31 rows totalling **204.5**, which matches Step 1 (43) plus Step 2 (161.5).
- **Arithmetic check:** 1,200 − 204.5 − 321.0 = **674.5** ✓, the same as `balance`.

| Line | Credits |
|---|---|
| Balance at the subscription reset (2026-09-28 16:55 ET) | 1,200 |
| Step 1: stills | 43 |
| Step 2: motion | 161.5 |
| M1 fix round | 0 |
| M2 Lane A (Acts I & II) | 142.25 |
| M2 Lane B (Acts III & IV + films) | 178.75 |
| **Program total spent** | **525.5** |
| **Balance now** | **674.5** |

- **MEDIA-PLAN v2 (cap 950, floor 250; RD-6 still awaits Aryan):** 525.5 of 950 spent, leaving **424.5** above the floor.
- **This file's legacy header (cap 750, floor 447):** 525.5 of 750 spent, leaving **227.5**. The header's running-totals line (204.5 spent, balance 995.5) is stale; this section supersedes it.
- **Tonight's reserve rule (balance ≥ 150):** never approached. The lowest balance was the final 674.5.
- **Lane caps:** A used 142.25 of 330 and B used 178.75 of 330, 321 of 660 combined.
- **Buffer (≈ 209 in v2):** 12.75 used by the per-asset overruns (MV-02 +1.5, MV-10m +4.25, F-RD +7).
- **Correction:** Lane A's closing summary says "29 generations: 21 images + 8 videos". Its ledger and `transactions` both show **26** (19 images and 7 videos). The credit total of 142.25 is correct.

**Running totals (current, 2026-09-29):**
- Spent **525.5 / 950** cap (v2), or 525.5 / 750 under the legacy header.
- Balance **674.5**; the floor is 250 under v2, or 447 under the legacy header.
- Reserve ≥ 250 intact: **yes**.
- Buffer used: **12.75 / ≈ 209**.
