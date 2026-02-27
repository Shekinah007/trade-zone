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
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Like New">Like New</SelectItem>
                <SelectItem value="good">Used - Good</SelectItem>
                <SelectItem value="fair">Used - Fair</SelectItem>
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