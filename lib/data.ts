export type Accent = "cyan" | "coral" | "gold" | "blue" | "green";

export type Project = {
  slug: string;
  kind: string;
  year: string;
  title: string;
  statement: string;
  description: string;
  proof: string;
  image: string;
  imageAlt: string;
  tags: string[];
  accent: Accent;
  href: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  featured?: boolean;
};

export const profile = {
  name: "Samiyeel Alim Binaaf",
  shortName: "Samiyeel",
  alias: "Pronaaf2k",
  role: "Full-stack + AI/ML developer",
  location: "Dhaka, Bangladesh",
  email: "benaaf2000@gmail.com",
  github: "https://github.com/Pronaaf2k",
  linkedin: "https://www.linkedin.com/in/samiyeelalimbinaaf/",
  steam: "https://steamcommunity.com/id/Samiyeel/",
  instagram: "https://www.instagram.com/samiyeel",
};

export const projects: Project[] = [
  {
    slug: "vololeads",
    kind: "Business infrastructure",
    year: "2026",
    title: "VoloLeads",
    statement: "A placeholder site became an operating business.",
    description:
      "I built the operating layer end to end: Stripe subscriptions, strategy-call booking, webhooks, PostgreSQL state, transactional email, billing self-service, and cron jobs for renewals and failed payments.",
    proof: "Payments, meetings, lifecycle automation, and cPanel deployment. Live in production.",
    image: "/images/projects/vololeads-live-2x.png",
    imageAlt: "VoloLeads production homepage with lead-generation offer and operating metrics",
    tags: ["Node", "Express", "Stripe", "PostgreSQL"],
    accent: "coral",
    href: "https://vololeads.com",
    featured: true,
  },
  {
    slug: "bhashallm",
    kind: "AI/ML capstone",
    year: "2026",
    title: "BhashaLLM",
    statement: "Bangla language intelligence built within real hardware limits.",
    description:
      "A resource-conscious Bangla AI capstone spanning handwritten line OCR, LoRA model adaptation, grading, and document-grounded Q&A under a 16 GB GPU constraint.",
    proof: "1,529 training records, PaliGemma 2 3B, 4-bit LoRA, and 576 training steps.",
    image: "/images/projects/bhashallm-credits.png",
    imageAlt: "BhashaLLM research credits and resources website",
    tags: ["Python", "PyTorch", "LoRA", "OCR"],
    accent: "green",
    href: "https://github.com/Pronaaf2k/BhashaLLM",
    secondaryHref: "https://bhashallmcredits.vercel.app/",
    secondaryLabel: "Credits",
  },
  {
    slug: "spotify-scraper",
    kind: "Music data tool",
    year: "2025",
    title: "Spotify Targeted Scraper",
    statement: "Music discovery with an aggressively specific filter.",
    description:
      "A resumable Python research tool for finding emerging artists through recent releases, follower thresholds, blocklists, and persistent state.",
    proof: "The seed for the two-person Vibe Matcher.",
    image: "/images/projects/spotifyscraper.webp",
    imageAlt: "Spotify Targeted Scraper project preview",
    tags: ["Python", "Spotify", "JSON", "Research"],
    accent: "cyan",
    href: "https://github.com/Pronaaf2k",
  },
  {
    slug: "quicksight",
    kind: "Accessible product",
    year: "2025",
    title: "QuickSight",
    statement: "Make the visual world easier to read.",
    description:
      "A mobile accessibility concept for colorblind and visually impaired users, combining Flutter with Python-powered image understanding.",
    proof: "Accessibility first, AI second.",
    image: "/images/projects/quick-sight.webp",
    imageAlt: "QuickSight accessibility app preview",
    tags: ["Flutter", "Python", "Firebase", "AI"],
    accent: "gold",
    href: "https://github.com/Pronaaf2k",
  },
  {
    slug: "academiq",
    kind: "Research prototype",
    year: "2025",
    title: "ACADEMIQ",
    statement: "A student system that notices patterns early.",
    description:
      "Research into predictive analytics, personalized learning paths, and scalable university operations with modern ML tooling.",
    proof: "Built from tutoring instincts and systems thinking.",
    image: "/images/projects/academiq.webp",
    imageAlt: "ACADEMIQ predictive education system preview",
    tags: ["TensorFlow", "PyTorch", "Python", "EdTech"],
    accent: "blue",
    href: "https://github.com/Pronaaf2k",
  },
  {
    slug: "superresai",
    kind: "Computer vision",
    year: "2025",
    title: "SuperResAI",
    statement: "Give damaged pixels a second chance.",
    description:
      "An image super-resolution pipeline for restoring and enhancing low-resolution visual data.",
    proof: "A visual ML lab, built to show the difference.",
    image: "/images/projects/superresai.webp",
    imageAlt: "SuperResAI image enhancement project preview",
    tags: ["Python", "TensorFlow", "PyTorch", "NumPy"],
    accent: "green",
    href: "https://github.com/Pronaaf2k",
  },
  {
    slug: "edutrack",
    kind: "Campus system",
    year: "2024",
    title: "EDUTrack",
    statement: "Less admin drag for university records.",
    description:
      "A web-based records and data system for North South University with a practical, workflow-first interface.",
    proof: "React structure around real campus context.",
    image: "/images/projects/edutrack.webp",
    imageAlt: "EDUTrack university records dashboard preview",
    tags: ["React", "Firebase", "JavaScript", "UI"],
    accent: "coral",
    href: "https://github.com/Pronaaf2k",
  },
];

