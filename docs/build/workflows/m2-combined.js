export const meta = {
  name: 'm2-combined',
  description: 'M2 combined (replaces M2-R + M2-A + M2-B + M3): blind audit + iconic media lane -> plan -> integrator (register all media, enable sections, captions) -> 6 parallel section builders (recognizability + every signature moment) -> assemble -> blind re-test + critic -> fix -> push',
  phases: [
    { title: 'Audit', detail: 'blind capture + 3 judges || iconic media lane' },
    { title: 'Integrate', detail: 'plan + integrator' },
    { title: 'Build', detail: '6 builders, disjoint ownership' },
    { title: 'Assemble', detail: 'register new plates, build, captures' },
    { title: 'Review', detail: 'blind re-test x3 + craft/a11y/honesty critic' },
    { title: 'Fix', detail: 'fix round, report, push' },
  ],
}

const SITE = 'C:/Users/aaash/Desktop/Transcript/personal-website'
const R = 'C:/Users/aaash/Desktop/Transcript/research'
const B = `${R}/build`

const RULES = `
REPO ${SITE}, branch design/three-films (M1 + M1.5 done — read ${B}/M1-REPORT.md, ${B}/M15-REPORT.md if present, ${B}/ONE-LINERS.md; AGENTS.md/CLAUDE.md in the repo; Next 16 breaking changes). Authority: ${B}/SPEC.md v2 (§7 signature moments SM-1…SM-17), ${B}/DESIGN.md, ${B}/ICONS.md, ${B}/rdr2/STUDY.md, ${B}/MEDIA-PLAN.md, ${B}/bars/*.BAR.md, ${R}/AUTOPILOT.md (Aryan's BINDING answers).
RECOGNIZABILITY RULE (Aryan, binding, outranks subtlety): every film scene blatantly obvious — (a) stranger test: identifiable within ~3 s by someone who knows the film; (b) where imagery alone can't pass, PROMINENT visible HTML text naming FILM + MOMENT in the world's fan font; every act card shows the film title prominently; (c) accurate iconic moments (HP: Hogwarts, Great Hall floating candles, Marauder's Map footprints + "I solemnly swear…", Hogwarts Express, letter + wax seal, snitch, bolt, 9¾, Lumos; Pirates: Black Pearl close w/ tattered black sails, Jack's compass, Jolly Roger, treasure/Aztec gold, kraken, "Savvy?"; 3 Idiots: ICE college chalkboard, "All Izz Well" hand-on-heart, Rancho's drone, scooter, machine definition, Virus's stopwatch; RDR2: WANTED poster, camp w/ campfire/horses/tents, Dead Eye red + X marks, Arthur's journal sketches, cowboy hat, satchel, Heartlands golden hour, the train); (d) SMOOTH transitions between every world pair (no hard cuts).
DEFAULT + ALT: every animation/video ships a default and an alt (variant system from M1.5).
HARD LIMITS: no actor faces/likenesses; no ripped stills/footage/official logo files (recreate); fan-tribute credit; research honesty untouched (Sharpe-2.0 rule, synthetic labels, caveats adjacent, writing drafts stay non-link DRAFT); CLAUDE.md §2; one-liners stay draft-flagged but visible (branchPreview).
A11Y/PERF: reduced motion + Pause stop everything; hydration-safe; focus parity; AA contrast (captions too); one h1 (the name); intro never gates; one decoder; mobile stills; no text baked into generated media.
LAPTOP: builders run ONLY \`npx tsc --noEmit\` (at most twice, at the end) + \`npx eslint <their files>\`; only integrator/assembler/fixer run next build/servers; ONE browser via ${R}/browser.js; ffmpeg -threads 2; kill servers you start.
GIT: builders never stage/commit (shared tree) — report file lists; integrator/assembler/fixer commit (blank line + 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'), then run \`bash ${R}/sync-to-repo.sh\`, commit docs/build + tools/capture changes, and \`git push origin design/three-films\` (never main, never force). Never commit .claude/, skills-lock.json.
`

phase('Audit')
const frames = await agent(`${RULES}
TASK — BLIND AUDIT CAPTURE of the CURRENT site (before any M2 edits). \`npm run build\`, \`npx next start -p 3161\`. ONE browser: capture at 1440x900 every film-world scene (intro play ?intro=1, mid-flight, hero, each act card mid+settled, one frame per section: about, journey, work, systems, kill-list, beyond, writing, voices, principles, contact, credits; each world loader via /lab) as NAME.captioned.png and NAME.blind.png (inject CSS hiding all text: '* { color: transparent !important; text-shadow: none !important } svg text { fill: transparent !important }') into ${B}/m2-audit/, plus ?variant=alt act cards (blind). Kill the server. Write ${B}/m2-audit/manifest.json (frame → intended world → intended moment). Return the manifest.`,
  { label: 'm2-capture', phase: 'Audit' })

