"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu } from "lucide-react";
import { CartIcon } from "./CartIcon";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";
import { logoutAction } from "@/app/actions/auth";
import type { UserRole } from "@/app/(storefront)/layout";

const navLinks = [
  { label: "Shop",     href: "/shop"     },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Journal",  href: "/journal"  },
  { label: "About",    href: "/about"    },
];

export function Navbar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const isHome = pathname === "/";
  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isPreScroll = isHome && !scrolled;

  const headerClass = isPreScroll
    ? isDark
      ? "border-transparent bg-secondary"
      : "border-transparent bg-transparent"
    : "border-border/60 bg-background/90 backdrop-blur-sm";

  const isLoggedIn = role !== null;
  const isAdminOrStaff = role === "admin" || role === "staff";
  // Hide the account/dashboard link when already on that section
  const onAccountPage = pathname.startsWith("/account");
  const showAccountLink = isLoggedIn && !onAccountPage;

  const accountLabel = isAdminOrStaff ? "Dashboard" : "My Profile";
  const accountHref  = isAdminOrStaff ? "/admin"    : "/account";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${headerClass}`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-8">
          {/* Wordmark */}
          <Link
            href="/"
            className="font-display text-lg font-light tracking-[0.35em] transition-colors text-foreground"
            aria-label="Arachchi home"
          >
            arachchi
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary navigation" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`text-xs tracking-[0.2em] uppercase transition-colors duration-200 ${
                      pathname.startsWith(href)
                        ? "text-foreground"
                        : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Utility icons */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Theme toggle — desktop only */}
            <span className="hidden md:inline-flex md:items-center">
              <ThemeToggle />
            </span>

            {/* Account / Dashboard / Sign In — desktop only */}
            {isLoggedIn ? (
              <>
                {showAccountLink && (
                  <Link
                    href={accountHref}
                    className="hidden md:inline-flex md:items-center text-xs tracking-[0.15em] uppercase text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {accountLabel}
                  </Link>
                )}
                <form action={logoutAction} className="hidden md:inline-flex md:items-center">
                  <button
                    type="submit"
                    className="text-xs tracking-[0.15em] uppercase text-foreground/70 transition-colors hover:text-foreground"
                  >
                    Log Out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex md:items-center text-xs tracking-[0.15em] uppercase text-foreground/70 transition-colors hover:text-foreground"
                aria-label="Sign in"
              >
                Sign In
              </Link>
            )}

            <CartIcon />

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="text-foreground/70 transition-colors hover:text-foreground md:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSearchOpen={() => setSearchOpen(true)}
        role={role}
      />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
