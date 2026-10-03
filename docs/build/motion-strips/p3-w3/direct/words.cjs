// Direct check (P3-7): the words probe's "identical" by BEAT (not by index), when the fly zones exist,
// and which primitives played / went static in a slow full scroll of the home page.
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || 900);
const URL = "http://localhost:3161/?skip=intro&debug=words,spotlight";
const snap = () => [...document.querySelectorAll("[data-words]")].map((el) => ({ kind: el.getAttribute("data-words"), beat: el.getAttribute("data-beat"), html: el.outerHTML }));
(async () => {
  const b = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
  const nojs = await (await b.newContext({ viewport: { width: W, height: H }, javaScriptEnabled: false })).newPage();
  await nojs.goto(URL, { waitUntil: "load" });
  const ssr = await nojs.evaluate(snap);
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(URL, { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const early = await p.evaluate(snap);
  const r = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const flySeen = {};
    const step = Math.round(innerHeight * 0.3);
    let n = 0;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await sleep(++n % 3 === 0 ? 1000 : 160);
      for (const z of document.querySelectorAll('[data-words="fly"]')) flySeen[z.getAttribute("data-beat")] ??= Math.round(scrollY);
    }
    await sleep(2500);
    return { flySeen, log: window.__words?.log ?? [], spot: (window.__spotlight?.log ?? []).filter((e) => /B12|B29|B45|B23/.test(e.id)) };
  });
  await p.waitForTimeout(1800);
  const after = await p.evaluate(snap);
  const key = (e, i, arr) => `${e.kind}:${e.beat}#${arr.slice(0, i).filter((x) => x.kind === e.kind && x.beat === e.beat).length}`;
  const map = (arr) => new Map(arr.map((e, i) => [key(e, i, arr), e]));
  const S = map(ssr), A = map(after), E = map(early);
  console.log(W, "counts ssr/early/after:", ssr.length, early.length, after.length);
  console.log(W, "only in SSR:", [...S.keys()].filter((k) => !A.has(k)), "only after:", [...A.keys()].filter((k) => !S.has(k)));
  for (const [k, e] of S) {
    const a = A.get(k);
    if (!a) continue;
    if (a.html === e.html) { console.log("  same   ", k); continue; }
    let at = 0; while (at < e.html.length && e.html[at] === a.html[at]) at++;
    console.log("  DIFFER ", k, "| ssr:", JSON.stringify(e.html.slice(Math.max(0, at - 40), at + 80)), "| after:", JSON.stringify(a.html.slice(Math.max(0, at - 40), at + 80)));
  }
  console.log(W, "fly zones seen (beat → scrollY when first in DOM):", JSON.stringify(r.flySeen));
  console.log(W, "words log play/static:", JSON.stringify(r.log.filter((e) => e.ev === "play" || e.ev === "static").map((e) => `${e.ev}:${e.id}${e.why ? "(" + e.why + ")" : ""}`)));
  console.log(W, "spotlight B12/B23/B29/B45:", JSON.stringify(r.spot.map((e) => `${e.ev}:${e.id}${e.why ? "(" + e.why + ")" : ""}`)));
  await b.close();
})();
