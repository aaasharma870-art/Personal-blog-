// tools/capture/probes/bundle.mjs: first-load JS budget (initial route ≤ +6 KB gz; facades + lazy impls, DP-13).
// Owner: B1-SCROLL (PHASE3-PLAN §4.7). W1.0 stub: reports { skipped: true }.
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).

export default async function probe(/* page, ctx */) {
  return { skipped: true };
}
