// tools/capture/probes/bundle.mjs: gsap + lenis stay out of the "/" first load; first-load growth (P3-2 #9, #10).
// Owner: B1-SCROLL (PHASE3-PLAN §4.7).
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).
//
// Checks:
//  firstLoad.markers  the scripts the "/" HTML references (+ every JS/CSS a 390x844 touch phone fetches until
//                     `load` + 4 s) contain no gsap / ScrollTrigger / lenis code (markers below), and a phone never
//                     fetches them at all
//  desktop.lazy       on ctx.vw ≥ 1024 (not --rm): nothing with a marker is fetched before `load`, and the lazy
//                     chunks DO arrive afterwards (the ladder / prefetch: proves the markers are found when present)
//  compare            with --compare=<baseUrl> (e.g. the pre-Phase-3 build on :3162): the HTML-referenced JS and
//                     CSS of "/" grow ≤ 6 KB gz each (--budget=6144 to change)
//  static.ric         no raw requestIdleCallback in app/, components/, lib/ outside lib/idle.ts (and the
//                     vanilla intro controller, which cannot import it)
// Sizes are gzip -9 of the served bytes (measured here, not trusted from headers).
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const MARKERS = {
  gsap: /gsapVersions|GreenSock/,
  scrollTrigger: /pin-spacer/,
  lenis: /lenisVersion|lenis-smooth/,
};
const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
const markersIn = (text) => Object.entries(MARKERS).filter(([, re]) => re.test(text)).map(([k]) => k);

/** Every script / stylesheet the document's HTML itself references. */
async function htmlAssets(request, base, pathName) {
  const res = await request.get(base + pathName);
  const html = await res.text();
  const urls = new Set();
  for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) urls.add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    const tag = m[0];
    const href = /\bhref="([^"]+)"/.exec(tag)?.[1];
    if (!href) continue;
    if (/rel="stylesheet"/.test(tag) || /rel="(?:modulepreload|preload)"[^>]*as="(?:script|style)"|as="(?:script|style)"[^>]*rel="(?:modulepreload|preload)"/.test(tag)) urls.add(href);
  }
  const out = { js: [], css: [] };
  for (const u of urls) {
    const abs = new URL(u.replace(/&amp;/g, "&"), base + "/").href;
    const r = await request.get(abs);
    if (!r.ok()) continue;
    const body = await r.body();
    const kind = /\.css(\?|$)/.test(abs) || (r.headers()["content-type"] ?? "").includes("css") ? "css" : "js";
    out[kind].push({ url: abs.replace(base, ""), raw: body.length, gz: gz(body), markers: kind === "js" ? markersIn(body.toString("utf8")) : [] });
  }
  const sum = (a) => a.reduce((n, x) => n + x.gz, 0);
  return { ...out, jsGz: sum(out.js), cssGz: sum(out.css) };
}

/** JS / CSS responses of a page until `load` (+ `extraMs`), with their markers. */
async function fetched(page, url, extraMs) {
  const seen = [];
  let loaded = false;
  page.on("response", async (r) => {
    const t = r.request().resourceType();
    if (t !== "script" && t !== "stylesheet") return;
    const afterLoad = loaded;
    try {
      const body = await r.body();
      seen.push({ url: r.url(), type: t, gz: gz(body), afterLoad, markers: t === "script" ? markersIn(body.toString("utf8")) : [] });
    } catch {
      /* a redirected / aborted response has no body */
    }
  });
  await page.goto(url, { waitUntil: "load", timeout: 90000 });
  loaded = true;
  await new Promise((r) => setTimeout(r, extraMs));
  return seen;
}

function scanRic() {
  const hits = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== "node_modules" && !e.name.startsWith(".")) walk(p);
      } else if (/\.(tsx?|jsx?|mjs)$/.test(e.name)) {
        const rel = path.relative(ROOT, p).split(path.sep).join("/");
        // lib/idle.ts is the wrapper; components/intro/controller.js is the
        // vanilla pre-hydration controller (served from public/intro, it
        // cannot import lib/idle.ts): its one `afterLoad` mirrors the same
        // chain (rIC → setTimeout), pre-Phase-3 code, an accepted exemption
        if (rel === "lib/idle.ts" || rel === "components/intro/controller.js") continue;
        fs.readFileSync(p, "utf8")
          .split("\n")
          .forEach((line, i) => {
            const code = line.replace(/\/\/.*$/, "");
            if (/^\s*(\*|\/\*)/.test(line)) return;
            if (/\brequestIdleCallback\b/.test(code)) hits.push(`${rel}:${i + 1}`);
          });
      }
    }
  };
  for (const d of ["app", "components", "lib"]) if (fs.existsSync(path.join(ROOT, d))) walk(path.join(ROOT, d));
  return hits;
}

export default async function probe(page, ctx) {
  const checks = {};
  const set = (name, pass, detail = {}) => {
    checks[name] = { pass: pass === null ? null : Boolean(pass), ...detail };
  };
  const budget = Number(ctx.args.budget ?? 6144);
  const home = "/";

  // the HTML-referenced first load of "/"
  const head = await htmlAssets(page.request, ctx.base, home);
  const htmlMarked = [...head.js].filter((a) => a.markers.length);

  // a phone: nothing desktop-only is ever fetched
  const phone = await ctx.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const phoneSeen = await fetched(phone, ctx.url("/?skip=intro"), 4000);
  const phoneMarked = phoneSeen.filter((s) => s.markers.length);
  set("firstLoad.markers", htmlMarked.length === 0 && phoneMarked.length === 0, {
    html: { js: head.js.length, css: head.css.length, jsGz: head.jsGz, cssGz: head.cssGz, marked: htmlMarked.map((a) => `${a.url} [${a.markers}]`) },
    phone: { fetched: phoneSeen.length, marked: phoneMarked.map((s) => `${s.url} [${s.markers}]`) },
  });

  // desktop: lazy, after load
  if (ctx.vw.width >= 1024 && !ctx.rm) {
    const seen = await fetched(page, ctx.url("/?skip=intro"), 12000);
    const before = seen.filter((s) => !s.afterLoad && s.markers.length);
    const after = new Set(seen.filter((s) => s.afterLoad).flatMap((s) => s.markers));
    set("desktop.lazy", before.length === 0 && after.has("gsap") && after.has("lenis"), {
      beforeLoad: before.map((s) => `${s.url} [${s.markers}]`),
      lazyMarkers: [...after],
      lazyGz: seen.filter((s) => s.afterLoad && s.markers.length).reduce((n, s) => n + s.gz, 0),
    });
  } else set("desktop.lazy", null, { skipped: "not a DESKTOP_FINE run" });

  // growth vs a base build
  if (ctx.args.compare) {
    const baseUrl = String(ctx.args.compare).replace(/\/+$/, "");
    const base = await htmlAssets(page.request, baseUrl, home);
    const dJs = head.jsGz - base.jsGz;
    const dCss = head.cssGz - base.cssGz;
    set("compare", dJs <= budget && dCss <= budget, { base: baseUrl, jsGz: [base.jsGz, head.jsGz], cssGz: [base.cssGz, head.cssGz], deltaJsGz: dJs, deltaCssGz: dCss, budget });
  } else set("compare", null, { skipped: "pass --compare=<baseUrl> (the pre-Phase-3 build)" });

  const ric = scanRic();
  set("static.ric", ric.length === 0, { hits: ric });

  const failed = Object.entries(checks).filter(([, v]) => v.pass === false).map(([k]) => k);
  return { pass: failed.length === 0, failed, checks };
}
