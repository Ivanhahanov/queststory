"use client";

import { useState } from "react";
import { RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { dicebearUrl, randomAvatarSeed } from "@/lib/dicebear";
import { cn } from "@/lib/utils";

export function AvatarPicker({
  style,
  currentSeed,
  onSelect,
}: {
  style: string;
  currentSeed: string;
  onSelect: (seed: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [batch, setBatch] = useState<string[]>([currentSeed]);

  function regenerate() {
    setBatch([currentSeed, ...Array.from({ length: 11 }, () => randomAvatarSeed())]);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) regenerate();
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Wand2 /> Изменить аватар
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Выберите аватар</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2.5">
          {batch.map((seed, i) => (
            <button
              key={`${seed}-${i}`}
              type="button"
              onClick={() => {
                onSelect(seed);
                setOpen(false);
              }}
              className={cn(
                "overflow-hidden rounded-xl border-2 border-transparent bg-muted transition-colors hover:border-primary/60",
                seed === currentSeed && "border-primary",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dicebearUrl(style, seed)} alt="" className="size-full" />
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={regenerate}>
            <RefreshCw /> Ещё варианты
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
