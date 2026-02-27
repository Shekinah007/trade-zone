import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ArrowLeft, Shield, KeyRound, Info } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

async function getUserProvider(userId: string) {
  await dbConnect();
  const user = await User.findById(userId).select("provider").lean() as any;
  return user?.provider || "credentials";
}

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/settings/security");

  const provider = await getUserProvider(session.user.id || "");
  const isOAuth = provider !== "credentials";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link
            href="/settings"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Security</h1>
              <p className="text-muted-foreground text-sm">Manage your password and account security</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Password section */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
            Password
          </p>

          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="p-5 flex items-center gap-3 border-b">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Change Password</p>
                <p className="text-xs text-muted-foreground">
                  {isOAuth
                    ? `You signed in with ${provider}. Password changes are not available.`
                    : "Choose a strong password you don't use elsewhere"}
                </p>
              </div>
            </div>

            <div className="p-5">
              {isOAuth ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Password not available</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your account is linked to <span className="capitalize font-medium">{provider}</span>.
                      To change your password, please update it directly in your {" "}
                      <span className="capitalize">{provider}</span> account settings.
                    </p>
                  </div>
                </div>
              ) : (
                <ChangePasswordForm />
              )}
            </div>
          </div>
        </div>

        {/* Login info */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
            Sign-in Method
          </p>
          <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary capitalize">
              {provider.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm capitalize">{provider}</p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs bg-green-500/10 text-green-600 font-medium px-2 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}