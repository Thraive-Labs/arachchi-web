import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

interface PageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { redirectTo } = await searchParams;
  return <LoginForm redirectTo={redirectTo ?? "/account"} />;
}
