# SOUNDS: every sound on the site and where it comes from

**Status:** Phase 3, P3-9 (W2-SOUND), 2026-10-01, branch `design/three-films`. Sound pass of 2026-10-16 (complaint 8, "the sound effects do not all match the scene"): section 3.3 lists what changed. Spec: `PHASE3-SPEC.md` §3.5 and §10. This file is the provenance record for sound, as `FONTS.md` is for fonts. Validator check #9 (`scripts/checks/sound.mjs`) fails the build when a file under `public/audio/` has no row in the files table below.

**Rules (spec §10):**
- Sound is off on every new visit. Nothing is fetched and no `AudioContext` exists before the visitor unmutes.
- Nothing here is film audio. There is no score, no ripped clip, no cloned or imitated voice and no film theme. The site has no voice for 3 Idiots (and never the "Aal izz well" tune or rhythm) and no voice for RDR2.
- **Every sound is procedural Web Audio (code in `lib/audio/`) except the five spoken lines in the files table.** The procedural sounds have no source files, no licence and no credits: they are synthesised in the visitor's browser from noise, filters and single tones.

## 1. Files (`public/audio/`)

The W2 assembler copied these (2026-10-02) from `docs/build/media-staged/p3/accepted/audio/` (the media lane's B9 output; the take record is `tts.json` there and the write-up is `docs/build/media/p3/tts.md`). The engine fetches them only after the first unmute and picks the format with `canPlayType`: Opus in WebM first, MP3 otherwise. A browser loads one set, so the WebM set (46.9 KB) and the MP3 set (89.3 KB) are each under the 150 KB total of spec §10.4. A missing file is a silent no-op.

**Release gate:** validator check #9 holds every file in `public/audio/` whose line still says "to approve" or "to confirm" (in any of its rows, so the MP3 fallback counts too). It is a warning on the branch and an error under `RELEASE=1` until Aryan approves the line and its terms and the flag is removed from the row.

Common to every row:
- **Source:** Higgsfield TTS, model `qwen_audio_tts` (Qwen Audio 3.0 TTS Flash), built-in generic preset voice "Nora" (`d081b915-6623-4a44-bacf-80d0f1c90a03`), instruction "a hushed, breathy whisper". Not a clone. No film audio and no actor recording was used as a reference.
- **Edits:** decoded to PCM; trimmed to the speech plus 30 ms before and 80 ms after; 10 ms fade in and 40 ms fade out; two-pass `loudnorm` to −22 LUFS and −6 dBTP (linear, so only a gain change); encoded as Opus 48 kbps VBR in WebM and as MP3 96 kbps mono at 48 kHz, with metadata stripped. There was no pitch shift, EQ or denoise.
- **Licence / terms:** generated on Aryan's Higgsfield account under Higgsfield's terms for generated output. **Aryan to confirm the terms.**

| id | file | what | source | licence | edits | bytes |
|---|---|---|---|---|---|---|
| `tts-lumos` | `/audio/tts-lumos.webm` | spoken "Lumos" (the typed or palette spell only; the Pause button is silent) | Higgsfield TTS, voice "Nora", job `afe8f6c2-a862-41ef-ab20-66a8a0b605ad` (0.01 credits, 2026-09-30) | Higgsfield generated output (to confirm) | trim, fades, loudnorm, Opus 48 kbps | 6,269 |
| `tts-lumos` | `/audio/tts-lumos.mp3` | the MP3 fallback | as above | as above | trim, fades, loudnorm, MP3 96 kbps | 11,808 |
| `tts-nox` | `/audio/tts-nox.webm` | spoken "Nox" (the typed or palette spell only) | Higgsfield TTS, voice "Nora", job `a9a83966-1a20-4f6d-8e8b-77f56987f930` (0.01 credits) | Higgsfield generated output (to confirm) | trim, fades, loudnorm, Opus 48 kbps | 4,475 |
| `tts-nox` | `/audio/tts-nox.mp3` | the MP3 fallback | as above | as above | trim, fades, loudnorm, MP3 96 kbps | 8,640 |
| `tts-solemn` | `/audio/tts-solemn.webm` | spoken "I solemnly swear that I am up to no good" (the Marauder's Map egg). **A quotation: Aryan to approve.** | Higgsfield TTS, voice "Nora", job `39bd753f-d341-40ff-a32c-e61cd40ff851` (0.02 credits) | Higgsfield generated output (to confirm) | trim, fades, loudnorm, Opus 48 kbps | 21,494 |
| `tts-solemn` | `/audio/tts-solemn.mp3` | the MP3 fallback | as above | as above | trim, fades, loudnorm, MP3 96 kbps | 41,184 |
| `tts-mischief` | `/audio/tts-mischief.webm` | spoken "Mischief managed" (when the map dialog closes). **A quotation: Aryan to approve.** | Higgsfield TTS, voice "Nora", job `0b0c9df0-961b-4021-a53f-32bcd0526638` (0.01 credits) | Higgsfield generated output (to confirm) | trim, fades, loudnorm, Opus 48 kbps | 10,741 |
| `tts-mischief` | `/audio/tts-mischief.mp3` | the MP3 fallback | as above | as above | trim, fades, loudnorm, MP3 96 kbps | 20,160 |
| `tts-parley` | `/audio/tts-parley.webm` | spoken "Parley" (the parley egg) | Higgsfield TTS, voice "Nora", job `becf8e10-a8cf-4d4f-82f7-6280da4a059e` (0.01 credits) | Higgsfield generated output (to confirm) | trim, fades, loudnorm, Opus 48 kbps | 3,967 |
| `tts-parley` | `/audio/tts-parley.mp3` | the MP3 fallback | as above | as above | trim, fades, loudnorm, MP3 96 kbps | 7,488 |

Total spent on sound: 0.12 credits (B8, 10 takes). No CC0 recordings are used.

## 2. Flags for Aryan (sound)

1. **Listen to all five lines before they ship.** No one has heard them: the session that made them cannot play audio. Plan P3-9 #5 (the manual listen: nothing sounds like a film score, an actor, a gunshot or the "Aal izz well" tune) is recorded by the W2 assembler, and it covers the procedural sounds too. The listening bench is `/lab/p3/sound`.
2. **Two lines are quotations** from the books and films: "I solemnly swear that I am up to no good" and "Mischief managed". They are spoken by a generic synthetic voice. Aryan decides whether they go public. CONTINUE Phase 2 item 4 already questions the solemn line. To drop a line, delete its two files and its rows: the engine then plays only the procedural part of that egg.
3. **Not a true whisper.** Qwen produced a soft, breathy speaking voice. There is a 0-credit option to make it a real whisper (noise-excited resynthesis), not done because it changes the voice.
4. **"Parley"** was transcribed as "Harley" by an automatic check. Listen to it first.
5. **Sizes:** "Mischief managed" (10.7 KB) and the solemn line (21.5 KB) are over the 10 KB per TTS line of spec §10.4 in WebM (validator warning only). Re-encoding those two at 24–40 kbps Opus would fit, at 0 credits.

## 3. Procedural sounds (no files)

The engine (`lib/audio/engine.ts`, loaded only after the first unmute) builds these from the recipes in `lib/audio/recipes.ts` and `lib/audio/beds.ts`.
- **Levels:** every effect is rendered offline once and normalised to its loudness target (about −21 LUFS momentary, about 9 dB over the bed; quiet ticks and the toggle click lower), capped at −6.5 dBFS sample peak. Loudness is weighed the way a laptop speaker plays it: K-weighting with a **160 Hz** high-pass (BS.1770's own is 38 Hz), and the master cuts below **75 Hz** (a flat 2nd-order high-pass before the ceiling). A master ceiling holds the sum under −6 dBFS.
- **Beds:** each bed's continuous layers are measured offline with the same weighting and trimmed to about −30 LUFS. Beds duck −6 dB under effects and crossfade over 1.1 s (equal power) when the world on screen changes (150 ms debounce). Inside a pinned act card the bed follows the card's own progress, not its box (section 3.1).
- **Page-driven cues** (card meets, impacts, the bars closing, the title sting) pass a burst limiter: at most 3 starts per 250 ms, and when several cards are crossed in one tick (a scrollbar drag) only the last card's cues play. The wave, duster, shutter and match cues also keep a 2.5 s gap, and a card's meet cue fires once per crossing (it re-arms after the reader goes back 0.08 of the card's progress and a second passes). A new pass over the page (the intro's `arm()`: Replay intro, "Play it again") sends `p3:view-reset`, which re-arms the impacts, the entry cues, the crossings and the title stings.
- **Suspension:** Pause, reduced motion and a hidden tab silence the master at once and suspend the context within 100 ms. The one exception is the typed or palette Nox, which pauses motion itself: its snuff and line stay audible for 1.5 s while the bed stays silent. OS reduced motion ends that at once.

### 3.1 Beds (spec §10.2)

| bed | plays in | recipe |
|---|---|---|
| `pirates` | the hero, Act I, About, Journey; the seam card until its progress p .50 (the classroom has landed), with the storm on; the broom landing of the intro | sea swell (brown noise, lowpass 500–900 Hz, 0.09 Hz swell); wind (band-passed noise around 800 Hz, slow drift); a hull creak every 6–14 s (a sawtooth glide 120 → 260 Hz through a resonant bandpass); seam storm = rain hiss (noise above 3 kHz) + a low rumble, with no thunder crack |
| `idiots` | Act II from the seam card's p .50 (Work through the kill-list); **silent in Experiment**; the storm is off from here | room tone (brown noise below 200 Hz); room air (white noise, band-passed 700 Hz, drifting level) so a laptop speaker has something to play; a ceiling fan (70 Hz hum + blade swish, amplitude-modulated at 5.5 Hz); sparse courtyard chirps (FM sines 2–5 kHz, every 3–9 s). No crowd, no voices |
| `rdr2` | Act III from its card rise (Beyond, Writing, Voices); the Act IV card until its p .50 (the campfire is still the picture until the Great Hall lights) | campfire crackle (sparse impulses, bandpass 1–4 kHz) + a 150 Hz roar; prairie wind; crickets (a 4.5 kHz tone in groups of 3–5 pulses at 30 Hz); a distant train every 35–48 s (low chuffs at 1.5 Hz + one faint generic horn tone) |
| `hp` | the intro's Play card and flight (sound on only); Act IV from the card's p .50 (Principles, Contact) | a great-hall hum (static sines 110/165/220/330/440 Hz drifting ±3 cents: one open-fifth chord, no melody, never a celesta or music box); candle crackle; soft window wind |
| `house` | the films chapter, the credits, the 404 | a projector whir (band-passed noise with a 24 Hz flutter), a low motor hum, the gate clatter (24 clicks/s) |

### 3.2 Effects (spec §10.3)

| cue | plays on | recipe |
|---|---|---|
| `broom-whoosh`, `broom-land` | `intro:flight` (the broom takes off) and `intro:land` (it lands on the hero), from the intro controller; **sound on only**, the intro is silent otherwise. The Play card and the flight play the `hp` bed; the landing crossfades to `pirates` | a band-passed noise sweep 300 → 2500 Hz with a pan; a soft thump with a 230–340 Hz body |
| `wave-wash` | the opening card meets | brown noise swelling through a rising lowpass, with a crest fizz |
| `wave-recede`, `duster-swipe` | the seam meets (once per crossing) | a falling lowpass wash; a short band-passed swipe |
| `shutter` | the tintype meets (its flash "poof", `impact-flash`, follows 90 ms later) | two mechanical clicks, each with a 600–900 Hz wooden body |
| `match-strike`, `shimmer-rise` | the ignite card meets | three scratches and an ignition; an inharmonic cluster that swells together (no arpeggio) |
| `letterbox-whum` | `letterbox` close (the bars opening are silent; at most one every 1.2 s) | a 0.4 s low swell (55/110 Hz) with a 220/330 Hz body and soft air |
| `projector-start`, `reel-runout` | entering the films chapter / the credits (once per pass; **not** during the director's cut); the director's cut start / stop (`dc:stop` plays the cut's one run-out) | gate clatter winding up / down + motor |
| `impact-iris`, `impact-chalk`, `impact-flash`, `impact-lumos` | `impact` (Pirates, 3 Idiots, RDR2, HP), once per world per pass; the RDR2 one waits 90 ms after the shutter | a struck metal ring; a chalk "tock" (a 250 Hz hollow knock); a soft flash-powder "poof" (a rising puff of air, never a crack or a shot); a soft open-fifth swell |
| `title-sting` | `card:phase` a → b (the act title pushes in at p .50), once per card per pass, never within 0.55 s of the world's impact | one plucked D4 |
| `typewriter-click` | **ALT only**: called by the RDR2 ALT title (`words/bind/titles.ts`); the default title is silent. Keep it only while the ALT title can ship | a key click |
| `compass-lid`, `compass-ratchet`, `compass-settle` | `toy` compass `open`/`close`, `tick`/`spin`, `settle` | hinge clicks; a ratchet tick; a needle-settle ding |
| `drone-hum` | `sound.loop("drone-hum", { rate })` from the drone game | two detuned sawtooths 180–320 Hz (pitch = speed) + rotor noise |
| `drone-gate`, `drone-finish` | `game:gate`; `game:finish` drone | a tick; one struck chord |
| `deadeye-swell`, `deadeye-scratch`, `deadeye-strike`, `deadeye-release` | `game:start` deadeye (the beds also slow under a lowpass); `game:mark`; `game:fire`; `game:finish` / `game:stop` deadeye (the exhale plays once per round, 0.12 s after the strike, and not for a stop after the round ended) | a slow swell with a 250–600 Hz body; a pencil scratch; **a muffled "thock", never a gunshot**; an exhale. No heartbeat |
| `candle-fwip`, `hall-swell` | `toy` candles `light` (pitched per candle `n`), `done` | a pitched ignition fwip; a static chord swell |
| `map-unfold`, `ink-scratch` (+ `tts-solemn`) | `egg:trigger` marauders-map | parchment crinkles + a low flap; quill strokes |
| `lumos-bell` (+ `tts-lumos`), `nox-snuff` (+ `tts-nox`) | `egg:trigger` lumos / nox | an inharmonic bell swell; a snuffed flame |
| `snitch-flutter`, `snitch-ting` | `egg:trigger` snitch; the Snitch caught | a 19 Hz wing buzz; a catch ting |
| `parley-creak`, `flag-snap` (+ `tts-parley`) | `egg:trigger` parley | a rope creak; a canvas flap (soft band-passed flutters, no cracks) |
| `coin-ting`, `hollow-wind` | `egg:trigger` aztec-coin | a coin ring; a hollow gust |
| `kraken-rumble`, `wave-slap` | `egg:trigger` hidden-kraken | a sub rumble under a 120–340 Hz groan with a slow wobble; a wave slap |
| `heartbeat-2` | `egg:trigger` aal-izz-well | two heartbeats (chest thump + a 150–260 Hz knock), nothing else |
| `quad-spinup` | `egg:trigger` quadcopter-lift | a rotor spin-up |
| `pen-creak`, `pen-ting` | `egg:trigger` worthy-pen | a case creak; a small ting |
| `eagle-shimmer` | `egg:trigger` eagle-eye | a high shimmer + wind |
| `bone-scratch` | `egg:trigger` fossil-bone | graphite strokes |
| `fire-shift`, `fire-crackle` | `egg:trigger` campfire-flare | a log knock + pops; a crackle burst over a 200–1500 Hz fire body |
| `found-pirates`, `found-idiots`, `found-rdr2`, `found-hp` | `hunt:found` by world; when the find is an egg, the chime waits for the egg's own sound to end (and is skipped after a long spoken line, over 2.2 s) | a bell, a chalk tick, a spur jingle, a glass chime |
| `hunt-complete` | `hunt:found` at 12/12 | an original three-note chime rising in fifths (G5, D6, A6), under 2 s |
| `postcredits-whoosh`, `postcredits-chime` | `post-credits` | a whoosh; a soft chime |
| `toggle-click` | the visitor's own unmute | one soft click |

### 3.3 What the 2026-10-16 sound pass changed (complaint 8) and what it left

Changed: the beds follow the pinned card's phase (`data-card-phase`), so the classroom is no longer under the Pirates storm and the Great Hall hum no longer starts under the campfire; the intro plays the `hp` bed, a broom whoosh at take-off and a landing thump (sound on only); the shutter, the poof and the whumpf no longer stack (`flash-whumpf` is deleted: its job is `impact-flash`); found chimes no longer stack on an egg's own sound; wiggling across a card edge no longer repeats the wave and duster; a scrollbar drag no longer fires every cue; the credits entry no longer plays a second run-out during the director's cut; Dead Eye's exhale plays once; the act titles have their sting; Replay re-arms the impacts and cues; levels are weighed for a laptop speaker and every sub-bass cue has a mid companion (at least 40% of its power above 200 Hz after the 75 Hz cut).

Not done (follow-ups): a sound button on the intro's Play card (the page is inert under the overlay; the visitor can only hear the intro after a reload with sound already on, or on a Replay); the film chapter keeps one projector bed for its four screens, and `rdr2` is one night-time bed for Beyond, Writing and Voices (G9); the two quotation lines and the licence of the five spoken lines still wait for Aryan (section 2). Nothing here was listened to by a person: audibility is inferred from the measured spectra.

## 4. Adding a sound file

1. Record its provenance first: the source URL or the generation job, the licence (CC0 only for recordings), and every edit.
2. Encode it as Opus in WebM, 48 kHz mono, 48–64 kbps, plus an MP3 96 kbps fallback. Keep an effect ≤ 15 KB (≤ 1.5 s) and a TTS line ≤ 10 KB.
3. Add one row per file to the table in section 1. The `bytes` cell is the exact file size.
4. If it is a new cue, add its id to `CUE_IDS` and `FILE_CUES` in `lib/audio/cues.ts`.