const JUDGE = { type: 'object', properties: { verdicts: { type: 'array', items: { type: 'object', properties: {
  frame: { type: 'string' }, guessedFilm: { type: 'string' }, guessedMoment: { type: 'string' }, confidence: { type: 'number' }, why: { type: 'string' } },
  required: ['frame', 'guessedFilm', 'confidence'] } } }, required: ['verdicts'] }
const judgePrompt = (dir, i) => `You are blind judge #${i + 1} (a movie/game fan). Look at EVERY *.blind.png in ${dir} (Read renders images; do NOT open captioned versions, manifests or docs). For each frame guess the film/game (Harry Potter, Pirates of the Caribbean, 3 Idiots, Red Dead Redemption 2, or "can't tell"), the specific moment, confidence 0–1, and one line why — as a first-time viewer in ~3 seconds.`

const mediaLane = agent(`${RULES}
TASK — ICONIC MEDIA LANE (Higgsfield via ToolSearch "+Higgsfield"; read C:/Users/aaash/.claude/skills/higgsfield-generate/SKILL.md + ${B}/MEDIA-PLAN.md conventions + ${B}/media/LOG.md history). Generate these ICONIC plates (original, no faces/people/text/logos; default = best of a count-2 batch, alt = runner-up; LOOK at each; ≤2 regens): PEARL (the Black Pearl close/three-quarter, tattered black sails, night sea, 16:9), HALL (a great hall with hundreds of floating candles over long tables, starry enchanted ceiling, 16:9), EXPRESS (a crimson steam locomotive crossing a stone viaduct in highland mist, 16:9), ICE (an Indian engineering college stone corridor / lecture hall with a big chalkboard — board surface blank for HTML text — 16:9), DRONE (a homemade quadcopter with visible hand-built parts hovering in a college courtyard, 16:9), CAMP (a frontier camp at dusk: canvas tents, campfire, hitched horses, wagon, pines, 16:9), WANTED (a weathered wooden notice board with blank paper posters nailed to it — posters empty for HTML text — 16:9), DEADEYE (a frontier landscape in red Dead-Eye tint, sepia-red grade, 16:9). If ${B}/RECOGNIZABILITY.md exists later in your run, also read it and add any plates it requests. Encode webp (sharp from ${SITE} node_modules; 2560w + 1280w). Save ONLY to ${B}/media/accepted/ as iconic-<name>.webp and iconic-<name>-alt.webp. Log ${B}/media/LOG.md section "M2 iconic", ledger ${B}/media/LEDGER-m2iconic.md. CAP 330 credits; never let the balance drop below 150 (check before each batch). Return files, credits, balance.`,
  { label: 'm2-media-iconic', phase: 'Audit' })

const judges = await parallel([0, 1, 2].map(i => () => agent(judgePrompt(`${B}/m2-audit/`, i), { label: `m2-judge:${i + 1}`, phase: 'Audit', schema: JUDGE })))

phase('Integrate')
const plan = await agent(`${RULES}
TASK — RECOGNIZABILITY PLAN. Blind verdicts: ${JSON.stringify(judges).slice(0, 18000)}. Manifest: ${String(frames).slice(0, 3000)}. Look at the captioned frames yourself. PASS = ≥2 of 3 judges named the right film with confidence ≥0.6. Write ${B}/RECOGNIZABILITY.md: scene → intended film/moment → guesses → PASS/FAIL → upgrades (iconic plate id to use: staged ones in ${B}/media/accepted (see ${B}/media/M2-MEDIA-REPORT.md) or the iconic-* ones being generated (PEARL, HALL, EXPRESS, ICE, DRONE, CAMP, WANTED, DEADEYE); code motifs; exact caption text FILM + MOMENT + font + placement; transition fix). Return a compact summary.`,
  { label: 'm2-plan', phase: 'Integrate' })

