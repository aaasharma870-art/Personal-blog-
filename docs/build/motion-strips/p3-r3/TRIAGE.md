# P3-11 round 3 · triage and residuals (assembler) · the last critic round

Inputs: `verdicts/` (j1-star, panel-j2/j3/j4, the stranger verdicts `blind|read|hooks-<w>-j1..3`, j8-smooth, j9-honest), the
assembler's scores (`verdicts/score-{blind,read,hooks}-{1440,1024}.{json,md}` from `tools/capture/score.mjs`, run exactly as
round 2's MANIFEST §2 shows; `verdicts/score-panel.{json,md}` from the new `tools/capture/score-panel.mjs`, which writes
down the method round 2 applied by hand), `MANIFEST.md` §1 (the automated J1, dead-screen, drift, keyboard and probe
numbers) and round 2's `TRIAGE.md` / `MANIFEST.md` for comparison. Every finding names its source; read the source for the
full wording. R = `docs/build/motion-strips/p3-r3`, R2 = `docs/build/motion-strips/p3-r2`. Build judged: `ece90dc`.
Judges: new instances every round (J5 wrote the `-j1` stranger files, J6 the `-j2`, J7 the `-j3`).

**This is the last loop round. There is no round 4.** What follows is the score table, the split between app problems and
environment, and the list of RESIDUALS: every finding still open, each with a recommendation: (a) one small targeted pass
before final QA (three briefs, disjoint globs, about 45–60 minutes of builder time in total), (b) flag for Aryan in
PHASE3-REPORT, (c) environment artifact that only a real-laptop recording can settle.

