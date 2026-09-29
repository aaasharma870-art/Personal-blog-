/* ============================================================================
   The code-flight broom (IC-HP-04): our own SVG of the same real-looking,
   RIDERLESS broom as the IN-01 plate — a hand-carved dark handle with a
   gentle curve and a tip knob, a cord binding, a bound birch-twig tail with
   a lit top, a shadowed underside and a ragged bristle end.
   No lettering, no marks, no figure (H1/H2). 58 path nodes (budget ≤ 60).

   Local geometry (the controller relies on it): the handle TIP is at (0, 0),
   the tail END at (1000, 0), the balance point at (500, 0). The markup is a
   STRING because it is injected as the controller-owned innerHTML of
   #intro-stage (React never hydrates inside it, so the vanilla controller can
   add the canvas and video there at any time without a hydration mismatch).
   ========================================================================== */

export const BROOM_SVG = `<div class="intro-broom" aria-hidden="true"><svg viewBox="0 -100 1000 200" width="1000" height="200" focusable="false"><defs><linearGradient id="ib-wood" gradientUnits="userSpaceOnUse" x1="0" y1="-15" x2="0" y2="12"><stop offset="0" stop-color="#5a3d27"/><stop offset=".45" stop-color="#3b2718"/><stop offset="1" stop-color="#1c120a"/></linearGradient><linearGradient id="ib-twig" gradientUnits="userSpaceOnUse" x1="0" y1="-40" x2="0" y2="84"><stop offset="0" stop-color="#422a16"/><stop offset=".3" stop-color="#58391f"/><stop offset=".72" stop-color="#301e0e"/><stop offset="1" stop-color="#160e07"/></linearGradient></defs><path fill="url(#ib-twig)" d="M606 -14C700 -22 840 -34 948 -40L1004 -36L988 -26L1008 -16L990 -6L1010 4L990 14L1006 26L984 36L996 50L966 56L976 72L938 68L898 78C800 86 700 64 650 44C628 34 612 26 606 22Z"/><g fill="none" stroke-linecap="round"><path stroke="#94714c" stroke-opacity=".45" stroke-width="1.8" d="M612 -8C750 -20 880 -30 1000 -34M612 -2C760 -10 890 -16 1004 -18M612 6C760 4 890 2 1006 2M611 12C750 18 880 22 1002 22M609 18C720 34 840 44 990 46"/><path stroke="#1d1209" stroke-opacity=".55" stroke-width="2" d="M612 2C770 -4 890 -8 1002 -10M610 16C740 26 860 32 998 34"/></g><path fill="url(#ib-wood)" d="M-4 -5C2 -9 12 -8 22 -7C120 -10 230 -15 330 -14C420 -13 480 -7 540 -3L542 11C482 8 420 2 330 1C230 0 120 3 22 5C12 7 2 8 -4 5C-8 2 -8 -2 -4 -5Z"/><path fill="none" stroke="#cfe0f0" stroke-opacity=".38" stroke-width="1.6" d="M22 -6C120 -9 230 -14 330 -13C420 -12 480 -6 530 -3"/><path fill="#4a3826" d="M536 -8L606 -14L610 22L536 14Z"/><path fill="none" stroke="#3f2c1b" stroke-width="2.2" d="M548 -9V15M560 -10V16M572 -11V17M584 -12V18M596 -13V20"/></svg></div>`;
