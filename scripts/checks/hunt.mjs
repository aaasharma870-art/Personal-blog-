// scripts/checks/hunt.mjs: spec §3.4 check 7 (the 12-egg hunt table), ERROR.
// Owner: W2-HUNT (PHASE3-PLAN §4.7). Loaded by scripts/check-manifest.mjs, which calls
// `run(ctx)` with ctx = { ROOT, RELEASE, err, warn, gate, page, film, mediaAssets, quotes,
// OUT_LINES, content, VARIANT_REGISTRY, derive, css, readFile(rel), uiFiles }.
//
// It never imports lib/hunt.ts (Node cannot resolve its extensionless / "@/…" imports). The
// rows come from components/eggs/hunt-rows.ts, a PURE data module (type-only imports, which
// Node strips), checked against film.eggs (the registry) and film.copy:
//   - exactly 12 hunt eggs, 3 per world, ids prefixed by their world (pc- 3i- rd- hp-);
//   - each with a name, a hint and a credit copy key that exist, `keyboard: true`, a
//     reduced-motion state (`rm`) and `browse: false` (hidden from the palette's
//     empty-query list, spec §9);
//   - each fired by an enabled, non-toy registry egg on the same host, no two sharing one;
//   - a spell (typed / palette) names its palette words; the egg host listens for each
//     typed buffer; the palette dialog marks each spell word (hidden until queried);
//   - B2 patronus is off; B9 the egg host ignores typed keys while html[data-game] is set;
//     the post-credits tail carries its beat (B58);
//   - Oct 22 (fix/eggs) every egg can be COLLECTED from the panel: a `how` copy key, and either a
//     "Take me there" `target` (an #id that exists on the page) or a spell `word` (the panel's
//     "Show the word", tied to the host's typed buffer); an egg with a `tip` wears a marker
//     (`data-egg-glint="<id>"` on a host: <EggHotspot> sets it for every hotspot).
import { HUNT_ROWS, HUNT_WORLDS } from "../../components/eggs/hunt-rows.ts";

const PREFIX = { pirates: "pc-", idiots: "3i-", rdr2: "rd-", hp: "hp-" };
/** EggId → registry id where they differ (components/eggs/egg-bus.ts REGISTRY_ID). */
const REGISTRY_OF = { lumos: "lumos-nox", nox: "lumos-nox" };
/** A spell's typed buffer (letters only; components/eggs/egg-host.tsx WORDS). */
const TYPED = { "hp-map": "solemnlyswear", "hp-lumos": ["lumos", "nox"], "pc-parley": "parley", "3i-aal": "aalizzwell" };
/** Hosts that name the same place ("global" spells live in the chrome). */
const sameHost = (a, b) => a === b || (["global", "chrome"].includes(a) && ["global", "chrome"].includes(b));

