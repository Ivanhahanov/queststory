"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSupabaseClient } from "@/hooks/use-supabase";

export function GameTitleHeader({ gameId, initialTitle }: { gameId: string; initialTitle: string }) {
  const pathname = usePathname();
  const editable = pathname.endsWith("/constructor");
  const [title, setTitle] = useState(initialTitle);
  const supabase = useSupabaseClient();

  async function save() {
    const trimmed = title.trim();
    if (!trimmed || trimmed === initialTitle) {
      setTitle(initialTitle);
      return;
    }
    await supabase.from("games").update({ title: trimmed }).eq("id", gameId);
  }

  if (!editable) {
    return <h1 className="truncate px-1 py-1 text-lg font-semibold">{initialTitle}</h1>;
  }

  return (
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className="min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-1 py-1 text-lg font-semibold outline-none hover:border-border focus:border-ring focus:bg-card"
    />
  );
}
