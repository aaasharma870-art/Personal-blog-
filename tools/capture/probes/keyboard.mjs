// tools/capture/probes/keyboard.mjs: a keyboard-only pass through every toy and egg (P3-8 #1 #4–#6, spec §9,
// §12.2 "Keyboard path for every toy and egg"; WCAG 2.1.1, 2.1.4, 2.4.3, 2.4.7, 2.4.11).
// Owner: P3-11.0 TOOLS (PHASE3-PLAN §11.1). Run by tools/capture/p3-probes.mjs (`--only=keyboard`) on
// `/?skip=intro` in a DESKTOP_FINE context (1440×900 default; also --vw=1024x768). Give it time:
// `--timeout=900000` (a few hundred Tab stops under SwiftShader).
//
// Every input is a key press (Tab, Shift+Tab, Enter, Space, Escape, arrows, Ctrl+K, typed words) or a reload:
// no click, no element.focus(), no blur(). Scripted actions only read state (and clear the hunt once, first).
//
//   walk      Tab from the top of the page to the end (until focus wraps or leaves the page): every stop is
//             recorded ({ n, el, section, inView, covered }); `covered` = the element under the focused box's
//             centre is something else (a header, a bar, an overlay: WCAG 2.4.11), `inView` = the stop scrolled
//             into the viewport. Targets are operated where the walk reaches them (in place, so the Tab order
//             is not broken by a jump):
//   pause     [data-motion-toggle]: Enter pauses (html[data-motion=paused]) with no hunt count and no toast;
//             Enter resumes                                                                   (P3-8 #3)
//   sound     [data-sound-toggle]: Enter toggles aria-pressed, Enter restores it               (P3-9)
//   chip      [data-hunt-chip]: Enter opens the hunt panel, Esc closes it, focus back on the chip (P3-8)
//   menu      button[aria-controls=site-menu]: Enter opens #site-menu, Esc closes it, focus back
//   compass   button[data-toy=compass]: Enter spins and the needle settles on a pillar bearing; → steps
//   coin      #egg-pc-coin  · kraken [data-kraken] · aal #egg-3i-aal · eagle #egg-rd-eagle · bone #egg-rd-bone
//             · fire #egg-rd-fire · snitch button[data-egg=snitch]: Enter counts the egg (aryan:hunt:v1)
//   run       the gauntlet's Run button ([data-beat=B18] button): Enter; a clearing run counts 3i-quad
//   drone     #drone-takeoff: Enter flies with focus in the play field, → moves the drone, Esc lands with
//             focus back on the pill                                                          (P3-8 #4)
//   deadeye   #deadeye-call: Enter starts a round with focus on the first killed row; Enter marks, ↓ walks,
//             Shift+Enter fires, Esc releases; focus returns                                    (P3-8 #5)
//   pen       #egg-3i-pen: before Dead Eye it does not count (the "read the ledger" toast); after the Dead Eye
//             win, Shift+Tab back to it and Enter counts 3i-pen                                   (P3-8 #1)
//   lumos     [data-candle-lumos]: Enter lights every candle (≤ 1.7 s); a keyboard visitor never moves the pointer,
//             so the candles were never armed dark: lit before and after is the expected path   (P3-8 #6)
//   typed     with focus on the page (Esc first): "parley", "aal izz well", "nox" → paused, "lumos" → resumed,
//             "I solemnly swear" opens the Map dialog, Esc closes it (≤ 4 s: it folds away)        (P3-8 #1)
//   palette   Ctrl+K, "solemn" lists the Map command, Enter opens the Map, Esc closes; Ctrl+K "Fly the
//             homemade drone" → Enter focuses #drone-takeoff (no take-off)                         (spec §9)
//   jumps     the fast lane (Enter → focus inside #work), the director's cut (Enter on [data-dc=hero] starts
//             it with focus on ■ Stop; Esc stops it), a chapter tile (Enter → focus inside the act)
//   count     the hunt at the end: which of the 12 eggs counted by keyboard alone
// The probe passes when every target was reached by Tab and operated, the 12 eggs count, and no focused stop
// is covered. Under --rm the reduced-motion paths are the expected ones: the sound toggle is disabled (Enter
// changes nothing), the drone press shows the flight plan (no flight, no html[data-game]), there is no candle
// toy (all lit, no "Lumos" button), and the director's-cut button never starts the cut. Flags: --keyboard-skip=walk,typed,palette,jumps   --keyboard-max=1200 (Tab stops)

