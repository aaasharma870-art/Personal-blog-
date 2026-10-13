// Score the P3-11 panel (J2-J4: would you keep scrolling / tempo / game discovery) against PHASE3-SPEC section 13 (rubric) and
// section 2.2 (tempo). The assembler's script: the judges never see it, the spec tempo or the invite screens.
// Usage: node tools/capture/score-panel.mjs --round=docs/build/motion-strips/p3-r3 [--out=<dir>]   (default out = <round>/verdicts)
// Reads   <round>/verdicts/panel-j{2,3,4}.json and <round>/screencast/reader-{1440,1024}/clips-panel.json.
// Writes  <out>/score-panel.json and <out>/score-panel.md.
//
// Method (the one round 2 used, written down so it can be re-run):
//  - screen ranges are the ones the judges drew themselves (J2, J3 and J4 agree to within one screen at the joints); each of a
//    judge's own parts is assigned to one canonical act (OPENING, ACT I = card + about + journey, ACT II = card to kill-list,
//    FILMS = the three-films hub and plates, ACT III = Frontier + beyond + writing + voices, ACT IV = the Light + principles,
//    CREDITS = contact + credits);
//  - keep-scrolling per act = yes screens / screens; "two consecutive no" = screens n and n+1 both "no";
//  - must-yes screens = the hand-off (screen 1), every screen with a clip of act-1..act-4 in clips-panel.json ("any clip" rule), and
//    the first Work screen (the first screen after the act-2 card screens that holds a work clip);
//  - tempo = a judge's word for a canonical act is the word of its parts weighted by screens (both widths); a tie is "tie" and
//    counts as wrong unless the spec word is one of the tied words and no other word leads; right if the word equals the spec word;
//    bar = right for >= 2 of the 3 judges;
//  - discovery = the chip is "noticed" if the judge names it with its words at screen 1; a toy invite counts if the judge lists B08
//    compass / B18 Run / B26 Take off / B28 Dead Eye at a screen within 3 of its first screen in clips-panel.json (row === id).
import fs from "node:fs";
import path from "node:path";

const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
const R = flags.round;
if (!R) {
  console.error("usage: node tools/capture/score-panel.mjs --round=docs/build/motion-strips/p3-rN [--out=dir]");
  process.exit(2);
}
const OUT = flags.out ?? path.join(R, "verdicts");
const J = Object.fromEntries(["J2", "J3", "J4"].map((j) => [j, JSON.parse(fs.readFileSync(path.join(R, "verdicts", `panel-${j.toLowerCase()}.json`), "utf8"))]));
const W = [1440, 1024];
const CP = Object.fromEntries(W.map((w) => [w, JSON.parse(fs.readFileSync(path.join(R, "screencast", `reader-${w}`, "clips-panel.json"), "utf8"))]));

// ---- canonical acts: spec tempo (section 2.2) and the order of a judge's own parts --------------------------------------------
const ACTS = [
  { id: "OPEN", name: "Opening + hero", spec: "slow" },
  { id: "A1", name: "Act I · The Crossing (card, about, journey)", spec: "medium" },
  { id: "A2", name: "Act II · The Workshop (card to kill-list)", spec: "brisk" },
  { id: "FILMS", name: "Films (three films and a game)", spec: "slow" },
  { id: "A3", name: "Act III · The Frontier (beyond, writing, voices)", spec: "medium" },
  { id: "A4", name: "Act IV · The Light (principles)", spec: "medium" },
  { id: "CRED", name: "Contact + credits", spec: "slow" },
];
// part index (in each judge's acts array) -> canonical act id. J4 has two rows per part (one per width): handled by name.
const PART_MAP = {
  J2: ["OPEN", "A1", "A1", "A1", "A2", "A2", "A2", "FILMS", "A3", "A3", "A3", "A4", "CRED"],
  J3: ["OPEN", "A1", "A1", "A1", "A2", "A2", "A2", "A2", "FILMS", "A3", "A3", "A3", "A4", "CRED"],
};
const j4Act = (n) =>
  /^Opening/.test(n) ? "OPEN"
  : /^(Act I:|About|The Crossing)/.test(n) ? "A1"
  : /^(Act II|Work case)/.test(n) ? "A2"
  : /^Films/.test(n) ? "FILMS"
  : /^(Act III|Writing|Voices)/.test(n) ? "A3"
  : /^Act IV/.test(n) ? "A4"
  : /^Contact/.test(n) ? "CRED"
  : null;

