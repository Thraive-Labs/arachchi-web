"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { CartIcon } from "./CartIcon";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";
import { logoutAction } from "@/app/actions/auth";
import type { UserRole } from "@/app/(storefront)/layout";

const navLinks = [
  { label: "Philosophy", href: "/about"    },
  { label: "Collection", href: "/lookbook" },
  { label: "Shop",       href: "/shop"     },
];

const LINK_ACTIVE = "text-white";
const LINK_MUTED  = "text-white/65 hover:text-white";

export function Navbar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isLoggedIn = role !== null;
  const isAdminOrStaff = role === "admin" || role === "staff";
  const onAccountPage = pathname.startsWith("/account");
  const showAccountLink = isLoggedIn && !onAccountPage;

  const accountLabel = isAdminOrStaff ? "Dashboard" : "My Profile";
  const accountHref  = isAdminOrStaff ? "/admin"    : "/account";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-500/30 bg-zinc-600">
        <div className="flex h-16 items-center justify-between px-12 lg:px-20">
          {/* Wordmark */}
          <Link
            href="/"
            className={`font-display text-lg font-light transition-colors ${LINK_ACTIVE}`}
            aria-label="Arachchi home"
          >
            arachchi
          </Link>

          {/* Right group: desktop nav + utility icons */}
          <div className="flex items-center gap-5 sm:gap-6">
            <nav aria-label="Primary navigation" className="hidden md:block">
              <ul className="flex items-center gap-8">
                {navLinks.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`text-xs tracking-[0.2em] uppercase transition-colors duration-200 ${
                        pathname.startsWith(href) ? LINK_ACTIVE : LINK_MUTED
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Search — temporarily hidden */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={`hidden transition-colors ${LINK_MUTED}`}
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

            <CartIcon className={LINK_MUTED} />

            {/* Account / Sign In */}
            {isLoggedIn ? (
              <>
                {showAccountLink && (
                  <Link
                    href={accountHref}
                    className={`hidden md:inline-flex md:items-center text-xs tracking-[0.15em] uppercase transition-colors ${LINK_MUTED}`}
                  >
                    {accountLabel}
                  </Link>
                )}
                <form action={logoutAction} className="hidden md:inline-flex md:items-center">
                  <button
                    type="submit"
                    className={`text-xs tracking-[0.15em] uppercase transition-colors ${LINK_MUTED}`}
                  >
                    Log Out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className={`hidden md:inline-flex md:items-center text-xs tracking-[0.15em] uppercase transition-colors ${LINK_MUTED}`}
                aria-label="Sign in"
              >
                Sign In
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className={`transition-colors md:hidden ${LINK_MUTED}`}
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
