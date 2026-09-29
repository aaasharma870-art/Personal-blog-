export const meta = {
  name: 'm2r-recognizability',
  description: 'M2-R: blind stranger-test audit of every film scene -> upgrade plan -> iconic Higgsfield plates (default+alt) in parallel with integrator (register staged media, captions/lettering data) -> 3 builders (act cards+transitions / Acts I-II / Acts III-IV+loaders) -> register new plates -> assemble -> blind re-test -> fix -> push',
  phases: [
    { title: 'Audit', detail: 'capture uncaptioned frames, 3 blind judges, upgrade plan' },
    { title: 'Prepare', detail: 'iconic media lane || integrator' },
    { title: 'Build', detail: '3 builders, disjoint ownership' },
    { title: 'Assemble', detail: 'register new plates, check/lint/build, captures, commit, push' },
    { title: 'Retest', detail: 'blind re-test + fix round' },
  ],
}

const SITE = 'C:/Users/aaash/Desktop/Transcript/personal-website'
const R = 'C:/Users/aaash/Desktop/Transcript/research'
const B = `${R}/build`

const RULES = `
REPO ${SITE}, branch design/three-films (M1 + M1.5 done; read ${B}/M1-REPORT.md and ${B}/M15-REPORT.md if present, plus AGENTS.md/CLAUDE.md — Next 16 breaking changes). Design authority: ${B}/SPEC.md v2, ${B}/DESIGN.md, ${B}/ICONS.md, ${B}/bars/*. Autopilot rules + Aryan's BINDING answers: ${R}/AUTOPILOT.md — especially the RECOGNIZABILITY RULE:
 "the scenes for each movie need to be blatantly obvious for anyone to figure out, and if not, something in the text clarifying what it is; smooth transitions between all of them; scenes accurate, iconic, easy to pick up on." (a) STRANGER TEST: identifiable within ~3 s by someone who knows the film; (b) where imagery alone fails: PROMINENT visible HTML text naming the FILM and the MOMENT (e.g. "THE GREAT HALL • HARRY POTTER"), in that world's display (fan) font; every act card shows the film title prominently; (c) accurate iconic moments per ICONS.md (HP: Hogwarts, Great Hall floating candles, Marauder's Map, Hogwarts Express, letter + wax seal, snitch, bolt, 9¾, Lumos; Pirates: Black Pearl close with tattered black sails, Jack's compass, Jolly Roger, treasure/Aztec gold, kraken, "Savvy?"; 3 Idiots: ICE college chalkboard, "All Izz Well", Rancho's drone, scooter, machine definition, Virus's stopwatch; RDR2: WANTED poster, camp with campfire/horses/tents, Dead Eye red + X marks, Arthur's journal sketches, cowboy hat, Heartlands golden hour, the train); (d) SMOOTH transitions between every world pair (cross-dissolve/morph, no hard cuts).
HARD LIMITS: no actor faces/likenesses; no ripped stills/footage/official logo files (recreate); fan-tribute credit; research honesty untouched; CLAUDE.md §2; one-liners stay draft-flagged.
A11Y/PERF: reduced motion + Pause stop everything; hydration-safe; focus parity; AA contrast (captions too); one h1; intro never gates; one decoder; mobile stills; text never baked into generated media (captions are HTML).
LAPTOP: only integrator/assembler/fixer run next build/servers; builders use tsc + eslint on their files; ONE browser via ${R}/browser.js; ffmpeg -threads 2; kill servers you start.
GIT: builders never stage/commit (shared tree); integrator/assembler/fixer commit (blank line + 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>') then \`git push origin design/three-films\` (never main, never force). Never commit .claude/, skills-lock.json, research docs.
`

