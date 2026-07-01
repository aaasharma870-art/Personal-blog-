import { cn } from "@/lib/utils";

/** FNV-1a → uint32. charCodeAt returns a number, so no index-undefined risk. */
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG in [0,1) — hydration-safe (no Math.random at render). */
function mulberry32(seedInput: number): () => number {
  let a = seedInput >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * SignalThumb — an abstract, text-free aqua "signal" line seeded from a post
 * title. Decorative + aria-hidden; a deterministic placeholder for the Phase-5
 * Higgsfield thumbnail family. Never presents fabricated performance as real.
 */
export function SignalThumb({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const W = 400;
  const H = 225;
  const cols = 9;
  const rng = mulberry32(hashString(seed));

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < cols; i++) {
    const x = (W / (cols - 1)) * i;
    const y = 40 + rng() * (H - 80);
    pts.push({ x, y });
  }
  const first = pts[0] ?? { x: 0, y: H / 2 };
  const last = pts[pts.length - 1] ?? first;
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const gid = `sg-${hashString(seed)}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-aqua)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--color-aqua)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {[0.5, 0.78].map((f) => (
        <line
          key={f}
          x1="0"
          y1={H * f}
          x2={W}
          y2={H * f}
          stroke="var(--color-line)"
          strokeWidth="1"
        />
      ))}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last.x} cy={last.y} r="3.5" fill="var(--color-aqua-bright)" />
    </svg>
  );
}
