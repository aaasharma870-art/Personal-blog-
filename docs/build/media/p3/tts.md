# P3 media lane: TTS post-processing (plan §9.3(e)) and the SOUNDS row draft

Batch B9, 2026-09-30, branch `design/three-films`. **Credits spent here: 0.** The 10 takes were generated in B8 (0.12 credits). Nothing was written to `public/`, `lib/`, `docs/build/SOUNDS.md` or `LOG.md`. The assembler copies the files to `public/audio/` and the rows below into `docs/build/SOUNDS.md` (plan §9.4 step 4).

Nobody listened to these files: this session cannot play audio. Takes were chosen from measurements only (below). **Aryan should listen to all five before they ship.**

## 1. Staged files (`docs/build/media-staged/p3/accepted/audio/`)

| id | line | take (B8 job) | length | WebM Opus 48 kbps | MP3 96 kbps | integrated / true peak (WebM) | ≤ 10 KB? |
|---|---|---|---|---|---|---|---|
| `tts-lumos` | "Lumos" | t2 `afe8f6c2-a862-41ef-ab20-66a8a0b605ad` | 0.92 s | 6,269 B | 11,808 B | −22.0 LUFS / −10.3 dBTP | WebM yes, MP3 no |
| `tts-nox` | "Nox" | t1 `a9a83966-1a20-4f6d-8e8b-77f56987f930` | 0.67 s | 4,475 B | 8,640 B | −22.2 / −6.5 | yes / yes |
| `tts-solemn` | "I solemnly swear that I am up to no good" | t2 `39bd753f-d341-40ff-a32c-e61cd40ff851` | 3.38 s | 21,494 B | 41,184 B | −22.0 / −6.4 | no / no |
| `tts-mischief` | "Mischief managed" | t1 `0b0c9df0-961b-4021-a53f-32bcd0526638` | 1.63 s | 10,741 B | 20,160 B | −22.0 / −9.0 | no (by 501 B) / no |
| `tts-parley` | "Parley" | t1 `becf8e10-a8cf-4d4f-82f7-6280da4a059e` | 0.57 s | 3,967 B | 7,488 B | −22.6 / −6.3 | yes / yes |

- **Totals:** WebM 46.9 KB and MP3 89.3 KB. A browser loads one set or the other, so either set fits the spec §10.4 limit of ≤ 150 KB for all sound files.
- **Measurements:** every file peaks at or below −6 dBTP, which meets the SFX rule (peaks ≤ −6 dBFS). All five are 48 kHz mono with no metadata.
- **Record:** `accepted/audio/tts.json` holds every take's measurements, the trim points, both loudnorm passes and the output stats.

## 2. How the take was chosen (no listening possible)

The takes were decoded to PCM before measuring. The Ogg timestamps have gaps, so any ffmpeg timing based on them overstates the length (Lumos t1 shows 1.50 s in the container but has 0.88 s of samples). The decoded sample counts match the API's `durationSec`.

| line | t1 | t2 | chosen, and why |
|---|---|---|---|
| Lumos | 0.88 s; speech 0.02–0.69; peak −4.9 dBFS; voiced share 0.66; periodicity 0.573 | 1.06 s; speech 0.02–0.84; peak −4.9; voiced 0.59; periodicity 0.552 | **t2**: less voiced and less periodic, so closer to the "hushed, breathy whisper" brief. No clipping in either take. |
| Nox | 0.82 s; speech 0.06–0.62; voiced 0.38; periodicity 0.394 | 0.82 s; speech 0.07–0.60; voiced 0.39; periodicity 0.398 | **t1**: practically identical; t1 is marginally breathier. |
| solemn swear | 4.42 s; speech 0.26–4.07; voiced 0.69; peak −0.31 | 3.82 s; speech 0.26–3.53; voiced 0.65; peak −0.04 (0 clipped samples) | **t2**: shorter (3.27 s of speech vs 3.81 s), so smaller, and slightly breathier. |
| Mischief managed | t1 = t2, byte-identical (B8) | — | t1: the only take. |
| Parley | t1 = t2, byte-identical (B8) | — | t1: the only take. |

- **Clipping:** 0 samples at \|x\| ≥ 0.999 in every take.
- **Voiced share:** the share of active 30 ms frames whose normalised autocorrelation peak (60–400 Hz lag) is above 0.5.

## 3. Edits (the whole chain; nothing else was changed)

