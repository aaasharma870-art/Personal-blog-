// tools/capture/probes/cards.mjs: the four pinned act cards (P3-6 #1–#3 #6–#10, P3-7 #1 #4, P3-5 #3).
// Owner: W2-CARDS (PHASE3-PLAN §4.7, §6.1). Run by tools/capture/p3-probes.mjs:
// `export default async function probe(page, ctx)` (page = a fresh, not yet navigated page; ctx.goto()
// opens ctx.path; see the runner's header). Uses `?debug=cards` (card-p3.tsx: window.__cards[kind] =
// { raw(), t(), tier() }) and the window CustomEvents of lib/events.ts.
//
// Checks (each { pass, … }; the probe passes when every check that ran does):
//  pins      the four [data-act-card-pin] wrappers travel film.cardTravel (90/110/90/110 vh, ±2 px) above a
//            sticky 100svh stage; the opening's program (#act-1-program, a stage-backdrop) is the wrapper's next
//            sibling inside #act-1 (P3-6 #1: p spans the wrapper, not the program).
//  stars     every star marker on a pin spacer ([data-card-beat][data-beat-star]) spans ≥ 300 px (P3-6 #2).
//  scrub     each card, scrolled (instant) to p .05 .22 .45 .50 .75 .90 1: the damped p settles on p_raw (≤ .005)
//            within 1.2 s; the lower bar's phase follows (a / b / m / e); the subtitle is shown during (b)
//            only; frame screenshots <dir>/<card>-p<p>.png (the p .05 frame is the HOOK, P3-6 #3).
//  damping   a 0 → .45 instant scroll: the damped p trails p_raw at +60 ms and reaches it by +1.2 s (P3-6 #2).
//  impacts   exactly one `impact` per world over a full top → bottom scroll (P3-6 #7); one `transition:meet`
//            per card.
//  landAt    /#act-n on load lands each card at film.acts[].landAt of its travel (±.02; P3-6 #3, B1-SCROLL's
//            hash path); reported with the measured p.
//  rm        reduced motion: no pin travel (wrapper = stage), no phase, no impact (P3-6 #7: 0 under RM).
//  phone     390×844 touch: no pin travel; the subtitle is screen-reader only (1 px); no card chunk handle.
// Flags: --cards-skip=pins,stars,scrub,damping,impacts,landAt,rm,phone   --cards-landat=.47 (the expected landAt: lib/film.ts acts[].landAt, W2-CARDS handoff)

const TRAVEL = { opening: 90, seam: 110, tintype: 90, ignite: 110 };
const PS = [0.05, 0.22, 0.45, 0.5, 0.75, 0.9, 1];
const phaseOf = (v) => (v >= 0.92 ? "e" : v >= 0.68 ? "m" : v >= 0.5 ? "b" : "a");

