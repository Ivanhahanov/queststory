"use client";

import { useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Game } from "@/lib/types";

export function StoryTab({ game, onChange }: { game: Game; onChange: (game: Game) => void }) {
  const [synopsis, setSynopsis] = useState(game.story_synopsis);
  const [commonGoal, setCommonGoal] = useState(game.common_goal);
  const supabase = useSupabaseClient();

  async function saveSynopsis(value: string) {
    const { data } = await supabase
      .from("games")
      .update({ story_synopsis: value })
      .eq("id", game.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  async function saveCommonGoal(value: string) {
    const { data } = await supabase
      .from("games")
      .update({ common_goal: value })
      .eq("id", game.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>История и общая цель</CardTitle>
        <CardDescription>
          Игроки увидят это на своей странице — задайте атмосферу и то, к чему стремится вся группа.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="synopsis">Сюжет</Label>
          <Textarea
            id="synopsis"
            rows={8}
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            onBlur={() => saveSynopsis(synopsis)}
            placeholder="В ночь на пятницу хозяин усадьбы, граф Воронов, был найден мёртвым в своём кабинете…"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="common-goal">Общая цель</Label>
          <Textarea
            id="common-goal"
            rows={3}
            value={commonGoal}
            onChange={(e) => setCommonGoal(e.target.value)}
            onBlur={() => saveCommonGoal(commonGoal)}
            placeholder="Узнать, кто убил графа, до того как часы пробьют полночь"
          />
        </div>
      </CardContent>
    </Card>
  );
}