export const proofPoints = [
  {
    label: "Production",
    value: "Business ops",
    detail: "Payments / meetings / cron jobs / deployment",
    accent: "coral" as Accent,
  },
  {
    label: "Hackathon",
    value: "Top 20 / 900",
    detail: "SOLVIO AI 2025 / first hackathon",
    accent: "gold" as Accent,
  },
  {
    label: "Product instinct",
    value: "Former CMO",
    detail: "Brand / positioning / campaigns / growth",
    accent: "cyan" as Accent,
  },
  {
    label: "Teaching",
    value: "Since 2022",
    detail: "Cambridge O-Level mathematics and science",
    accent: "blue" as Accent,
  },
];

export const tournamentResults = [
  {
    game: "Valorant",
    placement: "Champion",
    event: "XPLORICA Valorant Tournament",
    team: "Destiny Elite",
  },
  {
    game: "Rainbow Six Siege",
    placement: "Champion",
    event: "GRID R6 Rising Star Tournament",
    team: "Wolframite Esports",
  },
  {
    game: "Counter-Strike",
    placement: "Champion",
    event: "CSBD Ramadan Bidding Tournament 2025",
  },
  {
    game: "Valorant",
    placement: "Runner-up",
    event: "Weave 2.0 x CYBORG Gaming Carnival",
    team: "Alchemist Esports",
  },
  {
    game: "Rainbow Six Siege",
    placement: "Runner-up",
    event: "Helle R6 Tournament",
    team: "Wolframite Esports",
  },
  {
    game: "Counter-Strike",
    placement: "Runner-up",
    event: "CSBD Winter Open 2024",
    team: "Kaizen",
  },
  {
    game: "Valorant",
    placement: "Runner-up",
    event: "LUCC BitFest",
    team: "Militant Esports",
  },
  {
    game: "Counter-Strike",
    placement: "Runner-up",
    event: "NGL Tier-2 Battle Cup 2019",
    team: "HawX Gaming",
  },
  {
    game: "Rainbow Six Siege",
    placement: "Third place",
    event: "MSI Gaming Contest",
    team: "Wolframite Esports",
  },
  {
    game: "Valorant",
    placement: "Third place",
    event: "64BiTxIES Tourney",
    team: "Militant Esports",
  },
  {
    game: "Counter-Strike",
    placement: "Runner-up",
    event: "6th DRMC IT FEST",
    team: "HawX Gaming",
  },
];
export const esportsPresence = [
  {
    platform: "Steam",
    handle: "Pronaaf2k",
    detail: "133 games / 4,267+ Counter-Strike hours / public match archive",
    href: profile.steam,
  },
  {
    platform: "Liquipedia / Rainbow Six",
    handle: "Pronaaf2k",
    detail: "ROG Masters 2022 South Asia qualifier record",
    href: "https://liquipedia.net/rainbowsix/ROG_Masters/2022/Asia-Pacific/South_Asia/Qualifiers",
  },
  {
    platform: "Liquipedia / Valorant",
    handle: "Pronaaf2k",
    detail: "VCC 2022 Stage 1 Bangladesh roster record",
    href: "https://liquipedia.net/valorant/VCC/2022/Stage_1/Bangladesh",
  },
  {
    platform: "Liquipedia / Counter-Strike",
    handle: "Pronaaf2k",
    detail: "Cybernauts 2026 roster record",
    href: "https://liquipedia.net/counterstrike/Cybernauts/2026",
  },
];

