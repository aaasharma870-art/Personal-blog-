# P3 media lane: M-AUX (round 2), 2026-09-30

Plan §9.3 (a) marks, (d) graphite horse, (c) optional. **Credits spent: 0** (no Higgsfield call, no generation, no charge). Nothing written to `public/`, `lib/`, `LOG.md` or the ledgers; nothing committed.

| item | status | output |
|---|---|---|
| (a) marks | **done** | `docs/build/media-staged/p3/marks.json` + `docs/build/media-staged/p3/marks-overlays/<plate id>.webp` (7 eye-check overlays, 1280×720) |
| (d) graphite horse | **done** | `docs/build/media-staged/p3/sprites/horse/frames.json` (8 frames, provenance, checks), `preview-strip.png`, `tools/` (the tracer); source master `media-src/p3/masters/muybridge-the-horse-in-motion-1878.jpg` (gitignored) |
| (c) IN-02 re-blend + BT.709 tag | **skipped** | optional and not trivial (a re-encode of MV-03 plus a `FLIGHTS` change in `lib/`, which a media agent may not edit); left for W1 or later |

## (a) Marks: re-measured on the 2560×1440 plates

Source: the shipped `public/media/films/*.webp` (2560×1440), measured at full resolution. Units follow the `lib/media.ts` `marks` tuple: `[x of width, y of height]`; a line is `[0, y]` like the existing `horizon` marks.

| plate (file) | mark | value | 2000-px estimate | method |
|---|---|---|---|---|
| MV-10 (frontier-dusk) | `horizon` | `[0, .333]` | .33 | where the valley floor meets the foot of the mountains (the haze glow band); per-4 %-column Sobel-y and luma peak over x .50–.98 (glow median .3354, foot edge median .3313); the line tilts from .32 at x .55 to .345 at x .95 |
| MV-10-alt | `horizon` | `[0, .333]` | n/a | right half identical to MV-10 within .0007 |
| iconic-deadeye | `horizon` | `[0, .44]` | n/a | the mountains' foot, where the foothills begin (row edge .437–.442; .453 over x .73–.80). Other lines if a builder wants them: skyline .37–.39, far field edge .48 |
| iconic-camp | `lake` | `[0, .378]` | .378 | far waterline: the strongest positive Sobel-y row at y 543–546 px over x .20–.40 (median .3778) |
| iconic-camp | `wheel` | `[.8883, .5667]` | .888, .565 | rotated-ellipse fit to the rim (maximises radial gradient; the arc hidden by the tent is excluded): centre (2274, 816) px, −7.5°; outer rim checked with luma profiles (top y 712, left x 2179) |
| iconic-camp | `wheelR` | `[.0375, .0722]` | .062 (of height) | outer-rim half-extents 96 × 104 px (`[rx/W, ry/H]`). The 2000-px radius was about 14 % small. Hub at [.8932, .5681] |
| iconic-camp-alt | `lake` | `[0, .369]` | n/a | far waterline y 525 → 534 px, median .3698 |
| iconic-camp-alt | `wheel` / `wheelR` | `[.4344, .5837]` / `[.0195, .0517]` | n/a | the right wheel: slightly smaller (a front wheel on a real wagon), not hidden by anything, nearer the centre. The other wheel is `[.3623, .5840]` / `[.0227, .0556]` |
| iconic-hall | `tableL` / `tableR` | `[.398, .6385]` / `[.636, .6385]` | [.40, .638] / [.637, .638] | the high table's lit top edge: luma peaks at rows 919–920 px, with the dark apron from 921; the ends come from the apron's dark band against the lit wall |
| iconic-hall-alt | `tableL` / `tableR` | `[.321, .6306]` / `[.632, .6306]` | n/a | lit lip at rows 906–909 px, apron from 910 |

- **Looked at:** a full-plate overlay per plate (`marks-overlays/`), plus 150–300 % crops of every line and end (hall table ends, camp waterlines, both camp-alt wheels, the default wheel). Every mark sits on its feature.
- **Why `wheelR` is a pair:** the `marks` type is `[x, y]`, so a single radius does not fit. `wheel ± wheelR` gives the rim's bounding box in plate units; `wheelR[1]` is the radius as a fraction of height, which the old `.062` meant.
- **Where each line lands on the MATCH_ROW crop** (spec §7.2; row = y·Hc − (Hc−1)·pos, Hc = 1.3444·zoom), recorded in `marks.json.matchRowRegistration`:
  - camp: pos .1108 at zoom 1, which matches the spec's .111.
  - camp-alt: pos .0757.
  - hall: at pos 1 it needs zoom **1.0906** (the spec said 1.089).
  - hall-alt: zoom 1.0672 at pos 1.
  - deadeye: pos .353 at zoom 1.
  - MV-10: cannot reach .47 at zoom 1. It needs zoom 1.0499 at pos 0. At the spec's pos 0 / zoom 1.02, the horizon lands at row .457, not .47. The tintype only develops outward from this row, so the difference matters only if it is also registered to MATCH_ROW.
