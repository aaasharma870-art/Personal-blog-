// tools/capture/hooks.mjs: the four act cards' hook frames (P3-6 #3: "each card's p .05 frame is a picture,
// judged 3/3 in P3-11"; P3-11.0 TOOLS, PHASE3-PLAN §11.2 "the card hook frames (p .05) at both widths").
// Usage: node tools/capture/hooks.mjs [baseUrl] --out=<dir> [--raw=<dir>] [--vw=1440x900] [--tiers=css,gl]
//          [--ps=.05] [--quality=80]
// Page: /?skip=intro,smooth&debug=cards (+ &gl=force for the GL tier, which a laptop GPU runs; headless
// SwiftShader needs the force). The page is walked once so every card is live; each card is scrolled
// (instant) to p from its pin geometry and held until the damped p has settled (window.__cards[kind]).
// Writes the FULL VIEWPORT (what a visitor sees at that scroll position) as
//   <out>/<width>-<tier>/<kind>-p<p>.jpg   (≤ 1600 px wide, JPEG q80; a judge copy)
//   <raw>/<width>-<tier>-<kind>-p<p>.png   (lossless; keep out of git)
// and <out>/hooks-<width>.json (p_raw / damped p / tier / data-gl per frame). For strangers, anonymize a
// folder with: node tools/capture/anon.mjs <out>/<width>-<tier> <dir> --mode=frames --prefix=H --key=<file>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

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
const PS = (flags.ps ?? ".05").split(",").map(Number);
const QUALITY = Number(flags.quality ?? 80);
const CARDS = ["opening", "seam", "tintype", "ignite"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(RAW, { recursive: true });

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("/opt/node22/lib/node_modules/playwright"));
}
const sharp = require("sharp");
const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
const rows = [];
for (const tier of TIERS) {
  const context = await browser.newContext({ viewport: VW, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 200)));
  await page.goto(`${BASE}/?skip=intro&debug=cards${tier === "gl" ? "&gl=force" : ""}`, { waitUntil: "load", timeout: 90000 });
  await page.waitForFunction(() => Object.keys(window.__cards ?? {}).length >= 4, null, { timeout: 20000, polling: 100 }).catch(() => {});
  await page.evaluate(async () => {
    const step = Math.round(innerHeight * 0.5);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 70));
    }
  });
  await sleep(800);
  const dir = path.join(OUT, `${VW.width}-${tier}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const kind of CARDS) {
    for (const p of PS) {
      // come from above (the way a reader arrives), then settle at p
      await page.evaluate(
        ({ k, p }) => {
          const pin = document.querySelector(`[data-act-card-pin="${k}"]`);
          const st = pin?.querySelector(":scope > [data-card-stage]");
          if (!pin || !st) return;
          const top = pin.getBoundingClientRect().top + scrollY;
          window.scrollTo({ top: Math.round(top - innerHeight * 0.3), behavior: "instant" });
        },
        { k: kind, p },
      );
      // the tier switches only at a p end: on the GL tier wait (≤ 40 s) for the frame's data-gl="on" at p 0
      if (tier === "gl") {
        const on = await page
          .waitForFunction((k) => document.querySelector(`[data-act-card="${k}"] [data-act-card-frame]`)?.getAttribute("data-gl") === "on", kind, { timeout: 40000, polling: 100 })
          .then(() => true, () => false);
        if (!on) errors.push(`${kind}: GL never engaged at p 0 in 40 s`);
      } else await sleep(500);
      await page.evaluate(
        ({ k, p }) => {
          const pin = document.querySelector(`[data-act-card-pin="${k}"]`);
          const st = pin?.querySelector(":scope > [data-card-stage]");
          if (!pin || !st) return;
          const top = pin.getBoundingClientRect().top + scrollY;
          window.scrollTo({ top: Math.round(top + p * (pin.offsetHeight - st.offsetHeight)), behavior: "instant" });
        },
        { k: kind, p },
      );
      await page.waitForFunction((k) => {
        const c = window.__cards?.[k];
        return c && Math.abs(c.t() - c.raw()) < 0.002;
      }, kind, { timeout: 4000, polling: 50 }).catch(() => {});
      await sleep(1200);
      const st = await page.evaluate((k) => {
        const c = window.__cards?.[k];
        const fr = document.querySelector(`[data-act-card="${k}"] [data-act-card-frame]`);
        return { raw: c ? +c.raw().toFixed(4) : null, t: c ? +c.t().toFixed(4) : null, tier: c ? c.tier() : null, gl: fr?.getAttribute("data-gl") ?? null, phase: document.querySelector(`[data-act-card="${k}"]`)?.getAttribute("data-card-phase") ?? null, y: Math.round(scrollY) };
      }, kind);
      const name = `${kind}-p${String(p).replace(/^0?\./, "")}`;
      const png = path.join(RAW, `${VW.width}-${tier}-${name}.png`);
      await page.screenshot({ path: png });
      const jpg = path.join(dir, `${name}.jpg`);
      await sharp(png).resize({ width: Math.min(1600, VW.width) }).jpeg({ quality: QUALITY, mozjpeg: true }).toFile(jpg);
      rows.push({ width: VW.width, tier, card: kind, p, ...st, jpg: path.relative(process.cwd(), jpg) });
      console.log(`  ${VW.width} ${tier} ${kind} p${p}: damped ${st.t} (raw ${st.raw}) tier ${st.tier} gl ${st.gl ?? "-"}`);
    }
  }
  if (errors.length) console.log(`  page errors (${tier}): ${errors.join(" | ")}`);
  await context.close();
}
await browser.close();
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, `hooks-${VW.width}.json`), JSON.stringify({ meta: { tool: "tools/capture/hooks.mjs", base: BASE, viewport: `${VW.width}x${VW.height}`, date: new Date().toISOString() }, rows }, null, 1));
console.log(`hooks: ${rows.length} frame(s) → ${OUT}`);
