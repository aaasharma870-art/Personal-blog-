/* ============================================================================
   PROLOGUE CONTROLLER — SOURCE (SPEC v2 §5; research/build/bars/intro.BAR.md).
   Served MINIFIED as public/intro/intro.js (SPEC §5.1 wants a tiny module):
   after editing this file run   node components/intro/build-controller.mjs
   (the page's ?v= cache-buster is the served file's content hash, and a dev
   build warns when the served file is stale).
   Vanilla, no React, no imports: injected by the pre-paint head script
   (components/intro/intro-head-script.tsx) only when html.intro-armed was
   set, so Play / Skip / Esc work before hydration. Everything it knows comes
   from <script type="application/json" id="intro-data"> (components/intro/
   intro-model.ts): plates, broom masks, the flight, the baked trail, timings,
   curves. It holds no copy, no titles and no timings of its own.

   Owns: the one canvas (plate, candle sprites, motes, light trail, LD-HP),
   the one video (IN-02), and the state machine
     armed (S0/S0a/S0b/S0c) → launch (S1) → wait (S1w) → flight (S2) |
     code (S2c, dome exit) → landing (S3) → end (S4)      · leaving (SX)
   Hydration contract: it writes only (a) classes / data-intro on <html>,
   (b) the children and styles of #intro-stage (opaque innerHTML to React),
   (c) the text of #intro-status (suppressed), (d) `inert` on the page behind,
   and only after IntroBridge reports hydration, (e) the favicon href, also
   only after hydration; all other motion runs through the Web Animations API.
   Public: window.__introCtl = { arm, onHydrated, state }. Events:
   window "intro:end" {played, reason}; html[data-intro="played|skipped"].
   Performance marks: intro:arm (head) · ready · play · flight · landing ·
   dismiss · end.
   ========================================================================== */