const integ = await agent(`${RULES}
PLAN: ${String(plan).slice(0, 6000)} (full: ${B}/RECOGNIZABILITY.md)
TASK — INTEGRATOR (sole repo editor in this phase):
 1. MEDIA: copy ALL staged assets from ${B}/media/accepted/ that aren't yet in public/media/films (storm, voyage-a..d + alts, voyage-seq + voyage-seq-alt dirs, board-dawn(+alt), frontier-dusk(+mobile,+alts), campfire(+loop,+alts), lights-line(+alt), last-light(+loop,+alts), films-*(+alt), *-alt2 per M2-MEDIA-REPORT recommendation) into public/media/films/ and register each in lib/media.ts (dims via sharp/ffprobe, focal, decorative alt, provenance + job ids, status accepted, default→alt links; MEDIA-PLAN ids planned→accepted). Pre-register iconic-{pearl,hall,express,ice,drone,camp,wanted,deadeye} (+ -alt) as 'planned' with sensible fallbacks.
 2. MANIFEST: enable every section SPEC v2 wants for M2 (trading-algos, optuna-screener, experiment as their own chapter/experiment sections; films chapter; credits as its own section if SPEC says; kill-list as its own ledger section) — create stub component files at the paths below and register them in components/sections/registry.ts, and REMOVE the duplicates rendered inside the old Projects component / Footer in the same change so nothing renders twice. Keep all anchors.
 3. COPY: add every caption/lettering string from RECOGNIZABILITY.md to lib/film.ts (status proposed, visible via branchPreview); add new lettering strings to film.lettering; run scripts/fetch-display-fonts.mjs.
 4. Stub files (empty typed components builders will fill): components/sections/chapter/chapter-section.tsx, components/sections/experiment/experiment-section.tsx, components/sections/ledger/ledger-section.tsx, components/sections/films/films-section.tsx (+ any others SPEC needs).
 5. check/eslint/build green; commit; sync + push. Return the APIs builders need (media ids, caption keys, stub paths, hooks).`,
  { label: 'm2-integrator', phase: 'Integrate' })

phase('Build')
const ctx = `INTEGRATOR: ${String(integ).slice(0, 6000)}\nPLAN: ${B}/RECOGNIZABILITY.md\n`
const BUILDERS = [
  { key: 'cards', own: 'components/sections/act-card/**, components/primitives/act-card.tsx, components/intro/** (handoff only)', task: 'Every act card (default + alt) passes the stranger test: prominent FILM TITLE in the fan font + MOMENT caption + the most iconic imagery (Pirates: iconic-pearl/Jolly Roger/compass; 3 Idiots: iconic-ice chalkboard + "All Izz Well" + drone; RDR2: iconic-wanted / iconic-camp / iconic-deadeye; HP: iconic-hall candles / Hogwarts / Marauder\'s Map). SMOOTH world-to-world transitions for every pair incl. prologue→hero (cross-dissolve/morph of palette + motif; no hard cuts). Wire media by id via MediaFrame (poster-first, fallbacks).' },
  { key: 'act1-pirates', own: 'components/site/about*.tsx, components/site/journey*.tsx, components/sections/story-section.tsx, components/worlds/pirates/**', task: 'Act I Pirates: about + journey. Build SM-4 "the voyage" per SPEC (sticky sea sequence using voyage-seq / voyage-seq-alt frames, scroll-scrubbed on desktop fine-pointer, stills on mobile/reduced; Jack\'s compass hunting then settling per leg; brass course line through 4 waypoints) and make the whole act unmistakably Pirates (Black Pearl, Jolly Roger, treasure-map X, compass; captions like "THE COMPASS THAT POINTS TO WHAT YOU WANT • PIRATES OF THE CARIBBEAN"). Default + alt choreography.' },
  { key: 'act2-idiots', own: 'components/site/projects*.tsx, components/site/gauntlet*.tsx, components/site/capabilities*.tsx, components/site/ledger*.tsx, components/site/metric-tile*.tsx, components/sections/chapter/**, components/sections/experiment/**, components/sections/ledger/**, components/visuals/backtest-demo.tsx (presentation only — never its model/labels), components/worlds/idiots/**', task: 'Act II 3 Idiots: SM-6 gauntlet on the dawn board (board-dawn plate, chalk derivation per gate, visitor runs labelled-illustrative hypotheses), SM-7 honest chalk chapters (trading-algos, optuna-screener: blueprint schematics of the REAL systems, chalk circle around the caveat), experiment (BacktestDemo, SYNTHETIC label adjacent), systems FIG "how this page is built", SM-8 the reckoning (Lens Index kill-list, equal quiet at rest, ember strike on killed) + SM-17 Dead Eye egg on the kill-list. Unmistakably 3 Idiots (ICE chalkboard, "All Izz Well", Rancho\'s drone, Virus\'s stopwatch; captions in Kalam). Default + alt choreography.' },
  { key: 'act3-rdr2', own: 'components/site/beyond*.tsx, components/site/writing*.tsx, components/site/testimonials*.tsx, components/worlds/rdr2/**', task: 'Act III RDR2: SM-15 the frontier (frontier-dusk golden-hour band), SM-11 the journal (writing as Arthur-style journal pages with pencil sketches; drafts stay non-link DRAFT), SM-16 by the fire (voices around the campfire plate + loop), a WANTED poster with Aryan\'s name (HTML text on iconic-wanted), Dead Eye accents. Unmistakably RDR2 with captions. Default + alt choreography.' },
  { key: 'act4-hp-films', own: 'components/site/principle*.tsx, components/site/contact*.tsx, components/sections/films/**, components/worlds/hp/**', task: 'Act IV Harry Potter: principles (HP-07 ribbons + iconic-hall candles), SM-12 last light contact (last-light plate + loop, the bracket closing on the AS monogram, magnetic copy-email; Marauder\'s Map "Mischief managed"), plus SM-9 the Intermission films-and-game chapter (4 letterboxed screens films-pirates/idiots/rdr2/hp, each: film named big, what this page borrowed, one quote via FilmQuote, and Aryan\'s one-liner reason from lib/film.ts). Unmistakably HP. Default + alt choreography.' },
  { key: 'loaders-eggs-chrome', own: 'components/primitives/loaders/**, components/primitives/loader.tsx, components/eggs/**, components/site/header.tsx, components/site/footer.tsx, components/site/command-palette.tsx, app/not-found.tsx', task: 'Loaders: each reads instantly as its film (HP Marauder\'s map/Hogwarts; PC compass + Black Pearl; 3I chalk + "All Izz Well"; RD WANTED/journal + tips) — default + alt. Easter eggs per SPEC/ICONS (Lumos/Nox toggle, snitch, Dead Eye command, palette egg commands, themed 404). Header act label + compass behave across all 4 acts; footer credits roll complete (fan-tribute line, provenance, AI assistance).' },
]
const built = await parallel(BUILDERS.map(b => () => agent(`${RULES}
${ctx}
TASK — BUILDER "${b.key}": ${b.task}
Meet the bars in ${B}/bars/ that cover your moments + the RECOGNIZABILITY RULE + default/alt.
YOU OWN ONLY: ${b.own}. Do not edit any other file (report needed shared-file changes instead). \`npx tsc --noEmit\` + \`npx eslint <your files>\` green. Do not commit. Return your file list + preview notes.`,
  { label: `m2-builder:${b.key}`, phase: 'Build' })))

