# ONE-LINERS: drafts for Aryan to personalize before merging to main

**Written:** 2026-09-29 by the M1.5 integrator, per Aryan's binding answer #2: "write emotionally impactful one-liners … that he will personally rewrite."
**Where they live:** `personal-website/lib/film.ts`. Each one has `status: "draft"`, `draft: true`, a `prompt`, and (for the reasons and the reward) an `alternates` array.
**How they render:** as normal copy, with no DRAFT badge, because `film.branchPreview` is `true` on `design/three-films`.
**Release gate:** `RELEASE=1 npm run check` fails while any of these is still a draft, and while `branchPreview` is on.

**Rules they follow:**
- **Tied only to facts in `lib/content.ts`:** killing his own ideas (the kill-list and post-mortems), the Pine Script → pipeline voyage, the holdout, curiosity and self-teaching, honesty with data, distance running, wrestling, photography, and his teachers (Voices).
- **Nothing invented:** no life events, ages, dates, places, or "the first time I…".
- **The quote guards in `lib/quotes.ts` hold:**
  - Nothing about family or the SOS Foundation on the HP screen (next to Q-HP-4) or the RDR2 screen (next to Q-RD-1).
  - No return or Sharpe figure on the Pirates screen (next to Q-PC-2).
- **No quote text and no OUT line** (the validator's #7 lint scans `film.ts`).
- **CLAUDE.md §2 exclusions hold:** no grades, no family detail, and no hardship narrative.

**To make one yours:**
1. Edit its `text`. You can paste in an alternate.
2. Change `status` to `"confirmed"`.
3. Delete `draft: true` and `alternates`.
4. To drop a line entirely, set `text: ""`. An empty string never renders.

---

## 1. "Why this matters to me": `film.worlds.<world>.reason`

These render on the films chapter screens (SM-9, built in M2). Each screen shows the reason next to the work's credit, the "On this page it became…" line, and one quote.

### Pirates of the Caribbean (Act I, *The Crossing*)

**Default:**
> My first strategies were a compass that pointed wherever I wanted it to. The real crossing began when I stopped steering by what I hoped and started steering by data I had never seen.

**Alternates:**
1. A course is something you keep correcting, not something you declare once. That is how chart patterns on TradingView became a pipeline that tells me when I'm wrong.
2. Everyone in it is sailing toward something they can't prove is there. I still am; I've just learned to test the map before I trust it.

*Real story:*
- Journey "Early work" and "The break": the Pine Script and Smart Money strategies looked excellent in-sample and failed out-of-sample.
- The blind holdout.
- Jack's compass is the page's Act I motif.

### 3 Idiots (Act II, *The Workshop*)

**Default:**
> It made curiosity feel like a discipline instead of a distraction. Nobody assigned me a validation pipeline; I built one because I needed to know why my own ideas kept breaking.

**Alternates:**
1. It is about learning something because you need to understand it, not to look like you do. Everything I have built on my own started exactly that way.
2. It taught me that the honest explanation beats the impressive answer. So on this page the chalk circles the caveat, never the number.

*Real story:*
- "Self-taught high-school quant".
- The pipeline and the gauntlet he built.
- The Journey "break" (his ideas collapsed out-of-sample).
- Alternate 2 names the page's own Act II rule: the chalk circles the caveat.

### Red Dead Redemption 2 (Act III, *The Frontier*)

**Default:**
> Its hero keeps a journal of what really happened, not what he wished had. My kill-list is that journal: every idea that didn't survive, written down honestly, so the next one starts wiser.

**Alternates:**
1. It moves slowly on purpose: long rides, quiet camps, nothing rushed. That is the patience distance running taught me, and the same patience a holdout asks for.
2. Most of the frontier is waiting and watching the light change. That is what photography is to me, and on the good days it is what research is too.

*Real story:*
- Gauntlet step 7: "Failed strategies are never retuned. Each ships a written post-mortem."
- The kill-list pillar.
- Cross country.
- Photography: "studying composition and the behavior of light and shadow".

### Harry Potter (Act IV, *The Light*, and the prologue)

**Default:**
> Even its magic has rules, and the wonder is in finding them. That is what markets still feel like to me: rules under the noise, and the honest work of proving which ones are real.

**Alternates:**
1. Its bravest moments are about telling the truth when a lie would be easier. That is the whole job in research: say what the data shows, especially when it isn't what I hoped.
2. It taught me that wonder and rigor aren't opposites. I still feel it when a pre-registered test comes back and the answer is real, whichever way it went.

*Real story:*
- The throughline "understand markets".
- "Telling a real edge from an artifact".
- Pre-registration.
- Intellectual honesty.
- No family content, per the Q-HP-4 guard.

---

## 2. Act loglines: `film.acts[].logline`

These are available on each derived card as `card.logline` (`lib/derive.ts`). No component renders them yet; the card builder decides where they sit.

| Act | Logline (draft) | Tied to |
|---|---|---|
| I · The Crossing | Where I started, and the course I've been correcting ever since. | About and Journey |
| II · The Workshop | What I build, how I try to break it, and what didn't survive. | Work, Systems, the kill-list |
| III · The Frontier | Life beyond the screen: the miles, the mat, the camera, and the people who have watched me work. | Beyond (running, wrestling, photography), Writing, Voices (teachers) |
| IV · The Light | What I believe about doing this work honestly, and where to find me. | Principles and Contact |

---

## 3. The handbill reward: `copy["beyond.handbill.reward"]`

The WANTED handbill in Beyond reads "for questions about quantitative research". This line sits in its **Reward** row, and it now renders.

**Default:**
> An honest answer, including "I don't know yet."

**Alternates:**
1. A straight answer and a written post-mortem.
2. A good question back, and the data to test it.

---

## 4. Checklist for Aryan (merge to main)

- [ ] Rewrite or confirm the 4 reasons, 4 loglines and 1 reward (9 drafts).
- [ ] Sign the 27 proposed strings and 12 quotes (`film.copySignedOff`, or per string).
- [ ] Set `film.branchPreview = false`.
- [ ] Run `RELEASE=1 npm run check` and confirm it is green.
