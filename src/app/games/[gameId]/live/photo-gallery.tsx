"use client";

import { useEffect, useState } from "react";
import { Download, Image as ImageIcon } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivitySubmission, Player } from "@/lib/types";

export function PhotoGallery({ gameId, players }: { gameId: string; players: Player[] }) {
  const supabase = useSupabaseClient();
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);

  useEffect(() => {
    supabase
      .from("activity_runs")
      .select("id")
      .eq("game_id", gameId)
      .then(({ data: runs }) => {
        const runIds = (runs ?? []).map((r) => r.id);
        if (runIds.length === 0) return;
        supabase
          .from("activity_submissions")
          .select("*")
          .in("activity_run_id", runIds)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .then(({ data }) => setSubmissions(data ?? []));
      });
  }, [gameId, supabase]);

  useEffect(() => {
    const channel = supabase
      .channel(`photos-${gameId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_submissions" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const old = payload.old as ActivitySubmission;
          setSubmissions((prev) => prev.filter((s) => s.id !== old.id));
          return;
        }
        const row = payload.new as ActivitySubmission;
        setSubmissions((prev) => {
          if (row.status !== "approved") return prev.filter((s) => s.id !== row.id);
          return prev.some((s) => s.id === row.id) ? prev.map((s) => (s.id === row.id ? row : s)) : [row, ...prev];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  const photos = submissions
    .map((s) => ({ id: s.id, playerId: s.player_id, url: (s.payload as { photo_url?: string })?.photo_url }))
    .filter((p): p is { id: string; playerId: string | null; url: string } => !!p.url);

  if (photos.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ImageIcon className="size-4" /> Фото игры ({photos.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {photos.map((photo) => {
          const player = players.find((p) => p.id === photo.playerId);
          return (
            <a
              key={photo.id}
              href={photo.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={player?.display_name ?? "Фото"}
                className="size-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-[0.65rem] text-white opacity-0 transition-opacity group-hover:opacity-100">
                <span className="truncate">{player?.display_name ?? "Игрок"}</span>
                <Download className="size-3 shrink-0" />
              </div>
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}