const range = (s) => {
  const m = /(\d+)\s*[-–]\s*(\d+)/.exec(s) ?? /^(\d+)$/.exec(String(s).trim());
  if (!m) return null;
  const a = +m[1];
  const b = m[2] ? +m[2] : a;
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
};
// returns { [w]: { [actId]: [screens] } , parts: [{act, w, screens, tempo}] } for a judge
function partsOf(jn) {
  const d = J[jn];
  const parts = [];
  d.acts.forEach((a, i) => {
    if (jn === "J4") {
      parts.push({ act: j4Act(a.act), name: a.act, w: +a.width, screens: range(a.screens), tempo: a.tempo });
    } else {
      const act = PART_MAP[jn][i];
      for (const w of W) {
        const m = new RegExp(`${w}:\\s*([\\d-]+)`).exec(a.screens);
        if (m) parts.push({ act, name: a.act, w, screens: range(m[1]), tempo: a.tempo });
      }
    }
  });
  return parts;
}

// ---- keep scrolling ---------------------------------------------------------------------------------------------------------
const cardScreens = (w) => {
  const out = {};
  for (const a of ["act-1", "act-2", "act-3", "act-4"]) out[a] = [...new Set(CP[w].clips.filter((c) => c.section === a).map((c) => c.screen))].sort((x, y) => x - y);
  return out;
};
const firstWork = (w) => {
  const cards = new Set(Object.values(cardScreens(w)).flat());
  const s = [...new Set(CP[w].clips.filter((c) => c.section === "work").map((c) => c.screen))].sort((x, y) => x - y).find((x) => !cards.has(x));
  return s ?? null;
};
const inviteScreens = (w) => {
  const o = {};
  for (const id of ["B08", "B18", "B26", "B28"]) {
    const row = CP[w].clips.find((c) => c.row === id);
    const star = CP[w].clips.find((c) => c.stars.some((s) => s.id === id || s.id === `${id}-invite`));
    o[id] = row?.screen ?? star?.screen ?? null;
  }
  return o;
};
const geom = Object.fromEntries(W.map((w) => [w, { cards: cardScreens(w), firstWork: firstWork(w), inviteScreens: inviteScreens(w) }]));

const result = { round: R, widths: geom, judges: {}, tempo: {}, discovery: {} };
const lines = [];
const say = (s = "") => lines.push(s);

const keepRows = {};
for (const jn of Object.keys(J)) {
  const rows = J[jn].screens;
  const parts = partsOf(jn);
  const out = { widths: {} };
  for (const w of W) {
    const keep = Object.fromEntries(rows.filter((r) => +r.width === w).map((r) => [+r.screen, r.keep === "yes"]));
    const n = Object.keys(keep).length;
    const yes = Object.values(keep).filter(Boolean).length;
    const acts = ACTS.map((A) => {
      const scr = [...new Set(parts.filter((p) => p.act === A.id && p.w === w).flatMap((p) => p.screens ?? []))].sort((x, y) => x - y);
      const y = scr.filter((s) => keep[s]).length;
      return { id: A.id, name: A.name, screens: scr.length ? `${scr[0]}–${scr[scr.length - 1]}` : "—", yes: y, of: scr.length, pct: scr.length ? Math.round((100 * y) / scr.length) : null, pass: scr.length ? y / scr.length >= 0.8 : null };
    });
    const twoNo = [];
    for (let s = 1; s < n; s++) if (keep[s] === false && keep[s + 1] === false) twoNo.push(`${s}–${s + 1}`);
    const g = geom[w];
    const must = [{ what: "hand-off s1", s: 1 }];
    for (const [a, ss] of Object.entries(g.cards)) for (const s of ss) must.push({ what: `${a} s${s}`, s });
    if (g.firstWork) must.push({ what: `work s${g.firstWork}`, s: g.firstWork });
    const missed = must.filter((m) => keep[m.s] === false).map((m) => m.what);
    out.widths[w] = { overall: `${yes}/${n}`, overallPct: +((100 * yes) / n).toFixed(1), acts, twoConsecutiveNo: twoNo, mustYesMissed: missed, pass: { perAct80: acts.every((a) => a.pass !== false), noTwoNo: twoNo.length === 0, mustYes: missed.length === 0 } };
  }
  out.scores10 = { keepScrolling: J[jn].scores.keepScrolling, tempo: J[jn].scores.tempo, discovery: J[jn].scores.discovery };
  out.scores5 = Object.fromEntries(Object.entries(out.scores10).map(([k, v]) => [k, +(v / 2).toFixed(2)]));
  result.judges[jn] = out;
  keepRows[jn] = out;
}

