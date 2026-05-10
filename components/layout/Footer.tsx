import Link from "next/link";

const columns = [
  {
    heading: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Lookbook", href: "/lookbook" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Size guide", href: "/size-guide" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <Link
              href="/"
              className="font-display text-lg font-light tracking-[0.35em] text-foreground"
              aria-label="Arachchi home"
            >
              arachchi
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground max-w-[200px]">
              Toronto-based luxury clothing — designed with intention.
            </p>
          </div>

          {/* Nav columns */}
          {columns.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="mb-4 text-xs tracking-[0.2em] uppercase font-medium text-foreground">
                {heading}
              </h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Arachchi. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Toronto, Canada</p>
        </div>
      </div>
    </footer>
  );
}
