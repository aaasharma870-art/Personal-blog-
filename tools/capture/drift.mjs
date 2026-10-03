// tools/capture/drift.mjs: P3-5 #3, the push-ins' registration (P3-11.0 TOOLS; PHASE3-SPEC §6.2, §13 P3-5 #3).
// Usage: node tools/capture/drift.mjs [baseUrl] --out=<dir> [--raw=<dir>] [--vw=1440x900] [--tiers=css,gl]
//          [--ps=.50,.54,.58,.62,.66] [--analyse-only]   (--analyse-only: re-run the analysis on <raw>'s shots)
// The bar: "All three push-ins scrub smoothly inside their star (b). Registration: the first frame vs plate
// SSIM ≥ .95; the ICE push keeps its overlays registered (≤ 2 px drift of the chalk FIG at 1440)."
//
// Page: /?skip=intro&debug=cards (+ &gl=force for the GL tier; headless SwiftShader is refused by the GL tier
// probe without it). The page is walked once so every card is live; each card is parked at p 0 (the tier
// switches only at a p end; on the GL tier the frame must carry data-gl="on", ≤ 40 s), then scrolled (instant)
// to an exact p from its pin geometry and held until the damped p (window.__cards[kind].t()) has settled on it.
//
//   registration  for each push card (opening #1, seam #2, ignite #3; the tintype's push toward the sun as an
//                 extra): the frame at p .497 (the settle, the plate's still) against the frame at p .503 (star
//                 (b) has begun: frame 0 of SEQ-HALL on the card canvas for #3, the code camera at ≈ scale 1 for
//                 #1 / #2). SSIM on the card frame's picture (the [data-act-card-frame] box inset 3 % at the sides,
//                 20 % at the top, clear of the film caption laid over its top edge, and 8 % at the bottom), after Wang's automatic downsampling (the
//                 standard SSIM; the full-resolution value is reported too). The verdict uses `ssimAligned`: the
//                 push frame warped back by its measured similarity transform (at p .503 the camera has already
//                 taken its first step, scale ≈ 1.002), so the bar measures registration, not the push itself.
//                 Bar: ≥ .95. The noise floor = the settle frame against itself 1 s later (what the living loop
//                 and the weather change alone); lumaDelta / contrastRatio tell a tone pop from a misregistration.
//   fig           the seam card (ICE push, 1 → 1.35 over star (b)) at p .50 … .66 (before the title mask opens at
//                 .68): each step shot twice, as is and with the frame's SVG / Meta overlays hidden (the plate
//                 alone); drift_cv.py measures the plate's own transform from the FIG-hidden pair and the FIG's
//                 residual shift after it (phase correlation of the FIG-only images), plus a DOM cross-check of
//                 the FIG paths' box. Bar: ≤ 2 px at 1440.
//   tiers         with --tiers=css,gl: the same p in both tiers, the GL frame's shift / scale against the css
//                 frame (the css tier is registered by construction: one DOM transform).
// Writes <out>/drift.json (+ a few JPG crops); the PNG screenshots go to <raw> (default <out>/raw; keep out of git).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
if (flags.help || !flags.out) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\nimport ")[0].replace(/^\/\/ ?/gm, ""));
  process.exit(flags.out ? 0 : 2);
}
const BASE = (argv.find((a) => !a.startsWith("--")) ?? "http://localhost:3161").replace(/\/+$/, "");
const vm = /^(\d+)x(\d+)$/.exec(flags.vw ?? "1440x900");
const VW = { width: Number(vm[1]), height: Number(vm[2]) };
const OUT = path.resolve(flags.out);
const RAW = path.resolve(flags.raw ?? path.join(OUT, "raw"));
const TIERS = (flags.tiers ?? "css,gl").split(",").filter(Boolean);
const FIG_PS = (flags.ps ?? ".50,.54,.58,.62,.66").split(",").map(Number);
const CARDS = ["opening", "seam", "tintype", "ignite"];
const SCALE = { opening: [1, 1.3], seam: [1, 1.35], tintype: [1, 1.04], ignite: [1, 1.06] };
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(RAW, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("/opt/node22/lib/node_modules/playwright"));
}
const sharp = require("sharp");
const browser = flags["analyse-only"]
  ? { close: async () => {} }
  : await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });

const HIDE_FIG = (kind) =>
  `[data-act-card="${kind}"] [data-act-card-frame] svg, [data-act-card="${kind}"] [data-act-card-frame] .type-meta { visibility: hidden !important; }`;

