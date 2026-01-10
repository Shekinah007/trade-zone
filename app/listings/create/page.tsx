"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
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

  if (status === "loading") {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/listings/create");
    return null;
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