(function (w, d) {
  "use strict";
  if (w.__introCtl) return;

  var R = d.documentElement, M = Math, PI = M.PI;
  var SCROLL = { PageDown: 1, PageUp: 1, ArrowDown: 1, ArrowUp: 1, Home: 1, End: 1, " ": 1, Spacebar: 1 };
  var CLASSES = ["intro-armed", "intro-launched", "intro-waiting", "intro-landing", "intro-sweep", "intro-bookend", "intro-kbd"];
  var BOLT = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#e9b44c" d="M19.5 1.5 6.5 18h8.2l-2.9 12.5L25.5 13h-8.3z"/></svg>');

  var C, intro, stage, play, skip, lensL, lensR, statusEl, statusText, broom;
  var st = "idle", inited = false, hydrated = !!w.__introHydrated;
  var cv = null, cx = null, dpr = 1, W = 0, H = 0;
  var plate = null, fitP = null, img = null, imgFor = "", imgOk = false, showPlate = false, plateAt = -1;
  var lite = false, fine = false, video = null, vPlaying = false;
  var sprites = null, cands = [], motes = null, trail = [], lastEmit = null, h1Rect = null;
  var hover = false, kfocus = false, gat = 0, gFrom = 0, gTo = 0, gAt = -1;
  var armAt = 0, launchAt = 0, awakeUntil = 0, clock = 0, last = 0;
  var par = [0, 0], parTo = [0, 0];
  var raf = 0, timers = [], offs = [], inertEls = [], favs = null;
  var modality = "", hiddenAt = 0, touch = null, loaderAt = -1, loader = null;
  var code = null, patch = null, domeOn = false;
  var E, ED;

  var ctl = { arm: arm, onHydrated: onHydrated, state: function () { return st; } };
  w.__introCtl = ctl;

  /* — small helpers ———————————————————————————————————————————————— */
  function now() { return performance.now(); }
  function mark(n) { try { performance.mark("intro:" + n); } catch { /* no-op */ } }
  function setState(s) { st = s; w.__introState = s; }
  function on(t, type, fn, o) { t.addEventListener(type, fn, o); offs.push(function () { t.removeEventListener(type, fn, o); }); }
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function ses(k, v) { try { w.sessionStorage.setItem(k, v); } catch { /* storage blocked */ } }
  function focus(el) { if (el) try { el.focus({ preventScroll: true }); } catch { /* no-op */ } }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function curve(a) { return "cubic-bezier(" + a.join(",") + ")"; }
  function canvas(cw, ch) { var c = d.createElement("canvas"); c.width = M.max(1, M.round(cw)); c.height = M.max(1, M.round(ch)); return c; }

  /** cubic-bezier(x1,y1,x2,y2) → easing function (Newton, bisection fallback). */
  function bez(a) {
    var x1 = a[0], y1 = a[1], x2 = a[2], y2 = a[3];
    function f(t, p1, p2) { return ((1 - 3 * p2 + 3 * p1) * t + (3 * p2 - 6 * p1)) * t * t + 3 * p1 * t; }
    function df(t) { return (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + 3 * x1; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i, e, s;
      for (i = 0; i < 8; i++) {
        e = f(t, x1, x2) - x;
        if (M.abs(e) < 1e-5) break;
        s = df(t);
        if (M.abs(s) < 1e-6) break;
        t -= e / s;
      }
      if (t < 0 || t > 1 || M.abs(f(t, x1, x2) - x) > 1e-3) {
        var lo = 0, hi = 1;
        for (i = 0; i < 24; i++) { t = (lo + hi) / 2; if (f(t, x1, x2) < x) lo = t; else hi = t; }
      }
      return f(t, y1, y2);
    };
  }

  /** object-fit: cover of an iw×ih image into the W×H stage at `pos`. */
  function fit(iw, ih, pos) {
    var s = M.max(W / iw, H / ih), fw = iw * s, fh = ih * s;
    return { x: (W - fw) * pos[0], y: (H - fh) * pos[1], w: fw, h: fh };
  }
  function at(m, u) { return [m.x + u[0] * m.w, m.y + u[1] * m.h]; }

  function anim(el, frames, ms, ease, done) {
    var a = null;
    try { a = el.animate(frames, { duration: ms, easing: curve(ease), fill: "forwards" }); } catch { /* no WAAPI */ }
    if (done) {
      if (a) a.onfinish = done;
      later(done, ms + 150); // fallback (hidden tab, no WAAPI); done() is idempotent
    }
    return a;
  }

  /* — boot ———————————————————————————————————————————————————————— */
  function init() {
    if (inited) return true;
    var data = d.getElementById("intro-data");
    intro = d.getElementById("intro");
    if (!data || !intro) return false;
    try { C = JSON.parse(data.textContent); } catch { return false; }
    stage = d.getElementById("intro-stage");
    play = d.getElementById("intro-play");
    skip = d.getElementById("intro-skip");
    if (!stage || !play || !skip) return false;
    statusEl = d.getElementById("intro-status");
    statusText = statusEl ? statusEl.textContent : "";
    lensL = play.querySelector(".intro-lens-l");
    lensR = play.querySelector(".intro-lens-r");
    broom = stage.querySelector(".intro-broom");
    E = bez(C.ease);
    ED = bez(C.easeDraw);
    play.addEventListener("click", function () { launch(); });
    skip.addEventListener("click", function () { dismiss("skip"); });
    play.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") { hover = true; intent(); } });
    play.addEventListener("pointerleave", function () { hover = false; intent(); });
    play.addEventListener("focus", function () { kfocus = modality === "key"; intent(); });
    play.addEventListener("blur", function () { kfocus = false; intent(); });
    inited = true;
    return true;
  }

  function onHydrated() {
    hydrated = true;
    if (st !== "idle") setInert(true);
  }

  /** S0: armed. Called at boot and by window.__intro.replay(). */
  function arm() {
    if (st !== "idle" || !R.classList.contains("intro-armed") || !init()) return;
    setState("armed");
    w.__introReady = true;
    mark("ready");
    R.removeAttribute("data-intro");
    armAt = last = now();
    awakeUntil = armAt + C.t.rest;
    clock = 0; hover = kfocus = false; gat = gFrom = gTo = 0; gAt = -1; modality = "";
    motes = null; trail = []; lastEmit = null; code = null; patch = null; domeOn = false; vPlaying = false;
    loaderAt = -1; showPlate = false; plateAt = -1; plate = null;

    var mm = w.matchMedia ? function (q) { return w.matchMedia(q); } : null;
    fine = !!(mm && mm("(pointer: fine)").matches);
    lite = !C.flight || w.innerWidth < 1024 || !fine || (navigator.hardwareConcurrency || 8) < 4 ||
      w.innerHeight > w.innerWidth;

    cv = d.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.tabIndex = -1;
    stage.appendChild(cv);
    cx = cv.getContext("2d");
    size();

    on(w, "keydown", onKey, true);
    on(w, "wheel", onWheel, { capture: true, passive: true });
    on(w, "touchstart", onTouch, { capture: true, passive: true });
    on(w, "touchmove", onTouch, { capture: true, passive: true });
    on(w, "pointerdown", function () { modality = "pointer"; R.classList.remove("intro-kbd"); }, true);
    on(w, "pointermove", onMove, { passive: true });
    on(w, "resize", function () { if (cv) { size(); kick(); } });
    on(d, "visibilitychange", onVis);
    on(d, "focusin", onFocusIn, true);
    if (mm) {
      var rq = mm("(prefers-reduced-motion: reduce)");
      if (rq.addEventListener) on(rq, "change", function () { if (rq.matches) finish(false, "motion"); });
    }
    if (w.MutationObserver) {
      var mo = new MutationObserver(function () { if (R.getAttribute("data-motion") === "paused") finish(false, "motion"); });
      mo.observe(R, { attributes: true, attributeFilter: ["data-motion"] });
      offs.push(function () { mo.disconnect(); });
    }

    if (hydrated) setInert(true);
    focus(play);
    // text boxes move when the web fonts swap in: re-place the candles
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { if (st === "armed" && cv) { layoutCandles(); kick(); } });
    afterLoad(function () {
      if (st === "idle") return;
      loadPlate();
      if (!lite && fastNet()) ensureVideo();
    });
    kick();
    if (w.__introQueued === "play") { w.__introQueued = null; launch(); }
  }

  function afterLoad(fn) {
    var go = function () {
      if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 800 });
      else later(fn, 1);
    };
    if (d.readyState === "complete") go();
    else on(w, "load", go);
  }

  function fastNet() {
    var c = navigator.connection;
    return !c || (!c.saveData && (!c.effectiveType || c.effectiveType === "4g"));
  }

  /* — layout ——————————————————————————————————————————————————————— */
  function size() {
    W = intro.clientWidth || w.innerWidth;
    H = intro.clientHeight || w.innerHeight;
    var nd = M.min(2, w.devicePixelRatio || 1);
    cv.width = M.round(W * nd);
    cv.height = M.round(H * nd);
    cx.setTransform(nd, 0, 0, nd, 0, 0);
    if (!sprites || nd !== dpr) { dpr = nd; sprites = mkSprites(); }
    if (st === "armed") {
      var p = H > W ? C.plateM : C.plate;
      if (p !== plate) {
        plate = p;
        if (img && imgFor !== p.src) { showPlate = false; plateAt = -1; loadPlate(); }
      }
      layoutCandles();
    }
    fitP = fit(plate.w, plate.h, plate.pos);
  }

  function box(r, pad) { return { l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad }; }
  function hits(a, b) { return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t; }

  /** 12 ring candles around the bracket (never over a text box, I18) plus
   *  the ambient sprites, placed by a fixed-seed PRNG (repeatable frames). */
  function layoutCandles() {
    var cc = C.candle, texts = [], i, els = intro.querySelectorAll(".intro-meta,.intro-lines,.intro-play-face,.intro-skip");
    for (i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.width && r.height) texts.push(box(r, 10));
    }
    var pr = play.getBoundingClientRect(), pb = box(pr, 24);
    var seed = 20260928;
    var rnd = function () {
      seed = (seed + 0x6d2b79f5) | 0;
      var t = M.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + M.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    var hz = function () { return 2 * PI * (cc.bobHz[0] + rnd() * (cc.bobHz[1] - cc.bobHz[0])); };
    var rectAt = function (x, y, z) {
      var s = sprites.c[z];
      return { l: x - s.ax, t: y - s.ay, r: x - s.ax + s.w, b: y - s.ay + s.h };
    };
    var free = function (x, y, z) {
      var q = rectAt(x, y, z);
      if (q.l < 4 || q.t < 4 || q.r > W - 4 || q.b > H - 4) return false;
      for (var k = 0; k < texts.length; k++) if (hits(q, texts[k])) return false;
      return true;
    };
    var ox = pr.left + pr.width / 2, oy = pr.top + pr.height / 2;
    var ring = function (a, rad) { return [ox + M.cos(a) * (pr.width / 2 + rad), oy + M.sin(a) * (pr.height / 2 + rad)]; };

    cands = [];
    var valid = [], n = 48;
    for (i = 0; i < n; i++) { // jittered, so the ring reads as hovering candles, not a dial
      var a = ((i + (rnd() - 0.5) * 0.6) / n) * 2 * PI, zi = rnd() < 0.4 ? 0 : 1;
      var rest = ring(a, cc.ringRest + (rnd() - 0.5) * 44), g = ring(a, cc.ringGather + (rnd() - 0.5) * 16);
      if (free(rest[0], rest[1], zi) && free(g[0], g[1], zi)) valid.push([rest, g, zi]);
    }
    var k = M.min(cc.ring, valid.length);
    for (i = 0; i < k; i++) {
      var v = valid[M.floor((i * valid.length) / k)];
      cands.push({ ring: 1, x: v[0][0], y: v[0][1], gx: v[1][0], gy: v[1][1], z: v[2], dep: 0.5, ph: rnd() * 2 * PI, f: hz(), dx: 0 });
    }
    var want = lite ? cc.ambientLite : cc.ambient, tries = 0;
    while (cands.length < k + want && tries++ < 600) {
      var x = rnd() * W, y = (0.05 + rnd() * 0.9) * H, z = rnd() < 0.45 ? 0 : rnd() < 0.7 ? 1 : 2;
      if (!free(x, y, z) || hits(rectAt(x, y, z), pb)) continue;
      var ok = true;
      for (var j = 0; j < cands.length && ok; j++) if (M.abs(cands[j].x - x) + M.abs(cands[j].y - y) < 70) ok = false;
      if (!ok) continue;
      cands.push({ ring: 0, x: x, y: y, z: z, dep: 0.3 + z * 0.35, ph: rnd() * 2 * PI, f: hz(), dx: (rnd() * 2 - 1) * 6 });
    }
  }

  /* — sprites (pre-rendered once per DPR; the only luminous paint) ——— */
  function sprite(sw, sh, draw) {
    var c = canvas(sw * dpr, sh * dpr), g = c.getContext("2d");
    g.scale(dpr, dpr);
    draw(g);
    return c;
  }
  /** IC-HP-03 floating candle: cream taper, flame, warm halo (no holder). */
  function candle(k) {
    var th = k * 3.4, fh = k * 1.5, hr = k * 3.6, sw = M.ceil(hr * 2), sh = M.ceil(hr + fh * 0.5 + th + 2);
    var fx = sw / 2, fy = hr, ty = fy + fh * 0.5;
    var c = sprite(sw, sh, function (g) {
      var halo = g.createRadialGradient(fx, fy, 0, fx, fy, hr);
      halo.addColorStop(0, "rgba(255,204,140,.30)");
      halo.addColorStop(0.35, "rgba(255,176,96,.10)");
      halo.addColorStop(1, "rgba(255,160,80,0)");
      g.fillStyle = halo;
      g.fillRect(0, 0, sw, sh);
      var wax = g.createLinearGradient(fx - k / 2, 0, fx + k / 2, 0);
      wax.addColorStop(0, "#f3ead6");
      wax.addColorStop(0.6, "#e0d4bb");
      wax.addColorStop(1, "#b3a58a");
      g.fillStyle = wax;
      g.fillRect(fx - k / 2, ty, k, th);
      var lit = g.createLinearGradient(0, ty, 0, ty + th * 0.5);
      lit.addColorStop(0, "rgba(255,214,150,.55)");
      lit.addColorStop(1, "rgba(255,214,150,0)");
      g.fillStyle = lit;
      g.fillRect(fx - k / 2, ty, k, th * 0.5);
      g.fillStyle = "#3a2a1c";
      g.fillRect(fx - 0.4, ty - fh * 0.2, 0.8, fh * 0.22);
      g.beginPath();
      g.moveTo(fx, fy - fh * 0.62);
      g.bezierCurveTo(fx + fh * 0.28, fy - fh * 0.15, fx + fh * 0.26, fy + fh * 0.32, fx, fy + fh * 0.36);
      g.bezierCurveTo(fx - fh * 0.26, fy + fh * 0.32, fx - fh * 0.28, fy - fh * 0.15, fx, fy - fh * 0.62);
      var fl = g.createRadialGradient(fx, fy + fh * 0.15, 0, fx, fy, fh * 0.7);
      fl.addColorStop(0, "#fffbe8");
      fl.addColorStop(0.45, "#ffd98a");
      fl.addColorStop(1, "rgba(255,150,60,.85)");
      g.fillStyle = fl;
      g.fill();
    });
    return { c: c, w: sw, h: sh, ax: fx, ay: fy };
  }
  /** The lumos light (cool --w-lumos core): trail sprites and LD-HP's point. */
  function lumos(r) {
    var c = sprite(r * 2, r * 2, function (g) {
      var l = g.createRadialGradient(r, r, 0, r, r, r);
      l.addColorStop(0, "rgba(234,246,255,1)");
      l.addColorStop(0.16, "rgba(234,246,255,.85)");
      l.addColorStop(0.42, "rgba(190,226,255,.22)");
      l.addColorStop(1, "rgba(170,215,255,0)");
      g.fillStyle = l;
      g.fillRect(0, 0, r * 2, r * 2);
    });
    return { c: c, r: r };
  }
  /** A trail glow: large and soft, so the emitted sprites overlap into one
   *  stream of light (a string of separate dots reads as cheap). */
  function glow(r) {
    var c = sprite(r * 2, r * 2, function (g) {
      var l = g.createRadialGradient(r, r, 0, r, r, r);
      l.addColorStop(0, "rgba(234,246,255,.42)");
      l.addColorStop(0.25, "rgba(214,238,255,.22)");
      l.addColorStop(0.55, "rgba(190,226,255,.07)");
      l.addColorStop(1, "rgba(180,220,255,0)");
      g.fillStyle = l;
      g.fillRect(0, 0, r * 2, r * 2);
    });
    return { c: c, r: r };
  }
  function mkSprites() { return { c: [candle(5), candle(7), candle(10)], l: lumos(10), g: glow(26) }; }

  function drawSprite(s, x, y, a, k) {
    if (a <= 0.004) return;
    k = k || 1;
    cx.globalAlpha = a;
    cx.drawImage(s.c, x - s.ax * k, y - s.ay * k, s.w * k, s.h * k);
  }

  /* — plate ———————————————————————————————————————————————————————— */
  function loadPlate() {
    if (st === "idle" || !plate) return;
    var src = plate.src;
    if (img && imgFor === src) { if (imgOk) revealPlate(); return; }
    var im = new Image();
    img = im; imgFor = src; imgOk = false;
    im.decoding = "async";
    im.setAttribute("fetchpriority", "low");
    im.src = src;
    var done = function () { if (img === im) { imgOk = true; revealPlate(); } };
    if (im.decode) im.decode().then(done, function () { /* keep the night ground */ });
    else im.onload = done;
  }
  function revealPlate() {
    if (showPlate || (st !== "armed" && st !== "wait")) return;
    showPlate = true;
    plateAt = now();
    kick();
  }

  /* — S0b intent: hover or keyboard focus gathers the ring (focus parity) — */
  function intent() {
    if (st !== "armed") return;
    var to = hover || kfocus ? 1 : 0, t = now();
    if (to !== gTo) { gFrom = gat; gTo = to; gAt = t; }
    if (to) {
      awakeUntil = M.max(awakeUntil, t + C.t.rest);
      if (!lite) ensureVideo();
    }
    kick();
  }

  function candPos(c) {
    var cc = C.candle, x = c.x, y = c.y;
    if (c.ring) { x += (c.gx - c.x) * gat; y += (c.gy - c.y) * gat; }
    else x += c.dx * M.sin(clock * 0.2 + c.ph);
    x += par[0] * cc.parallaxPx * c.dep;
    y += par[1] * cc.parallaxPx * c.dep + M.sin(clock * c.f + c.ph) * cc.bobPx;
    return [x, y];
  }

  function onMove(e) {
    if (st !== "armed" || !fine || !W) return;
    parTo = [(e.clientX / W) * 2 - 1, (e.clientY / H) * 2 - 1];
    if (now() < awakeUntil) kick();
  }

  /* — frame loop: runs only while something moves (0 rAF at rest, I20) — */
  function kick() { if (!raf && st !== "idle") raf = w.requestAnimationFrame(frame); }

  function frame(t) {
    raf = 0;
    if (st === "idle" || !cx) return;
    var dt = M.min(64, M.max(0, t - last)), more = st !== "armed", i;
    last = t;
    var awake = st === "armed" && t < awakeUntil;
    if (awake) {
      clock += dt / 1000;
      var k = 1 - M.exp(-dt / 180);
      par[0] += (parTo[0] - par[0]) * k;
      par[1] += (parTo[1] - par[1]) * k;
      more = true;
    }
    if (gAt >= 0) {
      var gp = clamp01((t - gAt) / C.t.reveal);
      gat = gFrom + (gTo - gFrom) * E(gp);
      if (gp >= 1) gAt = -1;
      more = true;
    }

    cx.globalAlpha = 1;
    cx.clearRect(0, 0, W, H);
    if (showPlate && imgOk) {
      var pa = clamp01((t - plateAt) / C.t.preview);
      if (pa < 1) more = true;
      cx.globalAlpha = pa;
      cx.drawImage(img, fitP.x, fitP.y, fitP.w, fitP.h);
      if (patch) { // the swap is instant: the SVG broom takes the plate broom's exact pose
        cx.globalAlpha = 1;
        cx.drawImage(patch.c, 0, 0, W, H);
      }
    }

    if (st === "armed") {
      var ca = clamp01((t - armAt) / C.t.reveal);
      if (ca < 1) more = true;
      for (i = 0; i < cands.length; i++) {
        var p = candPos(cands[i]);
        drawSprite(sprites.c[cands[i].z], p[0], p[1], ca);
      }
    }
    if (motes) drawMotes(t);
    if (code) stepCode(t);
    if (st === "flight" && video) { emitVideo(t); checkLanding(); }
    if (st === "wait") waitStep(t);
    if (trail.length) drawTrail(t);

    cx.globalAlpha = 1;
    if (more && st !== "idle") kick();
  }

  /* — S1 launch ————————————————————————————————————————————————————— */
  function launch() {
    if (st !== "armed") return;
    setState("launch");
    mark("play");
    launchAt = now();
    focus(skip); // Play leaves the tab order; Skip stays through the flight
    R.classList.add("intro-launched");
    var rl = lensL && lensL.getBoundingClientRect(), rr = lensR && lensR.getBoundingClientRect();
    if (rl) anim(lensL, [{ transform: "none" }, { transform: "translateX(" + -(rl.right + 8) + "px)" }], C.t.hero, C.easeClip);
    if (rr) anim(lensR, [{ transform: "none" }, { transform: "translateX(" + (W - rr.left + 8) + "px)" }], C.t.hero, C.easeClip);
    motes = [];
    for (var i = 0; i < cands.length; i++) {
      var p = candPos(cands[i]);
      motes.push({ x: p[0], y: p[1], z: cands[i].z, ring: cands[i].ring, dl: cands[i].ring ? i * 14 : 0 });
    }
    if (lite) return codeFlight();
    var v = ensureVideo();
    if (v && ready(v)) videoFlight();
    else waitFor();
  }

  function broomCentre() {
    if (code) return code.pos;
    var m = fitP, p = plate;
    return [m.x + ((p.tip[0] + p.end[0]) / 2) * m.w, m.y + ((p.tip[1] + p.end[1]) / 2) * m.h];
  }

  /** The candles stream toward the broom (ring) or fade in place (ambient). */
  function drawMotes(t) {
    var e = t - launchAt, tg = broomCentre(), live = false;
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i], s = sprites.c[m.z];
      if (!m.ring) {
        var fa = 1 - clamp01(e / C.t.base);
        if (fa > 0) { live = true; drawSprite(s, m.x, m.y, fa); }
        continue;
      }
      var q = clamp01((e - m.dl) / (C.t.reveal - 120));
      if (q >= 1) continue;
      live = true;
      var k = E(q);
      drawSprite(s, m.x + (tg[0] - m.x) * k, m.y + (tg[1] - m.y) * k, 1 - q * q, 1 - 0.6 * q);
    }
    if (!live) motes = null;
  }

  /* — the flight video (IN-02) ———————————————————————————————————— */
  function ensureVideo() {
    if (video || lite || !C.flight || st === "idle") return video;
    var f = C.flight, v = d.createElement("video");
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("aria-hidden", "true");
    v.setAttribute("disablepictureinpicture", "");
    v.setAttribute("disableremoteplayback", "");
    v.tabIndex = -1;
    v.preload = "auto";
    var pos = (plate || C.plate).pos;
    v.style.objectPosition = pos[0] * 100 + "% " + pos[1] * 100 + "%";
    var add = function (src, type) { var s = d.createElement("source"); s.src = src; s.type = type; v.appendChild(s); };
    if (f.webm) add(f.webm, "video/webm");
    add(f.mp4, "video/mp4");
    stage.insertBefore(v, cv);
    video = v;
    return v;
  }
  function ready(v) { return v.readyState >= 4; }
  function killVideo() {
    var v = video;
    video = null;
    vPlaying = false;
    if (!v) return;
    try { v.pause(); } catch { /* no-op */ }
    while (v.firstChild) v.removeChild(v.firstChild);
    v.removeAttribute("src");
    try { v.load(); } catch { /* no-op */ }
    if (v.parentNode) v.parentNode.removeChild(v);
  }

  /* — S1w: the flight is not playable yet (real progress, never fake) —— */
  function waitFor() {
    setState("wait");
    var v = ensureVideo();
    if (!v) return codeFlight();
    v.addEventListener("canplaythrough", function () { if (st === "wait" && video === v) videoFlight(); });
    v.addEventListener("error", function () { if (st === "wait" && video === v) codeFlight(); }, true);
    later(function () {
      if (st !== "wait") return;
      R.classList.add("intro-waiting");
      loaderAt = now();
      var sr = statusEl ? statusEl.getBoundingClientRect() : null;
      loader = { x: W / 2, y: sr && sr.height ? sr.top - 22 : H - 96 };
      if (statusEl) { // re-set so the now-visible status region is announced
        statusEl.textContent = "";
        later(function () { if (st === "wait") statusEl.textContent = statusText; }, 60);
      }
      kick();
    }, C.t.loaderDelay);
    later(function () { if (st === "wait") codeFlight(); }, C.t.readyWait);
    kick();
  }
  function hideWait() {
    R.classList.remove("intro-waiting");
    loaderAt = -1;
    if (statusEl && statusEl.textContent !== statusText) statusEl.textContent = statusText;
  }
  function progress() {
    var v = video;
    if (!v || !(v.duration > 0) || !v.buffered || !v.buffered.length) return -1;
    return clamp01(v.buffered.end(v.buffered.length - 1) / v.duration);
  }
  function waitStep(t) {
    if (video && ready(video)) { videoFlight(); return; }
    if (loaderAt >= 0) drawLoader(t);
  }
  /** LD-HP "Light finds the ink" (card size): a faint ink line, the light
   *  point at the real buffered fraction, a candle lit at every eighth. */
  function drawLoader(t) {
    var p = progress(), a = clamp01((t - loaderAt) / C.t.preview), L = loader, n = 48, i;
    var ptAt = function (u) { return [L.x - 60 + u * 120, L.y + M.sin(u * 2 * PI) * 5]; };
    var line = function (u1, alpha) {
      cx.globalAlpha = alpha;
      cx.beginPath();
      for (i = 0; i <= n * u1; i++) { var q = ptAt(i / n); if (i) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); }
      cx.stroke();
    };
    cx.strokeStyle = "#c9ac72";
    cx.lineWidth = 1.5;
    cx.lineCap = "round";
    line(1, a * 0.35);
    var head = p < 0 ? 0.12 : p, la = a;
    if (p < 0) la = a * (0.8 + 0.2 * M.sin(((t - loaderAt) / 1000) * PI)); // indeterminate: 0.5 Hz breath
    if (head > 0) line(head, a);
    var h = ptAt(head), lr = sprites.l.r * 0.9;
    cx.globalAlpha = la;
    cx.drawImage(sprites.l.c, h[0] - lr, h[1] - lr, lr * 2, lr * 2);
    if (p > 0) for (i = 1; i <= 8; i++) if (p >= i / 8) { var c = ptAt(i / 8); drawSprite(sprites.c[0], c[0], c[1] - 14, a, 0.7); }
  }

  /* — S2: the video flight ———————————————————————————————————————— */
  function videoFlight() {
    if (st !== "launch" && st !== "wait") return;
    var v = video;
    if (!v) return codeFlight();
    setState("flight");
    mark("flight");
    hideWait();
    lastEmit = null;
    bolt(true);
    h1Rect = rectOfH1();
    var shown = false;
    var show = function () {
      if (shown || video !== v) return;
      shown = true;
      vPlaying = true;
      v.style.opacity = "1";
      showPlate = false; // the video's first frame IS the plate
      kick();
    };
    v.addEventListener("playing", function () {
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(show);
      else show();
      later(show, 120);
    });
    v.addEventListener("ended", function () { if (video === v) landing(); });
    v.addEventListener("error", function () { if (video !== v) return; if (vPlaying) landing(); else codeFlight(); }, true);
    var pr;
    try { pr = v.play(); } catch { return codeFlight(); }
    if (pr && pr.catch) pr.catch(function (err) {
      if (st === "flight" && video === v && !vPlaying && !(err && err.name === "AbortError")) codeFlight();
    });
    var wd = function () {
      if (st !== "flight") return;
      if (d.hidden) { later(wd, 1000); return; }
      landing();
    };
    later(wd, (C.flight.dur + 1.5) * 1000); // a stalled network never strands the visitor
    kick();
  }

  function emitVideo(t) {
    var v = video, tr = C.trail;
    if (!vPlaying) return;
    var vt = v.currentTime, vd = v.duration > 0 ? v.duration : C.flight.dur;
    if (h1Rect && vd - vt < 1.25) { // no light across the name in the last 1.2 s (I15)
      for (var j = 0; j < trail.length; j++) if (near(trail[j], h1Rect, 24)) trail[j].cut = 1;
    }
    if (vt > tr.emitUntil) return;
    var ps = tr.points, i = 0;
    while (i < ps.length - 2 && ps[i + 1][0] <= vt) i++;
    var a = ps[i], b = ps[i + 1] || a, f = b[0] > a[0] ? clamp01((vt - a[0]) / (b[0] - a[0])) : 0;
    var u = a[1] + (b[1] - a[1]) * f, y = a[2] + (b[2] - a[2]) * f, s = a[3] + (b[3] - a[3]) * f;
    if (u < -0.02 || u > 1.02 || y < -0.02 || y > 1.02) { lastEmit = null; return; } // off frame
    var m = fit(C.plate.w, C.plate.h, C.plate.pos);
    emit(m.x + u * m.w, m.y + y * m.h, s, t, C.trailMax);
  }
  function checkLanding() {
    var v = video;
    if (!vPlaying || !v) return;
    var vd = v.duration > 0 ? v.duration : C.flight.dur;
    if (v.currentTime >= vd - C.t.landing / 1000) landing();
  }

  /** S3: the left → right mask dissolve; the name zone clears first (I14). */
  function landing() {
    if (st !== "flight") return;
    setState("landing");
    mark("landing");
    R.classList.add("intro-landing", "intro-sweep");
    var k = "maskPosition" in R.style ? "maskPosition" : "webkitMaskPosition", a = {}, b = {};
    a[k] = "100% 0";
    b[k] = "0% 0";
    anim(intro, [a, b], C.t.landing, C.ease, function () { finish(true, "played"); });
    kick();
  }

  /* — S2c: the code flight (mobile, low-power, or the video never came) — */
  function codeFlight() {
    if (st !== "launch" && st !== "wait" && st !== "flight") return;
    setState("code");
    mark("flight");
    hideWait();
    lastEmit = null;
    killVideo();
    bolt(true);
    h1Rect = rectOfH1();
    var p = plate, tip = at(fitP, p.tip), end = at(fitP, p.end);
    var vx = end[0] - tip[0], vy = end[1] - tip[1], L = M.hypot(vx, vy) || 1, ux = -vx / L, uy = -vy / L;
    var p0 = [(tip[0] + end[0]) / 2, (tip[1] + end[1]) / 2], b0 = [p0[0], p0[1] - 0.012 * H];
    // The plate's broom lifts and yaws round to face the castle (a mirror
    // through 0 about the vertical, 30% of the time), then flies handle
    // first past the towers and out by the upper right (SPEC §5.4: lower
    // left → upper right over the still; transform only, easeDraw).
    var P3 = [W * 1.12, -H * 0.3];
    code = {
      at: now(),
      s0: L / 1000,
      a0: M.atan2(vy, vx),
      p0: p0,
      pos: p0,
      k: M.min(1.2, M.max(0.45, L / 1000 / 0.55)),
      P: [b0, [b0[0] - ux * 0.5 * L, b0[1] + uy * 0.5 * L], [P3[0] - W * 0.12, P3[1] + H * 0.34], P3],
    };
    if (showPlate && imgOk) patch = mkPatch();
    if (broom) {
      setBroom(0);
      broom.style.opacity = "1";
    }
    later(dome, C.t.domeAt);
    kick();
  }
  function bz(P, t) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
    return [a * P[0][0] + b * P[1][0] + c * P[2][0] + e * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + e * P[3][1]];
  }
  function bzd(P, t) {
    var u = 1 - t, a = 3 * u * u, b = 6 * u * t, c = 3 * t * t;
    return [a * (P[1][0] - P[0][0]) + b * (P[2][0] - P[1][0]) + c * (P[3][0] - P[2][0]),
      a * (P[1][1] - P[0][1]) + b * (P[2][1] - P[1][1]) + c * (P[3][1] - P[2][1])];
  }
  /** Pose the SVG broom (tip at local 0, tail end at 1000, balance at 500)
   *  at linear time q. One easeDraw path; over its first quarter the broom
   *  yaws round (sx 1 → -1) and lifts off the plate pose. Once mirrored,
   *  rotate(-φ) keeps the handle along the tangent φ, continuous with the
   *  plate angle. Returns the tail end (the trail source) once turned. */
  function setBroom(q) {
    var e = ED(q), ye = E(clamp01(q / 0.25)), sx = 1 - 2 * ye, P = code.P;
    var pos = bz(P, e), dv = bzd(P, e), af = -M.atan2(dv[1], dv[0]), a0 = code.a0;
    while (af - a0 > PI) af -= 2 * PI;
    while (af - a0 < -PI) af += 2 * PI;
    var a = a0 + (af - a0) * ye, s = code.s0 * (1 - 0.45 * e);
    pos = [pos[0] + (code.p0[0] - P[0][0]) * (1 - ye), pos[1] + (code.p0[1] - P[0][1]) * (1 - ye)];
    code.pos = pos;
    if (broom) {
      broom.style.transform = "translate(" + (pos[0] - 500).toFixed(1) + "px," + (pos[1] - 100).toFixed(1) +
        "px) scale(" + sx.toFixed(4) + ",1) rotate(" + a.toFixed(4) + "rad) scale(" + s.toFixed(4) + ")";
    }
    return ye < 1 ? null : [pos[0] + sx * M.cos(a) * 500 * s, pos[1] + M.sin(a) * 500 * s];
  }
  function stepCode(t) {
    var q = clamp01((t - code.at) / C.t.mobileFlight), tail = setBroom(q);
    if (tail && q < 1) emit(tail[0], tail[1], 1 - 0.5 * q, t, C.trailMaxLite);
  }
  /** The overlay exits by the dome (the Seam geometry): an ellipse edge
   *  rising over `dome` ms on easeClip, revealing the page top. */
  function dome() {
    if (st !== "code") return;
    domeOn = true;
    mark("landing");
    R.classList.add("intro-landing");
    anim(intro, [{ clipPath: "ellipse(150% 150% at 50% -20%)" }, { clipPath: "ellipse(150% 150% at 50% -150%)" }],
      C.t.dome, C.easeClip, function () { finish(true, "played"); });
  }

  /** Lift the broom out of the plate: fill its mask from the surroundings
   *  (pull-push over a mip pyramid of the plate with the broom cut out),
   *  feathered, drawn over the plate as the SVG broom takes its place. */
  function mkPatch() {
    try {
      var q = 4, base = canvas(W / q, H / q), g = base.getContext("2d"), i;
      g.drawImage(img, fitP.x / q, fitP.y / q, fitP.w / q, fitP.h / q);
      g.globalCompositeOperation = "destination-out";
      maskPath(g, 1 / q, 5, 0);
      var lv = [base], cur = base;
      while (cur.width > 4 && lv.length < 9) {
        var nx = canvas(cur.width / 2, cur.height / 2);
        nx.getContext("2d").drawImage(cur, 0, 0, nx.width, nx.height);
        lv.push(nx);
        cur = nx;
      }
      var out = canvas(W, H), og = out.getContext("2d");
      for (i = lv.length - 1; i >= 0; i--) og.drawImage(lv[i], 0, 0, W, H);
      var mk = canvas(W, H);
      maskPath(mk.getContext("2d"), 1, 6, 4);
      og.globalCompositeOperation = "destination-in";
      og.drawImage(mk, 0, 0);
      return { c: out, at: now() };
    } catch {
      return null;
    }
  }
  /** The plate broom's mask in bitmap px (scale `sc`), dilated by `dil`
   *  css px; `blur` > 0 feathers it (shadow trick: works without ctx.filter). */
  function maskPath(g, sc, dil, blur) {
    var p = plate, o = blur ? 1e4 : 0, i, q;
    var P = function (u) { var v = at(fitP, u); return [v[0] * sc, v[1] * sc]; };
    g.save();
    g.fillStyle = g.strokeStyle = "#000";
    if (blur) { g.shadowColor = "#000"; g.shadowBlur = blur * sc; g.shadowOffsetX = o; }
    g.translate(-o, 0);
    g.lineJoin = g.lineCap = "round";
    g.lineWidth = (p.hw * fitP.h + dil * 2) * sc;
    g.beginPath();
    for (i = 0; i < p.handle.length; i++) { q = P(p.handle[i]); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }
    g.stroke();
    g.beginPath();
    for (i = 0; i < p.tail.length; i++) { q = P(p.tail[i]); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }
    g.closePath();
    g.fill();
    g.lineWidth = dil * 2 * sc;
    g.stroke();
    g.restore();
  }

  /* — the light trail: ≤ 48 (video) / ≤ 24 (code) sprites, τ decay ——— */
  /** Emit along the path since the last emission, spaced under a third of
   *  a sprite radius so the glows overlap (≤ 6 per frame, the oldest drop). */
  function emit(x, y, s, t, max) {
    var e = lastEmit;
    lastEmit = { x: x, y: y, s: s, t: t };
    if (!e || t - e.t > 120) { push(x, y, s, t, max); return; }
    var dx = x - e.x, dy = y - e.y, dist = M.hypot(dx, dy);
    var sp = M.max(4, sprites.g.r * (0.45 + 0.55 * s) * (code ? code.k : 1) * 0.3), n = M.floor(dist / sp);
    if (n < 1) { lastEmit = e; return; }
    if (n > 6) { n = 6; sp = dist / 6; }
    for (var k = 1; k <= n; k++) {
      var f = (k * sp) / dist;
      push(e.x + dx * f, e.y + dy * f, e.s + (s - e.s) * f, e.t + (t - e.t) * f, max);
    }
    lastEmit = { x: e.x + dx * ((n * sp) / dist), y: e.y + dy * ((n * sp) / dist), s: s, t: t };
  }
  function push(x, y, s, t, max) {
    trail.push({ x: x, y: y, s: s, t: t, cut: 0 });
    while (trail.length > max) trail.shift();
  }
  function drawTrail(t) {
    var G = sprites.g;
    for (var i = trail.length - 1; i >= 0; i--) {
      var p = trail[i], a = M.exp(-(t - p.t) / C.trailTau);
      if (a < 0.03 || p.cut) { trail.splice(i, 1); continue; }
      var r = G.r * (0.45 + 0.55 * p.s) * (code ? code.k : 1);
      cx.globalAlpha = a;
      cx.drawImage(G.c, p.x - r, p.y - r, r * 2, r * 2);
    }
  }
  function near(p, r, m) {
    return p.x > r.left - m && p.x < r.right + m && p.y > r.top - m && p.y < r.bottom + m;
  }

  /* — exits ———————————————————————————————————————————————————————— */
  /** SX: Skip / Esc / scroll intent / hidden > 30 s. Content ≤ 0.4 s. */
  function dismiss(reason) {
    if (st === "idle" || st === "leaving" || st === "landing" || domeOn) return;
    var fromPlay = st === "armed";
    setState("leaving");
    mark("dismiss");
    ses("intro-seen", "1");
    killVideo();
    if (fromPlay) R.classList.add("intro-bookend");
    anim(intro, [{ opacity: 1 }, { opacity: 0 }], C.t.base, C.ease, function () { finish(false, reason); });
  }

  /** S4 / end of SX: release everything, hand the page back. */
  function finish(played, reason) {
    if (st === "idle") return;
    setState("idle");
    w.__introState = "ended";
    var i;
    for (i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    if (raf) { w.cancelAnimationFrame(raf); raf = 0; }
    for (i = 0; i < offs.length; i++) offs[i]();
    offs = [];
    bolt(false);
    killVideo();
    ses("intro-seen", "1");
    setInert(false);
    for (i = 0; i < CLASSES.length; i++) R.classList.remove(CLASSES[i]);
    R.setAttribute("data-intro", played ? "played" : "skipped");
    [intro, lensL, lensR].forEach(function (el) {
      if (el && el.getAnimations) el.getAnimations().forEach(function (a) { a.cancel(); });
    });
    if (cv && cv.parentNode) cv.parentNode.removeChild(cv);
    cv = cx = null;
    if (broom) { broom.style.transform = ""; broom.style.opacity = ""; }
    cands = []; trail = []; motes = null; patch = null; code = null; domeOn = false;
    focusLanding();
    mark("end");
    try { w.dispatchEvent(new CustomEvent("intro:end", { detail: { played: played, reason: reason } })); } catch { /* old browsers */ }
  }

  function h1() {
    var host = C && C.land ? d.getElementById(C.land) : null;
    return (host && host.querySelector("h1")) || d.querySelector("main h1");
  }
  function rectOfH1() { var h = h1(); return h ? h.getBoundingClientRect() : null; }
  /** Focus → the h1 (tabindex=-1, preventScroll); main as the fallback. */
  function focusLanding() {
    var h = h1();
    if (h && !h.hasAttribute("tabindex")) {
      if (hydrated) h.setAttribute("tabindex", "-1");
      else h = null;
    }
    focus(h || d.getElementById("main"));
  }

  /** `inert` on everything behind the dialog (after hydration only). */
  function setInert(onOff) {
    var c;
    if (onOff) {
      if (inertEls.length || !d.body) return;
      for (c = d.body.firstElementChild; c; c = c.nextElementSibling) {
        if (c !== intro && c.tagName !== "SCRIPT" && !c.hasAttribute("inert")) {
          c.setAttribute("inert", "");
          inertEls.push(c);
        }
      }
    } else {
      for (var i = 0; i < inertEls.length; i++) inertEls[i].removeAttribute("inert");
      inertEls = [];
    }
  }

  /** IC-HP-10: the tab favicon is a small gold bolt during the flight. */
  function bolt(onOff) {
    if (onOff) {
      if (!C.bolt || favs || !hydrated) return;
      favs = [];
      var ls = d.querySelectorAll('link[rel~="icon"]');
      for (var i = 0; i < ls.length; i++) {
        favs.push([ls[i], ls[i].getAttribute("href"), ls[i].getAttribute("type")]);
        ls[i].setAttribute("href", BOLT);
        ls[i].setAttribute("type", "image/svg+xml");
      }
    } else if (favs) {
      favs.forEach(function (f) {
        f[0].setAttribute("href", f[1]);
        if (f[2]) f[0].setAttribute("type", f[2]);
        else f[0].removeAttribute("type");
      });
      favs = null;
    }
  }

  /* — input ———————————————————————————————————————————————————————— */
  function onKey(e) {
    if (st === "idle") return;
    var k = e.key, tg = e.target;
    if (k !== "Shift" && k !== "Control" && k !== "Alt" && k !== "Meta") {
      modality = "key";
      R.classList.add("intro-kbd");
    }
    if (k === "Tab") { // the dialog traps Tab: Play ↔ Skip (Skip only after launch)
      e.preventDefault();
      e.stopPropagation();
      if (st === "landing" || st === "leaving" || domeOn) return;
      var list = st === "armed" ? [play, skip] : [skip], i = list.indexOf(d.activeElement);
      focus(i < 0 ? list[0] : list[(i + (e.shiftKey ? list.length - 1 : 1)) % list.length]);
      return;
    }
    if (k === "Escape" || k === "Esc") {
      e.preventDefault();
      e.stopPropagation();
      dismiss("esc");
      return;
    }
    if (SCROLL[k]) {
      if ((k === " " || k === "Spacebar") && tg && tg.closest && tg.closest("#intro button")) return; // activates it
      e.stopPropagation(); // the page scrolls natively (no preventDefault)
      dismiss("scroll");
      return;
    }
    if (k !== "Enter") e.stopPropagation(); // no page shortcuts under the dialog
  }
  function onWheel(e) {
    if (!e.ctrlKey) dismiss("scroll");
  }
  function onTouch(e) {
    var t = e.touches && e.touches[0];
    if (!t) return;
    if (e.type === "touchstart") { touch = [t.clientX, t.clientY]; return; }
    if (touch && M.abs(t.clientY - touch[1]) > 10) dismiss("scroll");
  }
  function onFocusIn(e) {
    if (st === "idle" || intro.contains(e.target)) return;
    focus(st === "armed" ? play : skip);
  }
  /** SH: the flight pauses on a hidden tab; resumes, or skips after 30 s. */
  function onVis() {
    if (d.hidden) {
      hiddenAt = now();
      if (video && !video.paused) try { video.pause(); } catch { /* no-op */ }
      return;
    }
    if (st === "flight" && video) {
      if (now() - hiddenAt > C.t.hiddenSkip) dismiss("hidden");
      else { var p = video.play(); if (p && p.catch) p.catch(function () { /* stays paused */ }); }
    }
    last = now();
    kick();
  }

  /* — boot: arm once the overlay markup is parsed ———————————————————— */
  function boot() { if (R.classList.contains("intro-armed")) arm(); }
  if (d.getElementById("intro-data")) boot();
  else d.addEventListener("DOMContentLoaded", boot);
})(window, document);
