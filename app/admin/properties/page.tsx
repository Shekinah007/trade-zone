"use client";

import { useState, useMemo, useEffect } from "react";
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

type SortField = "createdAt" | "brand" | "model" | "status";
type SortDir = "asc" | "desc";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    fetch("/api/admin/properties")
      .then((r) => r.json())
      .then((data) => { setProperties(data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
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
    setStatusFilter("all");
    setItemTypeFilter("all");
  };

  const hasActiveFilters = search || statusFilter !== "all" || itemTypeFilter !== "all";

  const filtered = useMemo(() => {
    let result = [...properties];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.brand?.toLowerCase().includes(q) ||
          p.model?.toLowerCase().includes(q) ||
          p.serialNumber?.toLowerCase().includes(q) ||
          p.imei?.toLowerCase().includes(q) ||
          p.chassisNumber?.toLowerCase().includes(q) ||
          p.owner?.name?.toLowerCase().includes(q) ||
          p.owner?.email?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (itemTypeFilter !== "all") {
      result = result.filter((p) => p.itemType === itemTypeFilter);
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === "createdAt") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (sortField === "brand" || sortField === "model" || sortField === "status") {
        valA = valA?.toLowerCase() ?? "";
        valB = valB?.toLowerCase() ?? "";
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [properties, search, statusFilter, itemTypeFilter, sortField, sortDir]);

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
          <h2 className="text-3xl font-bold tracking-tight">Property Registry</h2>
          <p className="text-muted-foreground">
            {filtered.length} of {properties.length} registered properties
          </p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by brand, model, SN/IMEI, owner..."
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
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border bg-muted/20 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Item Type</label>
              <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Card layout */}
      <div className="space-y-3 md:hidden">
        {/* Mobile sort controls */}
        <div className="flex gap-2 flex-wrap">
          {(["createdAt", "brand", "status"] as SortField[]).map((field) => (
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
            No properties match your filters.
          </div>
        )}
        {filtered.map((property: any) => (
          <div key={property._id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-sm leading-snug line-clamp-2">{property.brand} {property.model}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/registry/${property._id}`} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" /> View Property
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{property.owner?.name || "Unknown"}</span>
              {property.owner?.email && <span> · {property.owner.email}</span>}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {property.serialNumber && <span>SN: {property.serialNumber}</span>}
              {property.imei && <span>IMEI: {property.imei}</span>}
              {property.chassisNumber && <span>VIN: {property.chassisNumber}</span>}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={property.status === "registered" ? "default" : property.status === "missing" ? "destructive" : "secondary"}>
                {property.status}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">{property.itemType}</Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              {new Date(property.createdAt).toLocaleDateString()}
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
                <button onClick={() => handleSort("brand")} className="flex items-center hover:text-foreground transition-colors">
                  Property <SortIcon field="brand" />
                </button>
              </TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Identifiers</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>
                <button onClick={() => handleSort("status")} className="flex items-center hover:text-foreground transition-colors">
                  Status <SortIcon field="status" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => handleSort("createdAt")} className="flex items-center hover:text-foreground transition-colors">
                  Registered <SortIcon field="createdAt" />
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No properties match your filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((property: any) => (
              <TableRow key={property._id}>
                <TableCell className="font-medium max-w-[200px] truncate" title={`${property.brand} ${property.model}`}>
                  {property.brand} {property.model}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{property.owner?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">{property.owner?.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    {property.serialNumber && <div>SN: {property.serialNumber}</div>}
                    {property.imei && <div>IMEI: {property.imei}</div>}
                    {property.chassisNumber && <div>VIN: {property.chassisNumber}</div>}
                    {!property.serialNumber && !property.imei && !property.chassisNumber && <span className="text-muted-foreground">None</span>}
                  </div>
                </TableCell>
                <TableCell className="capitalize">{property.itemType}</TableCell>
                <TableCell>
                  <Badge variant={property.status === "registered" ? "default" : property.status === "missing" ? "destructive" : "secondary"}>
                    {property.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(property.createdAt).toLocaleDateString()}</TableCell>
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
                        <Link href={`/registry/${property._id}`} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" /> View Property
                        </Link>
                      </DropdownMenuItem>
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
