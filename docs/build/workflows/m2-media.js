export const meta = {
  name: 'm2-media',
  description: 'M2-media: generate all remaining MEDIA-PLAN v2 assets (default + alt runner-up each), two parallel lanes (Acts I-II / Acts III-IV + films), staging in research/build/media/accepted only; logs + ledgers',
  phases: [{ title: 'Media', detail: 'two parallel Higgsfield lanes' }, { title: 'Review', detail: 'cross-check + summary' }],
}

const SITE = 'C:/Users/aaash/Desktop/Transcript/personal-website'
const R = 'C:/Users/aaash/Desktop/Transcript/research'
const B = `${R}/build`

const RULES = `
HIGGSFIELD MEDIA LANE for Aryan Sharma's personal site. Authority: ${B}/MEDIA-PLAN.md (v2 — asset sheets, prompts, models, acceptance checks), ${B}/SPEC.md v2 (where each asset lands), ${B}/ICONS.md (iconic override: real film/game iconography recreated by us is ALLOWED — castles, the Black Pearl, compasses, chalkboards, campfires, frontier, horses etc.), ${B}/M1-REPORT.md §4-§5 (what's pending), ${B}/media/LOG.md (runs so far). Tools: Higgsfield MCP via ToolSearch ("+Higgsfield"; read C:/Users/aaash/.claude/skills/higgsfield-generate/SKILL.md first).
AUTHORIZATION: Aryan authorized autonomous generation overnight ("use Higgsfield credits as needed"). MEDIA-PLAN gates that say "A = Aryan approval" are covered by that authorization for tonight: YOU run the C (checks) and L (legal) gates rigorously; Aryan reviews in the morning and can swap to the ALT. Record every gate decision in the log.
DEFAULT + ALT RULE (Aryan): every asset ships a DEFAULT and an ALT. Generate batches of 2 (count 2) and keep the best as default and the runner-up as alt (name *-alt.*). Only spend an extra run for an alt if no acceptable runner-up exists.
HARD LIMITS: no people/faces/actor likenesses (riderless horses OK); no text/letters/logos baked into media; no ripped stills/screenshots; silent video (generate_audio false / sound off ALWAYS).
PROTOCOL: small batches; drafts/cheap modes first where the plan says; download every output to ${B}/media/masters/<ID>/; LOOK at results (Read renders images; ffmpeg -threads 2 frames for video at start/mid/end/loop-join); run the plan's numeric checks (luminance of text zones via sharp from ${SITE} node_modules, SSIM registration via ffmpeg ssim); reject artifacts; ≤2 regenerations per asset. Web encodes: stills → webp (sharp; widths per plan), videos → H.264 1080p crf ~24 -an faststart (≤4 MB target) + VP9 webm + webp poster. Copy accepted default+alt web files ONLY to ${B}/media/accepted/ using MEDIA-PLAN filenames (a parallel code step runs npm run check, which ERRORS on unregistered files in public/ — so do NOT write anything into the repo; M3 copies + registers them later).
LOGGING: append runs to ${B}/media/LOG.md under a section for your lane; keep YOUR OWN ledger file (named below) with every credit spent; update ${B}/media/contact-sheet.html only by appending a section for your lane (avoid rewriting other sections).
RESERVE: never let the Higgsfield balance drop below 150 (check balance before each batch).
`

phase('Media')
const lanes = await parallel([
  () => agent(`${RULES}
LANE A — Acts I & II (Pirates + 3 Idiots): MV-04 (storm edit of MV-01 for Card I→II), MV-05a–d (voyage sea states, matched set), JV-1…3 (voyage sequence clips → image sequence frames per MEDIA-PLAN build notes), MV-06 (dawn chalkboard, Act II anchor), and any other Act I/II asset in MEDIA-PLAN v2. Lane credit CAP: 330. Ledger file: ${B}/media/LEDGER-laneA.md. Return accepted default/alt files per asset, credits spent, balance after, failures.`,
    { label: 'media:laneA-acts12', phase: 'Media' }),
  () => agent(`${RULES}
LANE B — Acts III & IV + the films chapter: MV-10/MV-10m (RDR2 golden-hour frontier band), MV-11 + MV-11L (campfire plate + loop), MV-07 (Great-Hall-style hall of floating candles for Card III→IV / Act IV), MV-08 + MV-09 (contact "last light" plate + loop), F-PC / F-3I / F-RD / F-HP (the films-and-game chapter reels/stills per MEDIA-PLAN), writing covers if in plan, and any other Act III/IV asset in MEDIA-PLAN v2. Lane credit CAP: 330. Ledger file: ${B}/media/LEDGER-laneB.md. Return accepted default/alt files per asset, credits spent, balance after, failures.`,
    { label: 'media:laneB-acts34-films', phase: 'Media' }),
])

phase('Review')
const review = await agent(`${RULES}
TASK: Cross-check both lanes' outputs (${JSON.stringify(lanes).slice(0, 12000)}). Look at a sample of accepted default AND alt files for each asset (Read), confirm legal limits (no faces/people/text/logos), silent video (ffprobe: no audio stream), file sizes, and that every accepted file exists in ${B}/media/accepted/ (NOT in the repo public/ folder). Merge the two lane ledgers into ${B}/media/LEDGER.md (append a totals section; balance from Higgsfield balance tool). Write ${B}/media/M2-MEDIA-REPORT.md: table of asset → default file → alt file → status → notes, credits, balance, anything missing (with code fallbacks noted). Return the report text.`,
  { label: 'media:review', phase: 'Review' })
return { lanes, review }
