#!/usr/bin/env python3
"""Image analysis for tools/capture/drift.mjs (P3-5 #3: push-in registration + the ICE push's FIG drift).

Usage: python3 tools/capture/drift_cv.py <job.json>   (prints the result JSON on stdout)

Jobs (all paths are PNG screenshots at device scale 1, so 1 image px = 1 CSS px):
  {"kind": "ssim", "name": ..., "a": png, "b": png, "crop": [x, y, w, h] | null, "floor": png | null}
      SSIM (Wang et al. 2004: Gaussian 11x11, sigma 1.5, on luma, after Wang's automatic downsampling F =
      round(min(h, w) / 256); `ssimFull` without it) between two frames: the last settle frame before star (b)
      and the first frame of the push (frame 0 of a sequence, or the code push at scale 1). `floor` = the same
      settle frame shot again 1 s later: what the living loop and the weather alone change (the noise floor).
      To tell a tone pop from a misregistration: lumaDelta (mean luma b - a), contrastRatio (luma std b / a),
      shiftPx / scale (ORB similarity a -> b), ssimAligned (b warped back by that transform) and
      ssimToneMatched (then matched to a's per-channel mean / std).
  {"kind": "fig", "name": ..., "crop": [x, y, w, h], "base": {"full": png, "plate": png, "dom": [x, y, w, h] | null},
   "steps": [{"p": .., "full": png, "plate": png, "dom": [x, y, w, h] | null, "scale": expected camera scale ratio}]}
      The plate's own motion from the FIG-hidden frames (ORB + RANSAC similarity, estimateAffinePartial2D),
      then the FIG's residual shift after that motion: the FIG-only image at p (|full - plate|) against the base
      FIG-only image warped by the plate's transform, by phase correlation (sub-pixel; strokes that appear later
      add content but the shared strokes set the peak). drift_px = |residual|. A DOM cross-check maps the base
      FIG box through the same transform and compares it with the FIG box at p (max corner error).
  {"kind": "tiers", "name": ..., "crop": [...], "pairs": [{"p": .., "a": png (css tier), "b": png (gl tier)}]}
      The GL tier against the css tier at the same p: the similarity transform between the two frames (ORB),
      reported as the shift of the crop centre and the scale ratio, plus SSIM.
"""
import json
import sys

import cv2
import numpy as np


def load(p, crop=None):
    im = cv2.imread(p, cv2.IMREAD_COLOR)
    if im is None:
        raise FileNotFoundError(p)
    if crop:
        x, y, w, h = [int(round(v)) for v in crop]
        im = im[max(0, y):y + h, max(0, x):x + w]
    return im


def luma(im):
    return cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float64)


def ssim(a, b):
    a, b = luma(a), luma(b)
    if a.shape != b.shape:
        b = cv2.resize(b, (a.shape[1], a.shape[0]))
    c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    g = lambda x: cv2.GaussianBlur(x, (11, 11), 1.5)
    ma, mb = g(a), g(b)
    va, vb, cov = g(a * a) - ma * ma, g(b * b) - mb * mb, g(a * b) - ma * mb
    m = ((2 * ma * mb + c1) * (2 * cov + c2)) / ((ma * ma + mb * mb + c1) * (va + vb + c2))
    return float(m[5:-5, 5:-5].mean())


def ssim_wang(a, b):
    """SSIM after Wang's automatic downsampling (ssim_index.m): F = max(1, round(min(h, w) / 256)), an F x F box
    filter, then every F-th pixel: SSIM at the scale a viewer judges, not the encoder's grain."""
    h, w = a.shape[:2]
    f = max(1, int(round(min(h, w) / 256)))
    if f > 1:
        a = cv2.blur(a, (f, f))[::f, ::f]
        b = cv2.blur(b, (f, f))[::f, ::f]
    return ssim(a, b), f


def similarity(a, b, mask=None):
    """Similarity transform (2x3) mapping points of a onto b, from ORB matches + RANSAC; None on failure."""
    orb = cv2.ORB_create(nfeatures=4000, fastThreshold=7)
    ga, gb = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    ka, da = orb.detectAndCompute(ga, mask)
    kb, db = orb.detectAndCompute(gb, mask)
    if da is None or db is None or len(ka) < 8 or len(kb) < 8:
        return None, 0
    m = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(da, db)
    if len(m) < 8:
        return None, len(m)
    pa = np.float32([ka[x.queryIdx].pt for x in m])
    pb = np.float32([kb[x.trainIdx].pt for x in m])
    T, inl = cv2.estimateAffinePartial2D(pa, pb, method=cv2.RANSAC, ransacReprojThreshold=2.0, maxIters=5000, confidence=0.999)
    return T, int(inl.sum()) if inl is not None else 0


def apply(T, pts):
    pts = np.asarray(pts, dtype=np.float64)
    return pts @ T[:, :2].T + T[:, 2]


