// Throttled Chromium launcher shared by ALL research scripts (capture.js + custom agent scripts).
// - Global semaphore: at most MAX_SLOTS browsers run at once across every process on this machine.
// - Runs this node process (and the browser it spawns) at BELOW_NORMAL priority so the user's apps stay responsive.
// Usage:  const { launch } = require('./browser');  const { browser, release } = await launch({ headless: true });
//         ... use browser ...;  await browser.close(); release();
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_SLOTS = 2;
const LOCK_DIR = path.join(__dirname, '.browser-locks');
fs.mkdirSync(LOCK_DIR, { recursive: true });
try { os.setPriority(0, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch {}
// Pin this process to ~40% of logical cores (top of the range); Windows children (Chromium + its
// SwiftShader software-WebGL threads) inherit the affinity, so research browsers can never saturate the CPU.
try {
  const n = os.cpus().length, use = Math.max(2, Math.floor(n * 0.4));
  let mask = 0n; for (let i = n - use; i < n; i++) mask |= 1n << BigInt(i);
  require('child_process').execSync(
    `powershell -NoProfile -Command "(Get-Process -Id ${process.pid}).ProcessorAffinity = [IntPtr]${mask.toString()}"`,
    { stdio: 'ignore', timeout: 15000 });
} catch {}

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

module.exports = { launch };
