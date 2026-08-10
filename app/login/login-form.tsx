"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  // Router is used to send the user to the dashboard after a successful login.
  const router = useRouter();

  // Controlled form state for the two fields.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // error: message shown to the user when login fails.
  // loading: disables the submit button while the request is in flight.
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    // Prevent the browser's default full-page form submission so we can
    // handle the login with fetch instead.
    event.preventDefault();

    // Clear any previous error before starting a fresh attempt.
    setError("");
    // Disable the button while we wait for the server's response.
    setLoading(true);

    try {
      // Send the entered credentials to the server for database authentication.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Non-2xx response: credentials were rejected (or server error).
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Login failed");
        return;
      }

      // Success: navigate to the dashboard and refresh
      router.push("/");
      router.refresh();
    } catch {
      // Network failure / fetch threw (e.g. server unreachable).
      setError("Login failed");
    } finally {
      // Re-enable the submit button either way.
      setLoading(false);
    }
  }

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Norra Reservations Dashboard</CardTitle>
          <CardDescription>
            Sign in with your database credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connecting…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
