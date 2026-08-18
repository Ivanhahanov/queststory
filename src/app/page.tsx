import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anonymous session already tied to a game (a player who lost their tab /
  // reopened the site from scratch on the same device) — send them straight
  // back into their game instead of the ведущий's dashboard.
  if (user?.is_anonymous) {
    const { data: player } = await supabase
      .from("players")
      .select("join_token")
      .eq("auth_user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (player) redirect(`/play/${player.join_token}/game`);
  }

  redirect("/games");
}
