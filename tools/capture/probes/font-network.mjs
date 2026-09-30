// tools/capture/probes/font-network.mjs: world fonts load at ladder step 5, never on phones or first paint.
// Owner: B1-TYPE (PHASE3-PLAN §4.7). W1.0 stub: reports { skipped: true }.
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).

export default async function probe(/* page, ctx */) {
  return { skipped: true };
}
