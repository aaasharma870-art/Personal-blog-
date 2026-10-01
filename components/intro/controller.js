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
   one video at a time (L05, then IN-02), and the state machine
     armed (S0/S0a/S0b/S0c) → launch (S1) → wait (S1w) → flight (S2) →
     [warm (S2w)] → hold (S3h) → reveal (S3r) → end (S4) → titles (S5) |
     code (S2c, dome exit) → landing (S3) → end (S4)      · leaving (SX)
   Hydration contract: it writes only (a) classes / data-intro on <html>,
   (b) the children and styles of #intro-stage (opaque innerHTML to React),
   (c) the text of #intro-status (suppressed), (d) `inert` on the page behind,
   and only after IntroBridge reports hydration, (e) the favicon href, also
   only after hydration; all other motion runs through the Web Animations API.
   Public: window.__introCtl = { arm, onHydrated, state }. Events (window
   CustomEvents; the lib/events.ts bus names): "intro:end" {played, reason,
   href?}, "intro:quiet" (warm), "intro:quiet-end" (titles end or any exit;
   exactly once per run), "intro:titles", "intro:titles-end";
   html[data-intro="played|skipped"]. Performance marks: intro:arm (head) ·
   ready · play · flight · warm · hold · reveal · landing · dismiss · end ·
   titles · titles-end.

   P3-3 HAND-OFF (PHASE3-SPEC §4.2; no frame of it repaints #intro):
     S2   the trail is emitted and drawn on the flight's own frames
          (requestVideoFrameCallback mediaTime: 24 draws/s, locked to the
          broom); frame() idles whenever nothing draws on rAF; when the
          trail stops emitting its canvas freezes and fades by WAAPI
          opacity; canvases are capped at DPR 1.5; the codec is the
          MediaCapabilities pick (lib/codec.ts's rule) set as video.src.
     S2w  warm (1.4 s before the hold): the hero poster decodes, #intro
          goes to opacity .999 (html.intro-warm) so the hero is rasterised
          under it, the hero loop is prefetched (a blob: URL for MediaFrame,
          window.__introHandoff) and "intro:quiet" opens the quiet window.
     S3h  hold (the last presented frame): drawImage into #intro-hold, kill
          the flight (the decoder is free), html.intro-handoff (IntroBridge
          releases the lock; the hero loop mounts under the hold), `inert`
          off in its own task; wait for the loop's data-media-state
          "playing" (≤ t.handoffMax) and <PageHydrated/> (≤ t.hydrateMax).
     S3r  reveal: #intro-stage (300% wide, a STATIC feathered mask) rides
          translateX while #intro-film is counter-moved — two WAAPI
          transforms created in one task (seam.tsx's IceCut). ALT: the
          map-fold, its shade pre-drawn once.
     S4   end: classes, data-intro, intro:end, focus in its own task.
     S5   the opening titles (PHASE3-SPEC §4.3) in #intro-caps, then
          cap.hero. Any input / Pause / RM / hidden tab ends them.
   B00 / L05: when the model ships a living play-screen loop it plays under
   the candles after hydration + idle (desktop, not lite); Play pauses it,
   holds its frame on #intro-still, frees its decoder, then the flight's
   first frame crossfades in (t.liveFade). Until L05 is registered the
   play screen is the still, as before.
   FAST LANE (PHASE3-SPEC §11.3): #intro-fastlane ("Skip to the research",
   DESKTOP_WIDE) = dismiss(), then — once the page is live — the jump
   (IntroBridge: scrollToTarget; before hydration the browser's own hash
   navigation).

   VARIANTS (M1.5; lib/variants.ts). Every piece has a DEFAULT and an ALT;
   the head script resolves them before the first paint (manifest +
   ?variant=…) into window.__introV and html.intro-alt-<piece>:
     intro.play        candle-motes  | marauders-ink: an ink route draws
                       itself up to Play, footprints walk it, the bracket
                       inks in on arrival; hover / focus draws the corridor
     intro.flight      IN-02         | IN-02-alt (its own trail; not
                       tail-anchored, so the sweep crossfades)
     intro.codeflight  bezier past the castle | a spiral round the tallest
                       tower, then straight up out of the frame
     intro.landing     mask sweep (video) + dome (code) | map-fold: the page
                       turns away on its right edge, washing to parchment
   Both sides share every rule: 0 rAF at rest, focus parity (hover = focus),
   one video, reduced motion / Pause end the prologue, the name clears first.

   FLIGHT CAPTIONS (M2, RECOGNIZABILITY S02 / T1): #intro-caps, a sibling of
   #intro rendered by intro-overlay.tsx, names the flight — HP for the first
   2.5 s of a 6 s flight, a 1 s cross-dissolve, then Pirates through the
   landing and 2.5 s over the landed hero (≥ 640), then a 600 ms fade that
   hands off IN PLACE to the hero's own cap.hero (html.intro-caps-linger,
   app/intro.css "T1"); the code flight runs the same timeline scaled to its
   length. WAAPI only (it writes no attribute but that <html> class: the
   hydration contract). Skip / Esc / scroll / motion off: gone at once; a
   scroll during the linger fades it in 200 ms.
   ========================================================================== */
(function (w, d) {
  "use strict";
  if (w.__introCtl) return;

  var R = d.documentElement, M = Math, PI = M.PI;
  var SCROLL = { PageDown: 1, PageUp: 1, ArrowDown: 1, ArrowUp: 1, Home: 1, End: 1, " ": 1, Spacebar: 1 };
  var CLASSES = ["intro-armed", "intro-launched", "intro-waiting", "intro-warm", "intro-handoff", "intro-landing",
    "intro-sweep", "intro-fade-out", "intro-leaving", "intro-kbd", "intro-inked", "intro-fold", "intro-alt-play",
    "intro-alt-flight", "intro-alt-codeflight", "intro-alt-landing", "intro-alt-titles"];
  var HERO = '[data-hero-lens="desktop"]';
  var BOLT = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#e9b44c" d="M19.5 1.5 6.5 18h8.2l-2.9 12.5L25.5 13h-8.3z"/></svg>');

  var C, intro, stage, film, play, skip, fast, lensL, lensR, statusEl, statusText, broom;
  var st = "idle", inited = false, hydrated = !!w.__introHydrated;
  var cv = null, cx = null, dpr = 1, W = 0, H = 0;
  var plate = null, fitP = null, img = null, imgFor = "", imgOk = false, showPlate = false, plateAt = -1;
  var eimg = null, eimgFor = "", eimgOk = false, tl = null, tlx = null;
  var lite = false, fine = false, video = null, vPlaying = false;
  var sprites = null, cands = [], motes = null, trail = [], lastEmit = null, h1Rect = null;
  var hover = false, kfocus = false, gat = 0, gFrom = 0, gTo = 0, gAt = -1;
  var armAt = 0, launchAt = 0, awakeUntil = 0, clock = 0, last = 0;
  var par = [0, 0], parTo = [0, 0];
  var raf = 0, timers = [], offs = [], inertEls = [], favs = null, owned = [];
  var modality = "", hiddenAt = 0, touch = null, loaderAt = -1, loader = null;
  var code = null, patch = null, domeOn = false;
  var E, ED;
  // variants (resolved at arm from window.__introV) and their state
  var VV = {}, FL = null, altPlay = false, altCode = false, altLand = false, heroAlt = false;
  var ink = null, inkAt = 0, inked = false;
  // P3-3: the hand-off (S2w → S3r), the titles, L05, the codec cache
  var vfOn = false, vfId = 0, trailOn = false, frozen = false, warmed = false, pf = false;
  var holdCv = null, shadeCv = null, stillCv = null, quietSent = false, titling = false, fastHref = "";
  var lv = null, lvOn = false, flightBlob = null;
  var PICK = w.__codecPicks || (w.__codecPicks = {});

  var ctl = { arm: arm, onHydrated: onHydrated, state: function () { return st; } };
  w.__introCtl = ctl;

  /* — small helpers ———————————————————————————————————————————————— */
  function now() { return performance.now(); }
  /** The resolved variant of a piece is its ALT (window.__introV). */
  function alt(key) { return VV[key] === "alt"; }
  function mark(n) { try { performance.mark("intro:" + n); } catch { /* no-op */ } }
  function noop() { /* swallowed */ }
  /** A window CustomEvent (the lib/events.ts bus: same names, same detail). */
  function fire(n, detail) { try { w.dispatchEvent(new CustomEvent(n, { detail: detail })); } catch { /* old browsers */ } }
  /** Motion is off: the Pause toggle or OS reduced motion. */
  function motionOff() {
    return R.getAttribute("data-motion") === "paused" ||
      !!(w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  /** The overlay is already leaving on its own (no dismissal any more). */
  function exiting() { return st === "hold" || st === "reveal" || st === "landing" || domeOn; }
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
    // kept, so finish() cancels exactly these (no getAnimations(): that
    // forces a whole-document style recalc right after the class flip)
    if (a) owned.push(a);
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
    fast = d.getElementById("intro-fastlane");
    if (!stage || !play || !skip) return false;
    // the viewport-sized picture in the middle third of the 300% stage
    // (app/intro.css): every layer the controller draws lives in it
    film = d.getElementById("intro-film");
    if (!film) {
      film = d.createElement("div");
      film.id = "intro-film";
      film.setAttribute("aria-hidden", "true");
      stage.appendChild(film);
    }
    statusEl = d.getElementById("intro-status");
    statusText = statusEl ? statusEl.textContent : "";
    lensL = play.querySelector(".intro-lens-l");
    lensR = play.querySelector(".intro-lens-r");
    broom = stage.querySelector(".intro-broom");
    if (broom && broom.parentNode !== film) film.appendChild(broom);
    E = bez(C.ease);
    ED = bez(C.easeDraw);
    play.addEventListener("click", function () { launch(); });
    skip.addEventListener("click", function () { dismiss("skip"); });
    if (fast) {
      fast.addEventListener("click", function (e) {
        e.preventDefault(); // the jump waits for the overlay to go (inert off)
        e.stopPropagation(); // and is the bridge's, not the page's anchor handler
        fastLane();
      });
    }
    play.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") { hover = true; intent(); } });
    play.addEventListener("pointerleave", function () { hover = false; intent(); });
    play.addEventListener("focus", function () { kfocus = modality === "key"; intent(); });
    play.addEventListener("blur", function () { kfocus = false; intent(); });
    inited = true;
    return true;
  }

  function onHydrated() {
    hydrated = true;
    if (st !== "idle" && st !== "hold" && st !== "reveal") setInert(true);
    if (st === "armed") liveSoon();
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
    vfOn = false; vfId = 0; trailOn = false; frozen = false; warmed = false; pf = false;
    holdCv = shadeCv = stillCv = null; quietSent = false; titling = false; fastHref = "";
    lv = null; lvOn = false; flightBlob = null;
    loaderAt = -1; showPlate = false; plateAt = -1; plate = null;
    VV = w.__introV || {};
    altPlay = alt("intro.play");
    altCode = alt("intro.codeflight");
    altLand = alt("intro.landing");
    heroAlt = VV["hero.plate"] === "alt";
    FL = alt("intro.flight") && C.flightAlt ? C.flightAlt : C.flight;
    ink = null; inkAt = armAt; inked = false;

    var mm = w.matchMedia ? function (q) { return w.matchMedia(q); } : null;
    fine = !!(mm && mm("(pointer: fine)").matches);
    lite = !FL || w.innerWidth < 1024 || !fine || (navigator.hardwareConcurrency || 8) < 4 ||
      w.innerHeight > w.innerWidth;

    cv = d.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.tabIndex = -1;
    film.appendChild(cv);
    cx = cv.getContext("2d");
    size();
    // the codec question, asked early (lib/codec.ts's rule; the answers are
    // shared with MediaFrame through window.__codecPicks)
    if (!lite) { codecAsk(FL); codecAsk(C.playLoop); codecAsk(heroLoop()); }

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
      if (rq.addEventListener) on(rq, "change", function () { if (rq.matches) finish(st === "hold" || st === "reveal", "motion"); });
    }
    if (w.MutationObserver) {
      // Pause mid-reveal (or anywhere) finishes at once: the final hero
      var mo = new MutationObserver(function () {
        if (R.getAttribute("data-motion") === "paused") finish(st === "hold" || st === "reveal", "motion");
      });
      mo.observe(R, { attributes: true, attributeFilter: ["data-motion"] });
      offs.push(function () { mo.disconnect(); });
    }

    if (hydrated) setInert(true);
    if (altPlay) later(setInked, C.ink.routeMs); // the bracket inks in when the route arrives
    focus(play);
    // text boxes move when the web fonts swap in: re-place the candles
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { if (st === "armed" && cv) { layoutCandles(); kick(); } });
    afterLoad(function () {
      if (st === "idle") return;
      loadPlate();
      if (lite || !fastNet()) return;
      // with a living play screen its loop has the decoder: the flight is
      // fetched (no element, no second decoder) until Play
      if (C.playLoop) { prefetchFlight(); liveSoon(); } else ensureVideo();
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
    var nd = M.min(C.dprMax || 1.5, w.devicePixelRatio || 1);
    cv.width = M.round(W * nd);
    cv.height = M.round(H * nd);
    cx.setTransform(nd, 0, 0, nd, 0, 0);
    // the light trail's own layer: composited at TRAIL_PEAK, so however many
    // glows overlap the stream never burns to white (no "lightsaber")
    tl = canvas(W * nd, H * nd);
    tlx = tl.getContext("2d");
    tlx.setTransform(nd, 0, 0, nd, 0, 0);
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
    var cc = C.candle, texts = [], i, els = intro.querySelectorAll(".intro-meta,.intro-lines,.intro-play-face,.intro-skip,.intro-cap");
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
    // ALT play: no ring (the footprints answer Play); the ink route is laid
    // first so the ambient candles keep clear of it
    if (altPlay) layoutInk(texts);
    var offRoute = function (x, y) {
      if (!ink) return true;
      for (var r = 0; r < ink.pts.length; r += 2) if (M.abs(ink.pts[r][0] - x) + M.abs(ink.pts[r][1] - y) < 56) return false;
      return true;
    };

    cands = [];
    var valid = [], n = altPlay ? 0 : 48;
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
      if (!free(x, y, z) || hits(rectAt(x, y, z), pb) || !offRoute(x, y)) continue;
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
    var done = function () { if (img === im) { imgOk = true; revealPlate(); loadEmpty(); } };
    if (im.decode) im.decode().then(done, function () { /* keep the night ground */ });
    else im.onload = done;
  }
  /** The plate without its broom (same generation, inpainted): the code
   *  flight fills the broom's mask from it. Fetched after the plate, at low
   *  priority; until it has decoded the fill falls back to pull-push. */
  function loadEmpty() {
    if (st === "idle" || !plate || !plate.empty) return;
    var src = plate.empty;
    if (eimg && eimgFor === src) return;
    var im = new Image();
    eimg = im; eimgFor = src; eimgOk = false;
    im.decoding = "async";
    im.setAttribute("fetchpriority", "low");
    im.src = src;
    var done = function () { if (eimg === im) eimgOk = true; };
    if (im.decode) im.decode().then(done, function () { /* pull-push fill */ });
    else im.onload = done;
  }
  function revealPlate() {
    if (showPlate || lvOn || (st !== "armed" && st !== "wait")) return;
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
      if (!lite && !C.playLoop) ensureVideo();
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

  /* — frame loop: runs only while something moves (0 rAF at rest, I20).
       P3-3: the video flight's trail is drawn on the video's own frames
       (onVF), so after the motes the flight needs no rAF at all. — */
  function kick() { if (!raf && st !== "idle") raf = w.requestAnimationFrame(frame); }

  function frame(t) {
    raf = 0;
    if (draw(t)) kick();
  }

  /** One canvas frame at time t. Returns true while anything still moves on
   *  rAF (`more = trail-on-rAF || motes || code || ink || loader || …`). */
  function draw(t) {
    if (st === "idle" || !cx || frozen) return false;
    var dt = M.min(64, M.max(0, t - last)), more = false, i;
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
    if (ink && drawInk(t)) more = true;
    if (motes) { drawMotes(t); if (motes) more = true; }
    if (code) { stepCode(t); more = true; }
    if (st === "flight" && video && !vfOn) { // no rVFC: the old clock (currentTime on rAF)
      var vt = video.currentTime;
      emitVideo(t, vt);
      if (checkWarmHold(vt)) return false;
      more = true;
    }
    if (st === "wait") { waitStep(t); more = true; }
    if (trail.length) { drawTrail(t); if (!vfOn || code) more = true; }

    cx.globalAlpha = 1;
    return more && st !== "idle";
  }

  /* — the flight captions (S02 / T1) ———————————————————————————————— */
  var capBox = null, capHp = null, capPc = null, capAnims = [], capTimer = 0, capOff = null, boxFi = 1;
  function capsFind() {
    capBox = d.getElementById("intro-caps");
    capHp = d.getElementById("intro-cap-hp");
    capPc = d.getElementById("intro-cap-pc");
    return !!(capBox && capHp && capPc && capBox.animate);
  }
  function capsCancel(list) {
    for (var i = 0; i < list.length; i++) try { list[i].cancel(); } catch { /* gone */ }
  }
  /** The caption box's opacity now, from its own animation's timing (no
   *  getComputedStyle: no forced style read). */
  function boxOpacity() {
    try {
      var p = capAnims[0].effect.getComputedTiming().progress;
      return p == null ? 1 : M.min(1, p / boxFi);
    } catch { return 1; }
  }
  /** "intro:quiet-end": the quiet window closes (titles end, or any exit
   *  once the overlay has gone). Exactly once per run. */
  function quietEnd() {
    if (quietSent) return;
    quietSent = true;
    fire("intro:quiet-end");
  }
  /** Stop the captions (and the titles): at once (ms 0) or fading the box
   *  out over `ms`. The hero's cap.hero then fades in, in place (T1). */
  function capsStop(ms) {
    if (capTimer) { clearTimeout(capTimer); capTimer = 0; }
    if (capOff) { var off = capOff; capOff = null; off(); }
    if (titling) {
      titling = false;
      mark("titles-end");
      fire("intro:titles-end");
    }
    R.classList.remove("intro-caps-linger"); // T1: the hero's cap.hero fades in, in place
    var list = capAnims;
    capAnims = [];
    if (st === "idle") quietEnd();
    if (!list.length) return;
    if (!ms || !capBox) return capsCancel(list);
    var o = boxOpacity(), out = null;
    try {
      out = capBox.animate([{ visibility: "visible", opacity: o }, { visibility: "visible", opacity: 0 }],
        { duration: ms, easing: curve(C.ease), fill: "forwards" });
    } catch { /* no WAAPI */ }
    if (!out) return capsCancel(list);
    list.push(out);
    out.onfinish = function () { capsCancel(list); };
  }
  /** The flight timeline over `ms` (the flight's own length). */
  function capsPlay(ms) {
    if (!(ms > 0) || !capsFind()) return;
    capsStop(0);
    var a = 2.5 / 6, b = 3.5 / 6, fi = M.min(a / 2, 300 / ms);
    var o = { duration: ms, easing: "linear", fill: "forwards" };
    boxFi = fi;
    try {
      capAnims.push(capBox.animate([{ visibility: "visible", opacity: 0 }, { visibility: "visible", opacity: 1, offset: fi }, { visibility: "visible", opacity: 1 }], o));
      capAnims.push(capHp.animate([{ opacity: 0 }, { opacity: 1, offset: fi }, { opacity: 1, offset: a }, { opacity: 0, offset: b }, { opacity: 0 }], o));
      capAnims.push(capPc.animate([{ opacity: 0 }, { opacity: 0, offset: a }, { opacity: 1, offset: b }, { opacity: 1 }], o));
    } catch { capsStop(0); }
  }
  /** Any input, a fast-lane click, Pause, a reduced-motion change or a
   *  hidden tab ends the linger / the titles early (200 ms; motion off: at
   *  once, the final state with cap.hero visible). */
  function capsExits() {
    var soft = function () { capsStop(200); };
    var evs = ["wheel", "touchmove", "keydown", "pointerdown"], i;
    for (i = 0; i < evs.length; i++) w.addEventListener(evs[i], soft, { capture: true, passive: true });
    var vis = function () { if (d.hidden) capsStop(200); };
    d.addEventListener("visibilitychange", vis);
    var mo = w.MutationObserver ? new MutationObserver(function () {
      if (R.getAttribute("data-motion") === "paused") capsStop(0);
    }) : null;
    if (mo) mo.observe(R, { attributes: true, attributeFilter: ["data-motion"] });
    var rq = w.matchMedia ? w.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var rm = function () { if (rq.matches) capsStop(0); };
    if (rq && rq.addEventListener) rq.addEventListener("change", rm);
    capOff = function () {
      for (var j = 0; j < evs.length; j++) w.removeEventListener(evs[j], soft, { capture: true });
      d.removeEventListener("visibilitychange", vis);
      if (mo) mo.disconnect();
      if (rq && rq.removeEventListener) rq.removeEventListener("change", rm);
    };
  }
  /** No titles (their copy may not render, or the slot is too small):
   *  the M2 hand-off — the Pirates caption stays 2.5 s over the hero
   *  (≥ 640, where it sits below the crest), then html.intro-caps-linger
   *  goes and the hero's own caption (cap.hero, the very same spot) fades
   *  in: the film name never moves. Any input hands off sooner; Pause at
   *  once. */
  function capsLinger() {
    if (!capAnims.length) return;
    if (!(w.matchMedia && w.matchMedia("(min-width: 40rem)").matches)) return capsStop(C.t.base);
    R.classList.add("intro-caps-linger");
    capTimer = setTimeout(function () { capTimer = 0; capsStop(260); }, 2500); // then the hero's, in sequence (intro.css)
    capsExits();
  }

  /* — S5: the opening titles (PHASE3-SPEC §4.3; intro.titles) ————————— */
  /** ≈ 3.2 s in the T1 caption slot, right after the end: the flight caption
   *  leaves first (never a same-spot crossfade), then the three cards one
   *  at a time — DEFAULT: opacity + a rise of `rise` px on one spot; ALT:
   *  the same lines as a short credit roll through a feathered window —
   *  then cap.hero takes the corner. They REPLACE the 2.5 s linger (no
   *  added time) and never gate anything: every animation is WAAPI,
   *  created in this one task (compositor; no React, no attribute), and
   *  any input, Pause, a reduced-motion change or a hidden tab ends them.
   *  Played path only; ≥ 640 × ≥ 32rem tall (the slot), else the linger. */
  function titles() {
    var T = C.titles, roll = VV["intro.titles"] === "alt";
    var box = d.getElementById(roll ? "intro-roll" : "intro-titles");
    var slot = !!(w.matchMedia && w.matchMedia("(min-width: 40rem) and (min-height: 32rem)").matches);
    if (!T || !box || !slot || !capAnims.length || !capsFind()) return capsLinger();
    titling = true;
    mark("titles");
    fire("intro:titles");
    R.classList.add("intro-caps-linger"); // cap.hero waits hidden (app/intro.css T1)
    var tot = T.total, e = curve(C.ease), y = T.rise, i;
    var o = { duration: tot, fill: "forwards" };
    var at = function (ms) { return M.min(1, M.max(0, ms / tot)); };
    var add = function (el, kf) { if (el) try { capAnims.push(el.animate(kf, o)); } catch { /* no WAAPI */ } };
    add(capPc, [{ opacity: 1, easing: e }, { opacity: 0, offset: at(T.capOut) }, { opacity: 0 }]);
    if (roll) {
      add(box, [{ opacity: 0 }, { opacity: 0, offset: at(T.first), easing: e }, { opacity: 1, offset: at(T.first + T.enter) },
        { opacity: 1, offset: at(tot - T.exit), easing: e }, { opacity: 0 }]);
      // the column starts just below the window (top: 100%) and rolls up
      // past its top; 9rem = the window's height (app/intro.css #intro-roll)
      add(box.firstElementChild, [{ transform: "translateY(0)" }, { transform: "translateY(0)", offset: at(T.first) },
        { transform: "translateY(calc(-100% - 9rem))" }]);
    } else {
      for (i = 0; i < box.children.length; i++) {
        var a = T.first + i * T.step, b = a + T.card, up = "translateY(" + y + "px)", gone = "translateY(" + -y + "px)";
        add(box.children[i], [
          { opacity: 0, transform: up },
          { opacity: 0, transform: up, offset: at(a), easing: e },
          { opacity: 1, transform: "none", offset: at(a + T.enter) },
          { opacity: 1, transform: "none", offset: at(b - T.exit), easing: e },
          { opacity: 0, transform: gone, offset: at(b) },
          { opacity: 0, transform: gone },
        ]);
      }
    }
    capTimer = setTimeout(function () { capTimer = 0; capsStop(260); }, tot); // then cap.hero (intro.css)
    capsExits();
  }

  /* — S1 launch ————————————————————————————————————————————————————— */
  function launch() {
    if (st !== "armed") return;
    setState("launch");
    mark("play");
    launchAt = now();
    focus(skip); // Play leaves the tab order; Skip stays through the flight
    R.classList.add("intro-launched");
    if (altPlay) setInked(); // the bracket halves fly out drawn
    var rl = lensL && lensL.getBoundingClientRect(), rr = lensR && lensR.getBoundingClientRect();
    if (rl) anim(lensL, [{ transform: "none" }, { transform: "translateX(" + -(rl.right + 8) + "px)" }], C.t.hero, C.easeClip);
    if (rr) anim(lensR, [{ transform: "none" }, { transform: "translateX(" + (W - rr.left + 8) + "px)" }], C.t.hero, C.easeClip);
    motes = [];
    for (var i = 0; i < cands.length; i++) {
      var p = candPos(cands[i]);
      motes.push({ x: p[0], y: p[1], z: cands[i].z, ring: cands[i].ring, dl: cands[i].ring ? i * 14 : 0 });
    }
    if (lite) return codeFlight();
    releaseLive(); // L05: its frame held on a still, its decoder freed, before the flight's
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
  /** The encode to play for a model video (lib/codec.ts's rule: each encode
   *  ranks 2 smooth + power-efficient / 1 supported / 0 not decodable; the
   *  WebM only with the higher rank; every tie, error or unknown → the MP4). */
  function srcOf(e) { return PICK[e.mp4] === "video/webm" && e.webm ? e.webm : e.mp4; }
  /** Ask MediaCapabilities about both encodes of `e` (once per page; the
   *  answer is shared with MediaFrame through window.__codecPicks). */
  function codecAsk(e) {
    var mc = navigator.mediaCapabilities;
    if (!e || !e.webm || !e.codec || PICK[e.mp4] || !mc || !mc.decodingInfo) return;
    var q = function (c) {
      return mc.decodingInfo({ type: "file", video: c }).then(function (r) {
        return !r || !r.supported ? 0 : r.smooth && r.powerEfficient ? 2 : 1;
      }, function () { return 0; });
    };
    try {
      Promise.all([q(e.codec.webm), q(e.codec.mp4)]).then(function (r) {
        if (!PICK[e.mp4]) PICK[e.mp4] = r[0] > r[1] ? "video/webm" : "video/mp4";
      }, noop);
    } catch { /* no MediaCapabilities */ }
  }
  /** A muted, inline, decorative video (no <source> list: `src` is set
   *  directly, the codec already chosen). */
  function mkVideo(src, loop) {
    var v = d.createElement("video");
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.loop = !!loop;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("aria-hidden", "true");
    v.setAttribute("disablepictureinpicture", "");
    v.setAttribute("disableremoteplayback", "");
    v.tabIndex = -1;
    v.preload = "auto";
    var pos = (plate || C.plate).pos;
    v.style.objectPosition = pos[0] * 100 + "% " + pos[1] * 100 + "%";
    v.src = src;
    return v;
  }
  function ensureVideo() {
    if (video || lite || !FL || st === "idle") return video;
    var fb = flightBlob, v = mkVideo(fb && fb.url ? fb.url : srcOf(FL), false);
    film.insertBefore(v, film.firstChild);
    video = v;
    return v;
  }
  /** L05 on: the flight's bytes come in as a blob (no element, so no second
   *  decoder while the living play screen plays); Play makes the element. */
  function prefetchFlight() {
    if (flightBlob || !FL || !w.fetch) return;
    var fb = flightBlob = { url: null };
    try {
      w.fetch(srcOf(FL), { priority: "low" }).then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) {
        if (b && flightBlob === fb && w.URL && URL.createObjectURL) fb.url = URL.createObjectURL(b);
      }).catch(noop);
    } catch { /* no fetch: the element loads it at Play */ }
  }
  function ready(v) { return v.readyState >= 4; }
  function killVideo() {
    var v = video;
    video = null;
    vPlaying = false;
    if (!v) return;
    unload(v);
  }
  function unload(v) {
    try { v.pause(); } catch { /* no-op */ }
    while (v.firstChild) v.removeChild(v.firstChild);
    v.removeAttribute("src");
    try { v.load(); } catch { /* no-op */ }
    if (v.parentNode) v.parentNode.removeChild(v);
  }
  function drop(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }
  /** The hold's still without a main-thread copy: createImageBitmap crops
   *  the visible (cover-fit) part of the paused frame and scales it to the
   *  canvas off the main thread, and a "bitmaprenderer" canvas shows it
   *  with no draw. `done(canvas)` runs once (stillOf as the fallback). */
  function grabStill(v, id, done) {
    var once = false, fin = function (c) { if (!once) { once = true; done(c); } };
    var nd = M.min(C.dprMax || 1.5, w.devicePixelRatio || 1), m = v && v.videoWidth ? fit(v.videoWidth, v.videoHeight, (plate || C.plate).pos) : null;
    if (!m || !w.createImageBitmap) return fin(stillOf(v, id));
    var c = canvas(W * nd, H * nd), k = v.videoWidth / m.w;
    c.id = id;
    c.setAttribute("aria-hidden", "true");
    later(function () { fin(stillOf(v, id)); }, 250); // never stranded on a slow bitmap
    try {
      w.createImageBitmap(v, -m.x * k, -m.y * k, W * k, H * k, { resizeWidth: c.width, resizeHeight: c.height, resizeQuality: "medium" })
        .then(function (bmp) {
          if (once) return;
          var r = c.getContext("bitmaprenderer");
          if (r) r.transferFromImageBitmap(bmp);
          else c.getContext("2d").drawImage(bmp, 0, 0);
          fin(c);
        }, function () { fin(stillOf(v, id)); });
    } catch { fin(stillOf(v, id)); }
  }
  /** A static canvas of video `v`'s current frame, cover-fit exactly as the
   *  <video> is (object-position = the plate's pos): the hold (S3h) and
   *  L05's crossfade still. A frame that cannot be drawn leaves the night
   *  ground, never a hole. */
  function stillOf(v, id) {
    var nd = M.min(C.dprMax || 1.5, w.devicePixelRatio || 1), c = canvas(W * nd, H * nd), g = c.getContext("2d"), drew = false;
    c.id = id;
    c.setAttribute("aria-hidden", "true");
    if (!g) return c;
    g.setTransform(nd, 0, 0, nd, 0, 0);
    try {
      if (v && v.videoWidth) {
        var m = fit(v.videoWidth, v.videoHeight, (plate || C.plate).pos);
        g.drawImage(v, m.x, m.y, m.w, m.h);
        drew = true;
      }
    } catch { /* not drawable */ }
    if (!drew) {
      g.fillStyle = w.getComputedStyle(intro).backgroundColor; // the failure path only
      g.fillRect(0, 0, W, H);
    }
    return c;
  }

  /* — B00 / L05: the living play screen (IN-01's loop; PHASE3-SPEC §6.3) — */
  /** After hydration + an idle slice, desktop (not lite), motion on, still
   *  armed: the loop plays UNDER the candles and the canvas stops drawing
   *  the still on its first frame (the loop starts and ends on it). */
  function liveSoon() {
    if (!C.playLoop || lite || lv || st !== "armed" || !hydrated || !fastNet()) return;
    afterLoad(livePlate);
  }
  function livePlate() {
    if (!C.playLoop || lite || lv || st !== "armed" || !hydrated || motionOff()) return;
    var v = mkVideo(srcOf(C.playLoop), true);
    film.insertBefore(v, film.firstChild);
    lv = v;
    var first = function () {
      if (lv !== v || lvOn || st !== "armed") return;
      lvOn = true;
      v.style.opacity = "1";
      showPlate = false; // the loop IS the plate now
      kick();
    };
    v.addEventListener("playing", function () {
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(first); else first();
    });
    v.addEventListener("error", function () { if (lv === v) killLive(); }, true);
    try {
      var p = v.play();
      if (p && p.catch) p.catch(function (err) { if (lv === v && !(err && err.name === "AbortError")) killLive(); });
    } catch { killLive(); }
  }
  function killLive() {
    var v = lv, was = lvOn;
    lv = null;
    lvOn = false;
    if (v) unload(v);
    if (was && st === "armed") { showPlate = false; revealPlate(); } // back to the still
  }
  /** Play: L05 pauses, its frame is held on #intro-still and its decoder is
   *  freed — then the flight's first frame crossfades in (fadeStill). */
  function releaseLive() {
    var v = lv;
    if (!v) return;
    try { v.pause(); } catch { /* no-op */ }
    if (lvOn && cv) film.insertBefore(stillCv = stillOf(v, "intro-still"), cv);
    lvOn = false;
    lv = null;
    unload(v);
  }
  function fadeStill() {
    var c = stillCv;
    if (!c) return;
    stillCv = null;
    var a = anim(c, [{ opacity: 1 }, { opacity: 0 }], C.t.liveFade, C.ease, function () { drop(c); });
    if (!a) drop(c);
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
    trailOn = !!FL.trail;
    bolt(true);
    h1Rect = rectOfH1();
    var shown = false;
    var show = function () {
      if (shown || video !== v) return;
      shown = true;
      vPlaying = true;
      v.style.opacity = "1";
      showPlate = false; // the video's first frame IS the plate
      fadeStill(); // L05's held frame → the flight's first (t.liveFade)
      // the captions run on the flight's own length (to its cut + landing)
      var len = v.duration > 0 ? M.min(v.duration, FL.dur) : FL.dur;
      if (FL.cut > 0) len = M.min(len, FL.cut + (altLand ? C.t.fold : C.t.landing) / 1000);
      capsPlay(len * 1000);
      kick();
    };
    v.addEventListener("playing", function () {
      if (v.requestVideoFrameCallback) {
        if (!vfOn) { // the flight's own frame clock (onVF), started once
          vfOn = true;
          vfId = v.requestVideoFrameCallback(function (n, m) { show(); onVF(n, m); });
        }
      } else show();
      later(show, 120);
    });
    v.addEventListener("ended", function () { if (video === v) hold(); });
    v.addEventListener("error", function () { if (video !== v) return; if (vPlaying) hold(); else codeFlight(); }, true);
    var pr;
    try { pr = v.play(); } catch { return codeFlight(); }
    if (pr && pr.catch) pr.catch(function (err) {
      if (st === "flight" && video === v && !vPlaying && !(err && err.name === "AbortError")) codeFlight();
    });
    var wd = function () {
      if (st !== "flight") return;
      if (d.hidden) { later(wd, 1000); return; }
      hold();
    };
    later(wd, (FL.dur + 1.5) * 1000); // a stalled network never strands the visitor
    kick();
  }

  /** The video time of the hold: the clip's last presented frame, or its
   *  `cut` (IN-02-alt hands off before its splash-down). */
  function endAt(v) {
    var vd = v.duration > 0 ? v.duration : FL.dur;
    return FL.cut > 0 ? M.min(FL.cut, vd) : vd - 1.5 / (FL.fps || 24);
  }
  /** S2 on the flight's own frames (requestVideoFrameCallback): the trail
   *  is emitted and drawn at the PRESENTED media time (24 draws/s, locked
   *  to the broom, not to currentTime on rAF), and the warm-up and the
   *  hold are detected here (+ `ended`) — no polling. Once the trail has
   *  stopped emitting this does nothing but watch for the hold. */
  function onVF(t, meta) {
    var v = video;
    vfId = 0;
    if (!v || st !== "flight") return;
    var mt = meta && meta.mediaTime >= 0 ? meta.mediaTime : v.currentTime;
    if (checkWarmHold(mt)) return;
    if (trailOn) {
      emitVideo(t, mt);
      if (mt > FL.trail.emitUntil) freezeTrail();
      else if (!raf) draw(t); // the motes' rAF draws it while they run
    }
    vfId = v.requestVideoFrameCallback(onVF);
  }
  /** Warm-up at (hold − t.warm), the hold at the last frame. True = held. */
  function checkWarmHold(vt) {
    var end = endAt(video);
    if (!warmed && vt >= end - C.t.warm / 1000) warm();
    if (vt < end) return false;
    hold();
    return true;
  }

  function emitVideo(t, vt) {
    var tr = FL.trail;
    if (!vPlaying || !tr || !trailOn || !video) return; // a clip without its own tracked path flies unlit
    if (h1Rect && endAt(video) - vt < 1.25) { // no light across the name in the last 1.2 s (I15)
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
  /** The trail has stopped emitting (S2, v 4.55 s; or the hold came
   *  first): its canvas freezes as it is and fades by WAAPI opacity — no
   *  per-frame main-thread work from here to the end. */
  function freezeTrail() {
    var was = trailOn;
    trailOn = false;
    frozen = true;
    trail = [];
    lastEmit = null;
    if (was && cv) anim(cv, [{ opacity: 1 }, { opacity: 0 }], C.t.trailFade, C.ease);
  }

  /* — S2w → S3h → S3r: the hand-off (PHASE3-SPEC §4.2) ———————————————— */
  /** The hero loop that will play (hero.plate × hero.loop), or null. */
  function heroLoop() {
    var L = C.heroLoops && C.heroLoops[heroAlt ? "alt" : "default"];
    return L ? L[VV["hero.loop"] === "alt" ? "alt" : "default"] || null : null;
  }
  /** S2w, t.warm before the hold: (a) the hero poster decodes; (b) #intro
   *  stops occluding the hero (html.intro-warm: opacity .999), so the
   *  compositor rasterises it — the name in its final face, the Lens, the
   *  header — before the reveal; (c) the hero loop's bytes are prefetched;
   *  (d) "intro:quiet": nothing new starts until "intro:quiet-end". */
  function warm() {
    if (warmed || st === "idle") return;
    warmed = true;
    mark("warm");
    R.classList.add("intro-warm");
    try {
      var im = d.querySelector(HERO + " [data-hero-plate] img");
      if (im && im.decode) im.decode().catch(noop);
    } catch { /* no decode() */ }
    prefetchLoop();
    fire("intro:quiet");
  }
  /** (c): once the flight is fully buffered, fetch the hero loop (the
   *  encode MediaFrame will pick) at low priority into a blob: URL that
   *  MediaFrame plays at the hand-off (window.__introHandoff; lib/codec.ts
   *  handoffSource) — no network between the hold and the reveal. */
  function prefetchLoop() {
    var L = heroLoop();
    if (!L || pf) return;
    var src = srcOf(L), h = w.__introHandoff, at = FL && FL.loopAt > 0 ? FL.loopAt : 0;
    if (h && h.src === src && h.url) { h.at = at; return; } // a replay: already in
    w.__introHandoff = { src: src, url: null, at: at };
    var go = function () {
      if (pf || !w.fetch) return;
      pf = true;
      try {
        w.fetch(src, { priority: "low" }).then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) {
          var hh = w.__introHandoff;
          if (b && hh && hh.src === src && !hh.url && w.URL && URL.createObjectURL) hh.url = URL.createObjectURL(b);
        }).catch(noop);
      } catch { /* MediaFrame fetches it itself */ }
    };
    var v = video;
    if (!v || progress() >= 1) return go();
    var onP = function () { if (progress() >= 1 || video !== v) { v.removeEventListener("progress", onP); if (video === v) go(); } };
    v.addEventListener("progress", onP);
  }
  /** S3h: the last presented frame. Hold it on a static canvas, kill the
   *  flight (exactly one decoder, now free), mark html.intro-handoff
   *  (IntroBridge releases the lock; useIntroPhase → "handoff", so the hero
   *  loop mounts under the hold with no fade), drop `inert` in its own task
   *  (its recalc lands on a still), set the wipe's static mask, and reveal
   *  once the loop plays (≤ t.handoffMax) and the page has hydrated
   *  (≤ t.hydrateMax). */
  function hold() {
    if (st !== "flight") return;
    var v = video;
    setState("hold");
    mark("hold");
    if (!warmed) warm(); // a short or stalled clip still un-occludes the hero
    // the paused last frame stays on screen while its still is grabbed
    if (v) try { v.pause(); } catch { /* gone */ }
    if (v && vfId && v.cancelVideoFrameCallback) try { v.cancelVideoFrameCallback(vfId); } catch { /* gone */ }
    vfId = 0;
    freezeTrail();
    if (raf) { w.cancelAnimationFrame(raf); raf = 0; }
    grabStill(v, "intro-hold", handoff);
  }
  /** The hold's still is ready: it covers the paused video, which goes. */
  function handoff(c) {
    if (st !== "hold") return;
    holdCv = c;
    film.insertBefore(c, cv);
    killVideo();
    R.classList.add("intro-landing", "intro-handoff");
    if (altLand) shade(); // the fold's wash, drawn now (under the hold), not on its first frame
    else sweepMask();
    later(function () { setInert(false); }, 0);
    awaitHandoff(function () {
      if (w.requestAnimationFrame) w.requestAnimationFrame(reveal); else reveal();
    });
  }
  /** The wipe's mask: opaque from the film's left edge (a third of the
   *  stage), ramping to transparent over the feather to its left. STATIC:
   *  it is rasterised once, here, and only ever moves with the stage. */
  function sweepMask() {
    var F = M.round(W * C.feather), g = "linear-gradient(to right, transparent calc(100% / 3 - " + F + "px), #000 calc(100% / 3))";
    var sty = stage.style;
    sty.setProperty("-webkit-mask-image", g);
    sty.setProperty("mask-image", g);
    sty.setProperty("-webkit-mask-repeat", "no-repeat");
    sty.setProperty("mask-repeat", "no-repeat");
    sty.setProperty("-webkit-mask-size", "100% 100%");
    sty.setProperty("mask-size", "100% 100%");
  }
  /** The hold's two conditions, each with its own cap: the hero loop
   *  reports data-media-state "playing" (MediaFrame; or "failed"; no loop =
   *  nothing to wait for) and <PageHydrated/> has fired. */
  function awaitHandoff(go) {
    var box = heroLoop() ? d.querySelector(HERO + " [data-media]") : null;
    var mediaOk = !box, hydOk = !!w.__pageHydrated, done = false, mo = null;
    var check = function () {
      if (done || st !== "hold") return;
      if (!mediaOk) {
        var s = box.getAttribute("data-media-state");
        if (s === "playing" || s === "failed") mediaOk = true;
      }
      if (!mediaOk || !hydOk) return;
      done = true;
      stop();
      go();
    };
    var onH = function () { hydOk = true; check(); };
    var stop = function () {
      if (mo) mo.disconnect();
      w.removeEventListener("page:hydrated", onH);
    };
    offs.push(stop);
    if (box && w.MutationObserver) {
      mo = new MutationObserver(check);
      mo.observe(box, { attributes: true, attributeFilter: ["data-media-state"] });
    }
    w.addEventListener("page:hydrated", onH);
    later(function () { mediaOk = true; check(); }, C.t.handoffMax);
    later(function () { hydOk = true; check(); }, C.t.hydrateMax);
    check();
  }
  /** S3r: the compositor-only feathered wipe, left → right over t.landing
   *  (easeClip): the name zone clears first. #intro-stage rides from
   *  −W to +F (its static mask's edge crosses the whole viewport and its
   *  feather clears it) while #intro-film is counter-moved by the same
   *  amount, so the held picture stays put; the two WAAPI transforms are
   *  created in this one task and share a start time on the compositor.
   *  A clip whose last frame is not the hero plate (IN-02-alt, the ALT hero
   *  plate) also fades the film. No WAAPI: an opacity fade. ALT: the fold. */
  function reveal() {
    if (st !== "hold") return;
    setState("reveal");
    mark("reveal");
    if (altLand) return fold();
    mark("landing");
    var done = function () { finish(true, "played"); };
    if (!stage.animate || !film.animate) {
      R.classList.add("intro-fade-out");
      later(done, C.t.landing);
      return;
    }
    R.classList.add("intro-sweep"); // a phase label: it changes no style
    var F = M.round(W * C.feather), o = { duration: C.t.landing, easing: curve(C.easeClip), fill: "forwards" };
    var a = stage.animate([{ transform: "translateX(" + -W + "px)" }, { transform: "translateX(" + F + "px)" }], o);
    owned.push(a);
    owned.push(film.animate([{ transform: "translateX(0px)" }, { transform: "translateX(" + -(W + F) + "px)" }], o));
    if (!FL.anchored || heroAlt) owned.push(film.animate([{ opacity: 1 }, { opacity: 0 }], o));
    a.onfinish = done;
    later(done, C.t.landing + 150); // a hidden tab; finish() is idempotent
  }

  /* — S2c: the code flight (mobile, low-power, or the video never came) — */
  function codeFlight() {
    if (st !== "launch" && st !== "wait" && st !== "flight") return;
    setState("code");
    mark("flight");
    hideWait();
    lastEmit = null;
    killVideo();
    if (stillCv) { // L05's held frame: the code flight draws the plate itself
      drop(stillCv);
      stillCv = null;
      plateAt = -1e9;
      showPlate = imgOk;
    }
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
      sp: altCode && p.tower ? spiralSetup(p, p0, L / 1000) : null,
    };
    if (code.sp) code.k = M.min(1.2, M.max(0.35, code.sp.s1 / 0.55));
    if (showPlate && imgOk) patch = mkPatch();
    if (broom) {
      setBroom(0);
      broom.style.opacity = "1";
    }
    later(dome, C.t.domeAt);
    capsPlay(C.t.domeAt + (altLand ? C.t.fold : C.t.dome));
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
    if (code.sp) return setBroomSpiral(q);
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
    if (tail && q < 1) emit(tail[0], tail[1], code.sp ? tail[2] : 1 - 0.5 * q, t, C.trailMaxLite);
  }
  /** The overlay exits by the dome (the Seam geometry): an ellipse edge
   *  rising over `dome` ms on easeClip, revealing the page top. */
  function dome() {
    if (st !== "code") return;
    if (altLand) return fold();
    domeOn = true;
    mark("landing");
    R.classList.add("intro-landing");
    anim(intro, [{ clipPath: "ellipse(150% 150% at 50% -20%)" }, { clipPath: "ellipse(150% 150% at 50% -150%)" }],
      C.t.dome, C.easeClip, function () { finish(true, "played"); });
  }

  /* — intro.codeflight ALT "tower-spiral" ——————————————————————————— */
  /** The spiral round the plate's tallest tower, in stage px: its axis,
   *  foot and top, the orbit radius, and the broom's scale on the orbit
   *  (it darts away toward the castle, so it shrinks to `span` × R long). */
  function spiralSetup(p, p0, s0) {
    var T = p.tower, sp = C.spiral;
    var S = {
      x: fitP.x + T.x * fitP.w,
      base: fitP.y + T.base * fitP.h,
      top: fitP.y + T.top * fitP.h - 0.04 * H,
      R: M.max(24, T.hw * fitP.w * sp.radius),
    };
    S.s1 = M.max(0.04, M.min(s0 * 0.6, (S.R * sp.span) / 1000));
    var o0 = [S.x - S.R, S.base], dd = M.max(40, M.hypot(o0[0] - p0[0], o0[1] - p0[1]));
    // the lift: straight up off the plate pose, into the orbit heading up
    S.lift = [p0, [p0[0], p0[1] - 0.3 * dd], [o0[0], o0[1] + 0.4 * dd], o0];
    var o1 = orbit(S, 1), l = 0.12 * H, tl = M.hypot(o1[3], o1[4]) || 1;
    var c = [o1[0] + (o1[3] / tl) * l, o1[1] + (o1[4] / tl) * l];
    // the exit: along the orbit's last tangent, then straight up out of frame
    S.exit = [[o1[0], o1[1]], c, [c[0], -0.35 * H]];
    return S;
  }
  /** Orbit at u ∈ [0,1]: [x, y, depth z (1 = in front of the tower), dx, dy, dz]
   *  (the derivative per u, for the heading and the broom's foreshortening). */
  function orbit(S, u) {
    var sp = C.spiral, K = sp.turns * 2 * PI, th = PI + u * K, r = S.R * (1 - 0.3 * u), dr = -0.3 * S.R;
    var rise = S.top - S.base;
    return [S.x + r * M.cos(th), S.base + rise * u, M.sin(th),
      dr * M.cos(th) - r * M.sin(th) * K, rise, dr * M.sin(th) + r * M.cos(th) * K];
  }
  /** Pose the broom on the spiral at linear time q. Handle first along the
   *  screen heading φ, its length foreshortened by the share of the motion
   *  that runs in depth (seen end-on at the orbit's sides), mirrored when it
   *  heads right so its lit side stays up (the flip lands where it points
   *  straight up, so only its shading turns); the plate pose blends into the
   *  path pose over the lift.
   *  Behind the tower it dims and shrinks. Returns [tailX, tailY, size]. */
  function setBroomSpiral(q) {
    var S = code.sp, sp = C.spiral, pos, dv, z = 0, lf = 1, w = 1, s, o;
    if (q < sp.lift) {
      var x = q / sp.lift, f = x + 0.5 * x * (1 - x); // eases out, still moving as it joins the orbit
      pos = bz(S.lift, f);
      dv = bzd(S.lift, f);
      w = f;
      o = orbit(S, 0);
      lf = M.hypot(o[3], o[4]) / (M.hypot(o[3], o[4], o[5]) || 1);
      lf = 1 + (lf - 1) * f; // the dart away into depth foreshortens it
      s = code.s0 + (S.s1 - code.s0) * f;
    } else if (q < sp.exit) {
      o = orbit(S, (q - sp.lift) / (sp.exit - sp.lift));
      pos = [o[0], o[1]];
      dv = [o[3], o[4]];
      z = o[2];
      lf = M.hypot(o[3], o[4]) / (M.hypot(o[3], o[4], o[5]) || 1);
      s = S.s1;
    } else {
      var v = (q - sp.exit) / (1 - sp.exit), X = S.exit, u1 = 1 - v;
      pos = [u1 * u1 * X[0][0] + 2 * u1 * v * X[1][0] + v * v * X[2][0], u1 * u1 * X[0][1] + 2 * u1 * v * X[1][1] + v * v * X[2][1]];
      dv = [2 * u1 * (X[1][0] - X[0][0]) + 2 * v * (X[2][0] - X[1][0]), 2 * u1 * (X[1][1] - X[0][1]) + 2 * v * (X[2][1] - X[1][1])];
      z = orbit(S, 1)[2] * (1 - E(clamp01(v / 0.5))); // clears the spire: back in the light
      s = S.s1;
    }
    var phi = M.atan2(dv[1], dv[0]), mir = dv[0] > 0 ? -1 : 1;
    var rho = mir < 0 ? phi : phi + PI, sx = mir * M.max(sp.minLen, lf), a0 = code.a0;
    if (w < 1) { // plate pose (sx 1, rotate a0) → path pose
      while (rho - a0 > PI) rho -= 2 * PI;
      while (rho - a0 < -PI) rho += 2 * PI;
      rho = a0 + (rho - a0) * w;
      sx = 1 + (sx - 1) * w;
    }
    s *= 1 + 0.16 * z;
    code.pos = pos;
    if (broom) {
      broom.style.transform = "translate(" + (pos[0] - 500).toFixed(1) + "px," + (pos[1] - 100).toFixed(1) +
        "px) rotate(" + rho.toFixed(4) + "rad) scale(" + (sx * s).toFixed(4) + "," + s.toFixed(4) + ")";
      broom.style.opacity = (1 - 0.55 * M.max(0, -z)).toFixed(3);
    }
    if (w < 1) return null;
    return [pos[0] + 500 * sx * s * M.cos(rho), pos[1] + 500 * sx * s * M.sin(rho), 0.55 + 0.45 * (1 + z) / 2];
  }

  /* — intro.landing ALT "map-fold" ——————————————————————————————————— */
  /** "Mischief managed": the overlay folds shut like the map — the page
   *  turns away on a hinge at its right edge (rotateY, perspective, the
   *  enter/exit ease over C.t.fold), so the name zone on the left clears
   *  first (I14) and the text never ghosts over the name; the canvas washes
   *  the turning page to parchment shade. Replaces the sweep (video) and the
   *  dome (code flight). Transform only; finish() cancels it. */
  function fold() {
    domeOn = true; // exiting: Skip / Esc / Tab stand down (intro.css hides Skip at once: it never turns with the page)
    mark("landing");
    R.classList.add("intro-landing", "intro-fold");
    // the wash fades in with the turn: alpha 1 by p = .35 (the old ramp)
    var sh = shade();
    if (sh) anim(sh, [{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 1 }], C.t.fold, C.ease);
    var pp = "perspective(" + C.foldPerspective + "px) rotateY(";
    anim(intro, [{ transform: pp + "0deg)" }, { transform: pp + -C.foldDeg + "deg)" }], C.t.fold, C.ease,
      function () { finish(true, "played"); });
    kick();
  }
  /** M2 (ART-DIRECTOR #8): the turning page is a folded map (M5: inked as
   *  the Pirates' sea chart, chartMarks) — parchment in three panels
   *  (creases, the shaded middle panel) inside an inked border; the free
   *  (left) edge darkens into a soft shadow that the CSS mask (app/intro.css,
   *  html.intro-fold) feathers out, so no hard-edged card rotates over the
   *  hero. P3-3: drawn ONCE into #intro-shade (above the canvas, below the
   *  broom); the fold fades it in by WAAPI opacity — no per-frame fills. */
  function shade() {
    if (shadeCv) return shadeCv;
    var nd = M.min(C.dprMax || 1.5, w.devicePixelRatio || 1), c = canvas(W * nd, H * nd), g = c.getContext("2d");
    if (!g) return null;
    c.id = "intro-shade";
    c.setAttribute("aria-hidden", "true");
    g.setTransform(nd, 0, 0, nd, 0, 0);
    var i, pw = W / 3, sw = M.min(160, W * 0.12);
    g.fillStyle = "rgba(214,189,136,.88)"; // the map's paper
    g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(92,62,24,.14)"; // the middle panel, folded away from the light
    g.fillRect(pw, 0, pw, H);
    g.fillStyle = "rgba(74,48,18,.45)"; // the creases
    for (i = 1; i < 3; i++) g.fillRect(M.round(i * pw) - 1, 0, 2, H);
    g.strokeStyle = "rgba(58,36,14,.5)"; // the inked border
    g.lineWidth = 1.5;
    g.strokeRect(24.5, 24.5, W - 49, H - 49);
    var gr = g.createLinearGradient(0, 0, W, 0); // turning out of the light: the far edge darkest
    gr.addColorStop(0, "rgba(28,18,8,.4)");
    gr.addColorStop(1, "rgba(28,18,8,.06)");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    chartMarks(g, 1);
    var e = g.createLinearGradient(0, 0, sw, 0); // the soft edge shadow
    e.addColorStop(0, "rgba(12,8,4,.55)");
    e.addColorStop(1, "rgba(12,8,4,0)");
    g.fillStyle = e;
    g.fillRect(0, 0, sw, H);
    film.appendChild(c);
    shadeCv = c;
    return c;
  }
  /** M5 (blind A00 mid, Pirates .50–.60: "a blank parchment panel"): the
   *  folding page lands us at the Pearl, so it is inked as a SEA CHART on its
   *  hinge-side panel (the part still in view as it turns edge-on) — a
   *  compass rose, and a dotted course to a red X (Pirates' own "X marks the
   *  spot"). Strokes and fills only: no lettering on the canvas. */
  function chartMarks(cx, a) {
    if (a <= 0) return;
    var i, r = M.max(28, M.min(W, H) * 0.11), rx = W * 0.83, ry = H * 0.34;
    var ink = "rgba(58,36,14," + (0.78 * a).toFixed(3) + ")";
    cx.strokeStyle = ink;
    cx.lineWidth = 1.5;
    cx.beginPath();
    cx.arc(rx, ry, r, 0, 2 * PI);
    cx.stroke();
    cx.beginPath();
    cx.arc(rx, ry, r * 0.8, 0, 2 * PI);
    cx.stroke();
    cx.fillStyle = "rgba(58,36,14," + (0.5 * a).toFixed(3) + ")";
    function point(ang, len, half) {
      var px = half * M.cos(ang + PI / 2), py = half * M.sin(ang + PI / 2);
      cx.beginPath();
      cx.moveTo(rx + px, ry + py);
      cx.lineTo(rx + len * M.cos(ang), ry + len * M.sin(ang));
      cx.lineTo(rx - px, ry - py);
      cx.closePath();
      cx.fill();
      cx.stroke();
    }
    for (i = 0; i < 4; i++) point(-PI / 2 + (i * PI) / 2, r * 1.25, r * 0.13);
    for (i = 0; i < 4; i++) point(-PI / 4 + (i * PI) / 2, r * 0.66, r * 0.09);
    // the course: dotted, from the page's lower edge to the X
    var x0 = W * 0.7, y0 = H * 0.94, xx = W * 0.9, xy = H * 0.7, k = M.max(9, r * 0.2);
    cx.setLineDash([2, 7]);
    cx.lineWidth = 2;
    cx.beginPath();
    cx.moveTo(x0, y0);
    cx.bezierCurveTo(W * 0.78, H * 0.82, W * 0.8, H * 0.66, xx - k * 1.6, xy + k * 0.4);
    cx.stroke();
    cx.setLineDash([]);
    cx.strokeStyle = "rgba(128,28,16," + (0.9 * a).toFixed(3) + ")";
    cx.lineWidth = 3;
    cx.beginPath();
    cx.moveTo(xx - k, xy - k);
    cx.lineTo(xx + k, xy + k);
    cx.moveTo(xx + k, xy - k);
    cx.lineTo(xx - k, xy + k);
    cx.stroke();
  }

  /* — intro.play ALT "marauders-ink" ——————————————————————————————————— */
  /** Lay the ink route — a cubic from below the frame up to just under
   *  Play — and the footprints along it (stride apart, alternating sides;
   *  the last one steps beside the one before: the walker stops at Play).
   *  A print that would touch a text box is dropped (I18). Runs from
   *  layoutCandles (arm, resize, font swap), so it tracks the live layout;
   *  the timeline keeps its clock (inkAt). */
  function layoutInk(texts) {
    var I = C.ink, k = lite ? I.kLite : I.k, pr = play.getBoundingClientRect(), i;
    var Ept = [pr.left + pr.width / 2, pr.bottom + I.gap * k];
    var Spt = [M.min(W - 24, Ept[0] + 0.12 * W + 40), H + 24], dy = Spt[1] - Ept[1];
    var P = [Spt, [Spt[0] + 0.06 * W, Spt[1] - dy * 0.38], [Ept[0] - 0.05 * W - 20, Ept[1] + dy * 0.42], Ept];
    var n = 64, pts = [], len = [0];
    for (i = 0; i <= n; i++) pts.push(bz(P, i / n));
    for (i = 1; i <= n; i++) len.push(len[i - 1] + M.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    var L = len[n], st2 = I.stride * k;
    var along = function (dd) {
      var j = 1;
      while (j < n && len[j] < dd) j++;
      var a = pts[j - 1], b = pts[j], f = len[j] > len[j - 1] ? clamp01((dd - len[j - 1]) / (len[j] - len[j - 1])) : 0;
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, M.atan2(b[1] - a[1], b[0] - a[0])];
    };
    var N = M.max(3, M.min(18, M.floor(L / st2) + 1)), prints = [], prev = -1e9;
    var stepMs = M.min(I.stepMs, (I.walkMaxMs - I.stepAt) / N);
    // when the ink head (easeDraw over routeMs) passes arc length dd: the
    // walker never steps ahead of the ink
    var tHead = function (dd) {
      var lo = 0, hi = 1;
      for (var it = 0; it < 18; it++) { var mid = (lo + hi) / 2; if (ED(mid) * L < dd) lo = mid; else hi = mid; }
      return hi * I.routeMs;
    };
    for (i = 0; i < N; i++) {
      var last = i === N - 1, dd = last ? L - st2 * 0.15 : L - (N - 2 - i) * st2 - st2 * 0.15;
      if (dd < 0) continue;
      var q = along(dd), side = i % 2 ? 1 : -1, off = I.side * k;
      if (last) q[2] = along(L - st2)[2]; // the pair stands together, facing Play
      var x = q[0] - M.sin(q[2]) * off * side, y = q[1] + M.cos(q[2]) * off * side;
      var rb = { l: x - 7 * k, t: y - 7 * k, r: x + 7 * k, b: y + 7 * k }, clash = false;
      for (var tI = 0; tI < texts.length && !clash; tI++) if (hits(rb, texts[tI])) clash = true;
      if (clash || x < 4 || x > W - 4 || y < 4) continue;
      var at2 = M.min(I.walkMaxMs, M.max(I.stepAt + i * stepMs, tHead(dd) + 60, prev + 60));
      prev = at2;
      prints.push({ x: x, y: y, a: q[2], side: side, at: at2, final: i >= N - 2 });
    }
    var end = 0;
    for (i = 0; i < prints.length; i++) end = M.max(end, prints[i].at + I.fadeInMs + (prints[i].final ? 0 : I.holdMs + I.fadeOutMs));
    ink = { pts: pts, len: len, L: L, k: k, prints: prints, end: M.max(end, I.routeMs) };
  }
  function setInked() {
    if (inked || !altPlay || st === "idle") return;
    inked = true;
    R.classList.add("intro-inked");
  }
  /** One shoe print (IC-HP-06, our own drawing): a sole and a heel, toes
   *  along the heading, splayed a little outward. */
  function footprint(p, k, a) {
    cx.save();
    cx.globalAlpha = a;
    cx.translate(p.x, p.y);
    cx.rotate(p.a + PI / 2 + p.side * 0.1);
    cx.beginPath();
    cx.ellipse(0, -3.4 * k, 2.5 * k, 4.3 * k, 0, 0, 2 * PI);
    cx.fill();
    cx.beginPath();
    cx.ellipse(0, 4.4 * k, 2 * k, 2.3 * k, 0, 0, 2 * PI);
    cx.fill();
    cx.restore();
  }
  /** Stroke the route up to arc length `upTo`, offset `off` px to one side. */
  function inkPath(upTo, off, from) {
    var P = ink.pts, Ls = ink.len, i, started = false;
    cx.beginPath();
    for (i = 0; i < P.length; i++) {
      if (Ls[i] < (from || 0)) continue;
      if (Ls[i] > upTo) break;
      var j = M.min(i + 1, P.length - 1), h = i ? i - 1 : 0;
      var ang = M.atan2(P[j][1] - P[h][1], P[j][0] - P[h][0]);
      var x = P[i][0] - M.sin(ang) * off, y = P[i][1] + M.cos(ang) * off;
      if (started) cx.lineTo(x, y); else { cx.moveTo(x, y); started = true; }
    }
    cx.stroke();
  }
  /** Draws the ink; returns true while it still changes (keeps the loop up). */
  function drawInk(t) {
    var I = C.ink, e = t - inkAt, k = ink.k, fade = 1, i;
    if (st !== "armed") {
      fade = 1 - clamp01((t - launchAt) / C.t.base);
      if (fade <= 0) { ink = null; return false; }
    }
    var head = ED(clamp01(e / I.routeMs)) * ink.L;
    if (e >= I.routeMs * 0.92) setInked();
    cx.strokeStyle = cx.fillStyle = I.color;
    cx.lineCap = "round";
    cx.lineWidth = (1.4 + 0.6 * gat) * k;
    cx.setLineDash([1.6 * k, 6 * k]);
    cx.globalAlpha = fade * (I.routeAlpha + (0.9 - I.routeAlpha) * gat);
    if (head > 0) inkPath(head, 0);
    cx.setLineDash([]);
    if (gat > 0.004) { // hover / focus: the corridor's walls ink in, back from Play
      var reach = M.min(ink.L, 200 * k) * gat;
      cx.lineWidth = 1.2 * k;
      cx.globalAlpha = fade * 0.75 * gat;
      inkPath(ink.L, I.corridor * k, ink.L - reach);
      inkPath(ink.L, -I.corridor * k, ink.L - reach);
    }
    for (i = 0; i < ink.prints.length; i++) {
      var p = ink.prints[i], pe = e - p.at, a;
      if (pe <= 0) continue;
      if (pe < I.fadeInMs) a = pe / I.fadeInMs;
      else if (p.final || pe < I.fadeInMs + I.holdMs) a = 1;
      else a = 1 - clamp01((pe - I.fadeInMs - I.holdMs) / I.fadeOutMs);
      if (a > 0.004) footprint(p, k, a * I.printAlpha * fade);
    }
    cx.globalAlpha = 1;
    return st !== "armed" || e < ink.end;
  }

  /** Lift the broom out of the plate: fill its mask, feathered, drawn over
   *  the plate on the frame the SVG broom takes the plate broom's pose.
   *  The fill is the broom-less plate (IN-01-empty / IN-01m-empty: the
   *  same castle and rock, pixel-registered) when it has decoded; else the
   *  surroundings, pulled and pushed over a mip pyramid (a soft smear). */
  function mkPatch() {
    if (eimgOk && eimg && plate && eimgFor === plate.empty) {
      try {
        var eo = canvas(W, H), eg = eo.getContext("2d"), em = canvas(W, H);
        eg.drawImage(eimg, fitP.x, fitP.y, fitP.w, fitP.h);
        maskPath(em.getContext("2d"), 1, 6, 4);
        eg.globalCompositeOperation = "destination-in";
        eg.drawImage(em, 0, 0);
        return { c: eo, at: now() };
      } catch { /* fall through to pull-push */ }
    }
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
    // each glow drifts a little once shed (turbulence: the stream frays)
    var ang = M.random() * 2 * PI;
    trail.push({ x: x, y: y, s: s, t: t, cut: 0, vx: M.cos(ang) * 9, vy: M.sin(ang) * 9 - 5, ph: M.random() * 2 * PI });
    while (trail.length > max) trail.shift();
  }
  /** The trail TAPERS to nothing: every glow shrinks as it fades (radius ∝
   *  alpha^0.7), frays with age (a slow drift + a wobble growing with age),
   *  and the stream is composited from its own layer at TRAIL_PEAK, so its
   *  core never exceeds ~0.6 luminance — a trail of light, not a tube. */
  var TRAIL_PEAK = 0.6;
  function drawTrail(t) {
    var G = sprites.g, g = tlx || cx, k = code ? code.k : 1, drew = false;
    if (tlx) { tlx.globalAlpha = 1; tlx.clearRect(0, 0, W, H); }
    for (var i = trail.length - 1; i >= 0; i--) {
      var p = trail[i], age = t - p.t, a = M.exp(-age / C.trailTau);
      if (a < 0.03 || p.cut) { trail.splice(i, 1); continue; }
      var sec = age / 1000, wob = (1 - a) * 3.5 * M.sin(p.ph + age / 170);
      var r = G.r * (0.45 + 0.55 * p.s) * k * M.pow(a, 0.7);
      var x = p.x + p.vx * sec + wob, y = p.y + p.vy * sec + wob * 0.6;
      g.globalAlpha = a;
      g.drawImage(G.c, x - r, y - r, r * 2, r * 2);
      drew = true;
    }
    if (tlx && drew) {
      cx.globalAlpha = TRAIL_PEAK;
      cx.drawImage(tl, 0, 0, W, H);
    }
  }
  function near(p, r, m) {
    return p.x > r.left - m && p.x < r.right + m && p.y > r.top - m && p.y < r.bottom + m;
  }

  /* — exits ———————————————————————————————————————————————————————— */
  /** SX: Skip / Esc / scroll intent / hidden > 30 s. Content ≤ 0.4 s (I9).
   *  The overlay's TEXT layer (credits, oath, Play and its bracket, Skip)
   *  is gone within 80 ms (html.intro-leaving, app/intro.css), so no line
   *  ever double-exposes over the name; only the plate/canvas and the night
   *  ground fade, over dur.base. The hero is already OPEN underneath (it
   *  opens on intro:end without an aperture, as on the landed path). No
   *  bookend line: Q-HP-2 lives in the credits and the footer egg. */
  function dismiss(reason) {
    if (st === "idle" || st === "leaving" || exiting()) return;
    setState("leaving");
    mark("dismiss");
    ses("intro-seen", "1");
    capsStop(80);
    killVideo();
    if (lv) killLive();
    R.classList.add("intro-leaving"); // the hero opens on this class (hero-stage.tsx)
    anim(intro, [{ opacity: 1 }, { opacity: 0 }], C.t.base, C.ease, function () { finish(false, reason); });
  }

  /** The overlay's "Skip to the research" (PHASE3-SPEC §11.3): dismiss()
   *  now; the jump follows in finish(), once `inert` is off (IntroBridge:
   *  the fonts, then scrollToTarget; before hydration, the browser's own
   *  hash navigation). Hidden from the hold on: the overlay is leaving. */
  function fastLane() {
    if (st === "idle" || st === "leaving" || exiting()) return;
    fastHref = (fast && fast.getAttribute("href")) || "";
    dismiss("fastlane");
  }
  function fastOn() { return !!(fast && w.matchMedia && w.matchMedia("(min-width: 64rem)").matches); }

  /** S4 / end of SX: release everything, hand the page back. Light work on
   *  the played path: the video, `inert` and the hero's media re-render are
   *  already behind us (the hold). Then the titles (S5). */
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
    if (video) try { video.pause(); } catch { /* gone */ } // unloaded after the hand-off frame
    if (lv) killLive();
    ses("intro-seen", "1");
    setInert(false);
    for (i = 0; i < CLASSES.length; i++) R.classList.remove(CLASSES[i]);
    R.setAttribute("data-intro", played ? "played" : "skipped");
    for (i = 0; i < owned.length; i++) try { owned[i].cancel(); } catch { /* gone */ }
    owned = [];
    drop(cv);
    cv = cx = null;
    drop(holdCv);
    drop(shadeCv);
    drop(stillCv);
    holdCv = shadeCv = stillCv = null;
    var sty = stage.style; // the wipe's mask (the overlay is display:none now)
    sty.removeProperty("-webkit-mask-image");
    sty.removeProperty("mask-image");
    sty.removeProperty("-webkit-mask-repeat");
    sty.removeProperty("mask-repeat");
    sty.removeProperty("-webkit-mask-size");
    sty.removeProperty("mask-size");
    if (broom) { broom.style.transform = ""; broom.style.opacity = ""; }
    cands = []; trail = []; motes = null; patch = null; code = null; domeOn = false;
    ink = null; inked = false; frozen = false; trailOn = false; vfOn = false;
    tl = tlx = null; eimg = null; eimgOk = false;
    // S5: the opening titles on the played path with motion on; any other
    // end (a dismissal, Pause / RM mid-way) shows the final hero at once
    if (played && !motionOff()) titles();
    else capsStop(0);
    if (!capTimer) quietEnd(); // nothing left running (no captions at all)
    mark("end");
    fire("intro:end", { played: played, reason: reason, href: reason === "fastlane" ? fastHref : undefined });
    // focus (forces layout) after the hand-off frame has painted, in its own
    // task; the fast lane's focus is the jump's (#work)
    var jump = reason === "fastlane" ? fastHref : "";
    var after = function () {
      setTimeout(function () {
        killVideo();
        if (!jump) focusLanding();
        else if (!w.__introHydrated) try { w.location.hash = jump; } catch { /* stays on the hero */ }
      }, 0);
    };
    if (w.requestAnimationFrame) w.requestAnimationFrame(after); else after();
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
      if (st === "leaving" || exiting()) return;
      var list = (st === "armed" ? [play] : []).concat(fastOn() ? [fast, skip] : [skip]), i = list.indexOf(d.activeElement);
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
      if (lv) try { lv.pause(); } catch { /* no-op */ }
      return;
    }
    if (lv && st === "armed") { var lp = lv.play(); if (lp && lp.catch) lp.catch(noop); }
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
