// tools/capture/probes/decoder.mjs: one decoder at a time: StageVideo, loops, the intro (DecoderLock).
// Owner: B1-STAGE (PHASE3-PLAN §4.7; spec §3.2 "One decoder", §13 P3-2 #5).
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`.
//
// Samples the page every `--every=100` ms and counts the <video> elements that are decoding
// (src set, not paused, not ended, readyState ≥ 2), with the DecoderLock holder
// (window.__decoderHolder) and whether a stage crossfade is running (two layers of one
// container both partly opaque):
//   run "intro"  `/` on a first visit (the prologue arms): the flight → the hero loop hand-off
//                (L05 → IN-02 in the spec's terms), for `--intro-ms=9000`;
//   run "scroll" `/?skip=intro` wheel-scrolled top → bottom (`--notch=240` px every
//                `--pace=120` ms; Lenis on where it runs) through every stage cue, own section
//                and the films screens.
// pass = ≤ 1 decoding video at every sample of both runs, and 0 stage videos decoding
// during any stage crossfade. Headless Chromium builds without H.264 cannot play the MP4s
// (`codecs` in the result): then only WebM twins can decode and the run is a weaker check.

function sampler() {
  const layers = [...document.querySelectorAll(".stage-layer")];
  const byParent = new Map();
  for (const l of layers) {
    const o = Number(getComputedStyle(l).opacity);
    const list = byParent.get(l.parentElement) ?? [];
    list.push(o);
    byParent.set(l.parentElement, list);
  }
  const crossfade = [...byParent.values()].some((os) => os.filter((o) => o > 0.02 && o < 0.98).length > 0 && os.length > 1);
  const decoding = [...document.querySelectorAll("video")].filter(
    (v) => (v.currentSrc || v.getAttribute("src")) && !v.paused && !v.ended && v.readyState >= 2,
  );
  return {
    y: Math.round(scrollY),
    t: Math.round(performance.now()),
    playing: decoding.length,
    stage: decoding.some((v) => v.hasAttribute("data-stage-video")),
    who: decoding.map((v) => {
      if (v.hasAttribute("data-stage-video")) return "stage";
      const section = v.closest("[data-section]")?.getAttribute("data-section");
      if (section) return section;
      return v.closest("#intro, [data-intro]") ? "intro" : "other";
    }),
    holder: window.__decoderHolder ?? null,
    crossfade,
  };
}

async function sampleWhile(page, every, until) {
  const samples = [];
  const done = { v: false };
  const loop = (async () => {
    while (!done.v) {
      samples.push(await page.evaluate(sampler).catch(() => null));
      await page.waitForTimeout(every);
    }
  })();
  await until();
  done.v = true;
  await loop;
  return samples.filter(Boolean);
}

function summarise(samples) {
  const over = samples.filter((s) => s.playing > 1);
  const fade = samples.filter((s) => s.crossfade && s.stage);
  return {
    samples: samples.length,
    maxPlaying: samples.reduce((m, s) => Math.max(m, s.playing), 0),
    everPlayed: [...new Set(samples.flatMap((s) => s.who))],
    holders: [...new Set(samples.map((s) => s.holder).filter(Boolean))],
    crossfadeSamples: samples.filter((s) => s.crossfade).length,
    overOne: over.slice(0, 10),
    stageDuringCrossfade: fade.slice(0, 10),
    ok: over.length === 0 && fade.length === 0,
  };
}

export default async function probe(page, ctx) {
  const every = Number(ctx.args.every ?? 100);
  const introMs = Number(ctx.args["intro-ms"] ?? 9000);
  const notch = Number(ctx.args.notch ?? 240);
  const pace = Number(ctx.args.pace ?? 120);

  // run 1: the intro on a first visit
  await ctx.goto("/", { waitUntil: "domcontentloaded" });
  const codecs = await page.evaluate(() => {
    const v = document.createElement("video");
    return { mp4: v.canPlayType('video/mp4; codecs="avc1.640028"'), webm: v.canPlayType('video/webm; codecs="vp9"') };
  });
  const intro = summarise(await sampleWhile(page, every, () => page.waitForTimeout(introMs)));

  // run 2: a full wheel scroll with the intro skipped
  const p2 = await ctx.newPage();
  await p2.goto(ctx.url("/?skip=intro"), { waitUntil: "load" });
  await p2.waitForTimeout(2000);
  await p2.mouse.move(ctx.vw.width / 2, ctx.vw.height / 2);
  const scroll = summarise(
    await sampleWhile(p2, every, async () => {
      let last = -1;
      let still = 0;
      while (still < 6) {
        await p2.mouse.wheel(0, notch);
        await p2.waitForTimeout(pace);
        const y = await p2.evaluate(() => Math.round(scrollY));
        still = y === last ? still + 1 : 0;
        last = y;
      }
      await p2.waitForTimeout(1000);
    }),
  );

  return { pass: intro.ok && scroll.ok, codecs, intro, scroll };
}
