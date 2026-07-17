const ZERO_WIDTH_CHARACTERS = /[\u200b-\u200f\u2060\ufeff]/gu;
const TEXT_TOKEN = /[\p{L}\p{M}\p{N}]+/gu;
const NON_TOKEN_CHARACTER = /[^\p{L}\p{M}\p{N}@$!]+/gu;
const REPEATED_CHARACTER = /(.)\1{2,}/gu;

const ENGLISH_PROFANITY = new Set([
  "asshole",
  "assholes",
  "bastard",
  "bastards",
  "bitch",
  "bitches",
  "bullshit",
  "cunt",
  "cunts",
  "dick",
  "dickhead",
  "dickheads",
  "douchebag",
  "douchebags",
  "faggot",
  "faggots",
  "fuck",
  "fucked",
  "fucker",
  "fuckers",
  "fucking",
  "fucks",
  "motherfucker",
  "motherfuckers",
  "motherfucking",
  "nigga",
  "niggas",
  "nigger",
  "niggers",
  "prick",
  "pussy",
  "pussies",
  "retard",
  "retarded",
  "retards",
  "shit",
  "shits",
  "shitty",
  "slut",
  "sluts",
  "whore",
  "whores",
]);

const BANGLA_PROFANITY = new Set([
  "চোদ",
  "চোদা",
  "চুদি",
  "চুদ",
  "চোদাচুদি",
  "মাদারচোদ",
  "মাদারচোদা",
  "বোকাচোদা",
  "খানকি",
  "খানকির",
  "হারামি",
  "হারামজাদা",
  "চুতিয়া",
  "চুতিয়া",
  "গুদ",
  "গুদমারা",
  "বাল",
  "বালছাল",
  "শালা",
  "শালার",
  "মাগি",
  "বাঞ্চোদ",
  "বেশ্যা",
]);

const BANGLISH_PROFANITY = new Set([
  "balchal",
  "banchod",
  "behenchod",
  "bokachoda",
  "chod",
  "choda",
  "chodachudi",
  "chud",
  "chudi",
  "chutia",
  "chutiya",
  "gudmara",
  "harami",
  "haramjada",
  "khangki",
  "khanki",
  "madarchod",
  "madarchoda",
]);

const BLOCKED_FRAGMENTS = [
  "motherfuck",
  "madarchod",
  "behenchod",
  "banchod",
  "bokachod",
  "মাদারচোদ",
  "বোকাচোদ",
  "খানকির",
  "চোদাচুদি",
];

function canonicalLatinToken(value: string) {
  return value
    .replaceAll("@", "a")
    .replaceAll("$", "s")
    .replaceAll("!", "i")
    .replaceAll("0", "o")
    .replaceAll("1", "i")
    .replaceAll("3", "e")
    .replaceAll("4", "a")
    .replaceAll("5", "s")
    .replaceAll("7", "t")
    .replace(REPEATED_CHARACTER, "$1");
}

function candidateTokens(value: string) {
  const normalized = value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(ZERO_WIDTH_CHARACTERS, "");
  const lexicalTokens = normalized.match(TEXT_TOKEN) ?? [];
  const punctuationCollapsed = normalized
    .split(/\s+/u)
    .map((segment) => segment.replace(NON_TOKEN_CHARACTER, ""))
    .filter(Boolean);

  return new Set([...lexicalTokens, ...punctuationCollapsed]);
}

export function containsProfanity(value: string) {
  for (const token of candidateTokens(value)) {
    const canonical = canonicalLatinToken(token);

    if (
      ENGLISH_PROFANITY.has(canonical) ||
      BANGLA_PROFANITY.has(token) ||
      BANGLISH_PROFANITY.has(canonical) ||
      BLOCKED_FRAGMENTS.some(
        (fragment) => token.includes(fragment) || canonical.includes(fragment),
      )
    ) {
      return true;
    }
  }

  return false;
}
