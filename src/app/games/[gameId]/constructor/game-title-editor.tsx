"use client";

import { useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import type { Game } from "@/lib/types";

export function GameTitleEditor({
  game,
  onChange,
}: {
  game: Game;
  onChange: (game: Game) => void;
}) {
  const [title, setTitle] = useState(game.title);
  const supabase = useSupabaseClient();

  async function save() {
    const trimmed = title.trim();
    if (!trimmed || trimmed === game.title) {
      setTitle(game.title);
      return;
    }
    const { data } = await supabase
      .from("games")
      .update({ title: trimmed })
      .eq("id", game.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  return (
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className="rounded-md border border-transparent bg-transparent px-1 text-xl font-semibold outline-none hover:border-border focus:border-ring focus:bg-card"
    />
  );
}
