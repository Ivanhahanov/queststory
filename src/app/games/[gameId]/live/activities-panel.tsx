"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { completeGoalForAllPlayers } from "@/lib/complete-goal";
import type { ActivityRun, ActivitySubmission, ActivityTemplate, Goal, Player } from "@/lib/types";
import { ActivityRunCard } from "./activity-run-card";

export function ActivitiesPanel({
  gameId,
  activityTemplates,
  players,
  goals,
  onGoalCompleted,
}: {
  gameId: string;
  activityTemplates: ActivityTemplate[];
  players: Player[];
  goals: Goal[];
  onGoalCompleted: (playerId: string, goalId: string) => void;
}) {
  const supabase = useSupabaseClient();
  const [runs, setRuns] = useState<ActivityRun[]>([]);
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);

  useEffect(() => {
    supabase
      .from("activity_runs")
      .select("*")
      .eq("game_id", gameId)
      .eq("status", "active")
      .then(({ data }) => setRuns(data ?? []));
  }, [gameId, supabase]);

  useEffect(() => {
    if (runs.length === 0) {
      Promise.resolve().then(() => setSubmissions([]));
      return;
    }
    supabase
      .from("activity_submissions")
      .select("*")
      .in("activity_run_id", runs.map((r) => r.id))
      .then(({ data }) => setSubmissions(data ?? []));
  }, [runs, supabase]);

  useEffect(() => {
    const channel = supabase
      .channel(`activities-${gameId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_runs", filter: `game_id=eq.${gameId}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          setRuns((prev) => prev.filter((r) => r.id !== (payload.old as ActivityRun).id));
          return;
        }
        const row = payload.new as ActivityRun;
        setRuns((prev) => {
          if (row.status !== "active") return prev.filter((r) => r.id !== row.id);
          return prev.some((r) => r.id === row.id) ? prev.map((r) => (r.id === row.id ? row : r)) : [...prev, row];
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_submissions" }, (payload) => {
        if (payload.eventType === "DELETE") {
          setSubmissions((prev) => prev.filter((s) => s.id !== (payload.old as ActivitySubmission).id));
          return;
        }
        const row = payload.new as ActivitySubmission;
        setSubmissions((prev) => (prev.some((s) => s.id === row.id) ? prev.map((s) => (s.id === row.id ? row : s)) : [...prev, row]));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  async function launch(template: ActivityTemplate) {
    const { data } = await supabase
      .from("activity_runs")
      .insert({ activity_template_id: template.id, game_id: gameId, status: "active" })
      .select()
      .single();
    if (!data) return;
    setRuns((prev) => [...prev, data]);
    supabase.channel(`activities:game-${gameId}`).send({
      type: "broadcast",
      event: "activity_started",
      payload: { runId: data.id },
    });
  }

  async function cancel(run: ActivityRun) {
    await supabase.from("activity_runs").update({ status: "cancelled" }).eq("id", run.id);
    setRuns((prev) => prev.filter((r) => r.id !== run.id));
  }

  async function resolve(run: ActivityRun, template: ActivityTemplate) {
    await supabase.from("activity_runs").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", run.id);
    setRuns((prev) => prev.filter((r) => r.id !== run.id));
    if (template.linked_goal_id) {
      await completeGoalForAllPlayers(supabase, gameId, template.linked_goal_id);
      players.forEach((p) => onGoalCompleted(p.id, template.linked_goal_id!));
    }
  }

  if (activityTemplates.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Общие активности</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {activityTemplates.map((t) => {
            const active = runs.some((r) => r.activity_template_id === t.id);
            return (
              <Button key={t.id} size="sm" variant={active ? "secondary" : "outline"} disabled={active} onClick={() => launch(t)}>
                <Play /> {t.name}
              </Button>
            );
          })}
        </div>

        {runs.map((run) => {
          const template = activityTemplates.find((t) => t.id === run.activity_template_id);
          if (!template) return null;
          return (
            <ActivityRunCard
              key={run.id}
              run={run}
              template={template}
              players={players}
              goals={goals}
              submissions={submissions.filter((s) => s.activity_run_id === run.id)}
              onCancel={() => cancel(run)}
              onResolve={() => resolve(run, template)}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
