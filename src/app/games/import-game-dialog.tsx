"use client";

import { useRef, useState, useTransition } from "react";
import { ClipboardCopy, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buildScenarioPrompt } from "@/lib/scenario";
import { importScenario } from "./actions";

export function ImportGameDialog() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [playerCount, setPlayerCount] = useState(6);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  function copyPrompt() {
    navigator.clipboard.writeText(buildScenarioPrompt(theme.trim(), playerCount));
    toast("Промпт скопирован — вставьте в ChatGPT, Gemini или другой ИИ");
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await importScenario(text);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Sparkles /> Импортировать сценарий
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Импорт сценария</DialogTitle>
          <DialogDescription>
            Сгенерируйте историю, роли, цели и активности в любом ИИ (ChatGPT, Gemini, Claude) по готовому промпту,
            затем вставьте результат сюда или загрузите файл.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="scenario-theme">Тема</Label>
              <Input
                id="scenario-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="пираты, хакеры, Средиземье…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scenario-players">Число игроков</Label>
              <Input
                id="scenario-players"
                type="number"
                min={2}
                max={40}
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value) || 2)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={copyPrompt}>
              <ClipboardCopy /> Скопировать промпт для ИИ
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload /> Загрузить файл .json
            </Button>
            <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={onFilePicked} />
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Вставьте сюда ответ ИИ — JSON, начинающийся с { "version": 1, ... }'
            rows={10}
            className="font-mono text-xs"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" onClick={submit} disabled={pending || !text.trim()}>
            {pending ? "Импортируем…" : "Импортировать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
