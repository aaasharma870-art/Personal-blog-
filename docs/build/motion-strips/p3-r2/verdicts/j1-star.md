# J1 STAR · one star per screen · P3-11 round 2 verdict

2026-10-04 · judge J1 · inputs: the four 1 s sheet sets in `R/screencast/{reader,skimmer}-{1440,1024}/sheets/`,
each run's `clips.json`, and MANIFEST §1 / §2 J1. Reader intro clips #1–12 were skipped. Full per-clip
disagreements are in `j1-star.json` (180 rows).

**Score: 2 / 5.** By eye there is no clip with two competing animations, so the "0 × 2+" bar passes. The
main bar fails by a wide margin: about 47 % of reader clips show exactly one star (the bar is 90 %), and 108
clips at each width have no star outside a declared breath. The machine's count is about 15–19 points too
generous.

## Counts (seen by eye · machine)

| run | judged | exactly one | star-less | in a breath | outside a breath | 2+ |
|---|---|---|---|---|---|---|
| reader 1440 | 240 | **117 = 48.8 %** · 153 = 63.8 % | 123 · 87 | 15 · 15 | **108** · 72 | **0** · 0 |
| reader 1024 | 227 | **104 = 45.8 %** · 147 = 64.8 % | 123 · 78 | 15 · 13 | **108** · 65 | **0** · 2 |
| skimmer 1440 | 106 | 65 = 61.3 % · 84 = 79.2 % | 41 · 16 | 3 · 4 | 38 · 12 | 0 · 6 |
| skimmer 1024 | 79 | 47 = 59.5 % · 65 = 82.3 % | 32 · 11 | 3 · 4 | 29 · 7 | 0 · 3 |

How often my count matches the machine's (same 0 / 1 / 2+): reader 1440 182/240, reader 1024 166/227,
skimmer 1440 72/106, skimmer 1024 52/79. Nearly every mismatch has the same direction: **the machine grants a
star and the frames show nothing performing**. That happens in 47 / 51 / 26 / 22 clips. The reverse (motion
with no star in the log) happens in 11 / 8 / 2 / 2 clips.

| pass bar | result |
|---|---|
| ≥ 90 % of reader clips exactly one star | **FAIL**: 48.8 % (1440), 45.8 % (1024) |
| star-less clips only inside declared breaths | **FAIL**: 108 star-less clips outside a breath at each width |
| 0 clips with 2+ | **PASS by eye** (0 of 652). The log still records 2 reader and 9 skimmer overlaps |

## How I counted

I read each clip's four frames at sheet size. Where a clip was unclear, I cropped and enlarged it and lined
the frames up by their vertical scroll shift, with the sticky header masked. A difference map then shows what
moved on its own rather than with the page.

- **Counted as a star:** a draw (ink, chalk or handwriting), an iris, a wipe, a colour grade, a burn, a title
  reveal, a plate cross-fade or push, a plate drifting at its own rate, or a small flying element (the
  glowing dot, the horse, the credits glyph).
- **Not counted:** rigid scroll, a sticky (fixed) plate under scrolling text, a text block fading up as it
  enters, a caption swap.
- **Limits:** each 1 s clip has four samples, shown at about 1/7 scale (1440) and 1/5 scale (1024). Hairline
  draws, flickers shorter than 250 ms and very slow drifts can be missed. I checked that the clips I called
  "rigid" stay flat on a more sensitive difference threshold too.

## Findings

1. **High · the one-star rate is about 47 % at both reader widths.** That is far below the 90 % bar and
   below the machine's 64 %. The star-less clips outside breaths fall in these sections:
   - 1440: films 11, beyond 11, systems 10, optuna 8, credits 7, top 6, journey 6, contact 6, …
   - 1024: beyond 11, systems 10, optuna 8, trading 7, films 7, credits 7, …
2. **High · long dead stretches in sections heavy with text.** In each stretch, 8–11 clips in a row show text
   scrolling rigidly past a static or sticky plate:
   - experiment, 1440 #104–114 (1:43–1:53)
   - systems, 1440 #117–125 (1:56–2:04); 1024 #105–119
   - beyond, beside the sticky horse plate: 1440 #173–180 (2:52–2:59); 1024 #162–171
   - contact into the credits: 1440 #237–252 (3:56–4:11); 1024 #225–239
