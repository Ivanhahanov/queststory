"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { roleAvatarUrl } from "@/lib/avatar-options";
import type { Role } from "@/lib/types";

export function RolePickerDialog({
  open,
  onOpenChange,
  roles,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  onPick: (roleId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Кому выдать роль?</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-1.5 overflow-y-auto">
          {roles.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Все роли уже выданы.</p>
          )}
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => onPick(role.id)}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
            >
              <div
                className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2"
                style={{ borderColor: role.color }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={roleAvatarUrl(role)} alt="" className="size-full object-cover" />
              </div>
              <span className="font-medium">{role.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
