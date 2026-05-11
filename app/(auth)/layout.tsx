import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link
        href="/"
        aria-label="Back to home"
        className="absolute top-6 left-6 font-display text-base font-light tracking-[0.35em] text-foreground transition-opacity hover:opacity-60"
      >
        arachchi
      </Link>
      {children}
    </div>
  );
}
