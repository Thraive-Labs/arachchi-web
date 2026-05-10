import Link from "next/link";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-serif text-lg tracking-[0.3em] uppercase text-foreground"
          aria-label="Arachchi home"
        >
          Arachchi
        </Link>

        {/* Primary nav */}
        <nav aria-label="Primary navigation">
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-xs tracking-[0.2em] uppercase text-foreground/70 transition-colors duration-200 hover:text-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Utility links */}
        <div className="flex items-center gap-5">
          <Link
            href="/account"
            className="text-xs tracking-[0.15em] uppercase text-foreground/70 transition-colors duration-200 hover:text-foreground"
            aria-label="Account"
          >
            Account
          </Link>
          <Link
            href="/cart"
            className="text-xs tracking-[0.15em] uppercase text-foreground/70 transition-colors duration-200 hover:text-foreground"
            aria-label="Cart"
          >
            Cart
          </Link>
        </div>
      </div>
    </header>
  );
}
