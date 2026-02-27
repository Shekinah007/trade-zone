"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingBag, AlertTriangle,
  Settings, Menu, Grid, X,
  UserCheck
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Grid },
  { href: "/admin/reports", label: "Reports", icon: AlertTriangle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/registrations", label: "Registrations", icon: UserCheck },

];

interface Props {
  user: { name?: string | null; image?: string | null; email?: string | null };
}

export default function AdminMobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between h-0 px-4 bg-background">

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
                              
  <button className="lg:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all text-sm font-medium">
          <LayoutDashboard className="h-4 w-4" />
          Admin Menu
        </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b">
            <Link href="/" className="flex items-center gap-2 font-bold text-primary" onClick={() => setOpen(false)}>
              <ShoppingBag className="h-5 w-5" />
              <span>Trade Zone Admin</span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

        </SheetContent>
      </Sheet>
    </header>
  );
}