export default function run({ film, err, warn, readFile, uiFiles, ROOT }) {
  const P = "[P3 #7] hunt";
  const rows = Object.entries(HUNT_ROWS);
  if (rows.length !== 12) err(`${P}: ${rows.length} eggs in components/eggs/hunt-rows.ts (exactly 12)`);
  for (const w of Object.keys(PREFIX)) {
    const n = rows.filter(([, r]) => r.world === w).length;
    if (n !== 3) err(`${P}: ${n} eggs in the ${w} world (3 per world)`);
  }
  if (HUNT_WORLDS.length !== 4 || !HUNT_WORLDS.every((w) => w in PREFIX)) err(`${P}: HUNT_WORLDS must list the four film worlds`);

  const registry = new Map((film.eggs?.list ?? []).map((e) => [e.id, e]));
  const used = new Map();
  let spells = 0;
  for (const [id, r] of rows) {
    if (!PREFIX[r.world]) err(`${P} ${id}: world "${r.world}" is not a film world`);
    else if (!id.startsWith(PREFIX[r.world])) err(`${P} ${id}: an id in the ${r.world} world starts "${PREFIX[r.world]}"`);
    for (const k of ["name", "hint", "credit"]) {
      const key = r[k];
      if (typeof key !== "string" || !film.copy[key]?.text) err(`${P} ${id}: the ${k} copy key "${key}" is missing from lib/film.ts copy`);
    }
    // collectable: how to, and where (a target) or what (a spell word); copy keys must exist
    if (typeof r.how !== "string" || !film.copy[r.how]?.text) err(`${P} ${id}: the how copy key "${r.how}" is missing from lib/film.ts copy`);
    if (r.tip !== undefined && (typeof r.tip !== "string" || !film.copy[r.tip]?.text)) err(`${P} ${id}: the tip copy key "${r.tip}" is missing from lib/film.ts copy`);
    if (r.target === undefined && r.word === undefined) err(`${P} ${id}: neither a "Take me there" target nor a spell word (the panel could not help collect it)`);
    if (r.target !== undefined && !/^#[A-Za-z][\w-]*$/.test(r.target)) err(`${P} ${id}: target "${r.target}" is not an #id`);
    if (r.keyboard !== true) err(`${P} ${id}: keyboard must be true (every egg has a keyboard path)`);
    if (typeof r.rm !== "string" || !r.rm.trim()) err(`${P} ${id}: no reduced-motion state (rm)`);
    if (r.browse !== false) err(`${P} ${id}: browse must be false (hidden from the palette's empty-query list)`);
    if (!Array.isArray(r.trigger) || !r.trigger.length) err(`${P} ${id}: no trigger`);

    const regId = REGISTRY_OF[r.registryId] ?? r.registryId;
    const e = registry.get(regId);
    if (!e) err(`${P} ${id}: registry egg "${regId}" is not in film.eggs.list`);
    else {
      if (e.toy) err(`${P} ${id}: "${regId}" is a toy, not a hunt egg`);
      if (!e.enabled) warn(`${P} ${id}: "${regId}" is off in the registry (the hunt cannot reach 12)`);
      if (!sameHost(e.host, r.host)) err(`${P} ${id}: host "${r.host}" but the registry's "${regId}" lives on "${e.host}"`);
    }
    if (used.has(regId)) err(`${P} ${id}: "${regId}" already fires ${used.get(regId)}`);
    used.set(regId, id);

    const spell = r.trigger?.includes("typed") || r.trigger?.includes("palette");
    if (spell) {
      spells++;
      if (!Array.isArray(r.spell) || !r.spell.length) err(`${P} ${id}: a typed / palette egg names its palette spell words`);
      if (!TYPED[id]) err(`${P} ${id}: no typed buffer known for this spell (update scripts/checks/hunt.mjs)`);
    }
  }
  if (spells !== 4) err(`${P}: ${spells} spells (one per world: 4)`);

  // a spell's `word` is what the panel shows: it must be the very buffer the egg host listens for
  for (const [id, r] of rows) {
    const spell = r.trigger?.includes("typed") || r.trigger?.includes("palette");
    if (spell && typeof r.word !== "string") err(`${P} ${id}: a spell names its word (the panel's "Show the word")`);
    if (typeof r.word === "string" && TYPED[id]) {
      const typed = [TYPED[id]].flat()[0];
      if (!r.word.replace(/[^a-z]/gi, "").toLowerCase().endsWith(typed)) err(`${P} ${id}: word "${r.word}" is not the typed buffer "${typed}"`);
    }
  }

  // "Take me there" lands on something real, and a marker host exists for every egg with a tip
  const sources = (uiFiles ?? [])
    .map((f) => String(f))
    .filter((f) => /\.(tsx?|jsx?)$/.test(f) && /[\\/](components|app|lib)[\\/]/.test(f))
    .map((f) => ({ f, src: readFile(f.startsWith(ROOT) ? f.slice(ROOT.length + 1) : f) }));
  const anySource = (re) => sources.some((x) => re.test(x.src));
  for (const [id, r] of rows) {
    if (r.target !== undefined) {
      const frag = r.target.slice(1);
      const ok =
        film.acts.some((a) => a.id === frag) ||
        r.trigger?.includes("hotspot") && frag === `egg-${id}` ||
        anySource(new RegExp(`id=["'\`]${frag}["'\`]`));
      if (!ok) err(`${P} ${id}: "Take me there" target ${r.target} is not an act card, a hotspot (egg-${id}) or an id in the source`);
    }
    if (r.tip !== undefined) {
      // <EggHotspot> sets it for every hotspot; the Run button, the kraken and the snitch carry it by hand
      const viaHotspot = r.trigger?.includes("hotspot") && anySource(/data-egg-glint=\{hunt\}/);
      const marked = viaHotspot || anySource(new RegExp(`data-egg-glint=[^\\n]{0,48}["'\`]${id}["'\`]`));
      if (!marked) err(`${P} ${id}: it has a tip but no host wears its marker (data-egg-glint="${id}")`);
    }
  }

  // B2 (spec §3.6): patronus is not one of the 12 and stays off
  if (registry.get("patronus")?.enabled) err(`${P}: B2 the patronus egg must be enabled:false`);

  // the typed buffers and the B9 guard live in the always-loaded egg host
  const host = readFile("components/eggs/egg-host.tsx");
  for (const [id, words] of Object.entries(TYPED)) {
    for (const w of [words].flat()) if (!host.includes(`["${w}", "`)) err(`${P} ${id}: components/eggs/egg-host.tsx does not listen for the typed word "${w}" (WORDS)`);
  }
  if (!/hasAttribute\("data-game"\)/.test(host)) err(`${P}: B9 the egg host must ignore typed keys while html[data-game] is set`);

  // every spell word is marked in the palette (hidden from the browse list until queried);
  // the commands live in the palette's lazy dialog (the shell is components/site/command-palette.tsx)
  const palette = readFile("components/eggs/palette-dialog.tsx");
  if (!/if \(!q\) return commands\.filter\(\(c\) => !c\.spell\)/.test(palette)) err(`${P}: the palette's empty query must hide spell commands (browse: false)`);
  for (const [id, r] of rows) {
    for (const w of r.spell ?? []) if (!palette.includes(`["${w}"]`)) err(`${P} ${id}: the palette has no spell command marked ["${w}"]`);
  }

  // the post-credits tail is the B58 beat (spec §9.4)
  if (!/beatAttrs\("B58"/.test(readFile("components/site/post-credits.tsx"))) err(`${P}: components/site/post-credits.tsx must carry beatAttrs("B58")`);

  console.log(`  hunt: ${rows.length} eggs (${HUNT_WORLDS.map((w) => `${w} ${rows.filter(([, r]) => r.world === w).length}`).join(", ")}), ${spells} spells`);
}