def fig_job(j):
    crop = j["crop"]
    x0, y0 = crop[0], crop[1]
    bf, bp = load(j["base"]["full"], crop), load(j["base"]["plate"], crop)
    diff0 = np.abs(luma(bf) - luma(bp))
    fig0 = np.where(diff0 > 14, diff0, 0)
    out = {"name": j["name"], "kind": "fig", "basePixels": int((fig0 > 0).sum()), "steps": []}
    dom0 = j["base"].get("dom")
    for s in j["steps"]:
        f, p = load(s["full"], crop), load(s["plate"], crop)
        T, inl = similarity(bp, p)
        row = {"p": s["p"], "inliers": inl}
        if T is None:
            row["error"] = "no plate transform"
            out["steps"].append(row)
            continue
        sc = float(np.sqrt(abs(np.linalg.det(T[:, :2]))))
        row["plateScale"] = round(sc, 5)
        if s.get("scale"):
            row["expectedScale"] = round(s["scale"], 5)
        diff = np.abs(luma(f) - luma(p))
        figp = np.where(diff > 14, diff, 0)
        warped = cv2.warpAffine(fig0.astype(np.float32), T.astype(np.float32), (figp.shape[1], figp.shape[0]), flags=cv2.INTER_LINEAR)
        row["figPixels"] = int((figp > 0).sum())
        if (warped > 0).sum() < 50 or row["figPixels"] < 50:
            row["error"] = "too few FIG pixels to correlate"
        else:
            win = cv2.createHanningWindow((figp.shape[1], figp.shape[0]), cv2.CV_32F)
            (dx, dy), resp = cv2.phaseCorrelate(warped, figp.astype(np.float32), win)
            row["residual"] = [round(float(dx), 2), round(float(dy), 2)]
            row["driftPx"] = round(float(np.hypot(dx, dy)), 2)
            row["peak"] = round(float(resp), 3)
        if dom0 and s.get("dom"):
            bx, by, bw, bh = dom0
            corners = [[bx - x0, by - y0], [bx + bw - x0, by - y0], [bx - x0, by + bh - y0], [bx + bw - x0, by + bh - y0]]
            pred = apply(T, corners)
            sx, sy, sw, sh = s["dom"]
            act = np.array([[sx - x0, sy - y0], [sx + sw - x0, sy - y0], [sx - x0, sy + sh - y0], [sx + sw - x0, sy + sh - y0]])
            row["domDriftPx"] = round(float(np.max(np.hypot(*(pred - act).T))), 2)
        out["steps"].append(row)
    d = [r["driftPx"] for r in out["steps"] if "driftPx" in r]
    dd = [r["domDriftPx"] for r in out["steps"] if "domDriftPx" in r]
    out["maxDriftPx"] = max(d) if d else None
    out["maxDomDriftPx"] = max(dd) if dd else None
    return out


def tiers_job(j):
    crop = j.get("crop")
    out = {"name": j["name"], "kind": "tiers", "pairs": []}
    for pr in j["pairs"]:
        a, b = load(pr["a"], crop), load(pr["b"], crop)
        T, inl = similarity(a, b)
        row = {"p": pr["p"], "ssim": round(ssim(a, b), 4), "inliers": inl}
        if T is not None:
            c = np.array([[a.shape[1] / 2, a.shape[0] / 2]])
            sh = apply(T, c)[0] - c[0]
            row["shiftPx"] = [round(float(sh[0]), 2), round(float(sh[1]), 2)]
            row["scale"] = round(float(np.sqrt(abs(np.linalg.det(T[:, :2])))), 5)
        out["pairs"].append(row)
    return out


def main():
    job = json.load(open(sys.argv[1]))
    res = []
    for j in job["jobs"]:
        try:
            if j["kind"] == "ssim":
                a, b = load(j["a"], j.get("crop")), load(j["b"], j.get("crop"))
                sw, f = ssim_wang(a, b)
                row = {"name": j["name"], "kind": "ssim", "ssim": round(sw, 4), "downsample": f, "ssimFull": round(ssim(a, b), 4)}
                # tone vs geometry: the mean luma change and the similarity transform between the pair
                row["lumaDelta"] = round(float(luma(b).mean() - luma(a).mean()), 2)
                row["contrastRatio"] = round(float(luma(b).std() / max(1e-6, luma(a).std())), 4)
                T, inl = similarity(a, b)
                if T is not None:
                    c = np.array([[a.shape[1] / 2, a.shape[0] / 2]])
                    sh = apply(T, c)[0] - c[0]
                    row["shiftPx"] = [round(float(sh[0]), 2), round(float(sh[1]), 2)]
                    row["scale"] = round(float(np.sqrt(abs(np.linalg.det(T[:, :2])))), 5)
                    row["inliers"] = inl
                    # SSIM once the measured geometry is undone: what is left is tone / content
                    Ti = cv2.invertAffineTransform(T)
                    bw = cv2.warpAffine(b, Ti, (a.shape[1], a.shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
                    row["ssimAligned"] = round(ssim_wang(a, bw)[0], 4)
                    # and once the tone is matched too (mean / std of luma per channel): what is left is content
                    am, asd = a.reshape(-1, 3).mean(0), a.reshape(-1, 3).std(0)
                    bm, bsd = bw.reshape(-1, 3).mean(0), bw.reshape(-1, 3).std(0)
                    bt = np.clip((bw.astype(np.float64) - bm) / np.maximum(bsd, 1e-6) * asd + am, 0, 255).astype(np.uint8)
                    row["ssimToneMatched"] = round(ssim_wang(a, bt)[0], 4)
                if j.get("floor"):
                    fa = load(j["floor"], j.get("crop"))
                    row["floor"] = round(ssim_wang(a, fa)[0], 4)
                    row["floorFull"] = round(ssim(a, fa), 4)
                res.append(row)
            elif j["kind"] == "fig":
                res.append(fig_job(j))
            elif j["kind"] == "tiers":
                res.append(tiers_job(j))
        except Exception as e:  # report, never crash the whole job
            res.append({"name": j.get("name"), "kind": j.get("kind"), "error": str(e)})
    json.dump({"results": res}, sys.stdout)


if __name__ == "__main__":
    main()