async function tierRun(tier) {
  const context = await browser.newContext({ viewport: VW, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 200)));
  const q = `/?skip=intro&debug=cards${tier === "gl" ? "&gl=force" : ""}`;
  await page.goto(BASE + q, { waitUntil: "load", timeout: 90000 });
  await page.waitForFunction(() => Object.keys(window.__cards ?? {}).length >= 4, null, { timeout: 20000, polling: 100 }).catch(() => {});
  await page.evaluate(async () => {
    const step = Math.round(innerHeight * 0.5);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 70));
    }
  });
  await sleep(800);
  /** Park at the card's p 0 (the tier switches only at a p end) and, on the GL tier, wait for data-gl="on". */
  const park = async (kind) => {
    await page.evaluate((k) => {
      const pin = document.querySelector(`[data-act-card-pin="${k}"]`);
      if (pin) window.scrollTo({ top: Math.round(pin.getBoundingClientRect().top + scrollY - innerHeight * 0.4), behavior: "instant" });
    }, kind);
    if (tier === "gl") {
      const on = await page
        .waitForFunction((k) => document.querySelector(`[data-act-card="${k}"] [data-act-card-frame]`)?.getAttribute("data-gl") === "on", kind, { timeout: 40000, polling: 100 })
        .then(() => true, () => false);
      if (!on) errors.push(`${kind}: GL never engaged at p 0 in 40 s`);
    } else await sleep(1000);
  };
  const at = async (kind, p) => {
    const y = await page.evaluate(
      ({ k, p }) => {
        const pin = document.querySelector(`[data-act-card-pin="${k}"]`);
        const st = pin?.querySelector(":scope > [data-card-stage]");
        if (!pin || !st) return null;
        const top = pin.getBoundingClientRect().top + scrollY;
        const y = Math.round(top + p * (pin.offsetHeight - st.offsetHeight));
        window.scrollTo({ top: y, behavior: "instant" });
        return y;
      },
      { k: kind, p },
    );
    await page.waitForFunction((k) => {
      const c = window.__cards?.[k];
      return c && Math.abs(c.t() - c.raw()) < 0.002;
    }, kind, { timeout: 8000, polling: 50 }).catch(() => {});
    await sleep(900); // raster + the loop / sequence frame
    return page.evaluate(
      ({ k, y }) => {
        const c = window.__cards?.[k];
        const fr = document.querySelector(`[data-act-card="${k}"] [data-act-card-frame]`);
        const r = fr?.getBoundingClientRect();
        return { y, raw: c ? +c.raw().toFixed(4) : null, t: c ? +c.t().toFixed(4) : null, tier: c ? c.tier() : null, gl: fr?.getAttribute("data-gl") ?? null, frame: r ? [r.x, r.y, r.width, r.height].map((v) => Math.round(v)) : null };
      },
      { k: kind, y },
    );
  };
  const shot = async (name) => {
    const f = path.join(RAW, `${VW.width}-${tier}-${name}.png`);
    await page.screenshot({ path: f });
    return f;
  };
  const figBox = () =>
    page.evaluate(() => {
      const fr = document.querySelector('[data-act-card="seam"] [data-act-card-frame]');
      if (!fr) return null;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of fr.querySelectorAll("svg path")) {
        if (p.closest("[data-board-art]")) continue;
        const svg = p.ownerSVGElement;
        if (!svg || getComputedStyle(svg).visibility === "hidden" || getComputedStyle(svg).display === "none") continue;
        // the FIG lives in the board's PlateBox, beside the board plate's media (≤ 3 levels up from its svg;
        // the title mask's svg reaches media only at the frame, further up)
        let box = svg.parentElement;
        let lvl = 0;
        while (box && box !== fr && !box.querySelector("img, video") && lvl < 3) {
          box = box.parentElement;
          lvl++;
        }
        if (!box || box === fr || !box.querySelector("img, video")) continue;
        const r = p.getBoundingClientRect();
        if (r.width < 2 && r.height < 2) continue;
        x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
      }
      return Number.isFinite(x0) ? [x0, y0, x1 - x0, y1 - y0].map((v) => Math.round(v * 10) / 10) : null;
    });

  const out = { tier, errors, reg: {}, fig: [] };
  for (const kind of CARDS) {
    await park(kind);
    await at(kind, 0.3);
    const s = await at(kind, 0.497);
    const a = await shot(`${kind}-p0497`);
    await sleep(1000);
    const floor = await shot(`${kind}-p0497-again`);
    const b0 = await at(kind, 0.503);
    const b = await shot(`${kind}-p0503`);
    out.reg[kind] = { settle: s, push: b0, a, b, floor };
    // leave through the pin's end (a switch only happens at a p end)
    await at(kind, 1);
  }
  await park("seam");
  for (const p of FIG_PS) {
    const st = await at("seam", p);
    const full = await shot(`seam-fig-${p}`);
    const dom = await figBox();
    const style = await page.addStyleTag({ content: HIDE_FIG("seam") });
    await sleep(250);
    const plate = await shot(`seam-plate-${p}`);
    await style.evaluate((n) => n.remove());
    await sleep(150);
    const [s0, s1] = SCALE.seam;
    const b = Math.max(0, Math.min(1, ((st.t ?? p) - 0.5) / 0.5));
    out.fig.push({ p, state: st, full, plate, dom, scale: s0 + (s1 - s0) * b });
  }
  await context.close();
  return out;
}

