"use client";

import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export function PinPad({
  length,
  value,
  onChange,
  onComplete,
  disabled,
}: {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}) {
  function press(key: string) {
    if (disabled) return;
    if (key === "back") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= length) return;
    const next = value + key;
    onChange(next);
    if (next.length === length) onComplete?.(next);
  }

  return (
    <div className="mx-auto w-full max-w-xs space-y-6">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex size-11 items-center justify-center rounded-lg border-2 text-xl font-semibold",
              i < value.length ? "border-primary bg-primary/10" : "border-border/60",
            )}
          >
            {value[i] ?? ""}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key, i) => {
          if (key === "") return <div key={i} />;
          return (
            <button
              key={i}
              type="button"
              onClick={() => press(key)}
              disabled={disabled}
              className="flex h-14 items-center justify-center rounded-xl bg-muted text-xl font-semibold transition-colors hover:bg-muted/70 active:bg-muted/50 disabled:opacity-50"
            >
              {key === "back" ? <Delete className="size-5" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
