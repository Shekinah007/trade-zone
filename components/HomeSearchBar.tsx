"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HomeSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/browse");
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for cars, phones, furniture..."
          className="pl-12 h-12 text-lg rounded-full shadow-sm border-muted-foreground/20 focus-visible:ring-primary"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-12 px-8 rounded-full text-base shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 transition-all hover:scale-105"
      >
        Search Now
      </Button>
    </form>
  );
}