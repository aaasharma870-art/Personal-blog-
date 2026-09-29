# Higgsfield credit LEDGER: M2 iconic plates · 2026-09-29 03:52–04:03 ET

**Scope:** eight new iconic plates, each with a DEFAULT and an ALT: PEARL, HALL, EXPRESS, ICE, DRONE, CAMP, WANTED, DEADEYE (M2-R recognizability lane).
**Lane cap:** 330. **Floor:** the balance never drops below 150; it was checked before each batch.
**Balance:** 674.5 at the start → 534.5 at the end (`balance`). The lane spent **140.0**, reconciled against `transactions`: 20 spends × 7 at 07:53:58–07:59:40 UTC. The one 429 `rate_limit_reached` submission (index 0 of batch 1) was **not charged**.
**Program running total (MEDIA-PLAN v2):** 525.5 + 140 = **665.5 / 950** cap. The v2 floor of 250 is intact.
**Preflights (2026-09-29, `get_cost`):**
- `gpt_image_2_5` 16:9 4k xhigh: **7**
- 4k high: 4.25
- 2k high: 2.75
- Edit with an `image_references` job id, 4k xhigh: **7**
**Model/params for every row:** `gpt_image_2_5`, 16:9, 4k, xhigh. Output is 3840×2160 exact.
**Prompts:** `prompts/m2iconic/<name>.full.txt` and `*.edit.full.txt`. **Masters:** `masters/m2iconic/<name>/`.

