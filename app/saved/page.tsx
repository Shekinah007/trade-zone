import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import SavedItem from "@/models/SavedItem";
import { Heart } from "lucide-react";
import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";

async function getSavedListings(userId: string) {
  await dbConnect();
  const saved = await SavedItem.find({ user: userId })
    .populate({
      path: "item",
      populate: { path: "listing.category", select: "name" },
    })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(
    JSON.stringify(
      saved
        .filter((s: any) => s.item && s.item.isListed && s.item.listing?.status === "active")
        .map((s: any) => s.item),
    ),
  );
}

export default async function SavedListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/saved");

  const listings = await getSavedListings(session?.user?.id || "");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Saved Listings
              </h1>
              <p className="text-muted-foreground text-sm">
                {listings.length} saved item{listings.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-2xl">
            <div className="p-4 rounded-full bg-pink-500/10 mb-4">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">No saved listings yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              When you save listings you like, they'll appear here so you can
              easily find them later.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {listings.map((item: any) => (
              <ListingCard
                key={item._id}
                id={item._id}
                title={item.listing?.title || item.model}
                price={item.listing?.price || 0}
                image={item.images?.[0]}
                category={item.listing?.category?.name || item.listing?.category}
                condition={item.listing?.condition}
                location={item.listing?.location}
                createdAt={item.listing?.listedAt || item.createdAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
