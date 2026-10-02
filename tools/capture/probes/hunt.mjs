// tools/capture/probes/hunt.mjs: the 12-egg hunt: chip, spells, palette, panel, 12/12, post-credits (P3-8).
// Owner: W2-HUNT (PHASE3-PLAN §4.7). Run by tools/capture/p3-probes.mjs (`--only=hunt`).
// Needs a DESKTOP_FINE context (the default 1440x900 desktop viewport) and a build whose
// proposed copy renders (film.branchPreview on this branch).
//
//   ssr          the server HTML carries the chip with "–/12" (no count before hydration)
//   hydrate      a fresh visit shows "0/12" after hydration, no hydration error in the console
//   width        the chip's count box is as wide at "–/12"/"0/12" as at "12/12" (no shift)
//   typed        typing "parley" counts pc-parley once (twice typed = still 1), the chip ticks,
//                the toast reads "Egg 1 of 12 · …" in the stage's toast layer
//   game         with html[data-game] set, a typed spell does nothing (B9)
//   pause        two Pause presses: no count, no toast, no veil, no bloom (P3-8 #3)
//   lumos        paused → typed "lumos": motion resumes, the wand bloom shows, hp-lumos counts
//   browse       the palette's empty query lists no spell; "solemn" / "lumos" / "parley" / "aal"
//                surface their commands; the Play group is listed
//   sync         a find written by another tab updates this tab's chip (storage event)
//   obliviate    Obliviate keeps the count
//   eggsoff      "Turn off easter eggs" hides the chip and keeps the count; on again shows it
//   panel        the chip opens the panel (12 slots), Esc closes it and focus returns to the chip
//   hotspot      an injected <EggHotspot> markup counts on click once the enhancer binds it; a hold
//                hotspot ignores a short click and counts on a 700 ms press
//   reset        the palette's "Reset the egg hunt" (confirm accepted) clears the count
//   complete     at 11 found, the 12th (palette "aal") turns the chip gold, toasts 12 / 12 and
//                adds the 12 THE HUNT credit rows (SEEKER steps aside)
//   tail         the 60vh tail; ≥ 50 % in view for 1 s plays the scene once (extended at 12/12)
//                and not again this session
//   phone        390×844 touch: no chip, no tail
// Under --rm only: rm (the chip shows, no tail; typed "lumos" toasts the OS line, no bloom, counts).

const KEY = "aryan:hunt:v1";
const ALL = ["hp-map", "hp-lumos", "hp-snitch", "pc-parley", "pc-coin", "pc-kraken", "3i-aal", "3i-quad", "3i-pen", "rd-eagle", "rd-bone", "rd-fire"];

