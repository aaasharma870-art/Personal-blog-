/* ============================================================================
   CONTENT — single source of truth for all site copy.
   Sourced from CLAUDE.md (the content spec). Voice: first person, plain-spoken,
   process-driven, intellectually honest. No grades / scores / attendance /
   finances / sensitive personal narratives (see CLAUDE.md §2 exclusions).
   No fabricated metrics; figures here are the ones Aryan documented. The Option
   Alpha card carries its required honest framing (paper, small sample, short-vol).
   ========================================================================== */

export const site = {
  name: "Aryan Sharma",
  initials: "AS",
  role: "Quantitative Research & Engineering",
  location: "Washington, D.C.",
  identity: "Self-taught high-school quant · Landon School, Class of 2027",
  throughline:
    "I build quantitative systems, understand markets, and want the technical and business training to scale that.",
  heroLeadIn: "Quantitative research · Systems · Judgment",
  principleCapsule: "Models are instruments, not idols.",
  email: "aaasharma870@gmail.com",
  github: "https://github.com/aaasharma870-art",
  githubUser: "aaasharma870-art",
  domainNote: "aryansharma.dev", // EDITABLE PLACEHOLDER — register & confirm preferred domain
} as const;

export const nav = [
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Work", href: "#work" },
  { label: "Systems", href: "#systems" },
  { label: "Principles", href: "#principles" },
  { label: "Writing", href: "#writing" },
  { label: "Beyond", href: "#beyond" },
  { label: "Contact", href: "#contact" },
] as const;

/** Rotating micro-tags under the hero (rendered statically, not as a ticker). */
export const microTags = [
  "Quantitative research",
  "QuantConnect / LEAN",
  "Python",
  "Options & volatility",
  "Mandarin",
  "Distance running & wrestling",
] as const;

export const credibility = [
  "Quantitative research",
  "Trading-system validation",
  "Data pipelines",
  "Optimization",
  "Risk-aware engineering",
] as const;

export type Pillar = {
  index: string;
  title: string;
  body: string;
};

export const pillars: Pillar[] = [
  {
    index: "01",
    title: "Process over outcome",
    body: "I judge my work by the parts I control — preparation, discipline, honest effort — not by the scoreboard. It is an idea I borrow from the Bhagavad Gita: do your duty well, and hold the result loosely.",
  },
  {
    index: "02",
    title: "Intellectual honesty",
    body: "I treat every backtest as guilty until proven innocent. The work I am proudest of is not a winning strategy — it is the documented graveyard of my own ideas that did not survive testing.",
  },
  {
    index: "03",
    title: "A cross-cultural lens",
    body: "Six years of Mandarin and a childhood spent traveling taught me to question my assumptions and read a situation from more than one angle before acting on it.",
  },
  {
    index: "04",
    title: "An athlete's discipline",
    body: "Wrestling, distance running, and trading taught me the same lesson in three arenas: define the edge, manage the risk, and trust that small, repeated improvements compound.",
  },
];

export const about = {
  bio: "I'm Aryan Sharma, a high-school student in the Washington, D.C. area who builds and validates quantitative trading systems. I grew up watching my father trade and took away one lesson early: results are a byproduct of process — define your edge, manage your risk, and stay level-headed when the noise gets loud. I've spent the last few years turning that instinct into real work: algorithmic strategies on QuantConnect, a research pipeline that stress-tests ideas until most of them break, and a habit of documenting both what survived and what didn't.",
  bioSecond:
    "Away from the screen I run cross country, wrestle, study Mandarin, and shoot photography and drone film. The same temperament runs through all of it — and a quieter thread of moral philosophy runs underneath, shaping how I think about the systems I build.",
  philosophyNote:
    "I read moral philosophy and let it shape how I engineer. Mengzi taught me that judgment is cultivated, not innate. The Gita taught me to act with discipline and detach from the result. Mill keeps me weighing consequences and staying open to being wrong; Hegel frames engineering as the reconciliation of competing constraints; the Dhammapada treats a well-directed mind as a technical asset. None of it is decoration — it is why I care whether the systems I build are honest about their limits.",
};

