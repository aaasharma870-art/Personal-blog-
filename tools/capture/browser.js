// Throttled Chromium launcher shared by ALL research scripts (capture.js + custom agent scripts).
// - Global semaphore: at most MAX_SLOTS browsers run at once across every process on this machine.
// - Runs this node process (and the browser it spawns) at BELOW_NORMAL priority so the user's apps stay responsive.
// Usage:  const { launch } = require('./browser');  const { browser, release } = await launch({ headless: true });
//         ... use browser ...;  await browser.close(); release();
//
// Phase 3 (B1-SCROLL): shared viewport helpers for motion.js / scenes.js / qa.js, so `--vw=<w>x<h>` and
// `--touch` mean the same thing everywhere:
//   parseViewport('1024x768')            -> { width: 1024, height: 768 }  (null when absent / malformed)
//   contextFor({ width, height, touch, reduced, js, dpr })
//                                        -> Playwright newContext() options. touch = a phone / tablet:
//                                           isMobile + hasTouch (pointer: coarse, hover: none) + a mobile UA
//                                           (iPhone below 640 px wide, iPad otherwise), so DESKTOP_FINE never
//                                           matches and Lenis / the stage / GL must stay off.
// Requiring this file for the helpers alone has no side effects: the lock dir, the process priority and the
// CPU affinity are set up by the first launch().
let chromium = null;
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_SLOTS = 2;
const LOCK_DIR = path.join(__dirname, '.browser-locks');

let prepared = false;
function prepare() {
  if (prepared) return;
  prepared = true;
  try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
  fs.mkdirSync(LOCK_DIR, { recursive: true });
  try { os.setPriority(0, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch {}
  // Pin this process to ~40% of logical cores (top of the range); Windows children (Chromium + its
  // SwiftShader software-WebGL threads) inherit the affinity, so research browsers can never saturate the CPU.
  if (process.platform === 'win32') {
    try {
      const n = os.cpus().length, use = Math.max(2, Math.floor(n * 0.4));
      let mask = 0n; for (let i = n - use; i < n; i++) mask |= 1n << BigInt(i);
      require('child_process').execSync(
        `powershell -NoProfile -Command "(Get-Process -Id ${process.pid}).ProcessorAffinity = [IntPtr]${mask.toString()}"`,
        { stdio: 'ignore', timeout: 15000 });
    } catch {}
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };

async function acquire() {
  let announced = false;
  for (;;) {
    for (let i = 0; i < MAX_SLOTS; i++) {
      const f = path.join(LOCK_DIR, `slot-${i}.lock`);
      try {
        fs.writeFileSync(f, String(process.pid), { flag: 'wx' });
        return f;
      } catch {
        // stale lock from a dead process -> reclaim
        try { const pid = Number(fs.readFileSync(f, 'utf8')); if (!alive(pid)) fs.unlinkSync(f); } catch {}
      }
    }
    if (!announced) { console.error('[browser.js] waiting for a free browser slot...'); announced = true; }
    await sleep(2000);
  }
}

const ARGS = ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist',
  '--autoplay-policy=no-user-gesture-required', '--renderer-process-limit=2', '--disable-extensions'];

async function launch(opts = {}) {
  prepare();
  const lock = await acquire();
  let released = false;
  const release = () => { if (!released) { released = true; try { fs.unlinkSync(lock); } catch {} } };
  process.on('exit', release);
  process.on('SIGINT', () => { release(); process.exit(130); });
  try {
    const browser = await chromium.launch({ headless: true, ...opts, args: [...ARGS, ...(opts.args || [])] });
    browser.on('disconnected', release);
    return { browser, release };
  } catch (e) { release(); throw e; }
}

// ---------------------------------------------------------------- viewport helpers (Phase 3)
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPAD_UA = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

/** '1440x900' -> { width: 1440, height: 900 }; null for anything else (missing flag, typo). */
function parseViewport(v) {
  const m = /^(\d{2,5})x(\d{2,5})$/.exec(String(v == null ? '' : v).trim());
  return m ? { width: Number(m[1]), height: Number(m[2]) } : null;
}

/** Playwright context options for a viewport. `touch` = a phone or tablet (see the header). */
function contextFor({ width, height, touch = false, reduced = false, js = true, dpr } = {}) {
  const o = {
    viewport: { width, height },
    deviceScaleFactor: dpr || 1,
    isMobile: !!touch,
    hasTouch: !!touch,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  };
  if (touch) o.userAgent = width < 640 ? IPHONE_UA : IPAD_UA;
  if (js === false) o.javaScriptEnabled = false;
  return o;
}

module.exports = { launch, parseViewport, contextFor, IPHONE_UA, IPAD_UA };
