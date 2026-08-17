"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Radio } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { Game, Round, Role, Goal } from "@/lib/types";
import { GameTitleEditor } from "./game-title-editor";
import { StoryTab } from "./story-tab";
import { RoundsTab } from "./rounds-tab";
import { RolesTab } from "./roles-tab";
import { GoalsTab } from "./goals-tab";
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
  const [game, setGame] = useState(initialGame);
  const [rounds, setRounds] = useState(initialRounds);
  const [roles, setRoles] = useState(initialRoles);
  const [goals, setGoals] = useState(initialGoals);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/games" />}>
            <ArrowLeft />
          </Button>
          <GameTitleEditor game={game} onChange={setGame} />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/games/${game.id}/distribute`} />}
          >
            <Users /> Раздача ролей
          </Button>
          <Button nativeButton={false} render={<Link href={`/games/${game.id}/live`} />}>
            <Radio /> Живая игра
          </Button>
        </div>
      </div>

      <Tabs defaultValue="story">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="story">История</TabsTrigger>
          <TabsTrigger value="rounds">Раунды</TabsTrigger>
          <TabsTrigger value="roles">Роли</TabsTrigger>
          <TabsTrigger value="goals">Цели</TabsTrigger>
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
          <RolesTab gameId={game.id} roles={roles} onChange={setRoles} />
        </TabsContent>
        <TabsContent value="goals" className="pt-4">
          <GoalsTab gameId={game.id} goals={goals} roles={roles} rounds={rounds} onChange={setGoals} />
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