/* ----------------------------------------------------------------------------
   The Journey — how the methodology was earned
   -------------------------------------------------------------------------- */
export type JourneyStep = {
  marker: string;
  title: string;
  body: string;
  /** Decorative abstract still (reused from public/media). Rendered aria-hidden
   *  with alt="" — atmosphere only, never a claim. DATA field, not copy. */
  image: string;
};

export const journey: JourneyStep[] = [
  {
    marker: "Origin",
    title: "Trading alongside my father",
    body: "Years of watching markets at home, then asking my own questions: what is the edge, where is the risk, and how do you stay process-focused when the screen is loud?",
    image: "/media/still-terminal.png",
  },
  {
    marker: "Early work",
    title: "Pine Script & 'Smart Money' patterns",
    body: "I started on TradingView, coding chart-pattern strategies that looked excellent in-sample — fair-value gaps, order blocks, liquidity sweeps. They were persuasive and, it turned out, mostly fitted to the past.",
    image: "/media/still-blueprint.png",
  },
  {
    marker: "The break",
    title: "They failed out-of-sample",
    body: "Tested properly on data they had never seen, the pretty backtests collapsed. That failure was the turning point: the hard problem was never finding patterns — it was telling a real edge from an artifact.",
    image: "/media/still-rays-img.png",
  },
  {
    marker: "Now",
    title: "A validation methodology of my own",
    body: "I rebuilt everything around a pre-registered, guilty-until-proven-innocent process on QuantConnect and a Python research pipeline — and a kill-list that treats a disciplined 'no' as the product.",
    image: "/media/still-network.png",
  },
];

/* ----------------------------------------------------------------------------
   The 7-part validation gauntlet (process, not fabricated data)
   -------------------------------------------------------------------------- */
export type GauntletStep = {
  n: string;
  title: string;
  body: string;
};

export const gauntlet: GauntletStep[] = [
  {
    n: "1",
    title: "Pre-registration",
    body: "Hypothesis, parameters, test windows, and pass/fail thresholds are committed to git before anything runs. The result stands; no re-optimization after the fact.",
  },
  {
    n: "2",
    title: "A blind holdout, spent once",
    body: "~18 months of recent data (Jan 2024–Jun 2025) is locked away during all tuning. The frozen rule is run on it exactly once, no retuning. This gate killed most ideas.",
  },
  {
    n: "3",
    title: "Deflated Sharpe Ratio",
    body: "Every Sharpe is penalized for multiple testing (470 cumulative trials) plus skew and fat tails — Bailey & López de Prado (2014).",
  },
  {
    n: "4",
    title: "Combinatorial Purged CV",
    body: "15 train/test path combinations across 6 folds, trades purged around boundaries, judged on median and worst-case path Sharpe.",
  },
  {
    n: "5",
    title: "A mandatory cost model",
    body: "Per-contract round-trip costs plus 2-tick slippage (≈ $28 ES / $53 NQ / $4.5 MES / $3.5 MNQ). Zero-cost runs are banned — which is why I trade micros.",
  },
  {
    n: "6",
    title: "Leak / look-ahead audits",
    body: "Signals are decided on bar T's close and executed at bar T+1's open via a custom fill model. Every trade logs its signal date against its fill date.",
  },
  {
    n: "7",
    title: "Kill what fails — keep the post-mortem",
    body: "Failed strategies are never retuned. Each ships a written post-mortem. The kill-list is treated as the real output of the research.",
  },
];

/* ----------------------------------------------------------------------------
   Projects
   -------------------------------------------------------------------------- */
export type Metric = {
  label: string;
  value: string;
  note?: string;
  /** Animate as a count-up. Reserved for neutral magnitude counts — never for
   *  risk-adjusted ratios (Sharpe/PSR/PF), which the site asks readers to treat
   *  soberly, so those render statically. */
  count?: boolean;
};

