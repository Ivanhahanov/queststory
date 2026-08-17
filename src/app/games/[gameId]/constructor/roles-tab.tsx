"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { randomAvatarSeed } from "@/lib/dicebear";
import type { Role } from "@/lib/types";
import { RoleCard } from "./role-card";

export function RolesTab({
  gameId,
  roles,
  onChange,
}: {
  gameId: string;
  roles: Role[];
  onChange: (roles: Role[]) => void;
}) {
  const supabase = useSupabaseClient();
  const [busy, setBusy] = useState(false);

  async function addRole() {
    setBusy(true);
    const { data } = await supabase
      .from("roles")
      .insert({
        game_id: gameId,
        name: `Роль ${roles.length + 1}`,
        avatar_seed: randomAvatarSeed(),
      })
      .select()
      .single();
    if (data) onChange([...roles, data]);
    setBusy(false);
  }

  async function removeRole(id: string) {
    onChange(roles.filter((r) => r.id !== id));
    await supabase.from("roles").delete().eq("id", id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Роли</h2>
          <p className="text-sm text-muted-foreground">
            У каждой роли свой аватар, описание персонажа и набор целей.
          </p>
        </div>
        <Button onClick={addRole} disabled={busy}>
          <Plus /> Добавить роль
        </Button>
      </div>

      {roles.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Ролей пока нет
            </CardTitle>
            <CardDescription>Добавьте первую роль, чтобы начать распределять персонажей.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-3">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            onChange={(updated) => onChange(roles.map((r) => (r.id === role.id ? updated : r)))}
            onRemove={() => removeRole(role.id)}
          />
        ))}
      </div>
    </div>
  );
}
