export const meta = {
  name: 'milestone-1-build',
  description: 'Milestone 1 on design/three-films: integrator (worlds/acts/fonts/media wiring) -> 3 parallel builders (HP intro overlay, hero + act cards + world loaders, four-world skins across sections) -> integrate/build/capture -> one critic pass -> fix -> report',
  phases: [
    { title: 'Integrate', detail: 'manifest worlds/acts, RDR2 tokens, fonts, media wiring' },
    { title: 'Build', detail: '3 parallel builders with disjoint file ownership' },
    { title: 'Assemble', detail: 'check/lint/build, commits, frame captures' },
    { title: 'Critique', detail: 'one critic pass vs bars' },
    { title: 'Fix', detail: 'apply top issues, final captures, report' },
  ],
}

const SITE = 'C:/Users/aaash/Desktop/Transcript/personal-website'
const R = 'C:/Users/aaash/Desktop/Transcript/research'
const B = `${R}/build`

const RULES = `
REPO ${SITE}, branch design/three-films (Phase 0 manifest + P1-early tokens/primitives/lab are committed — read ${B}/P1-EARLY.md for the primitives' APIs). Next.js 16.2.9 / React 19.2.4 / Tailwind v4 / motion 12. Read AGENTS.md + CLAUDE.md first (Next 16 breaking changes: obey AGENTS.md about reading node_modules/next/dist/docs).
DESIGN AUTHORITY: ${B}/SPEC.md (v2: four worlds — Harry Potter, Pirates of the Caribbean, 3 Idiots, Red Dead Redemption 2 — acts, prologue intro §5, hero §6, loaders §8, world system §9, adaptability §12, fallbacks §13, perf §14, legal/honesty §15), ${B}/DESIGN.md (tokens, fonts policy, bans), ${B}/ICONS.md (iconic elements now ALLOWED — recreate ourselves), ${B}/rdr2/STUDY.md, ${B}/MEDIA-PLAN.md, bars ${B}/bars/*.BAR.md. Media produced so far: ${B}/media/LOG.md + ${B}/media/accepted/.
ARYAN'S DIRECTION: it's a PERSONAL blog — films/game emphasized strongly, real iconography recreated by us is encouraged. Remaining hard limits: no actor faces/likenesses; no ripped stills/footage/official logo FILES in the public repo; credits carry "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games"; research honesty untouched (no invented facts; any "why this film matters to me" line = DRAFT flag in content, rendered with a subtle DRAFT marker or hidden until confirmed per SPEC §9.6); CLAUDE.md §2 exclusions.
A11Y/PERF (binding): reduced motion + the Pause toggle stop ALL JS/canvas/video motion; hydration-safe (no React #418); focus parity; 44px targets; AA contrast incl. world palettes; one h1 (the name); intro overlay NEVER gates content (SSR page complete underneath); LCP ≤ 2.5 s mobile lab; one video decoder; mobile = stills.
LAPTOP LOAD: only the integrator/assembler runs \`next build\`/servers; builders use \`npx tsc --noEmit\` and \`npx eslint <their files>\` only; ONE browser at a time via ${R}/browser.js (never chromium.launch directly); ffmpeg -threads 2; kill any server you start.
GIT: builders DO NOT commit or stage (parallel agents share one working tree) — they report their exact file list; the assembler commits. Messages end with a blank line + 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'. Never commit .claude/, skills-lock.json, research docs; never push.
`

