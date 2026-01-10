import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { UserEditForm } from "@/components/profile/UserEditForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfileEditPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin?callbackUrl=/profile/edit");
  }

  await dbConnect();
  const user = await User.findById(session.user.id).lean();

  if (!user) {
     return <div>User not found</div>;
  }

  // Sanitize for client component
  const initialData = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <UserEditForm initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  );
}
