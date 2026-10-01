// tools/capture/probes/gl.mjs: the contained WebGL layer — tiers, one context, p-end switches, loss, Pause (P3-6 #4 #5 #6 #11, P3-7 #1).
// Owner: W2-GL (PHASE3-PLAN §4.7, §6.2). Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).
// The runner's Chromium already has --use-angle=swiftshader --enable-unsafe-swiftshader, so `?gl=force` renders headless.
//
// Checks (each { pass, … }; the probe passes when every check that ran does):
//  lab          /lab/p3/gl?gl=force: every card config (window.__glLab.cards) engages — the frame gets data-gl="on" — at p 0;
//               a p sweep draws (window.__gl.draws grows) and saves <dir>/lab-<card>-p<p>.png for each flavour + the title;
//               exactly ONE context for the whole visit (__gl.contexts === 1); no compile while p moved (compiles[].moving);
//               every engage / settle (data-gl="on") / disengage logged at a p end (p ≤ 0 or ≥ 1) except the immediate
//               ones (disengage:now: loss / Pause; abort: p moved during the .2 s fade-in, before data-gl was set — reported,
//               not failed); no plate failed to load (plate:failed); texture bytes ≤ 25 MB.
//  loss         __gl.lose() → data-gl gone within 100 ms (live fallback); __gl.restore() → engaged again at p 0.
//  pause        the Pause control ([data-motion-toggle]) → data-gl gone ≤ 100 ms and no draws while paused; resume re-engages.
//  page.force   /?skip=intro&gl=force: each [data-act-card-frame] that engages (after W2-CARDS mounts GlGate) is scrubbed
//               through its pin (p ≈ .1/.3/.45/.8) with screenshots <dir>/page-<card>-p<p>.png; skipped while none engages.
//  page.default /?skip=intro: headless SwiftShader fails failIfMajorPerformanceCaveat → tier "css", no data-gl="on".
//  page.off     /?skip=intro&gl=off: no GL canvas, no data-gl="on".
//  rm           reduced motion: /lab/p3/gl?gl=force → tier "off", no canvas, 0 contexts.
//  phone        390x844 touch /?skip=intro: no GL host, no canvas, the GL chunk never loads (window.__gl undefined).
// Flags: --gl-skip=lab,loss,pause,page.force,page.default,page.off,rm,phone   --gl-wait=<ms> (default 40000, SwiftShader is slow)

