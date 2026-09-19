import { dicebearUrl } from "./dicebear";

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

const ADVENTURER_NEUTRAL_FEATURES: AvatarFeature[] = [
  { key: "eyebrows", label: "Брови", values: ["variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01","variant15","variant14","variant13","variant12","variant11"] },
  { key: "eyes", label: "Глаза", values: ["variant26","variant25","variant24","variant23","variant22","variant21","variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "glasses", label: "Очки", values: ["variant01","variant02","variant03","variant04","variant05"] },
  { key: "mouth", label: "Рот", values: ["variant30","variant29","variant28","variant27","variant26","variant25","variant24","variant23","variant22","variant21","variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
];

const AVATAAARS_FEATURES: AvatarFeature[] = [
  { key: "accessories", label: "Аксессуары", values: ["kurt","prescription01","prescription02","round","sunglasses","wayfarers","eyepatch"] },
  { key: "clothing", label: "Одежда", values: ["blazerAndShirt","blazerAndSweater","collarAndSweater","graphicShirt","hoodie","overall","shirtCrewNeck","shirtScoopNeck","shirtVNeck"] },
  { key: "clothingGraphic", label: "Принт на одежде", values: ["bat","bear","cumbia","deer","diamond","hola","pizza","resist","skull","skullOutline"] },
  { key: "eyebrows", label: "Брови", values: ["angryNatural","defaultNatural","flatNatural","frownNatural","raisedExcitedNatural","sadConcernedNatural","unibrowNatural","upDownNatural","angry","default","raisedExcited","sadConcerned","upDown"] },
  { key: "eyes", label: "Глаза", values: ["closed","cry","default","eyeRoll","happy","hearts","side","squint","surprised","winkWacky","wink","xDizzy"] },
  { key: "facialHair", label: "Борода/усы", values: ["beardLight","beardMajestic","beardMedium","moustacheFancy","moustacheMagnum"] },
  { key: "mouth", label: "Рот", values: ["concerned","default","disbelief","eating","grimace","sad","screamOpen","serious","smile","tongue","twinkle","vomit"] },
  { key: "style", label: "Форма аватара", values: ["circle","default"] },
  { key: "top", label: "Причёска/убор", values: ["hat","hijab","turban","winterHat1","winterHat02","winterHat03","winterHat04","bob","bun","curly","curvy","dreads","frida","fro","froBand","longButNotTooLong","miaWallace","shavedSides","straight02","straight01","straightAndStrand","dreads01","dreads02","frizzle","shaggy","shaggyMullet","shortCurly","shortFlat","shortRound","shortWaved","sides","theCaesar","theCaesarAndSidePart","bigHair"] },
];

const BIG_EARS_FEATURES: AvatarFeature[] = [
  { key: "cheek", label: "Щёки", values: ["variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "ear", label: "Уши", values: ["variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "eyes", label: "Глаза", values: ["variant32","variant31","variant30","variant29","variant28","variant27","variant26","variant25","variant24","variant23","variant22","variant21","variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "face", label: "Форма лица", values: ["variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "frontHair", label: "Чёлка", values: ["variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "hair", label: "Причёска", values: ["long20","long19","long18","long17","long16","long15","long14","long13","long12","long11","long10","long09","long08","long07","long06","long05","long04","long03","long02","long01","short20","short19","short18","short17","short16","short15","short14","short13","short12","short11","short10","short09","short08","short07","short06","short05","short04","short03","short02","short01"] },
  { key: "mouth", label: "Рот", values: ["variant0708","variant0707","variant0706","variant0705","variant0704","variant0703","variant0702","variant0701","variant0405","variant0605","variant0604","variant0603","variant0602","variant0601","variant0505","variant0504","variant0503","variant0502","variant0501","variant0404","variant0403","variant0402","variant0401","variant0305","variant0304","variant0303","variant0302","variant0301","variant0205","variant0204","variant0203","variant0202","variant0201","variant0105","variant0104","variant0103","variant0102","variant0101"] },
  { key: "nose", label: "Нос", values: ["variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "sideburn", label: "Бакенбарды", values: ["variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
];

const BIG_SMILE_FEATURES: AvatarFeature[] = [
  { key: "accessories", label: "Аксессуары", values: ["catEars","glasses","sailormoonCrown","clownNose","sleepMask","sunglasses","faceMask","mustache"] },
  { key: "eyes", label: "Глаза", values: ["cheery","normal","confused","starstruck","winking","sleepy","sad","angry"] },
  { key: "hair", label: "Причёска", values: ["shortHair","mohawk","wavyBob","bowlCutHair","curlyBob","straightHair","braids","shavedHead","bunHair","froBun","bangs","halfShavedHead","curlyShortHair"] },
  { key: "mouth", label: "Рот", values: ["openedSmile","unimpressed","gapSmile","openSad","teethSmile","awkwardSmile","braces","kawaii"] },
];

const CROODLES_FEATURES: AvatarFeature[] = [
  { key: "beard", label: "Борода", values: ["variant05","variant04","variant03","variant02","variant01"] },
  { key: "eyes", label: "Глаза", values: ["variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "face", label: "Форма лица", values: ["variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "mouth", label: "Рот", values: ["variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "mustache", label: "Усы", values: ["variant04","variant03","variant02","variant01"] },
  { key: "nose", label: "Нос", values: ["variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "top", label: "Причёска/убор", values: ["variant29","variant28","variant27","variant26","variant25","variant24","variant23","variant22","variant21","variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
];

const FUN_EMOJI_FEATURES: AvatarFeature[] = [
  { key: "eyes", label: "Глаза", values: ["sad","tearDrop","pissed","cute","wink","wink2","plain","glasses","closed","love","stars","shades","closed2","crying","sleepClose"] },
  { key: "mouth", label: "Рот", values: ["plain","lilSmile","sad","shy","cute","wideSmile","shout","smileTeeth","smileLol","pissed","drip","tongueOut","kissHeart","sick","faceMask"] },
];

const LORELEI_FEATURES: AvatarFeature[] = [
  { key: "beard", label: "Борода", values: ["variant01","variant02"] },
  { key: "earrings", label: "Серьги", values: ["variant01","variant02","variant03"] },
  { key: "eyebrows", label: "Брови", values: ["variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "eyes", label: "Глаза", values: ["variant24","variant23","variant22","variant21","variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "glasses", label: "Очки", values: ["variant01","variant02","variant03","variant04","variant05"] },
  { key: "hair", label: "Причёска", values: ["variant48","variant47","variant46","variant45","variant44","variant43","variant42","variant41","variant40","variant39","variant38","variant37","variant36","variant35","variant34","variant33","variant32","variant31","variant30","variant29","variant28","variant27","variant26","variant25","variant24","variant23","variant22","variant21","variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "head", label: "Форма лица", values: ["variant04","variant03","variant02","variant01"] },
  { key: "mouth", label: "Рот", values: ["happy01","happy02","happy03","happy04","happy05","happy06","happy07","happy08","happy18","happy09","happy10","happy11","happy12","happy13","happy14","happy17","happy15","happy16","sad01","sad02","sad03","sad04","sad05","sad06","sad07","sad08","sad09"] },
  { key: "nose", label: "Нос", values: ["variant01","variant02","variant03","variant04","variant05","variant06"] },
];

const MICAH_FEATURES: AvatarFeature[] = [
  { key: "earrings", label: "Серьги", values: ["hoop","stud"] },
  { key: "ears", label: "Уши", values: ["attached","detached"] },
  { key: "eyebrows", label: "Брови", values: ["up","down","eyelashesUp","eyelashesDown"] },
  { key: "eyes", label: "Глаза", values: ["eyes","round","eyesShadow","smiling","smilingShadow"] },
  { key: "facialHair", label: "Борода/усы", values: ["beard","scruff"] },
  { key: "glasses", label: "Очки", values: ["round","square"] },
  { key: "hair", label: "Причёска", values: ["fonze","mrT","dougFunny","mrClean","dannyPhantom","full","turban","pixie"] },
  { key: "mouth", label: "Рот", values: ["surprised","laughing","nervous","smile","sad","pucker","frown","smirk"] },
  { key: "nose", label: "Нос", values: ["curve","pointed","tound"] },
  { key: "shirt", label: "Рубашка", values: ["open","crew","collared"] },
];

const NOTIONISTS_FEATURES: AvatarFeature[] = [
  { key: "beard", label: "Борода", values: ["variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "body", label: "Телосложение", values: ["variant25","variant24","variant23","variant22","variant21","variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "bodyIcon", label: "Значок на теле", values: ["electric","saturn","galaxy"] },
  { key: "brows", label: "Брови", values: ["variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "eyes", label: "Глаза", values: ["variant05","variant04","variant03","variant02","variant01"] },
  { key: "gesture", label: "Жест", values: ["wavePointLongArms","waveOkLongArms","waveLongArms","waveLongArm","pointLongArm","okLongArm","point","ok","hand","handPhone"] },
  { key: "glasses", label: "Очки", values: ["variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "hair", label: "Причёска", values: ["variant63","variant62","variant61","variant60","variant59","variant58","variant57","variant56","variant55","variant54","variant53","variant52","variant51","variant50","variant49","variant48","variant47","variant46","variant45","variant44","variant43","variant42","variant41","variant40","variant39","variant38","variant37","variant36","variant35","variant34","variant33","variant32","variant31","variant30","variant29","variant28","variant27","variant26","variant25","variant24","variant23","variant22","variant21","variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01","hat"] },
  { key: "lips", label: "Губы", values: ["variant30","variant29","variant28","variant27","variant26","variant25","variant24","variant23","variant22","variant21","variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "nose", label: "Нос", values: ["variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
];

const OPEN_PEEPS_FEATURES: AvatarFeature[] = [
  { key: "accessories", label: "Аксессуары", values: ["eyepatch","glasses","glasses2","glasses3","glasses4","glasses5","sunglasses","sunglasses2"] },
  { key: "face", label: "Форма лица", values: ["angryWithFang","awe","blank","calm","cheeky","concerned","concernedFear","contempt","cute","cyclops","driven","eatingHappy","explaining","eyesClosed","fear","hectic","lovingGrin1","lovingGrin2","monster","old","rage","serious","smile","smileBig","smileLOL","smileTeethGap","solemn","suspicious","tired","veryAngry"] },
  { key: "facialHair", label: "Борода/усы", values: ["chin","full","full2","full3","full4","goatee1","goatee2","moustache1","moustache2","moustache3","moustache4","moustache5","moustache6","moustache7","moustache8","moustache9"] },
  { key: "head", label: "Причёска", values: ["afro","bangs","bangs2","bantuKnots","bear","bun","bun2","buns","cornrows","cornrows2","dreads1","dreads2","flatTop","flatTopLong","grayBun","grayMedium","grayShort","hatBeanie","hatHip","hijab","long","longAfro","longBangs","longCurly","medium1","medium2","medium3","mediumBangs","mediumBangs2","mediumBangs3","mediumStraight","mohawk","mohawk2","noHair1","noHair2","noHair3","pomp","shaved1","shaved2","shaved3","short1","short2","short3","short4","short5","turban","twists","twists2"] },
  { key: "mask", label: "Маска", values: ["medicalMask","respirator"] },
];

const PIXEL_ART_FEATURES: AvatarFeature[] = [
  { key: "accessories", label: "Аксессуары", values: ["variant04","variant03","variant02","variant01"] },
  { key: "beard", label: "Борода", values: ["variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "clothing", label: "Одежда", values: ["variant23","variant22","variant21","variant20","variant19","variant18","variant17","variant16","variant15","variant14","variant13","variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "eyes", label: "Глаза", values: ["variant12","variant11","variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "glasses", label: "Очки", values: ["light07","light06","light05","light04","light03","light02","light01","dark07","dark06","dark05","dark04","dark03","dark02","dark01"] },
  { key: "hair", label: "Причёска", values: ["short24","short23","short22","short21","short20","short19","short18","short17","short16","short15","short14","short13","short12","short11","short10","short09","short08","short07","short06","short05","short04","short03","short02","short01","long21","long20","long19","long18","long17","long16","long15","long14","long13","long12","long11","long10","long09","long08","long07","long06","long05","long04","long03","long02","long01"] },
  { key: "hat", label: "Головной убор", values: ["variant10","variant09","variant08","variant07","variant06","variant05","variant04","variant03","variant02","variant01"] },
  { key: "mouth", label: "Рот", values: ["sad10","sad09","sad08","sad07","sad06","sad05","sad04","sad03","sad02","sad01","happy13","happy12","happy11","happy10","happy09","happy08","happy07","happy06","happy05","happy04","happy03","happy02","happy01"] },
];

const THUMBS_FEATURES: AvatarFeature[] = [
  { key: "eyes", label: "Глаза", values: ["variant1W10","variant1W12","variant1W14","variant1W16","variant2W10","variant2W12","variant2W14","variant2W16","variant3W10","variant3W12","variant3W14","variant3W16","variant4W10","variant4W12","variant4W14","variant4W16","variant5W10","variant5W12","variant5W14","variant5W16","variant6W10","variant6W12","variant6W14","variant6W16","variant7W10","variant7W12","variant7W14","variant7W16","variant8W10","variant8W12","variant8W14","variant8W16","variant9W10","variant9W12","variant9W14","variant9W16"] },
  { key: "face", label: "Форма лица", values: ["variant1","variant2","variant3","variant5","variant4"] },
  { key: "mouth", label: "Рот", values: ["variant2","variant1","variant3","variant4","variant5"] },
];

export const AVATAR_FEATURE_CONFIG: Record<string, AvatarFeature[]> = {
  adventurer: ADVENTURER_FEATURES,
  "adventurer-neutral": ADVENTURER_NEUTRAL_FEATURES,
  avataaars: AVATAAARS_FEATURES,
  "big-ears": BIG_EARS_FEATURES,
  "big-smile": BIG_SMILE_FEATURES,
  bottts: BOTTTS_FEATURES,
  croodles: CROODLES_FEATURES,
  "fun-emoji": FUN_EMOJI_FEATURES,
  lorelei: LORELEI_FEATURES,
  micah: MICAH_FEATURES,
  notionists: NOTIONISTS_FEATURES,
  "open-peeps": OPEN_PEEPS_FEATURES,
  personas: PERSONAS_FEATURES,
  "pixel-art": PIXEL_ART_FEATURES,
  thumbs: THUMBS_FEATURES,
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

/**
 * Загруженное ведущим фото — это и есть аватар роли, не отдельная
 * иллюстрация: если оно задано, используем его везде, где раньше
 * рендерился Dicebear (маленькие иконки и большая карточка одинаково).
 */
export function roleAvatarUrl(role: {
  avatar_style: string;
  avatar_seed: string;
  avatar_options: unknown;
  portrait_url: string | null;
}): string {
  return role.portrait_url || dicebearUrl(role.avatar_style, role.avatar_seed, parseAvatarOptions(role.avatar_options));
}
