"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Crown, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Message } from "@/lib/types";

const COLLAPSED_COUNT = 5;

function time(m: Message) {
  return new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function MessagesFeed({ messages }: { messages: Message[] }) {
  const [expanded, setExpanded] = useState(false);

  if (messages.length === 0) return null;

  const hiddenCount = messages.length - COLLAPSED_COUNT;
  const visible = expanded || hiddenCount <= 0 ? messages : messages.slice(0, COLLAPSED_COUNT);

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <MessageCircle className="size-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium text-muted-foreground">Сообщения</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {visible.map((m) =>
          m.sender === "system" ? (
            <div key={m.id} className="flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 shrink-0 text-accent" />
              <span className="flex-1">{m.body}</span>
              <span className="shrink-0">{time(m)}</span>
            </div>
          ) : (
            <div key={m.id} className="rounded-lg bg-muted/60 p-2.5 text-sm">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Crown className="size-3.5" />
                Ведущий
              </div>
              <p>{m.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{time(m)}</p>
            </div>
          ),
        )}
        {hiddenCount > 0 && (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setExpanded((v) => !v)}>
            {expanded ? (
              <>
                <ChevronUp /> Скрыть
              </>
            ) : (
              <>
                <ChevronDown /> Показать ещё {hiddenCount}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
