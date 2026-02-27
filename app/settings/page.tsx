import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User, Building2, ChevronRight, Settings,
  Shield, Bell, CreditCard, LogOut
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const settingsSections = [
  {
    label: "Account",
    items: [
      {
        href: "/profile/edit",
        icon: User,
        title: "Profile Settings",
        description: "Update your name, contact info, and profile picture",
        color: "bg-blue-500/10 text-blue-500",
      },
      {
        href: "/business/edit",
        icon: Building2,
        title: "Business Profile",
        description: "Manage your business details, hours, and contact info",
        color: "bg-purple-500/10 text-purple-500",
      },
    ],
  },
  {
    label: "Preferences",
    items: [
      // {
      //   href: "/settings/notifications",
      //   icon: Bell,
      //   title: "Notifications",
      //   description: "Control how and when you receive alerts",
      //   color: "bg-yellow-500/10 text-yellow-500",
      //   badge: null,
      // },
      {
        href: "/settings/security",
        icon: Shield,
        title: "Security",
        description: "Manage your password and account security",
        color: "bg-green-500/10 text-green-500",
      },
    ],
  },
];

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/settings");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b bg-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </div>

          {/* User card */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-primary/10">
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {session.user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{session.user?.name}</h1>
              <p className="text-muted-foreground text-sm">{session.user?.email}</p>
              <Badge variant="secondary" className="mt-1 capitalize text-xs">
                {(session.user as any)?.role || "member"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        {settingsSections.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
              {section.label}
            </p>
            <div className="rounded-2xl border bg-card overflow-hidden divide-y">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors group"
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Danger zone */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
            Danger Zone
          </p>
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 overflow-hidden">
            <Link
              href="/auth/signout"
              className="flex items-center gap-4 p-4 hover:bg-destructive/10 transition-colors group"
            >
              <div className="p-2.5 rounded-xl shrink-0 bg-destructive/10 text-destructive">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-destructive">Sign Out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account</p>
              </div>
              <ChevronRight className="h-4 w-4 text-destructive/50 shrink-0 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}