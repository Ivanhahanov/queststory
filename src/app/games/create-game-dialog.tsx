"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createGame } from "./actions";

export function CreateGameDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus /> Новая игра
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая квестория</DialogTitle>
        </DialogHeader>
        <form action={createGame} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Название</Label>
            <Input id="title" name="title" placeholder="Тайна усадьбы Вороново" required autoFocus />
          </div>
          <DialogFooter>
            <Button type="submit">Создать и настроить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