| # | Time ET | World | Asset | Batch | Refs (job ids) | Preflight | Charged | Lane spent | Job id | Verdict | Reason / checks | Check L2 (Claude/Aryan) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| I1-0 | 09-29 03:53 | pirates | PEARL | I1 | — | 7 | 0 | 0 | (429 rate_limit, no job) | resubmitted as I2-0 | — | — |
| I1-1 | 09-29 03:53 | pirates | PEARL b | I1 | — | 7 | 7 | 7 | c2967ce4-6951-4ea3-b003-2f194f54b2ec | **ALT** → iconic-pearl-alt | Close stern-quarter galleon with tattered black sails, moon and aqua wake. A carved urn/bird finial on the stern rail sits at ≈1% of the frame; no face at 600% | Claude ✓ 09-29 / Aryan — |
| I1-2 | 09-29 03:53 | hp | HALL a | I1 | — | 7 | 7 | 14 | 0fd211fb-b4e9-4b19-ac70-3ac88bd8d771 | **ALT** → iconic-hall-alt | Four long tables with gold plates, high table, starry ceiling, hundreds of floating candles; no people, no banners. Slightly brighter lower-left (p95 0.105) | Claude ✓ 09-29 / Aryan — |
| I1-3 | 09-29 03:53 | hp | HALL b | I1 | — | 7 | 7 | 21 | 1ef4355e-d82b-4513-a273-1cbdebbd8755 | **DEFAULT** → iconic-hall | The same icons, plus a taller central gothic window and denser candles; lower-left p95 0.088. Clean at the 9× ghost gain | Claude ✓ 09-29 / Aryan — |
| I1-4 | 09-29 03:53 | hp | EXPRESS a | I1 | — | 7 | 7 | 28 | 179e03ab-510d-4521-8f9f-2ce41069daaa | source (not shipped) | **FAIL check A:** gold monogram emblems on the tender, cab and splasher, plus gold pseudo-glyph ciphers on the carriages → edit I3-2 | Claude ✓ 09-29 |
| I1-5 | 09-29 03:53 | hp | EXPRESS b | I1 | — | 7 | 7 | 35 | 30cb966e-6a11-48b2-95bb-f66d9fce607e | source (not shipped) | **FAIL check A:** a tender roundel and a pseudo-number cab plate ("5?71") → edit I3-1 | Claude ✓ 09-29 |
| I1-6 | 09-29 03:53 | idiots | ICE a | I1 | — | 7 | 7 | 42 | 0e7a3d5c-2e37-4a53-b635-6a618e773405 | **DEFAULT** → iconic-ice | Tiered wooden benches; a huge blank green board on granite; a pergola corridor casting striped sun. Board bbox x 0.389–0.961, y 0.091–0.410; inner SD 9.2/255, no marks | Claude ✓ 09-29 / Aryan — |
| I1-7 | 09-29 03:53 | idiots | ICE b | I1 | — | 7 | 7 | 49 | 950f30c7-8bb9-4782-82e6-a4f6a647e26f | **ALT** → iconic-ice-alt | The same, with a bench-style lecturer's table. Board bbox x 0.398–1.0, y 0.178–0.473; inner SD 8.8, no marks | Claude ✓ 09-29 / Aryan — |
| I1-8 | 09-29 03:53 | idiots | DRONE a | I1 | — | 7 | 7 | 56 | e979d365-cd08-4652-ac15-729fae5c80f4 | source (not shipped) | **FAIL check A:** PCB silkscreen pseudo-glyphs and a yellow camera tag with pseudo-letters → edit I3-3 | Claude ✓ 09-29 |
| I1-9 | 09-29 03:53 | idiots | DRONE b | I1 | — | 7 | 7 | 63 | eb254302-e8d7-44c2-8bea-62ad42d5a2cc | source (not shipped) | **FAIL check A:** a row of pseudo-glyphs on the PCB → edit I3-4 | Claude ✓ 09-29 |
| I1-10 | 09-29 03:53 | rdr2 | CAMP a | I1 | — | 7 | 7 | 70 | 37726d77-ed0d-4777-8986-e84216079cfe | **ALT** → iconic-camp-alt | Fire with tripod pot, covered wagon, A-frame and wall tents, 3 hitched horses (from behind, 4 legs each), lake, sunset. No people or lettering | Claude ✓ 09-29 / Aryan — |
| I1-11 | 09-29 03:53 | rdr2 | CAMP b | I1 | — | 7 | 7 | 77 | 3c420eac-b80f-44ff-beae-c89b4e4bb3cb | **DEFAULT** → iconic-camp | 3 horses facing camera at the rail (4 legs, 1 head each), lit wall tent, covered wagon, lake glinting at sunset; lower-left p95 0.044 | Claude ✓ 09-29 / Aryan — |
| I2-0 | 09-29 03:55 | pirates | PEARL a | I2 | — | 7 | 7 | 84 | 4273a1be-64f7-4c66-aabf-5b44710d490c | **DEFAULT** → iconic-pearl | Three-quarter bow view with full tattered black sails, lit stern windows, deck lanterns, moon path and aqua wake. No crew, flag or figurehead; clean at the 9× ghost gain | Claude ✓ 09-29 / Aryan — |
| I2-1 | 09-29 03:55 | rdr2 | WANTED a | I2 | — | 7 | 7 | 91 | 3af08f65-9d2e-4d84-937d-91ea9fe2991c | **DEFAULT** → iconic-wanted | Shingle-roofed board and 5 blank aged posters. Central poster x 0.257–0.494, y 0.192–0.748. Golden-hour false-front street with no signs | Claude ✓ 09-29 / Aryan — |
| I2-2 | 09-29 03:55 | rdr2 | WANTED b | I2 | — | 7 | 7 | 98 | afe7b162-40c8-438a-b932-350b7480f3ba | **ALT** → iconic-wanted-alt | Larger board; central poster x 0.245–0.468, y 0.206–0.756; all posters blank | Claude ✓ 09-29 / Aryan — |
| I2-3 | 09-29 03:55 | rdr2 | DEADEYE a | I2 | — | 7 | 7 | 105 | 56c0a864-3e48-472e-8b1a-a6183c4ac10e | **ALT** → iconic-deadeye-alt | Lone oak, split-rail fence, trail, homestead, frozen birds; a vivid red sunset look, less "filtered" | Claude ✓ 09-29 / Aryan — |
| I2-4 | 09-29 03:55 | rdr2 | DEADEYE b | I2 | — | 7 | 7 | 112 | 0a60fa27-78e8-4340-8ddd-ca77858eed7a | **DEFAULT** → iconic-deadeye | The same icons under a heavier desaturated red-sepia grade and vignette, closer to the in-game slowed-time look | Claude ✓ 09-29 / Aryan — |
| I3-1 | 09-29 03:59 | hp | EXPRESS b-edit | I3 (edit) | 30cb966e | 7 | 7 | 119 | 4c065bde-7166-496b-a481-6c34465683ab | **DEFAULT** → iconic-express (after a 0-cr retouch) | Carriage ciphers removed. A blank tender oval and a small cab plate remained; both were inpainted locally with OpenCV Telea (`*.retouch.png`, 2 masks ≤ 30 px). The curving many-arched viaduct, loch and mist are preserved | Claude ✓ 09-29 / Aryan — |
| I3-2 | 09-29 03:59 | hp | EXPRESS a-edit | I3 (edit) | 179e03ab | 7 | 7 | 126 | 5d84e0b7-b33b-4156-ad6e-fa7df438fc33 | **ALT** → iconic-express-alt | Tender and cab now plain. Carriages keep ≤ 5 px non-legible gold dots/handles at 2560 | Claude ✓ 09-29 / Aryan — |
| I3-3 | 09-29 03:59 | idiots | DRONE a-edit | I3 (edit) | e979d365 | 7 | 7 | 133 | 69cafb24-6ff8-4408-a81f-0ab89821ebfe | **DEFAULT** → iconic-drone | PCB shows pads and traces only; camera plain; yellow tag gone; composition preserved | Claude ✓ 09-29 / Aryan — |
| I3-4 | 09-29 03:59 | idiots | DRONE b-edit | I3 (edit) | eb254302 | 7 | 7 | 140 | 07096f02-550d-472a-958e-b2ba002af637 | **ALT** → iconic-drone-alt | PCB rows are now header pins and parts (no glyph row); blue battery unlabelled | Claude ✓ 09-29 / Aryan — |

