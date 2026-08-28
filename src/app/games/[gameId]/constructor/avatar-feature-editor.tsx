"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AVATAR_FEATURE_CONFIG, sanitizeAvatarOptions } from "@/lib/avatar-options";
import { dicebearUrl } from "@/lib/dicebear";
import { cn } from "@/lib/utils";

export function AvatarFeatureEditor({
  style,
  seed,
  options,
  onChange,
}: {
  style: string;
  seed: string;
  options: Record<string, string>;
  onChange: (options: Record<string, string>) => void;
}) {
  const features = AVATAR_FEATURE_CONFIG[style] ?? [];
  const [openKey, setOpenKey] = useState<string | null>(features[0]?.key ?? null);
  const clean = sanitizeAvatarOptions(style, options);

  function selectValue(featureKey: string, value: string) {
    onChange(sanitizeAvatarOptions(style, { ...clean, [featureKey]: value }));
  }

  return (
    <div className="space-y-2">
      {features.map((feature) => {
        const open = openKey === feature.key;
        const selected = clean[feature.key];
        return (
          <div key={feature.key} className="rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setOpenKey(open ? null : feature.key)}
              className="flex w-full items-center justify-between gap-2 p-3 text-left text-sm font-medium"
            >
              <span>{feature.label}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {selected ?? "по умолчанию"}
                <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
              </span>
            </button>
            {open && (
              <div className="grid grid-cols-6 gap-2 p-3 pt-0 sm:grid-cols-8">
                {feature.values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectValue(feature.key, value)}
                    className={cn(
                      "overflow-hidden rounded-lg border-2 border-transparent bg-muted transition-colors hover:border-primary/60",
                      selected === value && "border-primary",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dicebearUrl(style, seed, { ...clean, [feature.key]: value })}
                      alt={value}
                      loading="lazy"
                      className="size-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
