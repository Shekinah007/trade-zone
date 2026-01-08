import { Suspense } from "react";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Server Component for fetching listings
async function getListings(searchParams: { [key: string]: string | string[] | undefined }) {
  await dbConnect();
  
  const query: any = { status: "active" };

  if (searchParams.q) {
    query.$or = [
      { title: { $regex: searchParams.q, $options: "i" } },
      { description: { $regex: searchParams.q, $options: "i" } },
    ];
  }

  if (searchParams.category) {
    query.category = searchParams.category;
  }
  
  // Basic Price Filter logic
  if (searchParams.minPrice || searchParams.maxPrice) {
      query.price = {};
      if (searchParams.minPrice) query.price.$gte = Number(searchParams.minPrice);
      if (searchParams.maxPrice) query.price.$lte = Number(searchParams.maxPrice);
  }

  const listings = await Listing.find(query)
    .sort({ createdAt: -1 })
    .lean();
    
  return JSON.parse(JSON.stringify(listings));
}

import Category from "@/models/Category";
import Link from "next/link"; // Ensure Link is imported

async function getCategories() {
  await dbConnect();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const listings = await getListings(searchParams);
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar (Simple version) */}
        <aside className="w-full md:w-64 space-y-6">
           <div className="space-y-4">
              <h2 className="font-semibold text-lg">Categories</h2>
              <div className="flex flex-col gap-2">
                 <Button variant={!searchParams.category ? "secondary" : "ghost"} asChild className="justify-start">
                    <Link href="/browse">All Categories</Link>
                 </Button>
                 {categories.map((cat: any) => (
                    <Button 
                      key={cat._id} 
                      variant={searchParams.category === cat.name ? "secondary" : "ghost"} 
                      asChild 
                      className="justify-start"
                    >
                      <Link href={`/browse?category=${cat.name}`}>
                         <span className="mr-2">{cat.icon}</span>
                         {cat.name}
                      </Link>
                    </Button>
                 ))}
              </div>
           </div>
        </aside>

        {/* Listings Grid */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
               {searchParams.q ? `Search results for "${searchParams.q}"` : "Browse Listings"}
            </h1>
            <p className="text-muted-foreground">
              {listings.length} {listings.length === 1 ? "result" : "results"} found
            </p>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing: any) => (
                <ListingCard
                  key={listing._id}
                  id={listing._id}
                  title={listing.title}
                  price={listing.price}
                  image={listing.images[0]}
                  category={listing.category} // Populate category name if possible, or handle ID
                  condition={listing.condition}
                  location={listing.location}
                  createdAt={listing.createdAt}
                />
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium">No listings found</p>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
