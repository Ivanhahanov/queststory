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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DICEBEAR_STYLES, dicebearUrl, randomAvatarSeed } from "@/lib/dicebear";
import { hasFeatureEditor } from "@/lib/avatar-options";
import { cn } from "@/lib/utils";
import { AvatarFeatureEditor } from "./avatar-feature-editor";
import { PortraitCropDialog } from "./portrait-cropper";

export function AvatarPicker({
  style,
  currentSeed,
  options,
  portraitUrl,
  uploadingPortrait,
  onSelect,
  onSelectStyle,
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
  onSelectStyle: (style: string) => void;
  onSelectOptions: (options: Record<string, string>) => void;
  onUploadPortrait: (file: File) => void;
  onRemovePortrait: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [batch, setBatch] = useState<string[]>([currentSeed]);
  const [mainTab, setMainTab] = useState<"generate" | "photo">(portraitUrl ? "photo" : "generate");
  const [genTab, setGenTab] = useState<"random" | "custom">("random");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const canCustomize = hasFeatureEditor(style);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function regenerate() {
    setBatch([currentSeed, ...Array.from({ length: 11 }, () => randomAvatarSeed())]);
  }

  const randomGrid = (
    <div className="space-y-4">
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
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          regenerate();
          setMainTab(portraitUrl ? "photo" : "generate");
          setGenTab("random");
        }
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Wand2 /> Изменить аватар
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Аватар персонажа</DialogTitle>
          <p className="text-sm text-muted-foreground">Сгенерировать иконку или загрузить своё фото персонажа</p>
        </DialogHeader>

        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as typeof mainTab)} className="-mx-4 flex-1 overflow-y-auto px-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Сгенерировать</TabsTrigger>
            <TabsTrigger value="photo">Своё фото</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 pt-4">
            <Select value={style} onValueChange={(v) => v && onSelectStyle(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Стиль аватара">
                  {(value: string) => DICEBEAR_STYLES.find((s) => s.id === value)?.label ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DICEBEAR_STYLES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {canCustomize ? (
              <Tabs value={genTab} onValueChange={(v) => setGenTab(v as typeof genTab)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="random">Случайно</TabsTrigger>
                  <TabsTrigger value="custom">Настроить</TabsTrigger>
                </TabsList>
                <TabsContent value="random" className="pt-4">
                  {randomGrid}
                </TabsContent>
                <TabsContent value="custom" className="pt-4">
                  <AvatarFeatureEditor style={style} seed={currentSeed} options={options} onChange={onSelectOptions} />
                </TabsContent>
              </Tabs>
            ) : (
              randomGrid
            )}
          </TabsContent>

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
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) setPendingFile(selected);
                e.target.value = "";
              }}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Готово
          </Button>
        </DialogFooter>
      </DialogContent>

      <PortraitCropDialog
        file={pendingFile}
        uploading={uploadingPortrait}
        onCancel={() => setPendingFile(null)}
        onConfirm={(blob) => {
          const croppedFile = new File([blob], `${pendingFile?.name.replace(/\.[^.]+$/, "") ?? "portrait"}.jpg`, {
            type: "image/jpeg",
          });
          onUploadPortrait(croppedFile);
          setPendingFile(null);
        }}
      />
    </Dialog>
  );
}
