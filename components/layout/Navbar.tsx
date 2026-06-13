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
  { label: "Story",      href: "/about"    },
  { label: "Collection", href: "/lookbook" },
  { label: "Shop",       href: "/shop"     },
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

  // On the homepage before scroll, the nav floats over the dark hero image
  const isOverHero = isHome && !scrolled;

  const headerClass = isOverHero
    ? isDark
      ? "border-transparent bg-secondary"
      : "border-transparent bg-transparent"
    : "border-border/60 bg-background/90 backdrop-blur-sm";

  // Force white text when floating over the dark carousel image
  const activeLinkClass = isOverHero && !isDark
    ? "text-white"
    : "text-foreground";

  const mutedLinkClass = isOverHero && !isDark
    ? "text-white/65 hover:text-white"
    : "text-foreground/70 hover:text-foreground";

  const dividerClass = isOverHero && !isDark ? "bg-white/20" : "bg-border";

  const isLoggedIn = role !== null;
  const isAdminOrStaff = role === "admin" || role === "staff";
  const onAccountPage = pathname.startsWith("/account");
  const showAccountLink = isLoggedIn && !onAccountPage;

  const accountLabel = isAdminOrStaff ? "Dashboard" : "My Profile";
  const accountHref  = isAdminOrStaff ? "/admin"    : "/account";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${headerClass}`}
      >
        <div className="flex h-16 items-center justify-between pl-6 pr-12 lg:pl-8 lg:pr-20">
          {/* Wordmark — left */}
          <Link
            href="/"
            className={`font-display text-lg font-light tracking-[0.35em] transition-colors ${activeLinkClass}`}
            aria-label="Arachchi home"
          >
            arachchi
          </Link>

          {/* Right group: desktop nav + utility icons */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Desktop nav links */}
            <nav aria-label="Primary navigation" className="hidden md:block">
              <ul className="flex items-center gap-8">
                {navLinks.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`text-xs tracking-[0.2em] uppercase transition-colors duration-200 ${
                        pathname.startsWith(href)
                          ? activeLinkClass
                          : mutedLinkClass
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Thin vertical rule between nav and icons — hidden while search/theme are off */}
            <div
              className="hidden"
              aria-hidden="true"
            />

            {/* Search — temporarily hidden */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={`hidden transition-colors ${mutedLinkClass}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Theme toggle — temporarily hidden */}
            <span className="hidden">
              <ThemeToggle />
            </span>

            {/* Account / Sign In — desktop only */}
            {isLoggedIn ? (
              <>
                {showAccountLink && (
                  <Link
                    href={accountHref}
                    className={`hidden md:inline-flex md:items-center text-xs tracking-[0.15em] uppercase transition-colors ${mutedLinkClass}`}
                  >
                    {accountLabel}
                  </Link>
                )}
                <form action={logoutAction} className="hidden md:inline-flex md:items-center">
                  <button
                    type="submit"
                    className={`text-xs tracking-[0.15em] uppercase transition-colors ${mutedLinkClass}`}
                  >
                    Log Out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className={`hidden md:inline-flex md:items-center text-xs tracking-[0.15em] uppercase transition-colors ${mutedLinkClass}`}
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
              className={`transition-colors md:hidden ${mutedLinkClass}`}
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
