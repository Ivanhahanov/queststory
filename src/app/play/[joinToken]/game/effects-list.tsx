import { KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PlayerEffectWithTemplate } from "@/lib/types";

// status_label эффекты показаны прямо на аватарке в RoleHeader (рамка +
// подпись поверх фото) — здесь остаются только secret_clue, у них другая
// механика (полноценный текст подсказки, не короткий тег).
export function EffectsList({ effects }: { effects: PlayerEffectWithTemplate[] }) {
  const clues = effects.filter((e) => e.effect_templates?.type === "secret_clue");

  if (clues.length === 0) return null;

  return (
    <div className="space-y-3">
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
