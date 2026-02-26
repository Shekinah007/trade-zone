"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export function SellerRating({ sellerId }: { sellerId: string }) {
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (sellerId) {
      fetch(`/api/reviews/seller/${sellerId}`)
        .then((res) => res.json())
        .then((data) => {
           if (data.averageRating) {
               setRating(Number(data.averageRating));
               setCount(data.totalReviews);
           }
        })
        .catch((err) => console.error("Failed to load ratings", err));
    }
  }, [sellerId]);

  return (
 <Link
  href={`/reviews/${sellerId}`}
  className="group flex items-center justify-between w-full p-3 rounded-xl border border-primary/20 bg-primary/5 transition-all"
>
  <div className="flex items-center gap-2">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${
            rating >= s
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
    <span className="font-bold text-sm">
      {rating > 0 ? rating.toFixed(1) : "No ratings"}
    </span>
    <span className="text-xs text-muted-foreground">
      · {count} review{count !== 1 ? "s" : ""}
    </span>
  </div>

  <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:opacity-100 transition-opacity">
    See all
    <ArrowRight className="h-3 w-3" />
  </span>
</Link>)
}
