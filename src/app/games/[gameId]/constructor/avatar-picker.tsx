"use client";

import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2, Wand2 } from "lucide-react";
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
  portraitUrl,
  uploadingPortrait,
  onSelect,
  onSelectOptions,
  onUploadPortrait,
  onRemovePortrait,
}: {
  style: string;
  currentSeed: string;
  options: Record<string, string>;
  portraitUrl: string | null;
  uploadingPortrait: boolean;
  onSelect: (seed: string) => void;
  onSelectOptions: (options: Record<string, string>) => void;
  onUploadPortrait: (file: File) => void;
  onRemovePortrait: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [batch, setBatch] = useState<string[]>([currentSeed]);
  const [tab, setTab] = useState<"random" | "custom" | "photo">(portraitUrl ? "photo" : "random");
  const canCustomize = hasFeatureEditor(style);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function regenerate() {
    setBatch([currentSeed, ...Array.from({ length: 11 }, () => randomAvatarSeed())]);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          regenerate();
          setTab(portraitUrl ? "photo" : "random");
        }
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Wand2 /> {portraitUrl ? "Изменить фото" : "Изменить аватар"}
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Аватар персонажа</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="-mx-4 flex-1 overflow-y-auto px-4">
          <TabsList className={cn("w-full", canCustomize ? "grid grid-cols-3" : "grid grid-cols-2")}>
            <TabsTrigger value="random">Случайно</TabsTrigger>
            {canCustomize && <TabsTrigger value="custom">Настроить</TabsTrigger>}
            <TabsTrigger value="photo">Своё фото</TabsTrigger>
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
                    seed === currentSeed && !portraitUrl && "border-primary",
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

          <TabsContent value="photo" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Загруженное фото становится аватаром персонажа везде — в списках, у игрока и на карточке персонажа.
            </p>
            {portraitUrl && (
              <div className="flex justify-center">
                <div className="size-32 overflow-hidden rounded-2xl border-2 border-primary/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={portraitUrl} alt="" className="size-full object-cover" />
                </div>
              </div>
            )}
            <div className="flex justify-center gap-2">
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploadingPortrait}>
                <ImagePlus /> {portraitUrl ? "Заменить фото" : "Загрузить фото"}
              </Button>
              {portraitUrl && (
                <Button type="button" variant="ghost" onClick={onRemovePortrait}>
                  <Trash2 /> Убрать фото
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onUploadPortrait(e.target.files[0])}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Готово
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
