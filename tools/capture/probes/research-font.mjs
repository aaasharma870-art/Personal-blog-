// tools/capture/probes/research-font.mjs: research data stays Geist / Geist Mono (data-research).
// Owner: B1-TYPE (PHASE3-PLAN §4.7; PHASE3-SPEC §5.5 "Research guard", P3-4 #4).
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).
//
// Lights EVERY world (html[data-fonts] = all four tokens, as after a full
// scroll), waits for the faces, then walks every text node inside
// [data-research], .tnum / .tabular-nums, table, the research figures
// (figure[data-figure], figure[data-board]) and the experiment section, and
// reads the computed font-family of its element. At ≥ 64rem (the world-type
// gate) the first family must be Geist or Geist Mono (the house's next/font
// names, read from --font-geist-sans / --font-geist-mono). Below 64rem the
// page is the P3-0 page: the rule there is "no world face" (house serif
// allowed). Hidden text (display none / visibility hidden) is skipped.
// Other <figure>s (testimonials, lettered quotes: world prose by design)
// are listed under `otherFigures`, informational.
// Flags: --research-max=40 (offenders listed).

export default async function probe(page, ctx) {
  await ctx.goto();
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    document.documentElement.dataset.fonts = "pirates idiots rdr2 hp";
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await document.fonts.ready;
  });
  await ctx.sleep(600);
  const max = Number(ctx.args["research-max"] ?? 40);
  const r = await page.evaluate((max) => {
    const unq = (s) => s.trim().replace(/^["']|["']$/g, "");
    const first = (ff) => unq(ff.split(",")[0] ?? "");
    const root = getComputedStyle(document.documentElement);
    const listOf = (v) => root.getPropertyValue(v).split(",").map(unq).filter(Boolean);
    const geist = new Set([...listOf("--font-geist-sans"), ...listOf("--font-geist-mono")]);
    const newsreader = new Set(listOf("--font-newsreader"));
    const wide = matchMedia("(min-width: 64rem)").matches;
    const ok = (fam) => geist.has(fam) || (!wide && newsreader.has(fam));
    const pathOf = (el) => {
      const parts = [];
      for (let e = el; e && parts.length < 4; e = e.parentElement) {
        parts.unshift(e.tagName.toLowerCase() + (e.id ? `#${e.id}` : "") + (e.dataset?.research !== undefined ? "[data-research]" : ""));
        if (e.dataset?.section) break;
      }
      return parts.join(" > ");
    };
    const walk = (selector, out, seen) => {
      for (const host of document.querySelectorAll(selector)) {
        const tw = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          const text = n.textContent.trim();
          const el = n.parentElement;
          if (!text || !el || seen.has(el)) continue;
          seen.add(el);
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden" || el.closest("[hidden]")) continue;
          out.push({ el, text: text.slice(0, 60), family: cs.fontFamily, first: first(cs.fontFamily) });
        }
      }
    };
    const data = [];
    walk('[data-research], .tnum, .tabular-nums, table, figure[data-figure], figure[data-board], [data-world-section="experiment"]', data, new Set());
    const bad = data.filter((d) => !ok(d.first));
    const figures = [];
    const seenData = new Set(data.map((d) => d.el));
    walk("figure", figures, seenData);
    const families = {};
    for (const d of data) families[d.first] = (families[d.first] ?? 0) + 1;
    return {
      wide,
      house: [...geist],
      checked: data.length,
      islands: document.querySelectorAll("[data-research]").length,
      families,
      offenders: bad.length,
      bad: bad.slice(0, max).map((d) => ({ text: d.text, family: d.family.slice(0, 90), at: pathOf(d.el) })),
      otherFigures: [...new Set(figures.filter((d) => !geist.has(d.first)).map((d) => d.first))],
    };
  }, max);
  return { pass: r.checked > 0 && r.offenders === 0, vw: ctx.vw, ...r };
}
