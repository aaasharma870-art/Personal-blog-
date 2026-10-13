// tools/capture/probes/games.mjs: the drone game and Dead Eye (P3-8 #4, #5, #9 B5 B6 B9; P3-7 #5 host; INP).
// Owner: W3-GAMES (PHASE3-PLAN §4.7). Run by tools/capture/p3-probes.mjs (`--only=games`), on the home
// page (`/?skip=intro`), in a DESKTOP_FINE context (the default 1440x900; also run --vw=1024x768).
// Expected strings come from the source (lib/content.ts gauntlet titles + killList, lib/film.ts toy.*),
// so a copy change never needs a probe edit.
//
//   beats        [data-beat] B26 (systems band), B28 (the DEAD EYE pill), B29 (the "Killed" physical word)
//   pills        "▲ Take off" (#drone-takeoff) and "DEAD EYE" (#deadeye-call) shown on DESKTOP_FINE
//   drone.keys   arrows move the drone only while the play field has focus (blurred: no move); each key is
//                held for a count of drawn frames (18 blurred, 12 focused), not ms: the flight steps per frame
//   drone.course a pointer drag flies the 7 gates in order; the live region speaks each gate VERBATIM
//                ("Gate n of 7 · <gauntlet[n].title>"); html[data-game="drone"] while flying; the score
//                panel shows the real link "Next: the kill-list ↓"; the best time is stored
//   drone.edge   holding ← into the band's edge: the drone stops dead (x constant: no bounce); held until x has
//                been still for 8 drawn frames (≤ 15 s: the flight steps per frame), then 5 x two frames apart
//   drone.esc    Esc lands (≤ 900 ms), focus returns to the pill, html[data-game] cleared
//   drone.off    scrolling the band under 50 % visible lands it
//   drone.pause  the Pause control lands it at once (≤ 250 ms)
//   de.start     the pill starts a round: the killed block is brought into view, #kill-list[data-deadeye=on]
//   de.time      time → 0.25× (--time-scale on the section, running animations at 0.25)
//   de.grade     the grade layer shows at z −1; the section's background never changes nor transitions (B6)
//   de.targets   a survivor click marks nothing and says "Survived: not a target"; 5 killed rows mark
//   de.fire      Shift+Enter fires: 5 rows struck, the HUD reads "5/5 marked · …"
//   de.read      every struck row's reason is the content's reason VERBATIM; links unchanged
//   de.store     aryan:games:v1 deadeye.n = 5; the hunt's deadEye win is recorded (the pen)
//   de.release   Esc restores #kill-list EXACTLY (outerHTML equal, but for the ledger's own interaction
//                state — the lens included — and the reveal / words binders' transient state:
//                killListMarkup; before and after read at the same scroll position) and clears html[data-game]
//   de.roving    ↑/↓ walk only the killed rows during a round
//   rows.read    scrolling the ledger through the reading line records every rendered row (the pen): a
//                real mouse WHEEL (notches of ≤ half the shortest row, each glide at rest before the next,
//                the pointer parked in the left margin so no row is hovered) until the centre line has
//                passed the last row; a scripted scrollBy at 60 px / 40 ms outran the IntersectionObserver
//                frames (1/10 read), and timed 100 px notches still skipped a row at headless frame rates
//   inp          the slowest click / key event of the probe ≤ 200 ms (Event Timing)
//   phone        390×844 touch: neither pill shows; no game layer mounts
// Under --rm: drone.plan (a press shows the static labelled flight plan with the 7 titles, no flight,
// no html[data-game]) and de.untimed (a round has no clock and no time-scale; still painting after 6 s).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

