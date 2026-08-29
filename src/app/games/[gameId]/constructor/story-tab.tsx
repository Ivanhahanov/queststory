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

  async function saveCardFrame(value: string) {
    const { data } = await supabase.from("games").update({ card_frame: value }).eq("id", game.id).select().single();
    if (data) onChange(data);
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

      <Card>
        <CardHeader>
          <CardTitle>Рамка карточки персонажа</CardTitle>
          <CardDescription>
            Оформление полноэкранной карточки, которую игрок открывает тапом по своей плашке.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {CARD_FRAME_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => saveCardFrame(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg p-2 text-xs transition-colors",
                game.card_frame === value ? "bg-muted ring-2 ring-primary" : "hover:bg-muted/50",
              )}
            >
              <FramePreview frame={value} />
              {label}
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const CARD_FRAME_OPTIONS = [
  { value: "none", label: "Без рамки" },
  { value: "fantasy", label: "Фэнтези" },
  { value: "noir", label: "Нуар" },
  { value: "scifi", label: "Техно" },
] as const;

function FramePreview({ frame }: { frame: (typeof CARD_FRAME_OPTIONS)[number]["value"] }) {
  const swatch = <div className="size-full rounded-[6px] bg-gradient-to-br from-muted-foreground/40 to-muted-foreground/10" />;

  if (frame === "fantasy") {
    return (
      <div className="h-14 w-11 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-700 to-amber-200 p-[2px]">
        <div className="size-full overflow-hidden rounded-[7px] ring-1 ring-white/25">{swatch}</div>
      </div>
    );
  }
  if (frame === "noir") {
    return (
      <div className="h-14 w-11 rounded-md bg-black p-[5px] ring-1 ring-white/10">
        <div className="size-full overflow-hidden rounded-[2px]">{swatch}</div>
      </div>
    );
  }
  if (frame === "scifi") {
    return (
      <div className="relative h-14 w-11 rounded-md bg-primary/10 p-[3px]">
        <div className="size-full overflow-hidden rounded-[4px]">{swatch}</div>
        {(["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"] as const).map(
          (pos) => (
            <span key={pos} className={cn("absolute size-3 border-t-2 border-l-2 border-primary", pos)} />
          ),
        )}
      </div>
    );
  }
  return <div className="h-14 w-11 overflow-hidden rounded-lg">{swatch}</div>;
}
