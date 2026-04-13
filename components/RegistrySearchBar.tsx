"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import LocationDisplay from "./LocationDisplay";

export function RegistrySearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/registry/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full">
      {/* <LocationDisplay /> */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          id="registry-search-input"
          type="search"
          placeholder="Enter IMEI, Serial Number, or Chassis Number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 h-12 text-base rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="rounded-full z-1 px-6 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 border-0"
      >
        Search
      </Button>
    </form>
  );
}