export type Project = {
  id: string;
  repo: string;
  name: string;
  status: string;
  accent: "gold" | "cyan";
  summary: string;
  problem: string;
  approach: string[];
  stack: string[];
  metrics: Metric[];
  learned: string;
  limitations: string;
  href: string;
  /** Abstract, text-free Higgsfield cover art (media/data field, filled in
   *  Phase 5). Decorative only — never a claim or a real figure. */
  cover?: string;
};

export const featuredProjects: Project[] = [
  {
    id: "trading-algos",
    repo: "Trading_Algos-",
    name: "Quantitative Trading Research",
    status: "Flagship · active",
    accent: "gold",
    summary:
      "Research into whether systematic edges in S&P 500 (ES) and Nasdaq-100 (NQ) futures are real — plus a validation process built to tell a genuine edge from a pretty backtest.",
    problem:
      "Random noise generates thousands of beautiful backtests. The hard part isn't finding patterns; it's proving one is real and not an artifact of the data you tuned on.",
    approach: [
      "A 7-part validation gauntlet documented in METHODOLOGY.md (pre-registration, a blind holdout spent once, Deflated Sharpe, Combinatorial Purged CV, a realistic cost model, look-ahead audits, and a kill-list).",
      "Signals decided on the close, executed on the next open, with every trade logging signal-date vs. fill-date.",
      "Three strategies survived the full process; far more were killed and given written post-mortems.",
    ],
    stack: ["QuantConnect / LEAN", "Python", "Pine Script (early work)", "ES / NQ micro futures"],
    metrics: [
      { label: "Validated survivors", value: "3", note: "of many more tested", count: true },
      { label: "Blind-test Sharpe", value: "+1.19", note: "Volatility Breakout, one-shot" },
      { label: "Cumulative trials penalized", value: "470", note: "via Deflated Sharpe", count: true },
    ],
    learned:
      "Tuning to a backtest usually enlarges your future loss. A documented 'no' protects capital better than another optimistic 'yes'.",
    limitations:
      "The Volatility Breakout's deflated Sharpe sits below my own threshold — its case rests on surviving the blind test, not on clearing every gate. I say so in the repo.",
    href: "https://github.com/aaasharma870-art/Trading_Algos-",
    cover: "/media/cover-trading-algos.webp",
  },
  {
    id: "optuna-screener",
    repo: "Optuna-Screener",
    name: "Automated Strategy Research Pipeline",
    status: "Flagship · 161 files",
    accent: "gold",
    summary:
      "A Python pipeline that discovers, optimizes, and validates strategies on real market data and answers one question honestly: does this work on data it has never seen?",
    problem:
      "Optimization is the easy part and the dangerous part. A search powerful enough to find an edge is powerful enough to fit noise — so the pipeline is built around the holdout, not the optimizer.",
    approach: [
      "Strategy-file mode: drop in any strategy with entry/exit functions; it computes indicators, optimizes tunable params with walk-forward, stress-tests, and reports on a 25% holdout the optimizer never touched.",
      "Discovery mode: describe a concept in plain English and it searches thousands of indicator / exit / regime combinations.",
      "v3.0 ensemble: 6 structurally distinct strategies combined by risk-parity weighting under a volatility-regime overlay, validated through per-strategy CPCV, portfolio-level CPCV, and walk-forward weighting.",
    ],
    stack: ["Python 3.11+", "Optuna (TPE)", "Pandas / NumPy", "Polygon.io API", "Plotly", "MIT-licensed"],
    metrics: [
      { label: "Monte-Carlo shuffles", value: "3,000+", note: "trade-sequence resampling", count: true },
      { label: "Out-of-sample holdout", value: "25%", note: "optimizer never sees it", count: true },
      { label: "Target CPCV Sharpe", value: "1.0–1.5", note: "anything > 2.0 is a red flag" },
    ],
    learned:
      "A research tool should make it easy to disprove yourself. The honest headline number comes from the data the search was forbidden to touch.",
    limitations:
      "It is a research and screening tool, not a turnkey trading system — surviving the pipeline earns a candidate a paper deployment, nothing more.",
    href: "https://github.com/aaasharma870-art/Optuna-Screener",
    cover: "/media/cover-optuna.webp",
  },
];

