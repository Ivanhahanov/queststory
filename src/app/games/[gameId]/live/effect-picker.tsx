"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EffectTemplate, Goal, Player, PlayerEffect } from "@/lib/types";

export function EffectPicker({
  player,
  templates,
  goals,
  onApplied,
}: {
  player: Player;
  templates: EffectTemplate[];
  goals: Goal[];
  onApplied: (row: PlayerEffect) => void;
}) {
  const [templateId, setTemplateId] = useState<string>("");
  const [customText, setCustomText] = useState("");
  const [value, setValue] = useState("");
  const [targetGoalId, setTargetGoalId] = useState<string>("");
  const [applying, setApplying] = useState(false);

  const template = templates.find((t) => t.id === templateId) ?? null;

  async function apply() {
    if (!template) return;
    setApplying(true);
    const res = await fetch(`/api/games/${player.game_id}/players/${player.id}/effect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        effectTemplateId: template.id,
        customText: customText.trim() || null,
        value: template.type === "points" ? Number(value) || 0 : null,
        targetGoalId: template.type === "goal_lock" ? targetGoalId || null : null,
      }),
    });
    if (res.ok) {
      const { effect } = await res.json();
      onApplied(effect);
      setCustomText("");
      setValue("");
      setTargetGoalId("");
      setTemplateId("");
    }
    setApplying(false);
  }

  if (templates.length === 0) {
    return <p className="text-sm text-muted-foreground">Сначала добавьте шаблоны эффектов в конструкторе.</p>;
  }

  return (
    <div className="space-y-2">
      <Select value={templateId} onValueChange={(v) => setTemplateId(v ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите эффект">
            {(v: string) => templates.find((t) => t.id === v)?.name ?? v}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {template?.type === "status_label" && (
        <Input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={template.default_text ?? "Текст метки"}
        />
      )}

      {template?.type === "secret_clue" && (
        <Input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={template.default_text ?? "Текст подсказки"}
        />
      )}

      {template?.type === "points" && (
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Например -5 или 10"
        />
      )}

      {template?.type === "goal_lock" && (
        <Select value={targetGoalId} onValueChange={(v) => setTargetGoalId(v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Какую цель заблокировать">
              {(v: string) => goals.find((g) => g.id === v)?.title ?? v}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {goals.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        variant="secondary"
        onClick={apply}
        disabled={!template || applying || (template.type === "goal_lock" && !targetGoalId)}
      >
        <Sparkles /> Применить
      </Button>
    </div>
  );
}
