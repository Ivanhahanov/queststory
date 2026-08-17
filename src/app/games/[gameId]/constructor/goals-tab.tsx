"use client";

import { Plus } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Goal, Role, Round } from "@/lib/types";
import { GoalRow } from "./goal-row";

export function GoalsTab({
  gameId,
  goals,
  roles,
  rounds,
  onChange,
}: {
  gameId: string;
  goals: Goal[];
  roles: Role[];
  rounds: Round[];
  onChange: (goals: Goal[]) => void;
}) {
  const supabase = useSupabaseClient();

  async function addGoal(roleId: string | null) {
    const group = goals.filter((g) => g.role_id === roleId);
    const position = group.length ? Math.max(...group.map((g) => g.position)) + 1 : 0;
    const { data } = await supabase
      .from("goals")
      .insert({ game_id: gameId, role_id: roleId, title: "Новая цель", position })
      .select()
      .single();
    if (data) onChange([...goals, data]);
  }

  function updateGoal(updated: Goal) {
    onChange(goals.map((g) => (g.id === updated.id ? updated : g)));
  }

  async function removeGoal(id: string) {
    onChange(goals.filter((g) => g.id !== id));
    await supabase.from("goals").delete().eq("id", id);
  }

  if (roles.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">
            Сначала добавьте роли
          </CardTitle>
          <CardDescription>Личные цели привязываются к роли — создайте её на вкладке «Роли».</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <GoalSection
        title="Общие цели"
        description="Видны всем игрокам, независимо от роли"
        goals={goals.filter((g) => g.role_id === null).sort((a, b) => a.position - b.position)}
        rounds={rounds}
        onAdd={() => addGoal(null)}
        onChangeGoal={updateGoal}
        onRemoveGoal={removeGoal}
      />

      {roles.map((role) => (
        <GoalSection
          key={role.id}
          title={role.name}
          description="Личные цели этой роли"
          accentColor={role.color}
          goals={goals
            .filter((g) => g.role_id === role.id)
            .sort((a, b) => a.position - b.position)}
          rounds={rounds}
          onAdd={() => addGoal(role.id)}
          onChangeGoal={updateGoal}
          onRemoveGoal={removeGoal}
        />
      ))}
    </div>
  );
}

function GoalSection({
  title,
  description,
  accentColor,
  goals,
  rounds,
  onAdd,
  onChangeGoal,
  onRemoveGoal,
}: {
  title: string;
  description: string;
  accentColor?: string;
  goals: Goal[];
  rounds: Round[];
  onAdd: () => void;
  onChangeGoal: (goal: Goal) => void;
  onRemoveGoal: (id: string) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {accentColor && <span className="size-2.5 rounded-full" style={{ backgroundColor: accentColor }} />}
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus /> Цель
        </Button>
      </div>
      <div className="space-y-2">
        {goals.map((goal) => (
          <GoalRow
            key={goal.id}
            goal={goal}
            rounds={rounds}
            onChange={onChangeGoal}
            onRemove={() => onRemoveGoal(goal.id)}
          />
        ))}
      </div>
    </section>
  );
}
