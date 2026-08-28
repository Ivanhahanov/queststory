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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { dicebearUrl, randomAvatarSeed } from "@/lib/dicebear";
import { hasFeatureEditor } from "@/lib/avatar-options";
import { cn } from "@/lib/utils";
import { AvatarFeatureEditor } from "./avatar-feature-editor";

export function AvatarPicker({
  style,
  currentSeed,
  options,
  onSelect,
  onSelectOptions,
}: {
  style: string;
  currentSeed: string;
  options: Record<string, string>;
  onSelect: (seed: string) => void;
  onSelectOptions: (options: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [batch, setBatch] = useState<string[]>([currentSeed]);
  const canCustomize = hasFeatureEditor(style);

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
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Выберите аватар</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="random" className="flex-1 overflow-y-auto">
          <TabsList className={cn("w-full", canCustomize ? "grid grid-cols-2" : "grid grid-cols-1")}>
            <TabsTrigger value="random">Случайно</TabsTrigger>
            {canCustomize && <TabsTrigger value="custom">Настроить</TabsTrigger>}
          </TabsList>

          <TabsContent value="random" className="space-y-4 pt-4">
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
            <Button variant="secondary" onClick={regenerate}>
              <RefreshCw /> Ещё варианты
            </Button>
          </TabsContent>

          {canCustomize && (
            <TabsContent value="custom" className="pt-4">
              <AvatarFeatureEditor style={style} seed={currentSeed} options={options} onChange={onSelectOptions} />
            </TabsContent>
          )}
        </Tabs>

        {canCustomize && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Готово
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