export default async function probe(page, ctx) {
  const SKIP = new Set(String(ctx.args["gl-skip"] ?? "").split(",").filter(Boolean));
  const WAIT = Number(ctx.args["gl-wait"] ?? 40000);
  const checks = {};
  const set = (name, pass, detail = {}) => (checks[name] = { pass: Boolean(pass), ...detail });
  const want = (n) => !SKIP.has(n);
  const sleep = ctx.sleep;
  const engaged = (p, sel = "[data-act-card-frame]") =>
    p.waitForFunction((s) => !!document.querySelector(`${s}[data-gl="on"]`), sel, { timeout: WAIT, polling: 50 }).then(() => true, () => false);
  const gl = (p) => p.evaluate(() => {
    const g = window.__gl;
    return g ? { contexts: g.contexts, draws: g.draws, owner: g.owner, engaged: g.engaged, bytes: g.bytes, log: g.log.slice(), compiles: g.compiles.slice(), tier: window.__glTier ?? null } : { tier: window.__glTier ?? null };
  });
  const clip = async (p, sel, file) => {
    const b = await p.locator(sel).first().boundingBox().catch(() => null);
    if (b) await p.screenshot({ path: ctx.file(file), clip: b }).catch(() => {});
  };
  const desktop = ctx.vw.width >= 1024 && !ctx.rm;
  // a tier switch logged while 0 < p < 1 (engage = the fade starts, settle = data-gl="on", disengage = back to css)
  const midSwitches = (log) => (log ?? []).filter((e) => /^(engage|settle|disengage)$/.test(e.ev) && e.p > 0 && e.p < 1);
  const aborts = (log) => (log ?? []).filter((e) => e.ev === "abort");

  /* ------------------------------------------------------------------ lab */
  if (desktop && (want("lab") || want("loss") || want("pause"))) {
    await ctx.goto("/lab/p3/gl?gl=force");
    const has = await page.waitForFunction(() => !!window.__glLab, null, { timeout: 15000 }).then(() => true, () => false);
    if (!has) set("lab", false, { error: "no window.__glLab (the lab page did not hydrate)" });
    else {
      const cards = await page.evaluate(() => window.__glLab.cards);
      const per = {};
      if (want("lab")) {
        for (const id of cards) {
          await page.evaluate((id) => window.__glLab.card(id), id);
          const t0 = Date.now();
          const on = await engaged(page);
          const ms = Date.now() - t0;
          const d0 = (await gl(page)).draws ?? 0;
          const shots = [];
          for (const v of [0.05, 0.15, 0.22, 0.3, 0.45, 0.75, 0.9, 0.97]) {
            await page.evaluate((v) => window.__glLab.p(v), v);
            await sleep(300);
            if (on) {
              const f = `lab-${id}-p${v}.png`;
              await clip(page, "[data-act-card-frame]", f);
              shots.push(f);
            }
          }
          await page.evaluate(() => window.__glLab.p(1));
          await sleep(200);
          const s = await gl(page);
          per[id] = { engaged: on, engageMs: ms, draws: (s.draws ?? 0) - d0, shots };
        }
        const s = await gl(page);
        const switches = midSwitches(s.log);
        const moving = (s.compiles ?? []).filter((c) => c.moving);
        const failed = (s.log ?? []).filter((e) => e.ev === "plate:failed");
        set("lab", Object.values(per).every((r) => r.engaged && r.draws >= 6) && s.contexts === 1 && !switches.length && !moving.length && !failed.length && (s.bytes ?? 0) <= 25 * 2 ** 20, {
          per, contexts: s.contexts, bytes: s.bytes, midSwitches: switches, aborts: aborts(s.log), platesFailed: failed, compilesWhileMoving: moving, compiles: s.compiles,
        });
      }
      if (want("loss")) {
        await page.evaluate(() => { window.__glLab.card("seam"); });
        const on = await engaged(page);
        const r = on ? await page.evaluate(async () => {
          const f = document.querySelector("[data-act-card-frame]");
          const t = performance.now();
          window.__gl.lose();
          let ms = null;
          for (let i = 0; i < 40 && ms === null; i++) {
            if (f.dataset.gl !== "on") ms = performance.now() - t;
            else await new Promise((r) => setTimeout(r, 5));
          }
          return { gone: f.dataset.gl !== "on", ms };
        }) : null;
        await page.evaluate(() => window.__gl?.restore());
        await page.evaluate(() => window.__glLab.p(0));
        const back = on ? await engaged(page) : false;
        // the lose() call itself blocks in SwiftShader: the event-to-fallback time is what counts (≤ 100 ms after the event)
        set("loss", on && r?.gone && back, { engagedFirst: on, ...r, reEngaged: back, log: (await gl(page)).log?.slice(-6) });
      }
      if (want("pause")) {
        const on = await engaged(page);
        const btn = page.locator("[data-motion-toggle]").first();
        const r = on && (await btn.count()) ? await page.evaluate(async () => {
          const f = document.querySelector("[data-act-card-frame]");
          const b = document.querySelector("[data-motion-toggle]");
          const t = performance.now();
          b.click();
          let ms = null;
          for (let i = 0; i < 60 && ms === null; i++) {
            if (f.dataset.gl !== "on") ms = performance.now() - t;
            else await new Promise((r) => setTimeout(r, 5));
          }
          const d0 = window.__gl.draws;
          window.__glLab.p(0.3);
          await new Promise((r) => setTimeout(r, 300));
          return { ms, drawsWhilePaused: window.__gl.draws - d0, tier: window.__glTier };
        }) : null;
        if (r) {
          await page.evaluate(() => { document.querySelector("[data-motion-toggle]").click(); window.__glLab.p(0); });
        }
        const back = r ? await engaged(page) : false;
        set("pause", !!r && r.ms !== null && r.ms <= 100 && r.drawsWhilePaused === 0 && r.tier === "off" && back, { engagedFirst: on, ...r, resumed: back });
      }
    }
  }

  /* ------------------------------------------------------------ page.force */
  if (desktop && want("page.force")) {
    const p = await ctx.newPage();
    await p.goto(ctx.url("/?skip=intro&gl=force"), { waitUntil: "load" });
    await sleep(2500);
    const frames = await p.evaluate(() => [...document.querySelectorAll("[data-act-card-frame]")].map((f) => f.closest("[data-act-card]")?.id ?? null));
    const per = {};
    for (const id of frames.filter(Boolean)) {
      // park at the card's top (p 0): the frame is on screen, the pin not started
      await p.evaluate((id) => { const s = document.getElementById(id); scrollTo(0, s.getBoundingClientRect().top + scrollY - innerHeight * 0.4); }, id);
      const sel = `#${id} [data-act-card-frame]`;
      const on = await engaged(p, sel);
      const shots = [];
      if (on) {
        for (const v of [0.1, 0.3, 0.45, 0.8]) {
          await p.evaluate(({ id, v }) => { const s = document.getElementById(id); const top = s.getBoundingClientRect().top + scrollY; scrollTo(0, top + v * Math.max(0, s.offsetHeight - innerHeight)); }, { id, v });
          await sleep(900);
          const f = `page-${id}-p${v}.png`;
          await clip(p, sel, f);
          shots.push(f);
        }
      }
      per[id] = { engaged: on, shots };
    }
    const s = await gl(p);
    const any = Object.values(per).some((r) => r.engaged);
    if (!any) set("page.force", true, { skipped: true, note: "no card frame engaged: GlGate not mounted yet (W2-CARDS) or nothing reached ladder step 4", frames, tier: s.tier });
    else {
      const switches = midSwitches(s.log);
      set("page.force", s.contexts === 1 && !switches.length && Object.values(per).every((r) => r.engaged), { per, contexts: s.contexts, midSwitches: switches, aborts: aborts(s.log), bytes: s.bytes });
    }
  }

  /* --------------------------------------------------------- page.default */
  if (desktop && want("page.default")) {
    const p = await ctx.newPage();
    await p.goto(ctx.url("/?skip=intro"), { waitUntil: "load" });
    await sleep(8000);
    const r = await p.evaluate(() => ({ tier: window.__glTier ?? null, on: document.querySelectorAll('[data-gl="on"]').length }));
    // tier null = no GlGate on the page yet (W2-CARDS); SwiftShader → "css" once a card frame approached
    set("page.default", r.on === 0 && (r.tier === null || r.tier === "css" || r.tier === "gl"), { ...r, note: r.tier === "gl" ? "context not probed yet (no card approached)" : undefined });
  }

  /* ------------------------------------------------------------- page.off */
  if (desktop && want("page.off")) {
    const p = await ctx.newPage();
    await p.goto(ctx.url("/?skip=intro&gl=off"), { waitUntil: "load" });
    await sleep(6000);
    const r = await p.evaluate(() => ({ canvas: document.querySelectorAll("canvas[data-gl-canvas]").length, on: document.querySelectorAll('[data-gl="on"]').length, tier: window.__glTier ?? null, contexts: window.__gl?.contexts ?? 0 }));
    set("page.off", r.canvas === 0 && r.on === 0 && r.contexts === 0, r);
  }

  /* ------------------------------------------------------------------- rm */
  if (want("rm") && ctx.vw.width >= 1024) {
    const p = await ctx.newPage({ viewport: ctx.vw, reducedMotion: "reduce" });
    await p.goto(ctx.url("/lab/p3/gl?gl=force"), { waitUntil: "load" });
    await sleep(6000);
    const r = await p.evaluate(() => ({ tier: window.__glTier ?? null, canvas: document.querySelectorAll("canvas[data-gl-canvas]").length, contexts: window.__gl?.contexts ?? 0, on: document.querySelectorAll('[data-gl="on"]').length }));
    set("rm", r.tier === "off" && r.canvas === 0 && r.contexts === 0 && r.on === 0, r);
  }

  /* ---------------------------------------------------------------- phone */
  if (want("phone")) {
    const p = await ctx.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await p.goto(ctx.url("/?skip=intro"), { waitUntil: "load" });
    await sleep(5000);
    const r = await p.evaluate(() => ({ hosts: document.querySelectorAll("[data-gl-host]").length, canvas: document.querySelectorAll("canvas[data-gl-canvas]").length, chunk: typeof window.__gl !== "undefined", tier: window.__glTier ?? null }));
    set("phone", r.hosts === 0 && r.canvas === 0 && !r.chunk && (r.tier === null || r.tier === "off"), r);
  }

  const ran = Object.values(checks);
  return { pass: ran.length > 0 && ran.every((c) => c.pass), checks };
}
