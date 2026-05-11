"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegistrySearchBar() {
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator))
      return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation denied/failed:", err);
        setLocating(false);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn("Geolocation denied/failed:", err);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
    const q = query.trim();
    if (!q) return;

    let url = `/registry/search?q=${encodeURIComponent(q)}`;
    if (coords) {
      url += `&lat=${coords.lat}&lng=${coords.lng}`;
    }
    router.push(url);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
        <Input
          id="registry-search-input"
          type="search"
          placeholder="Enter IMEI, Serial Number, or Chassis Number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-12 h-12 text-base rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all"
        />
        {/* Location indicator on the right */}
        <div className="absolute right-4 top-3.5">
          {locating ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : coords ? (
            <MapPin
              className="h-5 w-5 text-emerald-500"
              // title="Location detected"
            />
          ) : (
            <MapPin
              className="h-5 w-5 text-muted-foreground/40"
              // title="Location unavailable"
            />
          )}
        </div>
      </div>
      <Button
        type="submit"
        size="lg"
        className="rounded-full z-50 px-6 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 border-0"
      >
        Search
      </Button>
    </form>
  );
}