phase('Audit')
const frames = await agent(`${RULES}
TASK — CAPTURE for a blind audit. \`npm run build\` then \`npx next start -p 3151\`. With ONE browser (${R}/browser.js) capture at 1440x900 every film-world scene: intro play screen (?intro=1), mid-flight, hero, each act card mid + settled, one frame per world section (about, journey, work, systems/kill-list, beyond, writing, voices, principles, contact), films chapter if enabled, each world loader (/lab), credits. For EACH frame save two versions into ${B}/m2r-audit/: NAME.captioned.png (as-is) and NAME.blind.png with all text hidden (inject CSS: '* { color: transparent !important; text-shadow: none !important; } svg text { fill: transparent !important }' — keep images/SVG shapes). Also capture ?variant=alt versions of the act cards (blind). Kill the server. Write ${B}/m2r-audit/manifest.json listing frame → intended world → intended moment (from SPEC v2). Return the manifest.`,
  { label: 'm2r-capture', phase: 'Audit' })

const JUDGE = { type: 'object', properties: { verdicts: { type: 'array', items: { type: 'object', properties: {
  frame: { type: 'string' }, guessedFilm: { type: 'string' }, guessedMoment: { type: 'string' }, confidence: { type: 'number' }, why: { type: 'string' } },
  required: ['frame', 'guessedFilm', 'confidence'] } } }, required: ['verdicts'] }
const judges = await parallel([0, 1, 2].map(i => () => agent(`
You are blind judge #${i + 1} (a movie fan). Look at EVERY *.blind.png in ${B}/m2r-audit/ (Read renders images; do NOT open the captioned versions, the manifest, or any design docs). For each frame, guess which film or game it evokes — choices: Harry Potter, Pirates of the Caribbean, 3 Idiots, Red Dead Redemption 2, or "can't tell" — and which specific scene/moment, with a 0–1 confidence and one line why. Judge honestly as a first-time viewer would in ~3 seconds.`,
  { label: `m2r-judge:${i + 1}`, phase: 'Audit', schema: JUDGE })))

const plan = await agent(`${RULES}
TASK — UPGRADE PLAN. Blind verdicts: ${JSON.stringify(judges).slice(0, 20000)}. Manifest: ${String(frames).slice(0, 4000)}. Also look at the captioned frames in ${B}/m2r-audit/ yourself.
For each scene: PASS if ≥2 of 3 judges named the right film with confidence ≥0.6 on the blind frame; otherwise FAIL. Write ${B}/RECOGNIZABILITY.md: table scene → intended film/moment → judges' guesses → PASS/FAIL → upgrade (1) more iconic imagery (new Higgsfield plate — give the exact asset id, prompt (original, no faces/text/logos), model/settings from MEDIA-PLAN conventions, default+alt) and/or code motif, (2) clarifying caption text (exact wording + font + placement), (3) transition fix. EVEN PASSING scenes get the prominent film-title/moment caption per rule (b) where it helps. Also list which staged M2-media assets (${B}/media/accepted, report ${B}/media/M2-MEDIA-REPORT.md) should be wired where. Return a compact JSON-ish summary: newPlates[], captions[], codeMotifs[], transitions[].`,
  { label: 'm2r-plan', phase: 'Audit' })

