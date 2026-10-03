// Score stranger-judge verdicts (M2 blind test; P3-11 stranger test at 1440 and 1024: blind, captioned, hooks).
// Usage (flags):  node tools/capture/score.mjs --kind=blind|captioned|hooks --key=<key.json> --verdicts=<prefix>
//                   [--manifest=<scenes manifest.json>] [--out=<scores.json>] [--width=1440] [--name="…"] [--md=<file>]
// Usage (M2, positional, blind only): node score.mjs <unused> <out.json> <key.json> <verdictsPrefix> <manifest.json>
// Reads <prefix>1.json … <prefix>3.json (one array per judge; a missing judge counts as no verdict).
//
// Verdict rows (one per frame id the judge saw):
//   blind      { frame: "J001", film: "<film or ??>", moment: "…", confidence: 0–1, why: "…" }
//              PASS = ≥ 2 of 3 judges name the intended film at confidence ≥ 0.6; wrong-film = another film ≥ 0.5.
//              Per world (BLIND-mode frames) the pass share is compared with the pre-Phase-3 score (the M5 final
//              blind test, docs/build/m2-review/BLIND-FINAL.md): Pirates 10/10, 3 Idiots 9/10, RDR2 9/13, HP 10/12.
//   captioned  { frame: "C001", name: "<the person's name as read, or null>", cantRead: ["<text you could not
//              read>", …], fastLane: { found: true|false, where: "…", seconds: <n> } }
//              name: judged on the hero frame(s) (key → D01-…): read correctly = the expected name (--name, default
//              lib/content.ts `name`), case and spacing ignored. cantRead: every finding is listed (bar: 0).
//              fastLane: judged on the hero frame(s): found within 10 s.
//   hooks      { frame: "H001", hook: true|false, why: "…" }   PASS = 3 of 3 "hook".
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
const pos = argv.filter((a) => !a.startsWith("--"));
const KIND = flags.kind ?? "blind";
const OUT = flags.out ?? pos[1] ?? null;
const KEYF = flags.key ?? pos[2];
const VPRE = flags.verdicts ?? pos[3];
const MANF = flags.manifest ?? pos[4] ?? null;
if (!KEYF || !VPRE) {
  console.error("usage: node tools/capture/score.mjs --kind=blind|captioned|hooks --key=<key.json> --verdicts=<prefix> [--manifest=…] [--out=…] [--width=…]");
  process.exit(2);
}
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const NAME = (() => {
  if (flags.name) return flags.name;
  const m = /\bname:\s*"([^"]+)"/.exec(fs.readFileSync(path.join(ROOT, "lib/content.ts"), "utf8"));
  return m ? m[1] : "";
})();
const key = JSON.parse(fs.readFileSync(KEYF, "utf8"));
const man = MANF ? JSON.parse(fs.readFileSync(MANF, "utf8")) : [];
const byFrame = Object.fromEntries(man.map((m) => [m.frame, m]));
const J = [1, 2, 3].map((i) => {
  try {
    return JSON.parse(fs.readFileSync(`${VPRE}${i}.json`, "utf8"));
  } catch {
    return [];
  }
});
const W = flags.width ? ` @${flags.width}` : "";
const lines = [];
const say = (s = "") => {
  lines.push(s);
  console.log(s);
};
let result;

