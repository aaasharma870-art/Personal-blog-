export const meta = {
  name: 'm15-variants-and-copy',
  description: 'M1.5: default+alt variant system (media + code animations), alternates for everything M1 built, one-liners written, film copy visible on the branch; assembler + critic + fix; push',
  phases: [
    { title: 'Integrate', detail: 'variant data model, ?variant=alt, copy visibility, one-liners' },
    { title: 'Build', detail: '2 builders: intro+hero alternates / act-card+loader alternates' },
    { title: 'Assemble', detail: 'check/lint/build, /lab/variants, captures, commit, push' },
    { title: 'Critique', detail: 'one critic pass' },
    { title: 'Fix', detail: 'fix round + push' },
  ],
}

const SITE = 'C:/Users/aaash/Desktop/Transcript/personal-website'
const R = 'C:/Users/aaash/Desktop/Transcript/research'
const B = `${R}/build`

const RULES = `
REPO ${SITE}, branch design/three-films (M1 done at 37161bb; read ${B}/M1-REPORT.md fully first, plus AGENTS.md/CLAUDE.md in the repo — Next 16 breaking changes). Design authority: ${B}/SPEC.md v2, ${B}/DESIGN.md, ${B}/ICONS.md, ${B}/bars/*. Autopilot rules: ${R}/AUTOPILOT.md ("Aryan's answers" section is BINDING).
ARYAN'S BINDING ANSWERS (2026-09-28 night): (1) every animation AND video gets a DEFAULT and an ALTERNATE version; (2) write emotionally impactful one-liners ("why this film/game matters to me") that he will personally rewrite — render them normally (no visible DRAFT badge), keep draft:true flags in data and list them in reports; (3) he authorized autonomous overnight work + Higgsfield credits; branch pushes as backup (never main).
HARD LIMITS: no actor likenesses; no ripped stills/footage/official logo files; fan-tribute non-affiliation credit present; research honesty untouched (Sharpe-2.0 rule, synthetic labels, caveats adjacent, writing drafts stay visibly DRAFT and non-links); CLAUDE.md §2 exclusions; one-liners must NOT invent specific life events (no "my grandfather read it to me", no ages/dates/places not in content.ts) — tie them to his REAL story in lib/content.ts (killing his own ideas, curiosity, Pine Script → pipeline voyage, honesty with data, life beyond the screen: athletics, ambassador, SOS Foundation, photography).
A11Y/PERF: reduced motion + Pause stop everything; hydration-safe; focus parity; AA; one h1; intro never gates content; one decoder; mobile stills.
LAPTOP: only the assembler/fixer runs next build/servers; builders use tsc + eslint on their files; ONE browser via ${R}/browser.js; ffmpeg -threads 2; kill servers you start.
GIT: builders never stage/commit (shared tree) — they report file lists; assembler/fixer commit (messages end with blank line + 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>') and then \`git push origin design/three-films\` (never main, never force). Never commit .claude/, skills-lock.json, research docs.
`

phase('Integrate')
const integ = await agent(`${RULES}
TASK — M1.5 INTEGRATOR:
 1. VARIANT DATA MODEL: in lib/media.ts add an optional \`alt?: MediaId\` (or variants map) per asset + a resolver \`resolveVariant(id, variant)\`; in lib/page.ts add \`variant?: 'default' | 'alt'\` per section entry (and per derived act card via film data); in lib/film.ts a global \`defaultVariant\`. Add a tiny client hook \`useVariant(sectionVariant)\` that honors \`?variant=alt\` (preview all alternates) and \`?variant=default\`, hydration-safe (server renders the manifest value; client switches after mount only when the query param is present). Export a VARIANT_REGISTRY type so builders can register named alternates for code animations. Extend scripts/check-manifest.mjs: every signature section/card/loader/intro/hero must declare both variants (warn now, error under RELEASE=1).
 2. COPY VISIBILITY: per Aryan's answer, film copy should render normally on this branch. Add a single switch (e.g. \`film.branchPreview = true\`) that makes 'proposed' AND 'draft' film copy visible in ALL builds (dev + plain production) — replacing the FILM_PREVIEW-only gating — while keeping every string's status/draft flag and making \`RELEASE=1 npm run check\` FAIL while any shown string is unsigned (so a merge to main still needs Aryan's sign-off). Writing-entry DRAFT labels stay visible (those are real drafts).
 3. ONE-LINERS: write the empty draft strings: film.worlds.{pirates,idiots,rdr2,hp}.reason (1–2 sentences each, emotionally impactful, first person, tied to his REAL story; draft:true), film.acts.*.logline (×4), copy.beyond.handbill.reward. Also write 2 alternates for each reason line in a comment block or an \`alternates\` array so Aryan can pick. Record them all in ${B}/ONE-LINERS.md.
 4. MEDIA ALTERNATES already on disk: IN-02 alt = ${B}/media/masters/IN-02/web-alt/ (9503416d encodes) → copy into public/media/films/ as intro-flight-alt.{mp4,webm} + poster; MV-03 alt = the runner-up in ${B}/media/masters/MV-03/ → encode with ffmpeg -threads 2 (H.264 crf 24 -an faststart + VP9 webm + webp poster) as hero-sea-loop-alt.*; IN-01/MV-01/MV-02/IN-01m alts = the second candidates from their batches in ${B}/media/masters/<ID>/ (webp, sharp) → *-alt.webp. Register each with provenance and link default→alt.
 5. \`npm run check\`, \`npx eslint .\`, \`npm run build\` green; commit ("M1.5 integrator: variant system, branch copy preview, one-liners, media alternates"); push. Return: APIs (hook names, registry shape), the alt media ids, one-liners, anything builders must know.`,
  { label: 'm15-integrator', phase: 'Integrate' })