phase('Prepare')
const [media, integ] = await Promise.all([
  agent(`${RULES}
TASK — ICONIC MEDIA LANE (Higgsfield; load MCP via ToolSearch "+Higgsfield"; read C:/Users/aaash/.claude/skills/higgsfield-generate/SKILL.md and ${B}/MEDIA-PLAN.md conventions). Generate the new plates listed in ${B}/RECOGNIZABILITY.md (plan summary: ${String(plan).slice(0, 6000)}). Each: batch of 2 → best = default, runner-up = alt (*-alt.*); LOOK at every output; reject faces/people/text/logos/artifacts; ≤2 regenerations; silent video only if a loop is planned. Encode webp (sharp from ${SITE} node_modules) at plan widths. Save to ${B}/media/accepted/ ONLY (do not touch the repo). Log in ${B}/media/LOG.md (section "M2-R"), ledger ${B}/media/LEDGER-m2r.md. CAP 350 credits; never let balance drop below 150 (check before each batch). Return accepted default/alt files per new asset id + credits + balance.`,
    { label: 'm2r-media', phase: 'Prepare' }),
  agent(`${RULES}
TASK — INTEGRATOR (only repo editor during this step). Using ${B}/RECOGNIZABILITY.md: (1) copy ALL staged M2-media assets from ${B}/media/accepted/ (see ${B}/media/M2-MEDIA-REPORT.md: storm, voyage-a..d(+alt), voyage-seq(+alt), board-dawn(+alt), frontier-dusk(+mobile,+alt), campfire(+loop,+alt), lights-line(+alt), last-light(+loop,+alt), films-*(+alt), hero-sea-mobile-alt2, hero-sea-loop-alt2) into public/media/films/ and register each in lib/media.ts (dims via sharp/ffprobe, focal, decorative alt, provenance higgsfield + job id, status accepted, default→alt links; decide whether *-alt2 replace the rejected M1.5 alts — use the report's recommendation); flip their MEDIA-PLAN ids from planned→accepted. (2) Pre-register the NEW M2-R plate ids as 'planned' with fallbacks so builders can code against them. (3) Add all caption/lettering data to lib/film.ts (film titles, moment captions per scene — status 'proposed' but visible via branchPreview), and add the new lettering strings to film.lettering then run scripts/fetch-display-fonts.mjs so fan-font subsets include every glyph. (4) \`npm run check\`, \`npx eslint .\`, \`npm run build\` green; commit; push. Return the data APIs builders use (caption keys, media ids).`,
    { label: 'm2r-integrator', phase: 'Prepare' }),
])

phase('Build')
const builders = await parallel([
  () => agent(`${RULES}
INTEGRATOR: ${String(integ).slice(0, 5000)}\nPLAN: ${B}/RECOGNIZABILITY.md
TASK — BUILDER "ACT CARDS + TRANSITIONS": make every act card (both variants) pass the stranger test: prominent FILM TITLE in the world's fan font + the MOMENT caption, the most iconic imagery for that film (wire the new/staged plates via MediaFrame by media id; e.g. Pirates card with the Black Pearl + Jolly Roger + compass; 3 Idiots card with the ICE chalkboard + "All Izz Well" + drone; RDR2 card with the WANTED board / camp / Dead Eye; HP card with the Great Hall candles / Hogwarts / Marauder's Map), and SMOOTH world-to-world transitions (each card morphs/cross-dissolves from the outgoing world's palette+motif into the incoming one; no hard cuts), incl. the prologue→hero handoff. YOU OWN ONLY components/sections/act-card/**, components/primitives/act-card.tsx. tsc + eslint on your files; do not commit; return file list.`,
    { label: 'm2r-builder:cards', phase: 'Build' }),
  () => agent(`${RULES}
INTEGRATOR: ${String(integ).slice(0, 5000)}\nPLAN: ${B}/RECOGNIZABILITY.md
TASK — BUILDER "ACTS I–II SECTIONS (Pirates + 3 Idiots)": upgrade about, journey, work/gauntlet, trading-algos/optuna/experiment content inside work, systems, kill-list so each is unmistakably its film: wire the staged plates (voyage-a..d, voyage sequence, storm, board-dawn) and new plates; add iconic SVG motifs (Jack's compass, Jolly Roger flag, treasure X, Black Pearl silhouette; ICE chalkboard frame, "All Izz Well" chalk, Rancho's drone, Virus's stopwatch) and prominent MOMENT captions in the world font (e.g. "THE COMPASS THAT POINTS TO WHAT YOU WANT • PIRATES OF THE CARIBBEAN"). Keep every honesty label, caveat, anchor and widget working. YOU OWN ONLY the section components for about, journey, work/gauntlet, systems, kill-list (components/site/{about*,journey*,projects*,gauntlet*,capabilities*,ledger*,metric-tile*}.tsx and components/sections/story-section.tsx) + any new files under components/worlds/pirates/** and components/worlds/idiots/**. tsc + eslint on your files; do not commit; return file list.`,
    { label: 'm2r-builder:acts12', phase: 'Build' }),
  () => agent(`${RULES}
INTEGRATOR: ${String(integ).slice(0, 5000)}\nPLAN: ${B}/RECOGNIZABILITY.md
TASK — BUILDER "ACTS III–IV SECTIONS + LOADERS (RDR2 + Harry Potter)": upgrade beyond, writing, voices (RDR2) and principles, contact (HP) + the four world loaders so each is unmistakable: wire staged plates (frontier-dusk, campfire + loop, lights-line, last-light + loop) and new plates; iconic motifs (WANTED poster with Aryan's name in HTML, Dead Eye red + X marks, Arthur-style journal sketches, cowboy hat/satchel; Great Hall floating candles, Marauder's Map footprints + "I solemnly swear…", Hogwarts silhouette, letter with wax seal, snitch, lightning bolt) and prominent MOMENT captions in the world font. Loaders: each must read instantly as its film (HP: Marauder's map / Hogwarts; PC: compass + Black Pearl; 3I: chalk + "All Izz Well"; RD: WANTED/journal + tips). YOU OWN ONLY components/site/{beyond*,writing*,testimonials*,principle*,contact*}.tsx, components/primitives/loaders/**, components/primitives/loader.tsx, + new files under components/worlds/rdr2/** and components/worlds/hp/**. tsc + eslint on your files; do not commit; return file list.`,
    { label: 'm2r-builder:acts34-loaders', phase: 'Build' }),
])