const KEY = "aryan:hunt:v1";
const ALL = ["hp-map", "hp-lumos", "hp-snitch", "pc-parley", "pc-coin", "pc-kraken", "3i-aal", "3i-quad", "3i-pen", "rd-eagle", "rd-bone", "rd-fire"];
const HEADINGS = [315, 45, 225, 135];
const onBearing = (v) => v != null && HEADINGS.some((h) => Math.min(Math.abs(v - h), 360 - Math.abs(v - h)) <= 2);

/** Targets in the walk: name → the selector the focused element must match. */
const TARGETS = {
  pause: "[data-motion-toggle]",
  sound: "[data-sound-toggle]",
  chip: "[data-hunt-chip]",
  menu: 'button[aria-controls="site-menu"]',
  compass: 'button[data-toy="compass"]',
  coin: "#egg-pc-coin",
  kraken: "[data-kraken]",
  run: '[data-beat="B18"] button',
  aal: "#egg-3i-aal",
  drone: "#drone-takeoff",
  pen: "#egg-3i-pen",
  deadeye: "#deadeye-call",
  eagle: "#egg-rd-eagle",
  bone: "#egg-rd-bone",
  fire: "#egg-rd-fire",
  lumos: "[data-candle-lumos]",
  snitch: 'button[data-egg="snitch"]',
  fastlane: "[data-fast-lane]",
  dc: '[data-dc="hero"]',
};
const EGG_OF = { coin: "pc-coin", kraken: "pc-kraken", aal: "3i-aal", eagle: "rd-eagle", bone: "rd-bone", fire: "rd-fire", snitch: "hp-snitch" };

