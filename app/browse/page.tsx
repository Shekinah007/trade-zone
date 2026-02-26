// // ""use client"

// import { Suspense } from "react";
// import dbConnect from "@/lib/db";
// import Listing from "@/models/Listing";
// import { ListingCard } from "@/components/ListingCard";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";

// // Server Component for fetching listings
// async function getListings(searchParams: { [key: string]: string | string[] | undefined }) {
//   await dbConnect();
  
//   const query: any = { status: "active" };

//   if (searchParams.q) {
//     query.$or = [
//       { title: { $regex: searchParams.q, $options: "i" } },
//       { description: { $regex: searchParams.q, $options: "i" } },
//     ];
//   }

//   if (searchParams.category) {
//     query.category = searchParams.category;
//   }
  
//   // Basic Price Filter logic
//   if (searchParams.minPrice || searchParams.maxPrice) {
//       query.price = {};
//       if (searchParams.minPrice) query.price.$gte = Number(searchParams.minPrice);
//       if (searchParams.maxPrice) query.price.$lte = Number(searchParams.maxPrice);
//   }

//   const listings = await Listing.find(query)
//     .sort({ createdAt: -1 })
//     .lean();
    
//   return JSON.parse(JSON.stringify(listings));
// }

// import Category from "@/models/Category";
// import Link from "next/link"; // Ensure Link is imported

// async function getCategories() {
//   await dbConnect();
//   const categories = await Category.find().sort({ name: 1 }).lean();
//   return JSON.parse(JSON.stringify(categories));
// }

// export default async function BrowsePage({
//   searchParams,
// }: {
//   searchParams: { [key: string]: string | string[] | undefined };
// }) {
//   const listings = await getListings(searchParams);
//   const categories = await getCategories();

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Filters Sidebar (Simple version) */}
//         <aside className="w-full md:w-64 space-y-6">
//            <div className="space-y-4">
//               <h2 className="font-semibold text-lg">Categories</h2>
//               <div className="flex flex-col gap-2">
//                  <Button variant={!searchParams.category ? "secondary" : "ghost"} asChild className="justify-start">
//                     <Link href="/browse">All Categories</Link>
//                  </Button>
//                  {categories.map((cat: any) => (
//                     <Button 
//                       key={cat._id} 
//                       variant={searchParams.category === cat.name ? "secondary" : "ghost"} 
//                       asChild 
//                       className="justify-start"
//                     >
//                       <Link href={`/browse?category=${cat.name}`}>
//                          <span className="mr-2">{cat.icon}</span>
//                          {cat.name}
//                       </Link>
//                     </Button>
//                  ))}
//               </div>
//            </div>
//         </aside>

//         {/* Listings Grid */}
//         <div className="flex-1">
//           <div className="mb-6">
//             <h1 className="text-3xl font-bold tracking-tight mb-2">
//                {searchParams.q ? `Search results for "${searchParams.q}"` : "Browse Listings"}
//             </h1>
//             <p className="text-muted-foreground">
//               {listings.length} {listings.length === 1 ? "result" : "results"} found
//             </p>
//           </div>

//           {listings.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {listings.map((listing: any) => (
//                 <ListingCard
//                   key={listing._id}
//                   id={listing._id}
//                   title={listing.title}
//                   price={listing.price}
//                   image={listing.images[0]}
//                   category={listing.category} // Populate category name if possible, or handle ID
//                   condition={listing.condition}
//                   location={listing.location}
//                   createdAt={listing.createdAt}
//                 />
//               ))}
//             </div>
//           ) : (
//              <div className="flex flex-col items-center justify-center py-12 text-center">
//                 <p className="text-lg font-medium">No listings found</p>
//                 <p className="text-muted-foreground">Try adjusting your search or filters.</p>
//              </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ListingCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    if (condition) params.set("condition", condition);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("page", String(currentPage));

    const res = await fetch(`/api/listings/search?${params.toString()}`);
    const data = await res.json();
    setListings(data.listings);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoading(false);
  };

  // Run search when page changes
  useEffect(() => {
    fetchListings();
  }, [page]);

  // Run search on initial load (from homepage search bar)
  useEffect(() => {
    fetchListings(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(true);
  };

  const clearFilters = () => {
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
    setCategory("");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6 flex-col md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings..."
            className="pl-12 h-12 rounded-full text-base"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 rounded-full px-8">
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 rounded-full"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-muted/30 border rounded-2xl p-6 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Condition</label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Any condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like-new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Min Price</label>
            <Input
              type="number"
              placeholder="₦0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Max Price</label>
            <Input
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={() => fetchListings(true)} className="flex-1 rounded-lg">
              Apply
            </Button>
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-6">
        {loading ? "Searching..." : `${total} listing${total !== 1 ? "s" : ""} found`}
        {query && <span> for <strong>"{query}"</strong></span>}
      </p>

      {/* Results Grid */}
      {!loading && listings.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
          <Search className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No listings found</p>
          <p className="text-muted-foreground">Try different keywords or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing: any) => (
            <ListingCard
              key={listing._id}
              id={listing._id}
              title={listing.title}
              price={listing.price}
              image={listing.images[0]}
              category={listing.category}
              condition={listing.condition}
              location={listing.location}
              createdAt={listing.createdAt}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense>
      <BrowseContent />
    </Suspense>
  );
}