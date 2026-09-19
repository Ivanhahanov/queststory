import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Стартовая точка установленного PWA игрока (manifest-player.json →
// start_url: "/play"). Раньше это была "/", общая с ведущим — но на iOS
// установленное на "Домой" приложение живёт в отдельном от Safari хранилище,
// поэтому анонимной сессии здесь чаще всего ещё нет, и старая "/" молча
// отправляла игрока на /games (панель ведущего, требует другого логина).
export default async function PlayHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: player } = await supabase
      .from("players")
      .select("join_token")
      .eq("auth_user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (player) redirect(`/play/${player.join_token}/game`);
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl">Квестория</CardTitle>
          <CardDescription>
            У вас пока нет активной игры на этом устройстве. Попросите ведущего прислать вам персональную
            ссылку-приглашение или QR-код.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