/** The gauntlet's titles and the kill-list's reasons, from lib/content.ts. */
function content() {
  const src = read("lib/content.ts");
  const g = /export const gauntlet[^=]*=\s*\[([\s\S]*?)\n\];/.exec(src)?.[1] ?? "";
  const titles = [...g.matchAll(/title:\s*"([^"]*)"/g)].map((m) => m[1]);
  const k = /export const killList[^=]*=\s*\[([\s\S]*?)\n\];/.exec(src)?.[1] ?? "";
  const killed = [...k.matchAll(/\{\s*name:\s*"([^"]*)",\s*reason:\s*"([^"]*)"\s*\}/g)].map((m) => ({ name: m[1], reason: m[2] }));
  return { titles, killed };
}

/** A lib/film.ts p3() copy string. */
function copy(key) {
  const re = new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*p3\\("([^"]*)"\\)`);
  return re.exec(read("lib/film.ts"))?.[1] ?? null;
}

const fill = (t, v) => t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? String(v[k]) : m));

/** #kill-list's markup for de.release, run in the page: attributes sorted (a binder that re-sets one
 *  changes the order, not the markup), without the ledger's own interaction state (class, style,
 *  tabindex, aria-current: the active row's colours, the lens, the roving tab stop follow the round's
 *  clicks) and without the binders' transient state: the Rise reveal's one-way armed → entered
 *  (data-reveal) and the words binder's arm / play of the B29 "Killed" word (data-words-state, the
 *  contents of its [data-words-fx] layer). The words probe checks those binders leave nothing behind;
 *  the round's own marks are checked on their own (`left`). */
function killListMarkup() {
  const el = document.getElementById("kill-list");
  if (!el) return "";
  const c = el.cloneNode(true);
  const DROP = new Set(["class", "style", "tabindex", "aria-current", "data-reveal", "data-words-state"]);
  c.querySelectorAll("[data-words-fx]").forEach((f) => f.replaceChildren());
  // the lane's lens (bracket, figure, label: aria-hidden) shows the ledger's last active row and opens
  // once on the first activation: the round's clicks are activations (reported as `lens`; a Dead Eye
  // [data-dead-eye] media left in it is caught by `left`)
  c.querySelector("[data-lens]")?.parentElement?.replaceChildren(document.createTextNode("[lens]"));
  for (const n of [c, ...c.querySelectorAll("*")]) {
    const attrs = [...n.attributes].filter((a) => !DROP.has(a.name)).map((a) => [a.name, a.value]).sort(([a], [b]) => (a < b ? -1 : 1));
    for (const a of [...n.attributes]) n.removeAttribute(a.name);
    for (const [k, v] of attrs) n.setAttribute(k, v);
  }
  return c.outerHTML;
}