**Running totals:**
- Lane: **140.0 / 330**, 190 unused.
- Balance **534.5**, against a floor of 150 and the v2 floor of 250.
- Regenerations used: none from scratch. The 4 edits are the "≤ 2 regens" allowance for EXPRESS and DRONE: one each per candidate.

## M2 finish · 3 Idiots scenes (CORRIDOR, PEN) · 2026-09-29 13:04 UTC
**Lane cap:** 70. **Floor:** 150. **Balance:** 534.5 → **506.5** (`balance`, checked before and after the batch). `transactions`: 4 spends × 7 at 13:04:09.9–13:04:12.7 UTC.
**Model/params:** `gpt_image_2_5`, 16:9, 4k, xhigh (preflight 7), 3840×2160, text-only.

| # | Time UTC | World | Asset | Batch | Refs (job ids) | Preflight | Charged | Lane spent | Balance after | Job id | Verdict | Reason / checks | Check L2 (Claude/Aryan) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F1-0 | 09-29 13:04 | idiots | CORRIDOR a | F1 | — | 7 | 7 | 7 | 527.5 | f71ce666-7b28-42db-b714-761832ac572c | **unchecked** | Completed; the download was blocked (CDN 403 at the egress proxy), so it was not viewed | — |
| F1-1 | 09-29 13:04 | idiots | CORRIDOR b | F1 | — | 7 | 7 | 14 | 520.5 | 14f08567-a7ea-4474-afda-050a12407aea | **unchecked** | As F1-0 | — |
| F1-2 | 09-29 13:04 | idiots | PEN a | F1 | — | 7 | 7 | 21 | 513.5 | 8ad09fd8-3fc2-439e-9e14-b8c31c71a929 | **unchecked** | As F1-0 | — |
| F1-3 | 09-29 13:04 | idiots | PEN b | F1 | — | 7 | 7 | 28 | 506.5 | d8c90c09-68a4-4a09-b7c9-782bd2577575 | **unchecked** | As F1-0 | — |

**Running totals:**
- Lane: **28.0 / 70**, 42 unused (enough for one regen or edit per plate after the checks).
- Balance **506.5**, against a floor of 150 and the v2 floor of 250.
- Program running total (MEDIA-PLAN v2): 665.5 + 28 = **693.5 / 950**.

**M2 finish delivery (14:06 UTC):** F1-0…F1-3 fetched and checked — corridor 14f08567 = DEFAULT, f71ce666 = ALT; pen 8ad09fd8 = DEFAULT, d8c90c09 = ALT. 0 extra credits. Balance 506.5.