if (KIND === "blind") {
  const norm = (f) => (/harry/i.test(f) ? "hp" : /pirat/i.test(f) ? "pirates" : /idiot/i.test(f) ? "idiots" : /red dead|rdr/i.test(f) ? "rdr2" : "??");
  // 'idiots(no film styling)' (the experiment) carries NO film by rule H4: n/a.
  // A hand-off beat ('hp→pirates', the flight's cross-dissolve) is intended as
  // BOTH films: a verdict naming either is correct, neither is "wrong-film".
  const intended = (w) => (w.includes("no film styling") ? null : w === "hp→pirates" ? "hp|pirates" : w.startsWith("house") ? null : w.startsWith("idiots") ? "idiots" : w);
  const matches = (f, want) => want.split("|").includes(f);
  const rows = [];
  for (const [jid, frame] of Object.entries(key)) {
    const m = byFrame[frame] || {};
    const want = intended(m.world || "");
    const vs = J.map((j) => j.find((v) => v.frame === jid));
    const ok = want ? vs.filter((v) => v && matches(norm(v.film), want) && v.confidence >= 0.6).length : 0;
    const wrong = want ? vs.filter((v) => v && norm(v.film) !== "??" && !matches(norm(v.film), want) && v.confidence >= 0.5).length : 0;
    rows.push({ jid, frame, world: m.world, mode: m.mode, moment: m.moment, want, ok, wrong, pass: want ? ok >= 2 : null, v: vs.map((v) => (v ? `${norm(v.film)} ${(+v.confidence).toFixed(2)}` : "—")), why: vs[0]?.why || "" });
  }
  rows.sort((a, b) => a.frame.localeCompare(b.frame));
  say(`| frame | mode | intended | verdicts | result |\n|---|---|---|---|---|`);
  for (const r of rows) say(`| ${r.frame} | ${r.mode} | ${r.want} | ${r.v.join(" / ")} | ${r.pass === null ? "n/a" : r.pass ? "PASS" : "FAIL"}${r.wrong ? ` (${r.wrong} wrong-film)` : ""} |`);
  const blind = rows.filter((r) => r.mode === "BLIND");
  const BASE = { pirates: [10, 10], idiots: [9, 10], rdr2: [9, 13], hp: [10, 12] };
  const worlds = {};
  for (const w of Object.keys(BASE)) {
    const set = blind.filter((r) => r.want && r.want.split("|").includes(w));
    const pass = set.filter((r) => r.pass).length;
    const [bp, bn] = BASE[w];
    worlds[w] = { pass, of: set.length, baseline: `${bp}/${bn}`, atLeastBaseline: set.length ? pass / set.length >= bp / bn : null };
  }
  say("");
  say(`BLIND${W}: pass ${blind.filter((r) => r.pass).length}/${blind.length}; all-with-film pass ${rows.filter((r) => r.pass).length}/${rows.filter((r) => r.pass !== null).length}; wrong-film frames ${rows.filter((r) => r.wrong).length}`);
  say(`per world (BLIND-mode, vs the pre-Phase-3 score): ${Object.entries(worlds).map(([w, v]) => `${w} ${v.pass}/${v.of} (base ${v.baseline}${v.atLeastBaseline === false ? " BELOW" : ""})`).join(" · ")}`);
  result = { kind: KIND, width: flags.width ?? null, rows, worlds };
} else if (KIND === "captioned") {
  const clean = (s) => String(s ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const heroIds = Object.entries(key).filter(([, f]) => /^D01-/.test(f)).map(([id]) => id);
  const nameRows = J.map((j, k) => ({ judge: k + 1, reads: heroIds.map((id) => j.find((v) => v.frame === id)?.name ?? null) }));
  const nameOk = nameRows.filter((r) => r.reads.length && r.reads.every((n) => clean(n) === clean(NAME))).length;
  const cant = [];
  J.forEach((j, k) => j.forEach((v) => (v.cantRead ?? []).forEach((t) => cant.push({ judge: k + 1, frame: v.frame, scene: key[v.frame] ?? "?", text: t }))));
  const lane = J.map((j, k) => {
    const v = heroIds.map((id) => j.find((x) => x.frame === id)).find(Boolean);
    return { judge: k + 1, found: Boolean(v?.fastLane?.found), seconds: v?.fastLane?.seconds ?? null, where: v?.fastLane?.where ?? null };
  });
  const laneOk = lane.filter((l) => l.found && (l.seconds == null || l.seconds <= 10)).length;
  say(`CAPTIONED${W}: name "${NAME}" read correctly by ${nameOk}/3 (${nameRows.map((r) => `j${r.judge}: ${r.reads.join(", ") || "—"}`).join("; ")})`);
  say(`can't read: ${cant.length} finding(s)${cant.length ? "\n" + cant.map((c) => `- j${c.judge} ${c.frame} (${c.scene}): ${c.text}`).join("\n") : ""}`);
  say(`fast lane found ≤ 10 s: ${laneOk}/3 (${lane.map((l) => `j${l.judge}: ${l.found ? `${l.seconds ?? "?"} s, ${l.where ?? ""}` : "not found"}`).join("; ")})`);
  result = { kind: KIND, width: flags.width ?? null, name: NAME, heroIds, nameOk, nameRows, cantRead: cant, fastLane: lane, fastLaneOk: laneOk };
} else if (KIND === "hooks") {
  const rows = Object.entries(key).map(([id, frame]) => {
    const vs = J.map((j) => j.find((v) => v.frame === id));
    const yes = vs.filter((v) => v && v.hook === true).length;
    return { id, frame, yes, pass: yes === 3, why: vs.map((v) => v?.why ?? "—") };
  });
  rows.sort((a, b) => a.frame.localeCompare(b.frame));
  for (const r of rows) say(`| ${r.frame} | ${r.yes}/3 | ${r.pass ? "PASS" : "FAIL"} | ${r.why.join(" / ").slice(0, 200)} |`);
  say(`HOOKS${W}: ${rows.filter((r) => r.pass).length}/${rows.length} judged a hook 3/3`);
  result = { kind: KIND, width: flags.width ?? null, rows };
} else {
  console.error(`score: unknown --kind=${KIND}`);
  process.exit(2);
}
if (OUT) fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
if (flags.md) fs.writeFileSync(flags.md, lines.join("\n") + "\n");
