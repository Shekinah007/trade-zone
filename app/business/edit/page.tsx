import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Business from "@/models/Business";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BusinessView } from "@/components/profile/BusinessView";
import BusinessProfile from "@/components/profile/BusinessProfile";

export default async function BusinessEditPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/business/edit");

  await dbConnect();
  const business = await Business.findOne({ owner: session.user.id }).lean();
  const initialData = business ? JSON.parse(JSON.stringify(business)) : null;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Link
            href="/settings"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Settings
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Business Profile
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage your business information shown on your store page
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto md:container md:px-4 md:max-w-3xl">
        <BusinessProfile initialData={initialData} />
      </div>
    </div>
  );
}
