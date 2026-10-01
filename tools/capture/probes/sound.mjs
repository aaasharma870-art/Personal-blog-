// tools/capture/probes/sound.mjs: sound off by default, follows motion and the world (P3-9).
// Owner: W2-SOUND (PHASE3-PLAN §4.7). Spec §13 P3-9 #1–#4.
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).
//
// Every page gets an init script that wraps window.AudioContext (counts contexts, logs state changes
// with performance.now()). The engine exposes window.__p3sound (state(), meter()) once loaded.
// Checks (each { pass, … }; the probe passes when every check that ran does):
//  desktop (ctx.vw ≥ 1024, no --rm):
//   muted.default   a fresh visit: [data-sound-toggle] visible, aria-pressed=false, 0 AudioContexts,
//                   0 requests under /audio/ (P3-9 #1)
//   unmute          a click: 1 AudioContext, running, aria-pressed=true, sessionStorage sound=on, engine
//                   loaded, the toggle's click cue logged
//   files           /audio/ requests only after the unmute; one format per line; ≤ 150 KB total; a 404
//                   (files not copied yet) is reported, not failed (P3-9 #4)
//   events          letterbox / impact / transition:meet / hunt-free events reach the engine as cues
//   bed.follow      the bed follows the world at the reading line (about → pirates, work → idiots,
//                   experiment → silent, beyond → rdr2, principles → hp, films → house) (P3-9 #2)
//   pause           Pause suspends the context ≤ 100 ms; the toggle turns aria-disabled with its note;
//                   resuming runs again (P3-9 #3)
//   hidden          a hidden tab suspends ≤ 100 ms; visible again runs
//   eggs.typed      typing "parley" (a typed spell, not the palette) voices `parley-creak`: every egg
//                   must reach the engine through triggerEgg → egg:trigger (P3-9 #2, spec §10.3 Eggs)
//   eggs.lumos      Pause, wait for the suspend, type "lumos": motion resumes and `lumos-bell` plays
//                   (the cue waits for the context's resume instead of being dropped)
//   letterbox.once  "open" is silent and a second "close" inside 1.2 s is dropped (no whum per nudge)
//   rm.live         OS reduced motion switched on mid-visit suspends ≤ 100 ms
//   newvisit        a new context starts muted with 0 AudioContexts
//  always: phone (390×844 touch: the toggle is not displayed, 0 contexts); rm.boot (reduced motion from
//   the start: the toggle is aria-disabled, a click creates no context)
// Flags: --sound-skip=bed,files,…  skip named checks.

const INSTRUMENT = () => {
  const AC = window.AudioContext;
  if (typeof AC !== "function") return;
  const log = { made: 0, ctxs: [], states: [] };
  window.__acLog = log;
  window.AudioContext = class extends AC {
    constructor(...a) {
      super(...a);
      log.made++;
      log.ctxs.push(this);
      this.addEventListener("statechange", () => log.states.push({ s: this.state, t: performance.now() }));
    }
  };
};

