import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl">Квестория</CardTitle>
          <CardDescription>Панель ведущего сюжетно-ролевых квестов</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next || "/games"} />
        </CardContent>
      </Card>
    </main>
  );
}