1. **Decode** the Ogg Opus to 32-bit float PCM, 48 kHz mono.
2. **Trim** to [speech start − 30 ms, speech end + 80 ms]. Speech is the span of 30 ms frames within 40 dB of the loudest frame. The trimmed span keeps 100.0000% of each take's signal energy, so no word or breath was cut.
3. **Fade:** `afade` in 10 ms and out 40 ms. The first and last 20 ms of each output are at −80 to −180 dB, so there are no clicks.
4. **Loudness:** two-pass `loudnorm` with I = −22 LUFS, TP = −6 dBTP, LRA = 11, `linear=true`. All five stayed linear, so the only processing is a gain change with no limiting.
5. **Encode:**
   - WebM: `libopus -b:a 48k -vbr on -application audio -frame_duration 20`.
   - MP3: `libmp3lame -b:a 96k`, 48 kHz mono, with a Xing header and no ID3.
   - Metadata is stripped from both.

- **No voice changes:** there was no pitch shift, EQ, denoise or "whisperize" step.
- **Scripts** are in the session scratchpad: `p3/b9/tts/ttsan.py` measures the takes and `p3/b9/tts/ttsproc.py` runs the chain above.

## 4. Flags for Aryan

1. **Not a true whisper.** Qwen delivered a soft, breathy speaking voice: 38–65% of the chosen takes' active frames are voiced (B8 measured 58–90% on the full takes with its own method). If he wants a real whisper, there is a 0-credit post option: noise-excited LPC resynthesis, or a voiced-band cut. It was not done, because it changes the voice and he should hear the original first.
2. **"Parley"** was transcribed as "Harley" by B8's ASR (faster-whisper base.en), probably because of the soft onset. Listen before using it.
3. **Size budget (spec §10.4: TTS ≤ 10 KB each) versus format (Opus 48–64 kbps).**
   - The format rule was kept. Lumos, Nox and Parley meet 10 KB in WebM.
   - Mischief (10.7 KB) and the solemn line (21.5 KB) cannot meet it at 48 kbps; the solemn line would need about 22 kbps.
   - All the MP3 fallbacks except Nox and Parley are over 10 KB.
   - The options are: accept these sizes, since the total is 47 KB WebM against the 150 KB total; or re-encode those two lines at 24–40 kbps Opus, which is still clean for speech. Either is 0 credits.
4. **Content (CONTENT-RULES, map §7.6):** "I solemnly swear that I am up to no good" and "Mischief managed" are quotations from the books and films. They are spoken here in a generic synthetic voice (no clone, no film audio as a reference, no actor imitation). Aryan decides whether they go public; CONTINUE Phase 2 item 4 already questions the solemn line.
5. **Seeds:** the seed has no effect on the short lines. "Mischief managed" and "Parley" each have only one real take.

## 5. SOUNDS.md row draft (for the assembler; `docs/build/SOUNDS.md`)

| id | files | what | source | licence / terms | edits | size |
|---|---|---|---|---|---|---|
| `tts-lumos` | `/audio/tts-lumos.webm`, `/audio/tts-lumos.mp3` | spoken "Lumos" (the lumos-nox egg, typed or palette spell only) | Higgsfield TTS, `qwen_audio_tts` (Qwen Audio 3.0 TTS Flash), built-in preset voice "Nora" (`d081b915-6623-4a44-bacf-80d0f1c90a03`), instruction "a hushed, breathy whisper", job `afe8f6c2-a862-41ef-ab20-66a8a0b605ad` (0.01 credits, 2026-09-30) | generated on Aryan's Higgsfield account (plus plan) under Higgsfield's terms for generated output (Aryan to confirm the terms); synthetic generic voice, not a clone, no film audio used | trim, 10/40 ms fades, loudnorm −22 LUFS / −6 dBTP (linear), Opus 48 kbps WebM + MP3 96 kbps | 6.3 KB / 11.8 KB |
| `tts-nox` | `/audio/tts-nox.webm`, `.mp3` | spoken "Nox" (lumos-nox egg) | same model and voice, job `a9a83966-1a20-4f6d-8e8b-77f56987f930` (0.01 cr) | as above | as above | 4.5 KB / 8.6 KB |
| `tts-solemn` | `/audio/tts-solemn.webm`, `.mp3` | spoken "I solemnly swear that I am up to no good" (the marauders-map egg) | same, job `39bd753f-d341-40ff-a32c-e61cd40ff851` (0.02 cr) | as above; **quotation, Aryan to approve** | as above | 21.5 KB / 41.2 KB |
| `tts-mischief` | `/audio/tts-mischief.webm`, `.mp3` | spoken "Mischief managed" (map dialog close) | same, job `0b0c9df0-961b-4021-a53f-32bcd0526638` (0.01 cr) | as above; **quotation, Aryan to approve** | as above | 10.7 KB / 20.2 KB |
| `tts-parley` | `/audio/tts-parley.webm`, `.mp3` | spoken "Parley" (the parley egg) | same, job `becf8e10-a8cf-4d4f-82f7-6280da4a059e` (0.01 cr) | as above | as above | 4.0 KB / 7.5 KB |
