import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Building2, ChevronRight } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/settings");
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and business preferences.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <Link href="/profile/edit" className="block">
            <Card className="hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Profile Settings</CardTitle>
                    <CardDescription>
                      Update your name, contact info, and profile picture.
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>

          <Link href="/business/edit" className="block">
            <Card className="hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Business Profile</CardTitle>
                    <CardDescription>
                      Manage your business details, hours, and contact info.
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
