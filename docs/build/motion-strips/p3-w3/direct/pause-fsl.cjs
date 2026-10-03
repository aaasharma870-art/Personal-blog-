// Direct check: which layout read inside the Pause click handler forces the 120-160 ms style+layout.
// Wraps the layout-reading APIs during one Pause click and records every call that takes > 4 ms, with its stack.
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || 900);
const BASE = process.argv[4] || "http://localhost:3161";
const SEL = process.argv[5] || "header [data-motion-toggle]";
const AT = process.argv[6] || "work";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(BASE + "/?skip=intro", { waitUntil: "load" });
  await p.waitForFunction(() => !!window.__lenis, null, { timeout: 15000 }).catch(() => {});
  await sleep(3000);
  await p.evaluate((at) => window.__lenis?.scrollTo(at === "top" ? 0 : document.getElementById(at).getBoundingClientRect().top + scrollY, { immediate: true, force: true }), AT);
  await sleep(2500);
  const r = await p.evaluate((SEL) => {
    const slow = [];
    const wrap = (proto, name, kind) => {
      const d = Object.getOwnPropertyDescriptor(proto, name);
      if (!d) return () => {};
      const orig = kind === "get" ? d.get : d.value;
      const timed = function (...a) {
        const t = performance.now();
        const v = orig.apply(this, a);
        const ms = performance.now() - t;
        if (ms > 4) slow.push({ api: name, ms: Math.round(ms), on: this && this.tagName ? this.tagName + (this.id ? "#" + this.id : "") : String(this).slice(0, 20), stack: new Error().stack.split("\n").slice(2, 9).map((s) => s.trim().replace(/https?:\/\/[^/]+\/_next\/static\/chunks\//, "")) });
        return v;
      };
      Object.defineProperty(proto, name, kind === "get" ? { ...d, get: timed } : { ...d, value: timed });
      return () => Object.defineProperty(proto, name, d);
    };
    const undo = [
      wrap(Element.prototype, "getBoundingClientRect", "value"),
      wrap(Element.prototype, "getClientRects", "value"),
      wrap(HTMLElement.prototype, "offsetHeight", "get"),
      wrap(HTMLElement.prototype, "offsetWidth", "get"),
      wrap(HTMLElement.prototype, "offsetTop", "get"),
      wrap(HTMLElement.prototype, "offsetLeft", "get"),
      wrap(Element.prototype, "scrollHeight", "get"),
      wrap(Element.prototype, "clientHeight", "get"),
      wrap(Element.prototype, "clientWidth", "get"),
      wrap(Element.prototype, "scrollTop", "get"),
      wrap(window, "getComputedStyle", "value"),
      wrap(window, "scrollY", "get"),
      wrap(window, "pageYOffset", "get"),
      wrap(window, "innerHeight", "get"),
      wrap(window, "innerWidth", "get"),
      wrap(window, "scrollTo", "value"),
      wrap(window, "scroll", "value"),
      wrap(CSSStyleDeclaration.prototype, "getPropertyValue", "value"),
      wrap(HTMLElement.prototype, "focus", "value"),
      wrap(HTMLElement.prototype, "innerText", "get"),
      wrap(Element.prototype, "checkVisibility", "value"),
      wrap(Element.prototype, "getAnimations", "value"),
      wrap(Document.prototype, "getAnimations", "value"),
      wrap(Element.prototype, "animate", "value"),
      wrap(HTMLMediaElement.prototype, "pause", "value"),
      wrap(Element.prototype, "setAttribute", "value"),
      wrap(Element.prototype, "removeAttribute", "value"),
      wrap(Element.prototype, "scrollIntoView", "value"),
    ];
    const t0 = performance.now();
    document.querySelector(SEL).click();
    const total = performance.now() - t0;
    undo.forEach((u) => u());
    return { total: Math.round(total), slow };
  }, SEL);
  console.log(W, SEL, "click at", AT, r.total, "ms; slow layout reads:");
  for (const s of r.slow) console.log(JSON.stringify(s));
  await b.close();
})();