phase('Assemble')
const media = await mediaLane
const asm = await agent(`${RULES}
TASK — ASSEMBLER. Iconic media: ${String(media).slice(0, 4000)}. Builders: ${JSON.stringify(built).slice(0, 14000)}.
1) Copy the accepted iconic-* plates into public/media/films and flip their lib/media.ts rows to accepted (provenance + alt links). 2) Resolve conflicts; apply builders' requested shared-file changes. 3) check/eslint/build green. 4) Commit; sync; push. 5) Server 3162; ONE browser; capture the same set as ${B}/m2-audit/manifest.json into ${B}/m2-after/ (captioned + blind + ?variant=alt) + every act-card transition at 3 scroll points + 390 and reduced-motion frames of each section; contact sheet index.html. Console errors must be 0; no overflow at 390/1440. Kill server. Return results.`,
  { label: 'm2-assembler', phase: 'Assemble' })

phase('Review')
const reviews = await parallel([
  ...[0, 1, 2].map(i => () => agent(judgePrompt(`${B}/m2-after/`, i) + ' Then open the *.captioned.png versions and say whether each caption makes film + moment unmistakable, and rate the transition frames for smoothness.', { label: `m2-retest:${i + 1}`, phase: 'Review', schema: JUDGE })),
  () => agent(`${RULES}\nOne-pass art director + a11y + honesty critic over ${B}/m2-after/ (all frames incl. 390 + reduced). Judge craft (award-level? not theme-park?), bars, a11y, honesty/legal. Return ≤15 prioritized issues with exact fixes.`, { label: 'm2-critic', phase: 'Review' }),
])

phase('Fix')
const fix = await agent(`${RULES}
TASK — FIX ROUND. Reviews: ${JSON.stringify(reviews).slice(0, 20000)}. Fix every scene still failing the stranger test (fewer than 2/3 correct blind, or ambiguous captioned), every jarring transition, and the critic's critical/major issues (verify each). check/eslint/build green; re-capture affected frames into ${B}/m2-after/fixed/; commit; sync; push. Update ${B}/RECOGNIZABILITY.md (final PASS/FAIL) and write ${B}/M2-REPORT.md (what shipped, credits, remaining issues). Return the report text.`,
  { label: 'm2-fixer', phase: 'Fix' })

return { frames, judges, plan, integ, built, media, asm, reviews, fix }
