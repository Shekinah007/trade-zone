"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SaveButton({ listingId }: { listingId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already saved on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/saved?listingId=${listingId}`)
        .then((r) => r.json())
        .then((data) => setSaved(data.saved))
        .catch(() => {});
    }
  }, [listingId, status]);

  const handleToggle = async () => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/saved", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (res.ok) {
        setSaved(!saved);
        toast.success(saved ? "Removed from saved" : "Listing saved!");
      } else {
        toast.error("Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className={cn(
        "flex-1 transition-all",
        saved && "border-red-500/50 text-red-500 hover:text-red-500 hover:bg-red-500/5"
      )}
      onClick={handleToggle}
      disabled={loading}
    >
      <Heart
        className={cn(
          "mr-2 h-4 w-4 transition-all",
          saved && "fill-red-500 text-red-500"
        )}
      />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}