phase('Assemble')
const asm = await agent(`${RULES}
TASK — ASSEMBLER. Media lane result: ${String(media).slice(0, 5000)}. Builders: ${JSON.stringify(builders).slice(0, 12000)}.
1) Copy the new accepted M2-R plates from ${B}/media/accepted/ into public/media/films/ and flip their lib/media.ts rows to accepted (with provenance + alt links). 2) Resolve ownership conflicts. 3) \`npm run check\`, \`npx eslint .\`, \`npm run build\` green. 4) Commit + push. 5) Server on 3152; ONE browser; re-capture the SAME frame set as ${B}/m2r-audit/manifest.json into ${B}/m2r-after/ (captioned + blind versions + ?variant=alt act cards) and a contact sheet index.html. Also capture each act card transition at 3 scroll points to show smoothness. Kill server. Return results.`,
  { label: 'm2r-assembler', phase: 'Assemble' })

phase('Retest')
const retest = await parallel([0, 1, 2].map(i => () => agent(`
You are blind judge #${i + 1} (a movie fan). Look at EVERY *.blind.png in ${B}/m2r-after/ (Read renders images; do NOT open captioned versions or docs). For each frame guess the film/game (Harry Potter, Pirates of the Caribbean, 3 Idiots, Red Dead Redemption 2, or "can't tell"), the moment, confidence 0–1, and why. Then open the *.captioned.png versions and say for each whether the caption makes the film + moment unmistakable. Also judge transition smoothness from the transition frames.`,
  { label: `m2r-retest:${i + 1}`, phase: 'Retest', schema: JUDGE })))
const fix = await agent(`${RULES}
TASK — FIX ROUND. Re-test verdicts: ${JSON.stringify(retest).slice(0, 15000)}. Any scene that still FAILS (fewer than 2/3 correct on blind, or captioned version still ambiguous, or a jarring transition) must be fixed now — stronger iconic motif and/or bigger clearer caption and/or smoother transition. Then check/eslint/build, re-capture affected frames into ${B}/m2r-after/fixed/, commit, push. Update ${B}/RECOGNIZABILITY.md with final PASS/FAIL per scene and write ${B}/M2R-REPORT.md (what changed, credits, remaining failures). Return the report text.`,
  { label: 'm2r-fixer', phase: 'Retest' })

return { frames, judges, plan, media, integ, builders, asm, retest, fix }