/** The three strategies that survived the gauntlet (real, documented figures). */
export type Survivor = {
  name: string;
  thesis: string;
  evidence: string;
  status: string;
};

export const survivors: Survivor[] = [
  {
    name: "Volatility Breakout",
    thesis: "A mid-morning squeeze precedes a move that keeps going.",
    evidence: "Blind-test Sharpe +1.19 (one-shot; in-sample +1.42).",
    status: "Deployed — paper / live, micro futures",
  },
  {
    name: "VIX-Backwardation Mean-Reversion",
    thesis: "Get paid to be the calm counterparty when traders panic-buy crash insurance.",
    evidence: "Pre-registered holdout PASS · profit factor 2.0–2.5 OOS · PSR 0.92.",
    status: "Candidate → paper",
  },
  {
    name: "Regime-Gated Intraday Momentum",
    thesis: "Option-dealer hedging amplifies the day's trend.",
    evidence: "OOS Sharpe 1.13 · profitable 9 of 9 years · 100% positive CV paths.",
    status: "Candidate → paper",
  },
];

/** The kill-list — the differentiator. Each is a rejected idea with a reason. */
export type Killed = { name: string; reason: string };

export const killList: Killed[] = [
  { name: "Dealer-gamma (GEX) router", reason: "Untradeable net of costs." },
  { name: "Intraday momentum-continuation", reason: "t-stat was an overlap artifact." },
  { name: "VIX-basis deviation alpha", reason: "Real in-sample; decayed out-of-sample." },
  { name: "VIX3M directional", reason: "Beta-confounded; not a standalone edge." },
  { name: "Smart-Money patterns (FVG, order blocks, sweeps)", reason: "Filled at roughly chance." },
];

/** Option Alpha — the origin story, with required honest framing. */
export const optionAlpha = {
  repo: "algorithmic-options-trading-system",
  name: "Automated 0DTE Options Bots",
  tag: "Where the discipline started",
  summary:
    "Automated 0DTE options strategies on SPY / QQQ / SPX, built on the Option Alpha no-code platform and run on a $125K paper portfolio. Three bots, with VIX filters, entry windows, position caps, and a mandatory time-exit.",
  reported:
    "Reported paper results (Feb 2026): about +$16,000 (≈ +12.8% on the paper account) across 118 closed trades, with under 3% max drawdown.",
  honest:
    "I include this on purpose, framed honestly. These are paper, small-sample numbers with the signature of a short-volatility profile — the kind of result that looks perfect right up until a tail event erases it. It is not a proven edge. It is the experiment that taught me about tail risk and overfitting, and it is exactly why I built the guilty-until-proven-innocent methodology behind everything above.",
  href: "https://github.com/aaasharma870-art/algorithmic-options-trading-system",
} as const;

export type Supporting = {
  repo: string;
  blurb: string;
  href: string;
};

export const supportingProjects: Supporting[] = [
  {
    repo: "Hedge-fund",
    blurb:
      "A Dockerized, tested Python project exploring an automated, multi-agent 'AI hedge fund' workflow. Where it builds on an open-source framework, attribution belongs in the write-up.",
    href: "https://github.com/aaasharma870-art/Hedge-fund",
  },
  {
    repo: "Data-Scraper",
    blurb:
      "An 82-file Python data pipeline on a clean adapter pattern (Apify, CSV) with scheduled runs and a weekly email digest — a straightforward data-engineering example.",
    href: "https://github.com/aaasharma870-art/Data-Scraper",
  },
  {
    repo: "Options-claw",
    blurb:
      "A tiered automation tool for options workflows: webhooks, then Playwright browser automation, then computer-use — escalating only as far as a task requires.",
    href: "https://github.com/aaasharma870-art/Options-claw",
  },
  {
    repo: "Content-automation-engine",
    blurb:
      "A social-media content-automation system with real infrastructure — Grafana, a database, migrations. The architecture is the point, not the file count.",
    href: "https://github.com/aaasharma870-art/Content-automation-engine",
  },
];

