// scripts/checks/stage.mjs: spec §3.4 check 4, the StageSpec rules of spec §3.2.
// Owner: B1-STAGE (PHASE3-PLAN §4.7). Loaded by scripts/check-manifest.mjs, which calls
// `run(ctx)` with ctx = { ROOT, RELEASE, err, warn, gate, page, film, mediaAssets, quotes,
// OUT_LINES, content, VARIANT_REGISTRY, derive: { actCardsOf, actRunsOf, actsInUse,
// pageItemsOf, worldOfIn }, css, readFile(rel), uiFiles }.
//
// ERRORS (the stage would lie, leave a hole or break AA):
//   - the per-spec rules of lib/stage.ts `stageSpecIssues` (one source with the runtime):
//     research types (chapter, ledger, experiment, matrix) may be split, never backdrop;
//     paper / raised tones never backdrop; experiment is opaque (H4); every backdrop has a
//     Scrim with text ≥ .86 and image ≥ .45; backdrop / split carry ≥ 1 cue, own / opaque none;
//     known cameras / weathers; `at` is an element id;
//   - every cue's media exists, resolves to a usable still (an image, or a video's poster:
//     the stage shows plates; loops come from loopFor(), DP-5) and is a film asset
//     (provenance not "legacy");
//   - a backdrop / split spec sits on a section whose component renders that mode
//     (WorldSection or the credits footer: StageScrim; ChapterSection or Beyond: StageSplit);
//   - only the opening card's program block takes an act stage (spec §3.2 cue plan);
//   - no two cues share an anchor (the stage could not order them).
// WARNINGS: an enabled section without a StageSpec (the stage treats it as opaque);
//   a backdrop and a split item adjacent in page order (two plates on one screen).
import { stageCues, stageSpecIssues } from "../../lib/stage.ts";

const USABLE = new Set(["accepted", "integrated"]);
/** Section types whose component renders the StageScrim (backdrop mode). */
const BACKDROP_HOSTS = new Set(["story", "films", "contact", "principles", "quotes", "index", "experiment", "credits"]);
/** Section types (and story variants) whose component renders <StageSplit>. */
const splitHost = (e) => e.type === "chapter" || (e.type === "story" && e.props?.variant === "notes");

export default function run(ctx) {
  const { page, film, mediaAssets, err, warn, derive } = ctx;

  /** The usable asset `id` resolves to (the resolveMedia walk), or null. */
  const resolve = (id) => {
    const seen = new Set();
    let cur = id;
    while (cur && !seen.has(cur) && Object.prototype.hasOwnProperty.call(mediaAssets, cur)) {
      seen.add(cur);
      const a = mediaAssets[cur];
      if (USABLE.has(a.status)) return { id: cur, ...a };
      cur = a.fallback;
    }
    return null;
  };

  const checkCues = (label, spec) => {
    (spec.cues ?? []).forEach((c, i) => {
      const at = `${label} cue ${i + 1} (${c.media})`;
      if (!Object.prototype.hasOwnProperty.call(mediaAssets, c.media)) {
        err(`[P3 #4] ${at}: unknown MediaId`);
        return;
      }
      let a = resolve(c.media);
      if (a && a.kind !== "image") a = a.poster ? resolve(a.poster) : null;
      if (!a || a.kind !== "image") {
        err(`[P3 #4] ${at}: resolves to no usable still (the stage shows plates; loops come from loopFor)`);
        return;
      }
      if (a.provenance?.source === "legacy") err(`[P3 #4] ${at}: resolves to a legacy still (${a.id}), not a film asset`);
    });
  };

  const enabled = page.filter((e) => e.enabled !== false);
  for (const e of enabled) {
    if (!e.stage) {
      warn(`[P3 #4] ${e.id}: no StageSpec (the stage treats it as opaque)`);
      continue;
    }
    const label = `${e.id}.stage`;
    for (const m of stageSpecIssues(e.stage, { type: e.type, tone: e.tone ?? "canvas" })) err(`[P3 #4] ${label}: ${m}`);
    if (e.stage.mode === "backdrop" && !BACKDROP_HOSTS.has(e.type)) {
      err(`[P3 #4] ${label}: backdrop on type "${e.type}", whose component renders no StageScrim`);
    }
    if (e.stage.mode === "split" && !splitHost(e)) {
      err(`[P3 #4] ${label}: split on type "${e.type}", whose component renders no StageSplit`);
    }
    checkCues(label, e.stage);
  }

  // act stages: the opening card's program block only
  const items = derive.pageItemsOf(enabled, film);
  const firstAct = items.find((it) => it.kind === "act")?.act ?? null;
  for (const a of film.acts) {
    if (!a.stage) continue;
    const label = `acts.${a.id}.stage`;
    for (const m of stageSpecIssues(a.stage, { type: null, tone: null })) err(`[P3 #4] ${label}: ${m}`);
    if (a.id !== firstAct) err(`[P3 #4] ${label}: only the opening card's program block takes a stage`);
    if (a.stage.mode === "split") err(`[P3 #4] ${label}: the program block is backdrop, never split`);
    checkCues(label, a.stage);
  }

  // the cue list the stage walks: anchors unique; backdrop and split never adjacent
  const byAct = new Map(film.acts.map((a) => [a.id, a.stage]));
  const cues = stageCues(items, (id) => byAct.get(id));
  const anchors = new Map();
  for (const c of cues) {
    if (!c.cue) continue;
    anchors.set(c.anchor, [...(anchors.get(c.anchor) ?? []), c.item]);
  }
  for (const [anchor, users] of anchors) {
    if (users.length > 1) err(`[P3 #4] ${users.length} cues share the anchor "${anchor}" (${users.join(", ")})`);
  }
  for (let i = 1; i < cues.length; i++) {
    const a = cues[i - 1];
    const b = cues[i];
    if (a.item === b.item) continue;
    const pair = new Set([a.mode, b.mode]);
    if (pair.has("backdrop") && pair.has("split")) {
      warn(`[P3 #4] ${a.item} (${a.mode}) and ${b.item} (${b.mode}) are adjacent: two plates may share a screen`);
    }
  }
}