phase('Integrate')
const integ = await agent(`${RULES}
TASK — INTEGRATOR (runs alone, before the builders):
 1. lib/page.ts (+ lib/film.ts per SPEC §12.1 if specified): assign every section its act/world/tone per SPEC v2's manifest order; add new entries/types the spec requires ONLY as data stubs the builders will render (e.g. act cards are DERIVED in lib/sections.ts from world changes — implement that derivation: a pure function inserting {kind: 'act', from, to, act, title} items between sections whose world differs, plus opening/credits items; export it for the page renderer). Keep \`npm run check\` green; extend scripts/check-manifest.mjs with the SPEC §12.5 checks that are cheap.
 2. app/globals.css: fill the RDR2 world token block (from DESIGN v2 / rdr2 STUDY) and any missing world vars; verify AA contrast of text tokens per world (compute with a tiny node script) and adjust if needed.
 3. Fonts: implement the DESIGN fonts policy — per-world DISPLAY fonts for act titles/loaders/easter eggs only, self-hosted via next/font/local in a single lib/fonts.ts. Download only fonts whose licence permits this use (record licence + source in ${B}/FONTS.md); if a suitable licensed file isn't obtainable in ~10 minutes, fall back to Newsreader/Geist Mono styling for that world and note it. Expose CSS vars (--font-world-hp etc.).
 4. Media wiring: copy the accepted web assets from ${B}/media/accepted/ (webp/mp4/webm/posters — NOT *.master.png) into public/media/films/ with the MEDIA-PLAN filenames; register each in lib/media.ts (width/height via sharp/ffprobe, focal, alt/decorative, provenance {source:'higgsfield', model, credits, date}, status 'accepted', fallback to legacy assets). If the flight (IN-02) or hero loop (MV-03) is not accepted yet, register them as 'planned' with fallbacks so builders can code against the ids.
 5. Run \`npm run check\`, \`npx eslint .\`, \`npm run build\` — green. Commit ("M1 integrator: worlds/acts in manifest, derived act cards, RDR2 tokens, world fonts, film media").
Return: the manifest order with world/act per section, the derived-card function name + shape, the media ids available (status), font vars, and anything builders must know.`,
  { label: 'm1-integrator', phase: 'Integrate' })