/** Earlier / idea-stage repos, listed honestly rather than dressed up. */
export const earlierRepos: Supporting[] = [
  {
    repo: "Options-plan-",
    blurb: "Options research and planning, with code — earlier work.",
    href: "https://github.com/aaasharma870-art/Options-plan-",
  },
  {
    repo: "-ai-vids",
    blurb: "A concept for AI-assisted short-form video automation — idea stage.",
    href: "https://github.com/aaasharma870-art/-ai-vids",
  },
];

/* ----------------------------------------------------------------------------
   Capabilities — a structured matrix, not a skills cloud
   -------------------------------------------------------------------------- */
export type CapabilityRow = {
  area: string;
  methods: string;
  tools: string;
  outputs: string;
};

export const capabilities: CapabilityRow[] = [
  {
    area: "Research",
    methods: "Walk-forward, Combinatorial Purged CV, Deflated Sharpe / PSR, Monte Carlo, pre-registration",
    tools: "QuantConnect / LEAN, Optuna (TPE)",
    outputs: "Validated edges, post-mortems, a kill-list",
  },
  {
    area: "Markets",
    methods: "Options & volatility, VIX term structure, variance risk premium, dealer gamma, regime modeling",
    tools: "Black-Scholes & the Greeks, futures (ES / NQ + micros)",
    outputs: "Strategy theses with stated risk",
  },
  {
    area: "Engineering",
    methods: "Adapter-pattern pipelines, agentic / automation workflows, look-ahead audits",
    tools: "Python, Pandas / NumPy, Git, Docker, Playwright",
    outputs: "Reproducible research infrastructure",
  },
  {
    area: "Evaluation",
    methods: "Realistic transaction-cost modeling, robustness & stress injection, correlation filtering",
    tools: "Custom fill models, Plotly reporting",
    outputs: "Honest, holdout-based numbers",
  },
  {
    area: "Languages",
    methods: "Self-directed learning, documentation discipline",
    tools: "Python, Pine Script · English, Mandarin (6 yrs, advanced)",
    outputs: "Work a stranger can read and trust",
  },
];

/* ----------------------------------------------------------------------------
   Operating principles (the quiet philosophical layer)
   -------------------------------------------------------------------------- */
export type Principle = {
  n: string;
  title: string;
  body: string;
  thinker?: string;
};

export const principles: Principle[] = [
  {
    n: "01",
    title: "Cultivate judgment",
    body: "Good judgment is trained, not issued at birth. I treat skill and temperament like mileage or lifts — built slowly, on purpose.",
    thinker: "after Mengzi",
  },
  {
    n: "02",
    title: "Act, then release the result",
    body: "Do the work well and hold the outcome loosely. The scoreboard is feedback, not a verdict on the process that produced it.",
    thinker: "after the Bhagavad Gita",
  },
  {
    n: "03",
    title: "Weigh the consequences",
    body: "Systems that touch people carry downstream effects. Risk is partly a moral category — and staying open to being wrong is part of the design.",
    thinker: "after J. S. Mill",
  },
  {
    n: "04",
    title: "Synthesize the constraints",
    body: "Engineering is the reconciliation of competing demands — speed against cost, ambition against honesty. Progress comes through that tension, not around it.",
    thinker: "after Hegel",
  },
  {
    n: "05",
    title: "Attend carefully",
    body: "A disciplined, well-directed mind is a technical asset. Most failures I have seen were failures of attention before they were failures of math.",
    thinker: "after the Dhammapada",
  },
];

/* ----------------------------------------------------------------------------
   Writing — seeded, clearly-marked drafts
   -------------------------------------------------------------------------- */
export type Post = { title: string; angle: string; tag: string };

