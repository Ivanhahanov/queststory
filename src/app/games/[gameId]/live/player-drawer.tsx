"use client";

import { useState } from "react";
import { Send, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseClient } from "@/hooks/use-supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { roleAvatarUrl } from "@/lib/avatar-options";
import type {
  EffectTemplate,
  Goal,
  Message,
  Player,
  PlayerEffect,
  PlayerGoalProgress,
  Role,
} from "@/lib/types";
import { EffectPicker } from "./effect-picker";

export function PlayerDrawer({
  player,
  role,
  goals,
  progress,
  effectTemplates,
  playerEffects,
  messages,
  open,
  onOpenChange,
  onProgressChange,
  onMessageSent,
  onMessageDeleted,
  onEffectApplied,
}: {
  player: Player | null;
  role: Role | null;
  goals: Goal[];
  progress: PlayerGoalProgress[];
  effectTemplates: EffectTemplate[];
  playerEffects: PlayerEffect[];
  messages: Message[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProgressChange: (row: PlayerGoalProgress) => void;
  onMessageSent: (row: Message) => void;
  onMessageDeleted: (id: string) => void;
  onEffectApplied: (row: PlayerEffect) => void;
}) {
  const supabase = useSupabaseClient();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  if (!player) return <Dialog open={open} onOpenChange={onOpenChange} />;

  const applicableGoals = goals.filter((g) => g.role_id === null || g.role_id === player.role_id);
  const playerMessages = messages.filter((m) => m.player_id === player.id).slice(0, 10);
  const playerEffectsForThis = playerEffects.filter((e) => e.player_id === player.id);

  async function toggleGoal(goal: Goal, completed: boolean) {
    const existing = progress.find((p) => p.player_id === player!.id && p.goal_id === goal.id);
    const { data } = await supabase
      .from("player_goal_progress")
      .upsert(
        {
          id: existing?.id,
          player_id: player!.id,
          goal_id: goal.id,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        },
        { onConflict: "player_id,goal_id" },
      )
      .select()
      .single();
    if (data) onProgressChange(data);
  }

  async function sendMessage() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    const res = await fetch(`/api/games/${player!.game_id}/players/${player!.id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    });
    if (res.ok) {
      const { message } = await res.json();
      onMessageSent(message);
      setBody("");
    }
    setSending(false);
  }

  async function deleteMessage(id: string) {
    onMessageDeleted(id);
    await supabase.from("messages").delete().eq("id", id);
  }

  // См. распределение ролей — та же кнопка для случая, когда игрок теряет
  // доступ уже посреди игры (сменил телефон, поставил приложение поздно).
  async function resetDevice() {
    await supabase.from("players").update({ auth_user_id: null }).eq("id", player!.id);
    toast("Привязка к устройству сброшена — можно снова открыть ту же ссылку");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2"
              style={{ borderColor: role?.color ?? "var(--border)" }}
            >
              {role && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={roleAvatarUrl(role)} alt={role.name} className="size-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <DialogTitle>{player.display_name ?? "Ждём игрока"}</DialogTitle>
              <DialogDescription>{role?.name ?? "Роль не назначена"}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="-mx-4 flex-1 space-y-5 overflow-y-auto px-4">
          {player.auth_user_id && (
            <Button variant="outline" size="sm" onClick={resetDevice}>
              <Smartphone /> Сбросить привязку к устройству
            </Button>
          )}

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Цели</h3>
            {applicableGoals.length === 0 && <p className="text-sm text-muted-foreground">Нет целей</p>}
            {applicableGoals.map((goal) => {
              const done = progress.some((p) => p.player_id === player.id && p.goal_id === goal.id && p.completed);
              return (
                <label
                  key={goal.id}
                  className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-2.5 hover:bg-muted/50"
                >
                  <Checkbox checked={done} onCheckedChange={(v) => toggleGoal(goal, v === true)} className="mt-0.5" />
                  <span className="text-sm">{goal.title}</span>
                </label>
              );
            })}
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Наложить эффект</h3>
            <EffectPicker player={player} templates={effectTemplates} goals={applicableGoals} onApplied={onEffectApplied} />
            {playerEffectsForThis.length > 0 && (
              <p className="text-xs text-muted-foreground">Активных эффектов: {playerEffectsForThis.length}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Сообщение игроку</h3>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Загляните под половицу…" rows={2} />
            <Button onClick={sendMessage} disabled={sending || !body.trim()}>
              <Send /> Отправить
            </Button>
            {playerMessages.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {playerMessages.map((m) => (
                  <div key={m.id} className="flex items-start gap-2 rounded-lg bg-muted/50 p-2 text-xs">
                    <span className="min-w-0 flex-1">{m.body}</span>
                    <button
                      type="button"
                      onClick={() => deleteMessage(m.id)}
                      aria-label="Удалить сообщение"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
