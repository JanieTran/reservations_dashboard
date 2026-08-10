import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import LoginForm from "./login-form";

export default async function LoginPage() {
  // Checks for an existing session and redirects to the dashboard
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return <LoginForm />;
}