export const writing: Post[] = [
  {
    title: "How I try not to fool myself",
    angle: "A plain-English tour of the seven-part validation gauntlet, for people who don't trade.",
    tag: "Methodology",
  },
  {
    title: "The kill-list",
    angle: "The ideas I researched and rejected — and why an honest 'no' protects capital.",
    tag: "Research",
  },
  {
    title: "From Pine Script to a real pipeline",
    angle: "The turning point: when my in-sample winners failed out-of-sample.",
    tag: "Origins",
  },
  {
    title: "What wrestling and cross country taught me about trading",
    angle: "Process, risk, and the slow compounding of small gains.",
    tag: "Discipline",
  },
  {
    title: "Mandarin and global markets",
    angle: "Connecting language and culture to how financial systems actually behave.",
    tag: "Cross-cultural",
  },
];

/* ----------------------------------------------------------------------------
   Beyond the screen — athletics / activities / community / creative
   -------------------------------------------------------------------------- */
export type BeyondBlock = {
  kicker: string;
  title: string;
  items: { head: string; body: string }[];
};

export const beyond: BeyondBlock[] = [
  {
    kicker: "Athletics",
    title: "Discipline, in three arenas",
    items: [
      { head: "Cross Country (varsity, practice group leader)", body: "~20–40 miles a week in season, chasing PRs and supporting teammates." },
      { head: "Wrestling (Varsity B, 113/126 lb)", body: "One-on-one accountability, mental toughness, and resetting fast after a loss." },
      { head: "Winter track & spring strength", body: "Durability and injury prevention, tracked by volume and RPE." },
    ],
  },
  {
    kicker: "Activities & Leadership",
    title: "Showing up unprompted",
    items: [
      { head: "Student Ambassador", body: "Leads campus tours. When a late, unannounced family arrived with no host free, I stepped in, triaged their interests, and ran a streamlined tour — finishing in time for my next one." },
      { head: "Asian Student Union", body: "Cultural identity, community building, and events." },
      { head: "Chinese Club", body: "Calligraphy, Lunar New Year, language games — open to students with Mandarin proficiency." },
    ],
  },
  {
    kicker: "Community",
    title: "Continuing a family legacy",
    items: [
      { head: "SOS Foundation", body: "I help continue the charitable work my late grandfather began — bridging scientific research and service — supporting office management and donor relations." },
      { head: "Families for Families", body: "Assembling and distributing care packages for families in need; helping organize fundraisers." },
      { head: "Azalea Festival", body: "Built booths and signage and prepped the venue under tight deadlines for a regional festival drawing thousands." },
    ],
  },
  {
    kicker: "Creative",
    title: "Training the eye",
    items: [
      { head: "Photography", body: "Nature, architecture, people — studying composition and the behavior of light and shadow." },
      { head: "Drone videography", body: "Filmed a multi-day wedding, using aerial shots to convey scale and color." },
      { head: "Drawing", body: "Pastels, charcoal, pencil, digital — a sketchbook habit that trained me to notice pattern and form." },
    ],
  },
];

/* ----------------------------------------------------------------------------
   Testimonials — real teacher comments, trimmed to positive, grade-free lines
   -------------------------------------------------------------------------- */
export type Testimonial = { quote: string; name: string; roleLine: string };

export const testimonials: Testimonial[] = [
  {
    quote:
      "Aryan brings a thoughtful and generous spirit… an exceptional listener who responds with respect and care… a terrific young man who is well prepared for the opportunities and challenges ahead. He embodies our school's core competency of perseverance.",
    name: "Dr. Peter Gallo",
    roleLine: "College Advisor, Landon School",
  },
  {
    quote:
      "It has been a great pleasure to teach Aryan. He is a polite and pleasant young man who consistently shows interest in the Chinese language and culture, and demonstrates a responsible approach to his learning.",
    name: "Ms. Xiaohong Yang",
    roleLine: "Mandarin, Landon School",
  },
  {
    quote:
      "Aryan is attentive, willing to ask questions, and seems to genuinely enjoy the material. He brings real effort and focus to class each day — an excellent foundation for continued growth.",
    name: "Mr. Bryan Calloway",
    roleLine: "Honors Physics, Landon School",
  },
];

export const footerLine = "Built and documented by Aryan Sharma — treating every result as guilty until proven innocent.";
