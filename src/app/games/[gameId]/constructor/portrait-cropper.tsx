"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { PORTRAIT_ASPECT } from "@/components/character-card";

const VIEWPORT_W = 260;
const VIEWPORT_H = Math.round(VIEWPORT_W / PORTRAIT_ASPECT);
const OUTPUT_W = 900;
const OUTPUT_H = Math.round(OUTPUT_W / PORTRAIT_ASPECT);

type Offset = { x: number; y: number };

function clampOffset(offset: Offset, displayedW: number, displayedH: number): Offset {
  const minX = Math.min(0, VIEWPORT_W - displayedW);
  const minY = Math.min(0, VIEWPORT_H - displayedH);
  return {
    x: Math.min(0, Math.max(minX, offset.x)),
    y: Math.min(0, Math.max(minY, offset.y)),
  };
}

export function PortraitCropDialog({
  file,
  uploading,
  onCancel,
  onConfirm,
}: {
  file: File | null;
  uploading: boolean;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [coverScale, setCoverScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; startOffset: Offset } | null>(null);

  useEffect(() => {
    if (!file) {
      Promise.resolve().then(() => {
        setUrl(null);
        setReady(false);
      });
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    Promise.resolve().then(() => {
      setUrl(objectUrl);
      setReady(false);
    });
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function handleImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    const scale = Math.max(VIEWPORT_W / img.naturalWidth, VIEWPORT_H / img.naturalHeight);
    setCoverScale(scale);
    setZoom(1);
    const displayedW = img.naturalWidth * scale;
    const displayedH = img.naturalHeight * scale;
    setOffset({ x: (VIEWPORT_W - displayedW) / 2, y: (VIEWPORT_H - displayedH) / 2 });
    setReady(true);
  }

  function applyZoom(nextZoom: number) {
    const img = imgRef.current;
    if (!img) return;
    const clampedZoom = Math.min(3, Math.max(1, nextZoom));
    const oldScale = coverScale * zoom;
    const newScale = coverScale * clampedZoom;
    const centerImgX = (VIEWPORT_W / 2 - offset.x) / oldScale;
    const centerImgY = (VIEWPORT_H / 2 - offset.y) / oldScale;
    const displayedW = img.naturalWidth * newScale;
    const displayedH = img.naturalHeight * newScale;
    const next = clampOffset(
      { x: VIEWPORT_W / 2 - centerImgX * newScale, y: VIEWPORT_H / 2 - centerImgY * newScale },
      displayedW,
      displayedH,
    );
    setZoom(clampedZoom);
    setOffset(next);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!ready) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, startOffset: offset };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const img = imgRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !img) return;
    const scale = coverScale * zoom;
    const displayedW = img.naturalWidth * scale;
    const displayedH = img.naturalHeight * scale;
    const next = clampOffset(
      { x: drag.startOffset.x + (e.clientX - drag.startX), y: drag.startOffset.y + (e.clientY - drag.startY) },
      displayedW,
      displayedH,
    );
    setOffset(next);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!ready) return;
    e.preventDefault();
    applyZoom(zoom - e.deltaY * 0.001);
  }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img) return;
    const scale = coverScale * zoom;
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sWidth = VIEWPORT_W / scale;
    const sHeight = VIEWPORT_H / scale;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, OUTPUT_W, OUTPUT_H);
    canvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <Dialog open={!!file} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Кадрирование фото</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div
            className="touch-none overflow-hidden rounded-xl bg-muted select-none"
            style={{ width: VIEWPORT_W, height: VIEWPORT_H }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
          >
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={url}
                alt=""
                draggable={false}
                onLoad={handleImageLoad}
                className="max-w-none origin-top-left"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${coverScale * zoom})`,
                  opacity: ready ? 1 : 0,
                }}
              />
            )}
          </div>

          <div className="flex w-full items-center gap-3">
            <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              onValueChange={(v) => applyZoom(v)}
              disabled={!ready}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">Перетащите фото и настройте масштаб</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
            Отмена
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!ready || uploading}>
            {uploading ? "Загрузка…" : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
