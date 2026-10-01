// tools/capture/probes/split.mjs: split mode: the stage window beside the research grids.
// Owner: B1-STAGE (PHASE3-PLAN §4.7; spec §3.2 split, §13 P3-2 #4).
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`.
//
// At 1440×900 and 1024×768 (`--widths=` overrides), on `/?skip=intro,smooth`, for every
// `[data-stage-split]` (trading-algos, optuna-screener, beyond):
//   - grid:     the split is a CSS grid under the boot gate (from first paint: read before
//               the stage mounts) with the window on its declared side;
//   - overflow: no horizontal overflow (the section's and the document's scrollWidth ≤
//               clientWidth), including the wide ICE board;
//   - sticky:   scrolled into the split's middle, the window's top sits at the header's
//               height and it fills the rest of the viewport (`self-start` sticky);
//   - never empty: at the split's start, middle and end the window shows a decoded image
//               (its SSR poster, or the stage's layer once it marked the window live);
//   - stack:    `.split-stack` grids inside the column (one track below 40rem of column:
//               expected stacked at 1024, two columns at 1440; reported, not failed);
//   - beats:    the window's data-beat (B19 on trading-algos) and the host's rack beat.
// pass = grid, overflow, sticky and never-empty hold for every split at every width.

function readSplits() {
  return [...document.querySelectorAll("[data-stage-split]")].map((el) => {
    const win = el.querySelector(":scope > .stage-window");
    const text = el.querySelector(":scope > .stage-split-text");
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const wr = win?.getBoundingClientRect();
    return {
      id: el.getAttribute("data-stage-split"),
      side: el.getAttribute("data-side"),
      display: cs.display,
      columns: cs.gridTemplateColumns,
      top: r.top + scrollY,
      bottom: r.bottom + scrollY,
      windowLeft: wr ? Math.round(wr.left) : null,
      textLeft: text ? Math.round(text.getBoundingClientRect().left) : null,
      beat: win?.getAttribute("data-beat") ?? null,
      rack: win?.querySelector("[data-stage-window-host]")?.getAttribute("data-beat") ?? null,
      stacks: [...el.querySelectorAll(".split-stack")].map((g) => getComputedStyle(g).gridTemplateColumns.split(" ").length),
    };
  });
}

function readWindow(id) {
  const win = document.querySelector(`[data-stage-window="${id}"]`);
  if (!win) return null;
  const r = win.getBoundingClientRect();
  const header = document.querySelector("body header")?.getBoundingClientRect().bottom ?? 0;
  const poster = win.querySelector(".stage-window-poster");
  const posterShown = Boolean(poster && poster.complete && poster.naturalWidth > 0 && Number(getComputedStyle(poster).opacity) > 0.5);
  const layerImg = [...win.querySelectorAll(".stage-layer img")].find(
    (img) => img.complete && img.naturalWidth > 0 && Number(getComputedStyle(img.closest(".stage-layer")).opacity) > 0.5,
  );
  const sec = win.closest("section, footer") ?? document.documentElement;
  return {
    top: Math.round(r.top),
    height: Math.round(r.height),
    header: Math.round(header),
    vh: innerHeight,
    on: win.hasAttribute("data-stage-on"),
    posterShown,
    layerShown: Boolean(layerImg),
    overflow: sec.scrollWidth - sec.clientWidth,
    docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

async function runWidth(page, ctx, vw) {
  await page.setViewportSize(vw);
  await ctx.goto("/?skip=intro,smooth");
  const splits = await page.evaluate(readSplits); // before the stage can mount: first paint
  const out = [];
  for (const s of splits) {
    const checks = { grid: s.display === "grid", side: s.side === "left" ? s.windowLeft < s.textLeft : s.windowLeft > s.textLeft };
    const samples = [];
    const h = s.bottom - s.top;
    for (const [name, y] of [
      ["start", s.top - vw.height * 0.3],
      ["middle", s.top + h / 2 - vw.height / 2],
      ["end", s.bottom - vw.height * 0.9],
    ]) {
      await page.evaluate((top) => window.scrollTo(0, Math.max(0, top)), Math.round(y));
      await page.waitForTimeout(900);
      // give a lazy poster its fetch + decode
      await page
        .waitForFunction(
          (id) => {
            const w = document.querySelector(`[data-stage-window="${id}"]`);
            const imgs = [...(w?.querySelectorAll("img") ?? [])];
            return imgs.some((i) => i.complete && i.naturalWidth > 0);
          },
          s.id,
          { timeout: 4000 },
        )
        .catch(() => null);
      samples.push({ at: name, ...(await page.evaluate(readWindow, s.id)) });
    }
    const mid = samples.find((x) => x.at === "middle");
    checks.sticky = Boolean(mid && Math.abs(mid.top - mid.header) <= 2 && Math.abs(mid.top + mid.height - mid.vh) <= 2);
    checks.neverEmpty = samples.every((x) => x && (x.posterShown || x.layerShown));
    checks.noOverflow = samples.every((x) => x && x.overflow <= 0 && x.docOverflow <= 0);
    out.push({ ...s, checks, samples, ok: Object.values(checks).every(Boolean) });
  }
  return out;
}

export default async function probe(page, ctx) {
  const widths = (ctx.args.widths ?? "1440x900,1024x768").split(",").map((w) => {
    const [width, height] = w.split("x").map(Number);
    return { width, height };
  });
  const result = {};
  let ok = true;
  let count = 0;
  for (const vw of widths) {
    const r = await runWidth(page, ctx, vw);
    result[`${vw.width}x${vw.height}`] = r;
    count += r.length;
    if (r.some((s) => !s.ok)) ok = false;
  }
  return {
    pass: ok && count > 0,
    note: count ? undefined : "no [data-stage-split] on the page (no split StageSpec, or the boot gate is off)",
    widths: result,
  };
}
