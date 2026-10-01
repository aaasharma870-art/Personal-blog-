/* ============================================================================
   BOOT HEAD SCRIPT (spec §3.1–§3.2 "pre-paint boot script", plan §0.1 #7) —
   OWNER: B1-SCROLL.
   Rendered in <head> by app/layout.tsx on EVERY request, beside the
   prologue's IntroHeadScript (which keeps its own job). An inline script
   (< 400 B) that runs while the HTML is parsed, before the first paint:
   - adds `html.js`;
   - reads the Pause key lib/flags.ts persists (sessionStorage "motion" =
     "paused"; try/catch) and sets `html[data-motion-boot="paused"]`, which
     never changes mid-session;
   - installs the `[data-enhance-queue]` click recorder: a click on such an
     element before the desktop enhancer binds is pushed to
     `window.__enhanceQ` as { sel, t } (sel = the attribute's value, or the
     element's #id) and replayed by components/enhance/desktop-enhancer.ts,
     which then clears the queue (recording stops).
   So the `boot:` / `stage-live:` variants (app/globals.css) and
   bootGateOn() (lib/flags.ts) are right from the first paint, and no-JS
   visitors keep today's page. <html suppressHydrationWarning> (layout)
   covers the pre-paint attributes, as for the intro's classes.
   ========================================================================== */

const SOURCE =
  '(function(w,d){var r=d.documentElement,q=w.__enhanceQ=[],a="data-enhance-queue",p="paused";' +
  'r.classList.add("js");try{w.sessionStorage.getItem("motion")==p&&r.setAttribute("data-motion-boot",p)}catch(e){}' +
  'd.addEventListener("click",function(e){var t=e.target,n=t&&t.closest&&t.closest("["+a+"]");' +
  'n&&w.__enhanceQ==q&&q.push({sel:n.getAttribute(a)||"#"+n.id,t:Date.now()})},!0)})(window,document)';

export function BootHeadScript() {
  return <script id="p3-boot" dangerouslySetInnerHTML={{ __html: SOURCE }} />;
}
