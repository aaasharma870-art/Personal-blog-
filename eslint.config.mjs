import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Motion's useReducedMotion reads the OS preference on the client's first
// render, so any tree that branches on it fails hydration (React #418)
// under prefers-reduced-motion. lib/flags.ts has the hydration-safe one.
const MOTION_PATHS = [
  {
    name: "motion/react",
    importNames: ["useReducedMotion"],
    message: "Import useReducedMotion from \"@/lib/flags\" (hydration-safe) instead.",
  },
];

// PHASE3-PLAN §4.2 / spec §3.1: GSAP and Lenis load lazily (ladder step 1/2),
// never in the first-load bundle. Type-only imports are fine anywhere.
const SCROLL_LIB_PATTERNS = [
  {
    // A regex, not a gitignore-style group: the group form `gsap` also
    // matched "@/lib/gsap" and "./gsap" (the lazy wrapper itself).
    regex: "^(gsap|lenis)(/.*)?$|^@gsap/react$",
    allowTypeImports: true,
    message:
      "GSAP / Lenis load lazily: use loadGsap() or useScrollScene() (lib/gsap.ts, lib/use-scroll-scene.ts) and lib/smooth-scroll.ts. Only lib/gsap.ts and components/providers/smooth-scroll-impl.tsx import them.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": ["error", { paths: MOTION_PATHS, patterns: SCROLL_LIB_PATTERNS }],
      // PHASE3-PLAN §4.2: idle work goes through lib/idle.ts (rIC →
      // scheduler.postTask → setTimeout; Safari has no requestIdleCallback).
      "no-restricted-globals": ["error", "requestIdleCallback"],
    },
  },
  // The only two files that may import GSAP / Lenis at runtime (the rest use
  // loadGsap(), useScrollScene() and the lib/smooth-scroll.ts API).
  {
    files: ["lib/gsap.ts", "components/providers/smooth-scroll-impl.tsx"],
    rules: {
      "no-restricted-imports": ["error", { paths: MOTION_PATHS }],
    },
  },
  // The one file that wraps requestIdleCallback.
  {
    files: ["lib/idle.ts"],
    rules: {
      "no-restricted-globals": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local agent tooling (skills, stale worktrees): never part of the app,
    // excluded from git via .git/info/exclude.
    ".claude/**",
    // Capture harness (CommonJS Node scripts for frame captures), not app code.
    "tools/**",
    // Build-process evidence (QA probes, workflow scripts): removed before main.
    "docs/build/**",
  ]),
]);

export default eslintConfig;
