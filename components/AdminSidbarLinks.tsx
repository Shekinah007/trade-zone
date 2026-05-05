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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navGroups = [
  {
    title: "MAIN",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/listings", label: "Listings", icon: ShoppingBag },
      { href: "/admin/categories", label: "Categories", icon: Grid },
      { href: "/admin/reports", label: "Reports", icon: AlertTriangle },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { href: "/admin/properties", label: "Property Registry", icon: Shield },
      { href: "/admin/search-logs", label: "Search Logs", icon: History },
      { href: "/admin/tokens", label: "Tokens", icon: Coins },
      { href: "/admin/monetization", label: "Monetization", icon: Settings },
    ],
  },
];

export default function AdminSidebarLinks() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      MAIN: true,
      MANAGEMENT: true,
      APPROVALS: true,
    },
  );

  useEffect(() => {
    fetch("/api/admin/registrations")
      .then((r) => r.json())
      .then((data) => setPendingCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, []);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
  };

  const isRegistrationActive = pathname === "/admin/registrations";

  return (
    <div className="space-y-8">
      {navGroups.map((group) => {
        const isExpanded = expandedGroups[group.title];
        return (
          <div key={group.title} className="space-y-3">
            {/* Group Header with toggle */}
            <button
              onClick={() => toggleGroup(group.title)}
              className="flex w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <span>{group.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
              )}
            </button>

            {/* Group Items */}
            {isExpanded && (
              <div className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-r-full px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-red-50 to-transparent text-red-700 dark:from-red-950/40 dark:text-red-300"
                          : "text-gray-700 hover:bg-red-50/50 dark:text-gray-200 dark:hover:bg-red-950/20",
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-red-500 to-rose-500" />
                      )}
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                          isActive
                            ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300"
                            : "bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-red-900/30 dark:group-hover:text-red-300",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={cn(isActive && "font-semibold")}>
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* APPROVALS Group */}
      <div className="space-y-3">
        <button
          onClick={() => toggleGroup("APPROVALS")}
          className="flex w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <span>APPROVALS</span>
          {expandedGroups["APPROVALS"] ? (
            <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
          )}
        </button>

        {expandedGroups["APPROVALS"] && (
          <div className="space-y-1">
            <Link
              href="/admin/registrations"
              className={cn(
                "group relative flex items-center gap-3 rounded-r-full px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isRegistrationActive
                  ? "bg-gradient-to-r from-red-50 to-transparent text-red-700 dark:from-red-950/40 dark:text-red-300"
                  : "text-gray-700 hover:bg-red-50/50 dark:text-gray-200 dark:hover:bg-red-950/20",
              )}
            >
              {isRegistrationActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-red-500 to-rose-500" />
              )}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  isRegistrationActive
                    ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300"
                    : "bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-red-900/30 dark:group-hover:text-red-300",
                )}
              >
                <UserCheck className="h-4 w-4" />
              </div>
              <span className={cn(isRegistrationActive && "font-semibold")}>
                Registrations
              </span>
              {pendingCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                  {pendingCount}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
