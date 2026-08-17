"use client";

import { Trash2 } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type ActivityTemplate,
  type Goal,
  groupVoteConfig,
  pinCodeConfig,
} from "@/lib/types";

const NO_GOAL = "none";

const TYPE_LABEL: Record<string, string> = {
  pin_code: "PIN / код-слово",
  photo_approval: "Фото-подтверждение",
  group_vote: "Групповое голосование",
};

const DISPLAY_MODE_LABEL: Record<string, string> = {
  personal: "На телефоне у игрока",
  kiosk: "На общем экране (планшет ведущего)",
};

export function ActivityCard({
  activity,
  goals,
  onChange,
  onRemove,
}: {
  activity: ActivityTemplate;
  goals: Goal[];
  onChange: (activity: ActivityTemplate) => void;
  onRemove: () => void;
}) {
  const supabase = useSupabaseClient();

  async function patch(update: Partial<ActivityTemplate>) {
    const { data } = await supabase
      .from("activity_templates")
      .update(update)
      .eq("id", activity.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <Input
              defaultValue={activity.name}
              placeholder="Название активности"
              onBlur={(e) => patch({ name: e.target.value })}
            />
            <Select value={activity.type} onValueChange={(v) => patch({ type: v ?? undefined })}>
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

        <Textarea
          defaultValue={activity.instructions}
          placeholder="Инструкция для игроков — что нужно сделать"
          rows={2}
          onBlur={(e) => patch({ instructions: e.target.value })}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Где проходит</Label>
            <Select
              value={activity.display_mode}
              onValueChange={(v) => patch({ display_mode: v ?? undefined })}
            >
              <SelectTrigger className="w-full">
                <SelectValue>{(value: string) => DISPLAY_MODE_LABEL[value] ?? value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">На телефоне у игрока</SelectItem>
                <SelectItem value="kiosk">На общем экране (планшет ведущего)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Засчитывает цель</Label>
            <Select
              value={activity.linked_goal_id ?? NO_GOAL}
              onValueChange={(v) => patch({ linked_goal_id: v === NO_GOAL ? null : v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NO_GOAL ? "Без привязки" : goals.find((g) => g.id === value)?.title ?? value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_GOAL}>Без привязки</SelectItem>
                {goals.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {activity.type === "pin_code" && (
          <div className="space-y-1">
            <Label className="text-xs">Правильный код</Label>
            <Input
              defaultValue={pinCodeConfig(activity.config).correctCode}
              placeholder="1234"
              onBlur={(e) => patch({ config: { correctCode: e.target.value } })}
              className="max-w-40"
            />
          </div>
        )}

        {activity.type === "group_vote" && (
          <div className="space-y-1">
            <Label className="text-xs">Варианты голосования (по одному на строке)</Label>
            <Textarea
              defaultValue={groupVoteConfig(activity.config).options.join("\n")}
              rows={3}
              onBlur={(e) =>
                patch({
                  config: {
                    options: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
