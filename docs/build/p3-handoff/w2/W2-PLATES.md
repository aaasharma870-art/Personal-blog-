# W2-PLATES return (status: done) — saved by the orchestrator

Files: components/primitives/{live-plate,camera,depth-plate,media-frame}.tsx, components/worlds/pirates/use-frame-sequence.ts, components/stage/{stage,weather-layer}.tsx, lib/page.ts, app/p3/plates.css, tools/capture/probes/plates-live.mjs, app/lab/p3/plates/{page,plates-lab}.tsx (new).

APIs: LivePlate gains optional progress?: MotionValue<number>. CameraGroup/CameraSpec unchanged (focal = scale origin 0–1; x/y = [from,to] fractions; scale ≥ 1, translation clamped; 'sticky' uses nearest [data-camera-track] ancestor; 'settle' from top-entering to centred). NEW usePlateEngine() (DESKTOP_FINE + motion on + after ladder step 2). DepthPlate gains sizes?. WeatherLayer returns JSX|null. useFrameSequence window mode works (frameAt nearest decoded; ready = blobs fetched + first window decoded). MediaFrameState gains "paused" (mounted without decoder: parked or held by GL). stage.tsx exports the lazy plates engine (LiveImpl, CameraDrive, DepthNear, WeatherImpl, seqWindow, specPose, lineOf, SeqHandle, SeqState) — facades only. Window event 'stage:cover' when [data-stage-on] marks change.

HANDOFFS:
1. W2-CARDS: the stage's act-1 program/about shot starts at scale 1.3 about markOf('iconic-pearl','stern') (card-opening.push DEFAULT) or 1.15 (ALT), cover-fit, drifting to ÷1.04, x +1%; if push-in #1 ends elsewhere, change MOVES / OPENING_ALT_END in stage.tsx.
2. W2-CARDS card-p3.tsx: add fs.ready (or fs.decoded) to SeqCanvas's draw-effect deps.
3. W3-PIRATES journey-voyage.tsx: move JV to window mode useFrameSequence(urls, wanted, { window: 12, index }) + frameAt(i) (JV holds all 72 decoded ≈ 265 MB today).
4. W3 world hosts: put every remaining film plate on <LivePlate> with the spec §6.1 camera table (drone, kill-list + work heads, films screens, handbill, camp, contact); playOn='never' only where the stage covers the plate.
5. lib/stage.ts (asm, optional): add move?: { scale; x?; y?; at? } to StageCue + validator rule.
6. lib/media.ts (asm/Aryan): iconic-corridor-alt has no line mark (optuna cue 2 runs camera-only).
7. lib/events.ts (asm, optional): 'stage:cover': void.
8. Budget record: first-load media-frame +252 B, use-frame-sequence +235 B; four facades ≈ +0.94 KB once cards import them; plates.css ≈ 0.6 KB gz render-blocking CSS; stage/plates engine chunk 6.6 → 11.0 KB gz (above the spec's ≤ 8 line, inside the 115 KB lazy total).

ACCEPTANCE: GL handoff done in MediaFrame (gl:frame → paused + lock released; gl:release → re-acquire + resume) — verify /lab/p3/gl?gl=force. P3-5 #1 shared pickCodec. P3-5 #4 (W2 scope): `node tools/capture/p3-probes.mjs <base> <out> --only=plates-live --timeout=240000` → live.dead = 0, maxPlaying ≤ 1. P3-5 #5: ?variant=plates.loops:alt / stage.camera:alt. P3-5 #6: __seqMem frames ≤ 25, ≤ 128 MB. Deferred 9–12 built (weather in split windows/backdrop gutters, depth, static grade, covered plates as playOn='never'; L05 path verified in code; marks drive depth lines).

NOTES: not run in a browser. lib/page.ts: optuna cue 1 weather 'chalk'; beyond depth + weather 'fireflies'. Deviation: depth DEFAULT on the about exit frame only on ALT (iconic-pearl has the live L01 loop). cue.grade = a static multiply layer fading in with progress (beyond ends rgb(193 179 150)) — taste call for P3-11. Backdrop weather only in the outer gutters (~64 px at 1440). The plates-live probe needs --timeout=240000; W3 hosts show as deadOther until then.