phase('Build')
const OWN = {
  intro: 'app/layout.tsx (head arming script + overlay mount), components/intro/** (new), public/intro/** (new: vanilla controller JS if used), any CSS for the intro inside components/intro/*.module.css or a new app/intro.css imported by layout. DO NOT touch hero, sections, lib/page.ts, lib/sections.ts, globals.css (except you may append one clearly-delimited /* === intro === */ block at the END of globals.css if a global rule is unavoidable).',
  hero: 'the hero section component (create components/sections/hero/** and point the registry entry for the hero type at it), components/sections/act-card/** + the world renderers for Loader/ActCard (components/primitives/loaders/** or wherever P1-EARLY put the registry), app/page.tsx (render the derived act-card items between sections), components/sections/registry.ts. DO NOT touch the intro, layout.tsx, lib/page.ts, globals.css (except a delimited /* === hero & cards === */ block appended at the END), or other sections.',
  worlds: 'every OTHER existing section component under components/site/** and components/visuals/** EXCEPT hero/hero-scene (owned by the hero builder) and header? — you OWN components/site/header.tsx, footer.tsx (credits roll per SPEC), section-rail.tsx, command-palette.tsx too. DO NOT touch layout.tsx, app/page.tsx, registry.ts, lib/page.ts, the intro, the hero, act cards/loaders, globals.css (except a delimited /* === world skins === */ block appended at the END).',
}
const builders = await parallel([
  () => agent(`${RULES}
INTEGRATOR REPORT: ${JSON.stringify(integ).slice(0, 5000)}
TASK — BUILDER "INTRO": implement the Harry Potter PROLOGUE per SPEC v2 §5 + ${B}/bars/intro.BAR.md, with the iconic override (e.g. "I solemnly swear that I am up to no good" as the Play prompt/aria text, "Mischief managed" on exit/skip per ICONS.md/SPEC v2). Architecture: overlay above the fully SSR page; hidden by default in CSS; armed pre-paint by an inline head script only when all SPEC conditions hold (JS, no reduced motion, no ?skip, no #hash, not Save-Data/slow, not seen this session, ?intro=1 forces for QA); 3 s failsafe; vanilla controller (tiny, works pre-hydration) owning canvas + video + states; play screen = IN-01 plate (desktop) / IN-01m (mobile) drawn after load; Play (native button, bracket Lens, ≥44px), Skip intro, Esc, scroll-intent dismiss; flight = IN-02 video if its media status is accepted (read lib/media.ts), else the CODE FLIGHT fallback (SVG broom along a bezier + canvas light trail + dome exit) — build BOTH; landing → unmount, inert removed, focus to h1, sessionStorage intro-seen. Reduced motion/no-JS: never shows.
YOU OWN ONLY: ${OWN.intro}
Check with \`npx tsc --noEmit\` and \`npx eslint <your files>\`. Do not commit. Return your exact file list + notes for the assembler (how to force the intro for QA, any follow-ups).`,
    { label: 'm1-builder:intro', phase: 'Build' }),
  () => agent(`${RULES}
INTEGRATOR REPORT: ${JSON.stringify(integ).slice(0, 5000)}
TASK — BUILDER "HERO + ACT CARDS + LOADERS": (1) the cold-open hero per SPEC v2 §6 + ${B}/bars/hero-lens.BAR.md: static SSR h1 "Aryan / Sharma" at the display token, in front of MV-01 via MediaFrame (poster priority; MV-02 on mobile; MV-03 loop swap on desktop fine-pointer only after 'playing', and only after the intro overlay has unmounted — listen for the intro's done event/flag), lead + identity meta + ONE CTA to #work, the bracket Lens (aperture once per session only if the intro did not play), media-only velocity noise, the D3 scroll-out map; mobile stack. (2) Act cards: render the integrator's derived act-card items as letterboxed ActCards per SPEC v2 §9.3 with the incoming world's choreography + world display font + iconic touch (e.g. HP ink / Pirates compass & course line / 3 Idiots blueprint & gear / RDR2 journal & sunset), ≤ the spec's travel caps, reduced-motion = static title card. (3) The four world LOADER renderers (LD-HP, LD-PC, LD-3I, LD-RD) per SPEC v2 §8 + ${B}/bars/loaders.BAR.md, registered in the P1 Loader registry, supporting real-progress/indeterminate AND scroll-progress modes; RDR2 loader shows TIPS drawn from Aryan's real principles in content (per SPEC v2); aria-hidden art + role=status text; no flashing.
YOU OWN ONLY: ${OWN.hero}
Check with \`npx tsc --noEmit\` and \`npx eslint <your files>\`. Do not commit. Return your exact file list + notes.`,
    { label: 'm1-builder:hero-cards', phase: 'Build' }),
  () => agent(`${RULES}
INTEGRATOR REPORT: ${JSON.stringify(integ).slice(0, 5000)}
TASK — BUILDER "FOUR WORLDS ACROSS THE PAGE": make every existing section FEEL its world (per its manifest world/tone) — this is Milestone 1's "the whole page is already cinematic" pass, not every final signature moment. For each section: apply the world token vars (ground, ink, rules, accent) via SectionFrame's data-world/data-tone, retire the old generic "max polish" layer per SPEC §11.3 (cursor glow, dot lattice, bloom, grain, marquee, ghost numerals, decrypt labels, scroll-progress bar, stale backdrops) where it conflicts, adopt the DESIGN type scale (display/chapter/title/…, one label system), and add ONE strong, cheap, on-brand iconic motif per section from ICONS.md/SPEC v2 (e.g. Pirates: Jack's compass as the header navigator that swings to the active section + brass course line; 3 Idiots: blueprint FIG. panel / chalk circle around a caveat; RDR2: Arthur-journal page treatment + Dead Eye marks on killed ledger rows if the ledger lives in an RDR2/relevant act per SPEC v2, or a WANTED poster moment; HP: parchment Writing with ink-drawn title, Marauder's-map footprints trail, lumos read-in on the lead quote). Header: compass + act label + Work + motion toggle (Lumos/Nox labels if SPEC v2 says so) + Menu. Footer: the closing CREDITS roll per SPEC v2 (incl. fan-tribute non-affiliation line, imagery provenance, AI assistance). Keep every research honesty label, caveat, DRAFT state and anchor intact; keep existing interactive widgets (BacktestDemo, gauntlet tabs, carousel, command palette, copy email) working.
YOU OWN ONLY: ${OWN.worlds}
Check with \`npx tsc --noEmit\` and \`npx eslint <your files>\`. Do not commit. Return your exact file list + notes (which motifs landed where, what you retired).`,
    { label: 'm1-builder:worlds', phase: 'Build' }),
])

