// tools/capture/probes/plates-live.mjs: every plate moves: live plates, camera, depth (P3-5).
// Owner: W2-PLATES (PHASE3-PLAN §4.7, §6.3; spec §13 P3-5 #1, #4, #6).
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).
// A full run takes ≈ 90–150 s: pass --timeout=240000 to the runner.
//
// Runs (skip any with --plates-skip=live,rm,pause,phone,lab):
//   live   ctx.vw (1440×900 by default), motion on, `/?skip=intro`: wheel-scroll top → bottom
//          (`--notch=140` px every `--pace=140` ms) sampling every `--every=250` ms. A FILM PLATE is a
//          stage layer, a <LivePlate>, or a MediaFrame showing /media/films/ (not inside either). For
//          every plate ≥ 25% on screen and shown (checkVisibility: opacity / visibility) for ≥ 1 s
//          continuously, the run must show it LIVE: a decoding <video> inside it (a loop), its
//          transform signature (itself, its ancestors, its camera / depth / stage-cam layers)
//          changing (a camera move), or a <canvas> in its host while the page moves (a scrub or the
//          GL layer). P3-5 #4. W2 scope = the stage, the cards and the hero (`dead` fails); every
//          other host is W3 (`deadOther`, reported). Also: ≤ 1 decoding video at every sample, the
//          media requests and their encodes (P3-5 #1: the network shows the chosen encode; with
//          window.__codecPicks), and window.__seqMem at every sample (P3-5 #6: ≤ 128 MB decoded).
//   rm     reducedMotion "reduce": the same scroll by scrollTo steps: 0 video requests, 0 decoding
//          videos, no camera / depth transform, no weather sprite, no stage root.
//   pause  motion on, at the first split window (or the first stage layer): press the header's
//          Pause control: 0 decoding videos and 0 running weather animations within 100 ms, no
//          camera / depth transform within 300 ms, 0 new video requests while scrolling 1.5 s;
//          then resume.
//   phone  390×844 touch: 0 video requests, no stage root, no weather, no camera transform.
//   lab    /lab/p3/plates (window.__platesLab): the progress camera reaches scale(1.35) at p 1,
//          the depth's far band moves off identity, the four weathers run, the sequence window
//          decodes ≤ 25 frames and ≤ 128 MB (headless decodes are software: --lab-seq-ms=12000).
// pass = live.dead = 0 && live.maxPlaying ≤ 1 && seq ≤ 128 MB && rm && pause && phone && lab.

const MB = 1024 * 1024;
const SEQ_MAX = 128 * MB;
const isVideo = (u) => /\.(mp4|webm)(\?|#|$)/i.test(u);

/** One sample of every on-screen film plate (runs in the page). */
function sampler() {
  const W = innerWidth;
  const H = innerHeight;
  const FILM = /%2Fmedia%2Ffilms%2F|\/media\/films\//;
  window.__plProbeN = window.__plProbeN || 0;
  const idOf = (el) => el.dataset.plProbe || (el.dataset.plProbe = String(++window.__plProbeN));
  const shown = (el) =>
    typeof el.checkVisibility === "function" ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true;
  const frac = (el) => {
    const r = el.getBoundingClientRect();
    const w = Math.max(0, Math.min(r.right, W) - Math.max(r.left, 0));
    const h = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0));
    const a = r.width * r.height;
    return a > 0 ? (w * h) / a : 0;
  };
  const chain = (el) => {
    const out = [];
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const t = getComputedStyle(n).transform;
      if (t && t !== "none") out.push(t);
    }
    return out.join("|");
  };
  const inner = (el) =>
    [...el.querySelectorAll(".plate-cam, .plate-depth-far, .plate-far, .stage-cam")]
      .map((n) => getComputedStyle(n).transform)
      .join("|");
  const decoding = (v) => !v.paused && !v.ended && v.readyState >= 2;
  const hostOf = (el) => {
    if (el.closest(".stage-root, [data-stage-window-host]")) return "stage";
    if (el.closest("[data-act-card], [data-act-card-frame]")) return "card";
    const s = el.closest("[data-section]")?.getAttribute("data-section") ?? null;
    if (s === "top" || el.closest("#top, [data-hero]")) return "hero";
    return s ? `section:${s}` : "other";
  };
  const cands = new Set();
  document.querySelectorAll(".stage-layer, [data-live-plate]").forEach((e) => cands.add(e));
  document.querySelectorAll("[data-media]").forEach((e) => {
    if (!e.closest("[data-live-plate], .stage-root, [data-stage-window-host]")) cands.add(e);
  });
  const plates = [];
  for (const el of cands) {
    const stage = el.classList.contains("stage-layer");
    if (!stage) {
      const img = el.querySelector("img");
      const v = el.querySelector("video");
      const src = `${img?.getAttribute("src") ?? ""} ${img?.getAttribute("srcset") ?? ""} ${v?.currentSrc ?? ""}`;
      if (!FILM.test(src)) continue;
    }
    if (frac(el) < 0.25 || !shown(el)) continue;
    const box = el.closest("[data-act-card-frame]") ?? el.closest("[data-section]") ?? el.parentElement;
    plates.push({
      id: idOf(el),
      media: el.getAttribute("data-live-plate") ?? el.getAttribute("data-media") ?? (stage ? `stage-${el.getAttribute("data-stage-layer")}` : "?"),
      host: hostOf(el),
      sig: `${chain(el)}#${inner(el)}`,
      play: [...el.querySelectorAll("video")].some(decoding),
      canvas: Boolean(box?.querySelector("canvas")),
      state:
        el.getAttribute("data-media-state") ??
        ([...el.querySelectorAll("[data-media-state]")].map((m) => m.getAttribute("data-media-state")).join("+") || null),
    });
  }
  return {
    t: Math.round(performance.now()),
    y: Math.round(scrollY),
    plates,
    playing: [...document.querySelectorAll("video")].filter(decoding).length,
    seq: window.__seqMem ? { ...window.__seqMem } : null,
  };
}