say(`# P3-11 round ${/p3-r(\d+)/.exec(R)?.[1] ?? "?"} · panel score (J2–J4; assembler)`);
say();
say(`Computed by \`tools/capture/score-panel.mjs\` from \`panel-j{2,3,4}.json\` and \`screencast/reader-{1440,1024}/clips-panel.json\` against PHASE3-SPEC §13 (P3-11 rubric) and §2.2 (tempo). Judges scored 0–10; the 1–5 axis value is half of it. Each judge's own parts are mapped to seven canonical acts (header of the script). Must-yes screens: the hand-off (s1), every screen holding a clip of an act card (any clip), and the first Work screen after the act-2 card screens.`);
say();
say(`Card screens: ${W.map((w) => `${w} ${JSON.stringify(geom[w].cards)}, first Work s${geom[w].firstWork}`).join("; ")}.`);
say();
say(`## Keep scrolling (bar: ≥ 80 % yes per act · no two consecutive no · hand-off, the four cards and the first Work screen all yes)`);
say();
say(`| judge · width | overall | per act (yes %; ✗ < 80) | two consecutive no | must-yes missed | bar |`);
say(`|---|---|---|---|---|---|`);
for (const jn of Object.keys(J)) {
  for (const w of W) {
    const o = keepRows[jn].widths[w];
    const acts = o.acts.filter((a) => a.of).map((a) => `${a.name.split(" (")[0].replace("Act I · The Crossing", "Act I").replace("Act II · The Workshop", "Act II").replace("Act III · The Frontier", "Act III").replace("Act IV · The Light", "Act IV")} ${a.pct}${a.pass ? "" : "✗"}`).join(" · ");
    const pass = o.pass.perAct80 && o.pass.noTwoNo && o.pass.mustYes;
    say(`| ${jn} · ${w} | ${o.overall} = ${o.overallPct} % | ${acts} | ${o.twoConsecutiveNo.join(", ") || "none"} | ${o.mustYesMissed.join(", ") || "none"} | ${pass ? "PASS" : "FAIL"} |`);
  }
}

// ---- tempo ------------------------------------------------------------------------------------------------------------------
const WORDS = ["slow", "medium", "brisk"];
say();
say(`## Tempo (bar: each act's §2.2 tempo named by ≥ 2 of 3 judges)`);
say();
say(`| act | §2.2 | J2 · J3 · J4 said (screen-weighted over both widths) | right | bar |`);
say(`|---|---|---|---|---|`);
let right = 0;
for (const A of ACTS) {
  const said = [];
  for (const jn of Object.keys(J)) {
    const tally = {};
    for (const p of partsOf(jn).filter((q) => q.act === A.id)) tally[p.tempo] = (tally[p.tempo] ?? 0) + (p.screens?.length ?? 0);
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    let word = sorted[0]?.[0] ?? "—";
    const tied = sorted.filter(([, n]) => n === sorted[0]?.[1]).map(([k]) => k);
    if (tied.length > 1) word = tied.includes(A.spec) ? `tie(${tied.join("/")})` : `tie(${tied.join("/")})`;
    said.push({ judge: jn, word, tally });
  }
  const ok = said.filter((s) => s.word === A.spec).length;
  const pass = ok >= 2;
  if (pass) right++;
  result.tempo[A.id] = { name: A.name, spec: A.spec, said: said.map((s) => s.word), tallies: said.map((s) => s.tally), right: ok, of: 3, pass };
  say(`| ${A.name} | ${A.spec} | ${said.map((s) => s.word).join(" · ")} | ${ok}/3 | ${pass ? "PASS" : "FAIL"} |`);
}
result.tempoRight = `${right}/${ACTS.length}`;
say();
say(`Acts named right by ≥ 2 judges: ${right}/${ACTS.length}.`);

