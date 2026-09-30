# P3 media lane: tools + 0-credit re-seams

Batch "tools", 2026-09-30, branch `design/three-films`. **Credits spent: 0.** No generate call, no upload, no preset. `balance` = 506.5 (plus), the same as in the map. The one Higgsfield call was `show_generation_by_ids` (read-only), used to fetch the rawUrl of the six shipped loop jobs.

## 1. The tool: `tools/media/loop.mjs`

Node 22 ESM. It uses ffmpeg 7 (`/usr/local/bin/ffmpeg`; there is no ffprobe) and sharp. python3/cv2 is used only for the phase shift. Every ffmpeg call runs with `-threads 2`. The full usage is in the file header; this is the summary.

| Subcommand | What it does |
|---|---|
| `seam <master> <out-base> --k=12\|24 --tier=S\|I` | Writes `<out-base>.mp4`, `<out-base>.webm` and `<out-base>-poster.webp` (frame 0, 1920 w, q80, ≤ 100 KB). The seam is rendered once to a lossless x264 `-qp 0` intermediate, and both encodes come from it. The JSON summary includes `seamCheck`, which is the motion-seam verdict measured on the lossless intermediate. |
| `--method=blend` (default) | The map §4 recipe: `out = src[K..N-K-1] ++ blend(src[N-K+i] → src[i], i/(K-1))`, built with select/blend/concat (not xfade). It gives N−K frames. |
| `--method=residual` (**recommended for Kling start = end masters**) | `out = src[0..N-2]`. The last K frames get `+ w·(src[0] − src[N-1])` with `w = (i+1)/(K+1)`, computed in 16-bit. Frame 0 stays the pinned plate frame, the loop is N−1 frames (8.00 s) and there is no dissolve. |
| `--rotate=auto --plate=` | Cyclically rotates the loop so that frame 0 is the frame closest to the plate. Use it with `blend`. |
| `--crf-mp4 / --crf-webm / --gop-mp4 / --gop-webm / --tail-boost` | Encode controls. See §3 for why the GOP defaults to one keyframe per loop and why there is a tail boost. |
| `boomerang <master> <out-base> --tier=` | Plays `src[0..N-1]` then `src[N-2..1]`: 2N−2 frames, with no held frame at either turn. Use it only for bob, hover, sway or haze. |
| `check <video> [--plate=] [--static=x0,y0,x1,y1]… [--light=…]…` | Prints JSON: first/last vs the plate, the join, consecutive min/p05/median and the join's percentile. All SSIM is ffmpeg `ssim` "All" on yuv420p at 960×540. It also gives `joinRgb`, static-zone max mean\|ΔY\| vs frame 0, WCAG-style flashes per second (whole frame + worst 4×4 tile), red share, the luma range, and per light zone the peak-to-trough %, reversals/s and dominant Hz. It adds the audio stream count, exact frame count (framecrc), fps, duration, bytes, the phase shift, and a `pass{}` object. |
| `frames <video> <outdir> [--at=] [--crop= --scale=] [--wrap=w] [--slit=x,y0,y1]` | PNG frames at percentages, with 100–200% crops. The wrap outputs are a strip, a crop strip and a ×8 difference image. The **slit-scan** (column x across the last/first 12–36 frames) is the best still-image test of a join: a jump shows as a vertical seam at the tick. |
| `sequence <master> <outdir> --frames=72 --width=1280` | Evenly spaced `000.webp…071.webp`, like `voyage-seq/`. |

**How to read `pass.join`:**
- `true`: the wrap is ≥ 0.97 and no worse than the worst natural step.
- `"codec"`: the file is H.264, and its wrap lands on the IDR at frame 0 within 0.015 of the median step. That is a texture refresh from the codec, not a motion jump. Judge the motion on `seamCheck` or on the WebM.
- `false`: a real outlier.

**Self-test on `public/media/films/hero-sea-loop.mp4` (plate `hero-sea.webp`)** passed for every subcommand:

| Run | Output | Result |
|---|---|---|
| `check` | 193 f, 8.04 s, 0 audio | first/last 0.985/0.978; join 0.9879 (RGB 0.948), percentile 0, min step 0.9949, median 0.9972; left 45% 0.65/255; 0 flashes; phase −0.05 px |
| `seam --k=24 --tier=S` (blend) | 169 f, 7.04 s; MP4 1.49 MB, WebM 0.78 MB, poster 44 KB | lossless seamCheck join 0.9973 (percentile 0.51); WebM join 0.9972 (percentile 0.37). **Registration 0.914**: the plate frames are dropped |
| `seam --k=24 --tier=I --method=residual` | 192 f, 8.00 s, 1280×720; MP4 0.60 MB, WebM 0.51 MB | seamCheck join 0.9981 (percentile 0.89); WebM first/last 0.982/0.981, join 0.9982 (percentile 0.56) |
| `boomerang --tier=I` | 384 f, 16.0 s; MP4 1.05 MB, WebM 0.95 MB | WebM join 0.9977 (percentile 0.42); registration 0.982 (frame 0 = src[0]) |
| `frames --crop --scale=2 --wrap=3 --slit` | 14 PNGs | OK |
| `sequence --frames=72 --width=1280` | 72 webp, 1.21 MB, indices 0,3,5,8 … 189,192 | OK |

Wall time at 2 threads: `seam` S 35–60 s (sea; calm scenes about 20 s), `check` about 4 s, `boomerang` about 45 s.

## 2. Measurement notes (read before comparing numbers)

- **SSIM convention.** The LOG/vcheck numbers are ffmpeg `ssim` "All" on **yuv420p** at 960×540. `check` reproduces the LOG's master figures exactly: MV-03 master first/last/join 0.988 / 0.983 / 0.9917 vs the LOG's 0.987 / 0.981 / 0.991.
- **The map's shipped-join figures (0.952 / 0.970 / 0.975) are RGB-plane SSIM.** Comparing PNGs without `format=yuv420p` makes ffmpeg score gbrp planes. The same pair then reads 0.945 RGB vs 0.988 yuv. `check` reports both, as `join` and `joinRgb`.
- **Every shipped loop, and every Kling master, has a wrap that is worse than every natural step** (join percentile 0). The masters' lossless joins are 0.9917 / 0.9956 / 0.9974 against medians of 0.997–0.9999. The difference is mainly a grain "pop" (the ×8 wrap-diff lights up the whole sky and grass), plus a tiny velocity reversal at the pinned frame (optical flow in the crest, dy +0.03 → −0.02 px/frame).
- **Registration of Kling pinned clips drops fast.** MV-03 vs the plate goes 0.988 at frame 0, 0.923 at frame 15, and about 0.90 for most of the clip. So the `blend` seam's frame 0 (src[24]) is 0.911 vs the plate, a visible crest-shape change under the 600 ms poster→video fade. `--rotate=auto` recovers only 0.946 (a mid-dissolve frame). `residual` keeps 0.988.

## 3. Encode findings (0-credit experiments on the MV-03 and campfire intermediates)

| Experiment | Bytes | Join | Min step (where) | Median |
|---|---|---|---|---|
| x264 CRF 22, GOP 48 (map recipe) | 2.46 MB | 0.9895 | 0.9918 (keyframe @47) | 0.9973 |
| + `ipratio=1.0` / `-tune grain` / CRF 20 | 2.36 / 2.60 / 3.33 MB | 0.989 / 0.989 / 0.991 | ~0.991–0.993 (keyframes) | 0.997 |
| + `mbtree=0` | 4.71 MB | 0.9924 | 0.9939 | 0.9972 |
| **+ rate zone on the last 12 frames, b=2** | 2.69 MB | **0.9917** | 0.9918 | 0.9973 |
| VP9 CRF 32, GOP 48 | 1.21 MB | 0.9862 | 0.9872 (keyframe) | 0.9977 |
| **VP9 CRF 32, one keyframe per loop** | **1.06 MB** | **0.9969** (percentile 0.34) | 0.9916 | 0.9976 |
| campfire x264 CRF 25, GOP 48 + zone | 0.85 MB | 0.9942 | 0.9957 (keyframe) | 0.9996 |
| **campfire x264 CRF 25, one GOP + zone** | **0.44 MB** | 0.9952 | 0.9988 | 0.9996 |

