const TEAM_GROUPS = [
  {
    key: "red-bull",
    aliases: ["Red Bull", "Red Bull Racing", "Oracle Red Bull Racing"],
  },
  {
    key: "ferrari",
    aliases: ["Ferrari", "Scuderia Ferrari"],
  },
  {
    key: "mercedes",
    aliases: [
      "Mercedes",
      "Mercedes-AMG",
      "Mercedes-AMG Petronas",
      "Mercedes-AMG Petronas Formula One Team",
    ],
  },
  {
    key: "mclaren",
    aliases: ["McLaren", "McLaren Formula 1 Team"],
  },
  {
    key: "aston-martin",
    aliases: [
      "Aston Martin",
      "Aston Martin Aramco",
      "Aston Martin Aramco Formula One Team",
      "Aston Martin F1 Team",
    ],
  },
  {
    key: "alpine",
    aliases: ["Alpine", "Alpine F1 Team", "BWT Alpine F1 Team"],
  },
  {
    key: "haas",
    aliases: ["Haas", "Haas F1 Team", "MoneyGram Haas F1 Team"],
  },
  {
    key: "williams",
    aliases: ["Williams", "Williams Racing"],
  },
  {
    key: "rb",
    aliases: [
      "RB",
      "RB F1 Team",
      "Visa Cash App RB F1 Team",
      "Visa Cash App RB",
      "Racing Bulls",
      "AlphaTauri",
      "Scuderia AlphaTauri",
      "Alpha Tauri",
    ],
  },
  {
    key: "sauber",
    aliases: [
      "Sauber",
      "Kick Sauber",
      "Stake F1 Team Kick Sauber",
      "Stake Sauber",
      "Alfa Romeo",
      "Alfa Romeo Racing",
      "Alfa Romeo F1 Team Stake",
      "Audi",
    ],
  },
  {
    key: "cadillac",
    aliases: ["Cadillac", "Cadillac F1 Team"],
  },
];

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const aliasLookup = new Map(
  TEAM_GROUPS.flatMap((group) =>
    group.aliases.map((alias) => [normalizeName(alias), group.key])
  )
);

export function getCanonicalTeamKey(name) {
  const normalized = normalizeName(name);

  if (!normalized) {
    return null;
  }

  if (aliasLookup.has(normalized)) {
    return aliasLookup.get(normalized);
  }

  const fuzzyMatch = TEAM_GROUPS.find((group) =>
    group.aliases.some((alias) => normalized.includes(normalizeName(alias)))
  );

  return fuzzyMatch?.key ?? normalized;
}