**Ship bar (PHASE3-PLAN §11.3–11.4): every axis ≥ 4 and every pass bar met. Not met.** Axis scores on the 1–5 scale: J1 2,
keep scrolling 3.33, tempo 3.13, discovery 2.92, J8 2.5, J9 4. Met this round: J9 honest (4; one red rule, and it is Aryan's),
no dead screen (0 gaps, 11 of 11 fills), the name (3/3 at both widths), the fast lane (3/3 at 1 s), and, for the first time,
the discovery pass bar as written (chip named by 3/3, a toy invite within 3 screens by 3/3), though all three judges call the
type tiny and the axis scores below 4. Everything else misses. Under the stated conditions (software rendering, no GPU, AI
judges on screenshots) some of these bars cannot be met by code at all; the residuals say which.

## Scores

Panel judges scored 0–10; the 1–5 value is half. "Eye" = the judge's own count; "log" = `clips.mjs`.

| axis | r1 | r2 | **r3** | pass bar | r3 status |
|---|---|---|---|---|---|
| J1 one star per screen | 2 · eye 53.6 / 54.5 % | 2 · eye 48.8 / 45.8 %, 108 / 108 star-less outside a breath, 0 two-plus (log 63.8 / 64.8 %) | **2** · eye **33.1 / 34.1 %** (skimmer 46.2 / 47.1), **149 / 136** star-less outside a breath, **1 + 2 two-plus by eye** (log 73.5 / 72.0 %, 2 log overlaps; machine self-motion 51.0 / 55.2 %) | ≥ 90 % one star; none outside a breath; 0 two-plus | FAIL, all three sub-bars |
| J2 · J3 · J4 keep scrolling | 3 · 3 · 3 | 3.75 · 2.5 · 3.75 (yes 81.6 / 57.1 / 83.7 % at 1440; 81.5 / 51.9 / 81.5 % at 1024) | **3.5 · 3.0 · 3.5** (77.6 / 69.4 / 73.5 %; 77.8 / 63.0 / 68.5 %) | ≥ 80 % per act; no two consecutive no; hand-off, 4 cards, first Work screen yes | FAIL for all six judge-width runs |
| J2 · J3 · J4 tempo | 3 · 3 · 3 | 3.25 · 2.5 · 3.5, 4 of 7 acts right | **3.15 · 3.0 · 3.25**, **3 of 7** acts right | §2.2 tempo named by ≥ 2 of 3 per act | FAIL: opening, Act II (0/3), films (0/3), credits |
| J2 · J3 · J4 discovery | 2 · 3 · 3 | 2.5 · 2 · 2.75 (bar FAIL: chip read in motion by 1 of 3) | **3.0 · 2.75 · 3.0** | each judge: chip + one toy invite within 3 screens | pass bar met 3/3 by the scorer's rule; axis < 4 |
| J5–J7 blind recognizability | below base: pirates, idiots, rdr2 | pirates 5/9 · 4/8, idiots 2/9 · 2/9, rdr2 8/11 · 8/10, hp 10/10 · 10/10; 0 wrong-film | pirates **4/9 · 4/8**, idiots **4/9 · 4/9**, rdr2 8/11 · 8/10, hp **7/10 · 8/10**; 0 wrong-film | ≥ P3-0 per world (10/10, 9/10, 9/13, 10/12) | FAIL: pirates, idiots, hp (rdr2 at or above) |
| J5–J7 name · fast lane | 3/3 · 3/3 (1 s) | 3/3 · 3/3 (1 s) | 3/3 · 3/3 (1 s) at both widths | 3/3 · found ≤ 10 s by 3/3 | PASS |
| J5–J7 can't read | 37 · 25 | 59 · 56 | **44 · 47** (about 12 · 15 are a still's bottom edge, 9 · 14 sit under the header; see residuals) | 0 | FAIL |
| J5–J7 hooks | 4/8 · 4/8 | 4/8 · 4/8 | **4/8 · 4/8**; 3/3: css-tintype, gl-opening, gl-seam, gl-tintype; fail: css-ignite 1/3 (r2 3/3), css-seam 1/3 (3/3), css-opening 2/3 (0/3), gl-ignite 2/3 (2/3); per judge 7 · 5 · 6 of 8 | each hook 3/3 | FAIL |
| J8 smooth | 3 | 2.5 | **2.5** (5 of 31 target rows met, 22 missed, 4 not measurable; about 2 to 3.5 depending on a real GPU) | §12.1 headless + §4.4 | FAIL |
| J9 honest + a11y | 3 (2 red rules) | 4 (0 red) | **4** (1 red: 5 community quotes, Aryan's) | green; RELEASE fails only per DP-9 | PASS |
| automated · no dead screen | 0 gaps · 8/11 fills | 0 gaps · 11/11 | **0 gaps · 11/11** (103 beat elements) | 0 gaps > 100vh; every §2.4 fill | PASS |
| P3-5 #3 registration / drift | .951 / .923 (ignite) | .953 / .923 | **ignite .994 / .991 and .983 / .983: passes at both widths**; 1024 fails on #2 (GL seam .944 in both runs; r2 .953) and #1's css push is on the bar (.953, .9497 in the repeat); FIG ≤ 1.45 px | ≥ .95; FIG ≤ 2 px | 1440 PASS, 1024 FAIL |
| probes (not a §13 bar; feed J8 / J9) | 19/21 · 20/21 | 12/21 · 13/21 · 12/21 · 0/1 | **19/21 · 20/21 · 16/21 · 1/1** (default 1440, 1024, `--rm`, `--rm` keyboard; 11 probe files changed, so not like with like) | — | failing: games.inp, loaf (raster waits), `--rm` layout-gates (real: see R01); `--rm` plates-live and split fail by design (no plates and no split layout under reduced motion) |
| `npm run check` · `RELEASE=1` | exit 0 · DP-9 only | exit 0 (66) · exit 1 (46) | exit 0 (67 warnings) · exit 1, **47 errors**, all Aryan's: 40 Check L2, 5 TTS, 107 unsigned strings, 5 unverified community quotes (new check) | green; RELEASE fails only per DP-9 | PASS |
| director's cut (own axis, information) | 56.6 % one star | 68.5 % | 72.4 % (log; 64.8 % by self-motion) | — | — |

**How far to trust a number.** Every round used new judge instances, and the same page moves 4–10 points between two
instances (J2 81.6 → 77.6 %, J4 83.7 → 73.5 %, J3 57.1 → 69.4 % on the same acts; hp blind 10/10 → 7/10 with no change to hp
art). Read a swing under about 10 points on a panel number, or 2–3 frames on a per-world blind number, as noise. **J1's eye
count is not like with like:** round 3's J1 saw the machine's `(static)` words on every sheet (round 2's did not) and read
"static" clips as star-less, so 48.8 → 33.1 % overstates the fall; the machine's own calibrated count rose 4–9 points. Both
readings sit far under 90 % (J1 found that counting every machine-detected motion as a star lifts the eye count only to about
39 %), so the verdict does not depend on the choice.

## What moved since round 2

Better: dead-screen fills stay 11/11 on 103 beat elements; the log's one-star share rose 7–10 points (reader) and the
machine's self-motion share 4–9; skimmer 1024 93.1 % (r2 82.3 %); star-less outside a breath by log 72 / 65 → 55 / 53; the
discovery pass bar now holds; Act I, Act IV and films tempo and yes-rates up for the busy-recruiter judge (J3 films 14 → 83 /
80 %, Act I 71 / 57 → 100 / 75 %); 3 Idiots blind 2/9 → 4/9 at both widths; can't-read 59 · 56 → 44 · 47; hooks css-opening
0/3 → 2/3 and tintype 2/3 → 3/3 in both tiers; the P3-5 #3 ignite registration passes at both widths; the keyboard probe passes
(compass included, all 12 eggs, 78 stops, 0 covered) at 1440, 1024 and under reduced motion; probes hunt, toys, words,
spotlight and cinema pass in the default runs; desktop pops 4 / 6 → 2 / 10 and native 52 → 28 at 1440; principles 1440
4.2 → 10.6 fps; the writing section's 8 live filters (P3-0) are baked to 0; J9 stays green apart from the owner's quote gate.

Worse: the panel's Act II (the Workshop) fell for every judge at both widths (yes 60 / 61 → 44 / 56 (J2), 80 / 72 → 69 / 67
(J3), 73 / 72 → 61 / 54 (J4)); J2 and J4 overall yes down 4–10 points; tempo 4/7 → 3/7 (all three judges now call Act II slow
and the films brisk); hooks css-ignite and css-seam 3/3 → 1/3; pirates 5/9 → 4/9 at 1440 and hp 10/10 → 7/10 and 8/10; desktop
CLS 0.006 → 0.0454 at 1440 (the `#films` shift also happens under reduced motion; r2 0); 1024 principles 19.1 → 4.4 fps (13
frames); the five screencasts 6–16 % slower; intro 1440 20.8 → 18.5 fps and 1024 31.8 → 28.1 (below 29.5); 1024 GL seam
registration .953 → .944; and one defect the new probes exposed (R01).

## App problems and environment artifacts

| miss | cause | note |
|---|---|---|
| J1 one star per screen (33 / 34 %) | **app** (the lent loops do not read as motion; dwell stops are stills) + **instrument** (an AI judge on 200 px frames, four per second, cannot resolve low-contrast ambient loops; saw the `(static)` words) | machine and eye agree there are 76 / 61 reader clips with a log star and nothing moving, so this is not only the instrument |
| keep scrolling < 80 % in Act II, no two consecutive no | **app** (density, dwell, small type) + **taste** (three personas) + **instrument** (±10 points between instances) | Act II is the one stretch every judge fails |
| tempo | **spec** for films (judges love the brisk plates the spec called slow) and the credits' merged label; **app** for Act II and the opening | amend the spec, do not slow the films |
| discovery axis 2.9 | **app** (invites are 7–9 px type; the counter never changes) | pass bar met |
| blind recognizability | **app** (weak cues on the hero, journey steps, work, systems frames) + **instrument** (pass needs ≥ 0.6 from 2 of 3; the misses are the right film at 0.30–0.55, 0 wrong-film) | the drone-in-courtyard frame reads as a generic real-world picture (0.15 once) |
| can't read 44 · 47 | **capture** for the stills cut at the bottom edge (about 12 · 15) and for text caught under the header at a mid-scroll still; **app** for tiny type, FIG. 2 node overflow at 1024, "THE BREAK" on its route line | AA passes everywhere (0 failures on 510 / 527 live boxes) |
| hooks 4/8 | **mixed**: p .05 is the first 5 % of a transition, so the title sits over the outgoing picture by design (J6 and J7 read it as a glitch); **capture**: the 1440 act titles read in the fallback serif because `hooks.mjs` walks the page in 70 ms jumps and the world faces swap late (verified here: a reader-pace arrival at the Act II card shows the chalk face at 1440 and 1024) | a visitor who flings to a card in the first minute can still meet the fallback serif (R20) |
| J8 absolute fps, p95, LoAF counts, intro fps, INP 544 ms, skimmer 8.6 fps, native pops, the 731 ms reveal frame | **environment** (SwiftShader: 98–99 % of LoAFs over 50 ms carry under 20 ms of work) | compare rounds and sections, never the absolute number |
| J8 idle task 100–1,013 ms, CLS, principles layers, journey idle 0.3 fps, camera / card layers repainting, LCP about 2 × P3-0, the name's one-step pop | **app** | R02, R03, R19–R22 |
| RELEASE 47 errors | **owner** (Aryan) | no code |

## Panel bars in detail (`verdicts/score-panel.md`)

Per act, yes % at 1440 / 1024 for J2 · J3 · J4; ✗ is below 80.

| act | J2 | J3 | J4 |
|---|---|---|---|
| Opening + hero | 100 / 100 | 100 / 100 | 100 / 100 |
| Act I (card, about, journey) | 86 / 75✗ | 100 / 75✗ | 86 / 75✗ |
| **Act II (card to kill-list)** | **44✗ / 56✗** | **69✗ / 67✗** | **61✗ / 54✗** |
| Films | 100 / 100 | 83 / 80 | 100 / 100 |
| Act III (Frontier, writing, voices) | 92 / 92 | 55✗ / 46✗ | 80 / 100 |
| Act IV (principles) | 100 / 80 | 75✗ / 60✗ | 75✗ / 60✗ |
| Contact + credits | 100 / 100 | 25✗ / 50✗ | 75✗ / 75✗ |

Two consecutive no (counts of runs): J2 4 · 5, J3 4 · 5, J4 3 · 6 (J2 1440 s20–24 and 1024 s23–27 are five no's in a row each,
the kill-list and its lead-in). Must-yes missed: the first Work screen ("Led by what survived scrutiny", 1440 s11 / 1024 s12;
clips 37–39 and 35–37) is **no for J2 and J4 at both widths** (J3 yes: 6–8 s of identical frames, tiny columns, the photo
scrolled to a sliver); J3 also misses card screens (act-2 s10 / s11 "mid-transition, nothing to read", act-3 s32 / s35, act-4
s41 / s45); at 1024 the card rule also catches s4 (the About wall after the card's tail) for J2 and J4. The hand-off and
act-1 cards are yes for all.

Tempo (spec §2.2 word against J2 · J3 · J4, screen-weighted): opening + hero slow vs medium · slow · brisk (1/3); Act I medium
vs medium · medium · medium (3/3); **Act II brisk vs slow · slow · slow (0/3)**; **films slow vs brisk · brisk · brisk (0/3)**; Act
III medium vs medium · medium · slow (2/3); Act IV medium vs medium · slow · medium (2/3); contact + credits (credits slow;
the judges merged contact, which the spec calls medium) vs medium · slow · medium (1/3; 2/3 if scored against contact). By
item all three judges also read **About slow** (spec medium).

Game discovery: the chip was named at screen 1 by all three ("a promise", "maybe, only if bored", "maybe"); every judge
noticed the Take off pill (first appears 1440 s20 / 1024 s23), Jack's compass, and at 1440 the Dead Eye pill, within three screens
of their first appearance; **nobody noticed the Run invite (B18)**. Open: every judge calls the invitations tiny (7–9 px), the counter never
changes during the scroll and nothing confirms a find, and the only sentence naming the game is small body copy (J3 1440 #16–17,
1024 #15; J4 the same).

## Stranger scores (`verdicts/score-{blind,read,hooks}-{1440,1024}.md`)

Blind misses are all the right film at low confidence (0 wrong-film at either width): pirates hero A01 / D01 0.45–0.60,
journey steps 1 and 3 D21 / D22 0.45–0.60, act-1-settled A10 0.50–0.60 (1440); idiots work A24 / D24 0.30–0.55, work board D25
0.35–0.55, systems A29 / D29 (the drone-in-the-courtyard frame: `??` 0.15 once); rdr2 voices A31 and the wanted board A34 / D34
0.50; hp principles A38 / A39 0.50–0.70, films-hp A46 0.45–0.55, contact D40 0.50–0.70. Strong frames (0.85–0.95): the Great
Hall, the castle with the broom, the viaduct, the "AAL IZZ WELL" chalkboard; the Black Pearl reads 0.6–0.85. Name "Aryan Sharma" read by 3/3 at
both widths; fast lane found at about 1 s by 3/3 (the persistent "SKIP TO THE RESEARCH" pill).

Can't read, by a keyword reading of the lists (approximate; 1440 · 1024): stills cut at the bottom edge 12 · 15; text under
the sticky header 9 · 14 ("A builder of quantitative systems." half hidden, the "CREDITS" label, "…it failed me first. Step
through it.", a ghost gold caption); small, low-contrast or unlabelled 13 · 8 (nav micro-labels about 9 px, the two icon-only
nav controls, "Resume - coming soon", "Lumos" hint, route-map labels about 8 px); layout 2 · 4 (1024 FIG. 2 pipeline node text
overflows its boxes, three judges; a faint empty panel on the 1024 trading frame); content 8 · 5 (`Trading_Algos-`, the writing
note's grey placeholder lines, frames showing only the `[AS]` monogram). Quill nib / fading last letters of PHILOSOPHY at
1440 C007: all three judges (probably a scene captured mid-reveal; not reproduced at a stop).

Hooks, both widths alike: the strong ones are the sepia tintype, the torn-edge wipe, the lightning tear, the bright gold
porthole; the failures are the black ragged hole under "HARRY POTTER" over a Western camp (J6, J7: "a rendering bug") and the
"3 IDIOTS" card over the storm sea with the teal line (J6, J7), the dim, thin porthole on black (css-opening, one judge) and the
empty black hole in the gl-ignite frame. At 1440 the Acts II–IV titles show in a plain serif (all three judges); at 1024 in the
world faces.

## Budgets (re-measured)

`bundle` probe on `ece90dc` (`R/probes-1440/p3-probes.json`): first-load JS **442,251 B gz** and CSS **34,339 B gz** against the
pre-Phase-3 base 439,092 / 29,433, that is **+3,159 B JS and +4,906 B CSS**, so **headroom against the +6,144 B line is
2,985 B JS and 1,238 B CSS** (round 2: 505 and 1,728). The three briefs below stay within +300 B gz CSS and +200 B gz JS in total.

## Verified in this triage (two open items, one short browser session)

I started the committed `.next` build of `ece90dc` (HEAD differs only by documents) on port 3161 for about ten minutes, with no
code change, and stopped it again.

1. **Deep links under reduced motion, Pause and phones do not land (R01).** Fresh context per load, 1440×900 unless noted;
   target = `#work` / `#kill-list`; "landed" = the target's top within −2…300 px after 5.5 s. Motion on: 8 of 8 landed
   (`/#work`, `/#kill-list`, with and without `?skip=intro`). Reduced motion from the first request: 2 of 8 (only
   `/?skip=intro#work`), 1024×768: 1 of 4. Pause (`sessionStorage motion=paused`): 0 of 4. Phone 390×844: 0 of 4 (two loads
   moved but ended about 2,000 px off). At load the page is 7,710 px tall against 39,481 final, and the browser's fragment jump
   never retries. The probe's single `/?skip=intro#work` sample lands or misses on timing, which is why the default run's
   `rmHash` passed and the `--rm` run's read y 0: not probe drift, a real defect. Cause in code: `lib/smooth-scroll.ts:312`
   (`hashHold` only on the motion path) and the comment above it ("Phones and reduced motion keep the browser's own jump").
2. **The 1440 plain-serif act titles are a race, not a missing face.** After a reader-pace scroll (50 px notches every 150–200 ms)
   to the Act II card the title is in the chalk face at both widths and `data-fonts="pirates idiots"`; after `hooks.mjs`'s fast
   walk `data-fonts` is `pirates` only and every title sits in the fallback serif at both widths (1024's hook frame happened to
   be captured after the swap). The swap waits for the warm-up ladder and for the world's boxes to be off screen (by design,
   no layout shift), so a fast scroller can reach a card first (R20).

## RESIDUALS

Severity: high / medium / low = how much a first-time visitor or the owner is likely to feel it. Owners are the globs that
own the fix. Clip numbers are the judges' (`clips[i]` = clip #i+1 on that run's sheets; the panel's are 2 s clips).

### (a) One small targeted pass before final QA (three briefs; text under "Fixer briefs")

- **R01 [high] Deep links do not land under reduced motion, Pause or on a phone** (J9 F3; MANIFEST §1 `--rm` `rmHash` /
  `pauseMid` reading; reproduced above). Owner: `lib/smooth-scroll.ts`, `lib/smooth-scroll-jump.ts`,
  `components/providers/smooth-scroll-impl.tsx`, `components/site/page-hydrated.tsx`, `tools/capture/probes/layout-gates.mjs`.
  Brief **F1**. Phones (0 of 4 at 390) are Phase 4's: record, do not change here.
- **R02 [medium: spec 0, all three real] Layout shift** (J8 F4 / T08 / T23, J9 F12): 0.025 at 32.9 s in `#films` (`div.mt-tier-block`
  and two `div.pointer-events-none.absolute.inset-y-0`; also alt 32.6 s and **reduced motion 26 s**), 0.0134 at 17.0 s in `#work`
  (`span.scene-caption__moment.world-face-idiots`) and 0.0005–0.0018 on every `world-face-*` caption span, 0.003–0.0113 in `#beyond`
  (`span[data-w]` in `[data-words=scrub]`; 0.009–0.0095 at 1024). 9 of 12 runs non-zero. Owner: `components/sections/films/**`,
  `components/primitives/{scene-caption.tsx,world-face.ts}`, `components/words/**`, `components/enhance/binders/words.ts`,
  `app/p3/words.css`. Brief **F2**.
- **R03 [high, app] An idle-time task holds the main thread 100–1,013 ms** on the play screen and in the first 2,000 px (J8 F2 /
  rec. 1: motion.js intro 1,013 ms at t −1.66 s, 793 ms at 1024; desktop 394 ms at 0.09 s; reader-1440 #19, reader-1024 #18,
  skimmer-1440 #10 (the worst clip of that run), skimmer-1024 #6, director #11). Owner: `lib/idle.ts`, `lib/ladder.ts`,
  `components/enhance/desktop-enhancer.ts`, `components/enhance/binders/{dc,hotspots,games}.ts`,
  `components/sections/hero/velocity-layers.tsx`, `lib/gl/gl-lock.ts`, `lib/audio/engine.ts`,
  `components/games/drone/drone-desk.tsx`, `components/providers/world-fonts-impl.tsx`. Brief **F3**.

### (b) Flag for Aryan in PHASE3-REPORT (his words, his facts, taste, or too large for a small pass)

Star and pacing (J1, panel):

- **R04 [high] The lent loops read as stills at the 2 s dwell stops.** J1: 68 / 55 reader clips (1440 / 1024) carry a log
  star tagged `(static)` and show a still: B08-invite (1440 #37–40, 1024 #32–40), B04-loop (#26–28), B14-loop (#64), B16-pen (#73–78,
  1024 #68–81), B28-pen (#129–131), B38-fireflies (#167–168, #174–175), B50-motes (#219–221), B54-hall (#228–231), B56-flame
  (#242–244); none of the 14 live-only loops reads as motion. Owner: the hosts (`components/worlds/{pirates,idiots,rdr2,hp}/**`,
  `components/primitives/live-plate.tsx`, `components/sections/act-card/**`). Why (b): a stop that performs needs a visible,
  hero-scale mover and how much motion the page may carry is a taste call; the loops are ambient by intent and only a real
  laptop shows whether they read at 1:1 (also (c)).
- **R05 [high] Dead stretches:** optuna-screener → kill-list 30 s at 1440 (#103–132) and 25 s at 1024 (#101–125) with B23–B29 logged
  and nothing visibly performing; principles → contact → credits 13–16 s (1440 #228–240, #246–254; 1024 #227–242), the Map's
  footprints and ink too faint. Owner: `components/sections/{chapter,experiment,ledger}/**`, `components/site/{capabilities,gauntlet-tabs,ledger-reckoning,idiots-chalk,principles*,contact*}.tsx`,
  `components/worlds/{idiots,hp}/**`, `components/sections/credits/**`. Why (b): this is the hiring-evidence stretch whose
  layout belongs with Aryan's Phase 2 info pass (his words and photos).
- **R06 [high] Work sag (Act II).** Yes 44 / 56 %, 69 / 67 %, 61 / 54 % (J2, J3, J4); the project run (1440 s11–24, 1024 s12–27,
  clips 36–70 / 34–67) repeats one template, small grey type, big dark areas (J3 high: "the most hiring-relevant part is the
  least legible"), kill-list a "mono spreadsheet" (J2 0 % yes), identical frames for 6–8 s (J3 #37–39, #64–66, #71–72), the first Work
  screen no for J2 and J4 at both widths, tempo "slow" 3/3 against brisk. Round 2's F4 changes did not move it. Owner:
  `components/site/{projects,capabilities,gauntlet-tabs,metric-tile,ledger-reckoning,idiots-chalk,media-band}.tsx`,
  `components/sections/{chapter,experiment,ledger}/**`, `components/worlds/idiots/**`. Why (b): layout and what goes on the page.
- **R07 [medium] The first 20 s carry no information** (J3 high: name at about 0:09, About at 0:34 / 0:30; hero static 6–10 s: J1
  #14–19 / 1024 #14–18 / skimmer #2–5, J2 clips 7–10, J3 #1–10, J4 7–9; "Play" stays up while the flight runs, J3 #1–2; the
  identity line "Self-taught high-school quant…" is tiny, J3 #7–10). The sea loop plays (J3 sees waves; the hero idles at
  14.8 fps, a video playing) but at that amplitude reads as still. Owner: `components/intro/**`, `components/sections/hero/**`,
  `components/site/hero-scene.tsx`. Why (b): "name first" is already his layout call (CONTINUE #11 (1)); also (c).
- **R08 [medium] About is a wall of small serif** (J2 0 % yes, 1440 clips 18–21 / 1024 16–20; J4 0 %, 4–6 s identical; J1 #36–45 /
  #32–40 star-less, the compass invite not moving; J3 1/2). Owner: `components/site/{about,about-bio,about-pillars}.tsx`. (b), his words.
- **R09 [medium] Marauder's Map principle cards repeat one layout** (J2 1024 #108–110 and 1440 #114–116; J3 1440 #114–119, 1024
  #107–113; J4 #114–117) with 4–8 s static holds; round 2 asked to vary or shorten them. Owner: `components/site/principles-map.tsx`,
  `components/worlds/hp/**`. (b).
- **R10 [medium] Kraken's Storm interlude is near-black for about 2 s** (J2 1440 clip 30 / 1024 28–29; J3 #30, 1024 #28–29; J4 s8
  clip 30; r2 about 4 s). Owner: `components/sections/act-card/**`, `components/site/journey-voyage.tsx`. (b): accept or fill.
- **R11 [medium] Writing is placeholders** ("Thinking in public, soon.", draft titles with no content; the black-to-cream flip is a
  glare, J2 1440 clips 97–99, J3 #97–101 / 1024 #92–96, J4 #96–97) and contact carries "Resume, coming soon" under the email
  button (J3 high; 1440 #121–122). Owner: `components/site/{writing,contact-finale}.tsx`. (b), his call (CONTINUE #7, #11 (4)).
- **R12 [medium] Tempo words disagree with the spec** in four places (above). Films read brisk by 3/3 with 100 % yes from J2 and
  J4: amend spec §2.2 rather than slow them. Act II slow by 3/3 is R06. The opening is read medium · slow · brisk. Contact +
  credits is merged by the judges. (b): a spec edit for the report.
- **R13 [medium] Hooks 4/8** (css-ignite 1/3, css-seam 1/3, css-opening 2/3, gl-ignite 2/3; 1440 H001, H005, H006, H007, 1024
  H003, H001, H005, H007): at p .05 the new title sits over the old picture or a black hole. Owner: `components/sections/act-card/**`,
  `components/gl/**`, `lib/gl/**`. (b): a design option is to hold the old caption and picture until p .15 or to start the
  hole on a lit interior; it changes the card sets Aryan wants protected.
- **R14 [medium] Blind recognizability below base** for pirates, idiots, hp (misses listed above; the drone-in-the-courtyard plate
  reads as a generic real-world image, J5 0.15). Owner: art (`lib/media.ts`, `public/media/**`: assembler-only) and
  `components/worlds/**` cues. (b): his photos and the drone image (CONTINUE #11 (5)).
- **R15 [medium] Game invitations are tiny** (J2, J3, J4: 7–9 px; the counter never moves; the Run invite B18 noticed by none; J3
  "the only sentence that tells me there is a game is a few lines of tiny body copy"; the hero's teal bracket and compass
  invite a click and say nothing). Owner: `components/site/header.tsx`, `components/eggs/**`, `components/games/**`,
  `app/p3/{game,games}.css`. (b); also (c).
- **R16 [medium] Header band and small type still cost reads** (can't-read: text under the sticky header, 9 · 14; tiny nav
  labels; the credits fine print about 9–10 px, J3 1440 #126–127, 1024 #119–121, J4 the same; route-map labels about 8 px with
  "THE BREAK" on its dotted line, J1 / J3 at both widths; FIG. 2 node text overflows at 1024, three judges). AA passes. Owner:
  `components/site/{header,journey-chart,journey-voyage}.tsx`, `components/sections/{chapter,credits}/**`, `app/p3/foundation.css`.
  (b): cheap items to do in P3-12 if time remains; not a loop item.
- **R17 [medium] Two stars at once by eye in three clips:** the journal's running horse B45 with the entry sketch B44-page4 / page3
  (1440 #201, 1024 #189) and the ember B35 with the light band B36 (1024 #154) (J1). The log's own 2+ clips (B11 + B12-push + B12,
  131 / 150 ms; skimmer #26, #37, #73, #101) show no second star by eye. Owner: `components/worlds/rdr2/journal-spread.tsx`,
  `components/site/writing.tsx`, `components/sections/act-card/**`. (b): sequence the horse after the sketch draw ends.
- **R18 [low] The finale star is a faint comet** (needs about 3 × brightening, J1 #255–257 / 1024 #243–244) and B58's breath
  (y 44,057 / 41,482) lies beyond the maximum scroll (43,312 / 40,857), so the last 3–4 clips count as star-less outside a
  breath. Owner: `components/eggs/post-credits-scene.tsx`, `components/site/post-credits.tsx`; the breath is a counting rule
  (`tools/capture/clips.mjs`). (b).
- **R19 [high, app] Performance still owned by the page** (J8 F1, F5–F10): principles will-change layers 12 / 11 against 8 and
  31.5 fps under reduced motion at 1440 from `div.hidden.will-change-transform.xl:block` (worst section in 4 of 5
  recordings: reader-1440 #225–240, skimmer-1440 #99–108, skimmer-1024 #72–79, director #176–186); act-1 3.5 MP and 4
  masks (card 7.6 fps against P3-0 26.2) and act-4 21 infinite animations and 2 canvases (12.5 against 29.2); journey idle
  0.3 / 0.6 fps and act-4 idle 27 fps (P3-0 60); `act-card-stage`, `stage-cam`, `plate-cam`, `campSticky` repaint in 73–100 % of
  paints; journey seam push B12 (reader-1440 #57, reader-1024 #54, skimmer-1440 #26, skimmer-1024 #21, director #34) and
  opening B09 (#44 / #43 / #19 / #17) worst or near-worst in 4–5 of 5 recordings; the 1440 kill-list 5.6 fps (13 frames) and 1024
  principles 4.4 (13 frames), each a coin-flip row. Owner: `components/site/principles*.tsx`, `components/worlds/hp/**`,
  `components/sections/act-card/**`, `components/stage/**`, `components/site/journey-*.tsx`. (b), settled by (c) first: the
  headless numbers cannot say which of these a GPU removes. The journey idle 0.3 fps ("a stalled frame loop at rest?") is the
  one worth a five-minute idle trace in P3-12 whatever the GPU does.
- **R20 [low] Act titles can meet the fallback serif for a fast scroller** (verified above; all three strangers at 1440): the
  world faces swap after the ladder and only while the world's boxes are off screen. Owner: `components/providers/world-fonts-impl.tsx`,
  `lib/world-fonts.ts`, `tools/capture/hooks.mjs`. (b): a trade between look and layout shift; list it.
- **R21 [medium, mixed] Intro:** the name appears in one step 1.2–2.2 s after the reveal (8.04 s at 1440, 7.33 s at 1024; strips
  `R/motion/1440/strips/pop-intro-77.jpg`, `R/motion/1024/strips/pop-intro-99.jpg`), script tasks of 76 / 112 ms at the hold, the
  reveal frame 731 ms (environment), intro 18.5 / 28.1 fps against 29.5. Owner: `components/intro/**`, `app/intro.css`. (b): if the
  titles deliberately sequence caption then name, edit spec §4.4's wording instead of the page.
- **R22 [low, app] LCP** 780 / 732 / 764 ms and 816 / 724 / 736 ms against 400 (P3-0 256–368 on this kind of machine); cause not
  visible in the files. Owner: `app/layout.tsx`, `lib/fonts.ts`, `components/sections/hero/**`. (b), and (c) with real network.
- **R23 [low] 1024 registration:** GL seam .944 (both runs; r2 .953) and the opening's css push .9497 in the repeat run (.953 in
  the first). Owner: `components/gl/**`, `lib/gl/**`, `components/sections/act-card/**`. (b): sub-visible; list the numbers.
- **R24 [medium, Aryan] Honesty findings that are his** (J9): F1 five community quotes (below), F2 the kill-list kicker, F5 the
  reduced-motion sound copy ("resume motion to hear it" cannot be followed under the OS setting: two strings), F9 two survivor
  rows without a row-level caveat, F10 the WANTED poster's weight class, F11 visible strings missing from the unsigned list
  ("SKIP INTRO", "Play", "LOADING THE FLIGHT", "THE RECKONING . 3 SURVIVED THE FULL PROCESS", the act-card taglines "Treat
  every backtest as guilty until proven innocent." and "The result stands; no re-optimization after the fact."). Owner:
  `lib/film.ts`, `lib/content.ts`, `lib/quotes.ts`, `scripts/checks/**`. All (b); F11's list edit is P3-12 housekeeping.
- **R25 [low, Claude] J9 F4, F6, F7, F8:** no-JS visual proof is mid-scroll and flat for act-4 and credits at 1440, and the
  no-JS header shows four controls that cannot work (`components/site/header.tsx`, `tools/capture/qa.js`); the intro loop
  has no Pause (WCAG 2.2.2, arguable); the disabled sound icon is 2.9:1 and exempt; the "never animated" claim and the RM idle
  state have no probe, `--rm` ran at 1440 only, no focus-ring capture. (b): do the no-JS re-shoot with instant scroll in P3-12.

### (c) Environment artifacts: need a real-laptop recording (Aryan, Chrome Performance panel, Media panel open)

- **R26** Every absolute fps / p95 / LoAF-by-duration number (98–99 % of LoAFs over 50 ms carry under 20 ms of work), INP 544 ms
  at 1440 (`games.inp`; input delay 0), the skimmer's 8.6 / 11.0 fps, intro fps and the 731 ms reveal frame, native pops, the
  raster-bound section rows (T04, T06, T11, T12, T25) and the §12.1 real-GPU row. Ask for the five moments J8 named: the first
  scroll through act-1, journey B12, principles, the kill-list and the intro reveal, plus a fast fling, with the hardware
  decoder visible. J8: about two points of uncertainty either way until this exists.
- **R27** Whether the lent loops (R04), the hero sea (R07) and the ghost title fades at p .05 (J2 clip 15 / 1024 14, J3 #15, J4
  c15: "The Crossing" under a second at 1:1) read at full size and 60 fps; J1's frames are 200 px at four per second.
- **R28** The world-face swap race for a fast scroller (R20) and LCP on a real network (R22).

### Tooling notes (no action; there is no round 4)

J1 #13: the `(moves)` label word never prints on the sheets (every red `NO STAR` band has the same seven characters while
`clips.json` flags 18 / 18 reader and 8 / 2 skimmer clips as moving), and the sheets that carry `(static)` are not blind
(re-cut with `clips.mjs --no-motion` if J1 is ever repeated). The `--rm` probe quirk was R01, not the probe. `qa.js`
`lenis.pauseBefore` false (a late attach, not diagnosed) and `noJs.allInView` false (smooth scroll plus a 150 ms wait) are
tool-side. motion.js numbers are single runs; the 1024 principles and 1440 kill-list rows rest on 13 frames. The `alt` run is
not defined in the J8 inputs. `hooks.mjs` should wait for `data-fonts~=<world>` before a capture.

## Fixer briefs (a)

Rules for every fixer (the same builder rules as W1–W3 and rounds 1–2): edit only your globs; never commit; no `npm run build`,
server or browser in the main tree (own `git worktree`, `cp -al` node_modules, own port, stop it; short browser time, one browser
per fixer); `npx tsc --noEmit` and `npx eslint <your files>` clean; `docs/build/CONTENT-RULES.md` is absolute (no number or claim
changes; Sharpe / PSR / PF never animate; research data stays Geist; reduced motion and Pause stop all motion and sound; one h1);
rule 33 (no CSS rule on `<html>` for a runtime-toggled class or attribute); phones (< 64rem) keep today's behaviour; no new copy
(a new string is proposed, unsigned, and listed in the return). Next 16: read `node_modules/next/dist/docs` before Next-specific
code. Return: the files touched, before / after numbers, first-load JS / CSS bytes gz, and any handoff for a file outside your
globs. Estimated builder time: F1 15–20 min, F2 15–20 min, F3 15–20 min (45–60 in total; they can run in parallel).

### F1 · DEEP LINKS UNDER REDUCED MOTION AND PAUSE

Globs: `lib/smooth-scroll.ts`, `lib/smooth-scroll-jump.ts`, `components/providers/smooth-scroll-impl.tsx`,
`components/site/page-hydrated.tsx`, `tools/capture/probes/layout-gates.mjs`.

At ≥ 64rem a deep link loaded under OS reduced motion, or with Pause (`sessionStorage motion=paused`), usually does not land
(this triage: reduced motion 3 of 12 loads at 1440 and 1024, Pause 0 of 4; with motion on 8 of 8). `lib/smooth-scroll.ts`
sets `hashHold` only when `matchMedia(DESKTOP_FINE).matches && !motionOffNow()` (line 312) and leaves RM and Pause to the
browser's fragment jump, which runs at `load` while the streamed sections (`div[hidden][id^='S:']`, `template[id^='B:']`) are
not placed (7,710 px at load, 39,481 final), so `#work`, `#kill-list`, `#act-2` stay off screen and nothing retries. Fix: hold
the hash on the motion-off path too. Land it instantly (`window.scrollTo({ top, behavior: "instant" })` when there is no
Lenis; no cut, no focus move, no animation: RM and Pause stay motionless) at `load`, once the stream has completed and after
late layout, until the visitor scrolls, clicks or jumps (the existing drop rules). `reapplyHash` must work with no GSAP or
Lenis, and a refresh or a plain timer must call it when `<SmoothScroll/>` is not mounted. Do not change phones: they fail the
same way (0 of 4 at 390×844); report the result for Phase 4. Extend `layout-gates` `rmHash` and `pausedHash`: three loads each of
`/#work`, `/#kill-list` and `/#act-2` with no `skip`, every one must land (target top within −2…240); keep the early / late
height reads. Accept: those probes pass at 1440 and 1024 in both the default and the `--rm` run; `lenis`, `keyboard`, `cinema`,
`spotlight` and `hunt` still pass; motion-on deep links still land; first-load JS ≤ +200 B gz, CSS 0.

### F2 · LAYOUT SHIFT TO ZERO

Globs: `components/sections/films/**`, `components/primitives/scene-caption.tsx`, `components/primitives/world-face.ts`,
`components/words/**`, `components/enhance/binders/words.ts`, `app/p3/words.css`.

Spec §12.1 says CLS 0; r3 has 0.0454 at 1440 (desktop; r2 0.006) and non-zero in 9 of 12 runs (`R/motion/1440/summary.md` and
`R/motion/1024/summary.md`, "layout shifts" tables). Three sources: (1) 0.025 at about 32.9 s in `#films` (`div.mt-tier-block` and
two `div.pointer-events-none.absolute.inset-y-0`), also in the alt run (32.6 s) and under reduced motion (26 s; r2 0): reserve that
block's box from first paint, with no motion dependence. (2) 0.0134 at about 17.0 s in `#work` on
`span.scene-caption__moment.world-face-idiots`, and 0.0005–0.0018 on every `world-face-*` caption span: the caption's moment line keeps
its size when the per-world face arrives (reserved line box or matched fallback metrics). If the cause is the token swap in
`components/providers/world-fonts-impl.tsx` (not your glob), return it as a handoff. (3) 0.003–0.0113 in `#beyond` on `span[data-w]`
inside `[data-words=scrub]` (1024: 0.009–0.0095 in the desktop, native, alt and gl runs): the scrub primitive reserves its final
layout from first paint. Method: own worktree and port; `node tools/capture/motion.js --runs=desktop,rm` at 1440 and with
`--vw=1024x768`; read the two layout-shift tables before and after. Accept: CLS ≤ 0.001 in the desktop, native, alt, gl and rm runs
at both widths (one run each); the `research-font` probe has 0 offenders; `words`, `cards`, `spotlight` and `layout-gates` pass;
first-load CSS ≤ +300 B gz, JS ≤ +100 B gz.

### F3 · NO IDLE TASK OVER 50 MS

Globs: `lib/idle.ts`, `lib/ladder.ts`, `components/enhance/desktop-enhancer.ts`, `components/enhance/binders/{dc,hotspots,games}.ts`,
`components/sections/hero/velocity-layers.tsx`, `lib/gl/gl-lock.ts`, `lib/audio/engine.ts`, `components/games/drone/drone-desk.tsx`,
`components/providers/world-fonts-impl.tsx`.

J8 F2, the only app-owned long task: an `IdleRequestCallback` (`lib/idle.ts`, chunk `1_p9cg58_0_83.js`, function `n`) holds the main
thread 100–1,013 ms: 1,013 ms at t −1.66 s on the play screen (1440; 793 ms at −2.61 s at 1024), 394 ms at 0.09 s and 122 / 121 ms in
act-1 / optuna-screener in the desktop run (`R/motion/1440/summary.md`, "intro - longest animation frames" and "desktop - LoAFs
with the most main-thread work"), and in the screencasts reader-1440 #19 (463 ms at y 65), reader-1024 #18, skimmer-1440 #10 (722 ms at
y 1,928), skimmer-1024 #6, director #11. `onIdle`'s 12 ms slice only helps callers that loop on `timeRemaining()`; the callers named
in your globs do their whole job in one go. Not yours (return a handoff with file, line and what to slice):
`components/providers/smooth-scroll-impl.tsx` (`prefetchChunks`, the Lenis start) and `components/enhance/binders/words.ts` (`scan`).
Method: in the worktree add a temporary guard in `lib/idle.ts` `run()` that times `fn` and, over 50 ms, logs `fn.name`, the first 200
characters of `fn.toString()` and the `new Error().stack` captured when `onIdle` was called; run `node tools/capture/motion.js
--runs=intro,desktop` at 1440 (and the intro run at 1024); name every caller over 50 ms; slice it (loop on `idleSlice()` against
`timeRemaining()`, or `scheduler.yield()` where it exists) or defer it past the intro and a scroll pause; remove the guard. Accept:
a re-run shows no LoAF with ≥ 50 ms of script on the play screen or at y < 2,000 px in those two tables and an intro play-screen
script total under 100 ms; ladder step 5 is reached within ±1 s of before; `lenis`, `loaf`, `spotlight`, `words`, `hunt`, `toys`
and `keyboard` pass; no behaviour change (held while the page scrolls, the `hold` caps); first-load JS ≤ +100 B gz.

Handoffs from F1–F3 are applied by the assembler (beats, copy, `lib/media.ts`), followed by `npx tsc --noEmit`, `npm run check`,
`npx eslint .`, `npm run build` and the probes the briefs name, before P3-12.

## For Aryan (his words, his facts, what goes public, taste calls on his photos; nothing here is a fixer's to decide)

Sign-offs (release gates):
1. **Unsigned page copy and DP-9:** 107 unsigned strings now (round 2: 104; more once J9 F11's missing lines are added), **40 Check L2
   countersignatures**, **5 TTS lines** (lumos, mischief, nox, parley, solemn). `RELEASE=1 npm run check` fails only on these and
   item 2 (47 errors).
2. **The 5 community-sourced film quotes (now a RELEASE error):** Q-PC-1, Q-PC-3, Q-3I-3, Q-RD-1, Q-RD-2. Q-3I-3 (the Optuna
   chalkboard) and Q-RD-1 (the RDR2 film card) are on the page for every visitor; the other three are egg-only. Verify each
   against a source in the work or stop rendering it (J9: Q-RD-1 and Q-RD-2 are the two it could not vouch for).

Words and facts:
3. **Kill-list kicker** "THE RECKONING · 3 SURVIVED THE FULL PROCESS" contradicts the Volatility Breakout row tagged EXCEPTION ("not on
   clearing every gate"). J9 offers "3 SURVIVED THE BLIND TEST, 1 AS AN EXCEPTION"; the wording is yours.
4. **"retuned"**: "Killed and never retuned" / "Failed strategies are never retuned" read as a typo for "returned" to strangers in
   round 2; keep it, write "re-tuned", or rephrase (still open; round 3's judges did not raise it again).
5. **`Trading_Algos-`**: the repo label ends in a hyphen and looks truncated (J1 1440 C006, 1024 C008, every frame that shows it). It
   is the repo's real name: rename the repo or approve a display label. (The nav label is a separate item: 13 characters,
   CONTINUE #8.)
6. **The Writing stubs and "RÉSUMÉ · COMING SOON"**: the section is all drafts with nothing to open ("Thinking in public, soon."), and the
   contact screen shows the résumé line under the email button (J3: the most likely recruiter action carries a placeholder; J7:
   low contrast). Show or hide until real (CONTINUE #7, #11 (4)).
7. **The survivor rows** (J9 F9): VIX-Backwardation and Regime-Gated state PF 2.0–2.5 / OOS Sharpe 1.13 / 9 of 9 years with only the
   CANDIDATE chip as caveat; one true limitation line each.
8. **The WANTED poster:** the portrait on it, the handbill weight ("Wrestling (Varsity B, 113/126 lb)": not a hard exclusion,
   but "when in doubt, leave it out", J9 F10) and the reward line (CONTINUE #3).
9. **Sound copy under OS reduced motion** (J9 F5): "Sound follows motion: resume motion to hear it" cannot be followed there; two
   strings (Pause vs the OS setting).
10. **The drone image** on "What I can actually do": it reads as a generic real-world or AI picture (J5 0.15 on the courtyard frame);
    move it or label it an illustration (CONTINUE #11 (5)). Also `films.play`'s "the homemade drone flies in Systems" can read as
    his own drone (it is the 3 Idiots drone).

Taste and layout calls (the defaults are built; each is yours):
11. **Layout calls on your list:** J3 (the busy recruiter) again wants the name first, cards 2–4 cut to about 2 s and the films
    interlude moved or cut (CONTINUE #11 (1), (2)); J2 and J4 call the opening and the cards the best of the page; "Play" stays on
    screen while the flight runs (J3). **Films tempo:** all three judges read the four plates as brisk and gave them 100 % yes
    (J2, J4) or 80 % (J3): amend the spec's "slow" or keep it.
12. **How much the page may move at the dwell stops** (R04, R07): the lent loops are ambient; making each stop perform means
    bigger movers (the pen, the compass invite, the hero sea, the Map).
13. **Items carried over from earlier rounds** (new evidence this round is noted; the others stand as they were): the broom
    rear-up; the hero compass (J2, J3, J4: the hero's compass medallion and teal bracket invite a click and explain nothing);
    brighter kill-list rows (the dim rows measure 4.81–4.92:1, AA; J2 calls the list "a mono spreadsheet"); the self-flipping demo
    (B25); the chalked "AAL IZZ WELL" (the strongest 3 Idiots cue in the blind test, 0.90–0.95); **loop 19 of 20** (add one loop
    within the credit cap, or change the bar); **candle count 29 against the spec's 39** (24 at 64–80rem: amend the spec or the
    composition); compass keyboard focus (the spin ignores the pillar focused by keyboard, spec §9.2 #1, low); and MATCH_ROW
    (frame-relative or viewport-absolute; frame-relative was the recommendation).
14. **The Marauder's Map and credits** (R09, R16): shorten or vary the principle cards, and size up the credits fine print (the
    AI-assistance row stays visible).
15. **Intro name timing** (R21): if the titles deliberately sequence caption then name, section 4.4's wording changes, not the
    page; your call.
16. **A real-laptop recording** (R26): the only thing that settles the raster-bound misses (J8 puts the score at about 2 to 3.5
    depending on it): Chrome's Performance panel with the Media panel open on the five moments in R26, plus a fast fling.