const RUNS_FILE = path.join(RAW, `drift-runs-${VW.width}.json`);
let runs = {};
if (flags["analyse-only"]) runs = JSON.parse(fs.readFileSync(RUNS_FILE, "utf8"));
else {
  for (const t of TIERS) {
    console.log(`drift: tier ${t} @${VW.width}x${VW.height}`);
    runs[t] = await tierRun(t);
  }
  fs.writeFileSync(RUNS_FILE, JSON.stringify(runs));
}
await browser.close();

/* — analysis (python3 + OpenCV) ————————————————————————————————————————————— */
const inset = (fr) => (fr ? [fr[0] + fr[2] * 0.03, fr[1] + fr[3] * 0.2, fr[2] * 0.94, fr[3] * 0.72].map((v) => Math.round(v)) : null);
const jobs = [];
for (const [t, r] of Object.entries(runs)) {
  for (const [kind, g] of Object.entries(r.reg)) jobs.push({ kind: "ssim", name: `reg:${t}:${kind}`, a: g.a, b: g.b, floor: g.floor, crop: inset(g.push.frame ?? g.settle.frame) });
  const fr = r.fig[0]?.state.frame;
  if (r.fig.length > 1 && fr) {
    jobs.push({
      kind: "fig",
      name: `fig:${t}`,
      crop: [Math.max(0, fr[0]), Math.max(0, fr[1]), Math.min(fr[2], VW.width), Math.min(fr[3], VW.height)],
      base: { full: r.fig[0].full, plate: r.fig[0].plate, dom: r.fig[0].dom },
      steps: r.fig.slice(1).map((s) => ({ p: s.p, full: s.full, plate: s.plate, dom: s.dom, scale: s.scale / r.fig[0].scale })),
    });
  }
}
if (runs.css && runs.gl) {
  jobs.push({
    kind: "tiers",
    name: "tiers:seam",
    crop: inset(runs.css.fig[0]?.state.frame),
    pairs: runs.css.fig.map((s, i) => ({ p: s.p, a: s.full, b: runs.gl.fig[i]?.full })).filter((x) => x.b),
  });
}
const jobFile = path.join(RAW, `drift-job-${VW.width}.json`);
fs.writeFileSync(jobFile, JSON.stringify({ jobs }));
const py = spawnSync("python3", [path.join(HERE, "drift_cv.py"), jobFile], { encoding: "utf8", maxBuffer: 1 << 26 });
let analysis = { results: [], error: null };
try {
  analysis = JSON.parse(py.stdout);
} catch {
  analysis.error = (py.stderr || "drift_cv.py gave no JSON").slice(0, 600);
}
const res = Object.fromEntries((analysis.results ?? []).map((r) => [r.name, r]));

