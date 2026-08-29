"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VoteResults } from "@/lib/vote-results";

type Activity = {
  runId: string;
  type: "pin_code" | "photo_approval" | "group_vote";
  name: string;
  instructions: string;
  options?: string[];
  results?: VoteResults;
};

export function PersonalActivities({ gameId, playerId }: { gameId: string; playerId: string }) {
  const supabase = useSupabaseClient();
  const [activities, setActivities] = useState<Activity[]>([]);

  async function refresh() {
    const res = await fetch(`/api/games/${gameId}/active-activities`);
    if (!res.ok) return;
    const data = await res.json();
    setActivities(data.activities ?? []);
  }

  useEffect(() => {
    Promise.resolve().then(() => refresh());
    const channel = supabase
      .channel(`activities:game-${gameId}`)
      .on("broadcast", { event: "activity_started" }, () => refresh())
      .on("broadcast", { event: "vote_cast" }, () => refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, supabase]);

  if (activities.length === 0) return null;

  return (
    <div className="space-y-3">
      {activities.map((a) => (
        <ActivityCard key={a.runId} activity={a} playerId={playerId} gameId={gameId} onDone={refresh} />
      ))}
    </div>
  );
}

function VoteResultsView({ results }: { results?: VoteResults }) {
  if (!results || results.visibility === "closed") return null;

  if (results.visibility === "anonymous") {
    const total = Object.values(results.counts).reduce((s, n) => s + n, 0) || 1;
    return (
      <div className="w-full space-y-1.5 text-left">
        {Object.entries(results.counts).map(([option, count]) => (
          <div key={option} className="space-y-0.5">
            <div className="flex items-center justify-between text-xs">
              <span>{option}</span>
              <span className="text-muted-foreground">{count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(count / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-1 text-left text-xs">
      {results.votes.map((v, i) => (
        <div key={i} className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1">
          <span className="text-muted-foreground">{v.playerName}</span>
          <span className="font-medium">{v.choice}</span>
        </div>
      ))}
    </div>
  );
}

function ActivityCard({
  activity,
  playerId,
  gameId,
  onDone,
}: {
  activity: Activity;
  playerId: string;
  gameId: string;
  onDone: () => void;
}) {
  const supabase = useSupabaseClient();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submitPin() {
    if (!code.trim()) return;
    setPending(true);
    const res = await fetch(`/api/activity-runs/${activity.runId}/submit-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    setPending(false);
    if (data.correct) {
      toast("Верно!");
      setDone(true);
      onDone();
    } else {
      toast.error("Неверный код");
      setCode("");
    }
  }

  async function submitVote(choice: string) {
    setPending(true);
    await fetch(`/api/activity-runs/${activity.runId}/submit-vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice }),
    });
    setPending(false);
    setDone(true);
    toast("Голос учтён");
    onDone();
    supabase.channel(`activities:game-${gameId}`).send({ type: "broadcast", event: "vote_cast", payload: {} });
  }

  async function submitPhoto(file: File) {
    setPending(true);
    const path = `${gameId}/${playerId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("activity-photos").upload(path, file);
    if (uploadError) {
      toast.error("Не удалось загрузить фото");
      setPending(false);
      return;
    }
    const { data: pub } = supabase.storage.from("activity-photos").getPublicUrl(path);
    await supabase.from("activity_submissions").insert({
      activity_run_id: activity.runId,
      player_id: playerId,
      payload: { photo_url: pub.publicUrl },
      status: "pending",
    });
    setPending(false);
    setDone(true);
    toast("Фото отправлено ведущему на проверку");
  }

  if (done) {
    if (activity.type === "group_vote" && activity.results && activity.results.visibility !== "closed") {
      return (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-primary">
              <Check className="size-4" /> Голос учтён
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VoteResultsView results={activity.results} />
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-2 text-sm text-primary">
          <Check className="size-4" /> Отправлено, ждём ведущего
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{activity.name}</CardTitle>
        {activity.instructions && <p className="text-xs text-muted-foreground">{activity.instructions}</p>}
      </CardHeader>
      <CardContent className="space-y-2">
        {activity.type === "pin_code" && (
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitPin()}
              placeholder="Код"
            />
            <Button onClick={submitPin} disabled={pending}>
              Ввести
            </Button>
          </div>
        )}

        {activity.type === "group_vote" && (
          <div className="grid gap-2">
            {(activity.options ?? []).map((option) => (
              <Button key={option} variant="outline" onClick={() => submitVote(option)} disabled={pending}>
                {option}
              </Button>
            ))}
          </div>
        )}

        {activity.type === "photo_approval" && (
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            disabled={pending}
            onChange={(e) => e.target.files?.[0] && submitPhoto(e.target.files[0])}
          />
        )}
      </CardContent>
    </Card>
  );
}