/** The static state the RM / phone runs require (runs in the page). */
function staticState() {
  // a camera / depth layer that is shown and off identity (hidden stage layers keep theirs)
  const moved = [...document.querySelectorAll(".plate-cam, [data-camera], .plate-depth-far, .plate-far")].filter((n) => {
    if (typeof n.checkVisibility === "function" && !n.checkVisibility({ visibilityProperty: true })) return false;
    const t = n.style.transform || getComputedStyle(n).transform;
    return t && t !== "none" && !/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(t);
  }).length;
  return {
    playing: [...document.querySelectorAll("video")].filter((v) => !v.paused && !v.ended && v.readyState >= 2).length,
    videos: document.querySelectorAll("video").length,
    weather: document.querySelectorAll(".plate-weather").length,
    stageRoot: Boolean(document.querySelector(".stage-root")),
    moved,
  };
}

/** Continuous on-screen runs per plate → the verdicts. */
function judge(samples) {
  const open = new Map();
  const done = [];
  for (const s of samples) {
    const ids = new Set();
    for (const p of s.plates) {
      ids.add(p.id);
      let r = open.get(p.id);
      if (!r) {
        r = { id: p.id, media: p.media, host: p.host, t0: s.t, t1: s.t, sigs: new Set(), played: false, canvas: false, ys: new Set(), states: new Set() };
        open.set(p.id, r);
      }
      r.t1 = s.t;
      r.sigs.add(p.sig);
      r.played ||= p.play;
      r.canvas ||= p.canvas;
      r.ys.add(s.y);
      if (p.state) r.states.add(p.state);
    }
    for (const [id, r] of open) {
      if (!ids.has(id)) {
        done.push(r);
        open.delete(id);
      }
    }
  }
  done.push(...open.values());
  const W2 = new Set(["stage", "card", "hero"]);
  const verdicts = done
    .filter((r) => r.t1 - r.t0 >= 1000)
    .map((r) => {
      const how = r.played ? "loop" : r.sigs.size > 1 ? "camera" : r.canvas && r.ys.size > 1 ? "canvas" : "dead";
      return { media: r.media, host: r.host, ms: r.t1 - r.t0, how, states: [...r.states] };
    });
  const count = (list) => list.reduce((a, v) => ({ ...a, [v.how]: (a[v.how] ?? 0) + 1 }), {});
  const dead = verdicts.filter((v) => v.how === "dead" && W2.has(v.host));
  const deadOther = verdicts.filter((v) => v.how === "dead" && !W2.has(v.host));
  return {
    plates: verdicts.length,
    byHow: count(verdicts),
    byHost: verdicts.reduce((a, v) => ({ ...a, [v.host]: (a[v.host] ?? 0) + 1 }), {}),
    dead,
    deadOther,
    sample: verdicts.slice(0, 40),
  };
}

async function sampleWhile(page, every, until) {
  const samples = [];
  const stop = { v: false };
  const loop = (async () => {
    while (!stop.v) {
      const s = await page.evaluate(sampler).catch(() => null);
      if (s) samples.push(s);
      await page.waitForTimeout(every);
    }
  })();
  await until();
  stop.v = true;
  await loop;
  return samples;
}

async function wheelToBottom(page, notch, pace) {
  let last = -1;
  let still = 0;
  while (still < 6) {
    await page.mouse.wheel(0, notch);
    await page.waitForTimeout(pace);
    const y = await page.evaluate(() => Math.round(scrollY));
    still = y === last ? still + 1 : 0;
    last = y;
  }
}

