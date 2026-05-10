import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <p className="font-serif text-8xl font-light tracking-widest text-foreground/20">
        404
      </p>
      <h1 className="font-serif text-2xl tracking-[0.2em] uppercase">
        Page not found
      </h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 border border-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors duration-200"
      >
        Return home
      </Link>
    </div>
  );
}
