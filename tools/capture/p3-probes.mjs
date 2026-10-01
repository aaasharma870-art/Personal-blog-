// Phase-3 probe runner (PHASE3-PLAN DP-12, §4.7). One owner per probe module.
// Usage: node tools/capture/p3-probes.mjs <baseUrl> <outDir> [--only=a,b] [--vw=1440x900]
//                                          [--path=/?skip=intro] [--rm] [--timeout=120000] [--list] [--help]
//
// Every tools/capture/probes/*.mjs (sorted by file name) is a probe:
//   export default async function probe(page, ctx) { …; return result; }
// `page` is a fresh Playwright page in its own context (viewport --vw, reducedMotion "reduce" with --rm),
// NOT yet navigated: call `await ctx.goto()` (default path --path, "/?skip=intro") or page.goto yourself.
// ctx = { name, base, out, dir, vw: { width, height }, rm, path, args, url(p), goto(p?, o?), sleep(ms),
//         log(...a), newPage(o?), browser, chromium }
//   dir      <outDir>/<name>/ (created on demand by ctx.file) for the probe's own screenshots / json
//   file(f)  absolute path inside dir (creates dir)
//   newPage  another fresh page ({ viewport, reducedMotion, … } context options), closed by the runner
//   args     every --key=value flag as a string map (probe-specific flags pass through)
// A result is any JSON object. Conventions: { skipped: true } (not built yet), { pass: true|false, … }.
// The runner adds { ms, console: [page errors + console.error lines] } and writes <outDir>/p3-probes.json.
// Exit code 1 when a probe throws or returns pass === false.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROBES = path.join(HERE, "probes");

const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
const [BASE, OUT] = argv.filter((a) => !a.startsWith("--"));

function probeFiles() {
  return fs.existsSync(PROBES) ? fs.readdirSync(PROBES).filter((f) => f.endsWith(".mjs")).sort() : [];
}

/** The owner line of a probe module ("// Owner: B1-SCROLL …"), for --help / --list. */
function ownerOf(file) {
  const m = /Owner:\s*([^\n(]+)/.exec(fs.readFileSync(path.join(PROBES, file), "utf8"));
  return m ? m[1].trim() : "?";
}

function usage() {
  const lines = [
    "Phase-3 probes (PHASE3-PLAN DP-12).",
    "Usage: node tools/capture/p3-probes.mjs <baseUrl> <outDir> [options]",
    "  --only=a,b        run only these probes (file names without .mjs)",
    "  --vw=WxH          viewport (default 1440x900)",
    "  --path=/?…        the path ctx.goto() opens (default /?skip=intro)",
    "  --rm              contexts use reducedMotion: 'reduce'",
    "  --timeout=ms      per-probe timeout (default 120000)",
    "  --list            list the probes and exit",
    "  --help            this text",
    "Probe-specific --key=value flags pass through in ctx.args.",
    "",
    "Probes (tools/capture/probes/*.mjs):",
    ...probeFiles().map((f) => `  ${f.replace(/\.mjs$/, "").padEnd(16)} ${ownerOf(f)}`),
  ];
  console.log(lines.join("\n"));
}

if (flags.help || flags.h || flags.list) {
  usage();
  process.exit(0);
}
if (!BASE || !OUT) {
  usage();
  process.exit(2);
}

const all = probeFiles().map((f) => f.replace(/\.mjs$/, ""));
const only = flags.only ? flags.only.split(",").map((s) => s.trim()).filter(Boolean) : null;
if (only) {
  const unknown = only.filter((n) => !all.includes(n));
  if (unknown.length) {
    console.error(`p3-probes: unknown probe(s): ${unknown.join(", ")} (have: ${all.join(", ")})`);
    process.exit(2);
  }
}
const names = only ? all.filter((n) => only.includes(n)) : all;

const vwMatch = /^(\d+)x(\d+)$/.exec(flags.vw ?? "1440x900");
if (!vwMatch) {
  console.error(`p3-probes: --vw must be WxH (got "${flags.vw}")`);
  process.exit(2);
}
const VW = { width: Number(vwMatch[1]), height: Number(vwMatch[2]) };
const RM = Boolean(flags.rm);
const PATH = flags.path ?? "/?skip=intro";
const TIMEOUT = Number(flags.timeout ?? 120000);
const base = BASE.replace(/\/+$/, "");

// the same playwright fallback as tools/capture/motion.js
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("/opt/node22/lib/node_modules/playwright"));
}

fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
});
const contextOptions = (o = {}) => ({ viewport: VW, ...(RM ? { reducedMotion: "reduce" } : {}), ...o });

const results = {};
let failed = 0;
for (const name of names) {
  const mod = await import(pathToFileURL(path.join(PROBES, `${name}.mjs`)).href);
  const contexts = [];
  const consoleLines = [];
  const openPage = async (o) => {
    const context = await browser.newContext(contextOptions(o));
    contexts.push(context);
    const page = await context.newPage();
    page.on("pageerror", (e) => consoleLines.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") consoleLines.push(`console.error: ${m.text()}`);
    });
    return page;
  };
  const page = await openPage();
  const dir = path.join(OUT, name);
  const ctx = {
    name,
    base,
    out: OUT,
    dir,
    vw: VW,
    rm: RM,
    path: PATH,
    args: flags,
    url: (p = PATH) => `${base}${p.startsWith("/") ? "" : "/"}${p}`,
    goto: (p = PATH, o = {}) => page.goto(ctx.url(p), { waitUntil: "load", ...o }),
    sleep,
    log: (...a) => console.log(`  [${name}]`, ...a),
    file: (f) => {
      fs.mkdirSync(dir, { recursive: true });
      return path.join(dir, f);
    },
    newPage: openPage,
    browser,
    chromium,
  };
  const t0 = Date.now();
  let result;
  try {
    if (typeof mod.default !== "function") throw new Error(`probes/${name}.mjs has no default export`);
    let timer;
    const timeout = new Promise((_, rej) => {
      timer = setTimeout(() => rej(new Error(`timed out after ${TIMEOUT} ms`)), TIMEOUT);
    });
    result = await Promise.race([mod.default(page, ctx), timeout]).finally(() => clearTimeout(timer));
    if (result == null || typeof result !== "object") result = { value: result ?? null };
  } catch (e) {
    result = { pass: false, error: String(e && e.stack ? e.stack : e) };
  }
  for (const c of contexts) await c.close().catch(() => {});
  result = { ...result, ms: Date.now() - t0, console: consoleLines };
  if (result.pass === false) failed++;
  results[name] = result;
  const state = result.skipped ? "skipped" : result.pass === false ? "FAIL" : result.pass === true ? "pass" : "done";
  console.log(`${state.padEnd(8)}${name} (${result.ms} ms)${result.error ? `: ${result.error.split("\n")[0]}` : ""}`);
}

const report = {
  meta: { base, vw: VW, rm: RM, path: PATH, date: new Date().toISOString(), chromium: browser.version(), probes: names },
  results,
};
await browser.close();
fs.writeFileSync(path.join(OUT, "p3-probes.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`p3-probes: ${names.length} probe(s), ${failed} failed → ${path.join(OUT, "p3-probes.json")}`);
process.exit(failed ? 1 : 0);