async function stepToBottom(page, step = 600, pace = 80) {
  let last = -1;
  for (let i = 0; i < 400; i++) {
    const y = await page.evaluate((s) => {
      scrollBy(0, s);
      return Math.round(scrollY);
    }, step);
    if (y === last) break;
    last = y;
    await page.waitForTimeout(pace);
  }
}

function watchVideo(page) {
  const list = [];
  page.on("request", (r) => {
    if (isVideo(r.url())) list.push({ url: r.url().replace(/^https?:\/\/[^/]+/, ""), t: Date.now() });
  });
  return list;
}

export default async function probe(page, ctx) {
  const every = Number(ctx.args.every ?? 250);
  const notch = Number(ctx.args.notch ?? 140);
  const pace = Number(ctx.args.pace ?? 140);
  const skip = new Set(String(ctx.args["plates-skip"] ?? "").split(",").filter(Boolean));
  const out = {};
  let pass = true;
  const fail = (why) => {
    pass = false;
    (out.failures ??= []).push(why);
  };

  // — live —
  if (!skip.has("live")) {
    const vids = watchVideo(page);
    await ctx.goto("/?skip=intro", { waitUntil: "load" });
    await page.waitForTimeout(2500); // the ladder (steps 2–3: the engine, the stage)
    await page.mouse.move(ctx.vw.width / 2, ctx.vw.height / 2);
    const samples = await sampleWhile(page, every, async () => {
      await page.waitForTimeout(1500); // the hero at rest: its loop / pointer
      await wheelToBottom(page, notch, pace);
      await page.waitForTimeout(1000);
    });
    const verdict = judge(samples);
    const maxPlaying = samples.reduce((m, s) => Math.max(m, s.playing), 0);
    const seqPeak = samples.reduce((m, s) => Math.max(m, s.seq?.bytes ?? 0, s.seq?.peak ?? 0), 0);
    const picks = await page.evaluate(() => window.__codecPicks ?? null).catch(() => null);
    const urls = [...new Set(vids.map((v) => v.url))];
    out.live = {
      samples: samples.length,
      maxPlaying,
      ...verdict,
      seq: { peakMB: +(seqPeak / MB).toFixed(1), sampled: samples.some((s) => s.seq) },
      requests: { count: urls.length, webm: urls.filter((u) => /\.webm/i.test(u)).length, mp4: urls.filter((u) => /\.mp4/i.test(u)).length, urls: urls.slice(0, 30) },
      codecPicks: picks,
    };
    if (verdict.dead.length) fail(`live: ${verdict.dead.length} W2 plate(s) on screen ≥ 1 s with no loop, camera or canvas`);
    if (maxPlaying > 1) fail(`live: ${maxPlaying} videos decoding at once`);
    if (seqPeak > SEQ_MAX) fail(`live: sequence memory ${(seqPeak / MB).toFixed(1)} MB > 128`);
  }

  // — rm —
  if (!skip.has("rm")) {
    const p = await ctx.newPage({ viewport: ctx.vw, reducedMotion: "reduce" });
    const vids = watchVideo(p);
    await p.goto(ctx.url("/?skip=intro"), { waitUntil: "load" });
    await p.waitForTimeout(2500);
    await stepToBottom(p);
    await p.waitForTimeout(800);
    const st = await p.evaluate(staticState);
    out.rm = { ...st, requests: vids.length };
    if (vids.length || st.playing || st.moved || st.weather || st.stageRoot) fail("rm: video, motion, weather or the stage under reduced motion");
  }

  // — pause —
  if (!skip.has("pause")) {
    const p = await ctx.newPage({ viewport: ctx.vw });
    const vids = watchVideo(p);
    await p.goto(ctx.url("/?skip=intro"), { waitUntil: "load" });
    await p.waitForTimeout(2500);
    await p.mouse.move(ctx.vw.width / 2, ctx.vw.height / 2);
    // to the first split window, else the about backdrop
    const target = await p.evaluate(() => {
      const el = document.querySelector("[data-stage-window]") ?? document.getElementById("about");
      return el ? Math.round(el.getBoundingClientRect().top + scrollY - innerHeight * 0.2) : null;
    });
    if (target !== null) {
      for (let y = 0; y < target; y += 600) {
        await p.mouse.wheel(0, 600);
        await p.waitForTimeout(90);
      }
    }
    await p.waitForTimeout(2500);
    const before = await p.evaluate(staticState);
    const r = await p.evaluate(
      () =>
        new Promise((resolve) => {
          const btn = document.querySelector("header [data-motion-toggle]");
          if (!btn) return resolve({ button: false });
          const runningWeather = () =>
            document.getAnimations().filter((a) => a.playState === "running" && a.effect?.target?.closest?.(".plate-weather")).length;
          const playing = () => [...document.querySelectorAll("video")].filter((v) => !v.paused && !v.ended).length;
          const moved = () =>
            [...document.querySelectorAll(".plate-cam, [data-camera], .plate-depth-far")].filter(
              (n) => n.style.transform && n.style.transform !== "none" && (typeof n.checkVisibility !== "function" || n.checkVisibility({ visibilityProperty: true })),
            ).length;
          const t0 = performance.now();
          btn.click();
          let at100 = null;
          const f = () => {
            const t = performance.now() - t0;
            if (at100 === null && t >= 100) at100 = { playing: playing(), weather: runningWeather() };
            if (t >= 300) return resolve({ button: true, at100, at300: { playing: playing(), weather: runningWeather(), moved: moved() } });
            setTimeout(f, 10);
          };
          f();
        }),
    );
    const n0 = vids.length;
    await p.mouse.wheel(0, 900);
    await p.waitForTimeout(1500);
    const after = vids.length - n0;
    out.pause = { before, ...r, requestsAfter: after };
    const ok = r.button && r.at100 && r.at100.playing === 0 && r.at100.weather === 0 && r.at300.moved === 0 && after === 0;
    if (!ok) fail("pause: video, weather or a camera transform outlived Pause (or new video requests)");
    if (r.button) await p.click("header [data-motion-toggle]").catch(() => {});
  }

  // — phone —
  if (!skip.has("phone")) {
    const p = await ctx.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const vids = watchVideo(p);
    await p.goto(ctx.url("/?skip=intro"), { waitUntil: "load" });
    await p.waitForTimeout(2000);
    await stepToBottom(p);
    await p.waitForTimeout(800);
    const st = await p.evaluate(staticState);
    out.phone = { ...st, requests: vids.length };
    if (vids.length || st.stageRoot || st.weather || st.moved) fail("phone: video bytes, the stage, weather or a camera transform on a phone");
  }

  // — lab —
  if (!skip.has("lab")) {
    const p = await ctx.newPage({ viewport: ctx.vw });
    await p.goto(ctx.url("/lab/p3/plates"), { waitUntil: "load" });
    await p.waitForFunction(() => Boolean(window.__platesLab), null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(2500); // ladder step 2: the engine
    const cam = await p.evaluate(async () => {
      window.__platesLab?.p(1);
      await new Promise((r) => setTimeout(r, 700));
      const el = document.querySelector('[data-camera="push"]');
      return el ? el.style.transform : null;
    });
    const far = await p.evaluate(async () => {
      window.__platesLab?.depth(0);
      await new Promise((r) => setTimeout(r, 700));
      const el = document.querySelector("[data-lab-depth] .plate-depth-far");
      return el ? el.style.transform : null;
    });
    const weather = await p.evaluate(() =>
      [...document.querySelectorAll("[data-plates-lab] .plate-weather")].map((w) => ({
        kind: w.getAttribute("data-weather"),
        dots: w.children.length,
        running: w.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
      })),
    );
    await p.evaluate(() => window.__platesLab?.seq(true, 0.5));
    const seqMs = Number(ctx.args["lab-seq-ms"] ?? 12000);
    const seq = await p
      .waitForFunction(() => document.querySelector("[data-seq-lab]")?.textContent?.includes("ready") && !document.querySelector("[data-seq-lab]")?.textContent?.includes("not ready"), null, { timeout: seqMs })
      .then(() => true, () => false);
    const mem = await p.evaluate(() => window.__seqMem ?? null);
    const states = await p.evaluate(() =>
      [...document.querySelectorAll("[data-plates-lab] [data-live-plate]")].map((el) => ({
        media: el.getAttribute("data-live-plate"),
        mode: el.getAttribute("data-plate"),
        states: [...el.querySelectorAll("[data-media-state]")].map((m) => `${m.getAttribute("data-media")}:${m.getAttribute("data-media-state")}`),
      })),
    );
    out.lab = { cameraAtP1: cam, depthFarAt0: far, weather, seqReady: seq, seqMem: mem, plates: states };
    const camOk = typeof cam === "string" && /scale\(1\.35/.test(cam);
    const farOk = typeof far === "string" && far !== "" && !/translate3d\(0\.000%, 0\.000%, 0\) scale\(1\.0000\)/.test(far);
    const wOk = weather.length === 4 && weather.every((w) => w.dots > 0 && w.running > 0);
    const memOk = !mem || (mem.bytes <= SEQ_MAX && mem.frames <= 25);
    if (!camOk) fail("lab: the progress camera did not reach scale(1.35) at p 1");
    if (!farOk) fail("lab: the depth far band did not move");
    if (!wOk) fail("lab: a weather layer is missing or not running");
    if (!memOk) fail("lab: the sequence window holds > 25 frames or > 128 MB");
    if (!seq) (out.notes ??= []).push("lab: the sequence window was not ready within --lab-seq-ms (software decode is slow headless)");
  }

  return { pass, ...out };
}
