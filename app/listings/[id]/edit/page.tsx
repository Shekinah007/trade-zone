import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListingForm } from "@/components/ListingForm";
import "@/models/Category"; // Ensure Category model is registered

async function getListing(id: string) {
  await dbConnect();
  // Validate ID format if necessary, mongoose usually handles it but lean might crash
  if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

  const listing = await Listing.findById(id).populate("category").lean();
  return listing ? JSON.parse(JSON.stringify(listing)) : null;
}

async function getCategories() {
  await dbConnect();

  const mongoose = await import("mongoose");
  const Category = mongoose.models.Category || mongoose.model("Category");
  const categories = await Category.find().lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  // Check ownership
  if (
    listing.seller.toString() !== session.user.id &&
    session.user.role !== "admin"
  ) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Unauthorized</CardTitle>
            <CardDescription>
              You do not have permission to edit this listing.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const categories = await getCategories();

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Listing</CardTitle>
          <CardDescription>Update the details of your listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm initialData={listing} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
