// scripts/checks/beats.mjs: PHASE3-SPEC §3.4 checks 1, 2, 3, 11, 12, 13 (static) and 14,
// over the beats, tempo and estVh in lib/page.ts (sections) and lib/film.ts (act cards at
// p × travel; the intro's B00/B01 in film.prologue.beats). Owner: B1-BEATS (PHASE3-PLAN §4.7).
//
// Severity (spec §3.4, plan §5.3): structure, rations (#3), star spans (#11) and hooks (#14)
// are ERRORS; gaps (#1), competing stars (#2), pacing (#12) and carried shapes (#13) are
// release gates (a warning in `npm run check`, an error under RELEASE=1).
//
// Geometry (lib/beats.ts "UNITS"): an item's top is the sum of the estVh of the items above
// it (viewports × 100 = vh). A beat's `at` / `span` are vh of viewport-top scroll from its
// item's top @1440; at 1024 an offset ≥ 0 sits at the same fraction of the item (× t / d)
// and a negative one (the item still rising from below) is kept as is. Competing stars and
// pacing are judged at 1440 (the beat map's width); gaps and star spans at both widths.
// The runtime probe (tools/capture/beats.mjs) re-measures the real DOM.

/** Every kind of spec §3.4. */
const KINDS = new Set([
  "transition", "push-title", "push-in", "title", "scrub-sentence", "subtitle", "physical-word",
  "fly-through", "impact", "letterbox", "match-cut", "signature", "toy-invite", "stage-cue", "post-credits",
]);
/** Kinds that are never a star (spec §2.1 quiet kinds; an impact sits inside its transition). */
const NEVER_STAR = new Set(["subtitle", "impact"]);
/** Research section types: stars ≤ weight 1 except existing signatures (spec §2.1). */
const RESEARCH = new Set(["chapter", "ledger", "experiment", "matrix"]);
/** Spec §2.3 rows merged into the row before them (B04–05 is B04, …). */
const MERGED_ROWS = new Set([5, 15, 37, 49, 51]);
const LAST_ROW = 58;
const WEATHER = ["spray", "chalk", "fireflies", "motes"];
const ID = /^B\d{2}(?:-[a-z0-9]+)*$/;
const FEATURE = /^P3-\d+$/;
/** Rounding slack: the beat map is in px, the data in 0.1 vh. */
const EPS = 1;
const MIN_STAR_PX = 300;
const VP = { d: { w: 1440, h: 900 }, t: { w: 1024, h: 768 } };

const rowOf = (id) => Number(id.slice(1, 3));
const slugs = (id) => id.split("-").slice(1);
const fmt = (n) => (Math.round(n * 10) / 10).toString();

