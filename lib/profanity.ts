const ZERO_WIDTH_CHARACTERS = /[\u200b-\u200f\u2060\ufeff]/gu;
const TEXT_TOKEN = /[\p{L}\p{M}\p{N}]+/gu;
const NON_TOKEN_CHARACTER = /[^\p{L}\p{M}\p{N}@$!]+/gu;
const REPEATED_CHARACTER = /(.)\1{2,}/gu;

const ENGLISH_PROFANITY = new Set([
  "anal",
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
  "dildo",
  "dildos",
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
  "sex",
  "sexual",
  "sexy",
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
  "যৌন",
  "সেক্স",
  "স্তন",
  "লিঙ্গ",
  "ধোন",
  "ধন",
  "পুটকি",
  "হোগা",
  "নুনু",
  "চুচি",
  "চুদানি",
  "চোদন",
  "মাগীর",
  "কুত্তারবাচ্চা",
  "শুয়োরেরবাচ্চা",
]);

const BANGLISH_PROFANITY = new Set([
  "bal",
  "balchal",
  "banchod",
  "bainchod",
  "bainchud",
  "benchod",
  "benchud",
  "behenchod",
  "behenchud",
  "besha",
  "beshya",
  "bessa",
  "bessha",
  "besshya",
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
  "sex",
  "sexy",
  "jouno",
  "lingo",
  "dhon",
  "nunu",
  "putki",
  "hoga",
  "magi",
  "magir",
  "shart",
  "kuttarbaccha",
  "kuttarbacha",
  "shuorerbaccha",
  "shuorerbacha",
]);

const BLOCKED_FRAGMENTS = [
  "sex",
  "porn",
  "dildo",
  "blowjob",
  "handjob",
  "rimjob",
  "motherfuck",
  "madarchod",
  "behenchod",
  "behenchud",
  "bainchod",
  "bainchud",
  "benchod",
  "benchud",
  "banchod",
  "banchud",
  "bokachod",
  "beshya",
  "bessha",
  "মাদারচোদ",
  "বোকাচোদ",
  "খানকির",
  "চোদাচুদি",
  "চুদ",
  "চোদ",
  "সেক্স",
  "পুটকি",
  "কুত্তারবাচ্চা",
];

const BLOCKED_PHRASES = [
  "suck my",
  "send nudes",
  "nude pic",
  "naked pic",
  "ফাক ইউ",
  "তোর মায়ের",
  "তোর মায়ের",
  "তোর বাপের",
  "মাগীর পোলা",
  "মাগির পোলা",
  "tor mayer",
  "tor maier",
  "magir pola",
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
  const normalized = value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(ZERO_WIDTH_CHARACTERS, "")
    .replace(/\s+/gu, " ")
    .trim();
  const tokens = candidateTokens(normalized);

  if (BLOCKED_PHRASES.some((phrase) => normalized.includes(phrase))) return true;

  for (const token of tokens) {
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

  // Catch deliberate spacing/punctuation evasions such as "s e x" or "f.u.c.k".
  const compactLatin = canonicalLatinToken(
    normalized.replace(/[^a-z0-9@$!]+/gu, ""),
  );
  if (
    compactLatin.length >= 3 &&
    BLOCKED_FRAGMENTS.some(
      (fragment) => /^[a-z]+$/u.test(fragment) && compactLatin.includes(fragment),
    )
  ) {
    return true;
  }

  return false;
}
