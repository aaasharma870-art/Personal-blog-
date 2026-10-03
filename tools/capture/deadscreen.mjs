// tools/capture/deadscreen.mjs: the automated "no dead screen" check (P3-11 rubric; PHASE3-PLAN §11.3).
// Usage: node tools/capture/deadscreen.mjs --beats=<beats.json> --clips=<clips.json>[,<clips.json>…] [--out=<file>]
// Bar: "0 measured gaps > 100vh; every §2.4 stretch shows its fill".
//   gaps     tools/capture/beats.mjs results at each width: gaps > 100vh between consecutive beat boxes, beats
//            declared but missing from the DOM, scroll-star spans < 300 px.
//   fills    each dead stretch of PHASE3-SPEC §2.4 (D1…D11) is filled by the beat rows its "fill" cell names
//            (e.g. "B19–B21"). In each reader screencast (tools/capture/clips.mjs output) every one of those rows
//            must show its fill: one of its declared stars played (the spotlight log owned / granted it), or —
//            for a declared scroll star the spotlight never registered — its box crossed the middle 60 % (the
//            clips' `unregistered`). A row whose stars were all skipped (maxWait, host left the viewport) or
//            never seen does not show its fill (by the log: a host that animates without asking the spotlight
//            is reported the same way, so the sheets of the row are the check). Also reported: the share of the
//            rows' clips with no star.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
if (!flags.beats || !flags.clips) {
  console.error("usage: node tools/capture/deadscreen.mjs --beats=<beats.json> --clips=<a.json,b.json> [--out=<file>]");
  process.exit(2);
}
const spec = fs.readFileSync(path.join(ROOT, "docs/build/PHASE3-SPEC.md"), "utf8");
const sec = spec.slice(spec.indexOf("### 2.4"), spec.indexOf("### 2.5"));
const expand = (txt) => {
  const ids = new Set();
  for (const m of txt.matchAll(/B(\d\d)(?:[–-](?:B)?(\d\d))?/g)) {
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    for (let i = a; i <= b; i++) ids.add(`B${String(i).padStart(2, "0")}`);
  }
  return [...ids];
};
const stretches = [...sec.matchAll(/^\| \*\*(D\d+)\*\* ([^|]*)\| ([^\n]*)\|$/gm)].map((m) => ({ id: m[1], today: m[2].trim(), rows: expand(m[3]) }));

const beats = JSON.parse(fs.readFileSync(flags.beats, "utf8"));
const gaps = beats.results.map((r) => ({ width: r.width, pageVh: r.pageVh, gaps: r.gaps, missing: r.missing, spans: r.spans, notFound: r.notFound, pass: !r.gaps.length && !r.missing.length && !r.spans.length }));

const runs = flags.clips.split(",").map((f) => {
  const c = JSON.parse(fs.readFileSync(f, "utf8"));
  const sc = JSON.parse(fs.readFileSync(path.join(path.dirname(f), "screencast.json"), "utf8"));
  const played = new Set((sc.spotlight ?? []).filter((e) => e.ev === "own" || e.ev === "grant").map((e) => e.id));
  const skipped = new Map((sc.spotlight ?? []).filter((e) => e.ev === "skip").map((e) => [e.id, e.why]));
  const rowStars = new Map(c.rows.map((r) => [r.row, r.stars]));
  const fills = stretches.map((s) => {
    const rows = s.rows.map((row) => {
      const stars = rowStars.get(row) ?? [];
      const clips = c.clips.filter((x) => x.row === row && !x.intro);
      const geo = new Set(clips.flatMap((x) => x.unregistered));
      const shown = stars.filter((id) => played.has(id) || geo.has(id));
      return {
        row,
        stars,
        shown,
        skipped: stars.filter((id) => !shown.includes(id) && skipped.has(id)).map((id) => `${id} (${skipped.get(id)})`),
        clips: clips.length,
        clipsNoStar: clips.filter((x) => x.withDeclared === 0).length,
        pass: stars.length === 0 ? null : shown.length > 0,
      };
    });
    const judged = rows.filter((r) => r.pass !== null);
    return { id: s.id, today: s.today, rows, pass: judged.length > 0 && judged.every((r) => r.pass) };
  });
  return { profile: c.meta.profile, viewport: c.meta.viewport, source: path.relative(ROOT, f), fills, pass: fills.every((x) => x.pass) };
});

const report = { meta: { tool: "tools/capture/deadscreen.mjs", date: new Date().toISOString(), beats: path.relative(ROOT, flags.beats) }, gaps, runs, pass: gaps.every((g) => g.pass) && runs.every((r) => r.pass) };
if (flags.out) fs.writeFileSync(flags.out, JSON.stringify(report, null, 1));
for (const g of gaps) console.log(`gaps @${g.width}: ${g.gaps.length} gap(s) > 100vh, ${g.missing.length} missing, ${g.spans.length} short span(s) (page ${g.pageVh}vh) ${g.pass ? "PASS" : "FAIL"}`);
for (const r of runs) {
  console.log(`fills (${r.profile} ${r.viewport}): ${r.fills.filter((f) => f.pass).length}/${r.fills.length} stretches show their fill ${r.pass ? "PASS" : "FAIL"}`);
  for (const f of r.fills.filter((x) => !x.pass)) console.log(`  ${f.id} (${f.today}): ${f.rows.filter((x) => x.pass === false).map((x) => `${x.row} [${x.stars.join(" ")}] no play in the spotlight log${x.skipped.length ? `, skipped ${x.skipped.join(", ")}` : ""}`).join("; ")}`);
}
console.log(`deadscreen: ${report.pass ? "PASS" : "FAIL"}`);
