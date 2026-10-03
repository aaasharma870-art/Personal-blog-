// Direct check (W3 gate, P3-2 #9): WHAT runs in the long animation frames after quiet-end.
// Needs a build with productionBrowserSourceMaps (its .next dir as argv[4]). Loads /?skip=intro at W×H with
// the probe runner's flags (SwiftShader GL), records a V8 CPU profile from load to quiet-end + 4 s while
// wheel-scrolling like the loaf probe (100 px every 110 ms), and lists every LoAF whose work is ≥ minWork ms
// with the source files (through the source maps) on the stack for its samples: self time per file, and
// inclusive time per file (a file counted once per sample).
// Usage: node loaf-attr.cjs <W> <H> <baseUrl> <nextDir> [runs] [minWork]   (INTRO=1: /?intro=1 + Play, the probe's flow)
const fs = require("fs"), path = require("path");
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const { SourceMapConsumer } = require("/home/user/Personal-blog-/node_modules/source-map-js");
const [W, H] = [Number(process.argv[2] || 1440), Number(process.argv[3] || 900)];
const BASE = process.argv[4] || "http://localhost:3163";
const NEXT = process.argv[5];
const RUNS = Number(process.argv[6] || 2);
const MIN = Number(process.argv[7] || 25);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const maps = new Map();
function mapper(url) {
  const m = /\/_next\/(static\/chunks\/[^?#]+\.js)/.exec(url || "");
  if (!m) return null;
  if (maps.has(m[1])) return maps.get(m[1]);
  let v = null;
  const file = path.join(NEXT, m[1]);
  // the map is named by the chunk's own sourceMappingURL comment (not always <chunk>.map)
  const ref = fs.existsSync(file) ? /\/\/# sourceMappingURL=(\S+)\s*$/.exec(fs.readFileSync(file, "utf8")) : null;
  const mapFile = ref ? path.join(path.dirname(file), ref[1]) : file + ".map";
  if (fs.existsSync(mapFile)) {
    const raw = JSON.parse(fs.readFileSync(mapFile, "utf8"));
    const sections = raw.sections ? raw.sections.map((s) => ({ off: s.offset, c: new SourceMapConsumer(s.map) })) : [{ off: { line: 0, column: 0 }, c: new SourceMapConsumer(raw) }];
    v = (line, col) => {
      // line/col 0-based (V8); sections by offset
      let sec = sections[0];
      for (const s of sections) if (s.off.line < line || (s.off.line === line && s.off.column <= col)) sec = s;
      const l = line - sec.off.line + 1;
      const c = l === 1 ? col - sec.off.column : col;
      const o = sec.c.originalPositionFor({ line: l, column: c });
      return o.source ? `${o.source.replace(/^.*?\/(components|lib|app|node_modules)\//, "$1/")}${o.name ? ":" + o.name : ""}` : null;
    };
  }
  maps.set(m[1], v);
  return v;
}
const fileOf = (frame) => {
  const f = mapper(frame.url);
  const full = f ? f(frame.lineNumber, frame.columnNumber) : null;
  return full ? full.split(":")[0] : frame.url ? `(${frame.url.split("/").pop()})` : `(${frame.functionName || "native"})`;
};

async function once(browser) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    window.__lo = [];
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          const scripts = [...(e.scripts || [])].reduce((n, s) => n + s.duration, 0);
          const sl = e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0;
          window.__lo.push({ t: e.startTime, end: e.startTime + e.duration, dur: Math.round(e.duration), work: Math.round(Math.min(e.duration, scripts + sl)), script: Math.round(scripts), sl: Math.round(sl), inv: [...(e.scripts || [])].map((s) => `${s.invoker}:${Math.round(s.duration)}`).join(" ") });
        }
      }).observe({ type: "long-animation-frame", buffered: true });
    } catch {}
    window.__probeMarker = function __probeMarker() {
      const t0 = performance.now();
      while (performance.now() - t0 < 8) {}
      return t0;
    };
  });
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
  await cdp.send("Profiler.start");
  if (process.env.INTRO) {
    // the loaf probe's default flow: the intro played, quiet-end after the titles
    await p.goto(`${BASE}/?intro=1`, { waitUntil: "load" });
    await p.click("#intro-play", { timeout: 15000 }).catch(() => {});
  } else await p.goto(`${BASE}/?skip=intro`, { waitUntil: "load" });
  await p.waitForFunction(() => performance.getEntriesByName("p3:quiet-end").length > 0, null, { timeout: 15000 }).catch(() => {});
  await p.mouse.move(W / 2, H / 2);
  const tEnd = Date.now() + 4000;
  while (Date.now() < tEnd) {
    await p.mouse.wheel(0, 100);
    await sleep(110);
  }
  const markAt = await p.evaluate(() => window.__probeMarker());
  const { profile } = await cdp.send("Profiler.stop");
  const info = await p.evaluate(() => ({ lo: window.__lo, marks: performance.getEntriesByType("mark").filter((m) => /p3:/.test(m.name)).map((m) => [m.name, Math.round(m.startTime)]) }));
  await ctx.close();

  // sample times (µs, profile clock) → performance.now() ms via the marker
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
  const times = [];
  let t = profile.startTime;
  for (let i = 0; i < profile.samples.length; i++) {
    t += profile.timeDeltas[i];
    times.push(t);
  }
  const mi = profile.samples.findIndex((id) => byId.get(id).callFrame.functionName === "__probeMarker");
  const offset = mi >= 0 ? times[mi] / 1000 - markAt : null;
  const qe = (info.marks.find((m) => m[0] === "p3:quiet-end") || [0, 0])[1];
  // the loaf probe's window: [quiet-end, +3 s] (frames before quiet-end are listed with `pre`)
  const long = info.lo.filter((l) => l.work >= MIN).map((l) => ({ ...l, pre: l.end < qe }));
  const out = [];
  for (const l of long) {
    const self = new Map(), incl = new Map(), fns = new Map();
    let n = 0;
    for (let i = 0; i < times.length; i++) {
      const ms = times[i] / 1000 - offset;
      if (ms < l.t || ms > l.end) continue;
      const dt = (profile.timeDeltas[i + 1] ?? 200) / 1000;
      const node = byId.get(profile.samples[i]);
      const fn = node.callFrame.functionName;
      if (fn === "(idle)" || fn === "(program)" || fn === "(garbage collector)") {
        self.set(fn, (self.get(fn) || 0) + dt);
        continue;
      }
      n += dt;
      const sf = fileOf(node.callFrame);
      self.set(sf, (self.get(sf) || 0) + dt);
      const seen = new Set();
      for (let id = node.id; id != null; id = parent.get(id)) {
        const f = fileOf(byId.get(id).callFrame);
        if (/^components\/|^lib\/|^app\//.test(f)) seen.add(f);
      }
      for (const f of seen) incl.set(f, (incl.get(f) || 0) + dt);
      // FN=1: inclusive time per app FUNCTION (file:name), once per sample
      if (process.env.FN) {
        const fseen = new Set();
        for (let id = node.id; id != null; id = parent.get(id)) {
          const cf = byId.get(id).callFrame;
          const mf = mapper(cf.url);
          const full = mf ? mf(cf.lineNumber, cf.columnNumber) : null;
          if (full && /^(components|lib|app)\//.test(full)) fseen.add(full);
        }
        for (const f of fseen) fns.set(f, (fns.get(f) || 0) + dt);
      }
    }
    const top = (m, k) => [...m].sort((a, b) => b[1] - a[1]).slice(0, k).map(([f, v]) => `${f} ${v.toFixed(1)}`);
    out.push({ t: Math.round(l.t), inWindow: !l.pre && l.t <= qe + 3000, dur: l.dur, work: l.work, script: l.script, styleLayout: l.sl, inv: l.inv, sampledMs: +n.toFixed(1), self: top(self, 8), app: top(incl, 10), ...(process.env.FN ? { fns: top(fns, 14) } : {}) });
  }
  return { marks: info.marks, offsetOk: offset !== null, long: out };
}

(async () => {
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
  for (let i = 0; i < RUNS; i++) {
    const r = await once(browser);
    console.log(`${W}x${H} run ${i + 1} marks ${JSON.stringify(r.marks)} offset ${r.offsetOk}`);
    for (const l of r.long) console.log("  ", JSON.stringify(l));
  }
  await browser.close();
})();
