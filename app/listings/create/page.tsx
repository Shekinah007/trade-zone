"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingForm } from "@/components/ListingForm";

export default function CreateListingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  console.log(categories);

  if (status === "loading") {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/listings/create");
    return null;
  }


if (session?.user?.status === 'pending') {
  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md">
      <div className="p-4 rounded-full bg-yellow-500/10 w-fit mx-auto mb-4">
        <Clock className="h-10 w-10 text-yellow-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Approval Pending</h1>
      <p className="text-muted-foreground">
        Your account is currently under review. You'll be able to post listings once an admin approves your account.
      </p>
    </div>
  );
}

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post a New Ad</CardTitle>
          <CardDescription>
            Fill in the details below to list your item for sale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
