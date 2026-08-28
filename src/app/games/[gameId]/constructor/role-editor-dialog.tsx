"use client";

import { useState } from "react";
import { Globe2, Plus, Trash2 } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DICEBEAR_STYLES, dicebearUrl } from "@/lib/dicebear";
import { parseAvatarOptions } from "@/lib/avatar-options";
import { cn } from "@/lib/utils";
import type { Goal, Role, Round } from "@/lib/types";
import { AvatarPicker } from "./avatar-picker";
import { GoalRow } from "./goal-row";

const PALETTE = ["#e0973f", "#8b5cf6", "#f43f5e", "#22c55e", "#0ea5e9", "#eab308", "#ec4899", "#64748b"];

export function RoleEditorDialog({
  gameId,
  role,
  goals,
  rounds,
  open,
  onOpenChange,
  onRoleChange,
  onGoalsChange,
  onDeleteRole,
}: {
  gameId: string;
  role: Role | null;
  goals: Goal[];
  rounds: Round[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (role: Role) => void;
  onGoalsChange: (goals: Goal[]) => void;
  onDeleteRole?: () => void;
}) {
  const supabase = useSupabaseClient();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  async function patchRole(update: Partial<Role>) {
    if (!role) return;
    const { data } = await supabase.from("roles").update(update).eq("id", role.id).select().single();
    if (data) onRoleChange(data);
  }

  const scopedGoals = goals
    .filter((g) => g.role_id === (role?.id ?? null))
    .sort((a, b) => a.position - b.position);

  async function addGoal() {
    const position = scopedGoals.length ? Math.max(...scopedGoals.map((g) => g.position)) + 1 : 0;
    const { data } = await supabase
      .from("goals")
      .insert({ game_id: gameId, role_id: role?.id ?? null, title: "Новая цель", position })
      .select()
      .single();
    if (data) onGoalsChange([...goals, data]);
  }

  function updateGoal(updated: Goal) {
    onGoalsChange(goals.map((g) => (g.id === updated.id ? updated : g)));
  }

  async function removeGoal(id: string) {
    onGoalsChange(goals.filter((g) => g.id !== id));
    await supabase.from("goals").delete().eq("id", id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          {role ? (
            <div className="flex items-start gap-3 pr-8">
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl border-2" style={{ borderColor: role.color }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dicebearUrl(role.avatar_style, role.avatar_seed, parseAvatarOptions(role.avatar_options))}
                    alt={role.name}
                    className="size-full"
                  />
                </div>
                <AvatarPicker
                  style={role.avatar_style}
                  currentSeed={role.avatar_seed}
                  options={parseAvatarOptions(role.avatar_options)}
                  onSelect={(seed) => patchRole({ avatar_seed: seed, avatar_options: {} })}
                  onSelectOptions={(options) => patchRole({ avatar_options: options })}
                />
              </div>
              <div className="min-w-0 flex-1 self-center text-left">
                <DialogTitle>Роль</DialogTitle>
                <DialogDescription className="sr-only">Настройки роли и её целей</DialogDescription>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/10 text-primary">
                <Globe2 className="size-7" />
              </div>
              <div>
                <DialogTitle>Общие цели</DialogTitle>
                <DialogDescription>Видны всем игрокам, независимо от роли</DialogDescription>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="-mx-4 flex-1 space-y-5 overflow-y-auto px-4">
          {role && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input defaultValue={role.name} placeholder="Имя роли" onBlur={(e) => patchRole({ name: e.target.value })} />
                <Select
                  value={role.avatar_style}
                  onValueChange={(v) => patchRole({ avatar_style: v ?? undefined, avatar_options: {} })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Стиль аватара">
                      {(value: string) => DICEBEAR_STYLES.find((s) => s.id === value)?.label ?? value}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {DICEBEAR_STYLES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                defaultValue={role.description}
                placeholder="Описание персонажа — предыстория, характер, отношения с другими"
                rows={3}
                onBlur={(e) => patchRole({ description: e.target.value })}
              />

              <div className="flex flex-wrap items-center gap-2.5">
                {PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    onClick={() => patchRole({ color })}
                    className={cn(
                      "size-8 shrink-0 rounded-full ring-offset-2 ring-offset-popover transition-transform hover:scale-110",
                      role.color === color && "ring-2 ring-foreground",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <Separator />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Цели</h3>
              <Button variant="outline" size="sm" onClick={addGoal}>
                <Plus /> Цель
              </Button>
            </div>
            {scopedGoals.length === 0 && <p className="text-sm text-muted-foreground">Целей пока нет</p>}
            <div className="space-y-2">
              {scopedGoals.map((goal) => (
                <GoalRow key={goal.id} goal={goal} rounds={rounds} onChange={updateGoal} onRemove={() => removeGoal(goal.id)} />
              ))}
            </div>
          </div>
        </div>

        {role && onDeleteRole && (
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 /> Удалить роль
            </Button>
          </DialogFooter>
        )}
      </DialogContent>

      {role && onDeleteRole && (
        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Удалить роль «{role.name}»?</DialogTitle>
              <DialogDescription>
                Все цели этой роли удалятся безвозвратно. Если роль уже назначена игроку, он её лишится.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setConfirmDeleteOpen(false);
                  onDeleteRole();
                }}
              >
                <Trash2 /> Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