phase('Assemble')
const assembled = await agent(`${RULES}
TASK — ASSEMBLER. Builder reports: ${JSON.stringify(builders).slice(0, 15000)}
 1. \`git status\` — confirm changed files match the three ownership lists; resolve any overlap/conflict (e.g. the three delimited globals.css blocks) sensibly.
 2. \`npm run check\`, \`npx eslint .\`, \`npm run build\` — fix whatever breaks (minimal, correct fixes).
 3. Commit in three commits by builder file lists (+ one for any assembler fixes).
 4. Start \`npx next start -p 3131\`. With ONE browser via ${R}/browser.js capture into ${B}/m1-frames/: intro forced (?intro=1) at 1440: play screen settled, Play hover/focus, t≈1s/3s/5s of the flight, landing; hero at 1440 + 390 + reduced motion; every derived act card mid + settled; one representative section per world at 1440 + 390; the loaders (via /lab or forced states); header compass; credits footer. Also check: console errors (none), no horizontal overflow at 390 and 1440, h1 is the name, content present in server HTML (curl the page and grep the h1 + a section heading). Kill the server.
 5. Write ${B}/m1-frames/index.html (contact sheet of all frames with captions). Return: commits, check results, frame list, any failing checks.`,
  { label: 'm1-assembler', phase: 'Assemble' })

phase('Critique')
const CRIT = { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['critical', 'major', 'minor'] }, where: { type: 'string' }, problem: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'where', 'problem', 'fix'] } }, verdict: { type: 'string' } }, required: ['issues', 'verdict'] }
const critique = await agent(`${RULES}
You are a demanding art director + a11y/honesty reviewer (one pass). Look at EVERY frame in ${B}/m1-frames/ (Read renders images) and judge against the bars (${B}/bars/intro.BAR.md, hero-lens, loaders, act-cards, plus the four-worlds feel) and the Awwwards-level bar from ${R}/SYNTHESIS.md §1: hierarchy (name is the headline), the four worlds strongly and beautifully felt, iconic moments crafted (not theme-park), readability/contrast, clipped text, overflow, broken layouts, janky fallbacks, and the hard limits (no faces, no ripped assets, non-affiliation credit present, honesty labels intact). Assembler report: ${JSON.stringify(assembled).slice(0, 5000)}. Return prioritized, concrete issues (max ~15) with the exact fix.`,
  { label: 'm1-critic', phase: 'Critique', schema: CRIT })

phase('Fix')
const fixed = await agent(`${RULES}
TASK — FIX ROUND (single). Apply the critic's critical + major issues (verify each; reject with reason if wrong), then minor ones if cheap: ${JSON.stringify(critique).slice(0, 12000)}
Re-run \`npm run check\`, \`npx eslint .\`, \`npm run build\`; re-capture the affected frames into ${B}/m1-frames/after/ (one browser via ${R}/browser.js, port 3132, kill after) and update the contact sheet. Commit. Then write ${B}/M1-REPORT.md: what Milestone 1 delivers (with the best 8 frame paths), how to run it locally (\`npm run dev\` → http://localhost:3000, \`?intro=1\` to replay the intro, \`?skip\` to skip), what's intentionally deferred to Milestone 2 (remaining signature moments per SPEC v2), DRAFT copy items for Aryan, credits spent so far (from ${B}/media/LEDGER.md), and known issues. Return the report text.`,
  { label: 'm1-fixer', phase: 'Fix' })

return { integ, builders, assembled, critique, fixed }