export default function run({ RELEASE, err, warn, gate, page, film, derive }) {
  const enabled = page.filter((s) => s.enabled !== false);
  const items = derive.pageItemsOf(enabled, film);
  const actSpec = (id) => film.acts.find((a) => a.id === id);
  const worldIds = new Set(Object.keys(film.worlds));
  const actIds = new Set(film.acts.map((a) => a.id));

  /* — the page items, in order ——————————————————————————————————————— */
  const rows = items.map((it) => {
    if (it.kind === "act") {
      const a = actSpec(it.act) ?? {};
      return {
        key: `film.acts ${it.act} (card ${it.id})`,
        id: it.id,
        card: true,
        type: "card",
        act: it.act,
        world: it.to,
        travel: film.cardTravel?.[it.transition] ?? 0,
        landAt: a.landAt,
        logline: Boolean(a.logline?.text),
        tempo: a.tempo,
        estVh: a.estVh,
        beats: a.beats,
        stage: a.stage,
      };
    }
    const s = it.entry;
    return {
      key: `"${s.id}"`,
      id: s.id,
      card: false,
      type: s.type,
      act: s.act ?? null,
      world: it.world,
      tempo: s.tempo,
      estVh: s.estVh,
      beats: s.beats,
      stage: s.stage,
    };
  });

  /* — structure (ERROR) ————————————————————————————————————————————— */
  const byId = new Map();
  const all = []; // { b, item } for every declared beat (page + prologue + disabled entries)
  const declare = (b, item, where) => {
    if (!b || typeof b !== "object") return err(`[P3 beats] ${where}: a beat must be an object`);
    if (!ID.test(b.id ?? "")) err(`[P3 beats] ${where}: id "${b.id}" must be B<nn> or B<nn>-<slug> (lowercase)`);
    else if (byId.has(b.id)) err(`[P3 beats] duplicate beat id "${b.id}" (${byId.get(b.id)} and ${where})`);
    else byId.set(b.id, where);
    if (!KINDS.has(b.kind)) err(`[P3 beats] ${b.id}: unknown kind "${b.kind}"`);
    if (b.timing !== "scroll" && b.timing !== "time") err(`[P3 beats] ${b.id}: timing must be "scroll" | "time"`);
    if (!Number.isFinite(b.at) || !Number.isFinite(b.span) || b.span < 0) err(`[P3 beats] ${b.id}: at / span must be numbers (span ≥ 0)`);
    if (b.star !== undefined && b.star !== true) err(`[P3 beats] ${b.id}: star is true or absent`);
    if (b.kind === "signature" && !b.star) err(`[P3 beats] ${b.id}: a signature beat is a star (spec §2.1): add star + weight`);
    if (b.star && NEVER_STAR.has(b.kind)) err(`[P3 beats] ${b.id}: a ${b.kind} is never a star`);
    if (b.weight !== undefined && ![1, 2, 3].includes(b.weight)) err(`[P3 beats] ${b.id}: weight must be 1 | 2 | 3`);
    if (b.weight !== undefined && !b.star) err(`[P3 beats] ${b.id}: weight without star (only stars carry a weight)`);
    if (b.push !== undefined && b.kind !== "push-title") err(`[P3 beats] ${b.id}: push is for push-title beats only`);
    if (b.kind === "push-title" && b.push !== "in" && b.push !== "sun") err(`[P3 beats] ${b.id}: a push-title says push: "in" | "sun"`);
    if (b.pairWith !== undefined && b.kind !== "match-cut") err(`[P3 beats] ${b.id}: pairWith is for match-cut beats only`);
    if (b.needsIdle !== undefined && (b.needsIdle !== true || b.timing !== "time")) err(`[P3 beats] ${b.id}: needsIdle (true) is for time beats only`);
    if (b.world !== undefined && !worldIds.has(b.world)) err(`[P3 beats] ${b.id}: unknown world "${b.world}"`);
    if (b.act !== undefined && !actIds.has(b.act)) err(`[P3 beats] ${b.id}: unknown act "${b.act}"`);
    if (b.feature !== "existing" && !FEATURE.test(b.feature ?? "")) err(`[P3 beats] ${b.id}: feature must be "P3-<n>" | "existing"`);
    all.push({ b, item });
  };
  for (const b of film.prologue?.beats ?? []) declare(b, null, "film.prologue.beats");
  for (const r of rows) for (const b of r.beats ?? []) declare(b, r, r.key);
  // disabled entries and acts not in use keep their ids unique too
  for (const s of page) if (s.enabled === false) for (const b of s.beats ?? []) declare(b, null, `"${s.id}" (disabled)`);
  const inUse = new Set(rows.filter((r) => r.card).map((r) => r.act));
  for (const a of film.acts) if (!inUse.has(a.id)) for (const b of a.beats ?? []) declare(b, null, `film.acts ${a.id} (not in use)`);
  for (const { b } of all) {
    if (b.pairWith !== undefined && !byId.has(b.pairWith)) err(`[P3 beats] ${b.id}: pairWith "${b.pairWith}" is not a declared beat`);
  }
  // every spec §2.3 row is declared somewhere (B39 has no star: B39-<slug>)
  {
    const have = new Set([...byId.keys()].filter((id) => ID.test(id)).map(rowOf));
    const missing = [];
    for (let n = 0; n <= LAST_ROW; n++) if (!MERGED_ROWS.has(n) && !have.has(n)) missing.push(`B${String(n).padStart(2, "0")}`);
    if (missing.length) warn(`[P3 beats] spec §2.3 rows with no declared beat: ${missing.join(", ")}`);
  }

  /* — #12 (part) every item a tempo, beats and an estVh ————————————————— */
  for (const r of rows) {
    if (!["slow", "medium", "brisk"].includes(r.tempo)) gate(`[P3 #12] ${r.key} has no tempo ("slow" | "medium" | "brisk")`);
    if (!r.beats?.length) gate(`[P3 #12] ${r.key} declares no beats`);
    const e = r.estVh;
    if (!(e && e.d > 0 && e.t > 0)) gate(`[P3 #12] ${r.key} has no estVh { d, t } (counted as 1 viewport; run tools/capture/beats.mjs --write)`);
  }
  for (const { b } of all) if (b.star && b.weight === undefined) gate(`[P3 #12] star ${b.id} has no weight`);

  /* — page geometry ——————————————————————————————————————————————— */
  const placed = []; // page beats only (the prologue plays before the page)
  {
    let topD = 0;
    let topT = 0;
    for (const r of rows) {
      const d = r.estVh?.d > 0 ? r.estVh.d : 1;
      const t = r.estVh?.t > 0 ? r.estVh.t : 1;
      const k = t / d;
      const mapT = (o) => (o < 0 ? o : o * k);
      for (const b of r.beats ?? []) {
        if (!Number.isFinite(b.at) || !Number.isFinite(b.span)) continue;
        placed.push({
          b,
          r,
          world: b.world ?? r.world,
          act: b.act ?? r.act,
          d: [topD + b.at, topD + b.at + b.span],
          t: [topT + mapT(b.at), topT + mapT(b.at + b.span)],
        });
      }
      topD += d * 100;
      topT += t * 100;
    }
    placed.page = { d: topD, t: topT };
  }
  const stars = placed.filter((p) => p.b.star);
  /** A star's occupancy at 1440: a scroll star its range; a time star its trigger zone
   *  (span 0 = at ± 50vh, spec §3.4 check 2). */
  const occ = (p) => (p.b.timing === "time" && p.b.span === 0 ? [p.d[0] - 50, p.d[0] + 50] : p.d);
  const overlap = (a, b) => Math.min(a[1], b[1]) - Math.max(a[0], b[0]);
  const where = (p) => `${p.b.id} (${p.r.id})`;
  /** One set piece: the card's transition + push-title stars (sequential by construction). */
  const setPiece = (p) => p.r.card && (p.b.kind === "transition" || p.b.kind === "push-title");

  /* — #1 gaps (release gate) ————————————————————————————————————————— */
  for (const w of ["d", "t"]) {
    const sorted = [...placed].sort((x, y) => x[w][0] - y[w][0]);
    let end = -Infinity;
    let last = null;
    for (const p of sorted) {
      if (last && p[w][0] - end > 100 + EPS) {
        gate(`[P3 #1] ${fmt(p[w][0] - end)}vh with no beat at ${VP[w].w} between ${where(last)} and ${where(p)} (max 100vh)`);
      }
      if (p[w][1] > end) {
        end = p[w][1];
        last = p;
      }
    }
  }

  /* — #2 competing stars (release gate; 1440) ———————————————————————————— */
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const a = stars[i];
      const b = stars[j];
      if (rowOf(a.b.id) === rowOf(b.b.id)) continue; // one row: sequential by construction or by the spotlight
      if (a.r === b.r && setPiece(a) && setPiece(b)) continue; // a card's (a) → (b)
      const o = overlap(occ(a), occ(b));
      if (o > EPS) gate(`[P3 #2] competing stars ${where(a)} and ${where(b)} overlap by ${fmt(o)}vh at 1440`);
    }
  }

  /* — #3 rations (ERROR) ———————————————————————————————————————————— */
  {
    const of = (kind) => placed.filter((p) => p.b.kind === kind);
    const countBy = (list, key) => {
      const m = new Map();
      for (const p of list) m.set(key(p), [...(m.get(key(p)) ?? []), p.b.id]);
      return m;
    };
    const impacts = of("impact");
    if (impacts.length > 4) err(`[P3 #3] ${impacts.length} impacts (max 4): ${impacts.map((p) => p.b.id).join(", ")}`);
    for (const [w, ids] of countBy(impacts, (p) => p.world)) if (ids.length > 1) err(`[P3 #3] ${ids.length} impacts in world ${w} (max 1): ${ids.join(", ")}`);
    for (const [act, ids] of countBy(of("scrub-sentence"), (p) => p.act ?? "no act")) {
      if (ids.length > 1) err(`[P3 #3] ${ids.length} scroll-scrubbed sentences in ${act} (max 1 per act): ${ids.join(", ")}`);
    }
    const fly = of("fly-through");
    for (const [act, ids] of countBy(fly, (p) => p.act ?? "no act")) if (ids.length > 1) err(`[P3 #3] ${ids.length} fly-throughs in ${act} (max 1 per act): ${ids.join(", ")}`);
    for (const p of fly) {
      if (/snitch/.test(p.b.id)) err(`[P3 #3] ${p.b.id}: the snitch is never a fly-through (it counts as an egg)`);
      if (p.world === "idiots" || /drone|quad/.test(p.b.id)) err(`[P3 #3] ${p.b.id}: no fly-through in Act II's sensitive context (IC-3I-08)`);
    }
    const pushTitles = of("push-title");
    for (const p of pushTitles) if (!p.r.card) err(`[P3 #3] ${where(p)}: a push-title lives on an act card only`);
    for (const r of rows.filter((x) => x.card)) {
      const n = pushTitles.filter((p) => p.r === r).length;
      if (n !== 1) err(`[P3 #3] ${r.key}: ${n} push-title beats (exactly 1 per act card)`);
    }
    const pushIns = placed.filter((p) => (p.b.kind === "push-title" && p.b.push === "in") || p.b.kind === "push-in");
    if (pushIns.length < 3 || pushIns.length > 4) err(`[P3 #3] ${pushIns.length} push-ins (3–4): ${pushIns.map((p) => p.b.id).join(", ") || "none"}`);
    const titles = of("title");
    if (titles.length > 8) err(`[P3 #3] ${titles.length} titles in character (max 8)`);
    for (const [w, ids] of countBy(titles, (p) => p.world)) if (ids.length > 2) err(`[P3 #3] ${ids.length} titles in character in world ${w} (max 2): ${ids.join(", ")}`);
    for (const p of of("subtitle")) {
      if (!p.r.card) err(`[P3 #3] ${where(p)}: subtitles are the four loglines, static in the card bars (act cards only)`);
      else if (!p.r.logline) err(`[P3 #3] ${where(p)}: its act has no logline to subtitle`);
    }
    for (const [item, ids] of countBy(of("subtitle"), (p) => p.r.id)) if (ids.length > 1) err(`[P3 #3] ${item}: ${ids.length} subtitles (one logline per card)`);
    for (const [item, ids] of countBy(of("physical-word"), (p) => p.r.id)) if (ids.length > 1) err(`[P3 #3] ${item}: ${ids.length} physical words (max 1 per section)`);
    // weather: one kind per world (beat slugs + the stage cues; house is transparent)
    const weather = new Map();
    const addWeather = (w, kind, src) => {
      if (w === "house") return;
      const m = weather.get(w) ?? new Map();
      m.set(kind, [...(m.get(kind) ?? []), src]);
      weather.set(w, m);
    };
    for (const p of placed) for (const s of slugs(p.b.id)) if (WEATHER.includes(s)) addWeather(p.world, s, p.b.id);
    for (const r of rows) for (const c of r.stage?.cues ?? []) if (c.weather) addWeather(r.world, c.weather, `${r.id} stage cue`);
    for (const [w, m] of weather) {
      if (m.size > 1) err(`[P3 #3] world ${w} uses ${m.size} weather kinds (max 1): ${[...m].map(([k, src]) => `${k} (${src.join(", ")})`).join("; ")}`);
    }
    for (const p of placed) {
      if (slugs(p.b.id).includes("rack") && p.r.stage?.mode !== "split") err(`[P3 #3] ${where(p)}: rack focus only inside a split window`);
    }
  }

  /* — #11 star span (ERROR): every scroll star ≥ 300 px at 1440 and 1024 ———— */
  for (const p of stars) {
    if (p.b.timing !== "scroll") continue;
    for (const w of ["d", "t"]) {
      const px = ((p[w][1] - p[w][0]) * VP[w].h) / 100;
      if (px < MIN_STAR_PX - 0.5) err(`[P3 #11] scroll star ${where(p)} spans ${Math.round(px)} px at ${VP[w].w} (min ${MIN_STAR_PX}: stretch it or make it a time star)`);
    }
  }

  /* — #12 pacing (release gate; 1440) ———————————————————————————————————— */
  {
    // a weight-3 star (a card's (a) → (b) set piece counts as one)
    const heavy = [];
    for (const p of stars.filter((x) => x.b.weight === 3)) {
      const piece = setPiece(p) ? heavy.find((h) => h.r === p.r && h.piece) : null;
      if (piece) {
        piece.d = [Math.min(piece.d[0], p.d[0]), Math.max(piece.d[1], p.d[1])];
        piece.ids.push(p.b.id);
      } else heavy.push({ r: p.r, piece: setPiece(p), d: [...occ(p)], ids: [p.b.id] });
    }
    for (const h of heavy) {
      const breath = [h.d[1], h.d[1] + 100];
      for (const p of stars) {
        if (h.ids.includes(p.b.id) || (p.b.weight ?? 0) <= 1) continue;
        if (overlap(occ(p), breath) > EPS) gate(`[P3 #12] ${p.b.id} (weight ${p.b.weight}) sits in the breath after ${h.ids.join("/")} (≥ 1 viewport of weight ≤ 1)`);
      }
    }
    for (let i = 0; i < heavy.length; i++) {
      for (let j = i + 1; j < heavy.length; j++) {
        const [a, b] = [heavy[i], heavy[j]];
        if (a.r === b.r && a.r.card) continue;
        const gap = Math.max(b.d[0] - a.d[1], a.d[0] - b.d[1]);
        if (gap < 200 - EPS) gate(`[P3 #12] weight-3 stars ${a.ids.join("/")} and ${b.ids.join("/")} are ${fmt(Math.max(0, gap))}vh apart (min 2 viewports outside a card)`);
      }
    }
    for (const p of stars) {
      if (!RESEARCH.has(p.r.type) || (p.b.weight ?? 0) <= 1) continue;
      if (!(p.b.kind === "signature" && p.b.feature === "existing")) gate(`[P3 #12] ${where(p)}: research sections keep stars at weight ≤ 1 (only existing signatures may be heavier)`);
    }
  }

  /* — #13 carried shapes (static part; the probe checks the real frames) ——— */
  for (const p of placed.filter((x) => x.b.pairWith)) {
    const other = placed.find((x) => x.b.id === p.b.pairWith);
    if (!other) continue; // undeclared: an error above; not on the page: its item is off
    for (const w of ["d", "t"]) {
      const apart = -overlap(p[w], other[w]);
      if (apart > 100 + EPS) gate(`[P3 #13] match cut ${p.b.id} ↔ ${other.b.id}: the halves are ${fmt(apart)}vh apart at ${VP[w].w} (both must share a viewport)`);
    }
  }

  /* — #14 hooks (ERROR) —————————————————————————————————————————————— */
  for (const r of rows.filter((x) => x.card)) {
    if (!(typeof r.landAt === "number" && r.landAt > 0 && r.landAt <= 1)) err(`[P3 #14] ${r.key}: landAt must be a p in (0, 1]`);
    if (!r.travel) continue; // a card with no travel (reel / title) has no p
    const hook = (r.beats ?? []).find((b) => b.star && b.at >= 0 && b.at <= 0.05 * r.travel);
    if (!hook) err(`[P3 #14] ${r.key}: no star begins at p ≤ .05 (its hook frame)`);
    for (const b of r.beats ?? []) {
      if ((b.kind === "transition" || b.kind === "push-title" || b.kind === "impact") && (b.at < 0 || b.at + b.span > r.travel + EPS)) {
        err(`[P3 #14] ${b.id}: a card's pinned beats sit inside its travel (0–${r.travel}vh = p 0–1)`);
      }
    }
  }

  const nStars = all.filter(({ b }) => b.star).length;
  console.log(
    `  beats: ${all.length} declared (${nStars} stars) on ${rows.length} items; page ≈ ${fmt(placed.page.d)}vh @1440, ${fmt(placed.page.t)}vh @1024` +
      `${RELEASE ? " (RELEASE: gaps, overlaps and pacing are errors)" : ""}`,
  );
}
