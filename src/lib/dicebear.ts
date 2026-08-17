export const DICEBEAR_STYLES = [
  { id: "adventurer", label: "Искатель" },
  { id: "adventurer-neutral", label: "Искатель (нейтральный)" },
  { id: "avataaars", label: "Мультяшный" },
  { id: "big-ears", label: "Большеухий" },
  { id: "big-smile", label: "Улыбчивый" },
  { id: "bottts", label: "Робот" },
  { id: "croodles", label: "Каракули" },
  { id: "fun-emoji", label: "Эмодзи" },
  { id: "lorelei", label: "Лорелея" },
  { id: "micah", label: "Мика" },
  { id: "notionists", label: "Ноушенист" },
  { id: "open-peeps", label: "Пипс" },
  { id: "personas", label: "Персона" },
  { id: "pixel-art", label: "Пиксель-арт" },
  { id: "thumbs", label: "Пальцы вверх" },
] as const;

export type DicebearStyle = (typeof DICEBEAR_STYLES)[number]["id"];

export function dicebearUrl(style: string, seed: string, backgroundColor?: string) {
  const params = new URLSearchParams({ seed });
  if (backgroundColor) {
    params.set("backgroundColor", backgroundColor.replace("#", ""));
  }
  return `https://api.dicebear.com/9.x/${style}/svg?${params.toString()}`;
}

export function randomAvatarSeed() {
  return crypto.randomUUID();
}