export default async function probe(page, ctx) {
  const SKIP = new Set(String(ctx.args["keyboard-skip"] ?? "").split(",").filter(Boolean));
  const RM = Boolean(ctx.rm);
  const MAX = Number(ctx.args["keyboard-max"] ?? 1200);
  const sleep = ctx.sleep;
  const checks = {};
  const set = (name, pass, detail = {}) => (checks[name] = { pass: Boolean(pass), ...detail });
  const kb = page.keyboard;
  const found = () => page.evaluate((k) => Object.keys(JSON.parse(localStorage.getItem(k) ?? "null")?.found ?? {}), KEY);
  const waitFound = (id, ms) =>
    page
      .waitForFunction(([k, id]) => Boolean(JSON.parse(localStorage.getItem(k) ?? "null")?.found?.[id]), [KEY, id], { timeout: ms, polling: 100 })
      .then(() => true, () => false);
  const activeIs = (sel) => page.evaluate((s) => Boolean(document.activeElement?.matches?.(s)), sel);
  const activeDesc = () =>
    page.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return "body";
      return `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${e.getAttribute("aria-label") ? `[${e.getAttribute("aria-label").slice(0, 40)}]` : ""}`;
    });
  const motion = () => page.evaluate(() => document.documentElement.getAttribute("data-motion"));
  const press = async (k, wait = 120) => {
    await kb.press(k);
    await sleep(wait);
  };
  /** Shift+Tab / Tab until the focused element matches `sel` (≤ n presses); true when found. */
  const tabTo = async (sel, dir = "Tab", n = 60) => {
    for (let i = 0; i < n; i++) {
      if (await activeIs(sel)) return true;
      await press(dir === "back" ? "Shift+Tab" : "Tab", 90);
    }
    return activeIs(sel);
  };
  /** Esc, then wait (≤ 4 s: the Map folds away) until no [role=dialog] is left; ms or null. */
  const escCloses = async () => {
    const t0 = Date.now();
    await kb.press("Escape");
    const gone = await page
      .waitForFunction(() => ![...document.querySelectorAll('[role="dialog"]')].some((d) => d.getClientRects().length > 0), null, { timeout: 4000, polling: 50 })
      .then(() => true, () => false);
    return gone ? Date.now() - t0 : null;
  };
  const run = async (name, fn) => {
    try {
      await fn();
    } catch (e) {
      set(name, false, { error: String(e?.message ?? e).split("\n")[0] });
    }
  };

  await ctx.goto();
  await page.evaluate((k) => localStorage.removeItem(k), KEY);
  await ctx.goto();
  await page.waitForFunction(() => window.__pageHydrated === true, null, { timeout: 15000 }).catch(() => {});
  const lenis = await page.waitForFunction(() => !!window.__lenis, null, { timeout: 15000 }).then(() => true, () => false);
  await sleep(3500); // the ladder + the enhancer's binders (hotspots, games, words)

  /* — the operations, run where the walk reaches each target ——————————————————— */
  const ops = {
    async pause() {
      const before = await found();
      await press("Enter", 300);
      const paused = (await motion()) === "paused";
      const toast = await page.evaluate(() => Boolean(document.querySelector("[data-egg-toast]")));
      const after = await found();
      await press("Enter", 400);
      const resumed = (await motion()) !== "paused";
      await page.waitForFunction(() => !!window.__lenis, null, { timeout: 8000 }).catch(() => {});
      return { pass: paused && resumed && !toast && after.length === before.length, paused, resumed, toast, counted: after.length - before.length };
    },
    async sound() {
      const get = () => page.evaluate(() => document.activeElement?.getAttribute("aria-pressed"));
      const disabled = await page.evaluate(() => {
        const e = document.activeElement;
        return Boolean(e?.hasAttribute("disabled") || e?.getAttribute("aria-disabled") === "true");
      });
      const a = await get();
      await press("Enter", 400);
      const b = await get();
      await press("Enter", 400);
      const c = await get();
      // reduced motion: the toggle is disabled with its note (P3-9 #3) and Enter changes nothing
      if (RM) return { pass: a === b && b === c, rm: true, disabled, states: [a, b, c] };
      return { pass: a !== b && a === c, disabled, states: [a, b, c] };
    },
    async chip() {
      await press("Enter", 500);
      const open = await page.evaluate(() => Boolean(document.querySelector("[data-hunt-panel], #hunt-panel, [aria-label*='hunt' i][role='dialog'], [data-hunt-panel-open]")) || document.querySelector("[data-hunt-chip]")?.getAttribute("aria-expanded") === "true");
      await press("Escape", 400);
      const closed = await page.evaluate(() => document.querySelector("[data-hunt-chip]")?.getAttribute("aria-expanded") !== "true");
      const back = await activeIs(TARGETS.chip);
      return { pass: open && closed && back, open, closed, focusBack: back, focus: await activeDesc() };
    },
    async menu() {
      await press("Enter", 500);
      const open = await page.evaluate(() => Boolean(document.getElementById("site-menu")));
      await press("Escape", 500);
      const closed = await page.evaluate(() => !document.getElementById("site-menu") || document.getElementById("site-menu").getClientRects().length === 0);
      const back = await activeIs(TARGETS.menu);
      return { pass: open && closed && back, open, closed, focusBack: back, focus: await activeDesc() };
    },
    async compass() {
      const needle = () => page.evaluate(() => Number(document.querySelector('[data-instrument="jack-compass"]')?.getAttribute("data-needle")));
      const settleRead = async () => {
        let last = null;
        let same = 0;
        for (let i = 0; i < 40; i++) {
          await sleep(150);
          const v = await needle();
          same = v === last ? same + 1 : 0;
          last = v;
          if (same >= 4) break;
        }
        return last;
      };
      const v0 = await needle();
      await press("Enter", 100);
      const v1 = await settleRead();
      await press("ArrowRight", 100);
      const v2 = await settleRead();
      return { pass: onBearing(v1) && onBearing(v2) && v2 !== v1, rest: v0, enter: v1, arrow: v2 };
    },
    async run() {
      await press("Enter", 300);
      const ok = await waitFound("3i-quad", 20000);
      return { pass: ok, counted: ok };
    },
    async drone() {
      if (RM) {
        // reduced motion: a press shows the static labelled flight plan, no flight, no html[data-game] (spec §9.2)
        await press("Enter", 600);
        const r = await page.evaluate(() => ({
          phase: document.querySelector(".drone-game")?.getAttribute("data-phase") ?? null,
          game: document.documentElement.getAttribute("data-game"),
          focusInGame: Boolean(document.activeElement?.closest?.(".drone-game")),
        }));
        await press("Escape", 400);
        const back = await activeIs(TARGETS.drone);
        if (!back) await tabTo(TARGETS.drone, "back", 10);
        return { pass: r.phase === "plan" && !r.game, rm: true, ...r, focusBackAfterEsc: back };
      }
      await press("Enter", 300);
      const flying = await page
        .waitForFunction(() => document.querySelector(".drone-game")?.getAttribute("data-phase") === "flying", null, { timeout: 8000 })
        .then(() => true, () => false);
      const inField = await page.evaluate(() => Boolean(document.activeElement?.closest?.(".drone-field") || document.activeElement?.classList?.contains("drone-field")));
      const x = () => page.evaluate(() => document.querySelector(".drone-sprite")?.getBoundingClientRect().x ?? null);
      const x0 = await x();
      await kb.down("ArrowRight");
      await sleep(900);
      await kb.up("ArrowRight");
      await sleep(200);
      const x1 = await x();
      await press("Escape", 200);
      const landed = await page
        .waitForFunction(() => ["idle", "done"].includes(document.querySelector(".drone-game")?.getAttribute("data-phase") ?? ""), null, { timeout: 4000 })
        .then(() => true, () => false);
      await sleep(300);
      const back = await activeIs(TARGETS.drone);
      const game = await page.evaluate(() => document.documentElement.getAttribute("data-game"));
      return { pass: flying && inField && x1 != null && x0 != null && x1 > x0 + 10 && landed && back && !game, flying, focusInField: inField, moved: x0 != null && x1 != null ? Math.round(x1 - x0) : null, landed, focusBack: back, game };
    },
    async pen() {
      const before = await found();
      await press("Enter", 600);
      const counted = (await found()).includes("3i-pen");
      const toast = await page.evaluate(() => document.querySelector("[data-egg-toast]")?.textContent?.trim().slice(0, 120) ?? null);
      const won = Boolean(operated.deadeye?.pass);
      return { pass: won ? counted : true, afterDeadEyeWin: won, counted, toast, note: before.includes("3i-pen") ? "already counted" : won ? "pressed after the Dead Eye win: counts" : "pressed before the Dead Eye win (counts only after it, or after reading every row)" };
    },
    async deadeye() {
      await press("Enter", 300);
      const on = await page
        .waitForFunction(() => document.querySelector("#kill-list")?.getAttribute("data-deadeye") === "on", null, { timeout: 10000 })
        .then(() => true, () => false);
      await sleep(600);
      const startFocus = await page.evaluate(() => Boolean(document.activeElement?.closest?.('#kill-list li[data-verdict="killed"]')));
      const rows = await page.evaluate(() => document.querySelectorAll('#kill-list li[data-verdict="killed"]').length);
      for (let i = 0; i < rows; i++) {
        await press("Enter", 140);
        if (i < rows - 1) await press("ArrowDown", 140);
      }
      await press("Shift+Enter", 400);
      const struck = await page
        .waitForFunction((n) => document.querySelectorAll("#kill-list li[data-deadeye-struck]").length >= n, rows, { timeout: 6000 })
        .then(() => true, () => false);
      const nStruck = await page.evaluate(() => document.querySelectorAll("#kill-list li[data-deadeye-struck]").length);
      const hud = await page.evaluate(() => document.querySelector(".de-hud")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 120) ?? null);
      await press("Escape", 600);
      const released = await page
        .waitForFunction(() => !document.querySelector("#kill-list")?.getAttribute("data-deadeye") && !document.documentElement.getAttribute("data-game"), null, { timeout: 5000 })
        .then(() => true, () => false);
      const focus = await activeDesc();
      const back = await activeIs(TARGETS.deadeye);
      return { pass: on && startFocus && struck && released, started: on, focusOnFirstRow: startFocus, killedRows: rows, struck: nStruck, hud, released, focusBack: back, focus };
    },
    async lumos() {
      const lit = () =>
        page.evaluate(() => {
          const s = document.querySelector('[data-world-section="contact"]') ?? document.getElementById("contact");
          const all = s ? [...s.querySelectorAll("svg[data-candle]")] : [];
          return { n: all.length, lit: all.filter((c) => c.hasAttribute("data-lit")).length };
        });
      const a = await lit();
      await press("Enter", 1900);
      const b = await lit();
      return { pass: b.n > 0 && b.lit === b.n, before: a, after: b };
    },
  };
  for (const [name, egg] of Object.entries(EGG_OF)) {
    ops[name] = async () => {
      await press("Enter", name === "aal" ? 900 : 400);
      const ok = await waitFound(egg, 5000);
      return { pass: ok, egg, counted: ok, focus: await activeDesc() };
    };
  }

  /* — the walk ———————————————————————————————————————————————————————————————— */
  const stops = [];
  const reached = {};
  const operated = {};
  if (!SKIP.has("walk")) {
    await run("walk", async () => {
      let wrapped = false; // a fresh load: nothing has focus, so the first Tab is the page's first stop
      for (let n = 1; n <= MAX; n++) {
        await kb.press("Tab");
        await sleep(110);
        const s = await page.evaluate((n) => {
          const e = document.activeElement;
          if (!e || e === document.body || e === document.documentElement) return { n, none: true };
          const again = e.hasAttribute("data-kbwalk");
          if (!again) e.setAttribute("data-kbwalk", String(n));
          const r = e.getBoundingClientRect();
          const inView = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
          let covered = null;
          if (inView) {
            const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2));
            const cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
            const hit = document.elementFromPoint(cx, cy);
            if (hit && !(hit === e || e.contains(hit) || hit.contains(e))) {
              const lab = e.getAttribute("aria-labelledby");
              if (!(lab && hit.closest(`#${CSS.escape(lab)}`))) covered = `${hit.tagName.toLowerCase()}${hit.id ? "#" + hit.id : ""}${typeof hit.className === "string" && hit.className ? "." + hit.className.trim().split(/\s+/).slice(0, 2).join(".") : ""}`;
            }
          }
          // the ACCESSIBLE NAME (P3-11 r1, F6: textContent read "WorkSkip to the research" for a
          // link whose aria-hidden decoration doubles its label): aria-labelledby, aria-label, then
          // the subtree's text without aria-hidden / hidden parts (img alt), then title
          const textOf = (node) => {
            if (node.nodeType === 3) return node.nodeValue ?? "";
            if (node.nodeType !== 1) return "";
            const el = node;
            if (el.getAttribute("aria-hidden") === "true" || el.hidden || getComputedStyle(el).display === "none") return "";
            if (el.tagName === "IMG") return el.getAttribute("alt") ?? "";
            if (el !== e && el.getAttribute("aria-label")) return ` ${el.getAttribute("aria-label")} `;
            return [...el.childNodes].map(textOf).join("");
          };
          const by = (e.getAttribute("aria-labelledby") ?? "")
            .split(/\s+/)
            .map((id) => (id ? document.getElementById(id) : null))
            .filter(Boolean)
            .map((el) => el.textContent ?? "")
            .join(" ");
          const label = (by.trim() || e.getAttribute("aria-label") || textOf(e).trim() || e.getAttribute("title") || "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 50);
          return {
            n,
            again,
            first: again ? Number(e.getAttribute("data-kbwalk")) : null,
            el: `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}`,
            label,
            section: e.closest("section[id], footer[id], [data-act-card][id]")?.id ?? (e.closest("header") ? "header" : "-"),
            inView,
            covered,
            y: Math.round(scrollY),
          };
        }, n);
        if (s.none) {
          stops.push(s);
          if (stops.filter((x) => x.none).length > 3) break; // focus left the page (address bar) for good
          continue;
        }
        if (s.again) {
          wrapped = true;
          stops.push({ n, wrappedTo: s.first, el: s.el });
          break;
        }
        stops.push(s);
        // a target?
        for (const [name, sel] of Object.entries(TARGETS)) {
          if (reached[name] || !(await activeIs(sel))) continue;
          reached[name] = n;
          if (ops[name]) {
            await sleep(250);
            operated[name] = await ops[name]().catch((e) => ({ pass: false, error: String(e?.message ?? e).split("\n")[0] }));
            // continue the walk from the target (an operation that lost focus is recorded and put back by keys)
            if (!(await activeIs(sel))) {
              operated[name].focusAfter = await activeDesc();
              operated[name].refocusedByKeys = await tabTo(sel, "back", 25);
              if (!operated[name].refocusedByKeys) operated[name].refocusedByKeys = await tabTo(sel, "Tab", 40);
            }
          }
          break;
        }
      }
      const real = stops.filter((s) => !s.none && !s.wrappedTo);
      const notInView = real.filter((s) => !s.inView).map((s) => `${s.n} ${s.el} ${s.label} (#${s.section})`);
      const covered = real.filter((s) => s.covered).map((s) => `${s.n} ${s.el} "${s.label}" (#${s.section}) under ${s.covered}`);
      set("walk", wrapped || real.length > 50, { stops: real.length, wrapped, notInView: notInView.length, notInViewList: notInView.slice(0, 30), covered: covered.length, coveredList: covered.slice(0, 40) });
      checks["walk.covered"] = { pass: covered.length === 0, n: covered.length };
    });
    for (const name of Object.keys(TARGETS)) {
      // reduced motion: the candle toy is off (every candle lit, no "Lumos" button) — absence is the RM path
      if (RM && name === "lumos" && !reached[name]) {
        set(`op.${name}`, true, { rm: true, note: "no candle toy under reduced motion (all candles lit)", present: await page.evaluate((s) => Boolean(document.querySelector(s)), TARGETS.lumos) });
        continue;
      }
      if (["fastlane", "dc"].includes(name)) {
        set(`reach.${name}`, Boolean(reached[name]), { stop: reached[name] ?? null });
        continue;
      }
      const o = operated[name];
      set(`op.${name}`, Boolean(reached[name]) && Boolean(o?.pass), { stop: reached[name] ?? null, ...(o ?? { why: "not reached by Tab" }) });
    }
    // the pen, after the Dead Eye win: Shift+Tab back to it from the Dead Eye pill (or Tab forward)
    await run("op.pen.afterDeadEye", async () => {
      if (!operated.deadeye?.pass) return set("op.pen.afterDeadEye", false, { why: "Dead Eye was not won by keyboard" });
      if ((await found()).includes("3i-pen")) return set("op.pen.afterDeadEye", true, { note: "already counted" });
      // from wherever the walk ended: back to the Dead Eye pill's neighbourhood is far; walk back by Shift+Tab
      const ok = (await tabTo(TARGETS.pen, "back", MAX)) || (await tabTo(TARGETS.pen, "Tab", MAX));
      if (!ok) return set("op.pen.afterDeadEye", false, { why: "#egg-3i-pen not reached by Shift+Tab / Tab" });
      await press("Enter", 600);
      set("op.pen.afterDeadEye", await waitFound("3i-pen", 4000));
    });
  }

  /* — typed spells ———————————————————————————————————————————————————————————————— */
  if (!SKIP.has("typed")) {
    // focus stays on the walk's last stop (a link or a button, never a field): the spells are read off the page
    const typeWord = async (w) => {
      await press("Escape", 150);
      await kb.type(w, { delay: 45 });
      await sleep(700);
    };
    await run("typed.parley", async () => {
      await typeWord("parley");
      set("typed.parley", await waitFound("pc-parley", 3000));
    });
    await run("typed.aal", async () => {
      await typeWord("aal izz well");
      set("typed.aal", await waitFound("3i-aal", 3000), { note: "3i-aal may already count from the heart (counts once)" });
    });
    await run("typed.nox-lumos", async () => {
      await typeWord("nox");
      await sleep(600);
      const paused = (await motion()) === "paused";
      await typeWord("lumos");
      await sleep(800);
      const resumed = (await motion()) !== "paused";
      set("typed.nox-lumos", paused && resumed && (await waitFound("hp-lumos", 3000)), { paused, resumed });
      await page.waitForFunction(() => !!window.__lenis, null, { timeout: 8000 }).catch(() => {});
    });
    await run("typed.map", async () => {
      await typeWord("I solemnly swear");
      const open = await page
        .waitForFunction(() => Boolean(document.querySelector('[role="dialog"]')), null, { timeout: 5000 })
        .then(() => true, () => false);
      const label = await page.evaluate(() => document.querySelector('[role="dialog"]')?.getAttribute("aria-label") ?? document.querySelector('[role="dialog"]')?.textContent?.trim().slice(0, 60) ?? null);
      const focusIn = await page.evaluate(() => Boolean(document.activeElement?.closest?.('[role="dialog"]')));
      const closeMs = await escCloses();
      await sleep(200);
      set("typed.map", open && closeMs != null && (await waitFound("hp-map", 3000)), { open, label, focusInDialog: focusIn, closedMs: closeMs, focusAfter: await activeDesc() });
    });
  }

  /* — the palette ———————————————————————————————————————————————————————————————— */
  if (!SKIP.has("palette")) {
    await run("palette.map", async () => {
      await press("Escape", 150);
      await press("Control+k", 600);
      const open = await page.evaluate(() => Boolean(document.querySelector("#cmd-list")));
      await kb.type("solemn", { delay: 40 });
      await sleep(500);
      const listed = await page.evaluate(() => [...document.querySelectorAll("#cmd-list [role='option']")].map((o) => o.textContent.trim().slice(0, 40)));
      await press("Enter", 1200);
      const dialog = await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')) && !document.querySelector("#cmd-list"));
      const closeMs = await escCloses();
      await sleep(200);
      set("palette.map", open && listed.length > 0 && dialog && closeMs != null, { open, listed: listed.slice(0, 5), dialog, closedMs: closeMs, focusAfter: await activeDesc() });
    });
    await run("palette.drone", async () => {
      await press("Control+k", 600);
      await kb.type("Fly the homemade drone", { delay: 30 });
      await sleep(500);
      await press("Enter", 2500);
      const focus = await activeIs(TARGETS.drone);
      const phase = await page.evaluate(() => document.querySelector(".drone-game")?.getAttribute("data-phase") ?? null);
      set("palette.drone", focus && phase !== "flying", { focusOnPill: focus, phase, focus: await activeDesc() });
    });
  }

  /* — jumps ———————————————————————————————————————————————————————————————————————— */
  if (!SKIP.has("jumps")) {
    // back to the start the way a keyboard user does it: reload (F5), then Tab from the page's first stop
    const toTop = async () => {
      await ctx.goto();
      await page.waitForFunction(() => window.__pageHydrated === true, null, { timeout: 15000 }).catch(() => {});
      await page.waitForFunction(() => !!window.__lenis, null, { timeout: 15000 }).catch(() => {});
      await sleep(2500);
    };
    await run("jump.fastlane", async () => {
      await toTop();
      const ok = await tabTo(TARGETS.fastlane, "Tab", 40);
      if (!ok) return set("jump.fastlane", false, { why: "not reached by Tab from the top" });
      await press("Enter", 1500);
      const inWork = await page.evaluate(() => Boolean(document.activeElement?.closest?.("#work")));
      set("jump.fastlane", inWork, { focus: await activeDesc() });
    });
    await run("jump.dc", async () => {
      await toTop();
      const ok = await tabTo(TARGETS.dc, "Tab", 60);
      if (!ok) return set("jump.dc", false, { why: "not reached by Tab from the top" });
      await press("Enter", 1500);
      const started = await page.evaluate(() => window.__dc === true);
      if (RM) {
        // reduced motion: the button reads "Motion is paused" and never starts the cut (spec §11.1)
        const label = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 60) ?? null);
        return set("jump.dc", !started, { rm: true, started, label });
      }
      const onStop = await page.evaluate(() => document.activeElement?.hasAttribute?.("data-dc-stop") ?? false);
      await press("Escape", 600);
      const stopped = await page.evaluate(() => window.__dc === false && !document.querySelector("[data-dc-pill]"));
      set("jump.dc", started && onStop && stopped, { started, focusOnStop: onStop, stopped, focus: await activeDesc() });
    });
    await run("jump.chapter", async () => {
      await toTop();
      const ok = await tabTo(TARGETS.menu, "Tab", 40);
      if (!ok) return set("jump.chapter", false, { why: "menu not reached" });
      await press("Enter", 700);
      const tile = await tabTo('[data-chapter-select] [data-chapter="act-2"] > a', "Tab", 40);
      if (!tile) {
        await press("Escape", 300);
        return set("jump.chapter", false, { why: "act-2 tile not reached by Tab inside the menu" });
      }
      await press("Enter", 2500);
      const inAct = await page.evaluate(() => Boolean(document.activeElement?.closest?.("#act-2")));
      set("jump.chapter", inAct, { focus: await activeDesc(), hash: await page.evaluate(() => location.hash) });
    });
  }

  /* — the count ———————————————————————————————————————————————————————————————————— */
  const got = await found();
  set("count", ALL.every((id) => got.includes(id)), { counted: got.length, missing: ALL.filter((id) => !got.includes(id)), lenis });
  const vals = Object.values(checks).filter((c) => c && typeof c === "object" && "pass" in c);
  return { pass: vals.every((c) => c.pass), checks, walk: stops.filter((s) => !s.none).map((s) => (s.wrappedTo ? `${s.n} → wraps to ${s.wrappedTo}` : `${s.n} ${s.el} "${s.label}" #${s.section}${s.covered ? ` COVERED by ${s.covered}` : ""}${s.inView ? "" : " (off-view)"}`)) };
}
