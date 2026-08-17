import type { Database } from "@/lib/supabase/types";

type Tables = Database["public"]["Tables"];

export type Game = Tables["games"]["Row"];
export type Round = Tables["rounds"]["Row"];
export type Role = Tables["roles"]["Row"];
export type Goal = Tables["goals"]["Row"];
export type Player = Tables["players"]["Row"];
export type PlayerGoalProgress = Tables["player_goal_progress"]["Row"];
export type Message = Tables["messages"]["Row"];
export type EffectTemplate = Tables["effect_templates"]["Row"];
export type PlayerEffect = Tables["player_effects"]["Row"];
export type ActivityTemplate = Tables["activity_templates"]["Row"];
export type ActivityRun = Tables["activity_runs"]["Row"];
export type ActivitySubmission = Tables["activity_submissions"]["Row"];

export type VisibleGoal = Database["public"]["Functions"]["get_visible_goals"]["Returns"][number];
export type PlayerEffectWithTemplate = PlayerEffect & { effect_templates: EffectTemplate | null };

export type PinCodeConfig = { correctCode: string };
export type GroupVoteConfig = { options: string[] };

export function pinCodeConfig(config: unknown): PinCodeConfig {
  const c = config as Partial<PinCodeConfig> | null;
  return { correctCode: c?.correctCode ?? "" };
}

export function groupVoteConfig(config: unknown): GroupVoteConfig {
  const c = config as Partial<GroupVoteConfig> | null;
  return { options: c?.options ?? [] };
}