**Adopted defaults:**
- **One keyframe per loop for both codecs.** A loop always restarts on its IDR, so 2 s GOPs only add a texture pulse at every keyframe and cost bytes. In VP9 they also make the wrap pop. `--gop-mp4=48` restores the map recipe.
- **x264 tail boost.** Rate zones ramp the last 0.75 s up to b=2, which lifts the mb-tree-starved tail to keyframe-step quality.
- **What's left in MP4 is codec-limited.** The H.264 wrap is still a small IDR texture refresh (join 0.990–0.998). No x264 setting tried removed it: ipratio, tune grain, no-mbtree, bframes 0, IDR down-weighting and larger zones all failed. The slit-scans show no seam. MediaFrame should serve the WebM first (map flag 1).
- **VP9 on near-black gradients.** At CRF 26–32 the candle halo in last-light shows contour banding at 6× gain; CRF 20 removes it (77 KB). Use CRF 26 for the campfire and 30 for the sea.

## 4. The 0-credit re-seams (staged, not registered)

- **Inputs:** the **Kling originals**, downloaded (0 cr) to `media-src/p3/masters/` (gitignored), rather than the shipped CRF 24 re-encodes: `MV-03_764ca916.mp4` (9.9 MB), `MV-03-alt2_f5130107.mp4`, `MV-11L_d4086e11.mp4`, `MV-11L-alt_8d687e50.mp4`, `MV-09_154f82ce.mp4`, `MV-09-alt_634151ff.mp4`.
- **Method:** `--method=residual`, one keyframe per loop, tail boost 2, tier S, 1920×1080.
- **K and CRFs:**

| Loop | K | CRF MP4 / WebM |
|---|---|---|
| sea | 24 | 24 / 30 |
| campfire | 12 | 23 / 26 |
| last-light | 12 | 23 / 20 |

- **Output:** 192 frames, 8.00 s, silent.
- **Staged in** `docs/build/media-staged/p3/accepted/reseam/`: `<public name>.mp4`, `.webm`, `-poster.webp`, plus `<public name>.json`. Each record holds before/after checks, the seamCheck, the blend runner-up, the manifest changes and the verdict.

Join SSIM is yuv at 960×540. "pct" is the share of natural steps that are ≤ the join; 0 means the wrap is worse than every step.

| File (MediaId) | Master join (lossless) | Re-seam join (lossless) | MP4 join before → after | WebM join before → after (pct) | RGB MP4 join before → after | First vs plate after | MP4 / WebM MB before → after |
|---|---|---|---|---|---|---|---|
| hero-sea-loop (MV-03) | 0.9917 (pct 0) | **0.9972 (pct 0.47)** | 0.9879 → 0.9905 | 0.9891 (0.01) → **0.9976 (0.52)** | 0.948 → 0.964 | 0.984 | 2.24 / 1.34 → 2.09 / 1.28 |
| hero-sea-loop-alt2 (MV-03-alt) | 0.9958 (0) | **0.9994 (0.20)** | 0.9948 → 0.9956 | 0.9936 (0) → **0.9997 (0.05)** | 0.973 → 0.981 | 0.987 | 0.66 / 0.35 → 0.64 / 0.24 |
| campfire-loop (MV-11L) | 0.9956 (0) | **0.9990 (0.03)** | 0.9948 → 0.9959 | 0.9941 (0) → **0.9992 (0.01)** | 0.960 → 0.980 | 0.991 | 0.54 / 0.24 → 0.59 / 0.22 |
| campfire-loop-alt (MV-11L-alt) | 0.9957 (0) | **0.9991 (0.45)** | 0.9950 → 0.9962 | 0.9943 (0) → **0.9993 (0.35)** | 0.961 → 0.982 | 0.991 | 0.60 / 0.26 → 0.66 / 0.25 |
| last-light-loop (MV-09) | 0.9974 (0) | **0.9998 (0.12)** | 0.9972 → 0.9982 | 0.9978 (0) → **1.0000 (0.28)** | 0.958 → 0.982 | 0.996 | 0.38 / 0.05 → 0.46 / 0.08 |
| last-light-loop-alt (MV-09-alt) | 0.9975 (0) | **0.9999 (0.44)** | 0.9973 → 0.9985 | 0.9977 (0) → **1.0000 (0.73)** | 0.961 → 0.984 | 0.996 | 0.31 / 0.05 → 0.39 / 0.08 |