export default async function probe(page, ctx) {
  const SKIP = new Set(String(ctx.args["sound-skip"] ?? "").split(",").filter(Boolean));
  const checks = {};
  const set = (name, pass, detail = {}) => {
    checks[name] = { pass: pass === null ? null : Boolean(pass), ...detail };
  };
  const want = (name) => !SKIP.has(name.split(".")[0]) && !SKIP.has(name);
  const sleep = ctx.sleep;
  const toggleState = (p) =>
    p.evaluate(() => {
      const b = document.querySelector("[data-sound-toggle]");
      if (!b) return { exists: false };
      const wrap = b.closest(".sound-toggle") ?? b;
      return {
        exists: true,
        visible: getComputedStyle(wrap).display !== "none" && b.getBoundingClientRect().width > 0,
        pressed: b.getAttribute("aria-pressed"),
        disabled: b.getAttribute("aria-disabled"),
        described: b.getAttribute("aria-describedby"),
        note: b.getAttribute("aria-describedby") ? document.getElementById(b.getAttribute("aria-describedby"))?.textContent ?? null : null,
        made: window.__acLog?.made ?? null,
      };
    });
  /** Run `act` in the page, then time how long until the first context reaches `state`. */
  const timeTo = (p, act, state) =>
    p.evaluate(
      async ({ act, state }) => {
        const c = window.__acLog?.ctxs?.[0];
        if (!c) return { ok: false, why: "no context" };
        const t0 = performance.now();
        if (act === "pause" || act === "resume") document.querySelector("[data-motion-toggle]")?.click();
        if (act === "hide" || act === "show") {
          Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (act === "hide" ? "hidden" : "visible") });
          document.dispatchEvent(new Event("visibilitychange"));
        }
        return await new Promise((r) => {
          const f = () => {
            const ms = performance.now() - t0;
            if (c.state === state) r({ ok: true, ms: Math.round(ms) });
            else if (ms > 1500) r({ ok: false, ms: Math.round(ms), state: c.state });
            else setTimeout(f, 2);
          };
          f();
        });
      },
      { act, state },
    );
  const engineState = (p) => p.evaluate(() => window.__p3sound?.state?.() ?? null);

  const desktop = ctx.vw.width >= 1024 && !ctx.rm;

  /* ---------------------------------------------------------------- desktop */
  if (desktop) {
    const audio = [];
    let unmutedAt = null;
    page.on("response", async (r) => {
      let p = "";
      try {
        p = new URL(r.url()).pathname;
      } catch {
        return;
      }
      if (!p.startsWith("/audio/")) return;
      const len = Number(r.headers()["content-length"] ?? 0);
      audio.push({ path: p, status: r.status(), bytes: len, afterUnmute: unmutedAt !== null });
    });
    await page.addInitScript(INSTRUMENT);
    await ctx.goto();
    await sleep(1500);

    const t0 = await toggleState(page);
    set("muted.default", t0.exists && t0.visible && t0.pressed === "false" && t0.made === 0 && audio.length === 0, { ...t0, audioRequests: audio.length });

    if (t0.exists && t0.visible) {
      unmutedAt = Date.now();
      await page.click("[data-sound-toggle]");
      const ready = await page.waitForFunction(() => !!window.__p3sound, null, { timeout: 6000, polling: 50 }).then(
        () => true,
        () => false,
      );
      await sleep(200);
      const t1 = await toggleState(page);
      const s1 = await page.evaluate(() => ({ ctx: window.__acLog?.ctxs?.[0]?.state ?? null, session: sessionStorage.getItem("sound") }));
      const st1 = await engineState(page);
      set("unmute", ready && t1.made === 1 && s1.ctx === "running" && t1.pressed === "true" && s1.session === "on" && !!st1?.cues?.some((c) => c.id === "toggle-click"), {
        ready,
        ...t1,
        ...s1,
        cues: st1?.cues?.map((c) => c.id),
      });

      if (ready && want("files")) {
        await sleep(4000);
        const st = await engineState(page);
        const before = audio.filter((a) => !a.afterUnmute);
        const ok = audio.filter((a) => a.status === 200);
        const exts = new Set(ok.map((a) => a.path.split(".").pop()));
        const bytes = ok.reduce((s, a) => s + a.bytes, 0);
        const missing = Object.values(st?.files ?? {}).every((v) => v === "missing");
        set("files", before.length === 0 && exts.size <= 1 && bytes <= 150_000, {
          requests: audio.length,
          beforeUnmute: before.length,
          formats: [...exts],
          bytes,
          files: st?.files,
          note: missing ? "no file in public/audio yet (404s): the engine plays nothing for the tts-* cues" : undefined,
        });
      }

      if (ready && want("events")) {
        await page.evaluate(() => {
          const fire = (k, d) => window.dispatchEvent(new CustomEvent(k, { detail: d }));
          fire("letterbox", { state: "close" });
          fire("impact", { world: "idiots" });
          fire("transition:meet", { card: "seam" });
          fire("game:fire");
        });
        await sleep(700);
        const ids = ((await engineState(page))?.cues ?? []).map((c) => c.id);
        const need = ["letterbox-whum", "impact-chalk", "wave-recede", "duster-swipe", "deadeye-strike"];
        set(
          "events",
          need.every((n) => ids.includes(n)),
          { need, got: ids.slice(-12) },
        );
      }

      if (ready && want("bed")) {
        const plan = [
          ["about", "pirates"],
          ["work", "idiots"],
          ["experiment", null],
          ["beyond", "rdr2"],
          ["principles", "hp"],
          ["films", "house"],
        ];
        const seen = [];
        for (const [id, bed] of plan) {
          const has = await page.evaluate((id) => {
            const el = document.getElementById(id);
            if (!el) return false;
            const y = el.getBoundingClientRect().top + scrollY - innerHeight * 0.3;
            if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
            else window.scrollTo(0, y);
            return true;
          }, id);
          if (!has) {
            seen.push({ id, skipped: "no element" });
            continue;
          }
          const t = Date.now();
          const ok = await page.waitForFunction((b) => (window.__p3sound?.state?.().bed ?? null) === b, bed, { timeout: 5000, polling: 50 }).then(
            () => true,
            () => false,
          );
          seen.push({ id, want: bed, got: (await engineState(page))?.bed ?? null, ok, ms: Date.now() - t });
        }
        const st = await engineState(page);
        set(
          "bed.follow",
          seen.every((s) => s.skipped || s.ok),
          { seen, trims: st?.trims },
        );
      }

      if (ready && want("pause")) {
        const off = await timeTo(page, "pause", "suspended");
        await sleep(150);
        const tp = await toggleState(page);
        const on = await timeTo(page, "resume", "running");
        await sleep(150);
        const tr = await toggleState(page);
        set("pause", off.ok && off.ms <= 100 && tp.disabled === "true" && on.ok && tr.disabled === null, { off, on, whilePaused: tp, afterResume: tr });
      }

      if (ready && want("hidden")) {
        const off = await timeTo(page, "hide", "suspended");
        const on = await timeTo(page, "show", "running");
        set("hidden", off.ok && off.ms <= 100 && on.ok, { off, on });
      }

      if (ready && want("eggs")) {
        const cues = async () => ((await engineState(page))?.cues ?? []).map((c) => c.id);
        const waitCue = (id, ms = 2000) =>
          page.waitForFunction((id) => (window.__p3sound?.state?.().cues ?? []).some((c) => c.id === id), id, { timeout: ms, polling: 50 }).then(
            () => true,
            () => false,
          );
        // Focus off any field, then type the spell as a visitor would.
        await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
        await page.keyboard.type("parley", { delay: 40 });
        const parley = await waitCue("parley-creak");
        set("eggs.typed", parley, { got: (await cues()).slice(-8) });

        const pause = await timeTo(page, "pause", "suspended");
        await sleep(150);
        const before = (await cues()).filter((c) => c === "lumos-bell").length;
        await page.keyboard.type("lumos", { delay: 40 });
        await sleep(100);
        const resumed = await page.evaluate(() => document.querySelector("[data-motion-toggle]")?.getAttribute("data-motion-toggle") !== "paused");
        const t = Date.now();
        const bell = await page
          .waitForFunction((n) => (window.__p3sound?.state?.().cues ?? []).filter((c) => c.id === "lumos-bell").length > n, before, { timeout: 2000, polling: 50 })
          .then(
            () => true,
            () => false,
          );
        const ctxState = await page.evaluate(() => window.__acLog?.ctxs?.[0]?.state ?? null);
        // If the typed lumos did not resume motion (eggs off in the registry), the check does not apply.
        set("eggs.lumos", resumed ? bell && ctxState === "running" : null, { pause, resumed, bell, ms: Date.now() - t, ctx: ctxState });
        if (!resumed) await timeTo(page, "resume", "running");
      }

      if (ready && want("letterbox")) {
        const r = await page.evaluate(async () => {
          const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
          const n = () => (window.__p3sound?.state?.().cues ?? []).filter((c) => c.id === "letterbox-whum").length;
          const fire = (state) => window.dispatchEvent(new CustomEvent("letterbox", { detail: { state } }));
          await sleep(1300); // past the gap of the events check's close
          const a = n();
          fire("close");
          await sleep(80);
          fire("open");
          await sleep(80);
          fire("close");
          await sleep(200);
          return { voiced: n() - a };
        });
        set("letterbox.once", r.voiced === 1, r);
      }

      if (ready && want("rm")) {
        await page.evaluate(() => {
          window.__rmAt = null;
          window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => (window.__rmAt = performance.now()));
        });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await sleep(400);
        const r = await page.evaluate(() => {
          const s = (window.__acLog?.states ?? []).find((x) => x.s === "suspended" && window.__rmAt !== null && x.t >= window.__rmAt);
          return { rmAt: window.__rmAt, ms: s && window.__rmAt !== null ? Math.round(s.t - window.__rmAt) : null, state: window.__acLog?.ctxs?.[0]?.state };
        });
        const t = await toggleState(page);
        await page.emulateMedia({ reducedMotion: "no-preference" });
        set("rm.live", r.ms !== null && r.ms <= 100 && r.state === "suspended" && t.disabled === "true" && !!t.note, { ...r, toggle: t });
      }
    }

    if (want("newvisit")) {
      const p2 = await ctx.newPage();
      await p2.addInitScript(INSTRUMENT);
      await p2.goto(ctx.url(), { waitUntil: "load" });
      await sleep(1200);
      const t = await toggleState(p2);
      const session = await p2.evaluate(() => sessionStorage.getItem("sound"));
      set("newvisit", t.pressed === "false" && t.made === 0 && session === null, { ...t, session });
    }
  }

  /* ---------------------------------------------------------------- always */
  if (want("phone")) {
    const p = await ctx.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await p.addInitScript(INSTRUMENT);
    await p.goto(ctx.url(), { waitUntil: "load" });
    await sleep(1200);
    const t = await toggleState(p);
    set("phone", t.exists ? !t.visible && t.made === 0 : null, t);
  }

  if (want("rm.boot")) {
    const p = await ctx.newPage({ viewport: { width: Math.max(1440, ctx.vw.width), height: 900 }, reducedMotion: "reduce" });
    await p.addInitScript(INSTRUMENT);
    await p.goto(ctx.url(), { waitUntil: "load" });
    await sleep(1200);
    const t = await toggleState(p);
    if (t.exists && t.visible) await p.click("[data-sound-toggle]").catch(() => {});
    await sleep(400);
    const after = await toggleState(p);
    set("rm.boot", t.exists && t.visible && t.disabled === "true" && !!t.note && after.made === 0, { before: t, after });
  }

  const ran = Object.values(checks).filter((c) => c.pass !== null);
  return { pass: ran.length > 0 && ran.every((c) => c.pass), checks };
}
