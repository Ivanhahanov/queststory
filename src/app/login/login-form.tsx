"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { signIn, signUp, type AuthActionState } from "./actions";

const initialState: AuthActionState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [signInState, signInAction, signInPending] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as "in" | "up")}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="in">Войти</TabsTrigger>
        <TabsTrigger value="up">Создать аккаунт</TabsTrigger>
      </TabsList>

      <TabsContent value="in" className="space-y-4 pt-2">
        <form action={signInAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-1.5">
            <Label htmlFor="in-email">E-mail</Label>
            <Input id="in-email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="in-password">Пароль</Label>
            <Input
              id="in-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {signInState.error && <p className="text-sm text-destructive">{signInState.error}</p>}
          <Button type="submit" className="w-full" disabled={signInPending}>
            {signInPending ? "Входим…" : "Войти"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="up" className="space-y-4 pt-2">
        <form action={signUpAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="up-email">E-mail</Label>
            <Input id="up-email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="up-password">Пароль</Label>
            <Input
              id="up-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {signUpState.error && <p className="text-sm text-destructive">{signUpState.error}</p>}
          <Button type="submit" className="w-full" disabled={signUpPending}>
            {signUpPending ? "Создаём…" : "Создать аккаунт ведущего"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
