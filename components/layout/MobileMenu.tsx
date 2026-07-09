"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { logoutAction } from "@/app/actions/auth";
import type { UserRole } from "@/app/(storefront)/layout";

const navLinks = [
  { label: "Philosophy", href: "/about"    },
  { label: "Collection", href: "/lookbook" },
  { label: "Shop",       href: "/shop"     },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchOpen: () => void;
  role: UserRole;
}

export function MobileMenu({ isOpen, onClose, onSearchOpen, role }: MobileMenuProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isLoggedIn = role !== null;
  const isAdminOrStaff = role === "admin" || role === "staff";
  const onAccountPage = pathname.startsWith("/account");
  const showAccountLink = isLoggedIn && !onAccountPage;

  const accountLabel = isAdminOrStaff ? "Dashboard" : "My Profile";
  const accountHref  = isAdminOrStaff ? "/admin"    : "/account";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.nav
            className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-background shadow-xl md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            aria-label="Mobile navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <Link
                href="/"
                onClick={onClose}
                className="font-display text-base font-light text-foreground"
              >
                arachchi
              </Link>
              <button onClick={onClose} aria-label="Close menu" className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="block py-3 text-2xl font-light tracking-wide text-foreground/80 transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}

              <div className="pt-6 border-t border-border mt-6 space-y-1">
                {isLoggedIn ? (
                  <>
                    {showAccountLink && (
                      <Link
                        href={accountHref}
                        onClick={onClose}
                        className="block py-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {accountLabel}
                      </Link>
                    )}
                    {!isAdminOrStaff && (
                      <Link
                        href="/account/wishlist"
                        onClick={onClose}
                        className="block py-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Wishlist
                      </Link>
                    )}
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="block w-full py-2 text-left text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Log Out
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="block py-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                )}
                <button
                  onClick={() => { onClose(); onSearchOpen(); }}
                  className="block w-full py-2 text-left text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground tracking-[0.1em] uppercase">Theme</span>
              <ThemeToggle />
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