export default async function probe(page, ctx) {
  const checks = {};
  const set = (name, pass, detail = {}) => (checks[name] = { pass: Boolean(pass), ...detail });
  const sleep = ctx.sleep;
  const found = () => page.evaluate((k) => Object.keys(JSON.parse(localStorage.getItem(k) ?? "null")?.found ?? {}), KEY);
  const chipText = () => page.evaluate(() => document.querySelector("[data-hunt-chip]")?.textContent?.trim() ?? null);
  const seed = (ids) =>
    page.evaluate(
      ([k, ids]) => localStorage.setItem(k, JSON.stringify({ v: 1, found: Object.fromEntries(ids.map((i) => [i, Date.now()])), rows: [] })),
      [KEY, ids],
    );
  const typeWord = async (w) => {
    await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
    await page.keyboard.type(w, { delay: 40 });
  };
  const fire = (id) => page.evaluate((id) => window.dispatchEvent(new CustomEvent("egg:trigger", { detail: { id } })), id);
  const waitToastsGone = () =>
    page.waitForFunction(() => !document.querySelector("[data-egg-toast]"), null, { timeout: 6000 }).catch(() => {});
  const run = async (name, fn) => {
    try {
      await fn();
    } catch (e) {
      set(name, false, { error: String(e?.message ?? e).split("\n")[0] });
    }
  };

  // server HTML
  await run("ssr", async () => {
    const res = await page.request.get(ctx.url("/?skip=intro"));
    const html = await res.text();
    const m = /data-hunt-chip[^>]*>(?:<[^>]+>)*([^<]*)</.exec(html);
    set("ssr", m && m[1].includes("–/12"), { text: m?.[1] ?? null });
  });

  if (ctx.rm) {
    await ctx.goto();
    await page.evaluate((k) => localStorage.removeItem(k), KEY);
    await ctx.goto();
    await sleep(800);
    await run("rm", async () => {
      const chip = await page.evaluate(() => {
        const w = document.querySelector(".hunt-chip-wrap");
        return w ? getComputedStyle(w).display : null;
      });
      const tail = await page.evaluate(() => document.querySelector(".post-credits")?.getBoundingClientRect().height ?? -1);
      await typeWord("lumos");
      await sleep(600);
      const toast = await page.evaluate(() => document.querySelector("[data-egg-toast]")?.textContent ?? "");
      const bloom = await page.evaluate(() => Boolean(document.querySelector("[data-wand-bloom]")));
      const veil = await page.evaluate(() => Boolean(document.querySelector(".lumos-veil")));
      const f = await found();
      set("rm", chip !== "none" && tail === 0 && /reduced motion/i.test(toast) && !bloom && !veil && f.includes("hp-lumos"), { chip, tail, toast, bloom, veil, found: f });
    });
    const pass = Object.values(checks).every((c) => c.pass);
    return { pass, checks };
  }

  // a fresh hunt
  await ctx.goto();
  await page.evaluate((k) => {
    localStorage.removeItem(k);
    sessionStorage.clear();
  }, KEY);
  await ctx.goto();
  await page.waitForFunction(() => window.__pageHydrated === true || document.readyState === "complete", null, { timeout: 15000 }).catch(() => {});
  await sleep(1200);

  await run("hydrate", async () => {
    const text = await chipText();
    set("hydrate", text === "0/12", { text });
  });

  await run("width", async () => {
    const w0 = await page.evaluate(() => document.querySelector(".hunt-chip-n")?.getBoundingClientRect().width ?? 0);
    await page.evaluate(() => {
      const n = document.querySelector(".hunt-chip-n");
      if (n) n.textContent = "12/12";
    });
    const w12 = await page.evaluate(() => document.querySelector(".hunt-chip-n")?.getBoundingClientRect().width ?? 0);
    await page.evaluate(() => {
      const n = document.querySelector(".hunt-chip-n");
      if (n) n.textContent = "0/12";
    });
    set("width", w0 > 0 && Math.abs(w0 - w12) <= 0.5, { w0, w12 });
  });

  await run("typed", async () => {
    await typeWord("parley");
    const tick = await page
      .waitForFunction(() => Boolean(document.querySelector(".hunt-chip-n[data-tick]")), null, { timeout: 1500 })
      .then(() => true, () => false);
    const toast = await page
      .waitForFunction(() => document.querySelector("[data-stage-layers='toast'] [data-hunt-toast]")?.textContent ?? "", null, { timeout: 3000 })
      .then((h) => h.jsonValue(), () => "");
    await sleep(300);
    await typeWord("parley");
    await sleep(500);
    const f = await found();
    set("typed", f.length === 1 && f[0] === "pc-parley" && /1 of 12/.test(String(toast)) && tick && (await chipText()) === "1/12", {
      found: f,
      toast,
      tick,
    });
  });

  await run("game", async () => {
    await page.evaluate(() => document.documentElement.setAttribute("data-game", "drone"));
    await typeWord("aalizzwell");
    await sleep(400);
    const f = await found();
    await page.evaluate(() => document.documentElement.removeAttribute("data-game"));
    set("game", !f.includes("3i-aal"), { found: f });
  });

  await run("pause", async () => {
    await waitToastsGone();
    const before = (await found()).length;
    const btn = page.locator("header [data-motion-toggle]").first();
    await btn.click();
    await sleep(250);
    const mid = await page.evaluate(() => ({
      toast: Boolean(document.querySelector("[data-egg-toast]")),
      veil: Boolean(document.querySelector(".lumos-veil")),
      bloom: Boolean(document.querySelector("[data-wand-bloom]")),
    }));
    await btn.click();
    await sleep(250);
    const after = await page.evaluate(() => ({
      toast: Boolean(document.querySelector("[data-egg-toast]")),
      veil: Boolean(document.querySelector(".lumos-veil")),
      bloom: Boolean(document.querySelector("[data-wand-bloom]")),
    }));
    const n = (await found()).length;
    set("pause", n === before && !mid.toast && !mid.veil && !mid.bloom && !after.toast && !after.veil && !after.bloom, { before, n, mid, after });
  });

  await run("lumos", async () => {
    await page.locator("header [data-motion-toggle]").first().click();
    await sleep(300);
    await typeWord("lumos");
    const bloom = await page
      .waitForFunction(() => Boolean(document.querySelector("header [data-wand-bloom]")), null, { timeout: 1500 })
      .then(() => true, () => false);
    await sleep(200);
    const running = await page.evaluate(() => document.querySelector("header [data-motion-toggle]")?.getAttribute("data-motion-toggle") === "running");
    const f = await found();
    set("lumos", bloom && running && f.includes("hp-lumos"), { bloom, running, found: f });
  });

  await run("browse", async () => {
    await waitToastsGone();
    await page.keyboard.press("Control+k");
    await page.waitForSelector("#cmd-list", { timeout: 3000 });
    const ids = () => page.evaluate(() => [...document.querySelectorAll("#cmd-list [role=option]")].map((o) => o.id));
    const empty = await ids();
    const q = async (s) => {
      await page.fill("input[role=combobox]", s);
      await sleep(80);
      return ids();
    };
    const solemn = await q("solemn");
    const lumos = await q("lumos");
    const parley = await q("parley");
    const aal = await q("aal");
    const map = await q("map");
    await page.keyboard.press("Escape");
    const spells = ["cmd-egg-map", "cmd-egg-lumos", "cmd-egg-nox", "cmd-egg-parley", "cmd-egg-aal"];
    set(
      "browse",
      !empty.some((i) => spells.includes(i)) &&
        solemn.includes("cmd-egg-map") &&
        lumos.includes("cmd-egg-lumos") &&
        parley.includes("cmd-egg-parley") &&
        aal.includes("cmd-egg-aal") &&
        !map.includes("cmd-egg-map") &&
        empty.some((i) => i.startsWith("cmd-play-")),
      { empty: empty.filter((i) => i.startsWith("cmd-egg") || i.startsWith("cmd-play")), solemn, lumos, map },
    );
  });

  await run("sync", async () => {
    const other = await page.context().newPage();
    await other.goto(ctx.url(), { waitUntil: "load" });
    await other.evaluate((k) => {
      const s = JSON.parse(localStorage.getItem(k) ?? '{"v":1,"found":{},"rows":[]}');
      s.found["rd-bone"] = Date.now();
      localStorage.setItem(k, JSON.stringify(s));
    }, KEY);
    await other.close();
    await sleep(400);
    const n = (await found()).length;
    set("sync", (await chipText()) === `${n}/12` && (await found()).includes("rd-bone"), { chip: await chipText(), n });
  });

  await run("obliviate", async () => {
    const before = (await found()).length;
    await fire("accio-obliviate");
    await sleep(400);
    set("obliviate", (await found()).length === before && (await chipText()) === `${before}/12`, { before });
  });

  await run("eggsoff", async () => {
    const before = (await found()).length;
    await fire("eggs-off");
    await sleep(400);
    const gone = (await chipText()) === null;
    await fire("eggs-on");
    await sleep(400);
    set("eggsoff", gone && (await chipText()) === `${before}/12` && (await found()).length === before, { gone });
  });

  await run("panel", async () => {
    await waitToastsGone();
    await page.locator("[data-hunt-chip]").click();
    await page.waitForSelector("[data-hunt-panel]", { timeout: 3000 });
    const slots = await page.evaluate(() => document.querySelectorAll("[data-hunt-panel] [data-hunt-slot]").length);
    const expanded = await page.evaluate(() => document.querySelector("[data-hunt-chip]")?.getAttribute("aria-expanded"));
    await page.keyboard.press("Escape");
    await sleep(150);
    const closed = await page.evaluate(() => !document.querySelector("[data-hunt-panel]"));
    const focus = await page.evaluate(() => document.activeElement?.hasAttribute("data-hunt-chip") ?? false);
    set("panel", slots === 12 && expanded === "true" && closed && focus, { slots, expanded, closed, focus });
  });

  await run("hotspot", async () => {
    await page.evaluate(() => {
      const mk = (hunt, egg, hold) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "egg-hotspot";
        b.dataset.eggHotspot = hunt;
        b.dataset.egg = egg;
        if (hold) b.dataset.eggHold = "600";
        b.textContent = hunt;
        b.style.cssText = "position:fixed;left:40px;top:" + (hold ? 260 : 200) + "px;z-index:99;width:48px;height:48px";
        document.body.appendChild(b);
      };
      mk("rd-eagle", "eagle-eye", false);
      mk("3i-aal", "aal-izz-well", true);
    });
    // the enhancer binds at ladder step 2: click until the find lands (≤ 10 s)
    let bound = false;
    for (let i = 0; i < 20 && !bound; i++) {
      await page.locator("button[data-egg-hotspot='rd-eagle']").click();
      await sleep(500);
      bound = (await found()).includes("rd-eagle");
    }
    const hold = page.locator("button[data-egg-hotspot='3i-aal']");
    await hold.click();
    await sleep(300);
    const short = (await found()).includes("3i-aal");
    const box = await hold.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await sleep(750);
      await page.mouse.up();
    }
    await sleep(300);
    const long = (await found()).includes("3i-aal");
    await page.evaluate(() => document.querySelectorAll("body > button[data-egg-hotspot]").forEach((b) => b.remove()));
    set("hotspot", bound && !short && long, { bound, short, long });
  });

  await run("reset", async () => {
    await waitToastsGone();
    page.once("dialog", (d) => void d.accept());
    await page.keyboard.press("Control+k");
    await page.waitForSelector("#cmd-play-reset", { timeout: 3000 });
    await page.click("#cmd-play-reset");
    await sleep(600);
    set("reset", (await found()).length === 0 && (await chipText()) === "0/12");
  });

  await run("complete", async () => {
    await seed(ALL.filter((i) => i !== "3i-aal"));
    await ctx.goto();
    await sleep(1500);
    await page.keyboard.press("Control+k");
    await page.fill("input[role=combobox]", "aal");
    await page.waitForSelector("#cmd-egg-aal", { timeout: 3000 });
    await page.click("#cmd-egg-aal");
    const done = await page
      .waitForFunction(() => Boolean(document.querySelector("[data-hunt-toast='complete']")), null, { timeout: 4000 })
      .then(() => true, () => false);
    await sleep(800);
    const r = await page.evaluate(() => ({
      gold: document.querySelector("[data-hunt-chip]")?.hasAttribute("data-complete") ?? false,
      rows: document.querySelectorAll("[data-credits-row^='hunt-']").length,
      seeker: Boolean(document.querySelector("[data-credits-row='seeker']")),
    }));
    set("complete", done && r.gold && r.rows === 12 && !r.seeker && (await chipText()) === "12/12", { done, ...r });
  });

  await run("tail", async () => {
    const h = await page.evaluate(() => {
      const t = document.querySelector(".post-credits");
      return t ? t.getBoundingClientRect().height / innerHeight : 0;
    });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const played = await page
      .waitForFunction(() => Boolean(document.querySelector("[data-pc-scene]")), null, { timeout: 5000 })
      .then(() => true, () => false);
    const extended = await page.evaluate(() => document.querySelector("[data-pc-scene]")?.hasAttribute("data-extended") ?? false);
    await page.screenshot({ path: ctx.file("tail.png") }).catch(() => {});
    await ctx.goto();
    await sleep(1000);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await sleep(2200);
    const again = await page.evaluate(() => Boolean(document.querySelector("[data-pc-scene]")));
    set("tail", Math.abs(h - 0.6) < 0.02 && played && extended && !again, { h, played, extended, again });
  });

  await run("phone", async () => {
    const p = await ctx.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await p.goto(ctx.url(), { waitUntil: "load" });
    await sleep(800);
    const r = await p.evaluate(() => ({
      chip: (() => {
        const w = document.querySelector(".hunt-chip-wrap");
        return w ? getComputedStyle(w).display : "absent";
      })(),
      tail: document.querySelector(".post-credits")?.getBoundingClientRect().height ?? -1,
    }));
    set("phone", (r.chip === "none" || r.chip === "absent") && r.tail === 0, r);
  });

  // leave the browser profile clean
  await page.evaluate((k) => localStorage.removeItem(k), KEY).catch(() => {});
  const pass = Object.values(checks).every((c) => c.pass);
  return { pass, checks };
}
