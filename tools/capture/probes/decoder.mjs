// tools/capture/probes/decoder.mjs: one decoder at a time: StageVideo, loops, the intro (DecoderLock).
// Owner: B1-STAGE (PHASE3-PLAN §4.7). W1.0 stub: reports { skipped: true }.
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).

export default async function probe(/* page, ctx */) {
  return { skipped: true };
}
