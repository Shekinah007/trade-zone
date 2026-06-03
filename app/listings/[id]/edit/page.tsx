// import { notFound, redirect } from "next/navigation";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import dbConnect from "@/lib/db";
// import Item from "@/models/Item";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { ListingForm } from "@/components/ListingForm";
// import "@/models/Category"; // Ensure Category model is registered

// async function getListing(id: string) {
//   await dbConnect();
//   // Validate ID format if necessary, mongoose usually handles it but lean might crash
//   if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

//   const listing = await Item.findById(id).populate("listing.category").lean();
//   return listing ? JSON.parse(JSON.stringify(listing)) : null;
// }

// async function getCategories() {
//   await dbConnect();

//   const mongoose = await import("mongoose");
//   const Category = mongoose.models.Category || mongoose.model("Category");
//   const categories = await Category.find().lean();
//   return JSON.parse(JSON.stringify(categories));
// }

// export default async function EditListingPage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     redirect("/auth/signin");
//   }

//   const { id } = await params;
//   const listing = await getListing(id);

//   if (!listing) {
//     notFound();
//   }

//   // Check ownership
//   const sellerOrOwnerId = listing.seller || listing.owner;
//   if (
//     sellerOrOwnerId?.toString() !== session.user.id &&
//     session.user.role !== "admin"
//   ) {
//     return (
//       <div className="container mx-auto py-10 px-4">
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-destructive">Unauthorized</CardTitle>
//             <CardDescription>
//               You do not have permission to edit this listing.
//             </CardDescription>
//           </CardHeader>
//         </Card>
//       </div>
//     );
//   }

//   const categories = await getCategories();

//   return (
//     <div className="container mx-auto py-10 px-4 max-w-3xl">
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl">Edit Listing</CardTitle>
//           <CardDescription>Update the details of your listing.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ListingForm initialData={listing} categories={categories} />
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import { ListingForm } from "@/components/ListingForm";
import "@/models/Category";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";

async function getListing(id: string) {
  await dbConnect();
  if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
  const listing = await Item.findById(id).populate("listing.category").lean();
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
  if (!session) redirect("/auth/signin");

  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const sellerOrOwnerId = listing.seller || listing.owner;
  const isUnauthorized =
    sellerOrOwnerId?.toString() !== session.user.id &&
    session.user.role !== "admin";

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <ShieldAlert className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 tracking-tight mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            You don't have permission to edit this listing.
          </p>
          <Button asChild variant="outline" className="rounded-xl gap-2">
            <Link href="/browse">
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sticky top nav */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={`/listings/${id}`}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <PencilLine className="h-3.5 w-3.5 text-green-500" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-50 truncate">
              Edit Listing
            </span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium shrink-0 hidden sm:block">
            Changes save immediately
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ListingForm initialData={listing} categories={categories} />
      </div>
    </div>
  );
}
