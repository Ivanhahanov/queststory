import { z } from "zod";
import { DICEBEAR_STYLES } from "./dicebear";
import type { ActivityTemplate, EffectTemplate, Game, Goal, Role, Round } from "./types";

const AVATAR_STYLE_IDS = DICEBEAR_STYLES.map((s) => s.id) as [string, ...string[]];
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Цвет в формате #rrggbb");
// AI-сгенерированный JSON часто ставит null в необязательные строковые поля вместо "" — принимаем и то, и то.
const looseString = (max: number) =>
  z
    .string()
    .max(max)
    .nullish()
    .transform((v) => v ?? "");
const looseNullableString = (max: number) =>
  z
    .string()
    .max(max)
    .nullish()
    .transform((v) => v ?? null);
const shortName = z.string().min(1).max(120);

// Ограничиваем размер вложенных массивов и глубину config — сценарий приходит из текста,
// сгенерированного ИИ, и не должен позволить раздуть JSON до неадекватного количества строк в БД.
const goalSchema = z.object({
  title: shortName,
  description: looseString(2000),
  unlock_round: looseNullableString(120),
});

const roundSchema = z.object({
  name: shortName,
  description: looseString(2000),
  planned_duration_seconds: z.number().int().positive().max(24 * 60 * 60).nullish().transform((v) => v ?? null),
});

const roleSchema = z.object({
  name: shortName,
  description: looseString(4000),
  avatar_style: z.enum(AVATAR_STYLE_IDS).default("adventurer"),
  color: hexColor.default("#e0973f"),
  goals: z.array(goalSchema).max(40),
});

const effectSchema = z.object({
  name: shortName,
  type: z.enum(["status_label", "secret_clue", "goal_lock", "points"]),
  color: hexColor.default("#8b5cf6"),
  default_text: looseNullableString(500),
});

const activityConfigValue = z.union([z.string().max(2000), z.number(), z.boolean(), z.array(z.string().max(2000)).max(50)]);

const activitySchema = z.object({
  type: z.enum(["pin_code", "photo_approval", "group_vote"]),
  name: shortName,
  instructions: looseString(2000),
  display_mode: z.enum(["kiosk", "personal"]).default("personal"),
  config: z.record(z.string().max(60), activityConfigValue).default({}),
});

export const scenarioSchema = z.object({
  version: z.literal(1),
  title: shortName,
  story_synopsis: looseString(4000),
  common_goal: looseString(2000),
  accent_color: hexColor.optional(),
  rounds: z.array(roundSchema).max(30).default([]),
  roles: z.array(roleSchema).max(40).default([]),
  common_goals: z.array(goalSchema).max(40).default([]),
  effect_templates: z.array(effectSchema).max(60).default([]),
  activity_templates: z.array(activitySchema).max(60).default([]),
});

export type Scenario = z.infer<typeof scenarioSchema>;

export function buildScenario(input: {
  game: Pick<Game, "title" | "story_synopsis" | "common_goal" | "accent_color">;
  rounds: Round[];
  roles: Role[];
  goals: Goal[];
  effects: EffectTemplate[];
  activities: ActivityTemplate[];
}): Scenario {
  const roundNameById = new Map(input.rounds.map((r) => [r.id, r.name]));
  const sortedRounds = [...input.rounds].sort((a, b) => a.position - b.position);
  const goalsFor = (roleId: string | null) =>
    input.goals
      .filter((g) => g.role_id === roleId)
      .sort((a, b) => a.position - b.position)
      .map((g) => ({
        title: g.title,
        description: g.description,
        unlock_round: g.unlock_round_id ? (roundNameById.get(g.unlock_round_id) ?? null) : null,
      }));

  return {
    version: 1,
    title: input.game.title,
    story_synopsis: input.game.story_synopsis,
    common_goal: input.game.common_goal,
    accent_color: input.game.accent_color,
    rounds: sortedRounds.map((r) => ({
      name: r.name,
      description: r.description,
      planned_duration_seconds: r.planned_duration_seconds,
    })),
    roles: input.roles.map((role) => ({
      name: role.name,
      description: role.description,
      avatar_style: role.avatar_style,
      color: role.color,
      goals: goalsFor(role.id),
    })),
    common_goals: goalsFor(null),
    effect_templates: input.effects.map((e) => ({
      name: e.name,
      type: e.type as Scenario["effect_templates"][number]["type"],
      color: e.color,
      default_text: e.default_text,
    })),
    activity_templates: input.activities.map((a) => ({
      type: a.type as Scenario["activity_templates"][number]["type"],
      name: a.name,
      instructions: a.instructions,
      display_mode: a.display_mode as Scenario["activity_templates"][number]["display_mode"],
      config: a.config as Scenario["activity_templates"][number]["config"],
    })),
  };
}

export function buildScenarioPrompt(theme: string, playerCount: number) {
  return `Ты помогаешь придумать сценарий для «Квестории» — салонной детективной игры для компании друзей (2-4 часа): у игроков есть роли с описанием персонажа, личные и общие цели, секреты и союзы, ведущий раздаёт роли и ведёт игру по раундам.

Придумай сценарий на тему: ${theme || "на твой выбор, но атмосферно и небанально"}.
Число игроков: ${playerCount}.

Верни ТОЛЬКО валидный JSON по этой схеме, без пояснений и markdown-обёртки:

{
  "version": 1,
  "title": "название игры",
  "story_synopsis": "завязка сюжета, которую видят все игроки",
  "common_goal": "общая цель всей группы",
  "accent_color": "#ec4899",
  "rounds": [
    { "name": "Раунд 1", "description": "что происходит в этом раунде", "planned_duration_seconds": 900 }
  ],
  "roles": [
    {
      "name": "имя персонажа",
      "description": "предыстория, характер, отношения с другими персонажами",
      "avatar_style": "adventurer",
      "color": "#e0973f",
      "goals": [
        { "title": "личная цель", "description": "подробности/подсказки", "unlock_round": "Раунд 2" }
      ]
    }
  ],
  "common_goals": [
    { "title": "цель для всех", "description": "", "unlock_round": null }
  ],
  "effect_templates": [
    { "name": "Ранен", "type": "status_label", "color": "#f43f5e", "default_text": "Ранен" }
  ],
  "activity_templates": [
    { "type": "group_vote", "name": "Голосование", "instructions": "инструкция для игроков", "display_mode": "kiosk", "config": { "options": ["Вариант А", "Вариант Б"] } }
  ]
}

Правила:
- avatar_style — одно из: ${DICEBEAR_STYLES.map((s) => s.id).join(", ")}.
- effect_templates[].type — одно из: status_label, secret_clue, goal_lock, points.
- activity_templates[].type — одно из: pin_code (config: {"correctCode": "1234"}), photo_approval (config: {}), group_vote (config: {"options": ["...", "..."]}).
- unlock_round — точное название раунда из массива rounds, либо null, если цель открыта с самого начала.
- Ролей должно быть ровно ${playerCount}, у каждой минимум одна личная цель.
- Пиши на русском, атмосферно и по делу, без воды.`;
}
