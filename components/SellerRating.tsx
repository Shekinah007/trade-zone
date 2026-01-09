"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

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
    <div className="flex items-center space-x-2">
      <div className="flex text-yellow-500">
         <Star className={`h-4 w-4 ${rating >= 1 ? 'fill-current' : ''}`} />
         <Star className={`h-4 w-4 ${rating >= 2 ? 'fill-current' : ''}`} />
         <Star className={`h-4 w-4 ${rating >= 3 ? 'fill-current' : ''}`} />
         <Star className={`h-4 w-4 ${rating >= 4 ? 'fill-current' : ''}`} />
         <Star className={`h-4 w-4 ${rating >= 5 ? 'fill-current' : ''}`} />
      </div>
      <span className="text-sm font-medium">{rating > 0 ? rating : "No ratings"}</span>
      <span className="text-xs text-muted-foreground">({count} reviews)</span>
    </div>
  );
}
