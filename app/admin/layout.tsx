import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LayoutDashboard, Users, ShoppingBag, AlertTriangle, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-background lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
              <ShoppingBag className="h-6 w-6" />
              <span>Trade Zone Admin</span>
            </Link>
          </div>
          <div className="flex-1 px-4 py-6 space-y-4">
             <div className="space-y-1">
                <Button variant="ghost" asChild className="w-full justify-start">
                   <Link href="/admin">
                     <LayoutDashboard className="mr-2 h-4 w-4" />
                     Overview
                   </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                   <Link href="/admin/users">
                     <Users className="mr-2 h-4 w-4" />
                     Users
                   </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                   <Link href="/admin/listings">
                     <ShoppingBag className="mr-2 h-4 w-4" />
                     Listings
                   </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                   <Link href="/admin/reports">
                     <AlertTriangle className="mr-2 h-4 w-4" />
                     Reports
                   </Link>
                </Button>
             </div>
             
             <div className="pt-4 border-t">
               <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Settings</h4>
                <Button variant="ghost" asChild className="w-full justify-start">
                   <Link href="/admin/settings">
                     <Settings className="mr-2 h-4 w-4" />
                     General
                   </Link>
                </Button>
             </div>
          </div>
          <div className="border-t p-4">
             <div className="flex items-center gap-4 mb-4">
                <Avatar>
                   <AvatarImage src={session.user.image} />
                   <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                   <p className="font-medium">{session.user.name}</p>
                   <p className="text-xs text-muted-foreground">Admin</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 md:p-8">
             {children}
          </main>
      </div>
    </div>
  );
}