Every other check passes on all 12 files:
- **Registration:** 0.982–0.996 at both ends, phase shift ≤ 0.07 px.
- **Smoothness:** consecutive min ≥ 0.9921.
- **Static zones:** 0.01–0.65/255 (sea left 45% + top 15%; campfire left 55%; last-light left 65% + top 15%).
- **Flashes and red:** 0 flashes per second (whole frame and tiles); red share ≤ 7e-5.
- **Light zones:** glow ptp 1.1–6.2% with 0–0.13 reversals/s (lantern / fire-lit ground / flame halo).
- **Audio:** 0 streams.
- **MP4 `pass.join`:** `"codec"` on 5 of 6 (the IDR refresh), `true` on last-light-alt.

**Visual check.** Slit-scans across the wrap (±12 frames, 6 loops × {shipped MP4, new MP4, new WebM}) show a clear vertical seam at the wrap in **every shipped MP4** and **none** in the re-seamed MP4s or WebMs. The wrap strips (frames 190, 191 | 0, 1) are continuous: crest shape, embers and flame are unchanged. At 150% the residual-ramped tail frames were compared with the master's frames and are indistinguishable. L2 content is unchanged: the same Kling frames, with no new element.

**Runner-up: the `blend` method with `--rotate=auto`,** kept in scratch and recorded in each JSON. Its lossless joins are good too (percentile 0.01–0.88), but:
- frame 0 is a blend (MV-03 registration 0.945 even rotated, 0.911 unrotated);
- the loops are 7.04 s / 7.54 s;
- the dissolve lowers the smoothness floor (last-light min step 0.998 vs 0.9993).

`residual` matched or beat it on every loop.

**For the assembler (do not do these here):**
- Copy the 18 media files over `public/media/films/`, same names.
- In `lib/media.ts`, set `durationS: 8.04 → 8.0` for MV-03, MV-03-alt, MV-11L, MV-11L-alt, MV-09 and MV-09-alt.
- Update the provenance notes (text proposed in each JSON `manifestChanges`).
- The posters are frame 0 = the pinned plate frame. The code keeps MV-01 / MV-11 / MV-08 as the posters.

## 5. Guidance for the loop batches

- **Seam.** Use `seam <master> <out> --k=12|24 --tier=S|I --method=residual` for every Kling start = end loop whose raw master join is ≥ 0.98 (run `check` on the master first). Fall back to `--method=blend --rotate=auto --plate=<still>` if the master's end drifts from its start (join < 0.98) or if the pinned frame shows a visible bounce.
- **Boomerang** only for L07, L11 and L21 (oscillating motion).
- **Check both encodes.** Run `check` on the `.mp4` and the `.webm` with `--plate`, the map's static rects (`--static`) and `--light` on flames or glows. Read `pass.join === "codec"` on MP4 as OK when the seam summary's `seamCheck.pass.join` is `true`.
- **CRFs.** For tier I the MP4 default is CRF 26. Grainy sea/rain at 720p shows the biggest IDR refresh (join ≈ 0.986 vs median 0.997): prefer the WebM there. On near-black plates, drop the WebM CRF to 20–26 and inspect the halos at 5–6× gain.
- **Joins.** Look at the joins with `frames --wrap=2 --slit=<x through the moving element>,<y0>,<y1>`.

## 6. Flags

1. **MediaFrame still plays the MP4 only.** The WebMs carry the clean wraps (joins at an ordinary-step percentile), so serving `<source type="video/webm">` first matters more now.
2. **The loops are now 8.00 s (192 frames), not 8.04 s.** `durationS` must change with the file swap.
3. **The H.264 wrap is codec-limited** (an IDR texture refresh, 0.990–0.998), though better than before on all 6 files. Aryan to watch 3 joins in real time, as the LOG already asks for MV-03.
4. **Tool defaults differ from the map in two places**, both measured in §3: `seam` uses one GOP per loop (not 48) for both codecs, and the x264 tail boost.
5. **The MV-11L-alt light-zone numbers here** (fire-lit ground x .62–.95, y .66–.85: ptp 6.2%) use a different zone from Lane B's 16.6% "ground glow", so they are not comparable one-to-one.
