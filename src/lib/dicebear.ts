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

export function dicebearUrl(style: string, seed: string, options?: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options ?? {})) {
    if (value) params.set(key, key === "backgroundColor" ? value.replace("#", "") : value);
  }
  const qs = params.toString();
  return `/api/avatar/${style}/${encodeURIComponent(seed)}.svg${qs ? `?${qs}` : ""}`;
}

export function randomAvatarSeed() {
  return crypto.randomUUID();
}
