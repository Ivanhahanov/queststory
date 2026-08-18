"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Player } from "@/lib/types";

export function LeaveGameButton({ player }: { player: Player }) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function leave() {
    setLeaving(true);
    await supabase.rpc("leave_player", { p_player_id: player.id });
    await supabase.auth.signOut();
    router.push(`/play/${player.join_token}`);
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-muted-foreground">
        <LogOut /> Выйти из игры
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Выйти из игры?</DialogTitle>
            <DialogDescription>
              Роль освободится, чтобы её можно было получить заново по той же ссылке — своей или чужой. Если просто
              хотите присоединиться к другой игре, выходить не обязательно — отсканируйте новую ссылку.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={leave} disabled={leaving}>
              <LogOut /> Выйти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
