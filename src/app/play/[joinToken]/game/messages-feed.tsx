import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Message } from "@/lib/types";

export function MessagesFeed({ messages }: { messages: Message[] }) {
  if (messages.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <MessageCircle className="size-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium text-muted-foreground">Сообщения от ведущего</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg bg-muted/60 p-2.5 text-sm">
            <p>{m.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
