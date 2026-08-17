import { KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PlayerEffectWithTemplate } from "@/lib/types";

export function EffectsList({ effects }: { effects: PlayerEffectWithTemplate[] }) {
  const labels = effects.filter((e) => e.effect_templates?.type === "status_label");
  const clues = effects.filter((e) => e.effect_templates?.type === "secret_clue");

  if (labels.length === 0 && clues.length === 0) return null;

  return (
    <div className="space-y-3">
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {labels.map((e) => (
            <Badge
              key={e.id}
              style={{
                backgroundColor: `${e.effect_templates?.color}26`,
                color: e.effect_templates?.color ?? undefined,
                borderColor: `${e.effect_templates?.color}55`,
              }}
              className="border"
            >
              {e.custom_text || e.effect_templates?.default_text || e.effect_templates?.name}
            </Badge>
          ))}
        </div>
      )}

      {clues.map((e) => (
        <Card key={e.id} className="border-accent/40 bg-accent/10">
          <CardContent className="flex items-start gap-2.5 text-sm">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>{e.custom_text || e.effect_templates?.default_text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
