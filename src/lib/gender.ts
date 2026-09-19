export type RoleGender = "male" | "female" | "any";

export const GENDER_OPTIONS: RoleGender[] = ["any", "male", "female"];

export const GENDER_LABEL: Record<RoleGender, string> = {
  any: "Любой",
  male: "Мужской",
  female: "Женский",
};

export const GENDER_SHORT_LABEL: Record<RoleGender, string> = {
  any: "Любой",
  male: "М",
  female: "Ж",
};

export function normalizeGender(value: string): RoleGender {
  return value === "male" || value === "female" ? value : "any";
}