export default async function probe(page, ctx) {
  const SKIP = new Set(String(ctx.args["cards-skip"] ?? "").split(",").filter(Boolean));
  const LAND = Number(ctx.args["cards-landat"] ?? 0.47);
  const checks = {};
  const set = (name, pass, detail = {}) => (checks[name] = { pass: Boolean(pass), ...detail });
  const want = (n) => !SKIP.has(n);
  const sleep = ctx.sleep;
  const desktop = ctx.vw.width >= 1024 && !ctx.rm;

  /** Geometry of every pin (page px). */
  const geometry = (p) =>
    p.evaluate(() =>
      [...document.querySelectorAll("[data-act-card-pin]")].map((pin) => {
        const sec = pin.closest("[data-act-card]");
        const stage = pin.querySelector(":scope > [data-card-stage]");
        const r = pin.getBoundingClientRect();
        const next = pin.nextElementSibling;
        return {
          kind: pin.getAttribute("data-act-card-pin"),
          id: sec?.id ?? null,
          top: Math.round(r.top + scrollY),
          h: Math.round(pin.offsetHeight),
          stageH: stage ? Math.round(stage.offsetHeight) : null,
          sticky: stage ? getComputedStyle(stage).position === "sticky" : false,
          vh: innerHeight,
          nextId: next?.id ?? null,
          nextBackdrop: next ? next.classList.contains("stage-backdrop") : false,
          markers: [...pin.querySelectorAll("[data-card-beat]")].map((m) => ({
            id: m.getAttribute("data-beat"),
            star: m.hasAttribute("data-beat-star"),
            h: Math.round(m.getBoundingClientRect().height),
          })),
        };
      }),
    );

  if (desktop) {
    await page.addInitScript(() => {
      window.__cardEvents = [];
      for (const k of ["impact", "transition:meet"]) window.addEventListener(k, (e) => window.__cardEvents.push({ k, d: e.detail, y: Math.round(scrollY) }));
    });
    await ctx.goto("/?skip=intro,smooth&debug=cards");
    await sleep(1500);
    const geo = await geometry(page);

    if (want("pins")) {
      const rows = geo.map((g) => {
        const travel = g.stageH === null ? null : g.h - g.stageH;
        const wantPx = ((TRAVEL[g.kind] ?? 0) * g.vh) / 100;
        return { ...g, markers: undefined, travel, wantPx: Math.round(wantPx), ok: g.sticky && travel !== null && Math.abs(travel - wantPx) <= 2 };
      });
      const opening = geo.find((g) => g.kind === "opening");
      set("pins", rows.length === 4 && rows.every((r) => r.ok) && opening?.nextId === "act-1-program" && opening?.nextBackdrop, {
        rows,
        program: opening ? { nextId: opening.nextId, backdrop: opening.nextBackdrop } : null,
      });
    }
    if (want("stars")) {
      const stars = geo.flatMap((g) => g.markers.filter((m) => m.star).map((m) => ({ card: g.kind, ...m })));
      set("stars", stars.length === 8 && stars.every((s) => s.h >= 300), { stars });
    }

    // walk the page once so every card has cleared the viewport (cards go live only then)
    if (want("scrub") || want("damping") || want("impacts")) {
      await page.evaluate(async () => {
        const step = Math.round(innerHeight * 0.5);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 70));
        }
      });
      await sleep(600);
    }
    if (want("impacts")) {
      const ev = await page.evaluate(() => window.__cardEvents.slice());
      const impacts = ev.filter((e) => e.k === "impact").map((e) => e.d.world);
      const meets = ev.filter((e) => e.k === "transition:meet").map((e) => e.d.card);
      const per = (w) => impacts.filter((x) => x === w).length;
      set("impacts", impacts.length === 4 && ["pirates", "idiots", "rdr2", "hp"].every((w) => per(w) === 1), { impacts, meets });
    }

    // W2 measure fix: read the pin's LIVE top (the walk above mounts lazy sections, so the page above a
    // card moves by −155…+287 px after `geo` was taken and the old target landed off p).
    const at = async (g, v) => {
      await page.evaluate(({ k, v }) => {
        const pin = document.querySelector(`[data-act-card-pin="${k}"]`);
        const stage = pin?.querySelector(":scope > [data-card-stage]");
        if (!pin || !stage) return;
        const top = pin.getBoundingClientRect().top + scrollY;
        window.scrollTo({ top: Math.round(top + v * (pin.offsetHeight - stage.offsetHeight)), behavior: "instant" });
      }, { k: g.kind, v });
    };
    const state = (kind) =>
      page.evaluate((k) => {
        const c = window.__cards?.[k];
        const sec = document.querySelector(`[data-act-card="${k}"]`);
        const sub = sec?.querySelector(".act-card-subtitle");
        return {
          raw: c ? +c.raw().toFixed(4) : null,
          t: c ? +c.t().toFixed(4) : null,
          tier: c ? c.tier() : null,
          live: sec?.hasAttribute("data-live") ?? false,
          phase: sec?.getAttribute("data-card-phase") ?? null,
          subtitle: sub ? +getComputedStyle(sub).opacity : null,
          gl: sec?.querySelector("[data-act-card-frame]")?.getAttribute("data-gl") ?? null,
        };
      }, kind);

    if (want("damping")) {
      const g = geo.find((x) => x.kind === "seam") ?? geo[0];
      await at(g, 0);
      await sleep(900);
      await at(g, 0.45);
      await sleep(60);
      const early = await state(g.kind);
      await sleep(1200);
      const late = await state(g.kind);
      set("damping", early.t !== null && early.t < early.raw - 0.02 && Math.abs(late.t - late.raw) <= 0.005, { card: g.kind, early, late });
    }

    if (want("scrub")) {
      const rows = [];
      for (const g of geo) {
        for (const v of PS) {
          await at(g, v);
          await sleep(1200);
          const s = await state(g.kind);
          const b = await page.locator(`[data-act-card="${g.kind}"] [data-act-card-frame]`).first().boundingBox().catch(() => null);
          if (b) await page.screenshot({ path: ctx.file(`${g.kind}-p${v}.png`), clip: b }).catch(() => {});
          const settled = s.t !== null && Math.abs(s.t - s.raw) <= 0.005;
          const phaseOk = !s.live || s.phase === phaseOf(s.t ?? v);
          const subOk = !s.live || s.subtitle === null || (s.phase === "b" || s.phase === "m" ? s.subtitle > 0.9 : s.subtitle < 0.1);
          rows.push({ card: g.kind, p: v, ...s, settled, phaseOk, subOk });
        }
      }
      set("scrub", rows.every((r) => r.live && r.settled && r.phaseOk && r.subOk), { rows });
    }

    if (want("landAt")) {
      const rows = [];
      for (const g of geo) {
        if (!g.id) continue;
        const p = await ctx.newPage({ viewport: ctx.vw });
        await p.goto(ctx.url(`/?skip=intro,smooth#${g.id}`), { waitUntil: "load" });
        await sleep(2500);
        const m = await p.evaluate((id) => {
          const pin = document.querySelector(`#${id} > [data-act-card-pin]`);
          const stage = pin?.querySelector(":scope > [data-card-stage]");
          if (!pin || !stage) return null;
          const top = pin.getBoundingClientRect().top + scrollY;
          const travel = pin.offsetHeight - stage.offsetHeight;
          return { p: +((scrollY - top) / travel).toFixed(3), travel };
        }, g.id);
        rows.push({ card: g.kind, id: g.id, ...(m ?? {}), ok: m !== null && Math.abs(m.p - LAND) <= 0.02 });
      }
      set("landAt", rows.every((r) => r.ok), { expected: LAND, rows });
    }
  }

  if (want("rm")) {
    const p = await ctx.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    await p.addInitScript(() => {
      window.__impacts = 0;
      window.addEventListener("impact", () => window.__impacts++);
    });
    await p.goto(ctx.url("/?skip=intro,smooth"), { waitUntil: "load" });
    await p.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await sleep(500);
    const g = await geometry(p);
    const phases = await p.evaluate(() => document.querySelectorAll("[data-card-phase]").length);
    const impacts = await p.evaluate(() => window.__impacts);
    set("rm", g.every((x) => x.h === x.stageH && !x.sticky) && phases === 0 && impacts === 0, {
      pins: g.map((x) => ({ kind: x.kind, h: x.h, stageH: x.stageH, sticky: x.sticky })),
      phases,
      impacts,
    });
  }

  if (want("phone")) {
    const p = await ctx.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    await p.goto(ctx.url("/?skip=intro&debug=cards"), { waitUntil: "load" });
    await sleep(1500);
    const g = await geometry(p);
    const sub = await p.evaluate(() => [...document.querySelectorAll(".act-card-subtitle")].map((s) => Math.round(s.getBoundingClientRect().width)));
    const handle = await p.evaluate(() => Object.keys(window.__cards ?? {}).length);
    set("phone", g.every((x) => x.h === x.stageH && !x.sticky) && sub.every((w) => w <= 1) && handle === 0, {
      pins: g.map((x) => ({ kind: x.kind, h: x.h, stageH: x.stageH })),
      subtitles: sub,
      handle,
    });
  }

  const ran = Object.values(checks);
  return { pass: ran.length > 0 && ran.every((c) => c.pass), checks };
}
