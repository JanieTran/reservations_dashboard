import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Norra Reservations Dashboard
        </h1>
        <form action="/api/auth/logout" method="post">
          <Button variant="outline" type="submit">
            Log out
          </Button>
        </form>
      </header>
      <p>
        Connected to Postgres as{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
          {session.username}
        </code>
        .
      </p>
      <p className="text-muted-foreground">Dashboard coming soon...</p>
    </main>
  );
}