export default async function probe(page, ctx) {
  const checks = {};
  const set = (name, pass, detail = {}) => (checks[name] = { pass: Boolean(pass), ...detail });
  const sleep = ctx.sleep;
  const run = async (name, fn) => {
    try {
      await fn();
    } catch (e) {
      set(name, false, { error: String(e?.message ?? e).split("\n")[0] });
    }
  };
  const { titles, killed } = content();
  const gateLine = copy("toy.drone.gate");
  const nextLine = copy("toy.drone.next");
  const survivor = copy("toy.deadeye.survivor");

  // the slowest interaction (Event Timing), installed before any script runs
  await page.addInitScript(() => {
    window.__gamesInp = 0;
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          // INP counts INTERACTIONS only (interactionId > 0: pointerdown/up, click, keydown/up);
          // a hover's pointerover / pointerenter while the page is busy is not one
          if (!(e.interactionId > 0) || !/click|key|pointer/.test(e.name)) continue;
          if (e.duration > window.__gamesInp) {
            window.__gamesInp = e.duration;
            window.__gamesInpWorst = { name: e.name, ms: e.duration, at: Math.round(e.startTime), delay: Math.round(e.processingStart - e.startTime), run: Math.round(e.processingEnd - e.processingStart) };
          }
        }
      }).observe({ type: "event", durationThreshold: 16, buffered: true });
    } catch {
      /* no Event Timing */
    }
  });
  await ctx.goto();
  await page.evaluate(() => {
    localStorage.removeItem("aryan:games:v1");
    localStorage.removeItem("aryan:hunt:v1");
  });
  await ctx.goto();
  await sleep(1500);

  const phase = () => page.evaluate(() => document.querySelector(".drone-game")?.getAttribute("data-phase") ?? null);
  const gameAttr = () => page.evaluate(() => document.documentElement.getAttribute("data-game"));
  const spriteX = () =>
    page.evaluate(() => {
      const m = /translate3d\(([-\d.]+)px/.exec(document.querySelector(".drone-sprite")?.style.transform ?? "");
      return m ? Number(m[1]) : null;
    });
  const bandBox = () =>
    page.evaluate(() => {
      // the band's picture box: the pill row's parent
      const r = document.querySelector("#drone-takeoff")?.closest(".drone-pill-row")?.parentElement?.getBoundingClientRect();
      return r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
    });
  const toBand = async () => {
    await page.evaluate(() => document.querySelector("#drone-takeoff")?.closest("[data-band]")?.scrollIntoView({ block: "center", behavior: "instant" }));
    await sleep(500);
  };
  const takeOff = async () => {
    await page.click("#drone-takeoff");
    await page.waitForFunction(() => document.querySelector(".drone-game")?.getAttribute("data-phase") === "flying", null, { timeout: 8000 });
    await sleep(350);
  };
  /** Hold `key` until the page has drawn `frames` animation frames (or `until()` holds, ≤ 4 s). */
  const holdKey = async (key, frames, until = null) => {
    await page.evaluate(() => {
      window.__probeFrames = 0;
      const f = () => {
        window.__probeFrames++;
        window.__probeRaf = requestAnimationFrame(f);
      };
      window.__probeRaf = requestAnimationFrame(f);
    });
    await page.keyboard.down(key);
    const t0 = Date.now();
    while (Date.now() - t0 < 4000) {
      await sleep(50);
      if ((await page.evaluate(() => window.__probeFrames)) >= frames) break;
      if (until && (await until())) break;
    }
    await page.keyboard.up(key);
    const n = await page.evaluate(() => {
      cancelAnimationFrame(window.__probeRaf);
      return window.__probeFrames;
    });
    return { frames: n, ms: Date.now() - t0 };
  };
  const landed = (ms = 1500) =>
    page.waitForFunction(() => ["idle", "done"].includes(document.querySelector(".drone-game")?.getAttribute("data-phase") ?? ""), null, { timeout: ms });

  await run("beats", async () => {
    const ids = await page.evaluate(() => ["B26", "B28", "B29"].filter((id) => document.querySelector(`[data-beat="${id}"]`)));
    set("beats", ids.length === 3, { found: ids });
  });
  await run("pills", async () => {
    const r = await page.evaluate(() =>
      ["#drone-takeoff", "#deadeye-call"].map((s) => {
        const el = document.querySelector(s);
        return el ? { display: getComputedStyle(el).display, text: el.textContent.trim() } : null;
      }),
    );
    set("pills", r.every((x) => x && x.display !== "none"), { pills: r });
  });

  if (ctx.rm) {
    await run("drone.plan", async () => {
      await toBand();
      await page.click("#drone-takeoff");
      await page.waitForSelector(".drone-plan", { timeout: 8000 });
      const r = await page.evaluate(() => ({
        items: [...document.querySelectorAll(".drone-plan li")].map((li) => li.textContent.replace(/^\s*\d+\s*/, "").trim()),
        game: document.documentElement.getAttribute("data-game"),
        phase: document.querySelector(".drone-game")?.getAttribute("data-phase"),
      }));
      set("drone.plan", r.phase === "plan" && r.game === null && JSON.stringify(r.items) === JSON.stringify(titles), r);
      await page.keyboard.press("Escape");
    });
    await run("de.untimed", async () => {
      await page.click("#deadeye-call");
      await page.waitForSelector('#kill-list[data-deadeye="on"]', { timeout: 8000 });
      const line0 = await page.evaluate(() => document.querySelector(".de-hud .de-read p")?.textContent ?? "");
      const ts = await page.evaluate(() => document.getElementById("kill-list").style.getPropertyValue("--time-scale"));
      await sleep(6000);
      const still = await page.evaluate(() => document.querySelector(".de-hud")?.getAttribute("data-phase"));
      set("de.untimed", !/Dead Eye left/.test(line0) && ts === "" && still === "paint", { line0, ts, still });
      await page.keyboard.press("Escape");
    });
    const pass = Object.values(checks).every((c) => c.pass);
    return { pass, checks };
  }

  /* — the drone ——————————————————————————————————————————————————————— */
  await run("drone.keys", async () => {
    await toBand();
    await takeOff();
    const r0 = await page.evaluate(() => ({ game: document.documentElement.getAttribute("data-game"), focus: document.activeElement?.className ?? "" }));
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    const x0 = await spriteX();
    // held for FRAMES, not ms: the flight integrates ≤ 1/30 s per frame, so at a starved headless frame
    // rate a 400 ms hold moved the drone 4 px (12 frames ≈ 0.4 s of flight ≈ 120 px at full thrust)
    const blurred = await holdKey("ArrowLeft", 18);
    const x1 = await spriteX();
    await page.evaluate(() => document.querySelector(".drone-field")?.focus());
    const focused = await holdKey("ArrowLeft", 12, async () => (await spriteX()) < x1 - 20);
    const x2 = await spriteX();
    set("drone.keys", r0.game === "drone" && /drone-field/.test(r0.focus) && Math.abs(x1 - x0) < 2 && x2 < x1 - 20, { ...r0, x0, x1, x2, blurred, focused });
    await page.keyboard.press("Escape");
    await landed();
  });

  await run("drone.course", async () => {
    await toBand();
    await page.evaluate(() => {
      window.__said = [];
      const live = document.querySelector('.drone-game [role="status"]');
      if (live) new MutationObserver(() => window.__said.push(live.textContent)).observe(live, { childList: true, characterData: true, subtree: true });
    });
    await takeOff();
    const b = await bandBox();
    const x0 = (await spriteX()) ?? 0;
    const sw = b.w * 0.055;
    let x = x0 + sw / 2;
    await page.mouse.move(b.x + x, b.y + 0.47 * b.h);
    await page.mouse.down();
    const centres = [0.34, 0.66, 0.28, 0.6, 0.36, 0.7, 0.42];
    for (let i = 0; i < 7; i++) {
      const gx = (0.1 + 0.13 * i) * b.w;
      const dir = x > gx ? -1 : 1;
      await page.mouse.move(b.x + gx + dir * 0.05 * b.w, b.y + centres[i] * b.h, { steps: 4 });
      await page
        .waitForFunction((n) => document.querySelectorAll('.drone-label[data-state="done"]').length >= n, i + 1, { timeout: 6000 })
        .catch(() => {});
      x = ((await spriteX()) ?? 0) + sw / 2;
    }
    await page.mouse.up();
    await landed(4000);
    await sleep(200);
    const r = await page.evaluate(() => ({
      said: window.__said.filter(Boolean),
      phase: document.querySelector(".drone-game")?.getAttribute("data-phase"),
      game: document.documentElement.getAttribute("data-game"),
      link: (() => {
        const a = document.querySelector(".drone-result a");
        return a ? { href: a.getAttribute("href"), text: a.textContent.trim() } : null;
      })(),
      store: JSON.parse(localStorage.getItem("aryan:games:v1") ?? "null"),
    }));
    const want = titles.map((title, i) => fill(gateLine ?? "", { n: i + 1, title }));
    const saidGates = [...new Set(r.said.map((s) => s.split(". ")[0]))];
    const verbatim = want.every((w) => saidGates.includes(w));
    set("drone.course", r.phase === "done" && r.game === null && verbatim && r.link?.href === "#kill-list" && r.link?.text === nextLine && typeof r.store?.drone?.best === "number", {
      ...r,
      want,
    });
  });

  await run("drone.edge", async () => {
    await toBand();
    await takeOff();
    const x0 = await spriteX();
    await page.keyboard.down("ArrowLeft");
    // the flight steps ≤ 1/30 s per drawn frame: at a starved headless frame rate the crossing takes many
    // seconds, so hold until x has not changed for 8 drawn frames (≤ 15 s), then sample 5 x two frames apart
    const r = await page.evaluate(async () => {
      const x = () => {
        const m = /translate3d\(([-\d.]+)px/.exec(document.querySelector(".drone-sprite")?.style.transform ?? "");
        return m ? Number(m[1]) : null;
      };
      const frame = () => new Promise((res) => requestAnimationFrame(() => res()));
      const t0 = performance.now();
      let last = x();
      let still = 0;
      let frames = 0;
      while (performance.now() - t0 < 15000 && still < 8) {
        await frame();
        frames++;
        const v = x();
        still = v !== null && last !== null && Math.abs(v - last) < 0.05 ? still + 1 : 0;
        last = v;
      }
      const xs = [];
      for (let i = 0; i < 5; i++) {
        xs.push(x());
        await frame();
        await frame();
      }
      return { xs, frames, ms: Math.round(performance.now() - t0) };
    });
    await page.keyboard.up("ArrowLeft");
    const xs = r.xs;
    // stopped dead AT THE EDGE: constant, and well left of where it took off
    set("drone.edge", x0 !== null && xs.every((v) => v !== null && Math.abs(v - xs[0]) < 0.5) && xs[0] < x0 - 100, { x0, xs, frames: r.frames, ms: r.ms });
    await page.keyboard.press("Escape");
    await landed();
  });

  await run("drone.esc", async () => {
    await toBand();
    await takeOff();
    const t0 = Date.now();
    await page.keyboard.press("Escape");
    await landed(1500);
    const ms = Date.now() - t0;
    const r = await page.evaluate(() => ({ focus: document.activeElement?.id ?? null, game: document.documentElement.getAttribute("data-game") }));
    set("drone.esc", ms <= 900 && r.focus === "drone-takeoff" && r.game === null, { ms, ...r });
  });

  await run("drone.off", async () => {
    await toBand();
    await takeOff();
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.6));
    const ok = await landed(2500).then(
      () => true,
      () => false,
    );
    set("drone.off", ok, { phase: await phase() });
  });

  await run("drone.pause", async () => {
    await toBand();
    await takeOff();
    // timed IN THE PAGE from the click (the flight lands inside the Pause click: a stop-at-once listener):
    // a frame-polled wait from Node adds two round trips and a 100-400 ms SwiftShader frame
    const r = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const g = document.querySelector(".drone-game");
          const down = () => ["idle", "done"].includes(g?.getAttribute("data-phase") ?? "");
          const t0 = performance.now();
          [...document.querySelectorAll("[data-motion-toggle]")].find((b) => b.offsetParent !== null)?.click();
          if (down()) return resolve({ ms: Math.round(performance.now() - t0), inClick: true });
          const mo = new MutationObserver(() => {
            if (!down()) return;
            mo.disconnect();
            resolve({ ms: Math.round(performance.now() - t0), inClick: false });
          });
          if (g) mo.observe(g, { attributes: true, attributeFilter: ["data-phase"] });
          setTimeout(() => {
            mo.disconnect();
            resolve({ ms: null, inClick: false });
          }, 1000);
        }),
    );
    set("drone.pause", r.ms !== null && r.ms <= 250, { ...r, phase: await phase(), game: await gameAttr() });
    await page.evaluate(() => [...document.querySelectorAll("[data-motion-toggle]")].find((b) => b.offsetParent !== null)?.click());
    await sleep(300);
  });

  /* — Dead Eye ————————————————————————————————————————————————————————— */
  // de.release's baseline: re-taken in de.start with the ledger in view and still (the lens, its figure and
  // its label follow the row on the centre line, so before and after are read at the SAME scroll position)
  let before = await page.evaluate(killListMarkup);
  let beforeY = null;
  let lensBefore = null;
  const lensState = () => {
    const l = document.querySelector("#kill-list [data-lens]");
    return l ? { lens: l.getAttribute("data-lens"), figure: l.querySelector("[data-lens-figure]")?.getAttribute("data-lens-figure") ?? null } : null;
  };
  const bg0 = await page.evaluate(() => getComputedStyle(document.getElementById("kill-list")).backgroundColor);
  const hrefs0 = await page.evaluate(() => [...document.querySelectorAll('#kill-list li[data-verdict="killed"] a')].map((a) => a.href));

  await run("de.start", async () => {
    await page.evaluate(() => document.getElementById("kill-list")?.scrollIntoView({ block: "start", behavior: "instant" }));
    await sleep(500);
    await page.mouse.move(8, Math.round(ctx.vw.height / 2)); // no row hovered
    await sleep(1200); // the lens opens and travels to the centre row
    before = await page.evaluate(killListMarkup);
    lensBefore = await page.evaluate(lensState);
    beforeY = await page.evaluate(() => Math.round(scrollY));
    await page.click("#deadeye-call");
    await page.waitForSelector('#kill-list[data-deadeye="on"]', { timeout: 8000 });
    await sleep(500);
    const r = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#kill-list li[data-verdict="killed"]')];
      const a = rows[0]?.getBoundingClientRect();
      const b = rows.at(-1)?.getBoundingClientRect();
      return { game: document.documentElement.getAttribute("data-game"), top: a?.top, bottom: b?.bottom, vh: innerHeight, n: rows.length };
    });
    set("de.start", r.game === "deadeye" && r.n === killed.length && r.top >= 0 && r.top < r.vh, r);
  });

  await run("de.time", async () => {
    const r = await page.evaluate(() => ({
      css: document.getElementById("kill-list").style.getPropertyValue("--time-scale"),
      slowed: document.getAnimations().filter((a) => Math.abs(a.playbackRate - 0.25) < 1e-6).length,
    }));
    set("de.time", r.css === "0.25", r);
  });

  await run("de.grade", async () => {
    const r = await page.evaluate(() => {
      const s = document.getElementById("kill-list");
      const g = s.querySelector('[data-deadeye-layer="grade"]');
      const cs = getComputedStyle(s);
      return { hidden: g?.hidden, z: g ? getComputedStyle(g).zIndex : null, bg: cs.backgroundColor, transition: cs.transitionProperty };
    });
    set("de.grade", r.hidden === false && r.z === "-1" && r.bg === bg0 && !/background/.test(r.transition), { ...r, bg0 });
  });

  await run("de.targets", async () => {
    await page.click('#kill-list li[data-verdict="survived"] [data-name], #kill-list li[data-verdict="flagship"] [data-name]');
    await sleep(150);
    const r0 = await page.evaluate(() => ({
      marks: document.querySelectorAll('[data-deadeye-layer="marks"] > *').length,
      note: document.querySelector(".de-hud")?.textContent ?? "",
    }));
    // the five targets in one go (the 5.0 s core is short for a headless click each)
    const n = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#kill-list li[data-verdict="killed"]')];
      for (const li of rows) li.querySelector("[data-reason]")?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return rows.length;
    });
    await sleep(250);
    const marks = await page.evaluate(() => document.querySelectorAll('[data-deadeye-layer="marks"] > *').length);
    set("de.targets", r0.marks === 0 && (survivor ? r0.note.includes(survivor) : true) && marks === n, { ...r0, marks, n });
  });

  await run("de.fire", async () => {
    await page.focus('#kill-list li[data-verdict="killed"] h3 button');
    await page.keyboard.press("Shift+Enter");
    await sleep(900);
    const r = await page.evaluate(() => ({
      struck: document.querySelectorAll("#kill-list li[data-deadeye-struck]").length,
      hud: document.querySelector(".de-hud .de-read p")?.textContent ?? "",
      phase: document.querySelector(".de-hud")?.getAttribute("data-phase"),
    }));
    set("de.fire", r.struck === killed.length && r.phase === "read" && r.hud.startsWith(`${killed.length}/5 marked`), r);
  });

  await run("de.read", async () => {
    const r = await page.evaluate(() =>
      [...document.querySelectorAll("#kill-list li[data-deadeye-struck]")].map((li) => ({
        reason: li.querySelector("[data-reason]")?.textContent?.trim(),
        href: li.querySelector("a")?.href,
      })),
    );
    const reasonsOk = killed.every((k, i) => r[i]?.reason === k.reason);
    const linksOk = r.every((x, i) => x.href === hrefs0[i]);
    set("de.read", reasonsOk && linksOk, { rows: r });
  });

  await run("de.store", async () => {
    const r = await page.evaluate(() => ({
      games: JSON.parse(localStorage.getItem("aryan:games:v1") ?? "null"),
      hunt: JSON.parse(localStorage.getItem("aryan:hunt:v1") ?? "null"),
    }));
    set("de.store", r.games?.deadeye?.n === killed.length && typeof r.hunt?.deadEye === "number", r);
  });

  await run("de.release", async () => {
    await page.keyboard.press("Escape");
    await sleep(600);
    // the grade fades out over 300 ms (run.ts), then clears; its \`finished\` lands late at headless frame rates
    await page
      .waitForFunction(() => [...document.querySelectorAll("#kill-list [data-deadeye-layer]")].every((l) => l.hidden && !l.childElementCount), null, { timeout: 4000 })
      .catch(() => {});
    // back where the baseline was read (the round brings the killed block into view), no row hovered
    const releasedY = await page.evaluate(() => Math.round(scrollY));
    if (beforeY !== null && beforeY !== releasedY) {
      await page.evaluate((y) => {
        const l = window.__lenis;
        if (l) l.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo({ top: y, behavior: "instant" });
      }, beforeY);
    }
    await page.mouse.move(8, Math.round(ctx.vw.height / 2));
    await sleep(1200);
    const after = await page.evaluate(killListMarkup);
    const game = await gameAttr();
    // (killListMarkup leaves out the ledger's own interaction state and the binders' transient state)
    const left = await page.evaluate(() => ({
      de: document.querySelectorAll("#kill-list [data-de], #kill-list [data-deadeye-struck], #kill-list [data-deadeye-id], #kill-list [data-dead-eye]").length,
      on: document.getElementById("kill-list").hasAttribute("data-deadeye"),
      layers: [...document.querySelectorAll("#kill-list [data-deadeye-layer]")].map((l) => ({ hidden: l.hidden, kids: l.childElementCount })),
      time: document.getElementById("kill-list").style.getPropertyValue("--time-scale"),
    }));
    const same = after === before;
    let at = 0;
    if (!same) while (at < before.length && before[at] === after[at]) at++;
    const clean = left.de === 0 && !left.on && left.layers.every((l) => l.hidden && l.kids === 0) && left.time === "";
    const ys = { beforeY, releasedY, lens: { before: lensBefore, after: await page.evaluate(lensState) } };
    set("de.release", same && clean && game === null, same ? { game, ...left, ...ys } : { game, ...left, ...ys, at, before: before.slice(at - 60, at + 80), after: after.slice(at - 60, at + 80) });
  });

  await run("de.roving", async () => {
    await page.click("#deadeye-call");
    await page.waitForSelector('#kill-list[data-deadeye="on"]', { timeout: 8000 });
    await sleep(300);
    await page.focus('#kill-list li[data-verdict="killed"] h3 button');
    const seen = [];
    for (let i = 0; i < killed.length + 1; i++) {
      await page.keyboard.press("ArrowDown");
      seen.push(await page.evaluate(() => document.activeElement?.closest("li")?.getAttribute("data-verdict") ?? null));
    }
    await page.keyboard.press("ArrowUp");
    seen.push(await page.evaluate(() => document.activeElement?.closest("li")?.getAttribute("data-verdict") ?? null));
    set("de.roving", seen.every((v) => v === "killed"), { seen });
    await page.click(".de-hud button:last-of-type");
    await sleep(500);
  });

  let inpSoFar = 0;
  let inpWorstSoFar = null;
  await run("rows.read", async () => {
    await page.evaluate(() => localStorage.setItem("aryan:hunt:v1", JSON.stringify({ v: 1, found: {}, rows: [] })));
    // the ledger keeps the rows it already counted in memory (a reset store is not re-read): start a fresh view
    // (keep the Event Timing maximum so far: the reload resets it)
    [inpSoFar, inpWorstSoFar] = await page.evaluate(() => [window.__gamesInp ?? 0, window.__gamesInpWorst ?? null]);
    await ctx.goto();
    await sleep(1500);
    await page.evaluate(() => document.getElementById("kill-list")?.scrollIntoView({ block: "start", behavior: "instant" }));
    await sleep(400);
    // the centre line must pass the last row's bottom
    const { end, minH } = await page.evaluate(() => {
      const rows = [...document.querySelectorAll("[data-ledger] li[data-row]")];
      const last = rows[rows.length - 1]?.getBoundingClientRect();
      return {
        end: last ? Math.round(last.bottom + scrollY - innerHeight / 2 + 40) : 0,
        minH: Math.round(Math.min(...rows.map((r) => r.getBoundingClientRect().height))),
      };
    });
    // each notch at most half the shortest row, and the glide AT REST (+ 2 drawn frames) before the next:
    // the centre line then rests inside every row at least once. At a starved headless frame rate a
    // timed 100 px / 120 ms wheel let a row cross the line between two frames (9/10 read)
    const notch = Math.max(20, Math.min(100, Math.floor(minH / 2)));
    await page.mouse.move(8, Math.round(ctx.vw.height / 2));
    let notches = 0;
    for (; notches < 400; notches++) {
      if ((await page.evaluate(() => scrollY)) >= end) break;
      await page.mouse.wheel(0, notch);
      await page.evaluate(async () => {
        const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
        await frame();
        await frame();
        const t0 = performance.now();
        // "smooth" only: Lenis 1.3 can leave isScrolling stuck at "native" (zero-velocity native scroll)
        while (window.__lenis?.isScrolling === "smooth" && performance.now() - t0 < 3000) await frame();
        await frame();
        await frame();
      });
    }
    await sleep(600);
    const r = await page.evaluate(() => {
      const rows = JSON.parse(localStorage.getItem("aryan:hunt:v1") ?? "null")?.rows ?? [];
      return {
        rendered: document.querySelectorAll("[data-ledger] li[data-row]").length,
        read: rows.length,
        scrollY: Math.round(scrollY),
      };
    });
    set("rows.read", r.rendered > 0 && r.read >= r.rendered, { ...r, end, notch, notches, minRowH: minH });
  });

  await run("inp", async () => {
    const [now, worstNow] = await page.evaluate(() => [window.__gamesInp ?? null, window.__gamesInpWorst ?? null]);
    const inp = now === null ? null : Math.max(now, inpSoFar);
    set("inp", inp !== null && inp <= 200, { maxEventMs: inp, worst: now !== null && now >= inpSoFar ? worstNow : inpWorstSoFar });
  });

  await run("phone", async () => {
    const p = await ctx.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await p.goto(ctx.url(), { waitUntil: "load" });
    await sleep(1200);
    const r = await p.evaluate(() => ({
      pills: ["#drone-takeoff", "#deadeye-call"].map((s) => {
        const el = document.querySelector(s);
        return el ? getComputedStyle(el).display : "absent";
      }),
      game: Boolean(document.querySelector(".drone-game, .de-hud")),
    }));
    set("phone", r.pills.every((d) => d === "none" || d === "absent") && !r.game, r);
  });

  const pass = Object.values(checks).every((c) => c.pass);
  return { pass, checks };
}
