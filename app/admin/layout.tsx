import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  AlertTriangle,
  Settings,
  LogOut,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AdminSidebarLinks from "@/components/AdminSidbarLinks";
import AdminMobileNav from "@/components/AdminMobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-70 lg:block">
        <div className="flex h-full flex-col bg-linear-to-br from-white via-red-50/20 to-white dark:from-gray-900 dark:via-red-950/10 dark:to-gray-900 shadow-2xl">
          {/* Header with red gradient */}
          <div className="flex h-16 items-center border-b border-red-100/50 px-6 dark:border-red-900/30">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-red-500 to-rose-600 text-white shadow-md transition-transform group-hover:scale-105">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="bg-linear-to-r from-red-700 to-rose-700 bg-clip-text text-transparent dark:from-red-400 dark:to-rose-400">
                Admin Panel
              </span>
            </Link>
          </div>

          {/* Scrollable nav area */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <AdminSidebarLinks />
          </div>

          {/* User profile area with red border accent */}
          <div className="border-t border-red-100/50 p-4 dark:border-red-900/30">
            <div className="flex items-center gap-4 rounded-xl bg-white/50 p-3 backdrop-blur-sm dark:bg-gray-800/50">
              <Avatar>
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-semibold">{session.user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 md:p-8 rounded-4xl md:bg-white md:m-5">
          <AdminMobileNav user={session.user} />

          {children}
        </main>
      </div>
    </div>
  );
}