- **Optional consistency notes for the assembler:** hall `highTable` could become `[.517, .6385]` and hall-alt `[.4765, .6306]` (the table centres on the re-measured edge).
- **Accuracy:** lines ±2 px at 2560; table ends ±3 px; wheel centres ±3 px; half-extents ±4 px.
- **Verdict:** PASS. It is ready for plan §9.4 step 3 (`marks.json` → `lib/media.ts` marks on each plate).

## (d) Graphite horse: Muybridge, "The Horse in Motion" (1878)

**Fetch**
- The first Commons API call returned "You are making too many requests" (a rate-limit page, nothing charged). The retry a few minutes later returned the metadata.
- The file came direct from `https://upload.wikimedia.org/wikipedia/commons/7/73/The_Horse_in_Motion.jpg`: 200, image/jpeg, 218 198 bytes, 1536×952 greyscale.
- Its SHA-1 `d7b65881708c1740e8bb6cf11bc6f2f72cd6d862` matches the Commons `sha1`.

**Licence (Commons extmetadata, read 2026-09-30)**
- LicenseShortName "Public domain", License `pd`, Copyrighted False, AttributionRequired false.
- Categories PD-old-100-expired and CC-PD-Mark.
- DateTimeOriginal 1878-06-19. Credit: Library of Congress Prints and Photographs Division, hdl.loc.gov/loc.pnp/cph.3a45870.
- File page: https://commons.wikimedia.org/wiki/File:The_Horse_in_Motion.jpg

**Frames chosen: panels 1, 2, 4, 5, 6, 7, 9, 10 (time order).**
- A silhouette-IoU matrix of the legs over panels 1–11 shows that panel 11 is closest to panels 2 and 1 (.66 and .61). So panels 1–10 are one stride.
- Eight frames spread over those ten skip 3 and 8, the two with the most merged legs or the most rider overlap.
- The loop from 10 back to 1 scores IoU .58, which matches the neighbouring pairs (.5–.6).
- Panel 12 is the standing horse and is not used.
- Timing: the card's caption says the negatives are about 1/25 s apart, so the stride takes 0.4 s. Eight frames then run in real time at **20 fps**; slower suits a graphite feel.

**Tracing (cv2 + sharp; scripts in `sprites/horse/tools/`)**
1. Split the card into panels at its measured black borders.
2. Upsample ×4, threshold luma < 105, and cut away the ground or track rows.
3. Open with a 2.2 px element to drop the grid lines, reins and numerals, and keep the largest component. Only specks under 0.02 % are filled, so real gaps between the legs stay open (the first try filled them and made the gathered legs look lumpy).
4. **Remove the rider:** cut everything above a back line running from the saddle's rear edge to the neck notch. The line is a weighted quadratic fitted through the true withers, which show in the gaps under the rider's arms. Fill any leftover limb pockets, then close the cut zone.
   - The first try, a straight line, left the withers slightly humped.
   - The second, which kept the gaps open, left lumps.
   - The fitted curve is clean and follows the source.
5. Register the frames: horizontally by the best torso-band IoU with panel 1 (≤ 12.5 source px), vertically so every ground line sits on `groundY`.
6. Smooth (σ 1.1 source px) and take the contours, keeping holes (fill-rule evenodd). Simplify with approxPolyDP ε 0.55 source px, then draw quadratic Béziers through the edge midpoints.
7. Normalise to `viewBox 0 0 183.5 100`, with the ground at y = 100 and the horse facing right. That is 140–160 points and about 3 KB of path data per frame, 24.3 KB for all 8.

**Checks**
- **Fidelity:** each traced path, drawn through its inverse registration over its source panel, follows the photograph's edge within about 1 source px. The back under the rider follows the visible withers, with no background covered and no horse lost. That overlay shows the rider and the card's numerals, so it stays in the scratchpad, not the repo.
- **L2:** checked on all 8 rendered frames at full size (`preview-strip.png`, 2283×168, text-free).
  - No rider, figure, face or hand; no text, numerals or grid lines.
  - One head and four legs per frame, taken from the photograph; legs merge only where they overlap in the source.
  - Panel 2 is the gathered phase with all four hooves off the ground (`airborne: true`).
  - Silent, and nothing flashes.
- **Verdict:** PASS. It is staged for plan §9.4 step 5: the assembler writes `components/words/sprites/horse-frames.ts` from `frames.json`, carrying the provenance into its header and into LOG.md.

## For the assembler (rows to copy)

- LOG.md, M-AUX:
  - 0 credits.
  - `marks.json`: 7 plates, 13 marks, re-measured at 2560.
  - Graphite horse: 8 frames traced from Muybridge 1878 (public domain, Commons; SHA-1 d7b65881…). Rider removed, no text.
  - (c) skipped.
- LEDGER-p3loops.md: nothing (no loop jobs).
