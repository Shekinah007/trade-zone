"use client";

import { useEffect, useState, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  AlertTriangle,
  Grid,
  UserCheck,
  Shield,
  Coins,
  Search,
  Sparkles,
  ChevronRight,
  LogOut,
  Menu,
  DollarSign,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Grid },
  { href: "/admin/reports", label: "Reports", icon: AlertTriangle },
  { href: "/admin/tokens", label: "Token Management", icon: Coins },
  { href: "/admin/search-logs", label: "Search Logs", icon: Search },
  { href: "/admin/monetization", label: "Monetization", icon: DollarSign },
  { href: "/admin/properties", label: "Property Registry", icon: Shield },
];

interface Props {
  user: { name?: string | null; image?: string | null; email?: string | null };
}

// Optimized nav item component with memo
const NavItem = memo(
  ({
    href,
    label,
    Icon,
    isActive,
    onClick,
    badge,
  }: {
    href: string;
    label: string;
    Icon: any;
    isActive: boolean;
    onClick: () => void;
    badge?: number;
  }) => (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 overflow-hidden",
        isActive
          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-500/25"
          : "text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400",
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          isActive ? "text-white" : "text-gray-400 group-hover:text-red-500",
        )}
      />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            isActive
              ? "bg-white/20 text-white"
              : "bg-red-500 text-white shadow-sm",
          )}
        >
          {badge}
        </span>
      )}
      {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
    </Link>
  ),
);

NavItem.displayName = "NavItem";

export default function AdminMobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Optimized fetch with AbortController
    const controller = new AbortController();

    fetch("/api/admin/registrations", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setPendingCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});

    // Set greeting without re-rendering on time change
    const hour = new Date().getHours();
    let newGreeting = "Good evening";
    if (hour < 12) newGreeting = "Good morning";
    else if (hour < 18) newGreeting = "Good afternoon";
    setGreeting(newGreeting);

    return () => controller.abort();
  }, []);

  // Memoized handlers
  const handleClose = useCallback(() => setOpen(false), []);
  const handleLogout = useCallback(() => signOut(), []);

  // Don't render animations until mounted to prevent layout shift
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button - Optimized with transform instead of scale */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/40 hover:shadow-red-500/60 active:scale-95 transition-transform duration-150 text-sm font-semibold group">
            <Menu className="h-4 w-4 transition-transform duration-150 group-hover:rotate-90" />
            <span>Admin Menu</span>
          </button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[300px] p-0 flex flex-col bg-gradient-to-b from-white to-red-50 dark:from-gray-950 dark:to-red-950/20 border-r-0 shadow-2xl"
        >
          {/* Header with brand - removed heavy blur effects */}
          <div className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between h-20 px-5 border-b border-red-100 dark:border-red-900/30 bg-white/50 dark:bg-gray-950/50">
              <Link
                href="/"
                className="flex items-center gap-2.5 group"
                onClick={handleClose}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-green-500 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-red-700 to-red-600 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent">
                  FindMaster
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                  Admin
                </span>
              </Link>
            </div>

            {/* Greeting section - simplified */}
            <div className="px-5 py-4 bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950/20 dark:to-green-950/20 border-b border-red-100 dark:border-red-900/30">
              <p className="text-xs text-red-600/70 dark:text-red-400/70 font-medium">
                {greeting}
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                {user.name || "Administrator"}
              </p>
            </div>
          </div>

          {/* Navigation Links - optimized rendering */}
          <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavItem
                key={href}
                href={href}
                label={label}
                Icon={Icon}
                isActive={pathname === href}
                onClick={handleClose}
              />
            ))}

            <NavItem
              href="/admin/registrations"
              label="Registrations"
              Icon={UserCheck}
              isActive={pathname === "/admin/registrations"}
              onClick={handleClose}
              badge={pendingCount}
            />
          </nav>

          {/* User Footer - simplified animations */}
          <div className="border-t border-red-100 dark:border-red-900/30 p-4 bg-white/40 dark:bg-gray-950/40">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950/30 dark:to-green-950/30 border border-red-100 dark:border-red-900/20">
              <Avatar className="h-10 w-10 ring-2 ring-red-500/20">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold">
                  {user.name?.charAt(0) ||
                    user.email?.charAt(0)?.toUpperCase() ||
                    "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {user.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                  {user.email || "admin@findmaster.com"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-150 group"
              >
                <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-500 transition-colors duration-150" />
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