// verdicts
const regRows = [];
for (const [t, r] of Object.entries(runs)) {
  for (const kind of CARDS) {
    const g = r.reg[kind];
    const v = res[`reg:${t}:${kind}`];
    regRows.push({ tier: t, card: kind, pushIn: kind === "tintype" ? "(sun push, extra)" : `#${{ opening: 1, seam: 2, ignite: 3 }[kind]}`, ssim: v?.ssim ?? null, ssimFull: v?.ssimFull ?? null, floor: v?.floor ?? null, floorFull: v?.floorFull ?? null, downsample: v?.downsample ?? null, lumaDelta: v?.lumaDelta ?? null, contrastRatio: v?.contrastRatio ?? null, shiftPx: v?.shiftPx ?? null, scale: v?.scale ?? null, ssimAligned: v?.ssimAligned ?? null, ssimToneMatched: v?.ssimToneMatched ?? null, pass: (v?.ssimAligned ?? v?.ssim) != null ? (v.ssimAligned ?? v.ssim) >= 0.95 : null, settle: { p: g.settle.t, gl: g.settle.gl, tier: g.settle.tier }, push: { p: g.push.t, gl: g.push.gl, tier: g.push.tier } });
  }
}
const figRows = Object.entries(runs).map(([t]) => {
  const v = res[`fig:${t}`];
  return { tier: t, maxDriftPx: v?.maxDriftPx ?? null, maxDomDriftPx: v?.maxDomDriftPx ?? null, pass: v?.maxDriftPx != null ? v.maxDriftPx <= 2 : null, steps: v?.steps ?? [], basePixels: v?.basePixels ?? null, error: v?.error ?? null };
});
const report = {
  meta: { tool: "tools/capture/drift.mjs", base: BASE, viewport: `${VW.width}x${VW.height}`, tiers: TIERS, date: new Date().toISOString(), bar: { ssim: 0.95, figDriftPx: 2 }, analysisError: analysis.error },
  registration: regRows,
  fig: figRows,
  tiers: res["tiers:seam"] ?? null,
  pass: regRows.filter((r) => r.card !== "tintype").every((r) => r.pass !== false) && figRows.every((r) => r.pass !== false),
  errors: Object.fromEntries(Object.entries(runs).map(([t, r]) => [t, r.errors])),
};
fs.writeFileSync(path.join(OUT, `drift-${VW.width}.json`), JSON.stringify(report, null, 1));

// a small JPG pair per card (settle | push), so the numbers can be seen
for (const [t, r] of Object.entries(runs)) {
  for (const kind of ["opening", "seam", "ignite"]) {
    const g = r.reg[kind];
    const crop = inset(g.push.frame ?? g.settle.frame);
    if (!crop) continue;
    const [x, y, w, h] = crop;
    const tw = 640;
    const th = Math.round((h / w) * tw);
    const A = await sharp(g.a).extract({ left: x, top: y, width: Math.min(w, VW.width - x), height: Math.min(h, VW.height - y) }).resize(tw, th, { fit: "fill" }).toBuffer();
    const B = await sharp(g.b).extract({ left: x, top: y, width: Math.min(w, VW.width - x), height: Math.min(h, VW.height - y) }).resize(tw, th, { fit: "fill" }).toBuffer();
    await sharp({ create: { width: tw * 2 + 8, height: th, channels: 3, background: "#000" } })
      .composite([{ input: A, left: 0, top: 0 }, { input: B, left: tw + 8, top: 0 }])
      .jpeg({ quality: 70, mozjpeg: true })
      .toFile(path.join(OUT, `reg-${VW.width}-${t}-${kind}.jpg`));
  }
}
for (const r of regRows) console.log(`  registration ${r.tier} ${r.card} ${r.pushIn}: SSIM aligned ${r.ssimAligned} (raw ${r.ssim}, full-res ${r.ssimFull}; noise floor ${r.floor}; luma Δ ${r.lumaDelta}, contrast ×${r.contrastRatio}, shift ${r.shiftPx} scale ${r.scale}; aligned ${r.ssimAligned}, tone-matched ${r.ssimToneMatched}) ${r.pass === null ? "" : r.pass ? "PASS" : "FAIL"} (p ${r.settle.p} → ${r.push.p}, gl ${r.push.gl ?? "-"})`);
for (const f of figRows) console.log(`  FIG drift ${f.tier}: max ${f.maxDriftPx} px (DOM ${f.maxDomDriftPx} px) ${f.pass === null ? f.error ?? "" : f.pass ? "PASS" : "FAIL"}`);
if (report.tiers) console.log(`  tiers (gl vs css, seam): ${report.tiers.pairs.map((x) => `p${x.p} ssim ${x.ssim} shift ${x.shiftPx ?? "?"} scale ${x.scale ?? "?"}`).join(" · ")}`);
if (analysis.error) console.log(`  analysis error: ${analysis.error}`);
console.log(`drift: ${report.pass ? "PASS" : "FAIL"} → ${path.join(OUT, `drift-${VW.width}.json`)}`);
process.exit(0);