// ---- discovery --------------------------------------------------------------------------------------------------------------
say();
say(`## Game discovery (bar: each judge notices the hunt chip and at least one toy invite within 3 screens of its first appearance)`);
say();
say(`Invite screens (first screen whose clip row is the beat): ${W.map((w) => `${w} ${JSON.stringify(geom[w].inviteScreens)}`).join("; ")}. The chip is in the header from screen 1.`);
say();
const toyMatchers = {
  B08: /compass/i,
  B18: /\brun\b/i,
  B26: /take ?off/i,
  B28: /dead ?eye/i,
};
const firstScreenNum = (v, w) => {
  if (typeof v === "number") return v;
  const s = String(v);
  const m = new RegExp(`(\\d+)\\s*\\(${w}\\)`).exec(s) ?? /(\d+)/.exec(s);
  return m ? +m[1] : null;
};
say(`| judge | chip | toy invites noticed (within 3 screens of the first one) | bar |`);
say(`|---|---|---|---|`);
for (const jn of Object.keys(J)) {
  const d = J[jn].discovery;
  const chipRow = d.find((x) => /egg ?hunt/i.test(x.thing) && Number(String(x.firstScreen).replace(/\D.*/, "")) === 1);
  const chip = Boolean(chipRow);
  const toys = {};
  for (const [id, re] of Object.entries(toyMatchers)) {
    const hits = [];
    for (const x of d) {
      if (!re.test(x.thing)) continue;
      if (id === "B18" && !/(^|[^a-z])run (button|invite)/i.test(x.thing)) continue;
      for (const w of W) {
        if (x.width !== "both" && +x.width !== w) continue;
        const s = firstScreenNum(x.firstScreen, w);
        const first = geom[w].inviteScreens[id];
        if (s != null && first != null && Math.abs(s - first) <= 3) hits.push(`${w}: s${s} (first s${first})`);
      }
    }
    if (hits.length) toys[id] = hits;
  }
  const n = Object.keys(toys).length;
  result.discovery[jn] = { chipNamedAtScreen1: chip, chipWouldTry: chipRow?.wouldTry ?? null, invites: toys, pass: chip && n >= 1 };
  say(`| ${jn} | ${chip ? "named at s1: " + String(chipRow.wouldTry ?? chipRow.note ?? "").slice(0, 110) : "not named"} | ${Object.keys(toys).map((k) => `${k} ${toys[k][0]}`).join("; ") || "none"} | ${chip && n >= 1 ? "PASS" : "FAIL"} |`);
}

// ---- scores -----------------------------------------------------------------------------------------------------------------
say();
say(`## Scores (1–5 = the judges' 0–10 / 2)`);
say();
say(`| judge | keep scrolling | tempo | discovery |`);
say(`|---|---|---|---|`);
for (const jn of Object.keys(J)) say(`| ${jn} | ${keepRows[jn].scores5.keepScrolling} | ${keepRows[jn].scores5.tempo} | ${keepRows[jn].scores5.discovery} |`);
const mean = (k) => +(Object.values(keepRows).reduce((s, v) => s + v.scores5[k], 0) / 3).toFixed(2);
result.mean5 = { keepScrolling: mean("keepScrolling"), tempo: mean("tempo"), discovery: mean("discovery") };
say(`| mean | ${result.mean5.keepScrolling} | ${result.mean5.tempo} | ${result.mean5.discovery} |`);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "score-panel.json"), JSON.stringify(result, null, 1));
fs.writeFileSync(path.join(OUT, "score-panel.md"), lines.join("\n") + "\n");
console.log(lines.join("\n"));