3. **High · every 2 s reading stop is star-less and outside a breath.** Each stop at an h2 or an act-card
   settle gives 1–2 clips of identical frames, about 25–30 clips per run. At 1440 they are #25–26, #42–43,
   #61, #79–80, #92–93, #104–105, #113–114, #123–124, #134–135, #163, #190–191, #203–204, #215, #238–239
   and #244–245. There are two ways out: declare the stops as rests, or give each stop a held star (a slow
   push or a loop on the plate in view).
4. **Medium · the hero is frozen for 6 s after the titles** (#13–18 at both widths). The wave does not move;
   only the corner caption swaps. For #16–18 the machine grants ★B02, yet `yRange` is [0,0] and the frames
   are pixel-identical. That contradicts the stated counting rule that a scroll star counts only while the
   page moves at least 12 px.
5. **Medium · the machine over-counts.** Stars are granted where nothing performs:
   - Identical frames:
     - B08-compass / B08-invite: 1440 #35–36
     - B38·w3: #164
     - B50·w3: #216
     - B58·w3: #251
     - B47: 1024 #193
   - Rigid scroll only:
     - B30·w3 films heading: #133, #136
     - B32-finale and B33-finale plates: #144, #149
     - B41 map trail: #174–176
     - B47 voices: #205–210
     - B56-trail: #240–242
     - B57: #246
     - B12-push: #54, #56

   Several weight-3 stars are in this list.
6. **Medium · hosts move outside the spotlight.** The log shows NO STAR, but the frames show motion:
   - The chalk quote writes itself: 1440 #89, 1024 #84.
   - The corridor plate drifts under the finished blueprint: #84, 1024 #78.
   - The classroom plate drifts: #96.
   - The campus plate slides in: 1024 #92.
   - A glowing dot crosses the viaduct: #155.
   - About's compass lid opens: #37.
   - The kill-list lens fades out: #132, 1024 #127.
   - The map footprints shift: #227.
   - A small glyph flutters in the credits: #248–249, 1024 #235–236.

   None of these collides with another star, but they make the log an unreliable sole basis for J1.
7. **Low · the machine's 2+ clips do not look like two competing animations.**
   - reader 1024 #51–52 (B12-push + B12): nothing performs at all.
   - skimmer 1440 #80: the horse, then the tree-line, one frame apart.
   - skimmer 1440 #89–90: the footprints walk while the quill mark stays still.
   - skimmer 1440 #99: a single candle plate.
   - skimmer 1440 #100 and skimmer 1024 #74: rigid scroll.
   - skimmer 1024 #23: the heading writes, then the chalkboard plate enters.

   These clips are overlaps in the log's hand-off windows (12–610 ms). Tighten the hand-offs if the log
   itself must reach 0.
8. **Low · labelling bug.** skimmer 1024 #1 (y 0, `yRange` [0,0]) is tagged "breath after B30" and row B58.
   That breath spans y 20500–21268.
9. **Low · some screens rest on a tiny star:**
   - a glowing dot of about 20 px over the viaduct and the RDR2 sky (#155–160)
   - a thumb-sized horse running along the journal page (#196–197)
   - the credits glyph (#247–249)

   They count as a star, but a skimming reader may miss them, so those screens read as nearly dead.
10. **Info · the set pieces work as one star at a time.** Each act card hands off cleanly:
    - act 1: porthole iris → plate push → title → breath (#21–29)
    - act 2: torn wipe → chalk diagram → title (#57–64)
    - act 3: colour grade → title (#161–167)
    - act 4: burn hole → Great Hall → title (#212–219)

    The journey plate sequence (#47–53), the journal sketches with the horse (#193–198) and the map footprints
    (#228–234) also carry their screens one at a time.

## What would move the score

- **Close the dead stretches** in systems, experiment, beyond and contact/credits with one scroll-linked
  element per viewport. A slow plate push or a draw would do.
- **Settle the rule for the reading stops**: declare them as rests, or hold a star in view during each stop.
- **Make the log match the screen:**
  - Drop grants while frames are identical or scroll rigidly. The worst cases are B02 at y 0 and the
    weight-3 stars at the stops.
  - Register the chalk quote, the plate drifts, the Snitch dot, the compass lid, the lens fade-out and the
    credits glyph with the spotlight.
  - Fix the y-0 breath label.
