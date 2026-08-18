"use client";

import { Trash2 } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DICEBEAR_STYLES, dicebearUrl } from "@/lib/dicebear";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AvatarPicker } from "./avatar-picker";

const PALETTE = [
  "#e0973f",
  "#8b5cf6",
  "#f43f5e",
  "#22c55e",
  "#0ea5e9",
  "#eab308",
  "#ec4899",
  "#64748b",
];

export function RoleCard({
  role,
  onChange,
  onRemove,
}: {
  role: Role;
  onChange: (role: Role) => void;
  onRemove: () => void;
}) {
  const supabase = useSupabaseClient();

  async function patch(update: Partial<Role>) {
    const { data } = await supabase.from("roles").update(update).eq("id", role.id).select().single();
    if (data) onChange(data);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div
            className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border-2"
            style={{ borderColor: role.color }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dicebearUrl(role.avatar_style, role.avatar_seed)}
              alt={role.name}
              className="size-full"
            />
          </div>
          <AvatarPicker
            style={role.avatar_style}
            currentSeed={role.avatar_seed}
            onSelect={(seed) => patch({ avatar_seed: seed })}
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="sr-only">Имя роли</Label>
              <Input
                defaultValue={role.name}
                placeholder="Имя роли"
                onBlur={(e) => patch({ name: e.target.value })}
              />
            </div>
            <Select
              value={role.avatar_style}
              onValueChange={(v) => patch({ avatar_style: v ?? undefined })}
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
            onBlur={(e) => patch({ description: e.target.value })}
          />

          <div className="flex flex-wrap items-center gap-2.5">
            {PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={color}
                onClick={() => patch({ color })}
                className={cn(
                  "size-8 shrink-0 rounded-full ring-offset-2 ring-offset-card transition-transform hover:scale-110",
                  role.color === color && "ring-2 ring-foreground",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onRemove} className="self-start">
          <Trash2 />
        </Button>
      </CardContent>
    </Card>
  );
}
