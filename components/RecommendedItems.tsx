import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import { ListingCard } from "@/components/ListingCard";
import Link from "next/link";

interface RecommendedItemsProps {
  categoryId?: string;
  currentListingId: string;
}

export async function RecommendedItems({
  categoryId,
  currentListingId,
}: RecommendedItemsProps) {
  if (!categoryId) return null;

  try {
    await dbConnect();

    // Fetch up to 20 related items from the same category
    // Sort by boostStatus desc, then createdAt desc
    const items = await Item.find({
      "listing.category": categoryId,
      _id: { $ne: currentListingId },
      isListed: true,
      "listing.status": "active",
    })
      .sort({ "listing.boostStatus": -1, createdAt: -1 })
      .limit(20)
      .lean();

    if (!items || items.length === 0) {
      return null;
    }

    return (
      <div className="relative mt-16 pt-8 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Distinct background gradient (purple to pink) */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-green-50/40 to-green-50/80 dark:from-purple-950/20 dark:via-fuchsia-950/10 dark:to-pink-950/20 rounded-3xl -z-10" />

        {/* Animated glow behind the header */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-green-300/20 to-green-300/20 dark:from-green-500/5 dark:to-green-500/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-300/20 to-green-200/20 dark:from-green-500/5 dark:to-green-500/5 rounded-full blur-3xl -z-10" />

        {/* Top decorative line with purple gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

        {/* Section Header with distinct purple/pink scheme */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-black via-black to-black dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
              You might also like
            </h2>
            <div className="absolute -bottom-2 left-0 w-24 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </div>
          <Link
            href="/categories"
            className="group flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/40"
          >
            <span>More</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Cards grid with distinct hover effects */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {items.map((item: any) => (
            <div
              key={item._id.toString()}
              className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl rounded-xl hover:shadow-purple-200/50 dark:hover:shadow-purple-900/20"
            >
              <ListingCard
                id={item._id.toString()}
                title={item.listing?.title || item.model}
                price={item.listing?.price || 0}
                image={item.images?.[0] || ""}
                category={item.listing?.category?.toString() || ""}
                condition={item.listing?.condition || "Used"}
                location={
                  item.listing?.location || {
                    city: "Unknown",
                    country: "Unknown",
                  }
                }
                createdAt={
                  item.createdAt?.toString() || new Date().toISOString()
                }
                boostStatus={item.listing?.boostStatus}
              />
            </div>
          ))}
        </div>

        {/* Distinctive bottom accent */}
        <div className="flex justify-center mt-8 gap-2">
          <div className="w-8 h-1 bg-purple-300 dark:bg-purple-800 rounded-full" />
          <div className="w-4 h-1 bg-pink-300 dark:bg-pink-800 rounded-full" />
          <div className="w-2 h-1 bg-fuchsia-300 dark:bg-fuchsia-800 rounded-full" />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching recommended items:", error);
    return null;
  }
}
