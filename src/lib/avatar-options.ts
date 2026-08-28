// Поштучный выбор черт лица поддержан только для этих 3 стилей — у остальных
// Dicebear-стилей нет единообразного набора отдельно управляемых черт.
// Значения — точный список enum'ов из https://api.dicebear.com/9.x/<style>/schema.json.

export type AvatarFeature = {
  key: string;
  label: string;
  values: string[];
};

const ADVENTURER_FEATURES: AvatarFeature[] = [
  {
    key: "eyes",
    label: "Глаза",
    values: Array.from({ length: 26 }, (_, i) => `variant${String(i + 1).padStart(2, "0")}`),
  },
  {
    key: "eyebrows",
    label: "Брови",
    values: Array.from({ length: 15 }, (_, i) => `variant${String(i + 1).padStart(2, "0")}`),
  },
  {
    key: "mouth",
    label: "Рот",
    values: Array.from({ length: 30 }, (_, i) => `variant${String(i + 1).padStart(2, "0")}`),
  },
  {
    key: "hair",
    label: "Причёска",
    values: [
      ...Array.from({ length: 19 }, (_, i) => `short${String(i + 1).padStart(2, "0")}`),
      ...Array.from({ length: 26 }, (_, i) => `long${String(i + 1).padStart(2, "0")}`),
    ],
  },
  { key: "glasses", label: "Очки", values: Array.from({ length: 5 }, (_, i) => `variant0${i + 1}`) },
  { key: "earrings", label: "Серьги", values: Array.from({ length: 6 }, (_, i) => `variant0${i + 1}`) },
  { key: "features", label: "Особые приметы", values: ["mustache", "blush", "birthmark", "freckles"] },
];

const BOTTTS_FEATURES: AvatarFeature[] = [
  {
    key: "eyes",
    label: "Глаза",
    values: [
      "bulging", "dizzy", "eva", "frame1", "frame2", "glow", "happy", "hearts",
      "robocop", "round", "roundFrame01", "roundFrame02", "sensor", "shade01",
    ],
  },
  {
    key: "mouth",
    label: "Рот",
    values: ["bite", "diagram", "grill01", "grill02", "grill03", "smile01", "smile02", "square01", "square02"],
  },
  { key: "face", label: "Форма головы", values: ["round01", "round02", "square01", "square02", "square03", "square04"] },
  {
    key: "top",
    label: "Антенна/верх",
    values: ["antenna", "antennaCrooked", "bulb01", "glowingBulb01", "glowingBulb02", "horns", "lights", "pyramid", "radar"],
  },
  {
    key: "sides",
    label: "Бока",
    values: ["antenna01", "antenna02", "cables01", "cables02", "round", "square", "squareAssymetric"],
  },
  {
    key: "texture",
    label: "Текстура корпуса",
    values: ["camo01", "camo02", "circuits", "dirty01", "dirty02", "dots", "grunge01", "grunge02"],
  },
];

const PERSONAS_FEATURES: AvatarFeature[] = [
  { key: "eyes", label: "Глаза", values: ["open", "sleep", "wink", "glasses", "happy", "sunglasses"] },
  { key: "mouth", label: "Рот", values: ["smile", "frown", "surprise", "pacifier", "bigSmile", "smirk", "lips"] },
  {
    key: "hair",
    label: "Причёска",
    values: [
      "long", "sideShave", "shortCombover", "curlyHighTop", "bobCut", "curly", "pigtails", "curlyBun",
      "buzzcut", "bobBangs", "bald", "balding", "cap", "bunUndercut", "fade", "beanie", "straightBun",
      "extraLong", "shortComboverChops", "mohawk",
    ],
  },
  { key: "facialHair", label: "Борода/усы", values: ["beardMustache", "pyramid", "walrus", "goatee", "shadow", "soulPatch"] },
  { key: "nose", label: "Нос", values: ["mediumRound", "smallRound", "wrinkles"] },
  { key: "body", label: "Телосложение", values: ["squared", "rounded", "small", "checkered"] },
];

export const AVATAR_FEATURE_CONFIG: Record<string, AvatarFeature[]> = {
  adventurer: ADVENTURER_FEATURES,
  bottts: BOTTTS_FEATURES,
  personas: PERSONAS_FEATURES,
};

export function hasFeatureEditor(style: string): boolean {
  return style in AVATAR_FEATURE_CONFIG;
}

/** Отбрасывает любые ключи/значения, не входящие в белый список для стиля — так и на клиенте, и на сервере (прокси). */
export function sanitizeAvatarOptions(style: string, options: Record<string, string>): Record<string, string> {
  const features = AVATAR_FEATURE_CONFIG[style];
  if (!features) return {};
  const result: Record<string, string> = {};
  for (const feature of features) {
    const value = options[feature.key];
    if (value && feature.values.includes(value)) result[feature.key] = value;
  }
  return result;
}

export function parseAvatarOptions(json: unknown): Record<string, string> {
  if (!json || typeof json !== "object") return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(json as Record<string, unknown>)) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}
