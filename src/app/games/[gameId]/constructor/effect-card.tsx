"use client";

import { Trash2 } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EffectTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  status_label: "Статусная метка",
  secret_clue: "Секретная подсказка",
  goal_lock: "Блокировка цели",
  points: "Очки / валюта",
};

const TYPE_HINT: Record<string, string> = {
  status_label: "Короткий бейдж на карточке игрока, например «Ранен» или «Под подозрением»",
  secret_clue: "Личное сообщение-подсказка одному игроку — текст задаётся при выдаче на живой странице",
  goal_lock: "Временно скрывает или блокирует конкретную цель — цель выбирается при выдаче",
  points: "Плюс или минус очков/валюты — значение задаётся при выдаче",
};

const PALETTE = ["#8b5cf6", "#e0973f", "#f43f5e", "#22c55e", "#0ea5e9", "#eab308", "#64748b"];

export function EffectCard({
  effect,
  onChange,
  onRemove,
}: {
  effect: EffectTemplate;
  onChange: (effect: EffectTemplate) => void;
  onRemove: () => void;
}) {
  const supabase = useSupabaseClient();

  async function patch(update: Partial<EffectTemplate>) {
    const { data } = await supabase
      .from("effect_templates")
      .update(update)
      .eq("id", effect.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <span className="mt-2 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: effect.color }} />
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <Input
              defaultValue={effect.name}
              placeholder="Название эффекта"
              onBlur={(e) => patch({ name: e.target.value })}
            />
            <Select value={effect.type} onValueChange={(v) => patch({ type: v ?? undefined })}>
              <SelectTrigger className="w-full">
                <SelectValue>{(value: string) => TYPE_LABEL[value] ?? value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{TYPE_HINT[effect.type]}</p>

        {(effect.type === "status_label" || effect.type === "secret_clue") && (
          <div className="space-y-1">
            <Label className="text-xs">
              {effect.type === "status_label" ? "Текст метки по умолчанию" : "Текст подсказки по умолчанию"}
            </Label>
            <Input
              defaultValue={effect.default_text ?? ""}
              onBlur={(e) => patch({ default_text: e.target.value || null })}
              placeholder={effect.type === "status_label" ? "Отравлен" : "Загляните под половицу у камина"}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          {PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => patch({ color })}
              className={cn(
                "size-8 shrink-0 rounded-full ring-offset-2 ring-offset-card transition-transform hover:scale-110",
                effect.color === color && "ring-2 ring-foreground",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
