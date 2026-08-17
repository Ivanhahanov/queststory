"use client";

import { QRCodeSVG } from "qrcode.react";
import { Check, Square, X } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActivityRun, ActivitySubmission, ActivityTemplate, Goal, Player } from "@/lib/types";
import { groupVoteConfig } from "@/lib/types";

export function ActivityRunCard({
  run,
  template,
  players,
  submissions,
  onCancel,
  onResolve,
}: {
  run: ActivityRun;
  template: ActivityTemplate;
  players: Player[];
  goals: Goal[];
  submissions: ActivitySubmission[];
  onCancel: () => void;
  onResolve: () => void;
}) {
  const supabase = useSupabaseClient();
  const kioskUrl =
    typeof window !== "undefined" ? `${window.location.origin}/kiosk/${run.id}` : `/kiosk/${run.id}`;

  async function reviewPhoto(submission: ActivitySubmission, status: "approved" | "rejected") {
    await supabase.from("activity_submissions").update({ status }).eq("id", submission.id);
    if (status === "approved") onResolve();
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{template.name}</p>
        <Button variant="ghost" size="icon-sm" onClick={onCancel} title="Остановить">
          <Square />
        </Button>
      </div>

      {template.type === "pin_code" && template.display_mode === "kiosk" && (
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-white p-2">
            <QRCodeSVG value={kioskUrl} size={80} />
          </div>
          <p className="text-xs break-all text-muted-foreground">{kioskUrl}</p>
        </div>
      )}

      {template.type === "pin_code" && (
        <div className="space-y-1">
          {submissions.length === 0 && <p className="text-xs text-muted-foreground">Пока нет попыток</p>}
          {submissions
            .slice()
            .reverse()
            .map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="font-mono">{(s.payload as { code?: string })?.code}</span>
                <Badge variant={s.status === "correct" ? "default" : "secondary"} className="text-[0.65rem]">
                  {s.status === "correct" ? "Верно" : "Неверно"}
                </Badge>
              </div>
            ))}
        </div>
      )}

      {template.type === "group_vote" && (
        <div className="space-y-2">
          <div className="space-y-1">
            {groupVoteConfig(template.config).options.map((option) => {
              const count = submissions.filter((s) => (s.payload as { choice?: string })?.choice === option).length;
              return (
                <div key={option} className="flex items-center justify-between text-xs">
                  <span>{option}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
          <Button size="sm" variant="secondary" onClick={onResolve}>
            <Check /> Завершить голосование
          </Button>
        </div>
      )}

      {template.type === "photo_approval" && (
        <div className="space-y-2">
          {submissions.filter((s) => s.status === "pending").length === 0 && (
            <p className="text-xs text-muted-foreground">Пока нет фото на проверку</p>
          )}
          {submissions
            .filter((s) => s.status === "pending")
            .map((s) => {
              const photoUrl = (s.payload as { photo_url?: string })?.photo_url;
              const submitter = players.find((p) => p.id === s.player_id);
              return (
                <div key={s.id} className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                  {photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="Фото" className="size-14 shrink-0 rounded object-cover" />
                  )}
                  <p className="flex-1 text-xs">{submitter?.display_name ?? "Игрок"}</p>
                  <Button size="icon-sm" variant="ghost" onClick={() => reviewPhoto(s, "approved")}>
                    <Check className="text-emerald-500" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => reviewPhoto(s, "rejected")}>
                    <X className="text-destructive" />
                  </Button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
