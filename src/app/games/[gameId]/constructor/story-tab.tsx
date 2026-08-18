"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ACCENT_PALETTE } from "@/lib/theme-color";
import { cn } from "@/lib/utils";
import type { Game } from "@/lib/types";

export function StoryTab({ game, onChange }: { game: Game; onChange: (game: Game) => void }) {
  const [synopsis, setSynopsis] = useState(game.story_synopsis);
  const [commonGoal, setCommonGoal] = useState(game.common_goal);
  const supabase = useSupabaseClient();
  const router = useRouter();

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

  async function saveAccentColor(value: string) {
    const { data } = await supabase
      .from("games")
      .update({ accent_color: value })
      .eq("id", game.id)
      .select()
      .single();
    if (data) {
      onChange(data);
      // accent_color also drives the shared game layout (server component) — force it to refetch.
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
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

      <Card>
        <CardHeader>
          <CardTitle>Цвет темы</CardTitle>
          <CardDescription>
            Акцентный цвет всей игры — панели ведущего, страницы игрока и общего экрана активностей.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2.5">
          {ACCENT_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => saveAccentColor(color)}
              className={cn(
                "size-9 shrink-0 rounded-full ring-offset-2 ring-offset-card transition-transform hover:scale-110",
                game.accent_color.toLowerCase() === color && "ring-2 ring-foreground",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
          <label
            className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border text-[0.6rem] text-muted-foreground"
            title="Свой цвет"
          >
            <input
              type="color"
              value={game.accent_color}
              onChange={(e) => saveAccentColor(e.target.value)}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
            свой
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
