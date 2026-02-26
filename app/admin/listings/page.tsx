"use client";

import { useState, useMemo } from "react";
import { useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Search, X, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

type SortField = "createdAt" | "price" | "title";
type SortDir = "asc" | "desc";

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    fetch("/api/listings")
      .then((r) => r.json())
      .then((data) => { setListings(data); setLoading(false); });
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />;
    return sortDir === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3 text-primary" />
      : <ArrowDown className="ml-1 h-3 w-3 text-primary" />;
  };

  const clearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
  };

  const hasActiveFilters = search || minPrice || maxPrice || dateFrom || dateTo || statusFilter !== "all";

  const filtered = useMemo(() => {
    let result = [...listings];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title?.toLowerCase().includes(q) ||
          l.seller?.name?.toLowerCase().includes(q) ||
          l.seller?.email?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    if (minPrice) result = result.filter((l) => l.price >= Number(minPrice));
    if (maxPrice) result = result.filter((l) => l.price <= Number(maxPrice));

    if (dateFrom) result = result.filter((l) => new Date(l.createdAt) >= new Date(dateFrom));
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((l) => new Date(l.createdAt) <= to);
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === "createdAt") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (sortField === "title") {
        valA = valA?.toLowerCase() ?? "";
        valB = valB?.toLowerCase() ?? "";
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [listings, search, statusFilter, minPrice, maxPrice, dateFrom, dateTo, sortField, sortDir]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Listings</h2>
          <p className="text-muted-foreground">
            {filtered.length} of {listings.length} listings
          </p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, seller name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "border-primary text-primary" : ""}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 h-2 w-2 rounded-full bg-primary inline-block" />
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-xl border bg-muted/20">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Price</label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Price</label>
              <Input
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Card layout */}
      <div className="space-y-3 md:hidden">
        {/* Mobile sort controls */}
        <div className="flex gap-2 flex-wrap">
          {(["createdAt", "price", "title"] as SortField[]).map((field) => (
            <Button
              key={field}
              variant={sortField === field ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleSort(field)}
            >
              {field === "createdAt" ? "Date" : field.charAt(0).toUpperCase() + field.slice(1)}
              {sortField === field
                ? sortDir === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                : <ArrowUpDown className="ml-1 h-3 w-3" />
              }
            </Button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
            No listings match your filters.
          </div>
        )}
        {filtered.map((listing: any) => (
          <div key={listing._id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-sm leading-snug line-clamp-2">{listing.title}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/listings/${listing._id}`} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" /> View Listing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete Listing</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{listing.seller?.name || "Unknown"}</span>
              {listing.seller?.email && <span> · {listing.seller.email}</span>}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                {listing.status}
              </Badge>
              {listing.category?.name && (
                <Badge variant="outline" className="text-xs">{listing.category.name}</Badge>
              )}
              <span className="text-sm font-semibold text-primary ml-auto">₦{listing.price}</span>
            </div>

            <p className="text-xs text-muted-foreground">
              {new Date(listing.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>
                <button onClick={() => handleSort("title")} className="flex items-center hover:text-foreground transition-colors">
                  Title <SortIcon field="title" />
                </button>
              </TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>
                <button onClick={() => handleSort("price")} className="flex items-center hover:text-foreground transition-colors">
                  Price <SortIcon field="price" />
                </button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button onClick={() => handleSort("createdAt")} className="flex items-center hover:text-foreground transition-colors">
                  Date <SortIcon field="createdAt" />
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No listings match your filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((listing: any) => (
              <TableRow key={listing._id}>
                <TableCell className="font-medium max-w-[200px] truncate" title={listing.title}>
                  {listing.title}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{listing.seller?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">{listing.seller?.email}</span>
                  </div>
                </TableCell>
                <TableCell>₦{listing.price}</TableCell>
                <TableCell>{listing.category?.name || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                    {listing.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/listings/${listing._id}`} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" /> View Listing
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Listing</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}