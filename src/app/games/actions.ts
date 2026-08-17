"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createGame(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("games")
    .insert({ title, owner_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Не удалось создать игру");
  }

  redirect(`/games/${data.id}/constructor`);
}