export const gameReceipts = [
  {
    game: "Valorant",
    peak: "Immortal 1",
    detail: "Pronaaf2k#2000",
  },
  {
    game: "Counter-Strike",
    peak: "FACEIT 10",
    detail: "2147 Elo / 19K Premier / 4,267 hours",
  },
  {
    game: "Rainbow Six Siege",
    peak: "GRID champion",
    detail: "Pronaaf2k / Prxnaaf2k / Plat 1 / Emerald 3",
  },
  {
    game: "Marvel Rivals",
    peak: "Grandmaster 3",
    detail: "Season 1 peak",
  },
];

export const experience = [
  {
    period: "2026 — now",
    title: "Full-stack developer",
    place: "VoloLeads / contract",
    detail:
      "Turned a placeholder site into operating business infrastructure: interface, API, subscriptions, meeting booking, email, lifecycle cron jobs, analytics, deployment, and post-launch edge cases.",
  },
  {
    period: "2023 — 2024",
    title: "Chief Marketing Officer",
    place: "Discount Den",
    detail:
      "Worked on positioning, brand, campaigns, and growth. It is why I care how a product is understood, not only how it is implemented.",
  },
  {
    period: "2022 — now",
    title: "Private tutor",
    place: "Cambridge O-Level / Pre O-Level",
    detail:
      "Teach mathematics and science one-on-one. The useful skill is turning a complicated idea into the next obvious step.",
  },
  {
    period: "2022 — now",
    title: "CSE undergraduate",
    place: "North South University",
    detail:
      "Focused on AI/ML, accessible products, and full-stack systems that leave the notebook and meet real users.",
  },
];

export const loadoutGroups = {
  play: [
    ["Competitive alias", "Pronaaf2k", "Also appears as Prxnaaf2k in Rainbow Six records."],
    ["Championships", "3 titles", "CSBD Ramadan 2025 / XPLORICA / GRID R6."],
    ["Peak ranks", "FACEIT 10 / Immortal 1", "2147 Elo in CS and an Immortal Valorant peak."],
    ["Tournament rosters", "6 teams", "HawX, Kaizen, Wolframite, Militant, Alchemist, and Destiny Elite."],
  ],
  desk: [
    ["Mouse", "Lamzu Maya X", "Light, direct, no ceremony."],
    ["Main pad", "ATK Sky XSoft", "The control surface."],
    ["Desk pad", "LGG Jupiter 3XL", "Because one mousepad apparently was not enough."],
    ["Keyboard", "EWEADN DEEP68 HE", "Magnetic switches and rapid trigger."],
    ["Headphones", "HyperX Alpha S", "Still here because they still work."],
    ["Sim rig", "Logitech G29", "For a completely different kind of line."],
  ],
  rig: [
    ["CPU", "Ryzen 7 7800X3D", "Built around consistent frame time."],
    ["GPU", "RTX 5070 Ti", "Games, ML experiments, and too many browser tabs."],
    ["Memory", "32 GB / 6000 MHz", "Enough headroom to stay reckless."],
    ["Storage", "5 TB total", "WD Black, Kingston, and a Toshiba archive drive."],
    ["Board", "Sapphire Pulse B650M WiFi", "Compact, current, practical."],
    ["Case", "Corsair 5000D Airflow", "Airflow is part of the spec."],
  ],
  tools: [
    ["Build", "React / Node / Express", "The shortest path from idea to usable web product."],
    ["Data", "Python / PostgreSQL", "For scripts, models, and state that has to survive."],
    ["Creative", "Krita / Illustrator / Premiere", "UI starts before the browser."],
    ["Ship", "Git / Cloudflare / Vercel", "A project is not done while it only runs here."],
  ],
};
