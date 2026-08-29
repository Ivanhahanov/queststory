"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { buildScenario } from "@/lib/scenario";
import type { Game, Round, Role, Goal } from "@/lib/types";
import { StoryTab } from "./story-tab";
import { RoundsTab } from "./rounds-tab";
import { RolesTab } from "./roles-tab";
import { EffectsTab } from "./effects-tab";
import { ActivitiesTab } from "./activities-tab";

export function ConstructorShell({
  game: initialGame,
  initialRounds,
  initialRoles,
  initialGoals,
}: {
  game: Game;
  initialRounds: Round[];
  initialRoles: Role[];
  initialGoals: Goal[];
}) {
  const supabase = useSupabaseClient();
  const [game, setGame] = useState(initialGame);
  const [rounds, setRounds] = useState(initialRounds);
  const [roles, setRoles] = useState(initialRoles);
  const [goals, setGoals] = useState(initialGoals);
  const [exporting, setExporting] = useState(false);

  async function exportScenario() {
    setExporting(true);
    const [{ data: effects }, { data: activities }] = await Promise.all([
      supabase.from("effect_templates").select("*").eq("game_id", game.id),
      supabase.from("activity_templates").select("*").eq("game_id", game.id),
    ]);
    const scenario = buildScenario({ game, rounds, roles, goals, effects: effects ?? [], activities: activities ?? [] });
    const blob = new Blob([JSON.stringify(scenario, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${game.title || "questoria"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    toast("Сценарий выгружен в файл");
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportScenario} disabled={exporting}>
          <Download /> Экспорт сценария
        </Button>
      </div>
      <Tabs defaultValue="story">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="story">История</TabsTrigger>
          <TabsTrigger value="rounds">Раунды</TabsTrigger>
          <TabsTrigger value="roles">Роли</TabsTrigger>
          <TabsTrigger value="effects">Эффекты</TabsTrigger>
          <TabsTrigger value="activities">Активности</TabsTrigger>
        </TabsList>

        <TabsContent value="story" className="pt-4">
          <StoryTab game={game} onChange={setGame} />
        </TabsContent>
        <TabsContent value="rounds" className="pt-4">
          <RoundsTab gameId={game.id} rounds={rounds} onChange={setRounds} />
        </TabsContent>
        <TabsContent value="roles" className="pt-4">
          <RolesTab
            gameId={game.id}
            game={game}
            roles={roles}
            goals={goals}
            rounds={rounds}
            onRolesChange={setRoles}
            onGoalsChange={setGoals}
          />
        </TabsContent>
        <TabsContent value="effects" className="pt-4">
          <EffectsTab gameId={game.id} />
        </TabsContent>
        <TabsContent value="activities" className="pt-4">
          <ActivitiesTab gameId={game.id} goals={goals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
