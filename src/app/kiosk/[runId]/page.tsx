"use client";

import { use, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gameThemeStyle } from "@/lib/theme-color";
import { ThemeColorSync } from "@/components/theme-color-sync";
import type { VoteResults } from "@/lib/vote-results";

type KioskInfo = {
  status: string;
  type: "pin_code" | "photo_approval" | "group_vote";
  name: string;
  instructions: string;
  options?: string[];
  results?: VoteResults;
  accentColor: string;
};

function KioskVoteResults({ results }: { results?: VoteResults }) {
  if (!results || results.visibility === "closed") return null;

  if (results.visibility === "anonymous") {
    const total = Object.values(results.counts).reduce((s, n) => s + n, 0) || 1;
    return (
      <div className="w-full space-y-2">
        {Object.entries(results.counts).map(([option, count]) => (
          <div key={option} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{option}</span>
              <span className="text-muted-foreground">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(count / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-1.5 text-sm">
      {results.votes.map((v, i) => (
        <div key={i} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5">
          <span className="text-muted-foreground">{v.playerName}</span>
          <span className="font-medium">{v.choice}</span>
        </div>
      ))}
    </div>
  );
}

export default function KioskPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);
  const [info, setInfo] = useState<KioskInfo | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | "voted" | null>(null);
  const [pending, setPending] = useState(false);

  function loadInfo() {
    return fetch(`/api/activity-runs/${runId}/kiosk-info`)
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo(null));
  }

  useEffect(() => {
    loadInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  async function submitPin() {
    if (!code.trim()) return;
    setPending(true);
    setResult(null);
    const res = await fetch(`/api/activity-runs/${runId}/submit-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    setResult(data.correct ? "correct" : "incorrect");
    setCode("");
    setPending(false);
  }

  async function submitVote(choice: string) {
    setPending(true);
    await fetch(`/api/activity-runs/${runId}/submit-vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice }),
    });
    await loadInfo();
    setResult("voted");
    setPending(false);
  }

  if (!info) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Загрузка…</div>;
  }

  return (
    <main
      style={gameThemeStyle(info.accentColor)}
      className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center"
    >
      <ThemeColorSync color={info.accentColor} />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{info.name}</h1>
        {info.instructions && <p className="max-w-md text-muted-foreground">{info.instructions}</p>}
      </div>

      {info.type === "pin_code" && (
        <div className="w-full max-w-xs space-y-4">
          {result === "correct" ? (
            <div className="flex flex-col items-center gap-2 text-emerald-500">
              <Check className="size-16" />
              <p className="text-xl font-semibold">Открыто!</p>
            </div>
          ) : (
            <>
              <Input
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitPin()}
                placeholder="Код"
                className="h-16 text-center text-2xl tracking-widest"
              />
              {result === "incorrect" && (
                <p className="flex items-center justify-center gap-1.5 text-destructive">
                  <X className="size-5" /> Неверный код, попробуйте ещё раз
                </p>
              )}
              <Button className="h-14 w-full text-lg" onClick={submitPin} disabled={pending}>
                Ввести
              </Button>
            </>
          )}
        </div>
      )}

      {info.type === "group_vote" && (
        <div className="grid w-full max-w-sm gap-3">
          {result === "voted" ? (
            <>
              <p className="text-xl font-semibold text-primary">Голос учтён, спасибо!</p>
              <KioskVoteResults results={info.results} />
            </>
          ) : (
            (info.options ?? []).map((option) => (
              <Button key={option} size="lg" variant="outline" className="h-14 text-lg" onClick={() => submitVote(option)} disabled={pending}>
                {option}
              </Button>
            ))
          )}
          {result === "voted" && (
            <Button variant="ghost" onClick={() => setResult(null)}>
              Голосовать ещё раз
            </Button>
          )}
        </div>
      )}

      {info.type === "photo_approval" && (
        <p className="text-muted-foreground">Эта активность доступна только на телефоне игрока.</p>
      )}
    </main>
  );
}
