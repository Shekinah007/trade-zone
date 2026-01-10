import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Business from "@/models/Business";
import { BusinessEditForm } from "@/components/profile/BusinessEditForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BusinessEditPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin?callbackUrl=/business/edit");
  }

  await dbConnect();
  // Fetch business owned by the user
  const business = await Business.findOne({ owner: session.user.id }).lean();

  // JSON sanitize
  const initialData = business ? JSON.parse(JSON.stringify(business)) : null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Business Profile</CardTitle>
          <CardDescription>Update your business information</CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessEditForm initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  );
}
