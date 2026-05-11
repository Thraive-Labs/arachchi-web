"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Boxes,
  BookOpen,
  Camera,
  Layers,
  Percent,
  BarChart2,
  Settings,
  ArrowLeft,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navItems = [
  { href: "/admin",            label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/admin/analytics",  label: "Analytics", icon: BarChart2  },
  { href: "/admin/products",   label: "Products",  icon: Package    },
  { href: "/admin/tags",       label: "Tags",      icon: Tag        },
  { href: "/admin/orders",     label: "Orders",    icon: ShoppingBag},
  { href: "/admin/customers",  label: "Customers", icon: Users      },
  { href: "/admin/inventory",  label: "Inventory", icon: Boxes      },
  { href: "/admin/bundles",    label: "Bundles",   icon: Layers     },
  { href: "/admin/discounts",  label: "Discounts", icon: Percent    },
  { href: "/admin/journal",    label: "Journal",   icon: BookOpen   },
  { href: "/admin/lookbook",   label: "Lookbook",  icon: Camera     },
  { href: "/admin/settings",   label: "Settings",  icon: Settings   },
];

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  function isActive(item: (typeof navItems)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-background">
      {/* Wordmark */}
      <div className="border-b border-border px-6 py-5 flex items-center justify-between">
        <div>
          <p className="font-serif text-base tracking-[0.15em] text-foreground">ARACHCHI</p>
          <p className="text-xs text-muted-foreground tracking-[0.1em]">Admin</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="text-muted-foreground hover:text-foreground transition-colors lg:hidden"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs tracking-[0.1em] uppercase transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-4 space-y-0.5">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-xs tracking-[0.1em] uppercase text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 text-xs tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to site
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 text-xs tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
