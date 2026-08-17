"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function JoinPage({ params }: { params: Promise<{ joinToken: string }> }) {
  const { joinToken } = use(params);
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingClaim() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("players")
          .select("id")
          .eq("join_token", joinToken)
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (data && !cancelled) {
          router.replace(`/play/${joinToken}/game`);
          return;
        }
      }

      if (!cancelled) setChecking(false);
    }

    checkExistingClaim();
    return () => {
      cancelled = true;
    };
  }, [joinToken, router, supabase]);

  async function join() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setPending(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const { error: authError } = await supabase.auth.signInAnonymously();
      if (authError) {
        setError("Не удалось подключиться. Проверьте интернет и попробуйте снова.");
        setPending(false);
        return;
      }
    }

    const { error: claimError } = await supabase.rpc("claim_player", {
      p_join_token: joinToken,
      p_display_name: trimmed,
    });

    if (claimError) {
      setError(
        claimError.message.includes("already claimed")
          ? "Эта ссылка уже открыта на другом устройстве. Обратитесь к ведущему."
          : "Приглашение не найдено — проверьте ссылку у ведущего.",
      );
      setPending(false);
      return;
    }

    router.replace(`/play/${joinToken}/game`);
  }

  if (checking) return null;

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl">Добро пожаловать</CardTitle>
          <CardDescription>Введите имя, чтобы получить свою роль в игре</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Ваше имя</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="Как вас называть в игре?"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" onClick={join} disabled={pending || !name.trim()}>
            {pending ? "Входим…" : "Войти в игру"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
