// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Users,
//   ShoppingBag,
//   AlertTriangle,
//   Settings,
//   Menu,
//   Grid,
//   X,
//   UserCheck,
//   Shield,
//   Coins,
//   Search,
// } from "lucide-react";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { cn } from "@/lib/utils";

// const navItems = [
//   { href: "/admin", label: "Overview", icon: LayoutDashboard },
//   { href: "/admin/users", label: "Users", icon: Users },
//   { href: "/admin/listings", label: "Listings", icon: ShoppingBag },
//   { href: "/admin/categories", label: "Categories", icon: Grid },
//   { href: "/admin/reports", label: "Reports", icon: AlertTriangle },
//   { href: "/admin/tokens", label: "Token Management", icon: Coins },
//   { href: "/admin/search-logs", label: "Search Logs", icon: Search },
//   { href: "/admin/properties", label: "Property Registry", icon: Shield },
// ];

// interface Props {
//   user: { name?: string | null; image?: string | null; email?: string | null };
// }

// export default function AdminMobileNav({ user }: Props) {
//   const [open, setOpen] = useState(false);
//   const pathname = usePathname();

//   const [pendingCount, setPendingCount] = useState(0);

//   useEffect(() => {
//     fetch("/api/admin/registrations")
//       .then((r) => r.json())
//       .then((data) => setPendingCount(Array.isArray(data) ? data.length : 0))
//       .catch(() => {});
//   }, []);

//   return (
//     <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between h-0 px-4">
//       <Sheet open={open} onOpenChange={setOpen}>
//         <SheetTrigger asChild>
//           <button className="lg:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all text-sm font-medium">
//             <LayoutDashboard className="h-4 w-4" />
//             Admin Menu
//           </button>
//         </SheetTrigger>
//         <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
//           {/* Header */}
//           <div className="flex items-center justify-between h-16 px-5 border-b">
//             <Link
//               href="/"
//               className="flex items-center gap-2 font-bold text-primary"
//               onClick={() => setOpen(false)}
//             >
//               <ShoppingBag className="h-5 w-5" />
//               <span>FindMaster Admin</span>
//             </Link>
//           </div>

//           {/* Nav Links */}
//           <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
//             {navItems.map(({ href, label, icon: Icon }) => {
//               const isActive = pathname === href;
//               return (
//                 <Link
//                   key={href}
//                   href={href}
//                   onClick={() => setOpen(false)}
//                   className={cn(
//                     "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
//                     isActive
//                       ? "bg-primary text-primary-foreground shadow-sm"
//                       : "text-foreground/70 hover:text-foreground hover:bg-muted",
//                   )}
//                 >
//                   <Icon className="h-4 w-4 shrink-0" />
//                   {label}
//                 </Link>
//               );
//             })}
//             <Link
//               href="/admin/registrations"
//               className={cn(
//                 "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
//                 pathname === "/admin/registrations"
//                   ? "bg-primary text-primary-foreground shadow-sm"
//                   : "text-foreground/70 hover:text-foreground hover:bg-muted",
//               )}
//             >
//               <UserCheck className="h-4 w-4 shrink-0" />
//               Registrations
//               {pendingCount > 0 && (
//                 <span className="ml-auto text-white bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
//                   {pendingCount}
//                 </span>
//               )}
//             </Link>
//           </nav>

//           {/* User Footer */}
//           <div className="border-t p-4">
//             <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
//               <Avatar className="h-9 w-9">
//                 <AvatarImage src={user.image || ""} />
//                 <AvatarFallback className="bg-primary/10 text-primary font-semibold">
//                   {user.name?.charAt(0) || "A"}
//                 </AvatarFallback>
//               </Avatar>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-semibold truncate">{user.name}</p>
//                 <p className="text-xs text-muted-foreground truncate">
//                   {user.email}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </SheetContent>
//       </Sheet>
//     </header>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  AlertTriangle,
  Settings,
  Menu,
  Grid,
  X,
  UserCheck,
  Shield,
  Coins,
  Search,
  Sparkles,
  ChevronRight,
  LogOut,
  Bell,
  Gift,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
  { href: "/admin/properties", label: "Property Registry", icon: Shield },
];

interface Props {
  user: { name?: string | null; image?: string | null; email?: string | null };
}

export default function AdminMobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetch("/api/admin/registrations")
      .then((r) => r.json())
      .then((data) => setPendingCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <>
      {/* Floating Action Button - Redesigned with gradient and pulse effect */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/40 hover:shadow-red-500/60 hover:scale-105 transition-all duration-300 text-sm font-semibold group">
            <Menu className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>Admin Menu</span>
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[300px] p-0 flex flex-col bg-gradient-to-b from-white to-red-50 dark:from-gray-950 dark:to-red-950/20 border-r-0 shadow-2xl"
        >
          {/* Header with brand and decorative elements */}
          <div className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between h-20 px-5 border-b border-red-100 dark:border-red-900/30 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
              <Link
                href="/"
                className="flex items-center gap-2.5 group"
                onClick={() => setOpen(false)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-green-500 rounded-lg blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
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

              {/* <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button> */}
            </div>

            {/* Greeting section */}
            <div className="px-5 py-4 bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950/20 dark:to-green-950/20 border-b border-red-100 dark:border-red-900/30">
              <p className="text-xs text-red-600/70 dark:text-red-400/70 font-medium">
                {greeting}
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                {user.name || "Administrator"}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden",
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
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-red-500",
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                  )}
                </Link>
              );
            })}

            {/* Special Registrations item with badge */}
            <Link
              href="/admin/registrations"
              onClick={() => setOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                pathname === "/admin/registrations"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-500/25"
                  : "text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400",
              )}
            >
              {pathname === "/admin/registrations" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
              )}
              <UserCheck
                className={cn(
                  "h-4 w-4 shrink-0",
                  pathname === "/admin/registrations"
                    ? "text-white"
                    : "text-gray-400 group-hover:text-red-500",
                )}
              />
              <span className="flex-1">Registrations</span>
              {pendingCount > 0 && (
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full transition-all",
                    pathname === "/admin/registrations"
                      ? "bg-white/20 text-white"
                      : "bg-red-500 text-white shadow-sm",
                  )}
                >
                  {pendingCount}
                </span>
              )}
            </Link>
          </nav>

          {/* User Footer - Redesigned with green accent */}
          <div className="border-t border-red-100 dark:border-red-900/30 p-4 bg-white/40 dark:bg-gray-950/40 backdrop-blur-sm">
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
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {user.email || "admin@findmaster.com"}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
              >
                <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