phase('Build')
const builders = await parallel([
  () => agent(`${RULES}
INTEGRATOR REPORT: ${JSON.stringify(integ).slice(0, 6000)}
TASK — BUILDER "INTRO + HERO ALTERNATES". Implement ALT variants that are meaningfully different choreographies (not tweaks), selectable via the variant system: INTRO — alt play-screen motion (e.g. Marauder's-map ink lines drawing the bracket + footprints walking to Play, vs default motes gathering), alt landing (e.g. ink-wipe / "Mischief managed" parchment fold-away vs default mask sweep), alt flight = intro-flight-alt video (and the code-flight alt path for mobile: e.g. a spiralling ascent + dome exit vs default bezier); HERO — alt media (hero-sea-alt plate + hero-sea-loop-alt), alt aperture (e.g. horizontal letterbox open vs default bracket clip), alt velocity dialect (e.g. spray particles vs grain). Both variants must obey every a11y/perf rule and the intro/hero bars (${B}/bars/intro.BAR.md, hero-lens.BAR.md).
YOU OWN ONLY: components/intro/**, public/intro/**, app/intro.css, components/sections/hero/**. Do not touch other files (report needed changes to shared files instead). \`npx tsc --noEmit\` + \`npx eslint <your files>\` green. Do not commit. Return your file list + how to preview each alt.`,
    { label: 'm15-builder:intro-hero', phase: 'Build' }),
  () => agent(`${RULES}
INTEGRATOR REPORT: ${JSON.stringify(integ).slice(0, 6000)}
TASK — BUILDER "ACT CARDS + LOADERS ALTERNATES". For each of the 4 act cards (opening, seam Storm→Blueprint, tintype, ignite) implement an ALT choreography that is meaningfully different (e.g. opening alt: a treasure-map unfold with X marking Act I vs default compass course; seam alt: chalk erasing the storm stroke-by-stroke vs default ice-cut; tintype alt: Dead-Eye red-tint lock-on across the four act marks vs default developing plate; ignite alt: Lumos wand-tip sweep lighting the candles in sequence vs default embers→candles). For each of the 4 world loaders (LD-HP, LD-PC, LD-3I, LD-RD) implement an alt (e.g. HP alt: Marauder's-map footprints loop; PC alt: hourglass/ship-in-bottle; 3I alt: chalk derivation writing itself; RD alt: journal page sketching with a pencil vs default tips card). Keep bars ${B}/bars/act-cards.BAR.md, loaders.BAR.md for both variants.
YOU OWN ONLY: components/sections/act-card/**, components/primitives/loaders/**, components/primitives/loader.tsx, components/primitives/act-card.tsx. \`npx tsc --noEmit\` + \`npx eslint <your files>\` green. Do not commit. Return file list + preview notes.`,
    { label: 'm15-builder:cards-loaders', phase: 'Build' }),
])

phase('Assemble')
const asm = await agent(`${RULES}
TASK — M1.5 ASSEMBLER. Builder reports: ${JSON.stringify(builders).slice(0, 12000)}
1) git status vs ownership; resolve conflicts. 2) Build app/lab/variants/page.tsx (noindex): a side-by-side DEFAULT vs ALT gallery for every variant-capable piece (intro play/landing, hero, 4 act cards, 4 loaders, media pairs) with replay buttons. 3) \`npm run check\`, \`npx eslint .\`, \`npm run build\` green (fix minimal). 4) Commit (builder file lists + lab page) and push. 5) Server on port 3141; ONE browser via ${R}/browser.js: capture default vs alt frames (1440 + 390 + reduced motion) of intro (?intro=1 and ?intro=1&variant=alt), hero, each act card mid/settled, loaders, and /lab/variants into ${B}/m15-frames/ + index.html contact sheet; check console errors = 0 and no overflow. Kill server. Return results.`,
  { label: 'm15-assembler', phase: 'Assemble' })

phase('Critique')
const crit = await agent(`${RULES}
One-pass art director + a11y/honesty critic. View every frame in ${B}/m15-frames/ (Read renders images). Judge: are the ALTs genuinely different and equally crafted; do both variants meet their bars; are the one-liners (${B}/ONE-LINERS.md) moving, specific to his real story and free of invented life events; any a11y/perf/legal/honesty problem. Assembler report: ${JSON.stringify(asm).slice(0, 4000)}. Return ≤12 prioritized issues with exact fixes (text).`,
  { label: 'm15-critic', phase: 'Critique' })

phase('Fix')
const fix = await agent(`${RULES}
TASK — M1.5 FIX ROUND. Apply the critic's critical/major issues (verify each; reject with reason if wrong); minor if cheap: ${String(crit).slice(0, 10000)}
Re-run check/eslint/build, re-capture affected frames into ${B}/m15-frames/after/, commit, push. Write ${B}/M15-REPORT.md (what shipped, how to preview alts: ?variant=alt and /lab/variants, one-liners list, known issues). Return the report text.`,
  { label: 'm15-fixer', phase: 'Fix' })

return { integ, builders, asm, crit, fix }
