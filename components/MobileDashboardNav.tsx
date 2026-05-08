"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Database,
  ArrowLeftRight,
  PlusCircle,
  Shield,
  Menu,
  X,
  Settings,
  Store,
  MessageCircle,
  Zap,
  Star,
  Coins,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileDashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  transferCount: number;
  unreadCount: number;
  userName: string;
  userEmail: string;
  userImage: string;
  userId: string;
  creditBalance: number;
}

export function MobileDashboardNav({
  activeTab,
  onTabChange,
  transferCount,
  unreadCount,
  userName,
  userEmail,
  userImage,
  userId,
  creditBalance,
}: MobileDashboardNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tabs = [
    { id: "marketplace", icon: ShoppingBag, label: "Market" },
    { id: "registry", icon: Database, label: "Registry" },
    {
      id: "transfers",
      icon: ArrowLeftRight,
      label: "Transfers",
      badge: transferCount,
    },
  ];

  return (
    <>
      {/* ── Mobile top header ── */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
            <AvatarFallback className="text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              {userName?.charAt(0)}
            </AvatarFallback>
            {userImage && (
              <AvatarFallback>{userName?.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              {userName?.split(" ")[0]}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
              Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Credits pill */}
          <Link
            href="/dashboard/tokens"
            className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-full px-2.5 py-1"
          >
            <Coins className="h-3 w-3 text-amber-500" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              {creditBalance}
            </span>
          </Link>

          {/* Messages */}
          <Link href="/messages" className="relative p-1.5">
            <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-blue-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Slide-in drawer ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative ml-auto w-72 h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-emerald-200">
                  <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">
                    {userName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {userName}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                    {userEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Credits row */}
            <div className="mx-4 my-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {creditBalance} Credits
                  </p>
                  <p className="text-[10px] text-amber-600/70">
                    Available balance
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/tokens"
                onClick={() => setDrawerOpen(false)}
                className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5"
              >
                Top up <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>

            {/* Nav section */}
            <p className="px-5 pt-1 pb-2 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 font-semibold">
              Navigation
            </p>
            <nav className="px-3 space-y-0.5">
              {[
                {
                  href: `/store/${userId}`,
                  icon: Store,
                  label: "My Store",
                  color: "text-emerald-600",
                },
                {
                  href: "/messages",
                  icon: MessageCircle,
                  label: "Messages",
                  color: "text-blue-500",
                  badge: unreadCount,
                },
                {
                  href: "/settings",
                  icon: Settings,
                  label: "Account Settings",
                  color: "text-gray-500",
                },
              ].map(({ href, icon: Icon, label, color, badge }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon className={`h-4 w-4 ${color} shrink-0`} />
                  <span className="flex-1">{label}</span>
                  {badge ? (
                    <span className="text-[10px] bg-blue-500 text-white rounded-full px-1.5 py-0.5 font-bold">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>

            {/* Quick actions */}
            <p className="px-5 pt-4 pb-2 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 font-semibold">
              Quick Actions
            </p>
            <div className="px-3 space-y-1.5 pb-6">
              <Button
                size="sm"
                className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 rounded-lg"
                asChild
              >
                <Link
                  href="/listings/create"
                  onClick={() => setDrawerOpen(false)}
                >
                  <PlusCircle className="mr-2 h-3.5 w-3.5" /> Post New Ad
                </Link>
              </Button>
              <Button
                size="sm"
                className="w-full justify-start bg-red-500 hover:bg-red-600 text-white text-xs h-9 rounded-lg"
                asChild
              >
                <Link
                  href="/registry/register"
                  onClick={() => setDrawerOpen(false)}
                >
                  <Shield className="mr-2 h-3.5 w-3.5" /> Register Asset
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-50 text-xs h-9 rounded-lg"
                asChild
              >
                <Link
                  href="/dashboard/boosts"
                  onClick={() => setDrawerOpen(false)}
                >
                  <Zap className="mr-2 h-3.5 w-3.5" /> Manage Boosts
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50 text-xs h-9 rounded-lg"
                asChild
              >
                <Link
                  href="/dashboard/featured"
                  onClick={() => setDrawerOpen(false)}
                >
                  <Star className="mr-2 h-3.5 w-3.5" /> Manage Featured
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-9 rounded-lg"
                asChild
              >
                <Link
                  href="/dashboard/tokens"
                  onClick={() => setDrawerOpen(false)}
                >
                  <Coins className="mr-2 h-3.5 w-3.5" /> My Credits
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom tab bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center px-2 pb-safe">
        {tabs.map(({ id, icon: Icon, label, badge }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors ${
                active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all ${active ? "bg-emerald-100 dark:bg-emerald-900/40" : ""}`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`}
                />
                {badge ? (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-purple-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] font-semibold transition-all ${active ? "opacity-100" : "opacity-60"}`}
              >
                {label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}

        {/* FAB-style post button */}
        <Link
          href="/listings/create"
          className="flex-none mx-2 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
        >
          <PlusCircle className="h-5 w-5 text-white" />
        </Link>
      </nav>
    </>
  );
}
