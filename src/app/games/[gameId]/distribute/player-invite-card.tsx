"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, RefreshCw, Shuffle, Trash2 } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dicebearUrl } from "@/lib/dicebear";
import { inviteUrl } from "@/lib/invite-url";
import type { Player, Role } from "@/lib/types";

const UNASSIGNED = "unassigned";

export function PlayerInviteCard({
  player,
  roles,
  assignedRoleIds,
  onChange,
  onRemove,
}: {
  player: Player;
  roles: Role[];
  assignedRoleIds: Set<string | null>;
  onChange: (player: Player) => void;
  onRemove: () => void;
}) {
  const supabase = useSupabaseClient();
  const [copied, setCopied] = useState(false);
  const role = roles.find((r) => r.id === player.role_id) ?? null;
  const link = inviteUrl(player.join_token);

  const availableRoles = roles.filter((r) => r.id === player.role_id || !assignedRoleIds.has(r.id));
  const freeRoles = roles.filter((r) => !assignedRoleIds.has(r.id));

  async function assignRole(roleId: string | null) {
    const { data } = await supabase
      .from("players")
      .update({ role_id: roleId, assigned_at: new Date().toISOString() })
      .eq("id", player.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  async function assignRandom() {
    if (freeRoles.length === 0) return;
    const pick = freeRoles[Math.floor(Math.random() * freeRoles.length)];
    await assignRole(pick.id);
  }

  async function regenerateLink() {
    const token = crypto.randomUUID().replace(/-/g, "");
    const { data } = await supabase
      .from("players")
      .update({ join_token: token })
      .eq("id", player.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function remove() {
    await supabase.from("players").delete().eq("id", player.id);
    onRemove();
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-muted"
            style={{ borderColor: role?.color ?? "var(--border)" }}
          >
            {role ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dicebearUrl(role.avatar_style, role.avatar_seed)} alt={role.name} className="size-full" />
            ) : (
              <span className="text-xs text-muted-foreground">?</span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <Select
              value={player.role_id ?? UNASSIGNED}
              onValueChange={(v) => assignRole(v === UNASSIGNED ? null : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Роль">
                  {(value: string) =>
                    value === UNASSIGNED ? "Роль не назначена" : roles.find((r) => r.id === value)?.name ?? value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Без роли</SelectItem>
                {availableRoles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {player.display_name ? (
              <Badge variant="secondary" className="gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Зашёл как «{player.display_name}»
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Ждём игрока
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={remove}>
            <Trash2 />
          </Button>
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={assignRandom} disabled={freeRoles.length === 0}>
          <Shuffle /> Случайная роль
        </Button>

        <div className="flex justify-center rounded-lg bg-white p-3">
          <QRCodeSVG value={link} size={140} />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={copyLink}>
            {copied ? <Check /> : <Copy />} {copied ? "Скопировано" : "Скопировать ссылку"}
          </Button>
          <Button variant="ghost" size="icon" onClick={regenerateLink} title="Перевыпустить ссылку">
            <RefreshCw />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
