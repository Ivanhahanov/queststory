"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  active: "Идёт игра",
  paused: "На паузе",
  finished: "Завершена",
};

export function GameCard({
  game,
  onDeleted,
}: {
  game: { id: string; title: string; status: string; created_at: string };
  onDeleted: () => void;
}) {
  const supabase = useSupabaseClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    await supabase.from("games").delete().eq("id", game.id);
    setDeleting(false);
    setConfirmOpen(false);
    onDeleted();
  }

  return (
    <>
      <Link href={`/games/${game.id}/constructor`} className="block">
        <Card className="h-full transition-colors hover:border-primary/50">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">{game.title}</CardTitle>
              <div className="flex shrink-0 items-center gap-1">
                <Badge variant="secondary">{STATUS_LABEL[game.status] ?? game.status}</Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Удалить игру"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmOpen(true);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <CardDescription>
              {new Date(game.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить «{game.title}»?</DialogTitle>
            <DialogDescription>
              Роли, цели, раунды, участники и вся история игры удалятся безвозвратно.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              <Trash2 /> Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
