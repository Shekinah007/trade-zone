"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  AlertTriangle,
  Settings,
  Grid,
  UserCheck,
  Shield,
  History,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Grid },
  { href: "/admin/reports", label: "Reports", icon: AlertTriangle },
  { href: "/admin/properties", label: "Property Registry", icon: Shield },
  { href: "/admin/search-logs", label: "Search Logs", icon: History },
  { href: "/admin/tokens", label: "Tokens", icon: Coins },
  { href: "/admin/monetization", label: "Monetization", icon: Settings },
];

export default function AdminSidebarLinks() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/registrations")
      .then((r) => r.json())
      .then((data) => setPendingCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Registrations item with badge */}
        <Link
          href="/admin/registrations"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            pathname === "/admin/registrations"
              ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md"
              : "text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300",
          )}
        >
          <UserCheck className="h-4 w-4 shrink-0" />
          Registrations
          {pendingCount > 0 && (
            <span className="ml-auto bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              {pendingCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
